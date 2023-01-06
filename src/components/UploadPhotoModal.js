import './UploadPhotoModal.css';
import React, { useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import AspectRatioMenu from './AspectRatioMenu';
import { useLocation } from 'react-router-dom';
import GalleryUploadMenu from './GalleryUploadMenu';
import DiscardPostModal from './DiscardPostModal';
import DiscardPhotoModal from './DiscardPhotoModal';
import UploadModalFilters from './UploadModalFilters';
import firebaseApp from '../Firebase';
import { getFirestore, updateDoc, getDoc, setDoc, doc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import spinner10s from '../images/spinner10s.gif'
import checkmarkLoopsOnce from '../images/checkmarkLoopsOnce.gif'
import { v4 as uuidv4 } from 'uuid'
import TagSearch from './TagSearch';

const storage = getStorage();
const db = getFirestore();

const UploadPhotoModal = (props) => {
  const {
    profileTagHandler,
    hashTagHandler,
    searchString,
    searchResults,
    setSearchString,
    setTagData,
    tagData,
    setSearchResults,
    userData,
    setCurrentPath,
    setPhotoUploadModalOpen,
  } = props;
  const location = useLocation();
  const [width, height] = useWindowSize();
  const [modalWidth, setModalWidth] = useState('');
  const [filesDraggedOver, setFilesDraggedOver] = useState(false);
  const [animateRatioMenu, setAnimateRatioMenu] = useState(false);
  const [animateZoomMenu, setAnimateZoomMenu] = useState(false);
  const [cropMenuOpen, setCropMenuOpen] = useState(false);
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [slideMenuOpen, setSlideMenuOpen] = useState(false);
  const [cropSelection, setCropSelection] = useState('');
  const [zoomValue, setZoomValue] = useState(0);
  const [extraFiles, setExtraFiles] = useState(0);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [fadeOutErrorModal, setFadeOutErrorModal] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [transitionPhoto, setTransitionPhoto] = useState(false);
  const [photoDimensions, setPhotoDimensions] = useState({});
  const [frameDimensions, setFrameDimensions] = useState({});
  const [discardPostModalOpen, setDiscardPostModalOpen] = useState(false);
  const [discardPhotoModalOpen, setDiscardPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [photoUploads, setPhotoUploads] = useState([]);
  const [photoUpload, setPhotoUpload] = useState([]);
  const [animateSlideMenu, setAnimateSlideMenu] = useState(false);
  const [previousLocation, setPreviousLocation] = useState({x: 0, y: 0});
  const [cursorMovement, setCursorMovement] = useState({x: 0, y: 0});
  const [currentPage, setCurrentPage] = useState('crop');
  const [isResizing, setIsResizing] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [resizedPhotos, setResizedPhotos] = useState([]);
  const [postID, setPostID] = useState('');
  const [IDArray, setIDArray] = useState([]);
  const [postURLS, setPostURLS] = useState([]);
  const uploadCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [clickLocation, setClickLocation] = useState(null);
  const [tagLocation, setTagLocation] = useState(null);
  const [tagIDs, setTagIDs] = useState([]);


  const maxHorizontalRatio = 1080/565;
  const flippedHorizontalRatio = 565/1080;
  const maxVerticalRatio = 1080/1350;
  const flippedVerticalRatio = 1350/1080;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    }
  }, []);

  const currentPageToggle = () => {
    if (currentPage === 'crop') {
      setCurrentPage('filter');
    }
    if (currentPage === 'filter') {
      setCurrentPage('text');
      saveCanvasPhotos();
    }
  }

  const loadPhotoLocation = (index) => {
    const {
      x,
      y,
    } = photoUploads[index];
    setCursorMovement({
      x: x,
      y: y,
    });
    setPreviousLocation({
      x: x,
      y: y,
    });  
  };

  const discardPhotoHandler = () => {
    const array = photoUploads;
    const index = selectedIndex;
    if (index !== -1) {
      array.splice(index, 1);
      setPhotoUploads(array);
      setAnimateSlideMenu(true);
      if (array.length === 0) {
        setPhotoUpload([]);
        setSelectedPhoto('');
        setPhotoUploads([]);
      } else if (index === array.length) {
        ratioSelectionHandler(index - 1);
        loadPhotoLocation(index - 1);
        setSelectedPhoto(array[index - 1].id);
        setSelectedIndex(index - 1);
      } else {
        ratioSelectionHandler(index);
        loadPhotoLocation(index);
        setSelectedPhoto(array[index].id);
        setSelectedIndex(index);
      }      

    };
  };

  useEffect(() => {
    console.log(selectedIndex);
    console.log(selectedPhoto);
  },[selectedIndex, selectedPhoto]);

  const discardPostHandler = () => {
    setDiscardPostModalOpen(false);
    setPhotoUploadModalOpen(false);
    setPhotoUpload([]);
    setSelectedPhoto('');
    setPhotoUploads([]);
  }

  const oneByOneRatioHandler = (index) => {
    setCropSelection('one-one');
    console.log('one-one')
    let photoIndex;
    if (index.type === 'click') {
      photoIndex = selectedIndex;
    } else {
      photoIndex = index;
    }
    console.log(photoIndex, photoUploads[photoIndex]);
    const {
      aspectRatio,
      flippedAspectRatio,
    } = photoUploads[photoIndex];
    const width = aspectRatio > 1 
      ? modalWidth * aspectRatio 
      : modalWidth;
    const height = aspectRatio > 1 
      ? modalWidth 
      : flippedAspectRatio * modalWidth;
    setPhotoDimensions({
      width: width,
      height: height,
    });
    setFrameDimensions({
      width: modalWidth,
      height: modalWidth,
    });
  }

  const originalRatioHandler = (index) => {
    setCropSelection('original');
    const {
      aspectRatio,
      flippedAspectRatio,
    } = photoUploads[0];
    let selectedRatio;
    let selectedFlippedRatio;
    if (index.type === 'click') {
      selectedRatio = photoUploads[selectedIndex].aspectRatio;
      selectedFlippedRatio = photoUploads[selectedIndex].flippedAspectRatio;
    } else {
      selectedRatio = photoUploads[index].aspectRatio;
      selectedFlippedRatio = photoUploads[index].flippedAspectRatio;
    }
    let frameHeight;
    let frameWidth;
    let photoWidth;
    let photoHeight
    if (aspectRatio > 1) {
      if (aspectRatio > maxHorizontalRatio) {
        frameHeight = flippedHorizontalRatio * modalWidth;
        frameWidth = frameHeight * aspectRatio;
      } else {
        frameHeight = flippedAspectRatio * modalWidth
        frameWidth = frameHeight * aspectRatio        
      }
    } else if (aspectRatio < 1) {
      if (aspectRatio < maxVerticalRatio) {
        frameWidth = modalWidth * maxVerticalRatio;
        frameHeight = flippedAspectRatio * frameWidth;
      } else {
        frameWidth = modalWidth * aspectRatio;
        frameHeight = flippedAspectRatio * frameWidth;
      };
    };
    if (selectedRatio > 1) {
      if (aspectRatio > 1) {
        if (selectedRatio < aspectRatio) {
          photoHeight = selectedFlippedRatio * modalWidth
          photoWidth = photoHeight * selectedRatio  
        } else {
          photoHeight = flippedAspectRatio * modalWidth;
          photoWidth = photoHeight * selectedRatio;          
        }
      } else if (aspectRatio < 1) {
        photoHeight = modalWidth
        photoWidth = photoHeight * selectedRatio        
      }
    } else if (selectedRatio < 1) {
      if (aspectRatio > 1) {
        photoWidth = modalWidth;
        photoHeight = selectedFlippedRatio * photoWidth;
      } else if (aspectRatio < 1) {
        if (aspectRatio < maxVerticalRatio) {
          photoWidth = modalWidth * maxVerticalRatio;
          photoHeight = selectedFlippedRatio * photoWidth;
        } else {
          photoWidth = modalWidth * aspectRatio;
          photoHeight = selectedFlippedRatio * photoWidth;
        };
      };
    };
    setPhotoDimensions({
      width: photoWidth,
      height: photoHeight,
    });
    setFrameDimensions({
      width: frameWidth < modalWidth ? frameWidth : modalWidth,
      height: frameHeight < modalWidth ? frameHeight : modalWidth,
    });
  };

  const fourByFiveHandler = (index) => {
    setCropSelection('four-five');
    let photoIndex;
    if (index.type === 'click') {
      photoIndex = selectedIndex;
    } else {
      photoIndex = index;
    }
    const {
      aspectRatio,
      flippedAspectRatio,
    } = photoUploads[photoIndex];
    let photoWidth;
    let photoHeight;
    if (aspectRatio > 1) {
      photoWidth = modalWidth * aspectRatio;
      photoHeight = modalWidth;
    } else if (aspectRatio < 1) {
      if (aspectRatio < maxVerticalRatio) {
        photoWidth = modalWidth * maxVerticalRatio;
        photoHeight = flippedAspectRatio * photoWidth;
      } else {
        photoWidth = modalWidth * aspectRatio;
        photoHeight = flippedAspectRatio * photoWidth;
      };
    }
    setPhotoDimensions({
      width: photoWidth,
      height: photoHeight,
    });
    setFrameDimensions({
      width: modalWidth * maxVerticalRatio,
      height: modalWidth,
    });
  };

  const sixteenByNineHandler = (index) => {
    setCropSelection('sixteen-nine');
    let photoIndex;
    if (index.type === 'click') {
      photoIndex = selectedIndex;
    } else {
      photoIndex = index;
    }
    const {
      aspectRatio,
      flippedAspectRatio,
    } = photoUploads[photoIndex];
    const maxAspectRatio = 16/9;
    const flippedmaxRatio = 9/16;
    let photoHeight;
    let photoWidth;
    if (aspectRatio > 1) {
      if (aspectRatio > maxAspectRatio) {
        photoHeight = flippedmaxRatio * modalWidth;
        photoWidth = photoHeight * aspectRatio;
      } else {
        photoHeight = flippedAspectRatio * modalWidth;
        photoWidth = photoHeight * aspectRatio;
      };
    } else if (aspectRatio < 1) {
      photoWidth = modalWidth;
      photoHeight = modalWidth * flippedAspectRatio;
    };
    setPhotoDimensions({
      width: photoWidth,
      height: photoHeight,
    });
    setFrameDimensions({
      width: modalWidth,
      height: modalWidth * flippedmaxRatio,
    });
  };

  useEffect(() => {
    if (cropSelection === '' && photoUploads.length !== 0) {
      ratioSelectionHandler(0);
    }
  }, [photoUploads]);

  useEffect(() => {
    if (photoUploads.length !== 0) {
      readjustLocationHandler();
    }
  }, [selectedIndex, cropSelection]);

  const readjustLocationHandler = () => {
    const {
      aspectRatio,
      flippedAspectRatio,
      x,
      y,
    } = photoUploads[selectedIndex];
    let newLocation = {
      x: x,
      y: y,          
    }; 
    const imageOverflowX = ((photoDimensions.width * ((zoomValue/100) + 1)) - frameDimensions.width) / 2;
    const imageOverflowY = ((photoDimensions.height * ((zoomValue/100) + 1)) - frameDimensions.height) / 2;
    const xOverflowPercent = (imageOverflowX / photoDimensions.width) * 100;
    const yOverflowPercent = (imageOverflowY / photoDimensions.height) * 100;
    console.log(xOverflowPercent,yOverflowPercent);
    console.log("image overflow:", imageOverflowY);
    if (x > xOverflowPercent) {
      console.log('helloX');
      newLocation = {
        x: xOverflowPercent,
        y: newLocation.y,          
      };
    } 
    if (x < xOverflowPercent * -1) {
      newLocation = {
        x: xOverflowPercent * -1,
        y: newLocation.y,          
      };
    } 
    if (y > yOverflowPercent){
      console.log('hello!Y');
      newLocation = {
        x: newLocation.x,
        y: yOverflowPercent,
      };      
    } 
    if (y < yOverflowPercent * -1) {
      newLocation = {
        x: newLocation.x,
        y: yOverflowPercent * -1,
      };      
    };
    setCursorMovement(newLocation);
    setPreviousLocation(newLocation);
  };

  const imageLocationHandler = () => {
    const {
      aspectRatio,
      flippedAspectRatio,
    } = photoUploads[selectedIndex];
    let newLocation = {
      x: cursorMovement.x,
      y: cursorMovement.y,          
    }; 
    const imageOverflowX = ((photoDimensions.width * ((zoomValue/100) + 1)) - frameDimensions.width) / 2;
    const imageOverflowY = ((photoDimensions.height * ((zoomValue/100) + 1)) - frameDimensions.height) / 2;
    const xOverflowPercent = (imageOverflowX / photoDimensions.width) * 100;
    const yOverflowPercent = (imageOverflowY / photoDimensions.height) * 100;
    if (cursorMovement.x > xOverflowPercent ) {
      newLocation = {
        x: xOverflowPercent,
        y: newLocation.y,          
      };
    } 
    if (cursorMovement.x < xOverflowPercent * -1) {
      newLocation = {
        x: xOverflowPercent * -1,
        y: newLocation.y,          
      };
    } 
    if (cursorMovement.y > yOverflowPercent){
      newLocation = {
        x: newLocation.x,
        y: yOverflowPercent,
      };      
    } 
    if (cursorMovement.y < yOverflowPercent * -1) {
      newLocation = {
        x: newLocation.x,
        y: yOverflowPercent * -1,
      };      
    };
    setCursorMovement(newLocation);
    setPreviousLocation(newLocation);
  };

  useEffect(() => {
    console.log(photoUploads);
  }, [photoUploads]);

  const savePhotoLocation = () => {
    const newArray = photoUploads;
    const newObject = {
      ...photoUploads[selectedIndex],
      x: previousLocation.x,
      y: previousLocation.y,
    }
    newArray.splice(selectedIndex, 1, newObject);
    setPhotoUploads(newArray);  
  }

  const saveZoom = () => {
    const newArray = [...photoUploads];
    const newObject = {
      ...photoUploads[selectedIndex],
      zoom: zoomValue,
    };
    newArray.splice(selectedIndex, 1, newObject);
    setPhotoUploads(newArray);
  }

  useEffect(() => {
    if (photoUploads.length !== 0) {
      saveZoom();
    };
  }, [zoomValue]);

  useEffect(() => {
    if (photoUploads.length !== 0) {
      savePhotoLocation();
    };
    console.log(previousLocation);
  }, [previousLocation]);

  useEffect(() => {
    console.log(photoUploads[selectedIndex]);
  }, [photoUploads]);

  const loadZoom = (index) => {
    const { zoom } = photoUploads[index];
    setZoomValue(zoom);
  }

  const mouseDownHandler = (event) => {
    closeAllMenus();
    const {
      clientX, 
      clientY
    } = event;
    console.log("yStart:", event.clientY, "xStart:", event.clientX)
    setStartLocation({
      x: clientX,
      y: clientY
    });
  }

  const cursorMoveHandler = (event) => {
    const {
      clientX, 
      clientY
    } = event;
    let xMovement = (clientX - startLocation.x);
    let yMovement = (clientY - startLocation.y);
    const xPercent = ((xMovement / photoDimensions.width) * 100) + previousLocation.x;
    const yPercent = ((yMovement / photoDimensions.height) * 100) + previousLocation.y; 
    setCursorMovement({
        x: xPercent,
        y: yPercent,
    });
  };

  const photoTransitionHandler = () => {
    if (transitionPhoto) {
      setTransitionPhoto(false);
    }
  }

  const mouseUpHandler = (event) => {
    setTransitionPhoto(true);
    event.stopPropagation();
    setStartLocation('');
    imageLocationHandler();
  };

  const closeAllMenus = () => {
    if (zoomMenuOpen) {
      setAnimateZoomMenu(true);
    }
    if (slideMenuOpen) {
      setAnimateSlideMenu(true);
    }
    if (cropMenuOpen) {
      setAnimateRatioMenu(true);
    }    
  }

  const leftPhotoButton = () => {
    const nextIndex = selectedIndex - 1;
    const nextPhoto = photoUploads[nextIndex].id;
    ratioSelectionHandler(nextIndex);
    loadPhotoLocation(nextIndex);
    loadZoom(nextIndex)
    setSelectedPhoto(nextPhoto);
    setSelectedIndex(nextIndex);
    closeAllMenus();
  }

  const rightPhotoButton = () => {
    const nextIndex = selectedIndex + 1;
    const nextPhoto = photoUploads[nextIndex].id;
    console.log("photoUploads:", photoUploads, 'nextPhoto:', nextPhoto, "selectedIndex:", selectedIndex);
    ratioSelectionHandler(nextIndex);
    loadPhotoLocation(nextIndex);
    loadZoom(nextIndex);
    setSelectedPhoto(nextPhoto);
    setSelectedIndex(nextIndex)
    closeAllMenus();
  }

  const toggleRatioMenu = () => {
    if (!cropMenuOpen) {
      setCropMenuOpen(true);
      if (zoomMenuOpen) {
        setAnimateZoomMenu(true);
      }
      if (slideMenuOpen) {
        setAnimateSlideMenu(true);
      }
    } else{
      setAnimateRatioMenu(true);
    };
  };

  const toggleZoomMenu = () => {
    if (!zoomMenuOpen) {
      setZoomMenuOpen(true);
      if (cropMenuOpen) {
        setAnimateRatioMenu(true);
      }
      if (slideMenuOpen) {
        setAnimateSlideMenu(true);
      }
    } else {
      setAnimateZoomMenu(true);
    }
  };

  const toggleSlideMenu = () => {
    if (!slideMenuOpen) {
      setSlideMenuOpen(true);
      if (cropMenuOpen) {
        setAnimateRatioMenu(true);
      }
      if (zoomMenuOpen) {
        setAnimateZoomMenu(true);
      }
    } else {
      setAnimateSlideMenu(true);
    }
  };

  const hideSlideMenu = () => {
    if (animateSlideMenu) {
      setSlideMenuOpen(false);
      setAnimateSlideMenu(false);
    }
  }

  const hideCropMenu = () => {
    if (animateRatioMenu) {
      setCropMenuOpen(false);
      setAnimateRatioMenu(false);
    }
  }

  const hideZoomMenu = () => {
    if (animateZoomMenu) {
      setZoomMenuOpen(false);
      setAnimateZoomMenu(false);
    }
  }

  const selectPhotoHandler = (event) => {
    const { id } = event.target
    const index = photoUploads.findIndex((photo) => photo.id === id);
    ratioSelectionHandler(index);
    loadZoom(index);
    loadPhotoLocation(index);
    setSelectedPhoto(id);
    setSelectedIndex(index);
  }

  const ratioSelectionHandler = (index) => {
    switch (true) {
      case cropSelection === '':
        oneByOneRatioHandler(index);
        break;
      case cropSelection === 'original':
        originalRatioHandler(index);
        break;
      case cropSelection === 'one-one':
        oneByOneRatioHandler(index);
        break;
      case cropSelection === 'four-five':
        fourByFiveHandler(index);
        break;
      case cropSelection === 'sixteen-nine':
        sixteenByNineHandler(index);
        break;
      default:
    };
  };

  useEffect(() => {
    console.log('crop:', cropSelection);
  }, [cropSelection]);

  const modalWidthHandler = () => {
    const newWidth = width - 372;
    if (newWidth > 855) {
      setModalWidth(855);
    } else
    setModalWidth(newWidth);
  }

  useEffect(() => {
    modalWidthHandler();
    if (selectedPhoto !== '') {
      ratioSelectionHandler(selectedIndex);
    }
  }, [width]);

  const getAspectRatios = async () => {
    let photoArray = [...photoUploads]
    Promise.all(Array.from(
      {length: photoUpload.length},
      (_, i) => {
        const url = photoUpload[i];
        let image = new Image();
        image.src = url;
        return new Promise((resolve) => {
          image.onload = () => {
          const { width, height } = image;
          const aspectRatio = width/height;
          const flippedAspectRatio = height/width;
          resolve({
            id: uuidv4(),
            url: url,
            aspectRatio: aspectRatio,
            flippedAspectRatio: flippedAspectRatio,
            x: 0,
            y: 0,
            zoom: 0,
            filter: 'normal',
            tags: []
          });
          };
        });
      }
    ))
    .then((images) => {
      images.forEach((image) => {
        photoArray.push(image);
      });
      setPhotoUploads(photoArray);
      setPhotoUpload([])
      if (selectedPhoto === '') {
        setSelectedPhoto(photoArray[0].id);
        setSelectedIndex(0);
      }
    });
  };

  useEffect(() => {
    if (photoUpload.length > 0) {
      getAspectRatios();
    }
  }, [photoUpload]);

  useEffect(() => {
    console.log(photoUploads, 'length:', photoUploads.length);
  }, [photoUploads]);

  const closeUploadModal = () => {
    console.log("start:", startLocation);
    if (startLocation === '') {
      if (selectedPhoto !== '') {
        setDiscardPostModalOpen(true);
      } else {
        setPhotoUploadModalOpen(false);
      }      
    }
  };

  const stopBubbles = (event) => {
    event.stopPropagation();
  };

  const dropHandler = (event) => {
    event.preventDefault();
    const { items } = event.dataTransfer;
    let photoArray = [];
    if (photoUploads.length === 0) {
      for (let i = 0; i < items.length; i++) {
        const url = URL.createObjectURL(items[i].getAsFile());
        photoArray.push(url);
      }
      setPhotoUpload(photoArray);
      setFilesDraggedOver(false);      
    }
  };

  const buttonFileHandler = (event) => {
    const { files } = event.target;
    const space = 10 - photoUploads.length
    const extraFiles = files.length - space;
    console.log('extra files:', extraFiles, 'space:', space, 'files:', files)
    let photoArray = [];
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      photoArray.push(url);
    }
    if (extraFiles > 0) {
      setExtraFiles(extraFiles);
      setErrorModalOpen(true);
      const newPhotoArray = photoArray.splice(0, space);
      setPhotoUpload(newPhotoArray);
      console.log('new array:', newPhotoArray);
    } else {
      setPhotoUpload(photoArray);
      console.log('array:', photoArray);
    }
    console.log('files:', files);
    console.log('input value:', event.target.value);
    event.target.value = null;
  };

  const dragOverHandler = (event) => {
    event.preventDefault();
  };

  const fileDragEnter = () => {
    setFilesDraggedOver(true);
  };

  const fileDragLeave = () => {
    setFilesDraggedOver(false);
  };

  const removeExtraFiles = () => {
    if (fadeOutErrorModal) {
      setErrorModalOpen(false);
      setFadeOutErrorModal(false);
    }
  };

  useEffect(() => {
    if (errorModalOpen) {
      console.log('timerSET');
      setTimeout(() => {
        console.log('timeOUT')
        setFadeOutErrorModal(true);
      }, 3000);      
    }
  },[errorModalOpen]);

  useEffect(() => () => {
      setCurrentPath(location.pathname);
  }, []);

  const uploadPhotos = async (photo, index, arrayID, postID) => {
    console.log(photo);
    const {
      photoID,
      aspectRatio,
      tags,
      w1080,
      w750,
      w640,
      w480,
      w320,
      w240,
      w150,
    } = photo;
    const {
      fullname,
      username,
      photoURL,
      uid
    } = userData;
    let croppedAspectRatio;
    if (cropSelection === 'one-one') {
      croppedAspectRatio = 1;
    }
    if (cropSelection === 'original') {
      croppedAspectRatio = aspectRatio;
      if (croppedAspectRatio < 4/5) {
        croppedAspectRatio = 4/5
      }
      if (croppedAspectRatio > 1080/565) {
        croppedAspectRatio = 1080/565
      } 
    }
    if (cropSelection === 'four-five') {
      croppedAspectRatio = 4/5;
    } 
    if (cropSelection === 'sixteen-nine') {
      croppedAspectRatio = 16/9;
    }
    const w1080Ref = ref(storage, `w1080_photoUploads/${photoID}.jpg`);
    const w750Ref = ref(storage, `w750_photoUploads/${photoID}.jpg`);
    const w640Ref = ref(storage, `w640_photoUploads/${photoID}.jpg`);
    const w480Ref = ref(storage, `w480_photoUploads/${photoID}.jpg`);
    const w320Ref = ref(storage, `w320_photoUploads/${photoID}.jpg`);
    const w240Ref = ref(storage, `w240_photoUploads/${photoID}.jpg`);
    const w150Ref = ref(storage, `w150_photoUploads/${photoID}.jpg`);
    const w1080Upload = await uploadBytes(w1080Ref, w1080);
    const w1080URL = await getDownloadURL(
      ref(storage, w1080Upload.metadata.fullPath)
    );
    const w750Upload = await uploadBytes(w750Ref, w750);
    const w750URL = await getDownloadURL(
      ref(storage, w750Upload.metadata.fullPath)
    );
    const w640Upload = await uploadBytes(w640Ref, w640);
    const w640URL = await getDownloadURL(
      ref(storage, w640Upload.metadata.fullPath)
    );
    const w480Upload = await uploadBytes(w480Ref, w480);
    const w480URL = await getDownloadURL(
      ref(storage, w480Upload.metadata.fullPath)
    );
    const w320Upload = await uploadBytes(w320Ref, w320);
    const w320URL = await getDownloadURL(
      ref(storage, w320Upload.metadata.fullPath)
    );
    const w240Upload = await uploadBytes(w240Ref, w240);
    const w240URL = await getDownloadURL(
      ref(storage, w240Upload.metadata.fullPath)
    );
    const w150Upload = await uploadBytes(w150Ref, w150);
    const w150URL = await getDownloadURL(
      ref(storage, w150Upload.metadata.fullPath)
    );
    const photoURLS = {
      photoID: photoID,
      aspectRatio: croppedAspectRatio,
      postID: postID,
      index: index,
      tags: tags,
      w1080: w1080URL,
      w750: w750URL,
      w640: w640URL,
      w480: w480URL,
      w320: w320URL,
      w240: w240URL,
      w150: w150URL,
      uploadDate: Date.now(),
    }


    // hash tags //
    const hashTags = hashTagHandler(captionText);
    console.log(hashTags);
    for (let index = 0; index < hashTags.length; index++) {
      await setDoc(doc(db, hashTags[index], postID), {
        postID,
        date: Date.now(),
      });
      const documentReference = (doc(db, 'hashTags', hashTags[index]))
      const documentSnapshot = await getDoc(documentReference);
      if (documentSnapshot.exists()) {
        await updateDoc(documentReference, {
          posts: arrayUnion(postID)
        });
      } else {
        await setDoc(documentReference, {
          posts: [postID]
        });        
      };
    };

    // 'textTags' referes to profile tags in post caption, 'profileTagHandler' gets UIDs from usernames //
    const textTags = await profileTagHandler(captionText);
    for (let index = 0; index < textTags.length; index++) {
      if (textTags[index] !== uid) {
        const notificationID = uuidv4();
        await setDoc(doc(db, 'notifications', notificationID), {
          notificationID,
          recipientUID: textTags[index],
          notRead: true,
          postID,
          postPhotoURL: w150URL,
          profile: {
            fullname,
            username,
            photoURL,
            uid,
          },
          type: 'mention',
          source: 'post',
          date: Date.now()
        });        
      };
    };
    console.log(textTags);

    // photo tags //
    for (let index = 0; index < tagIDs.length; index++) {
      if (tagIDs[index] !== uid) {
        const notificationID = uuidv4();
        await setDoc(doc(db, 'notifications', notificationID), {
          notificationID,
          recipientUID: tagIDs[index],
          notRead: true,
          postID,
          postPhotoURL: w150URL,
          profile: {
            fullname,
            username,
            photoURL,
            uid,
          },
          type: 'photo-tag',
          source: 'post',
          date: Date.now()
        });        
      };
    };


    await setDoc(doc(db, 'photoUploads', photoID), photoURLS);
    await setDoc(doc(db, 'postUploads', postID), {
      postID: postID,
      photos: arrayID,
      postCaption: captionText,
      comments: [],
      likes: [],
      saved: [],
      tags: tagIDs,
      uid: userData.uid,
      username: userData.displayName,
      photoURL: userData.photoURL,
      uploadDate: Date.now(),
    });
    console.log('photo uploaded', w1080URL);
    setCurrentPage('shared');
  }

  const saveCanvasPhotos = async () => {
    setIsResizing(true)
    const postID = uuidv4();
    const IDs = [];
    const photoArray = [];
    Promise.all(Array.from(
      {length: photoUploads.length},
      (_, i) => {
        const index = i;
        const { 
          url,
        } = photoUploads[i];
        const image = new Image();
        image.src = url;
        return new Promise((resolve) => {
          const photoID = uuidv4()
          let w1080;
          let w750;
          let w640;
          let w480;
          let w320;
          let w240;
          let w150;
          image.onload = () => {
            canvasCrop(image, index, 1080, 'hide')
              .then((element) => {
                w1080 = element;
                canvasCrop(image, index, 750, 'hide')
                  .then((element) => {
                    w750 = element;
                    canvasCrop(image, index, 640, 'hide')
                      .then((element) => {
                        w640 = element;
                        canvasCrop(image, index, 480, 'hide')
                          .then((element) => {
                            w480 = element;
                            canvasCrop(image, index, 320, 'hide')
                              .then((element) => {
                                w320 = element;
                                canvasCrop(image, index, 240, 'hide')
                                  .then((element) => {
                                    w240 = element;
                                    canvasCrop(image, index, 150, 'hide')
                                      .then((element) => {
                                        w150 = element;
                                        IDs.push(photoID);
                                        resolve({
                                          ...photoUploads[i],
                                          photoID: photoID,
                                          w1080: w1080,
                                          w750: w750,
                                          w640: w640,
                                          w480: w480,
                                          w320: w320,
                                          w240: w240,
                                          w150: w150,
                                        })
                                      })
                                  })
                              })
                          })
                      })
                  })
              })
          };
        });
      }
    ))
    .then((images) => {
      setIsResizing(false);
      images.forEach((image) => {
        photoArray.push(image);
      })
      setPhotoUploads(photoArray);
      console.log(photoArray)
      setPostID(postID);
      setIDArray(IDs);
    });
  };

  const sharePost = () => {
    setSelectedPhoto('');
    setCurrentPage('sharing');
    photoUploads.map( async (image, index) => await uploadPhotos(image, index, IDArray, postID));
  }

  const canvasCrop = (image, index, width, result) => {
    return new Promise((resolve) => {
      let canvas;
      if (result === 'display') {
        canvas = canvasRef.current;
      } else if (result === 'hide') {
        canvas = uploadCanvasRef.current;
      }; 
      const ctx = canvas.getContext('2d');
      let canvasAspectRatio = photoUploads[0].aspectRatio;
      if (canvasAspectRatio < 4/5) {
        canvasAspectRatio = 4/5
      }
      if (canvasAspectRatio > 1080/565) {
        canvasAspectRatio = 1080/565
      } 
      const sixteenByNine = 16/9;

      if (cropSelection === 'one-one') {
        canvas.width = width;
        canvas.height = width;
      }
      if (cropSelection === 'original') {
        if (canvasAspectRatio > 1) {
          canvas.width = width;
          canvas.height = canvas.width / canvasAspectRatio
         
        } else if (canvasAspectRatio < 1) {
          canvas.width = width;
          canvas.height = canvas.width / canvasAspectRatio
          
        };
        console.log('canvas height:', canvas.height)
      };
      if (cropSelection === 'four-five') {
        canvas.width = width;
        canvas.height = canvas.width / (4/5);
      }
      if (cropSelection === 'sixteen-nine') {
        canvas.width = width;
        canvas.height = width / sixteenByNine;
      }
      const ratio = image.width / image.height;
      const {
        filter, 
        zoom,
        x,
        y, 
      } = photoUploads[index];
      let newWidth;
      let newHeight;
      console.log('ratio',ratio)
      if (ratio < 1) {
        newHeight = (canvas.width / ratio) * (1 + (zoom / 100));
        console.log("newHeight", newHeight)
        newWidth = (canvas.width) * (1 + (zoom / 100));
        if (cropSelection === 'sixteen-nine') {
          newHeight = canvas.width / ratio * (1 + (zoom / 100));
        }
      }
      if (ratio > 1) {
        newHeight = (canvas.width / ratio) * (1 + (zoom / 100));
        newWidth = canvas.width * (1 + (zoom / 100));
        if ((canvas.width / canvas.height) <= 1) {
          newHeight = canvas.height * (1 + (zoom / 100));
          newWidth = (canvas.height * ratio) * (1 + (zoom / 100));
        }
      }
      const yPixels = newHeight * ((y / (1 + (zoom / 100))) / 100);
      const xPixels = newWidth * ((x / (1 + (zoom / 100))) / 100);
      let xCenter = canvas.width / 2 - newWidth / 2;
      let yCenter = canvas.height / 2 - newHeight / 2;

      let xOffset = xCenter + xPixels;
      let yOffset = yCenter + yPixels;

      switch (true) {
        case filter === 'moon':
          ctx.filter = 'grayscale(100%) brightness(125%)';
          break;
        case filter === 'clarendon':
          ctx.filter = 'saturate(130%) brightness(115%) contrast(120%) hue-rotate(5deg)';
          break;
        case filter === 'gingham':
          ctx.filter = 'contrast(75%) saturate(90%) brightness(115%)'
          break;
        case filter === 'lark':
          ctx.filter = 'saturate(115%) brightness(110%) hue-rotate(5deg)';
          break;
        case filter === 'reyes':
          ctx.filter = 'contrast(50%) saturate(75%) brightness(125%) hue-rotate(355deg)';
          break;
        case filter === 'juno':
          ctx.filter = 'contrast(90%) hue-rotate(10deg) brightness(110%)';
          break;
        case filter === 'slumber':
          ctx.filter = 'brightness(80%) hue-rotate(350deg) saturate(125%)';
          break;
        case filter === 'crema':
          ctx.filter = 'brightness(85%) hue-rotate(5deg) saturate(90%)';
          break;
        case filter === 'ludwig':
          ctx.filter = 'hue-rotate(355deg) saturate(125%)';
          break;
        case filter === 'aden':
          ctx.filter = 'sepia(50%) saturate(150%)';
          break;
        case filter === 'perpetua':
          ctx.filter = 'brightness(80%) saturate(130%)';
          break;
        default: 
      }
      
      ctx.drawImage(image, xOffset, yOffset, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        const image = new Image();
        image.src = blob;
        resolve(blob);
      });     
    })

  };

  return (
    <React.Fragment>
      {isSearchOpen &&
        <section 
          className='modal-upload-tag-search'
          style={{
            left: `${clickLocation.left}px`,
            top: `${clickLocation.top}px`
          }}
          onClick={(event) => event.stopPropagation()}  
        >
          <div className='tag-search-modal-tab'>
          </div>
          <TagSearch
            setTagIDs={setTagIDs}
            tagIDs={tagIDs}
            setPhotoUploads={setPhotoUploads}
            photoUploads={photoUploads}
            selectedIndex={selectedIndex}
            clickLocation={clickLocation}
            isModal={true}
            setSearchResults={setSearchResults}
            tagData={tagData}
            tagLocation={tagLocation}
            setIsSearchOpen={setIsSearchOpen}
            setTagData={setTagData} 
            searchString={searchString}
            setSearchString={setSearchString}
            searchResults={searchResults}
          />
        </section>        
      }
      {discardPhotoModalOpen &&
        <DiscardPhotoModal 
          setDiscardPhotoModalOpen={setDiscardPhotoModalOpen}
          discardPhotoHandler={discardPhotoHandler}
        />
      }
      {discardPostModalOpen &&
        <DiscardPostModal
          discardPostHandler={discardPostHandler} 
          setDiscardPostModalOpen={setDiscardPostModalOpen} 
          setPhotoUploadModalOpen={setPhotoUploadModalOpen}           
        />
      }
      {isResizing &&
        <canvas className='upload-canvas' ref={uploadCanvasRef}>
        </canvas>
      }
      {startLocation !== '' &&
        <div 
          className='mouse-move-modal'
          onPointerMove={cursorMoveHandler} 
          onMouseUp={mouseUpHandler}       
        ></div>      
      }
      <div 
        className='upload-photo-modal' 
        onDragEnter={fileDragEnter} 
        onDragLeave={fileDragLeave} 
        onMouseDown={closeUploadModal} 
        onDrop={dropHandler} 
        onDragOver={dragOverHandler}
      >
        <button 
          className={
            filesDraggedOver 
              ? ['close-upload-modal-button', 'events-off'].join(' ') 
              : 'close-upload-modal-button'
          }
        >
          <svg aria-label="Close" className="close-upload-modal-svg" color="#ffffff" fill="#ffffff" height="24" role="img" viewBox="0 0 24 24" width="24">
            <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
          </svg>
        </button>
        <div className={filesDraggedOver ? ['upload-photo-content', 'events-off'].join(' ') : 'upload-photo-content'} onMouseDown={stopBubbles}>
          <div className='upload-photo-height-wrapper'>
            <div className={
              currentPage === 'crop' || currentPage === 'sharing' || currentPage === 'shared'
                ? 'upload-photo-content-wrapper'
                : ['upload-photo-content-wrapper', 'side-menu'].join(' ')
              }
            >
              <div className={'upload-photo-inner-content-wrapper'}>
                <div className='upload-photo-header-wrapper'>
                  <div className='upload-photo-back-wrapper'>
                    {selectedPhoto !== '' &&
                      <button className='upload-photo-back-button'>
                        <svg aria-label="Back" className="upload-back-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                          <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line>
                          <polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
                        </svg>
                      </button>
                    }
                  </div>
                  <h1 className='upload-photo-title'>
                    {selectedPhoto !== '' && currentPage === 'crop' &&
                      'Crop'
                    }
                    {(photoUploads.length === 0 || currentPage === 'text') &&
                      'Create new post'
                    }
                    {currentPage === 'filter' &&
                      'Edit'
                    }
                    {currentPage === 'sharing' &&
                      'Sharing'
                    }
                    {currentPage === 'shared' &&
                      'Post shared'
                    }
                    
                  </h1>
                  <div className='upload-photo-forwards-wrapper'>
                    {selectedPhoto !== '' && !isResizing &&
                      <button 
                        className='upload-photo-forwards-button' 
                        onClick={currentPage === 'text' ? sharePost : currentPageToggle}
                      >
                        {currentPage === 'text' ? 'Share' : 'Next'}
                      </button>
                    }
                  <svg aria-label="Loading..." className={isResizing ? 'spinner resize' : 'spinner resize hidden'} viewBox="0 0 100 100">
                    <rect fill="#555555" height="6" opacity="0" rx="3" ry="3" transform="rotate(-90 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.08333333333333333" rx="3" ry="3" transform="rotate(-60 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.16666666666666666" rx="3" ry="3" transform="rotate(-30 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.25" rx="3" ry="3" transform="rotate(0 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.3333333333333333" rx="3" ry="3" transform="rotate(30 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.4166666666666667" rx="3" ry="3" transform="rotate(60 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.5" rx="3" ry="3" transform="rotate(90 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.5833333333333334" rx="3" ry="3" transform="rotate(120 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.6666666666666666" rx="3" ry="3" transform="rotate(150 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.75" rx="3" ry="3" transform="rotate(180 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.8333333333333334" rx="3" ry="3" transform="rotate(210 50 50)" width="25" x="72" y="47">
                    </rect>
                    <rect fill="#555555" height="6" opacity="0.9166666666666666" rx="3" ry="3" transform="rotate(240 50 50)" width="25" x="72" y="47">
                    </rect>
                  </svg>   
                  </div>
                </div>
                <div className='editing-content'>
                  <div className='photo-editing-wrapper'>
                    {(selectedPhoto !== '' && (currentPage === 'filter' || currentPage === 'text')) &&
                      <UploadModalFilters
                        setTagIDs={setTagIDs}
                        tagIDs={tagIDs}
                        clickLocation={clickLocation}
                        isSearchOpen={isSearchOpen}
                        setTagLocation={setTagLocation}
                        setIsSearchOpen={setIsSearchOpen}
                        setClickLocation={setClickLocation}
                        setSearchResults={setSearchResults}
                        tagData={tagData}
                        setTagData={setTagData}
                        searchString={searchString}
                        setSearchString={setSearchString}
                        searchResults={searchResults}
                        captionText={captionText}
                        setCaptionText={setCaptionText}
                        canvasRef={canvasRef}
                        canvasCrop={canvasCrop}
                        userData={userData}
                        currentPage={currentPage}
                        setPhotoUploads={setPhotoUploads}
                        setSelectedIndex={setSelectedIndex}
                        setSelectedPhoto={setSelectedPhoto}
                        photoUploads={photoUploads}
                        selectedIndex={selectedIndex}
                        selectedPhoto={selectedPhoto}
                        frameDimensions={frameDimensions}
                     />
                    }
                    {(selectedPhoto !== '' && currentPage === 'crop') &&
                      <div className='upload-photo-edit-buttons-wrapper'>
                        {errorModalOpen && 
                          <div className='upload-max-error-modal'>
                            <div 
                              className={
                                fadeOutErrorModal 
                                  ? ['upload-max-content', 'fade-out'].join(' ') 
                                  : 'upload-max-content'
                              } 
                              onAnimationEnd={removeExtraFiles}
                            >
                              {extraFiles === 1 
                                ? `The last file was not uploaded. You can only choose 10 or fewer files.` 
                                : `The last ${extraFiles} files were not uploaded. You can only choose 10 or fewer files.`}
                            </div>
                          </div>                      
                        }
                        <AspectRatioMenu
                          sixteenByNineHandler={sixteenByNineHandler}
                          fourByFiveHandler={fourByFiveHandler}
                          oneByOneRatioHandler={oneByOneRatioHandler}
                          originalRatioHandler={originalRatioHandler}
                          slideMenuOpen={slideMenuOpen}
                          cropMenuOpen={cropMenuOpen}
                          zoomMenuOpen={zoomMenuOpen}
                          toggleRatioMenu={toggleRatioMenu}
                          toggleZoomMenu={toggleZoomMenu}
                          hideCropMenu={hideCropMenu}
                          hideZoomMenu={hideZoomMenu}
                          animateRatioMenu={animateRatioMenu}
                          animateZoomMenu={animateZoomMenu}
                          zoomValue={zoomValue}
                          setZoomValue={setZoomValue}
                          cropSelection={cropSelection}
                        />
                        <GalleryUploadMenu
                          closeAllMenus={closeAllMenus}
                          ratioSelectionHandler={ratioSelectionHandler}
                          selectedIndex={selectedIndex}
                          setSelectedIndex={setSelectedIndex}
                          loadPhotoLocation={loadPhotoLocation}
                          animateSlideMenu={animateSlideMenu}
                          hideSlideMenu={hideSlideMenu}
                          slideMenuOpen={slideMenuOpen}
                          zoomMenuOpen={zoomMenuOpen}
                          cropMenuOpen={cropMenuOpen}
                          toggleSlideMenu={toggleSlideMenu}
                          width={width}
                          setDiscardPhotoModalOpen={setDiscardPhotoModalOpen}
                          selectPhotoHandler={selectPhotoHandler}
                          buttonFileHandler={buttonFileHandler}
                          selectedPhoto={selectedPhoto}
                          setSelectedPhoto={setSelectedPhoto} 
                          photoUploads={photoUploads}
                          setPhotoUploads={setPhotoUploads}
                          modalWidth={modalWidth}
                        />
                        <div 
                          className='upload-photo-overflow-frame' 
                          onPointerDown={mouseDownHandler}
                          style={{
                            width: `${frameDimensions.width}px`,
                            height: `${frameDimensions.height}px`,
                          }}
                        >
                          {photoUploads.map((photo) => {
                            const {
                              id,
                              url,
                              aspectRatio,
                              flippedAspectRatio,
                            } = photo;
                            if (id === selectedPhoto) {
                              return (
                                <div
                                  onTransitionEnd={photoTransitionHandler}
                                  key={id} 
                                  className={
                                    transitionPhoto 
                                      ? ['uploaded-photo-background', 'transition'].join(' ') 
                                      : 'uploaded-photo-background'
                                  } 
                                  style={{
                                    backgroundImage: `url(${url})`,
                                    width: `${photoDimensions.width}px`,
                                    height: `${photoDimensions.height}px`,
                                    transform: `translate3d(${cursorMovement.x}%, ${cursorMovement.y}%, 0px) scale(${1 + (zoomValue/100)})`,
                        
                                  }}
                                ></div>                               
                              )
                            } else {
                              return ''
                            }
                          })}
                          {startLocation !== '' &&
                            <div className='upload-photo-grid-wrapper'>
                              <div className='grid-line vertical-left'></div>
                              <div className='grid-line vertical-right'></div>
                              <div className='grid-line horizontal-top'></div>
                              <div className='grid-line horizontal-bottom'></div>
                            </div>                        
                          }
                        </div>

                        <div className='gallery-navigation-buttons'>
                          {selectedIndex !== 0 &&
                            <button className='left-photo-button' onClick={leftPhotoButton}>
                              <svg aria-label="Left chevron" className="left-photo-svg" color="#ffffff" fill="#ffffff" height="16" role="img" viewBox="0 0 24 24" width="16">
                                <polyline fill="none" points="16.502 3 7.498 12 16.502 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
                              </svg>
                            </button>                        
                          }
                          {selectedIndex !== photoUploads.length - 1 &&
                            <button className='right-photo-button' onClick={rightPhotoButton}>
                              <svg aria-label="Right chevron" className="right-photo-svg" color="#ffffff" fill="#ffffff" height="16" role="img" viewBox="0 0 24 24" width="16">
                                <polyline fill="none" points="8 3 17.004 12 8 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
                              </svg>
                            </button>                        
                          }
                          {photoUploads.length > 1 &&
                            <div className='upload-slide-indicators-wrapper'>
                              {photoUploads.map((photo) => {
                                if (photo.id === selectedPhoto) {
                                  return (
                                    <div key={photo.id} className='upload-slide-indicator selected'></div>
                                  )
                                } else {
                                  return (
                                    <div key={photo.id} className='upload-slide-indicator'></div>
                                  )
                                }
                              })}
                            </div>                        
                          }
                        </div>
                      </div>                  
                    }
                    {photoUploads.length === 0 &&
                      <div className='upload-photo-input-wrapper'>
                        <div className='upload-photo-input-area'>
                          <svg aria-label="Icon to represent media such as images or videos" className="upload-photo-videos-svg" color={filesDraggedOver ? "#0095f6" : "#262626"} fill={filesDraggedOver ? "#0095f6" : "#262626"} height="77" role="img" viewBox="0 0 97.6 77.3" width="96"><path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path>
                            <path d="M84.7 18.4L58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5l-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z" fill="currentColor"></path>
                            <path d="M78.2 41.6L61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6l-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z" fill="currentColor"></path>
                          </svg>
                          <h2 className='upload-photo-input-area-text'>
                            Drag photos here
                          </h2>
                          <label htmlFor='photo-upload-input' className='select-from-computer-label'>
                            <button className='select-from-computer-button'>
                              Select from computer
                            </button>                      
                          </label>
                        </div>

                      </div>                    
                    }
                    {(currentPage === 'sharing' || currentPage === 'shared') &&
                      <div className='photo-uploading-loader'>
                        {currentPage === 'sharing' &&
                          <img alt='loading Spinner' className='loading-spinner-gif' src={spinner10s} />
                        }
                        {currentPage === 'shared' &&
                          <div className='shared-wrapper'>
                            <img alt='upload complete' className='upload-complete-gif' src={checkmarkLoopsOnce} />
                            <span className='post-shared-text'>
                              Your post has been shared.
                            </span>                              
                          </div>
                        }
                      </div>                    
                    }
                    <form className='photo-upload-input-form'>
                      <input 
                        onChange={buttonFileHandler} 
                        accept='.jpg,.jpeg,.png' 
                        className='photo-upload-input' 
                        id='photo-upload-input' 
                        type='file' 
                        multiple='multiple'
                      />
                    </form>
                  </div>
                  <div className='photo-editing-tools-wrapper'></div>
                </div>              
              </div>
            </div>          
          </div>
        </div>
      </div>      
    </React.Fragment>

  )
}

export default UploadPhotoModal;
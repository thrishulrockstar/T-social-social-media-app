import './GalleryUploadMenu.css'
import React, { useEffect, useRef, useState } from 'react';

const GalleryUploadMenu = (props) => {
  const {
    closeAllMenus,
    ratioSelectionHandler,
    animateSlideMenu,
    toggleSlideMenu,
    hideSlideMenu,
    width,
    setDiscardPhotoModalOpen,
    selectPhotoHandler,
    buttonFileHandler,
    selectedPhoto,
    setSelectedPhoto,
    photoUploads,
    setPhotoUploads,
    slideMenuOpen,
    cropMenuOpen,
    zoomMenuOpen,
    modalWidth,
    loadPhotoLocation,
    selectedIndex,
    setSelectedIndex,
  } = props;
  const [photoHovering, setPhotoHovering] = useState('');
  const [startingX, setStartingX] = useState(0);
  const [xMovement, setXMovement] = useState(0);
  const [rightShiftedPhotos, setRightShiftedPhotos] = useState([]);
  const [leftShiftedPhotos, setLeftShiftedPhotos] = useState([]);
  const [galleryFrameWidth, setGalleryFrameWidth] = useState(0);
  const [slideMovement, setSlideMovement] = useState(0);
  const [slidePageCount, setSlidePageCount] = useState(0);
  const [newSlideIndex, setNewSlideIndex] = useState('');
  const [slideStartIndex, setSlideStartIndex] = useState('');
  const galleryFrameRef = useRef(null);

  useEffect(() => {
    if (!slideMenuOpen) {
      setSlideMovement(0);
      setSlidePageCount(0);
    }
  }, [slideMenuOpen])

  const gallerySlideRight = () => {
    const sliderWidth = photoUploads.length * 106;
    const frameWidth = galleryFrameWidth;
    const fullPageCount = sliderWidth/frameWidth
    const pageCount = Math.floor(sliderWidth/frameWidth);
    console.log('page count:', pageCount, 'full page count:', fullPageCount);
    if (pageCount === 1) {
      setSlideMovement(sliderWidth - frameWidth);
    }
    if (pageCount > 1) {
      setSlidePageCount(slidePageCount + 1);
      if (slidePageCount + 1 === pageCount) {
        setSlideMovement(sliderWidth - frameWidth);
        setSlidePageCount(0);
      } else {
        setSlideMovement(slideMovement + frameWidth);
      }
    }
  }

  const gallerySlideLeft = () => {
    const sliderWidth = photoUploads.length * 106;
    const frameWidth = galleryFrameWidth;
    const fullPageCount = sliderWidth/frameWidth
    const pageCount = Math.floor(sliderWidth/frameWidth);
    console.log('page count:', pageCount, 'full page count:', fullPageCount);
    if (pageCount === 1) {
      setSlideMovement(slideMovement - (sliderWidth - frameWidth));
    }
    if (pageCount > 1) {
      setSlidePageCount(slidePageCount + 1);
      if (slidePageCount + 1 === pageCount) {
        setSlideMovement(0);
        setSlidePageCount(0);
      } else {
        setSlideMovement(slideMovement - frameWidth);
      }
    }
  }

  useEffect(() => {
    if (slideMenuOpen) {
      console.log(galleryFrameRef.current.offsetWidth);
      setGalleryFrameWidth(galleryFrameRef.current.offsetWidth);
      setSlideMovement(0);      
    }
  }, [width, photoUploads, slideMenuOpen]);

  const newSlideIndexHandler = (newIndex) => {
    const array = [...photoUploads];
    const index = slideStartIndex;
    const draggedPhoto = array[index];
    array.splice(index, 1);
    array.splice(newIndex, 0, draggedPhoto);
    setPhotoUploads(array);
  }

  const dragPhoto = (event) => {
    event.preventDefault();
    const { id } = event.target;
    console.log(id);
    let index = photoUploads.findIndex((photo) => photo.id === id);
    setPhotoHovering(id);
    setSlideStartIndex(index);
    setStartingX(event.clientX);
    setXMovement(0);
    setNewSlideIndex('');
  };

  const draggingPhoto = (event) => {
    const { screenX } = event;
    const photoMovement = screenX - startingX;
    setXMovement(photoMovement);
  };

  useEffect(() => {
    if (photoHovering !== '') {
      window.addEventListener('mousemove', draggingPhoto);
      window.addEventListener('mouseup', dropPhoto);
    }
    return () => {
      window.removeEventListener('mousemove', draggingPhoto);
      window.removeEventListener('mouseup', dropPhoto)
    } 
  }, [photoHovering]);

  useEffect(() => {
    const index = photoUploads.findIndex((photo) => photo.id === photoHovering);
    if (photoHovering !== '') {
      if (xMovement > 0) {
        const newArray = rightShiftedPhotos;
        if (xMovement > 53 && rightShiftedPhotos.length === 0) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 1]);
          setNewSlideIndex(index + 1);
        }
        if (xMovement < 53 && rightShiftedPhotos.length === 1) {
          setRightShiftedPhotos([]);
          setNewSlideIndex(index);
        }
        if (xMovement > 159 && rightShiftedPhotos.length === 1) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 2]);
          setNewSlideIndex(index + 2);
        }
        if (xMovement < 159 && rightShiftedPhotos.length === 2) {
          newArray.splice(-1);
          setRightShiftedPhotos(newArray);
          setNewSlideIndex(index + 1);
        }
        if (xMovement > 265 && rightShiftedPhotos.length === 2) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 3]);
          setNewSlideIndex(index + 3);
        }
        if (xMovement < 265 && rightShiftedPhotos.length === 3) {
          newArray.splice(-1);
          setRightShiftedPhotos(newArray);
          setNewSlideIndex(index + 2);
        }
        if (xMovement > 371 && rightShiftedPhotos.length === 3) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 4]);
          setNewSlideIndex(index + 4);
        }
        if (xMovement < 371 && rightShiftedPhotos.length === 4) {
          newArray.splice(-1);
          setRightShiftedPhotos(newArray);
          setNewSlideIndex(index + 3);
        }
        if (xMovement > 477 && rightShiftedPhotos.length === 4) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 5]);
          setNewSlideIndex(index + 5);
        }
        if (xMovement < 477 && rightShiftedPhotos.length === 5) {
          newArray.splice(-1);
          setRightShiftedPhotos(newArray);
          setNewSlideIndex(index + 4);
        }
        if (xMovement > 583 && rightShiftedPhotos.length === 5) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 6]);
          setNewSlideIndex(index + 6);
        }
        if (xMovement < 583 && rightShiftedPhotos.length === 6) {
          newArray.splice(-1);
          setRightShiftedPhotos(newArray);
          setNewSlideIndex(index + 5);
        } 
        if (xMovement > 689 && rightShiftedPhotos.length === 6) {
          setRightShiftedPhotos([...rightShiftedPhotos, index + 7]);
          setNewSlideIndex(index + 7);
        }
        if (xMovement < 689 && rightShiftedPhotos.length === 7) {
          newArray.splice(-1);
          setRightShiftedPhotos(newArray);
          setNewSlideIndex(index + 6);
        }     
      }
      if (xMovement < 0) {
        const newArray = leftShiftedPhotos;
        if ((xMovement * -1) > 53 && leftShiftedPhotos.length === 0) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 1]);
          setNewSlideIndex(index - 1);
        }
        if ((xMovement * -1) < 53 && leftShiftedPhotos.length === 1) {
          setLeftShiftedPhotos([]);
          setNewSlideIndex(index);
        }
        if ((xMovement * -1) > 159 && leftShiftedPhotos.length === 1) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 2]);
          setNewSlideIndex(index - 2);
        }
        if ((xMovement * -1) < 159 && leftShiftedPhotos.length === 2) {
          newArray.splice(-1);
          setLeftShiftedPhotos(newArray);
          setNewSlideIndex(index - 1);
        }
        if ((xMovement * -1) > 265 && leftShiftedPhotos.length === 2) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 3]);
          setNewSlideIndex(index - 3);
        }
        if ((xMovement * -1) < 265 && leftShiftedPhotos.length === 3) {
          newArray.splice(-1);
          setLeftShiftedPhotos(newArray);
          setNewSlideIndex(index - 2);
        }
        if ((xMovement * -1) > 371 && leftShiftedPhotos.length === 3) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 4]);
          setNewSlideIndex(index - 4);
        }
        if ((xMovement * -1) < 371 && leftShiftedPhotos.length === 4) {
          newArray.splice(-1);
          setLeftShiftedPhotos(newArray);
          setNewSlideIndex(index - 3);
        }
        if ((xMovement * -1) > 477 && leftShiftedPhotos.length === 4) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 5]);
          setNewSlideIndex(index - 5);
        }
        if ((xMovement * -1) < 477 && leftShiftedPhotos.length === 5) {
          newArray.splice(-1);
          setLeftShiftedPhotos(newArray);
          setNewSlideIndex(index - 4);
        }
        if ((xMovement * -1) > 583 && leftShiftedPhotos.length === 5) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 6]);
          setNewSlideIndex(index - 6);
        }
        if ((xMovement * -1) < 583 && leftShiftedPhotos.length === 6) {
          newArray.splice(-1);
          setLeftShiftedPhotos(newArray);
          setNewSlideIndex(index - 5);
        } 
        if ((xMovement * -1) > 689 && leftShiftedPhotos.length === 6) {
          setLeftShiftedPhotos([...leftShiftedPhotos, index - 7]);
          setNewSlideIndex(index - 7);
        }
        if ((xMovement * -1) < 689 && leftShiftedPhotos.length === 7) {
          newArray.splice(-1);
          setLeftShiftedPhotos(newArray);
          setNewSlideIndex(index - 6);
        }     
      }  
    }
    // console.log("xmovement:", xMovement)
    console.log('movement triggered');
  }, [xMovement]);

  useEffect(() => {
  }, [newSlideIndex]);

  useEffect(() => {
    if (photoHovering === '' && newSlideIndex !== '') {
      if (newSlideIndex < 0) {
        newSlideIndexHandler(0);
        // ratioSelectionHandler(0);
        // loadPhotoLocation(0);
      }
      if (newSlideIndex > photoUploads.length - 1) {
        newSlideIndexHandler(photoUploads.length - 1);
        // ratioSelectionHandler(photoUploads.length - 1);
        // loadPhotoLocation(photoUploads.length -1);
      }
      if (newSlideIndex >= 0 && newSlideIndex <= photoUploads.length - 1) {
        newSlideIndexHandler(newSlideIndex);
        // ratioSelectionHandler(newSlideIndex);
        // loadPhotoLocation(newSlideIndex);       
      }
    }
  }, [photoHovering]);

  useEffect(() => {
    if (photoHovering === '' && newSlideIndex !== '') {
      if (newSlideIndex < 0) {
        // newSlideIndexHandler(0);
        ratioSelectionHandler(0);
        loadPhotoLocation(0);
        setSelectedIndex(0);
        setNewSlideIndex(''); 
      }
      if (newSlideIndex > photoUploads.length - 1) {
        // newSlideIndexHandler(photoUploads.length - 1);
        ratioSelectionHandler(photoUploads.length - 1);
        loadPhotoLocation(photoUploads.length -1);
        setSelectedIndex(photoUploads.length - 1);
        setNewSlideIndex(''); 
      }
      if (newSlideIndex >= 0 && newSlideIndex <= photoUploads.length - 1) {
        // newSlideIndexHandler(newSlideIndex);
        ratioSelectionHandler(newSlideIndex);
        loadPhotoLocation(newSlideIndex);
        setSelectedIndex(newSlideIndex);
        setNewSlideIndex('');          
      }
    }
  }, [photoUploads]);

  // useEffect(() => {
  //   console.log("right:", rightShiftedPhotos, 'left:', leftShiftedPhotos, 'length left:', leftShiftedPhotos.length, 'length right:', rightShiftedPhotos.includes(1));
  // },[rightShiftedPhotos, leftShiftedPhotos]);

  const dropPhoto = () => {
    if (photoHovering !== '') {
      setSelectedPhoto(photoHovering);
      setPhotoHovering('');
      setRightShiftedPhotos([]);
      setLeftShiftedPhotos([]);     
    }
  }

  const discardPhotoModalHandler = (event) => {
    event.stopPropagation();
    setDiscardPhotoModalOpen(true);
  }

  return (
    <div 
      className='gallery-upload-menu'
    >
      {slideMenuOpen &&
        <div 
          className={
            animateSlideMenu 
            ? ['gallery-upload-padding-wrapper', 'slideDown'].join(' ') 
            : 'gallery-upload-padding-wrapper'
          }
          onAnimationEnd={hideSlideMenu}
        >
          <div className='gallery-upload-menu-wrapper'>
            <div className='gallery-upload-add-wrapper'>
              <div 
                className='gallery-upload-overflow-frame' 
                ref={galleryFrameRef} 
                style={{
                  width: `${photoUploads.length * 106}px`
                }}
              >
                <div 
                  className='gallery-upload-slider-wrapper' 
                  style={{
                    transform: `translateX(-${slideMovement}px)`
                  }}>
                  {photoUploads.map((photo, index) => {
                    const {
                      id,
                      aspectRatio,
                      flippedAspectRatio,
                      url,
                      zoom,
                      x,
                      y,
                    } = photo;
                    let translateX;
                    let translateY;
                    const photoWidth = 
                      aspectRatio > 1 
                        ? 94 * aspectRatio 
                        : 94;
                    const photoHeight = 
                      aspectRatio > 1 
                        ? 94 
                        : flippedAspectRatio * 94;
                    const overflowX = (((photoWidth - 94) / photoWidth) * 100) / 2;
                    const overflowY = (((photoHeight - 94) / photoHeight) * 100) / 2;
                    if (aspectRatio > 1) {
                      translateX = (x/(modalWidth * aspectRatio)) * 100;
                      translateY = 0; 
                      if (translateX > overflowX) {
                        translateX = overflowX;
                        translateY = 0;
                      }
                      if (translateX < overflowX * -1) {
                        translateX = overflowX * -1;
                        translateY = 0;
                      }
                    } else if (aspectRatio < 1) {
                      translateY = (y/modalWidth) * 100;
                      translateX = 0;
                      if (translateY > overflowY) {
                        translateY = overflowY;
                        translateX = 0;
                      }
                      if (translateY < overflowY * -1) {
                        translateY = overflowY * -1;
                        translateX = 0;
                      }
                    }
                    return (
                      <div
                        key={id}  
                        className='gallery-photo-button-wrapper'
                        style={photoHovering === id 
                          ? {
                              opacity: '.7',
                              zIndex: '3', 
                              transform: `translate3d(${xMovement + (index * 106)}px, 0px, 0px)`, 
                              transition: 'none',
                            } 
                          : {
                              transform: `translate3d(${
                                xMovement < 0 
                                  ? (leftShiftedPhotos.includes(index) 
                                    ? (index * 106) + 106 
                                    : index * 106) 
                                  : (rightShiftedPhotos.includes(index) 
                                    ? (index * 106) - 106 
                                    : index * 106)}px, 0px, 0px)`,
                              transition: `${photoHovering !== '' ? 'all .3s ease-in' : 'none'}`
                                  }}
                      >
                        <div 
                          className='gallery-upload-photo-button' 
                          id={id} 
                          onMouseDown={dragPhoto} 
                          onClick={selectPhotoHandler}
                        >
                          {selectedPhoto === id && photoHovering !== id &&
                            <button 
                              className='discard-gallery-photo-button' 
                              onClick={discardPhotoModalHandler}
                            >
                              <svg aria-label="Delete" className="delete-upload-svg" color="#ffffff" fill="#ffffff" height="12" role="img" viewBox="0 0 24 24" width="12">
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line>
                              </svg>
                            </button>                      
                          }
                          <div 
                            className='gallery-upload-photo-overflow' 
                            style={{
                              transform: `scale(${
                                photoHovering === id 
                                  ? 1.2 
                                  : 1
                                })`
                              }}
                          >
                            <div 
                              className='gallery-upload-photo-background'
                              id={id}
                              style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, ${
                                  selectedPhoto === id 
                                    ? 0 
                                    : 0.5}), rgba(0, 0, 0, ${
                                  selectedPhoto === id 
                                    ? 0 
                                    : 0.5})), url(${url})`,
                                width: `${photoWidth}px`,
                                height: `${photoHeight}px`,
                                transform: `translate3d(${translateX}%, ${translateY}%, 0) scale(${(zoom / 100) + 1})`,
                              }}
                            ></div>
                          </div>
                        </div>                     
                      </div>
                    )
                  })}                
                </div>
                {galleryFrameWidth !== (photoUploads.length * 106) &&
                  <React.Fragment>
                    {slideMovement !== 0 &&
                      <button className='gallery-slider-button left' onClick={gallerySlideLeft}>
                        <div className='gallery-slider-sprite-left'></div>
                      </button>                  
                    }
                    {slideMovement + galleryFrameWidth !== photoUploads.length * 106 &&
                    <button className='gallery-slider-button right' onClick={gallerySlideRight}>
                      <div className='gallery-slider-sprite-right'></div>
                    </button>                   
                    }
                  </React.Fragment>
                }
              </div>
              {photoUploads.length !== 10 &&
                <div className='gallery-add-button-wrapper'>
                  <label htmlFor='photo-upload-input'>
                    <div className='gallery-add-button'>
                      <svg aria-label="Plus icon" className="gallery-add-svg" color="#8e8e8e" fill="#8e8e8e" height="22" role="img" viewBox="0 0 24 24" width="22">
                        <path d="M21 11.3h-8.2V3c0-.4-.3-.8-.8-.8s-.8.4-.8.8v8.2H3c-.4 0-.8.3-.8.8s.3.8.8.8h8.2V21c0 .4.3.8.8.8s.8-.3.8-.8v-8.2H21c.4 0 .8-.3.8-.8s-.4-.7-.8-.7z"></path>
                      </svg>
                    </div>                
                  </label>
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
              }
            </div>
          </div>        
        </div>      
      }
      <div 
        className={ (zoomMenuOpen || cropMenuOpen)
          ? ['gallery-button-wrapper', 'deselected'].join(' ')
          : slideMenuOpen 
              ? ['gallery-button-wrapper', 'selected'].join(' ') 
              : 'gallery-button-wrapper'
        }
      >
        <button className="gallery-button" onClick={toggleSlideMenu}>
          <div className='gallery-button-inner'>
            <svg aria-label="Open Media Gallery" className="gallery-upload-svg" color={slideMenuOpen ? "#262626" : "#ffffff"} fill={slideMenuOpen ? "#262626" : "#ffffff"} height="16" role="img" viewBox="0 0 24 24" width="16">
              <path d="M19 15V5a4.004 4.004 0 00-4-4H5a4.004 4.004 0 00-4 4v10a4.004 4.004 0 004 4h10a4.004 4.004 0 004-4zM3 15V5a2.002 2.002 0 012-2h10a2.002 2.002 0 012 2v10a2.002 2.002 0 01-2 2H5a2.002 2.002 0 01-2-2zm18.862-8.773A.501.501 0 0021 6.57v8.431a6 6 0 01-6 6H6.58a.504.504 0 00-.35.863A3.944 3.944 0 009 23h6a8 8 0 008-8V9a3.95 3.95 0 00-1.138-2.773z" fillRule="evenodd"></path>
            </svg>         
          </div>
        </button>
      </div>
    </div>
  )
}

export default GalleryUploadMenu;
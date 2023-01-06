import './MobilePhotoPost.css'
import firebaseApp from '../Firebase';
import { setDoc, deleteDoc, getFirestore, documentId, query, collection, where, orderBy, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove} from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { v4 as uuidv4 } from 'uuid';
import PostComments from '../components/PostComments';
import FollowButton from '../components/FollowButton';
import Tag from '../components/Tag';
import Comment from '../components/Comment';
import { Link } from 'react-router-dom';

const db = getFirestore()
let lastPress = 0;

const MobilePhotoPost = (props) => {
  const {
    isContentClicked,
    setIndexInView,
    pageYOffset,
    setPostHeightArray,
    postHeightArray,
    setNextHiddenPost,
    topRowsPast, 
    profileTagHandler,
    setIsCommentDeleteOpen,
    setSelectedComment,
    setIsSharePostOpen,
    setPostToSend,
    stringToLinks, 
    setCommentIDs,
    setIsLocationPost,
    isPostLinksOpen,
    setIsPostLinksOpen,
    onMouseEnter,
    onMouseLeave,
    setIsMouseHovering,
    followHandler,
    isFollowLoading,
    unfollowModalHandler,
    allUserProfiles,
    selectedListProfile,
    getUserProfileData,
    isModal,
    backgroundLocation,
    setBackgroundLocation,
    isMobile,
    setIsLikedByModalOpen,
    index,
    getFollowingPosts,
    setIsLoadingPage,
    likeUploadToggle,
    setDataLoading, 
    selectedPost,
    setSelectedPost,
    userData,
    photosArray,
    setPhotosArray, 
  } = props;
  const [width, height] = useWindowSize();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [postHidden, setPostHidden] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [movementStart, setMovementStart] = useState(0);
  const [movement, setMovement] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isButtonLiked, setIsButtonLiked] = useState();
  const [newComments, setNewComments] = useState([]);
  const [soloPostHeight, setSoloPostHeight] = useState(0);
  const postCommentsRef = useRef(null);
  const [modalPhotoWidth, setModalPhotoWidth] = useState(0);
  const [modalPhotoHeight, setModalPhotoHeight] = useState(0);
  const profilePhotoRef = useRef(null);
  const profileCaptionPhotoRef = useRef(null);
  const usernameHeaderRef = useRef(null);
  const usernameCaptionRef = useRef(null);
  const usernameCommentRef = useRef(null);
  const featuredCommentsRef = useRef([]);
  const fullCommentsUsernameRef = useRef([]);
  const fullCommentsPhotoRef = useRef([]);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [isTagsHidden, setIsTagsHidden] = useState(true);
  const tagTimerRef = useRef(null);
  const [isPostSaved, setIsPostSaved] = useState(false);
  const [replyUser, setReplyUser] = useState(null);
  const [newReplyID, setNewReplyID] = useState('');
  const [commentText, setCommentText] = useState('');
  const textareaRef = useRef();
  const [featuredComments, setFeaturedComments] = useState([]);
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchHashTag, setIsSearchHashTag] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const isHeightRecorded = useRef(false);
  const postReference = useRef(null);

  useEffect(() => {
    if (params.postID !== undefined) {
      return
    };
    if (!isInViewport(postReference.current)) {
      return
    }; 
    
    setIndexInView(index)
    const {
      height
    } = postReference
      .current
        .getBoundingClientRect();
    const {
      postID,
      postCaption
    } = selectedPost[0];
    const postIDIndex = postHeightArray
      .findIndex((post) => post.postID === postID);

    if (postIDIndex !== -1 && !isHeightRecorded.current) {
      isHeightRecorded.current = true;
      const newArray = [...postHeightArray];
      newArray.splice(postIDIndex, 1, {
        height,
        postID,
        postCaption
      });
      return setPostHeightArray(newArray);
    };
    if (!isHeightRecorded.current) {
      isHeightRecorded.current = true;
      setPostHeightArray([...postHeightArray, {
        height,
        postID,
        postCaption
      }]);    
    };
  }, [pageYOffset])

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  useEffect(() => {
    if (isModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflowY = 'scroll';
      }      
    }
  }, []);

  const sendPost = (selectedPost) => {
    setPostToSend(selectedPost);
    setIsSharePostOpen(true);
  }

  const getSearchResults = async () => {
    setIsSearching(true);
    const matchedUsers = [];
    const searchTerm = searchString.toLowerCase();
    let searchQuery;
    if (isSearchHashTag) {
      searchQuery = query(collection(db, 'hashTags'), 
        where(documentId(), '>=', searchTerm), where(documentId(), '<=', searchTerm+ '\uf8ff' ));
    } else {
      searchQuery = query(collection(db, 'users'), 
        where('username', '>=', searchTerm), where('username', '<=', searchTerm+ '\uf8ff' ));
    }
    const usersSnapshot = await getDocs(searchQuery);
    usersSnapshot.forEach((user) => {
      if (isSearchHashTag) {
        matchedUsers.push({
          hashTag: user.id,
          ...user.data()
        });
      } else {
        matchedUsers.push(user.data());
      };
    });
    setSearchResults(matchedUsers);
  }

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    setSearchResults([]);
    if (searchString !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        getSearchResults(); 
      }, 300);     
    }; 
  }, [searchString]);

  useEffect(() => {
    if (selectedPost !== '') {
      const {
        comments
      } = selectedPost[0];
      const replyIndex = comments.findIndex((comment) => comment.replies.length > 0);
      if (replyIndex !== -1) {
        setFeaturedComments([comments[replyIndex], comments[replyIndex].replies[0]]);
      } else {
      }
    }
  }, [selectedPost]);

  useEffect(() => {
    if (selectedPost !== '') {
      const { uid } = userData;
      const savedIndex = selectedPost[0].saved.findIndex((user) => user === uid)
      savedIndex === -1
        ? setIsPostSaved(false)
        : setIsPostSaved(true);         
    }
}, [userData, selectedPost])

  const savePostHandler = (postID) => {
    isPostSaved
      ? setIsPostSaved(false)
      : setIsPostSaved(true);
    savePostUploadToggle(postID)
  }

  const savePostUploadToggle = async (postID) => {
    const {
      uid,
    } = userData;
    const postRef = doc(db, 'postUploads', postID);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const { saved } = postSnap.data();
      const savedIndex = saved.findIndex((user) => user === uid)
      if (savedIndex === -1) {
        await updateDoc(postRef, {
          saved: arrayUnion(uid)
        });          
      } else {
        await updateDoc(postRef, {
          saved: arrayRemove(uid)
        });        
      }
    }
  };

  const TagsHandler = () => {
    clearTimeout(tagTimerRef.current);
    tagTimerRef.current = setTimeout(() => {
      isTagsHidden ? setIsTagsHidden(false) : setIsTagsHidden(true);
    }, 400);
  }

  const openPostLinksModal = (index) => {
    if (params.postID !== undefined) {
      setIsLocationPost(true);
    } else {
      setIsLocationPost(false);
    }
    console.log(selectedPost, params);
    setSelectedPost(selectedPost);
    setIsPostLinksOpen(true);
  };

  const onDoublePress = (event) => {
    console.log(tagTimerRef.current);
    clearTimeout(tagTimerRef.current);
    const time = new Date().getTime();
    const delta = time - lastPress;

    const DOUBLE_PRESS_DELAY = 400;
    if (delta < DOUBLE_PRESS_DELAY) {
        console.log('double press');
        setIsLiked(true);
        const alreadyLiked = selectedPost[0].likes.findIndex((like) => like.uid === userData.uid);
        if (alreadyLiked === -1) {
          likeHandler();
        }
    } else {
      movementStartHandler(event);
    }
    lastPress = time;
  };

  const onDoubleClick = () => {
    console.log(tagTimerRef.current);
    clearTimeout(tagTimerRef.current);
    setIsLiked(true);
    const alreadyLiked = selectedPost[0].likes.findIndex((like) => like.uid === userData.uid);
    if (alreadyLiked === -1) {
      likeHandler();
    }
  }

  const likeHandler = async () => {
    console.log('liked');
    const {
      postID,
      likes
    } = selectedPost[0];
        const index = likes.findIndex((like) => like.uid === userData.uid);
    if (index === -1) {
      setLikeCount(likeCount + 1);
      setIsButtonLiked(true);
      setIsPostLiked(true);
    } else {
      setLikeCount(likeCount - 1);
      setIsButtonLiked(false);
      setIsPostLiked(false);
    }
    await likeUploadToggle(postID, selectedPost[1].w150);
    getPostData();
  }

  const navigateLikedBy = async (postID) => {
    await getPostData();
    if (isMobile) {
      navigate(`/p/${postID}/liked_by`);  
    } else {
      setIsLikedByModalOpen(true);
    }
    setIsLoadingPage(false);    
  }

  const getPostData = async () => {
    let postID;
    if (params.postID === undefined) {
      postID = selectedPost[0].postID;
    } else {
      postID = params.postID;
    }
    if (selectedPost === '' && backgroundLocation === null && params.postID !== undefined) {
      setDataLoading(true)
    }  
    const photoArray = [];
    const profilePhotoData = query(collection(db, 'photoUploads'), 
      where('postID', '==', postID), orderBy('index'));
    const profileImageDataSnap = await getDocs(profilePhotoData);
    profileImageDataSnap.forEach((doc) => {
      photoArray.push(doc.data());
    });
    const profilePostDocument = doc(db, 'postUploads', postID);
    const postSnap = await getDoc(profilePostDocument);

    console.log();

    if (params.postID === undefined) {
      const newPost = [postSnap.data(), ...photoArray];
      const newPhotosArray = [...photosArray];
      const newPhotosArrayIndex = photosArray.findIndex((post) => post[0].postID === postID);
      newPhotosArray.splice(newPhotosArrayIndex, 1, newPost);
      setPhotosArray(newPhotosArray);
    }
    setSelectedPost([postSnap.data(), ...photoArray]);
    setDataLoading(false);
  };

  const nextPhotoHandler = (event) => {
    let photoWidth;
    if (isModal) {
      photoWidth = modalPhotoWidth;
    } else {
      let maxWidth = 470;
      if (params.postID !== undefined && !isMobile) {
        maxWidth = 614;
      }
      width > 736 ? photoWidth = maxWidth : photoWidth = width;      
    }
    event.stopPropagation();
    if (galleryIndex !== selectedPost[0].photos.length - 1) {
      setGalleryIndex(galleryIndex + 1);
      setMovement(photoWidth * (galleryIndex + 1));
    }
    setIsTagsHidden(true);
  }

  const previousPhotoHandler = (event) => {
    let photoWidth;
    if (isModal) {
      photoWidth = modalPhotoWidth
    } else {
      let maxWidth = 470;
      if (params.postID !== undefined && !isMobile) {
        maxWidth = 614;
      }
      width > 736 ? photoWidth = maxWidth : photoWidth = width;
    }
    event.stopPropagation();
    if (galleryIndex !== 0) {
      setGalleryIndex(galleryIndex - 1);
      console.log(galleryIndex - 1);
      setMovement(photoWidth * (galleryIndex - 1));
    }
    setIsTagsHidden(true);
  }

  const movementEndHandler = () => {
    console.log(movement);
    console.log(galleryIndex);
    setIsMoving(true);
    let photoWidth;
    let maxWidth = 470;
    if (params.postID !== undefined && !isMobile) {
      maxWidth = 614;
    }
    width > 736 ? photoWidth = maxWidth : photoWidth = width;
    if ((galleryIndex === 0 && movement < 0)) {
      return
    } else {
      if ((movement - (photoWidth * galleryIndex)) > 50) {
        setGalleryIndex(galleryIndex + 1);
        console.log(photoWidth * (galleryIndex + 1))
        setMovement(photoWidth * (galleryIndex + 1));
      } else if ((movement - (photoWidth * galleryIndex)) < -50) {
        setGalleryIndex(galleryIndex - 1);
        console.log(galleryIndex - 1);
        setMovement(photoWidth * (galleryIndex - 1));
      } else {
        setMovement(photoWidth * galleryIndex);
      }      
    }
  }

  const movementStartHandler = (event) => {
    setIsMoving(false);
    setMovementStart(event.touches[0].clientX);
  }

  useEffect(() => {
    if (selectedPost === '') {
      getPostData();
    }
  }, []);

  useEffect(() => () => {
    if (params.postID !== undefined) {
      setSelectedPost('');
    }
  },[]);

  useEffect(() => {
    if (selectedPost !== '') {
      photoPostHeightHandler();   
      modalSizesHandler();
    }
  }, [width, height, selectedPost]);

  const photoPostHeightHandler = () => {
    let newHeight;
    let photoWidth = width - 395
    let maxWidth = 470;
    if (params.postID !== undefined && !isMobile) {
      maxWidth = 614;
    }
    if (photoWidth > maxWidth) photoWidth = maxWidth;
    if (selectedPost[1].aspectRatio > 0) {
      newHeight = photoWidth / selectedPost[1].aspectRatio;
    }
    if (selectedPost[1].aspectRatio < 0) {
      newHeight = photoWidth * selectedPost[1].aspectRatio;
    }
    if (selectedPost[1].aspectRatio === 0) {
      newHeight = photoWidth
    }
    setSoloPostHeight(newHeight);
  }

  const modalSizesHandler = () => {
    const { aspectRatio } = selectedPost[1];
    let maxPhotoHeight = height - 60;
    let maxPhotoWidth = 1090;
    let modalHeight = maxPhotoHeight;
    let photoWidth = maxPhotoHeight * aspectRatio;
    if (photoWidth > width - 510) {
      photoWidth = width - 510;
    }
    if (photoWidth > maxPhotoWidth) {
      photoWidth = maxPhotoWidth;
    }
    if (aspectRatio > 1) {
      if (modalHeight > photoWidth) {
        modalHeight = photoWidth
      }
      if (modalHeight < photoWidth) {
        photoWidth = modalHeight
      }
      if (photoWidth < maxPhotoWidth) {
        modalHeight = photoWidth;
      }      
    }
    if (aspectRatio <= 1) {
      let photoHeight = photoWidth / aspectRatio;
      if (photoHeight < maxPhotoHeight) {
        modalHeight = photoHeight;
      }      
    }

    setModalPhotoHeight(modalHeight);
    setModalPhotoWidth(photoWidth)
  }

  useEffect(() => {
    if (selectedPost !== '') {
      const {
        likes
      } = selectedPost[0];
      const index = likes.findIndex((like) => like.uid === userData.uid);
      if (index === -1) {
        setIsPostLiked(false);
      } else {
        setIsPostLiked(true);
      };
      setLikeCount(likes.length);
    };
  }, [selectedPost]);

  if (selectedPost !== '') {
    const { 
      username,
      photoURL,
      postID,
      uploadDate,
      postCaption,
      comments,
      photos,
      likes,
      uid,
      tags
    } = selectedPost[0];


    const frameWrapperHandler = () => {
      let newWidth;
      const photoWidth = width - 395;
      let maxWidth = 470;
      if (params.postID !== undefined && !isMobile) {
        maxWidth = 614;
      }
      photoWidth > maxWidth ? newWidth = maxWidth : newWidth = photoWidth;
      return newWidth * photos.length;
    }

    const postHiddenToggle = () => postHidden ? setPostHidden(false) : setPostHidden(true);

    const movementHandler = (event) => {
      if (galleryIndex === photos.length - 1 && (movementStart - event.touches[0].clientX) > 0) {
        return
      } else {
        setMovement((movementStart - event.touches[0].clientX) + (width * galleryIndex));        
      };
    };

    const navigateComments = (postID) => {
      if (isMobile) {
        navigate(`/p/${postID}/comments`);        
      } else {
        setBackgroundLocation(location);
        navigate(`/p/${postID}`);        
      }
    };

    const navigateUserProfile = async (username) => {
      setIsLoadingPage(true);
      await getUserProfileData(username);
      navigate(`/${username}`);
      setIsLoadingPage(false);
      setIsMouseHovering(false);
    }

    const formatTime = () => {
      const currentDate = Date.now();
      const timePast = Date.now() - uploadDate;
      const timeStampYear = new Date(uploadDate).getFullYear();
      const currentYear = new Date(currentDate).getFullYear();
      const minutesPast = timePast / 60000;
      const hoursPast = minutesPast / 60;
      const daysPast = hoursPast / 24;
      switch (true) {
        case minutesPast < 1:
          return 'NOW';
        case minutesPast < 60 && minutesPast > 1:
          const minutes = Math.floor(minutesPast)
          return `${minutes} ${
            minutes < 1 
              ? 'MINUTE' 
              : 'MINUTES'
          } AGO`;
        case hoursPast >= 1 && hoursPast < 24:
          const hours = Math.floor(hoursPast)
          return `${hours} ${
            hours < 1 
              ? 'HOUR' 
              : 'HOURS'
          } AGO`;
        case daysPast >= 1 && daysPast < 8:
          const days = Math.floor(daysPast)
          return `${days} ${
            days < 1 
              ? 'DAY' 
              : 'DAYS'
          } AGO`;
        default:
          if (timeStampYear === currentYear) {
            return `${new Date(uploadDate)
              .toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}`.toUpperCase();
          } else {
            return `${new Date(uploadDate)
              .toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}`.toUpperCase();
          }
      }
    }

    const formatTimeShort = () => {
      const timePast = Date.now() - uploadDate;
      const minutesPast = timePast / 60000;
      const hoursPast = minutesPast / 60;
      const daysPast = hoursPast / 24;
      const weeksPast = daysPast / 7;
      switch (true) {
        case minutesPast < 1:
          return 'Now';
        case minutesPast < 60 && minutesPast > 1:
          return `${Math.floor(minutesPast)}m`;
        case hoursPast >= 1 && hoursPast < 24:
          return `${Math.floor(hoursPast)}h`;
        case daysPast >= 1 && daysPast < 7:
          return `${Math.floor(daysPast)}d`;
        case weeksPast >= 1:
          return `${Math.floor(weeksPast)}w`;
        default:
      }
    };

    if (isModal) {
      return (
        <article 
          className='photo-post-modal-wrapper'
          style={{ 
            height: `${modalPhotoHeight}px`,
          }}          
        >
          <div 
            className='photo-navigation-wrapper post-modal'
            style={{
              width: `${modalPhotoWidth}px`
            }}
            onTouchStart={onDoublePress}
            onTouchMove={movementHandler}
            onTouchEnd={movementEndHandler}
            ref={imageRef}
          >
            <div 
              className='photo-frames-wrapper'
              style={{
                width: `${modalPhotoWidth * photos.length}px`,
                transform: `translateX(-${movement}px)`,
                transition: `${isMoving ? 'all .2s ease-in-out' : ''}`,
                paddingBottom: `${100 / selectedPost[1].aspectRatio}%`
              }}
              onDoubleClick={onDoubleClick}
            >
              {selectedPost.map((photo, photoIndex) => {
                if ((photoIndex === galleryIndex + 1 || photoIndex === galleryIndex + 2 || photoIndex === galleryIndex) && photoIndex !== 0) {
                  return (
                    <div
                      key={photo.photoID} 
                      className='feed-photo-frame'
                      style={{
                        transform: `translateX(${modalPhotoWidth * (photoIndex - 1)}px)`
                      }}
                      onClick={TagsHandler}
                    >
                      <img
                        decoding='sync' 
                        alt={postCaption} 
                        className='feed-photo-post-image' 
                        sizes={`${modalPhotoWidth}px`}
                        srcSet={`
                          ${photo.w1080} 1080w,
                          ${photo.w750} 750w,
                          ${photo.w640} 640w,
                          ${photo.w480} 480w,
                          ${photo.w320} 320w,
                          ${photo.w240} 240w,
                          ${photo.w150} 150w
                        `}
                      />
                      {!isTagsHidden &&
                        <React.Fragment>
                          {photo.tags.map((tag, index) => {
                            const {
                              left,
                              top,
                              username,
                              uid,
                            } = tag;
                            return (
                              
                              <div 
                                key={uid}
                                onClick={() => navigateUserProfile(username)}
                              >
                                <Tag
                                  isPost = {true}
                                  isTagsHidden={isTagsHidden}
                                  imageDimensions={imageDimensions}
                                  index={index}
                                  tagData={tags}
                                  key={uid}
                                  imageRef={imageRef}
                                  left={left}
                                  top={top}
                                  username={username}
                                />                    
                              </div>
                            )
                          })}                              
                        </React.Fragment>
                      }
                      {photo.tags.length !== 0 &&
                        <button className='post-tag-button'>
                          <svg aria-label="Tags" className="tag-button-svg" color="#ffffff" fill="#ffffff" height="12" role="img" viewBox="0 0 24 24" width="12">
                            <path d="M21.334 23H2.666a1 1 0 01-1-1v-1.354a6.279 6.279 0 016.272-6.272h8.124a6.279 6.279 0 016.271 6.271V22a1 1 0 01-1 1zM12 13.269a6 6 0 116-6 6.007 6.007 0 01-6 6z"></path>
                          </svg>
                        </button>                            
                      }
                    </div>
                  )
                }
              })}                
            </div>
            {isLiked &&
              <div className='double-click-heart'>
                <div 
                  className='double-click-heart-sprite'
                  onAnimationEnd={() => setIsLiked(false)}  
                >
                </div>
              </div>                  
            }
            {photos.length > 1 &&
              <React.Fragment>
                {galleryIndex !== (photos.length - 1) &&
                  <button 
                    className='next-photo-button'
                    onClick={nextPhotoHandler}
                  >
                    <div className='right-chevron-sprite'>
                    </div>  
                  </button>                  
                }
                {galleryIndex > 0 &&
                  <button 
                    className='previous-photo-button'
                    onClick={previousPhotoHandler}
                  >
                    <div className='left-chevron-sprite'>
                    </div>  
                  </button>                    
                }
                <div className='solo-slide-indicator-wrapper'>
                  {photos.map((photo, index) => {
                    return (
                      <div key={photo} className={galleryIndex === index ? 'slide-indicator selected' : 'slide-indicator'}></div>
                    )
                  })}
                </div>                                                              
              </React.Fragment>
            }     
          </div>
          <section className='solo-post-side-bar-modal'>
            <header className='solo-post-header'>
              <div className='profile-photo-username-wrapper'>
                <div 
                  className='feed-profile-photo-wrapper'
                  onClick={() => navigateUserProfile(username)}
                  onMouseEnter={() => onMouseEnter(uid, profilePhotoRef.current)}
                  onMouseLeave={onMouseLeave}
                  ref={profilePhotoRef}  
                >
                  <img alt={`${username}'s profile`} src={photoURL} className="feed-profile-photo"/> 
                </div>
                <span 
                  className='profile-username-header'
                  onClick={() => navigateUserProfile(username)}
                  onMouseEnter={() => onMouseEnter(uid, usernameHeaderRef.current)}
                  onMouseLeave={onMouseLeave}
                  ref={usernameHeaderRef}
                >
                  {username}
                </span>
                <FollowButton 
                  selectedListProfile={selectedListProfile}
                  userData={userData}
                  followHandler={followHandler}
                  unfollowModalHandler={unfollowModalHandler}
                  isFollowLoading={isFollowLoading}
                  user={selectedPost[0]}
                />
                <button 
                  className='post-links-modal'
                  onClick={() => openPostLinksModal(index)}  
                >
                  <svg aria-label="More options" className="elipsis-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle>
                  </svg>
                </button>                    
              </div>

            </header>
            <div 
              className='solo-post-comments-wrapper'
              ref={postCommentsRef}
            >
              <ul 
                className='solo-post-comment-list'
                
              >
                {postCaption !== '' &&
                  <li className='comment-content caption'>
                    <div 
                      className='comment-profile-photo-frame'
                      onClick={() => navigateUserProfile(username)}
                      onMouseEnter={() => onMouseEnter(uid, profileCaptionPhotoRef.current)}
                      onMouseLeave={onMouseLeave}
                      ref={profileCaptionPhotoRef} 
                    >
                      <img 
                        alt={`${selectedPost[0].username}'s profile`} 
                        src={selectedPost[0].photoURL} 
                        className="comments-profile-photo"
                      /> 
                    </div>
                    <div className='comment-text-time-wrapper'>
                      <div className='comment-text-wrapper'>
                        <h2 
                          className='comment-username'
                          onClick={() => navigateUserProfile(username)}
                          onMouseEnter={() => onMouseEnter(uid, usernameCaptionRef.current)}
                          onMouseLeave={onMouseLeave}
                          ref={usernameCaptionRef}
                        >
                          {selectedPost[0].username}
                        </h2>
                        <span 
                          className='comment-text'
                        >
                          {stringToLinks(postCaption)}
                        </span>                    
                      </div>
                      <div className='comment-footer'>
                        <time className='comment-time-stamp'>
                          {formatTimeShort()}
                        </time>                        
                      </div>
                    </div>
                  </li>                
                }
                {comments.map((comment, index) => {
                  const {
                    commentID,
                  } = comment;
                  return (
                    <li 
                      key={commentID} 
                      className='comment-wrapper'
                    >
                      <Comment
                        w150 = {selectedPost[1].w150}
                        setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
                        setSelectedComment = {setSelectedComment}
                        stringToLinks={stringToLinks}
                        setIsLikedByModalOpen={setIsLikedByModalOpen}
                        setCommentIDs={setCommentIDs}
                        getPostData={getPostData}
                        isMobile={isMobile}
                        setIsLoadingPage={setIsLoadingPage}
                        isReply={false}
                        newReplyID={newReplyID}
                        textareaRef={textareaRef}
                        setCommentText={setCommentText}
                        replyUser={replyUser}
                        setReplyUser={setReplyUser}
                        selectedPost={selectedPost}
                        setSelectedPost={setSelectedPost}
                        postID={postID}
                        userData={userData}
                        comment={comment}
                        navigateUserProfile={navigateUserProfile}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
            <footer className='feed-post-footer'>
              <div 
                className='feed-footer-buttons-wrapper'
              >
                <button 
                  className='feed-like-button'
                  onClick={likeHandler}
                >
                  {(!isPostLiked) &&
                    <svg aria-label="Like" className="like-open-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
                    </svg>                      
                  }
                  {(isPostLiked) &&
                    <svg aria-label="Unlike" className={isButtonLiked ? "like-filled-svg animated" : 'like-filled-svg'} color="#ed4956" fill="#ed4956" height="24" role="img" viewBox="0 0 48 48" width="24">
                      <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                    </svg>                      
                  }
                </button>
                <button 
                  className='feed-comment-button'
                  onClick={() => navigateComments(postID)}
                >
                  <svg aria-label="Comment" className="comment-button-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <path d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
                <button 
                  className='feed-share-button'
                  onClick={() => sendPost(selectedPost)}
                >
                  <svg aria-label="Share Post" className="share-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                    <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                  </svg>
                </button>
                <button 
                  className='feed-save-button'
                  onClick={() => savePostHandler(postID)}
                >
                  {isPostSaved
                    ? <svg aria-label="Remove" className="filled-save-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <path d="M20 22a.999.999 0 01-.687-.273L12 14.815l-7.313 6.912A1 1 0 013 21V3a1 1 0 011-1h16a1 1 0 011 1v18a1 1 0 01-1 1z"></path>
                      </svg>
                    :  <svg aria-label="Save" className="save-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                      </svg>
                  }
                </button>
              </div>
              {likeCount > 0 &&
                <button 
                  className='like-counter'
                  onClick={() => navigateLikedBy(postID)}
                >
                  {likeCount === 1
                    ? '1 like'
                    : `${likeCount} likes`
                  }
                </button>                  
              }               
              <div className='feed-post-timestamp'>
                <time 
                  className='post-time-stamp'
                  title={new Date(uploadDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                >
                  {formatTime()}
                </time>
              </div>
            </footer>
            <PostComments
              getPostData = {getPostData}
              isContentClicked = {isContentClicked}
              w150 = {selectedPost[1].w150}
              profileTagHandler = {profileTagHandler}
              isSearchHashTag = {isSearchHashTag}
              setIsSearchHashTag = {setIsSearchHashTag}
              setIsSearching={setIsSearching}
              isSearching={isSearching}
              searchResults={searchResults}
              setSearchString={setSearchString}
              setNewReplyID={setNewReplyID}
              selectedPost={selectedPost}
              setReplyUser={setReplyUser}
              replyUser={replyUser}
              textareaRef={textareaRef}
              setCommentText={setCommentText}
              commentText={commentText}
              postCommentsRef={postCommentsRef}
              setSelectedPost={setSelectedPost}
              newComments={newComments}
              setNewComments={setNewComments}
              userData={userData}
              postID = {postID} 
            />                                                     
          </section>
        </article>
      );
    };
    if (params.postID !== undefined && !isMobile) {
      return (
        <main 
          className='photo-post-wide-wrapper'
          key={postID}
        >
          <section 
            className="photo-post-page-wide"
          >
            <article 
              className='photo-post-wide'
              style={{ 
                height: `${soloPostHeight}px`
              }}            
            >
              <div 
                className='photo-navigation-wrapper'
                style={{
                  width: `min(calc(100vw - 395px), 614px)`
                }}
                onTouchStart={onDoublePress}
                onTouchMove={movementHandler}
                onTouchEnd={movementEndHandler}
                ref={imageRef}
              >
                {selectedPost[galleryIndex + 1].tags.length !== 0 &&
                  <button 
                    className='post-tag-button'
                    onClick={TagsHandler}
                  >
                    <svg aria-label="Tags" className="tag-button-svg" color="#ffffff" fill="#ffffff" height="12" role="img" viewBox="0 0 24 24" width="12">
                      <path d="M21.334 23H2.666a1 1 0 01-1-1v-1.354a6.279 6.279 0 016.272-6.272h8.124a6.279 6.279 0 016.271 6.271V22a1 1 0 01-1 1zM12 13.269a6 6 0 116-6 6.007 6.007 0 01-6 6z"></path>
                    </svg>
                  </button>                            
                }
                <div 
                  className='photo-frames-wrapper'
                  style={{
                    width: `${frameWrapperHandler()}px`,
                    transform: `translateX(-${movement}px)`,
                    transition: `${isMoving ? 'all .2s ease-in-out' : ''}`,
                    paddingBottom: `${100 / selectedPost[1].aspectRatio}%`
                  }}
                  onDoubleClick={onDoubleClick}
                >
                  {selectedPost.map((photo, photoIndex) => {
                    if ((photoIndex === galleryIndex + 1 || photoIndex === galleryIndex + 2 || photoIndex === galleryIndex) && photoIndex !== 0) {
                      return (
                        <div
                          key={photo.photoID} 
                          className='feed-photo-frame'
                          style={{
                            transform: `translateX(${(width > 736 ? 614 : width) * (photoIndex - 1)}px)`
                          }}
                          onClick={TagsHandler}
                        >
                          <img 
                            alt={postCaption} 
                            className='feed-photo-post-image' 
                            sizes={`min(calc(100vw - 395px), 614px)`}
                            srcSet={`
                              ${photo.w1080} 1080w,
                              ${photo.w750} 750w,
                              ${photo.w640} 640w,
                              ${photo.w480} 480w,
                              ${photo.w320} 320w,
                              ${photo.w240} 240w,
                              ${photo.w150} 150w
                            `}
                          />
                          {!isTagsHidden &&
                            <React.Fragment>
                              {photo.tags.map((tag, index) => {
                                const {
                                  left,
                                  top,
                                  username,
                                  uid,
                                } = tag;
                                return (
                                  
                                  <div 
                                    key={uid}
                                    onClick={() => navigateUserProfile(username)}
                                  >
                                    <Tag
                                      isPost = {true}
                                      isTagsHidden={isTagsHidden}
                                      imageDimensions={imageDimensions}
                                      index={index}
                                      tagData={tags}
                                      key={uid}
                                      imageRef={imageRef}
                                      left={left}
                                      top={top}
                                      username={username}
                                    />                    
                                  </div>
                                )
                              })}                              
                            </React.Fragment>
                          }
                        </div>
                      )
                    }
                  })}                
                </div>
                {isLiked &&
                  <div className='double-click-heart'>
                    <div 
                      className='double-click-heart-sprite'
                      onAnimationEnd={() => setIsLiked(false)}  
                    >
                    </div>
                  </div>                  
                }
                {photos.length > 1 &&
                  <React.Fragment>
                    {galleryIndex !== (photos.length - 1) &&
                      <button 
                        className='next-photo-button'
                        onClick={nextPhotoHandler}
                      >
                        <div className='right-chevron-sprite'>
                        </div>  
                      </button>                  
                    }
                    {galleryIndex > 0 &&
                      <button 
                        className='previous-photo-button'
                        onClick={previousPhotoHandler}
                      >
                        <div className='left-chevron-sprite'>
                        </div>  
                      </button>                    
                    }
                    <div className='solo-slide-indicator-wrapper'>
                      {photos.map((photo, index) => {
                        return (
                          <div key={photo} className={galleryIndex === index ? 'slide-indicator selected' : 'slide-indicator'}></div>
                        )
                      })}
                    </div>                                                              
                  </React.Fragment>
                }     
              </div>
              <section className='solo-post-side-bar'>
                <header className='solo-post-header'>
                  <div className='profile-photo-username-wrapper'>
                    <div 
                      className='feed-profile-photo-wrapper'
                    
                    >
                      <img alt={`${username}'s profile`} src={photoURL} className="feed-profile-photo"/> 
                    </div>
                    <span className='profile-username-header'>
                      {username}
                    </span>
                    <button 
                      className='post-links-modal'
                      onClick={() => openPostLinksModal(index)}  
                    >
                      <svg aria-label="More options" className="elipsis-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle>
                      </svg>
                    </button>                    
                  </div>
    
                </header>
                <div 
                  className='solo-post-comments-wrapper'
                  ref={postCommentsRef}
                >
                  <ul 
                    className='solo-post-comment-list'
                    
                  >
                    <li className='comment-content'>
                      <div className='comment-profile-photo-frame'>
                        <img 
                          alt={`${selectedPost[0].username}'s profile`} 
                          src={selectedPost[0].photoURL} 
                          className="comments-profile-photo"
                        /> 
                      </div>
                      <div className='comment-text-time-wrapper'>
                        <div className='comment-text-wrapper'>
                          <h2 className='comment-username'>
                            {selectedPost[0].username}
                          </h2>
                          <span className='comment-text'>
                            {stringToLinks(postCaption)}
                          </span>                    
                        </div>
                        <time className='comment-time-stamp'>
                          {formatTimeShort()}
                        </time>
                      </div>
                      
                    </li>
                    {comments.map((comment) => {
                      const {
                        commentID,
                      } = comment;
                      return (
                        <li 
                          key={commentID} 
                          className='comment-wrapper'
                        >
                          <Comment
                            w150 = {selectedPost[1].w150}
                            setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
                            setSelectedComment = {setSelectedComment}
                            stringToLinks={stringToLinks}
                            setIsLikedByModalOpen={setIsLikedByModalOpen}
                            setCommentIDs={setCommentIDs}
                            getPostData={getPostData}
                            isMobile={isMobile}
                            setIsLoadingPage={setIsLoadingPage}
                            isReply={false}
                            newReplyID={newReplyID}
                            textareaRef={textareaRef}
                            setCommentText={setCommentText}
                            replyUser={replyUser}
                            setReplyUser={setReplyUser}
                            selectedPost={selectedPost}
                            setSelectedPost={setSelectedPost}
                            postID={postID}
                            userData={userData}
                            comment={comment}
                            navigateUserProfile={navigateUserProfile}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                          />
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <footer className='feed-post-footer'>
                  <div 
                    className='feed-footer-buttons-wrapper'
                  >
                    <button 
                      className='feed-like-button'
                      onClick={likeHandler}
                    >
                      {(!isPostLiked) &&
                        <svg aria-label="Like" className="like-open-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                          <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
                        </svg>                      
                      }
                      {(isPostLiked) &&
                        <svg aria-label="Unlike" className={isButtonLiked ? "like-filled-svg animated" : 'like-filled-svg'} color="#ed4956" fill="#ed4956" height="24" role="img" viewBox="0 0 48 48" width="24">
                          <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                        </svg>                      
                      }
                    </button>
                    <button 
                      className='feed-comment-button'
                      onClick={() => navigateComments(postID)}
                    >
                      <svg aria-label="Comment" className="comment-button-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <path d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </button>
                    <button 
                      className='feed-share-button'
                      onClick={() => sendPost(selectedPost)}
                    >
                      <svg aria-label="Share Post" className="share-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                        <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                      </svg>
                    </button>
                    <button 
                      className='feed-save-button'
                      onClick={() => savePostHandler(postID)}
                    >
                      {isPostSaved
                        ? <svg aria-label="Remove" className="filled-save-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                            <path d="M20 22a.999.999 0 01-.687-.273L12 14.815l-7.313 6.912A1 1 0 013 21V3a1 1 0 011-1h16a1 1 0 011 1v18a1 1 0 01-1 1z"></path>
                          </svg>
                        :  <svg aria-label="Save" className="save-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                            <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                          </svg>
                      }
                    </button>
                  </div>
                  {likeCount > 0 &&
                    <button 
                      className='like-counter'
                      onClick={() => navigateLikedBy(postID)}
                    >
                      {likeCount === 1
                        ? '1 like'
                        : `${likeCount} likes`
                      }
                    </button>                  
                  }               
                  <div className='feed-post-timestamp'>
                    <time 
                      className='post-time-stamp'
                      title={new Date(uploadDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    >
                      {formatTime()}
                    </time>
                  </div>
                </footer>
                <PostComments
                  w150 = {selectedPost[1].w150}
                  profileTagHandler = {profileTagHandler}
                  isSearchHashTag = {isSearchHashTag}
                  setIsSearchHashTag = {setIsSearchHashTag}
                  setIsSearching={setIsSearching}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  setSearchString={setSearchString}
                  setNewReplyID={setNewReplyID}
                  selectedPost={selectedPost}
                  setReplyUser={setReplyUser}
                  replyUser={replyUser}
                  textareaRef={textareaRef}
                  setCommentText={setCommentText}
                  commentText={commentText}
                  postCommentsRef={postCommentsRef}
                  setSelectedPost={setSelectedPost}
                  newComments={newComments}
                  setNewComments={setNewComments}
                  userData={userData}
                  postID = {postID} 
                />                                                          
              </section>
            </article>
          </section>          
        </main>

      );       
    } else {
      return (
        <article 
          key={postID} 
          className="post-images"
          ref={postReference}
        >
          <div className='profile-images-wrapper-feed'>
            <div className='photo-post-feed'>
              <header className='feed-post-header'>
                <div className='profile-photo-username-wrapper'>
                  <div 
                    className='feed-profile-photo-wrapper'
                    onClick={() => navigateUserProfile(username)}
                    onMouseEnter={() => onMouseEnter(uid, profilePhotoRef.current)}
                    onMouseLeave={onMouseLeave}
                    ref={profilePhotoRef}
                  >
                    <img alt={`${username}'s profile`} src={photoURL} className="feed-profile-photo"/> 
                  </div>
                  <span 
                    className='profile-username-header'
                    onClick={() => navigateUserProfile(username)}
                    onMouseEnter={() => onMouseEnter(uid, usernameHeaderRef.current)}
                    onMouseLeave={onMouseLeave}
                    ref={usernameHeaderRef}
                  >
                    {username}
                  </span>
                  <button 
                    className='post-links-modal'
                    onClick={() => openPostLinksModal(index)}  
                  >
                    <svg aria-label="More options" className="elipsis-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle>
                    </svg>
                  </button>                    
                </div>

              </header>
              <div 
                className='photo-navigation-wrapper'
                style={{ 
                  paddingBottom: `${100 / selectedPost[1].aspectRatio}%`
                }}
                onTouchStart={onDoublePress}
                onTouchMove={movementHandler}
                onTouchEnd={movementEndHandler}
                ref={imageRef}
              >
                {selectedPost[galleryIndex + 1].tags.length !== 0 &&
                  <button 
                    className='post-tag-button'
                    onClick={TagsHandler}
                  >
                    <svg aria-label="Tags" className="tag-button-svg" color="#ffffff" fill="#ffffff" height="12" role="img" viewBox="0 0 24 24" width="12">
                      <path d="M21.334 23H2.666a1 1 0 01-1-1v-1.354a6.279 6.279 0 016.272-6.272h8.124a6.279 6.279 0 016.271 6.271V22a1 1 0 01-1 1zM12 13.269a6 6 0 116-6 6.007 6.007 0 01-6 6z"></path>
                    </svg>
                  </button>                            
                }
                <div 
                  className='photo-frames-wrapper'
                  style={{
                    width: `${(width > 470 ? 470 : width / selectedPost[1].aspectRatio) * photos.length}px`,
                    transform: `translateX(-${movement}px)`,
                    transition: `${isMoving ? 'all .2s ease-in-out' : ''}`
                  }}
                  onDoubleClick={onDoubleClick}
                >
                  {selectedPost.map((photo, photoIndex) => {
                    if ((photoIndex === galleryIndex + 1 || photoIndex === galleryIndex + 2 || photoIndex === galleryIndex) && photoIndex !== 0) {
                      return (
                        <div
                          key={photo.photoID} 
                          className='feed-photo-frame'
                          style={{
                            transform: `translateX(${(width > 470 ? 470 : width) * (photoIndex - 1)}px)`
                          }}
                          onClick={TagsHandler}
                        >
                          <img
                            decoding='sync' 
                            alt={postCaption} 
                            className='feed-photo-post-image' 
                            sizes={`${width > 470 ? '470px' : '100vw'}`}
                            srcSet={`
                              ${photo.w1080} 1080w,
                              ${photo.w750} 750w,
                              ${photo.w640} 640w,
                              ${photo.w480} 480w,
                              ${photo.w320} 320w,
                              ${photo.w240} 240w,
                              ${photo.w150} 150w
                            `}
                          />
                          {!isTagsHidden &&
                            <React.Fragment>
                              {photo.tags.map((tag, index) => {
                                const {
                                  left,
                                  top,
                                  username,
                                  uid,
                                } = tag;
                                return (
                                  
                                  <div 
                                    key={uid}
                                    onClick={() => navigateUserProfile(username)}
                                  >
                                    <Tag
                                      isPost = {true}
                                      isTagsHidden={isTagsHidden}
                                      imageDimensions={imageDimensions}
                                      index={index}
                                      tagData={tags}
                                      key={uid}
                                      imageRef={imageRef}
                                      left={left}
                                      top={top}
                                      username={username}
                                    />                    
                                  </div>
                                )
                              })}                              
                            </React.Fragment>
                          }
                        </div>
                      )
                    }
                  })}                
                </div>
                {isLiked &&
                  <div className='double-click-heart'>
                    <div 
                      className='double-click-heart-sprite'
                      onAnimationEnd={() => setIsLiked(false)}  
                    >
                    </div>
                  </div>                  
                }
                {photos.length > 1 &&
                  <React.Fragment>
                    {galleryIndex !== (photos.length - 1) &&
                      <button 
                        className='next-photo-button'
                        onClick={nextPhotoHandler}
                      >
                        <div className='right-chevron-sprite'>
                        </div>  
                      </button>                  
                    }
                    {galleryIndex > 0 &&
                      <button 
                        className='previous-photo-button'
                        onClick={previousPhotoHandler}
                      >
                        <div className='left-chevron-sprite'>
                        </div>  
                      </button>                    
                    }                      
                  </React.Fragment>
                }     
              </div>
              <footer className='feed-post-footer'>
                {photos.length > 1 && 
                  <div className='slide-indicator-wrapper'>
                    {photos.map((photo, index) => {
                      return (
                        <div key={photo} className={galleryIndex === index ? 'slide-indicator selected' : 'slide-indicator'}></div>
                      )
                    })}
                  </div>                                         
                }
                <div 
                  className={photos.length > 1 ? 'feed-footer-buttons-wrapper gallery' : 'feed-footer-buttons-wrapper'}
                >
                  <button 
                    className='feed-like-button'
                    onClick={likeHandler}
                  >
                    {(!isPostLiked) &&
                      <svg aria-label="Like" className="like-open-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
                      </svg>                      
                    }
                    {(isPostLiked) &&
                      <svg aria-label="Unlike" className={isButtonLiked ? "like-filled-svg animated" : 'like-filled-svg'} color="#ed4956" fill="#ed4956" height="24" role="img" viewBox="0 0 48 48" width="24">
                        <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                      </svg>                      
                    }
                  </button>
                  <button 
                    className='feed-comment-button'
                    onClick={() => navigateComments(postID)}
                  >
                    <svg aria-label="Comment" className="comment-button-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <path d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </button>
                  <button 
                    className='feed-share-button'
                    onClick={() => sendPost(selectedPost)}
                  >
                    <svg aria-label="Share Post" className="share-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                      <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
                    </svg>
                  </button>
                  <button 
                    className='feed-save-button'
                    onClick={() => savePostHandler(postID)}
                  >
                    {isPostSaved
                      ? <svg aria-label="Remove" className="filled-save-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                          <path d="M20 22a.999.999 0 01-.687-.273L12 14.815l-7.313 6.912A1 1 0 013 21V3a1 1 0 011-1h16a1 1 0 011 1v18a1 1 0 01-1 1z"></path>
                        </svg>
                      :  <svg aria-label="Save" className="save-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                          <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                        </svg>
                    }
                  </button>
                </div>
                {likeCount > 0 &&
                  <button 
                    className='like-counter'
                    onClick={() => navigateLikedBy(postID)}
                  >
                    {likeCount === 1
                      ? '1 like'
                      : `${likeCount} likes`
                    }
                  </button>                  
                }
                <div className='post-caption-comments-wrapper'>
                  {postCaption !== '' &&
                    <div className='post-caption-wrapper'>
                      <span 
                        className='caption-username'
                        onClick={() => navigateUserProfile(username)}
                        onMouseEnter={() => onMouseEnter(uid, usernameCommentRef.current)}
                        onMouseLeave={onMouseLeave}
                        ref={usernameCommentRef}
                      >
                        {username}
                      </span>
                      <span>&nbsp;</span>
                      {postCaption.length > 125 &&
                        <span className='post-caption-text'>
                          <span 
                            className='first-caption-section'
                          >
                            {stringToLinks(postCaption.substring(0, 125))}
                          </span>
                          {postHidden &&
                            <React.Fragment>
                              <span className='caption-elipsis'>...</span>
                              <button 
                                className='caption-more-button'
                                onClick={postHiddenToggle} 
                              >more</button> 
                            </React.Fragment>                     
                          }
                          {!postHidden &&
                            <span 
                              className='second-caption-section'
                            >
                              {stringToLinks(postCaption.substring(125))}
                            </span>
                          }
                        </span>                  
                      }
                      {postCaption.length < 125 &&
                        <span 
                          className='post-caption-text' 
                        >
                          {stringToLinks(postCaption)}                  
                        </span>
                      }
                    </div>                    
                  }
                  <div 
                    className='feed-post-comments-wrapper'
                    onClick={() => navigateComments(postID)}
                  >
                    {comments.length !== 0 &&
                      <button className='view-comments-button'>
                        {comments.length === 1
                          ? `View 1 comment`
                          : `View all ${comments.length} comments`
                        }
                      </button>                
                    }
                  </div>
                  {featuredComments.length > 0 &&
                    <ul className='featured-comments-list'>
                      {featuredComments.map((comment, index) => {
                        const {
                          commentID
                        } = comment;
                        return (
                          <li 
                          key={commentID} 
                          className='comment-wrapper'
                          >
                            <Comment
                              w150 = {selectedPost[1].w150}
                              stringToLinks={stringToLinks}
                              isFeatured={true}
                              setIsLikedByModalOpen={setIsLikedByModalOpen}
                              setCommentIDs={setCommentIDs}
                              getPostData={getPostData}
                              isMobile={isMobile}
                              setIsLoadingPage={setIsLoadingPage}
                              isReply={index === 1 ? true : false}
                              parentCommentID={featuredComments[0].commentID}
                              newReplyID={newReplyID}
                              textareaRef={textareaRef}
                              setCommentText={setCommentText}
                              replyUser={replyUser}
                              setReplyUser={setReplyUser}
                              selectedPost={selectedPost}
                              setSelectedPost={setSelectedPost}
                              postID={postID}
                              userData={userData}
                              comment={comment}
                              navigateUserProfile={navigateUserProfile}
                              onMouseEnter={onMouseEnter}
                              onMouseLeave={onMouseLeave}
                            />
                          </li>                          
                        );
                      })}
                    </ul>              
                  }
                  {newComments.length > 0 &&
                    <ul className='new-comments-list'>
                      {newComments.map((comment, index) => {
                        const {
                          username,
                          text,
                          commentID
                        } = comment;
                        return (
                          <li 
                          key={commentID} 
                          className='comment-wrapper'
                          >
                            <Comment
                              w150 = {selectedPost[1].w150}
                              stringToLinks={stringToLinks}
                              isFeatured={true}
                              setIsLikedByModalOpen={setIsLikedByModalOpen}
                              setCommentIDs={setCommentIDs}
                              getPostData={getPostData}
                              isMobile={isMobile}
                              setIsLoadingPage={setIsLoadingPage}
                              isReply={false}
                              newReplyID={newReplyID}
                              textareaRef={textareaRef}
                              setCommentText={setCommentText}
                              replyUser={replyUser}
                              setReplyUser={setReplyUser}
                              selectedPost={selectedPost}
                              setSelectedPost={setSelectedPost}
                              postID={postID}
                              userData={userData}
                              comment={comment}
                              navigateUserProfile={navigateUserProfile}
                              onMouseEnter={onMouseEnter}
                              onMouseLeave={onMouseLeave}
                            />
                          </li>                           
                        )
                      })}
                    </ul>                
                  }
                </div>                  
                <Link to={`/p/${postID}`} className='feed-post-timestamp'>
                  <time 
                    className='post-time-stamp'
                    title={new Date(uploadDate).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  >
                    {formatTime()}
                  </time>
                </Link>
              </footer>
              {width > 736 &&
                <PostComments
                  getPostData = {getPostData}
                  w150 = {selectedPost[1].w150}
                  profileTagHandler = {profileTagHandler}
                  isSearchHashTag = {isSearchHashTag}
                  setIsSearchHashTag = {setIsSearchHashTag}
                  setIsSearching={setIsSearching}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  setSearchString={setSearchString}
                  setNewReplyID={setNewReplyID}
                  selectedPost={selectedPost}
                  setReplyUser={setReplyUser}
                  replyUser={replyUser}
                  textareaRef={textareaRef}
                  setCommentText={setCommentText}
                  commentText={commentText}
                  postCommentsRef={postCommentsRef}
                  setSelectedPost={setSelectedPost}
                  newComments={newComments}
                  setNewComments={setNewComments}
                  userData={userData}
                  postID = {postID} 
                />
              }
            </div>
          </div>
        </article>
      );        
    }
  } else {
    return (
      <div></div>
    )
  }

}

export default MobilePhotoPost;
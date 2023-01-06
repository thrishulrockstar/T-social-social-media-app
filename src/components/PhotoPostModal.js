import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobilePhotoPost from '../pages/MobilePhotoPost';
import './PhotoPostModal.css'

const PhotoPostModal = (props) => {
  const {
    setIsSharePostOpen,
    setPostToSend,
    profileTagHandler,
    setIsCommentDeleteOpen,
    setSelectedComment,
    stringToLinks,
    setCommentIDs,
    setIsLocationPost,
    setIsPostLinksOpen,
    isPostLinksOpen,
    onMouseEnter,
    onMouseLeave,
    setProfileModalData,
    setProfileModalPosts,
    timerRef,
    setProfileModalTimeoutID,
    setProfileModalLocation,
    isMouseHovering,
    setIsMouseHovering,
    getModalProfileData,
    followHandler,
    isFollowLoading,
    unfollowModalHandler,
    allUserProfiles,
    selectedListProfile,
    getUserProfileData,
    backgroundLocation,
    setBackgroundLocation,
    postLinksModalHandler,
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
  const navigate = useNavigate();
  const isModal = true;
  const [isContentClicked, setIsContentClicked] = useState(false);

  useEffect(() => () => {
    console.log('unmount')
    setBackgroundLocation(null);
    setSelectedPost('');
  }, [])

  const closeModal = (event) => {
    event.stopPropagation();
    navigate(-1);
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    }
  }, []);

  const modalContentClickHandler = (event) => {
    event.stopPropagation();
    setIsContentClicked(true);
    setTimeout(() => {
      setIsContentClicked(false);
    }, 300);
  }

  return (
    <div 
      className='photo-post-modal'
      onClick={closeModal}
    >
      <button 
        className='close-modal-button'
        onClick={closeModal}
      >
        <svg aria-label="Close" className="close-upload-modal-svg" color="#ffffff" fill="#ffffff" height="24" role="img" viewBox="0 0 24 24" width="24">
          <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
          <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
        </svg>
      </button>
      <main 
        className='photo-post-modal-content'
        onClick={modalContentClickHandler}
      >
        <MobilePhotoPost
          setPostToSend = {setPostToSend}
          setIsSharePostOpen = {setIsSharePostOpen}
          isContentClicked = {isContentClicked}
          profileTagHandler = {profileTagHandler}
          setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
          setSelectedComment = {setSelectedComment}
          stringToLinks={stringToLinks}
          setCommentIDs={setCommentIDs}
          setIsLocationPost={setIsLocationPost}
          setIsPostLinksOpen={setIsPostLinksOpen}
          isPostLinksOpen={isPostLinksOpen}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          setProfileModalData={setProfileModalData}
          setProfileModalPosts={setProfileModalPosts}
          timerRef={timerRef}
          setProfileModalTimeoutID={setProfileModalTimeoutID}
          setProfileModalLocation={setProfileModalLocation}
          isMouseHovering={isMouseHovering}
          setIsMouseHovering={setIsMouseHovering}
          getModalProfileData={getModalProfileData}
          getUserProfileData={getUserProfileData}
          setBackgroundLocation={setBackgroundLocation}
          postLinksModalHandler={postLinksModalHandler}
          isMobile={isMobile}
          setIsLikedByModalOpen={setIsLikedByModalOpen}
          setSelectedPost={setSelectedPost}
          setDataLoading={setDataLoading}
          index={index}
          setPhotosArray={setPhotosArray}
          photosArray={photosArray}
          getFollowingPosts={getFollowingPosts}
          selectedPost={selectedPost}
          setIsLoadingPage={setIsLoadingPage}
          likeUploadToggle={likeUploadToggle}
          userData={userData}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          unfollowModalHandler={unfollowModalHandler}
          allUserProfiles={allUserProfiles}
          selectedListProfile={selectedListProfile}
          isModal={isModal}
        />
      </main>
    </div>
  );
};

export default PhotoPostModal;
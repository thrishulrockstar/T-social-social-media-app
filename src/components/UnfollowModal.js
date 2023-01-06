import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './UnfollowModal.css';

const UnfollowModal = (props) => {
  const {
    setIsMouseHovering,
    timerRef,
    followHandler,
    unfollowModalHandler,
    profileData,
    selectedListProfile,
  } = props;
  let username;
  let photoURL;
  let userProfile;
  if (selectedListProfile === '') {
    username = profileData.username;
    photoURL = profileData.photoURL;
    userProfile = profileData;
  } else {
    username = selectedListProfile.username;
    photoURL = selectedListProfile.photoURL;
    userProfile = selectedListProfile;    
  }

  const stopBubbles = (event) => {
    event.stopPropagation();
  }

  const onMouseEnter = () => {
    clearTimeout(timerRef.current);
  }

  useEffect(() => () => {
    setIsMouseHovering(false);
  },[]);

  return (
    <div 
      className="profile-photo-modal" 
      onClick={unfollowModalHandler}
      onMouseEnter={onMouseEnter}
    >
    <div className="post-links-content" onClick={stopBubbles}>
      <header className='unfollow-profile-content'>
        <div className='unfollow-profile-photo-frame'>
          <img alt={`${username}'s profile`} className='profile-photo' src={photoURL} />
        </div>
        <span className='unfollow-modal-text'>
          {`Unfollow @${username}?`}
        </span>
      </header>
      <div className="post-links-buttons">
        <button 
          className='unfollow-modal-button'
          onClick={() => followHandler(userProfile)}
        >
          Unfollow
        </button>
        <button className="cancel-button" onClick={unfollowModalHandler}>
          Cancel
        </button>
      </div>
    </div>
  </div>
  )
}

export default UnfollowModal
import './ProfileModal.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FollowButton from './FollowButton';
import { Link, useNavigate } from 'react-router-dom';
import defaultPhoto from '../images/default-profile-image.jpg'

const ProfileModal = (props) => {
  const {
    setIsLoadingPage,
    getUserProfileData,
    timerRef,
    setProfileModalTimeoutID,
    profileModalTimeoutID,
    profileModalLocation,
    isMouseHovering,
    setIsMouseHovering,
    selectedListProfile,
    userData,
    isFollowLoading,
    followHandler,
    unfollowModalHandler,
    setProfileModalData,
    setProfileModalPosts,
    profileModalData,
    profileModalPosts
  } = props;
  const photoWidth = 390 / 3;
  const navigate = useNavigate();

  const {
    username,
    fullname,
    website,
    photoURL,
    followers,
    following,
    uid
  } = profileModalData;
  const followIndex = userData.following.findIndex((follow) => follow.uid === profileModalData.uid);

  useLayoutEffect(() => () => {
    if (profileModalData !== null && profileModalPosts !== null) {
      setProfileModalData(null)
      setProfileModalPosts(null)
    }
  },[]);

  const mouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsMouseHovering(false);
    }, 400);
  }

  const mouseEnter = () => {
    console.log('clear:', timerRef.current);
    clearTimeout(timerRef.current);
    setIsMouseHovering(true);
  }

  const navigateUserProfile = async (username) => {
    setIsLoadingPage(true);
    await getUserProfileData(username);
    navigate(`/${username}`);
    setIsLoadingPage(false);
    setIsMouseHovering(false);
  }

  return (
    <article 
      className='profile-modal'
      onMouseLeave={mouseLeave}
      onMouseEnter={mouseEnter}
      style={{
        top: `${profileModalLocation.y}px`,
        left: `${profileModalLocation.x}px`
      }}
    >
      <header className='profile-modal-header'>
        <div 
          className='profile-photo-frame'
          onClick={() => navigateUserProfile(username)}
        >
          <img alt='' className='profile-photo-image' src={photoURL === '' ? defaultPhoto : photoURL} />
        </div>
        <div className='profile-header-text-wrapper'>
          <span 
            className='profile-header-username'
            onClick={() => navigateUserProfile(username)}
          >
            {username}
          </span>
          <span className='profile-header-fullname'>
            {fullname}
          </span>
          <span className='profile-header-website'>
            {website}
          </span>
        </div>
      </header>
      <section className='profile-numbers'>
        <div className='posts-amount'>
          <span>{profileModalPosts.length}</span>
          <span className='amount-text'>posts</span>
        </div>
        <div className='followers-amount'>
          <span>{followers.length}</span>
          <span className='amount-text'>followers</span>
        </div>
        <div className='following-amount'>
          <span>{following.length}</span>
          <span className='amount-text'>following</span>
        </div>
      </section>
      <main className='three-profile-posts'>
        {profileModalPosts.map((post, index) => {
          if (index > 2) {
            return null;
          };
          const {
            postID,
          } = post[0];
          const {
            photoID,
            aspectRatio,
            captionText,
          } = post[1];
          let photoCenter;
          if (aspectRatio > 1) {
            photoCenter = {
              left: `-${((photoWidth * aspectRatio) - photoWidth) / 2}px`
            }
          } else if (aspectRatio < 1) {
            console.log(aspectRatio, photoWidth);
            photoCenter = {
              top: `-${((photoWidth / aspectRatio) - photoWidth) / 2}px`
            }
          }
          return (
            <Link
              to={`/p/${postID}`} 
              key={photoID} 
              className="profile-modal-photo-post"
              onClick={() => setIsMouseHovering(false)}
            >
              <div className="photo-post-padding">
                <img 
                  decoding='sync'
                  alt={captionText} 
                  className='photo-post-image' 
                  sizes={aspectRatio > 1 ? `${photoWidth * aspectRatio}px` : `${photoWidth}px`} 
                  srcSet={`
                    ${post[1].w1080} 1080w,
                    ${post[1].w750} 750w,
                    ${post[1].w640} 640w,
                    ${post[1].w480} 480w,
                    ${post[1].w320} 320w,
                    ${post[1].w240} 240w,
                    ${post[1].w150} 150w
                  `}
                  style={photoCenter}
                />
              </div>
            </Link>
          );
        })} 
      </main>
      <footer className='profile-modal-follow-buttons'>
        {userData.uid === uid &&
          <button className='edit-profile-button'>
            Edit Profile
          </button>
        }
        {followIndex !== -1 &&
          <button className='message-button'>Message</button>
        }
        <FollowButton 
            selectedListProfile={selectedListProfile}
            userData={userData}
            isFollowLoading={isFollowLoading}
            followHandler={followHandler}
            unfollowModalHandler={unfollowModalHandler}
            user={profileModalData}
        />
      </footer>
    </article>
  );
};

export default ProfileModal;
import { useNavigate } from 'react-router-dom';
import PeopleList from './PeopleList';
import { useEffect } from 'react';

const FollowingModal = (props) => {
  const {
    setBackgroundLocation,
    onMouseEnter,
    onMouseLeave,
    selectedListProfile,
    unfollowModalHandler,
    followHandler,
    userData,
    profileData,
    isFollowLoading,
  } = props;
  const navigate = useNavigate();

  const stopBubbles = (event) => {
    event.stopPropagation();
  }

  useEffect(() => () => {
    setBackgroundLocation(null);
  }, []);

  return (
    <div className="profile-photo-modal" onClick={() => navigate(-1)}>
      <div className="liked-by-content" onClick={stopBubbles}>
        <header className="liked-by-modal-header">
          <h1 className="liked-by-modal-header-text">
            Following
          </h1>
          <button className="liked-by-modal-close-button" onClick={() => navigate(-1)}>
            <svg aria-label="Close" className="close-svg" color="#262626" fill="#262626" height="18" role="img" viewBox="0 0 24 24" width="18">
              <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
            </svg>
          </button>
        </header>
        <section className="liked-profiles-wrapper">
          <PeopleList
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            selectedListProfile={selectedListProfile}
            allUserProfiles={profileData.following}
            userData={userData}
            followHandler={followHandler}
            isFollowLoading={isFollowLoading}
            unfollowModalHandler={unfollowModalHandler}
          /> 
        </section>

      </div>
    </div>
  );
};

export default FollowingModal;
import './HomepageFixedMenu.css';
import PeopleList from './PeopleList';
import useWindowSize from '../hooks/useWindowSize';
import { useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomepageFixedMenu = (props) => {
  const {
    navigateUserProfile,
    setIsMouseHovering,
    onMouseEnter,
    onMouseLeave,
    selectedListProfile,
    userData,
    allUserProfiles,
    followHandler,
    isFollowLoading,
    unfollowModalHandler
  } = props;
  const [width, height] = useWindowSize();
  const [left, setLeft] = useState(0);

  const leftHandler = () => {
    const left = (width / 2) + (470 / 4);
    setLeft(left)
  }

  useLayoutEffect(() => {
    leftHandler();
  }, [width]);

  return (
    <section 
      className='homepage-sidebar-menu'
      style={{
        left: left
      }}  
    >
      <div className='user-profile-header'>
        <div 
          className='sidebar-profile-photo-frame'
          onClick = {() => navigateUserProfile(userData.username)}
        >
          <img alt='' className='user-profile-photo' src={userData.photoURL} />
        </div>
        <div 
          className='user-profile-text'
          onClick = {() => navigateUserProfile(userData.username)}
        >
          <span className='user-username-text'>
            {userData.username}
          </span>
          <span className='user-fullname-text'>
            {userData.fullname}
          </span>
        </div>
        <button className='log-out-button'>
          Log out
        </button>
      </div>
      <header className='profile-suggestions-header'>
        <h1 className='profile-suggestions-header-text'>
          Suggestions For You
        </h1>
        <Link to='/explore/people' className='see-all-suggestions-button'>
          See All
        </Link>
      </header>
      <main className='profile-suggestions-content'>
        <PeopleList
          navigateUserProfile={navigateUserProfile}
          isHomepage = {true}
          setIsMouseHovering={setIsMouseHovering}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          selectedListProfile={selectedListProfile}
          allUserProfiles={allUserProfiles}
          userData={userData}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          unfollowModalHandler={unfollowModalHandler}
        />        
      </main>
    </section>
  )
}

export default HomepageFixedMenu;
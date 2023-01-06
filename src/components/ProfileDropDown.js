import React, { useEffect } from 'react';
import './ProfileDropDown.css';
import firebaseApp from '../Firebase';
import { getAuth, signOut} from "firebase/auth";
import { Link } from 'react-router-dom';

const auth = getAuth(firebaseApp);

const ProfileDropDown = (props) => {
  const { 
    setDropDownOpen,
    setIsProfileAnimating,
    isProfileAnimating,
    openDropDown, 
    userData 
  } = props;

  const logOut = async () => {
    await signOut(auth);
  }

  const animateDropDown = () => {
    if (!isProfileAnimating) {
      setIsProfileAnimating(true);
    };
  };

  const hideDropDown = () => {
    if (isProfileAnimating) {
      setDropDownOpen(false);
    };
  };

  useEffect(() => {
    window.addEventListener('click', animateDropDown);
    return () => {
      window.removeEventListener('click', animateDropDown);
      setIsProfileAnimating(false);
    };
  }, []);

  return (
    <React.Fragment>
    <div 
      className={
        isProfileAnimating
          ? 'profile-drop-down animate'
          : 'profile-drop-down'
      }
      onAnimationEnd = {hideDropDown}
    >
      <div className='drop-down-triangle'></div>
      <div className='profile-buttons-wrapper'>
        <Link to={`/${userData.displayName}/`} className='profile-button'>
          <div className='profile-text-icon'>
            <svg aria-label="Profile" className="profile-drop-down-svg" color="#262626" fill="#262626" height="16" role="img" viewBox="0 0 24 24" width="16">
              <circle cx="12.004" cy="12.004" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2"></circle>
              <path d="M18.793 20.014a6.08 6.08 0 00-1.778-2.447 3.991 3.991 0 00-2.386-.791H9.38a3.994 3.994 0 00-2.386.791 6.09 6.09 0 00-1.779 2.447" fill="none" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2"></path>
              <circle cx="12.006" cy="9.718" fill="none" r="4.109" stroke="currentColor" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="2"></circle>
            </svg>
            <div className='profile-text'>Profile</div>
          </div>
        </Link>
        <Link to={`/${userData.displayName}/saved`} className='saved-button'>
          <div className='saved-text-icon'>
            <svg aria-label="Saved" className="profile-drop-down-svg" color="#262626" fill="#262626" height="16" role="img" viewBox="0 0 24 24" width="16">
              <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
            </svg>
            <div className='saved-text'>
              Saved
            </div>
          </div>
        </Link>
        <Link to='/accounts/edit/' className='settings-button'>
          <div className='settings-text-icon'>
            <svg aria-label="Settings" className="profile-drop-down-svg" color="#262626" fill="#262626" height="16" role="img" viewBox="0 0 24 24" width="16">
              <circle cx="12" cy="12" fill="none" r="8.635" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
              <path d="M14.232 3.656a1.269 1.269 0 01-.796-.66L12.93 2h-1.86l-.505.996a1.269 1.269 0 01-.796.66m-.001 16.688a1.269 1.269 0 01.796.66l.505.996h1.862l.505-.996a1.269 1.269 0 01.796-.66M3.656 9.768a1.269 1.269 0 01-.66.796L2 11.07v1.862l.996.505a1.269 1.269 0 01.66.796m16.688-.001a1.269 1.269 0 01.66-.796L22 12.93v-1.86l-.996-.505a1.269 1.269 0 01-.66-.796M7.678 4.522a1.269 1.269 0 01-1.03.096l-1.06-.348L4.27 5.587l.348 1.062a1.269 1.269 0 01-.096 1.03m11.8 11.799a1.269 1.269 0 011.03-.096l1.06.348 1.318-1.317-.348-1.062a1.269 1.269 0 01.096-1.03m-14.956.001a1.269 1.269 0 01.096 1.03l-.348 1.06 1.317 1.318 1.062-.348a1.269 1.269 0 011.03.096m11.799-11.8a1.269 1.269 0 01-.096-1.03l.348-1.06-1.317-1.318-1.062.348a1.269 1.269 0 01-1.03-.096" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <div className='settings-text'>
              Settings
            </div>
          </div>
        </Link>
        <div className='switch-accounts-button'>
          <div className='switch-accounts-text-icon'>
          <svg aria-label="Switch Accounts" className="profile-drop-down-svg" color="#262626" fill="#262626" height="16" role="img" viewBox="0 0 24 24" width="16">
            <path d="M8 8.363a1 1 0 00-1-1H4.31a8.977 8.977 0 0114.054-1.727 1 1 0 101.414-1.414A11.003 11.003 0 003 5.672V3.363a1 1 0 10-2 0v5a1 1 0 001 1h5a1 1 0 001-1zm14 6.274h-5a1 1 0 000 2h2.69a8.977 8.977 0 01-14.054 1.727 1 1 0 00-1.414 1.414A11.004 11.004 0 0021 18.33v2.307a1 1 0 002 0v-5a1 1 0 00-1-1z"></path>
          </svg>
            <div className='settings-text'>Switch Accounts</div>
          </div>
        </div>
        <hr className='drop-down-divider'/>
        <div className='log-out-button' onClick={logOut}>
          <div className='log-out-text-icon'>
            <div className='log-out-text'>Log Out</div>
          </div>
        </div>
      </div>
      
    </div>      
    </React.Fragment>

  )
};

export default ProfileDropDown;
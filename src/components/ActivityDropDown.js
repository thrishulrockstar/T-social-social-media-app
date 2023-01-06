import './ActivityDropDown.css';
import NotificationPage from '../pages/NotificationPage';
import { useEffect, useState } from 'react';

const ActivtiyDropDown = (props) => {
  const {
    isActivityLoading,
    isActivityAnimating,
    setIsActivityAnimating,
    setIsDropDownOpen,
    selectedListProfile,
    followHandler,
    unfollowModalHandler,
    isFollowLoading,
    userData,
    getNotifications,
    userNotifications,
    setIsNotificationPopUpVisable,
    setIsNotificationsNotRead,
    formatTimeShort
  } = props;

  const animateDropDown = () => {
    console.log('drop down animated')
    if (!isActivityAnimating) {
      setIsActivityAnimating(true);
    };
  };

  const hideDropDown = () => {
    console.log('drop down hidden', isActivityAnimating);
    if (isActivityAnimating) {
      setIsDropDownOpen(false);
    };
  };

  useEffect(() => {
    window.addEventListener('click', animateDropDown);
    return () => {
      window.removeEventListener('click', animateDropDown);
      setIsActivityAnimating(false);
    };
  }, []);

  return (
    <div 
      className={
        isActivityAnimating 
          ? 'activity-drop-down animate' 
          : 'activity-drop-down'
      }
      onAnimationEnd = {hideDropDown}
    >
      <div className='activity-drop-down-triangle'>
      </div>
      <div className='activity-drop-down-wrapper'>
        <NotificationPage 
          isActivityLoading = {isActivityLoading}
          selectedListProfile = {selectedListProfile}
          followHandler = {followHandler}
          unfollowModalHandler = {unfollowModalHandler}
          isFollowLoading = {isFollowLoading}
          userData = {userData}
          getNotifications = {getNotifications}
          userNotifications = {userNotifications}
          setIsNotificationsNotRead = {setIsNotificationsNotRead}
          setIsNotificationPopUpVisable = {setIsNotificationPopUpVisable}
          formatTimeShort = {formatTimeShort}
        />        
      </div>

    </div>
  );
};

export default ActivtiyDropDown;
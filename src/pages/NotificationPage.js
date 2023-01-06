import './NotificationPage.css';
import { Fragment, useEffect, useState } from 'react';
import { getDoc, updateDoc } from 'firebase/firestore';
import Notification from '../components/Notification';

const NotificationPage = (props) => {
  const {
    isActivityLoading,
    getNotifications,
    formatTimeShort,
    setUserNotifications,
    notReadNotifications,
    userNotifications,
    setIsNotificationsNotRead,
    setIsNotificationPopUpVisable,
    userData,
    selectedListProfile,
    followHandler,
    unfollowModalHandler,
    isFollowLoading,
  } = props;

  useEffect(() => {
    setIsNotificationsNotRead(false);
    setIsNotificationPopUpVisable(false);
  },[]);

  useEffect(() => {
    if (userData !== undefined) {
      getNotifications();      
    }
  }, [userData]);
 
  return (
    <main className='notifications'>
      {isActivityLoading &&
        <div className='activity-spinner-wrapper'>
          <svg aria-label="Loading..." className='spinner activity' viewBox="0 0 100 100">
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
      }
      {!isActivityLoading &&
        <ul className='notifications-list'>
          {userNotifications.map((notification, index) => {
            const {
              notificationID
            } = notification;
            return (
              <Fragment key = {notificationID}>
                <Notification
                  index = {index}
                  userNotifications = {userNotifications}
                  userData = {userData}
                  selectedListProfile = {selectedListProfile}
                  followHandler = {followHandler}
                  unfollowModalHandler = {unfollowModalHandler}
                  isFollowLoading = {isFollowLoading}
                  notification = {notification}
                  formatTimeShort = {formatTimeShort}
                />                
              </Fragment>
            );
          })}       
        </ul>      
      }
    </main>
  );
};

export default NotificationPage;
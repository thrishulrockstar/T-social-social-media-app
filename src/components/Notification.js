import './Notification.css';
import FollowButton from './FollowButton';
import { Link } from 'react-router-dom';
import { Fragment, useLayoutEffect, useState } from 'react';

const Notification = (props) => {
  const {
    index,
    userNotifications,
    userData,
    selectedListProfile,
    followHandler,
    unfollowModalHandler,
    isFollowLoading,
    notification,
    formatTimeShort,
  } = props;
  const {
    photoURL,
    username,
  } = notification.profile;
  const {
    type,
    comment,
    date,
    postPhotoURL,
    profile,
    source,
    postID,
    title
  } = notification;
  const [isTitleVisable, setIsTitleVisable] = useState(false);

  useLayoutEffect(() => {
    if (index === 0) {
      return setIsTitleVisable(true);
    }
    if (userNotifications[index - 1].title === title) {
      return setIsTitleVisable(false);
    } else {
      return setIsTitleVisable(true);
    }
  },[userNotifications, index, title]);

  return  (

    <li className='notification'>
      {isTitleVisable &&
        <Fragment>
          {index !== 0 &&
            <hr className='header-border-spacer'></hr>          
          }
          <h2 className='notification-header-text'>
            {title}
          </h2>          
        </Fragment>
      }
      <div className='notification-content'>
        <Link to={`/${username}`}>
          <div className='profile-photo-frame'>
            <img alt='' className='profile-photo' src={photoURL} />
          </div>        
        </Link>
        <div className='notification-text'>
          <Link to={`/${username}`}>
            <span className='notification-username'>
              {username}
            </span>        
          </Link>
          {type === 'comment' &&
            <span className='notification-details'>
              commented: {comment}
            </span>
          }
          {type === 'follow' &&
            <span className='notification-details'>
              started following you.
            </span>
          }
          {type === 'like' && source === 'comment' &&
            <span className='notification-details'>
              liked your comment: {comment}
            </span>
          }
          {type === 'like' && source === 'post' &&
            <span className='notification-details'>
              liked your post.
            </span>
          }
          {type === 'mention' && source === 'post' &&
            <span className='notification-details'>
              mentioned you in a post: {comment}
            </span>
          }
          {type === 'mention' && source === 'comment' &&
            <span className='notification-details'>
              liked your comment: {comment}
            </span>
          }
          {type === 'reply' && source === 'comment' &&
            <span className='notification-details'>
              replied to your comment: {comment}
            </span>
          }
          <time className='notification-time'>
            {formatTimeShort(date)}
          </time>
        </div>
        {type !== 'follow' &&
          <Link to={`/p/${postID}`} className='thumbnail-photo-frame'>
            <div className='thumbnail-photo-padding'>
              <img alt='' className='thumbnail-photo' src={postPhotoURL}/>
            </div>
          </Link>
        }
        {type === 'follow' &&
          <div className='activity-follow-button-wrapper'>
            <FollowButton
              selectedListProfile={selectedListProfile}
              userData={userData}
              followHandler={followHandler}
              unfollowModalHandler={unfollowModalHandler}
              isFollowLoading={isFollowLoading}
              user={profile}
            />            
          </div>
        }        
      </div>

    </li>
  );
};

export default Notification;
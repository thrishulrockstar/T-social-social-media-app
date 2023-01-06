import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ActivityPopUp.css';

const ActivityPopUp = (props) => {
  const {
    setIsNotificationPopUpVisable,
    notificationCount,
  } = props;
  const {
    comment,
    like,
    follow,
  } = notificationCount;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const location = useLocation();
  const timerReference = useRef(null);

  useEffect(() => {
    timerReference.current = setTimeout(() => {
      setIsAnimating(true);
    }, 6000)
  }, []);

  const animationEndHandler = () => {
    if (isAnimating) {
      setIsNotificationPopUpVisable(false);
    };
  };

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
    } else {
      setIsAnimating(true);
      clearTimeout(timerReference.current);
    }
  }, [location]);

  return (
    <div 
      className={isAnimating ? 'activity-pop-up animate' : 'activity-pop-up'}
      onAnimationEnd={animationEndHandler}
    >
      <div className='activity-pop-up-content'>
        <div className='activity-pop-up-triangle'>
        </div>
        {comment !== 0 &&
          <div className='comment-activity'>
            <span className='comment-activity-sprite'>
            </span>          
            <span className='comment-activity-count'>
              {comment}
            </span>
          </div>        
        }
        {like !== 0 &&
          <div className='like-activity'>
            <span className='like-activity-sprite'>
            </span>
            <span className='like-activity-count'>
              {like}
            </span>
          </div>        
        }
        {follow !== 0 &&
          <div className='followers-activity'>
            <span className='followers-activity-sprite'>
            </span>
            <span className='followers-activity-count'>
              {follow}
            </span>
          </div>        
        }

      </div>
    </div>
  );
};

export default ActivityPopUp;
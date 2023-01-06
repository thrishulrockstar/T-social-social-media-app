import { useEffect, useState } from 'react';
import './MessagePopUp.css';

const MessagePopUp = (props) => {
  const {
    copyHandler,
    unsendHandler,
    userData,
    unlikeMessage,
    message,
    likeToggle,
    isPopUpAnimating,
    setIsPopUpOpen,
    setIsPopUpAnimating
  } = props;
  const [isLiked, setIsLiked] = useState(false);

  const animationEndHandler = () => {
    console.log(isPopUpAnimating);
    if (isPopUpAnimating) {
      setIsPopUpOpen(false);
      setIsPopUpAnimating(false);
    }
  }

  useEffect(() => {
    const index = message.likes.findIndex((like) => like.uid === userData.uid);
    if (index !== -1) {
      setIsLiked(true)
    };
  },[message.likes, userData.uid]);

  const windowListenerHandler = () => setIsPopUpAnimating(true);

  useEffect(() => {
    window.addEventListener('click', windowListenerHandler);
    return () => window.removeEventListener('click', windowListenerHandler);
  }, []);

  return (
    <div 
      className={
        isPopUpAnimating 
          ? 'message-pop-up-wrapper animate'
          : 'message-pop-up-wrapper'
        }
      onAnimationEnd={animationEndHandler}
      >
      <div className='message-pop-up'>
        <div className='pop-up-triangle'>
        </div>
        {isLiked 
          ? <button
              className='pop-up-unlike-button'
              onClick={unlikeMessage}
            >
              Unlike
            </button>
          : <button 
              className='pop-up-like-button'
              onClick={() => likeToggle(message)}
            >
              Like
            </button>
        }
        {message.type !== 'heart' &&
          <button 
            className='pop-up-copy-button'
            onClick={copyHandler}
          >
            Copy
          </button>        
        }
        {message.uid === userData.uid &&
          <button 
            className='pop-up-unsend-button'
            onClick={unsendHandler}
          >
            Unsend
          </button>        
        }        
      </div>
    </div>
  );
};

export default MessagePopUp;
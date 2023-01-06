import Emoji from './Emoji';
import { useEffect, useState } from 'react';
import './EmojiModal.css';

const emojis = [
  '0x1F602',
  '0x1F62E',
  '0x1F60D',
  '0x1F622',
  '0x1F44F',
  '0x1F525',
  '0x1F389',
  '0x1F4AF',
  '0x1F970',
  '0x1F618',
  '0x1F62D',
  '0x1F60A'
]

const EmojiModal = (props) => {
  const {
    isContentClicked,
    setIsEmojiOpen,
    insertEmoji
  } = props;
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isContentClicked) {
      setIsAnimating(true);
    };
  }, [isContentClicked]);

  const clickHandler = () => {
    setIsAnimating(true);
  }

  const animationEndHandler = () => {
    if (isAnimating) {
      setIsEmojiOpen(false); 
    }
  }

  useEffect(() => {
    window.addEventListener('click', clickHandler);
    return () => {
      window.removeEventListener('click', clickHandler);
    };
  }, []);
  
  return (
    <div 
      className={
        isAnimating 
        ? 'emoji-modal animate' 
        : 'emoji-modal'
      }
      onAnimationEnd={animationEndHandler}
    >
      <div className='emoji-modal-triangle'>
      </div>
      <div 
        className='emoji-modal-content'
        onClick={(event) => event.stopPropagation()}
      >
        {emojis.map((emoji) => {
          return (
            <button 
              className='emoji-button'
              key={emoji}
              onClick={() => insertEmoji(emoji)}
            >
              <Emoji
                classname = 'emoji-details'
                symbol = {emoji}
                label = 'comment-emoji'
              />              
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default EmojiModal;
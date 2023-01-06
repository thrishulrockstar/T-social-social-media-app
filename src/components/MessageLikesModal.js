import { useEffect } from 'react';
import MessageLikes from './MessageLikes';
import './MessageLikesModal.css';

const MessageLikesModal = (props) => {
  const {
    setIsMessageLikesOpen,
    selectedMessageID,
    messages,
    userData,
  } = props;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    }
  }, []);

  return (
    <div 
      className='message-likes-modal-desktop'
      onClick={() => setIsMessageLikesOpen(false)}
    >
      <div 
        className='message-likes-modal-content'
        onClick={(event) => event.stopPropagation()}
      >
        <header className='message-likes-modal-header'>
          <div className='left-spacer'>
          </div>
          <h1 className='message-likes-modal-header-text'>
            Reactions
          </h1>
          <button 
            className='message-links-close-button'
            onClick={() => setIsMessageLikesOpen(false)}
          >
            <svg aria-label="Close" className='close-button-svg' color="#262626" fill="#262626" height="18" role="img" viewBox="0 0 24 24" width="18">
              <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
            </svg>
          </button>
        </header>
        <MessageLikes
          setIsMessageLikesOpen = {setIsMessageLikesOpen}
          selectedMessageID = {selectedMessageID}
          messages = {messages}
          userData = {userData}
        />
      </div>
    </div>
  );
};

export default MessageLikesModal;
import { useState } from 'react';
import './MessageLikesMobile.css';
import MessageLikes from './MessageLikes';

const MessageLikesMobile = (props) => {
  const {
    userData,
    messages,
    selectedMessageID,
    setIsMessageLikesOpen,
  } = props;
  const [isClosing, setIsClosing] = useState(false);

  const closeModalHandler = () => {
    if (isClosing) {
      setIsMessageLikesOpen(false)
    }
  }

  return (
    <main 
      className='message-likes-modal'
      onClick={() => setIsClosing(true)}
    >
      <div 
        className={
          isClosing 
            ? 'message-likes-content slide-down' 
            : 'message-likes-content'
        }
        onAnimationEnd={closeModalHandler}
        onClick = {(event) => event.stopPropagation()}
      >
        <div className='message-likes-spacer-header'>
          <div className='message-likes-grey-bar'></div>
        </div>
        <h1 className='message-likes-header-text'>
          Reactions
        </h1>
        <MessageLikes
          setIsMessageLikesOpen = {setIsMessageLikesOpen}
          selectedMessageID = {selectedMessageID}
          messages = {messages}
          userData = {userData}
        />
      </div>
    </main>
  );
};

export default MessageLikesMobile;
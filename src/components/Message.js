import { arrayRemove, updateDoc, getFirestore, doc } from 'firebase/firestore';
import React, { Fragment, useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Message.css';
import MessagePopUp from './MessagePopUp';
import MessagePost from './MessagePost';
import defaultProfileImage from "../images/default-profile-image.jpg";

let lastPress = 0;
const db = getFirestore();

const Message = (props) => {
  const {
    copyHandler,
    unsendHandler,
    formatTimeShort,
    setSelectedMessage,
    setIsMessageLinksOpen,
    likeToggle,
    setIsMessageLikesOpen,
    setSelectedMessageID,
    isGroup,
    messages,
    index,
    messagesRef,
    userData,
    message
  } = props;
  const {
    messageID,
    text,
    uid,
    photoURL,
    date,
    username,
    title,
    newUsernames,
    removedUsername,
    type,
    likes,
    isBlob,
    photoURLs,
    photoBlob,
    seenBy,
    seenDate,
  } = message;
  const [time, setTime] = useState(null);
  const [seenTime, setSeenTime] = useState('');
  const [isPhotoHidden, setIsPhotoHidden] = useState(false);
  const [usernames, setUsernames] = useState([]);
  const [isNotification, setIsNotification] = useState(false);
  const [usernameTitle, setUsernameTitle] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const touchTimer = useRef();
  const tagTimerRef = useRef();
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isPopUpAnimating, setIsPopUpAnimating] = useState(false);

  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [seenBy]);

  const formatTime = () => {
    const previousIndex = index - 1
    let timePast;
    if (previousIndex > -1) {
      timePast = date - messages[previousIndex].date;
    }
    if (timePast > 10800000 || index === 0) {
      const currentDate = new Date(Date.now());
      const postDate = new Date(date);
      const currentTime = postDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      }).toLowerCase().split(' ').join('');
      const oneWeek = new Date();
      oneWeek.setDate(oneWeek.getDate() - 7);
      if (postDate > oneWeek) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (currentDate.toDateString() === postDate.toDateString()) {
          return currentTime;
        } else if (yesterday.toDateString() === postDate.toDateString()) {
          return `Yesterday ${currentTime}`
        } else {
          return `${postDate.toLocaleDateString([], {
            weekday: 'long',
          })} ${currentTime}`
        }
      } else {
        return `${postDate.toLocaleDateString([], {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })} ${currentTime}`
      }
    }
  }

  useLayoutEffect(() => {
    if (index === 0) {
      setUsernameTitle(username);
    } else if (messages[index - 1].uid !== uid) {
      setUsernameTitle(username);
    }
    if ((messages.length - 1) === index) {
      setIsPhotoHidden(false);
    } else {
      if (
        messages[index + 1].type === 'group-add-people' || 
        messages[index + 1].type === 'remove-member' || 
        messages[index + 1].type === 'group-name-change' ||
        messages[index + 1].type === 'member-left'
      ) {
        return setIsPhotoHidden(false);
      }; 
      if (messages[index + 1].uid === uid) {
        setIsPhotoHidden(true);
      };      
    };
  }, [messages]);

  useEffect(() => {
    setTime(formatTime);
    if (seenBy.length >= 1 && 
        uid === userData.uid && 
        index === messages.length -1
        ) {
      const date = formatTimeShort(seenDate);
      if (date === 'Now') {
        setSeenTime('Seen just now');
      } else {
        setSeenTime(`Seen ${date} ago`);
      }
    } else {
      setSeenTime('');
    }
  }, [messages])

  useEffect(() => {
    if (type === 'group-add-people') {
      const newArray = [...message.newUsernames]
      newArray.splice(newUsernames.length - 1, 1);
      console.log(newArray)
      setUsernames(newArray);
    }
    if (
      type === 'group-add-people' ||
      type === 'remove-member' ||
      type === 'group-name-change' ||
      type === 'member-left'
    ) {
      setIsNotification(true);
      setUsernameTitle('');
    }
  }, [messages]);

  const likesModalHanlder = (id) => {
    setSelectedMessageID(id);
    setIsMessageLikesOpen(true);
  }

  const touchStart = (message) => {
    setSelectedMessage(message);
    touchTimer.current = setTimeout(() => {
      setIsMessageLinksOpen(true);
    }, 1000);

    if (
      message.type === 'photo' ||
      message.type === 'post' ||
      message.type === 'text' ||
      message.type === 'heart') {
        clearTimeout(tagTimerRef.current);
        const time = new Date().getTime();
        const delta = time - lastPress;

        const DOUBLE_PRESS_DELAY = 400;
        if (delta < DOUBLE_PRESS_DELAY) {
          console.log('double press');
          const index = likes.findIndex((like) => like.uid === userData.uid);
          if (index === -1) {
            likeToggle(message);
            setIsLiked(true);
          }
        } else {
          console.log('press');
        }
        lastPress = time;        
      };
  };

  const unlikeMessage = async () => {
    const index = likes.findIndex((like) => like.uid === userData.uid);
    if (index !== -1) {
      await updateDoc(doc(db, 'messages', messageID), {
        likes: arrayRemove(likes[index])
      });
    }
  }

  const touchEnd = () => {
    clearTimeout(touchTimer.current);
    touchTimer.current = null;
  }

  const popUpToggle = () => {
    setSelectedMessage(message)
    if (isPopUpOpen) {
      setIsPopUpAnimating(true);
    } else {
      setIsPopUpOpen(true);
    }
  }

  return (
    <React.Fragment>
      {time !== undefined &&
        <time className='message-time-stamp'>
          {time}
        </time>           
      }

      {usernameTitle !== '' && uid !== userData.uid && isGroup &&
        <span className='message-username-title'>
          {usernameTitle}
        </span>
      }
      <div className={uid === userData.uid ? 'message-profile-photo-wrapper current-user' : 'message-profile-photo-wrapper'}>
        {!isNotification && uid !== userData.uid &&
          <div className={'message-profile-photo-spacer'}>
            {userData.uid !== uid && !isPhotoHidden &&
              <div className='profile-photo-frame'>
                <img alt='' className='profile-photo' src={photoURL} />
              </div>
            }  
          </div>         
        }
        {uid === userData.uid && 
          (
            message.type === 'photo' ||
            message.type === 'post' ||
            message.type === 'text' ||
            message.type === 'heart'
          ) &&
          <div className='message-links-wrapper right'>
            {isPopUpOpen &&
              <MessagePopUp
                copyHandler = {copyHandler}
                unsendHandler = {unsendHandler}
                userData = {userData}
                unlikeMessage = {unlikeMessage}
                message = {message}
                likeToggle = {likeToggle}
                isPopUpAnimating = {isPopUpAnimating}
                setIsPopUpAnimating = {setIsPopUpAnimating}
                setIsPopUpOpen = {setIsPopUpOpen }
              />            
            }
            <button 
              className={
                isPopUpOpen 
                  ? 'message-links-button selected'
                  : 'message-links-button'
                }
              onClick={popUpToggle}
            >
              <svg aria-label="Unsend" className='message-links-svg' color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                <circle cx="12" cy="12" r="1.5"></circle>
                <circle cx="6" cy="12" r="1.5"></circle>
                <circle cx="18" cy="12" r="1.5"></circle>
              </svg>
            </button>            
          </div>
        }
        {type === 'member-left' &&
          <div 
            key={messageID}
            className='message-content notification'
          >   
            <div className='group-name-change'>
              <span className='username'>
                {username}
              </span>
              <span> 
                left the group
              </span> 
            </div>
          </div>
        }
        {type === 'remove-member' &&
          <div 
            key={messageID}
            className='message-content notification'
          >   
            <div className='group-name-change'>
              <span className='username'>
                {username}
              </span>
              <span> 
                removed
              </span> 
              <span className='first-usernames'>
                {removedUsername}
              </span>
            </div>
          </div>
        }
        {type === 'group-add-people' &&
          <div 
            key={messageID}
            className='message-content notification'
          >   
            <div className='group-add-people'>
              <span className='username'>
                {username}
              </span>
              <span> 
                added
              </span>
              {newUsernames.length > 1 
                ? <span className='first-usernames'>
                    {usernames.join(', ')}
                  </span>
                : <span className='first-usernames'>
                    {newUsernames.join(', ')}
                  </span>
              }
              {newUsernames.length > 1 &&
                <Fragment>
                  <span>
                    and
                  </span>
                  <span className='last-usernames'>
                    {newUsernames[newUsernames.length - 1]}
                  </span>                  
                </Fragment>
              } 
            </div>
          </div>
        }
        {type === 'group-name-change' &&
          <div 
            key={messageID}
            className='message-content notification'
          >   
            <div className='group-name-change'>
              <span className='username'>
                {username}
              </span>
              <span> named the group </span> 
              <span className='new-title'>
                {title}
              </span>
            </div>
          </div>
        }
        {type === 'post' &&
          <div 
            key={messageID}
            className='message-content'
            onTouchStart={() => touchStart(message)}
            onTouchEnd={touchEnd}
          >
            {likes.length !== 0 && 
              <div 
                className='message-like'
                onClick = {() => likesModalHanlder(messageID)}
              >
                ❤️
                {likes.length === 2 &&
                  <Fragment>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[0].photoURL} />
                    </div>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[1].photoURL} />
                    </div>
                  </Fragment>
                }
                {likes.length === 1 && isGroup &&
                  <div className='profile-photo-frame'>
                    <img alt='' className='profile-photo' src={likes[0].photoURL} />
                  </div>
                }
              </div>
            }           
            <MessagePost
              message={message}
            />
          </div>
        }
        {type === 'text' &&
          <div 
            key={messageID}
            className='message-content'
            onTouchStart={() => touchStart(message)}
            onTouchEnd={touchEnd}
          >   
            {likes.length !== 0 && 
              <div 
                className='message-like'
                onClick = {() => likesModalHanlder(messageID)}
              >
                ❤️
                {likes.length === 2 &&
                  <Fragment>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[0].photoURL} />
                    </div>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[1].photoURL} />
                    </div>
                  </Fragment>
                }
                {likes.length === 1 && isGroup &&
                  <div className='profile-photo-frame'>
                    <img alt='' className='profile-photo' src={likes[0].photoURL} />
                  </div>
                }
              </div>
            } 
            <div className='message-content-text'>
              {text}
            </div>
          </div>
        }
        {type === 'heart' &&
          <div 
            key={messageID}
            className='message-content svg'
            onTouchStart={() => touchStart(message)}
            onTouchEnd={touchEnd}
          >
            {likes.length !== 0 && 
              <div 
                className='message-like'
                onClick = {() => likesModalHanlder(messageID)}
              >
                ❤️
                {likes.length === 2 &&
                  <Fragment>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[0].photoURL} />
                    </div>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[1].photoURL} />
                    </div>
                  </Fragment>
                }
                {likes.length === 1 && isGroup &&
                  <div className='profile-photo-frame'>
                    <img alt='' className='profile-photo' src={likes[0].photoURL} />
                  </div>
                }
              </div>
            }    
            <svg aria-label="Like" className="message-heart-svg" color="#ed4956" fill="#ed4956" height="44" role="img" viewBox="0 0 48 48" width="44">
              <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
            </svg>
          </div>
        }
        {type === 'photo' &&
          <div 
            className='message-photo-likes-wrapper'
            onTouchStart={() => touchStart(message)}
            onTouchEnd={touchEnd}
          >
            {likes.length !== 0 && 
              <div 
                className='message-like'
                onClick = {() => likesModalHanlder(messageID)}
              >
                ❤️
                {likes.length === 2 &&
                  <Fragment>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[0].photoURL === '' ? defaultProfileImage : likes[0].photoURL} />
                    </div>
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={likes[1].photoURL === '' ? defaultProfileImage : likes[1].photoURL} />
                    </div>
                  </Fragment>
                }
                {likes.length === 1 && isGroup &&
                  <div className='profile-photo-frame'>
                    <img alt='' className='profile-photo' src={likes[0].photoURL === '' ? defaultProfileImage : likes[0].photoURL} />
                  </div>
                }
              </div>
            }
            <div 
              key={messageID}
              className='message-photo-frame'
            >
              {isLiked &&
                <div className='double-click-heart'>
                  <div 
                    className='double-click-heart-sprite'
                    onAnimationEnd={() => setIsLiked(false)}  
                  >
                  </div>
                </div>                  
              }
              <div 
                className='padding-frame'
                style={
                  isBlob 
                    ? {display: 'flex'} 
                    : {paddingBottom: `${100 / photoURLs.aspectRatio}%`}
                }
              >
                {isBlob &&
                  <img
                  alt=''
                  className='message-photo-blob'
                  src={photoBlob}
                  />
                }
                {!isBlob &&
                  <img 
                    alt=''
                    className='message-photo'
                    sizes='236px'
                    srcSet={`
                      ${photoURLs.w640} 640w,
                      ${photoURLs.w480} 480w,
                      ${photoURLs.w320} 320w,
                      ${photoURLs.w240} 240w,
                      ${photoURLs.w150} 150w
                    `}
                  />                
                }
              </div>            
            </div>
          </div>
        }
        {uid !== userData.uid && 
          (
            message.type === 'photo' ||
            message.type === 'post' ||
            message.type === 'text' ||
            message.type === 'heart'
          ) &&
          <div className='message-links-wrapper left'>
            {isPopUpOpen &&
              <MessagePopUp
                copyHandler = {copyHandler}
                unsendHandler = {unsendHandler}
                userData = {userData}
                unlikeMessage = {unlikeMessage}
                message = {message}
                likeToggle = {likeToggle}
                isPopUpAnimating = {isPopUpAnimating}
                setIsPopUpAnimating = {setIsPopUpAnimating}
                setIsPopUpOpen = {setIsPopUpOpen }
              />            
            }
            <button 
              className={
                isPopUpOpen 
                  ? 'message-links-button selected'
                  : 'message-links-button'
                }
              onClick={popUpToggle}
            >
              <svg aria-label="Unsend" className='message-links-svg' color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                <circle cx="12" cy="12" r="1.5"></circle>
                <circle cx="6" cy="12" r="1.5"></circle>
                <circle cx="18" cy="12" r="1.5"></circle>
              </svg>
            </button>            
          </div>
        }
      </div>
      {seenTime !== '' &&
        <div className='seen-by'>
          <span className='seen-by-text'>
            {seenTime}
          </span>
        </div>          
      }
    </React.Fragment>
  );
};

export default Message;
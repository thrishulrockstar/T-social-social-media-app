import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DirectMessage.css';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, setDoc, doc, limit, startAfter, onSnapshot, getDocs, collection, orderBy, where, updateDoc, query, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import Message from '../components/Message';
import { getDownloadURL, getStorage, uploadBytes, ref } from 'firebase/storage';
import DirectMessageDetailsModal from '../components/DirectMesssageDetailsModal';

const db = getFirestore();
const storage = getStorage();

const DirectMessage = (props) => {
  const {
    copyHandler,
    unsendHandler,
    isMobile,
    isMessageDetailsOpen,
    setIsAddPeopleOpen,
    setSelectedMemberUID,
    setIsMemberModalOpen,
    messageTitle,
    setIsDeleteChatOpen,
    setHideTopNavigation,
    setIsMessageDetailsOpen,
    selectedDirectMessageID,
    formatTimeShort,
    messages,
    setMessages,
    setIsMessageLikesOpen,
    setSelectedMessageID,
    setSelectedDirectMessageID,
    setSelectedMessage,
    setIsMessageLinksOpen,
    setProfilePhotoTitle,
    setMessageTitle,
    userData,
    setIsInboxOpen,
    directMessages,
  } = props;
  const params = useParams();
  const [selectedMessages, setSelectedMessages] = useState(null);
  const [messageString, setMessageString] = useState('');
  const textareaRef = useRef(null);
  const messagesRef = useRef(null);
  const [isGroup, setIsGroup] = useState(false);
  const [firstVisableMessage, setFirstVisableMessage] = useState(null);
  const [lastVisableMessage, setLastVisableMessage] = useState(null);
  const [isLoadingNextMessages, setIsLoadingNextMessages] = useState(false);
  const messagesContentRef = useRef(null);

  useEffect(() => {
    const {
      messageID
    } = params;
    updateNotReadMessages(messageID);
    getMessageHistory(messageID);    
  }, [params.messageID]);

  useEffect(() => {
    const {
      messageID
    } = params;
    if (firstVisableMessage === null) {
      return
    };    
    const currentDate = Date.now();
    const messagesQuery = query(collection(db, 'messages'), 
      where('directMessageID', '==', messageID),
      where('recipientUIDs', 'array-contains', userData.uid),
      where('date', '>', currentDate),
      orderBy('date'),
      );
    const messages = onSnapshot(messagesQuery, (querySnapShot) => {
      setMessages((messages) => {
        const {
          messageID
        } = firstVisableMessage;
        console.log(messageID);
        const historyStartIndex = messages
          .findIndex((message) => message.messageID === messageID);
        console.log(historyStartIndex);
        if (historyStartIndex === -1) {
          return messages
        }
        const messageHistory = []
        console.log(messages, historyStartIndex);
        messages.forEach((message, index) => {
          if (index <= historyStartIndex) {
            messageHistory.push(message);
          };
         });
        console.log(messageHistory);
        const newMessages = [];
        querySnapShot.forEach((document) => {
          newMessages.push(document.data());
        })
        console.log([...messageHistory,...newMessages])
        return [...messageHistory,...newMessages]
      })
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    });      
    return () => {
      messages()
    };    
  }, [params.messageID, firstVisableMessage]);

  const updateNotReadMessages = async (messageID) => {
    console.log('hi')
    const messagesQuery = query(collection(db, 'messages'), 
      where('directMessageID', '==', messageID),
      where('notRead', 'array-contains', userData.uid),
    );
    const notReadSnapshot = await getDocs(messagesQuery);
    console.log(notReadSnapshot.docs.length);
    if (notReadSnapshot.docs.length === 0) {
      return 
    };

    for (let index = 0; index < notReadSnapshot.length; index++) {
      const {
        messageID 
      } = notReadSnapshot[index].data();
      console.log(messageID);
      await updateDoc(doc(db, 'messages', messageID), {
        notRead: arrayRemove(userData.uid),
        seenBy: arrayUnion(userData.uid),
        seenDate: Date.now()
      });
    };
    await updateDoc(doc(db, 'directMessages', messageID), {
      'lastMessage.notRead': arrayRemove(userData.uid)
    });
  };

  const getMessageHistory = async (messageID) => {
    const messagesQuery = query(collection(db, 'messages'), 
      where('directMessageID', '==', messageID),
      where('recipientUIDs', 'array-contains', userData.uid),
      orderBy('date', 'desc'),
      limit(24)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const messagesArray = [];
    messagesSnapshot
      .forEach(
        (document) => 
          messagesArray
            .push(document.data())
      );
    messagesArray
      .sort((a, z) => a.date - z.date);
    setMessages(messagesArray);
    setLastVisableMessage(
      messagesSnapshot.docs[messagesSnapshot.docs.length-1]
    );
    setFirstVisableMessage(
      messagesSnapshot.docs[0].data()
    );
  };

  const getNextMessageHistory = async (messageID) => {
    if (lastVisableMessage === undefined) {
      return console.log('last visable message undefined');
    }
    console.log('nextmessages');
    const lastScrollTop = messagesRef.current.scrollTop;
    setIsLoadingNextMessages(true)
    const messagesQuery = query(collection(db, 'messages'),
      where('directMessageID', '==', messageID),
      where('recipientUIDs', 'array-contains', userData.uid),
      orderBy('date', 'desc'),
      startAfter(lastVisableMessage),
      limit(24)
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const messagesArray = [];
    messagesSnapshot
      .forEach(
        (document) => 
          messagesArray
            .push(document.data())
      );
    messagesArray
      .sort((a, z) => a.date - z.date);
    console.log(messagesArray, messages);
    setMessages(
      [...messagesArray,...messages]
    );
    setLastVisableMessage(
      messagesSnapshot.docs[messagesSnapshot.docs.length-1]
    );
    setIsLoadingNextMessages(false);
    messagesRef.current.scrollTop = lastScrollTop;
  };

  const scrollHandler = () => {
    console.log('scroll handler');
    const {
      scrollTop,
      scrollHeight,
      offsetHeight
    } = messagesRef.current;
    console.log(messagesRef.current.scrollTop, 'height:', messagesRef.current.scrollHeight, 'div height:', messagesRef.current.offsetHeight);
    const {
      messageID
    } = params;
    console.log((scrollTop - offsetHeight) * -1 === scrollHeight)
    if ((scrollTop - offsetHeight) * -1 === scrollHeight && !isLoadingNextMessages) {
      getNextMessageHistory(messageID);
    }
  }

  useEffect(() => {
    setIsInboxOpen(true);
    return () => {
      setIsInboxOpen(false)
      setSelectedMessages(null);
      setMessageTitle('');
      setMessages([]);  
    }
  }, []);

  useEffect(() => {
    setSelectedDirectMessageID(params.messageID);
    return () => {
      setIsMessageDetailsOpen(false);
      setMessages([]);
      setLastVisableMessage(null);
    }
  }, [params.messageID]);

  useEffect(() => {
    if (messagesRef.current === null) {
      return 
    };

    const {
      scrollTop,
      scrollHeight,
      offsetHeight
    } = messagesRef.current;
    const {
      messageID
    } = params;
    if ((scrollTop - offsetHeight) * -1 === scrollHeight && lastVisableMessage !== null) {
      getNextMessageHistory(messageID)
    };
  }, [lastVisableMessage]);

  useLayoutEffect(() => {
    const {
      messageID
    } = params;
    const threadIndex = directMessages.findIndex((message) => message.directMessageID === messageID);
    setSelectedMessages(directMessages[threadIndex]);
    const {
      profiles,
      title,
      isGroup,
    } = directMessages[threadIndex];
    const {
      uid
    } = userData;
    const fullnames = [];
    const photoURLs = [];
    profiles.forEach((profile) => {
      const {
        fullname,
        username,
        photoURL
      } = profile;
      if (profile.uid !== uid) {
        if (fullname === '') {
          fullname.push(username);
        } else {
          fullnames.push(fullname);
        }
        photoURLs.push(photoURL)
      };
    });
    if (photoURLs.length >= 1 && isGroup) {
      const index = profiles.findIndex((profile) => profile.uid === userData.uid);
      photoURLs.push(profiles[index].photoURL);
    };
    let chatTitle;
    if (title === '') {
      if (fullnames.length === 2) {
        chatTitle = fullnames.join(' and ')
      } else if (fullnames.length === 3) {
        fullnames.splice(2, 1, `and ${fullnames[2]}`);
        chatTitle = fullnames.join(', ')
      } else if (fullnames.length > 3) {
        const overflow = fullnames.length - 3;
        const newFullnames = [...fullnames]
        newFullnames.splice(3, overflow, `and ${overflow} ${
          overflow === 1 
            ? 'other' 
            : 'others'
        }`);
        chatTitle = newFullnames.join(', ');
      } else if (fullnames.length === 0) {
        chatTitle = 'Just You'
      } else {
        chatTitle = fullnames.join(', ');
      };
    } else {
      chatTitle = title;
    };
    setMessageTitle(chatTitle)
    setProfilePhotoTitle(photoURLs);
    setIsGroup(isGroup);
  }, [directMessages.UIDs, params.messageID]);

  const messageStringHandler = (event) => {
    const { value } = event.target;
    setMessageString(value);
  }

  // changes textarea size to scroll height

  useEffect(() => {
      textareaRef.current.style.height = '1px'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;     
  }, [messageString]);

  const sendMessage = async (event) => {
    event.preventDefault();
    setMessageString('');
    const {
      directMessageID,
      UIDs,
    } = selectedMessages;
    const {
      username,
      fullname,
      photoURL,
      uid,
    } = userData;
    const notRead = [];
    UIDs.forEach((UID) => {
      if (UID !== uid) {
        notRead.push(UID);
      };
    });
    const messageID = uuidv4();
    const message = {
      likes: [],
      recipientUIDs: UIDs,
      notRead,
      seenBy: [],
      messageID: messageID,
      directMessageID: directMessageID,
      username: username,
      fullname: fullname,
      photoURL: photoURL,
      uid: uid,
      type: 'text',
      text: messageString,
      date: Date.now(),
    }
    await updateDoc(doc(db, 'directMessages', directMessageID), {
      lastMessage: message,
      date: Date.now(),
    });
    await setDoc(doc(db, 'messages', messageID), message);
  }

  const sendHeart = async (event) => {
    event.preventDefault();
    const {
      directMessageID,
      UIDs,
    } = selectedMessages;
    const {
      username,
      fullname,
      photoURL,
      uid
    } = userData;
    const messageID = uuidv4();
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.type === 'heart' && lastMessage.uid === uid) {
      return null 
    } else {
      await updateDoc(doc(db, 'directMessages', directMessageID), {
        date: Date.now(),
      });
      await setDoc(doc(db, 'messages', messageID), {
        likes: [],
        recipientUIDs: UIDs,
        notRead: UIDs,
        seenBy: [],
        messageID: messageID,
        directMessageID: directMessageID,
        username: username,
        fullname: fullname,
        photoURL: photoURL,
        uid: uid,
        type: 'heart',
        date: Date.now(),
      });
    };
  };

  const likeToggle = async (message) => {
    const documentRef = doc(db, 'messages', message.messageID);
    const {
      fullname,
      username,
      uid,
      photoURL,
    } = userData;
    const likeID = uuidv4();
    await updateDoc(documentRef, {
      likes: arrayUnion({
        likeID: likeID,
        fullname: fullname,
        username: username,
        uid: uid,
        photoURL: photoURL,
        date: Date.now()
      })
    })    
  };

  const photoUploadHandler = (event) => {
    const {
      UIDs,
      directMessageID
    } = selectedMessages;
    const {
      username,
      fullname,
      photoURL,
      uid
    } = userData;
    const file = event.target.files[0];
    if (file) {
      const photo = URL.createObjectURL(file);
      const photoMessageID = uuidv4();
      sharePhotoUpload(photo, photoMessageID);
      const placeholderPost = {
        likes: [],
        recipientUIDs: UIDs,
        notRead: UIDs,
        seenBy: [],
        messageID: photoMessageID,
        directMessageID: directMessageID,
        username: username,
        fullname: fullname,
        photoURL: photoURL,
        uid: uid,
        type: 'photo',
        isBlob: true,
        photoBlob: photo,
        date: Date.now()
      }
      console.log(messages);
      setMessages([...messages, placeholderPost]);
    };
    event.target.value = null;
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const sharePhotoUpload = async (photo, photoMessageID) => {
    const messageID = photoMessageID;
    const {
      UIDs,
      directMessageID
    } = selectedMessages;
    const {
      username,
      fullname,
      photoURL,
      uid
    } = userData;
    const resizedPhotos = await resizePhoto(photo);
    const {
      photoID,
      aspectRatio,
      w640,
      w480,
      w320,
      w240,
      w150,
    } = resizedPhotos;
    const w640Ref = ref(storage, `w640_photoUploads/${photoID}.jpg`);
    const w480Ref = ref(storage, `w480_photoUploads/${photoID}.jpg`);
    const w320Ref = ref(storage, `w320_photoUploads/${photoID}.jpg`);
    const w240Ref = ref(storage, `w240_photoUploads/${photoID}.jpg`);
    const w150Ref = ref(storage, `w150_photoUploads/${photoID}.jpg`);
    
    const w640Upload = await uploadBytes(w640Ref, w640);
    const w640URL = await getDownloadURL(
      ref(storage, w640Upload.metadata.fullPath)
    );
    const w480Upload = await uploadBytes(w480Ref, w480);
    const w480URL = await getDownloadURL(
      ref(storage, w480Upload.metadata.fullPath)
    );
    const w320Upload = await uploadBytes(w320Ref, w320);
    const w320URL = await getDownloadURL(
      ref(storage, w320Upload.metadata.fullPath)
    );
    const w240Upload = await uploadBytes(w240Ref, w240);
    const w240URL = await getDownloadURL(
      ref(storage, w240Upload.metadata.fullPath)
    );
    const w150Upload = await uploadBytes(w150Ref, w150);
    const w150URL = await getDownloadURL(
      ref(storage, w150Upload.metadata.fullPath)
    );
    const photoURLs = {
      photoID: photoID,
      messageID: messageID,
      aspectRatio: aspectRatio,
      w640: w640URL,
      w480: w480URL,
      w320: w320URL,
      w240: w240URL,
      w150: w150URL,
      date: Date.now()
    };
    const message = {
      likes: [],
      recipientUIDs: UIDs,
      notRead: UIDs,
      seenBy: [],
      messageID: messageID,
      directMessageID: directMessageID,
      username: username,
      fullname: fullname,
      photoURL: photoURL,
      uid: uid,
      isBlob: false,
      type: 'photo',
      photoURLs: photoURLs,
      date: Date.now(),
    }
    await updateDoc(doc(db, 'directMessages', directMessageID), {
      lastMessage: message,
      date: Date.now(),
    });
    await setDoc(doc(db, 'messages', messageID), message);
  };

  const resizePhoto = async (photo) => {
    const image = new Image();
    image.src = photo;
    return new Promise((resolve) => {
      let resizedPhotos = {
        photoID: uuidv4()
      };
      image.onload = async () => {
        resizedPhotos = {
          ...resizedPhotos, 
          aspectRatio: (image.naturalWidth / image.naturalHeight)
        };
        const w640 = await photoUploadResize(image, 640);
        resizedPhotos = {...resizedPhotos, w640: w640};
        const w480 = await photoUploadResize(image, 480);
        resizedPhotos = {...resizedPhotos, w480: w480};
        const w320 = await photoUploadResize(image, 320);
        resizedPhotos = {...resizedPhotos, w320: w320};
        const w240 = await photoUploadResize(image, 240);
        resizedPhotos = {...resizedPhotos, w240: w240};
        const w150 = await photoUploadResize(image, 150);
        resizedPhotos = {...resizedPhotos, w150: w150};
        resolve({
          ...resizedPhotos
        });
      };
    });
  };

  const photoUploadResize = (img, width) => {
    return new Promise((resolve) => {
      var canvas = document.createElement('canvas'),
          ctx = canvas.getContext("2d"),
          oc = document.createElement('canvas'),
          octx = oc.getContext('2d');
   
      canvas.width = width; // destination canvas size
      canvas.height = canvas.width * img.height / img.width;
   
      var cur = {
        width: Math.floor(img.width * 0.5),
        height: Math.floor(img.height * 0.5)
      }
   
      oc.width = cur.width;
      oc.height = cur.height;
   
      octx.drawImage(img, 0, 0, cur.width, cur.height);
   
      while (cur.width * 0.5 > width) {
        cur = {
          width: Math.floor(cur.width * 0.5),
          height: Math.floor(cur.height * 0.5)
        };
        octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height);
      }
   
      ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const image = new Image();
        image.src = blob;
        resolve(blob);
      });
    });
  };

  return (

    <main className='direct-message'>
      {isMessageDetailsOpen &&
        <DirectMessageDetailsModal
          isMobile = {isMobile}
          setIsAddPeopleOpen={setIsAddPeopleOpen}
          setSelectedMemberUID={setSelectedMemberUID}
          setIsMemberModalOpen={setIsMemberModalOpen}
          messageTitle={messageTitle}
          setMessageTitle={setMessageTitle}
          setIsDeleteChatOpen={setIsDeleteChatOpen}
          userData={userData}
          setHideTopNavigation = {setHideTopNavigation}
          directMessages={directMessages}
          setIsMessageDetailsOpen={setIsMessageDetailsOpen}
          selectedDirectMessageID={selectedDirectMessageID}
        />        
      }
      <div 
        className='messages-wrapper'
        ref={messagesRef}
        onScroll={scrollHandler}
      >
        <div 
          className='messages-content'
          ref={messagesContentRef}
        >
          {messages.map((message, index) => {
            const className = ['message'];
            if (message.uid === userData.uid) {
              className.push('user');
            }
            if (
              message.type === 'photo' ||
              message.type === 'post' ||
              message.type === 'text' ||
              message.type === 'heart') {
                if (message.likes.length !== 0) {
                  className.push('liked');
                };                
              } 
            return (
              <div 
                key={message.messageID}
                className={className.join(' ')}
                onContextMenu={(event) => event.preventDefault()}
              >
                <Message
                  copyHandler = {copyHandler}
                  unsendHandler = {unsendHandler}
                  formatTimeShort = {formatTimeShort}
                  setSelectedMessage = {setSelectedMessage}
                  setIsMessageLinksOpen = {setIsMessageLinksOpen}
                  likeToggle = {likeToggle}
                  setSelectedMessageID = {setSelectedMessageID}
                  setIsMessageLikesOpen = {setIsMessageLikesOpen}
                  isGroup={isGroup}
                  index={index}
                  messages={messages}
                  messagesRef={messagesRef}
                  userData={userData}
                  message={message}
                />
              </div>
            )
          })}
        </div>        
      </div>
      <form className='direct-message-inputs'>
        <div className='direct-message-inputs-wrapper'>
          <textarea
            placeholder='Message...'
            className='direct-message-input'
            type='text'
            onChange={messageStringHandler}
            value={messageString}
            ref={textareaRef}
          >
          </textarea>
          {messageString !== ''
            ? <button 
                className='send-message-button'
                onClick={sendMessage}
              >
                Send
              </button>
            : <React.Fragment>   
                <button 
                  className='direct-message-add-photo-button'
                  type='button'
                >
                  <label htmlFor='message-photo-upload'>
                    <svg aria-label="Add Photo or Video" className="add-image-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <path d="M6.549 5.013A1.557 1.557 0 108.106 6.57a1.557 1.557 0 00-1.557-1.557z" fillRule="evenodd"></path>
                      <path d="M2 18.605l3.901-3.9a.908.908 0 011.284 0l2.807 2.806a.908.908 0 001.283 0l5.534-5.534a.908.908 0 011.283 0l3.905 3.905" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                      <path d="M18.44 2.004A3.56 3.56 0 0122 5.564h0v12.873a3.56 3.56 0 01-3.56 3.56H5.568a3.56 3.56 0 01-3.56-3.56V5.563a3.56 3.56 0 013.56-3.56z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </label>                     
                </button>   
                <input 
                  accept='image/jpeg,image/png' 
                  className='message-photo-upload'
                  id='message-photo-upload' 
                  type='file'
                  onChange={photoUploadHandler}
                />                    
                <button 
                  className='direct-message-like-button'
                  type='button'
                  onClick={sendHeart}
                >
                  <svg aria-label="Like" className="message-like-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
                  </svg>
                </button>
              </React.Fragment>
          }
        </div>
      </form>
    </main>
  );
};

export default DirectMessage;
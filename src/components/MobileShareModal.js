import './MobileShareModal.css';
import NewMessage from '../pages/NewMessage';
import { useEffect, useLayoutEffect, useState } from 'react';
import { getFirestore, collection, where, query, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';
import firebaseApp from '../Firebase';
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore();

const MobileShareModal = (props) => {
  const {
    isMobile,
    isSharePostOpen,
    getAllDirectMessages,
    allMessages,
    showNotification,
    postToSend,
    directMessages,
    setIsSharePostOpen,
    setIsInboxOpen,
    userData,
    recipientSelection,
    setRecipientSelection,
    setSearchString,
    searchString,
    searchResults,
  } = props;
  const [sharePostText, setSharePostText] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    }
  }, []);

  useLayoutEffect(() => {
    return () => {
      setIsInboxOpen(false);
    }
  }, [])

  const sharePostTextHandler = (event) => {
    const {
      value
    } = event.target;
    setSharePostText(value);
  }

  const sharePost = async () => {
    setIsSharePostOpen(false);
    const {
      username,
      fullname,
      photoURL,
      uid,
    } = userData;
    console.log(recipientSelection);
    for (let i = 0; i < recipientSelection.length; i++) {
      const UIDs = [];
      const profiles = [];
      recipientSelection[i].forEach((recipient) => {
        UIDs.push(recipient.uid);
        profiles.push(recipient);
      });
      UIDs.sort();
      const copyCheck = query(collection(db, 'directMessages'), 
        where('UIDs', '==', UIDs));
      const copyCheckSnap = await getDocs(copyCheck);
      const docs = [];
      copyCheckSnap.forEach((doc) => {
        docs.push(doc.data());
      })
      console.log(docs);
      let directMessageID;
      console.log(docs.length);
      if (docs.length === 1) {
        directMessageID = docs[0].directMessageID;
      } else {
        directMessageID = uuidv4();
        const UIDs = [uid];
        recipientSelection[i].forEach((recipient) => {
          if (recipient.uid !== uid) {
            UIDs.push(recipient.uid);
          };
        });
        UIDs.sort();     
        await setDoc(doc(db, 'directMessages', directMessageID), {
          directMessageID: directMessageID,
          isGroup: UIDs.length > 2 ? true : false,
          UIDs: UIDs,
          profiles,
          adminUIDs: [uid],
          title: '',
          date: Date.now(),
        });
      };
      const firstID = uuidv4();
      const notRead = UIDs.filter((uid) => uid !== userData.uid);
      const post = {
        likes: [],
        recipientUIDs: UIDs,
        notRead: notRead,
        seenBy: [],
        messageID: firstID,
        directMessageID: directMessageID,
        username: username,
        fullname: fullname,
        photoURL: photoURL,
        uid: uid,
        type: 'post',
        post: postToSend,
        date: Date.now(),
      }
      const secondID = uuidv4();
      const textPost = {
        likes: [],
        messageID: secondID,
        recipientUIDs: UIDs,
        notRead: notRead,
        seenBy: [],
        directMessageID: directMessageID,
        username: username,
        fullname: fullname,
        photoURL: photoURL,
        uid: uid,
        type: 'text',
        text: sharePostText,
        date: Date.now(),
      }     
      if (sharePostText === '') {
        await setDoc(doc(db, 'messages', firstID), post);
        await updateDoc(doc(db, 'directMessages', directMessageID), {
          lastMessage: post,
          date: Date.now(),
        });         
      } else {
        await setDoc(doc(db, 'messages', firstID), post);
        await setDoc(doc(db, 'messages', secondID), textPost);
        await updateDoc(doc(db, 'directMessages', directMessageID), {
          lastMessage: textPost,
          date: Date.now(),
        }); 
      };
    };
    showNotification('Sent')
  };

  return (
    <main className={isMobile ? 'mobile-share-modal' : 'mobile-share'}>
      <header className='mobile-share-modal-header'>
        <div className='mobile-share-spacer'>
        </div>
        <h1 className='mobile-share-header-text'>
          Share
        </h1>
        <button 
          className='close-share-modal'
          onClick={() => setIsSharePostOpen(false)}
        >
          <svg aria-label="Close" className="close-share-modal-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line>
          </svg>
        </button>
      </header>
      <NewMessage
        isSharePostOpen={isSharePostOpen}
        allMessages={allMessages}
        sharePostText = {sharePostText}
        sharePostTextHandler = {sharePostTextHandler}
        isModal={true}
        sharePost={sharePost}
        directMessages={directMessages}
        setIsInboxOpen={setIsInboxOpen}
        userData={userData}
        recipientSelection={recipientSelection}
        setRecipientSelection={setRecipientSelection}
        setSearchString={setSearchString}
        searchString = {searchString}
        searchResults = {searchResults}
      />
    </main>
  );
};

export default MobileShareModal;
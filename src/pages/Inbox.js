import { Fragment, useEffect, useState } from 'react';
import DirectMessageInboxCard from '../components/DirectMessageInboxCard';
import { updateDoc, arrayRemove, getFirestore, query, collection, where, orderBy, getDocs, onSnapshot, getDoc, doc} from 'firebase/firestore';
import './Inbox.css';

const db = getFirestore();

const Inbox = (props) => {
  const {
    setDirectMessages,
    directMessages,
    isGettingDirectMessages,
    formatTimeShort,
    userData,
    setIsInboxOpen,
  } = props;

  useEffect(() => { 
    setIsInboxOpen(true);
    return () => setIsInboxOpen(false);
  }, []);

  useEffect(() => {
    console.log(userData.uid);
    if (userData.uid === undefined) {
      return null;
    };
    const {
      uid
    } = userData;
    const allDirectMessagesQuery = query(collection(db, 'directMessages'), 
      where('UIDs', 'array-contains', uid), orderBy('date', 'desc'));
    const listener = onSnapshot(allDirectMessagesQuery, (collection) => {
      console.log('listening');
      const documentArray = [];
      collection.forEach((document) => {
        documentArray.push(document.data());
      });
      setDirectMessages(documentArray);
    });
    return () => {
      console.log('listener closed');
      listener();
    } 
  }, [userData]);

  return (
    <main className='direct-inbox'>
      {directMessages.length !== 0 &&
        <ul className='direct-inbox-messages'>
          {directMessages.map((directMessage) => {
            const {
              directMessageID
            } = directMessage;
            return (
              <Fragment key={directMessageID}>
                <DirectMessageInboxCard
                  isGettingDirectMessages={isGettingDirectMessages}
                  directMessages={directMessages}
                  formatTimeShort={formatTimeShort}
                  userData = {userData}
                  directMessage={directMessage}
                />              
              </Fragment>
            )              
          })}
        </ul>      
      }
    </main>
  )
};

export default Inbox;
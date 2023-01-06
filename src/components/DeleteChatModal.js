import './DeleteChatModal.css';
import firebaseApp from '../Firebase';
import { getFirestore, setDoc, doc, query, collection, where, getDocs, getDoc, updateDoc, arrayRemove, deleteDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

const db = getFirestore();

const DeleteChatModal = (props) => {
  const {
    directMessages,
    setIsMessageDetailsOpen,
    userData,
    setIsDeleteChatOpen,
    selectedDirectMessageID,
  } = props;
  const navigate = useNavigate();
  const [isDeleteing, setIsDeleteing] = useState(false);

  const deleteChat = async () => {
    setIsDeleteing(true)
    const index = directMessages.findIndex((messages) => messages.directMessageID === selectedDirectMessageID);
    const {
      profiles,
      directMessageID
    } = directMessages[index];
    const profileIndex = profiles.findIndex((profile) => profile.uid === userData.uid);

    const messagesQuery = query(collection(db, 'messages'), 
      where('directMessageID', '==', selectedDirectMessageID),
      where('recipientUIDs', 'array-contains', userData.uid),
      );
    const messageSnapShot = await getDocs(messagesQuery);
    messageSnapShot.forEach( async (document) => {
      const {
        messageID
      } = document.data();
      console.log(messageID);
      const documentRef = doc(db, 'messages', messageID);
      const documentSnapShot = await getDoc(documentRef);
      if (documentSnapShot.exists()) {
        if (documentSnapShot.data().recipientUIDs.length === 1) {
          await deleteDoc(documentRef);
        } else {
          await updateDoc(documentRef, {
            recipientUIDs: arrayRemove(userData.uid)
          });          
        };
      };
    });
    await updateDoc(doc(db, 'directMessages', directMessageID), {
      'lastMessage.recipientUIDs': arrayRemove(userData.uid)
    })

    if (directMessages[index].isGroup === true) {
      const docRef = doc(db, 'directMessages', selectedDirectMessageID)
      await updateDoc(docRef, {
        profiles: arrayRemove(profiles[profileIndex]),
        UIDs: arrayRemove(userData.uid),
        adminUIDs: arrayRemove(userData.uid)
      })
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const {
          UIDs,
          adminUIDs
        } = docSnap.data();
        if (UIDs.length === 0) {
          await deleteDoc(docRef);
        } else if (adminUIDs.length === 0) {
          await updateDoc(docRef, {
            adminUIDs: arrayUnion(UIDs[0])
          });
        } else {
          const messageID = uuidv4();
          const {
            username,
            fullname,
            photoURL,
            uid,
          } = userData;
          await setDoc(doc(db, 'messages', messageID), {
            recipientUIDs: UIDs,
            notRead: UIDs,
            seenBy: [],
            messageID: messageID,
            directMessageID: selectedDirectMessageID,
            username: username,
            fullname: fullname,
            photoURL: photoURL,
            uid: uid,
            type: 'member-left',
            date: Date.now() 
          });            
        };
      };
    }; 
    setIsMessageDetailsOpen(false);
    setIsDeleteing(false);
    setIsDeleteChatOpen(false);
    navigate('/direct/inbox/');
  };

  return(
    <div 
      className="profile-photo-modal"
      onClick={() => setIsDeleteChatOpen(false)}
    >
      <div 
        className="post-links-content" 
        onClick={(event) => event.stopPropagation()}
      >
        <div className="post-links-buttons">
          <div className="discard-post-modal-text">
            <h1 className="discard-modal-title-text">
              Delete Chat?
            </h1>
            <div className="discard-modal-text">
              Deleting removes the chat from your inbox, but no one else's inbox.
            </div>
          </div>
          <button 
            className="discard-modal-button"
            onClick={deleteChat} 
          >
            Delete
          </button>
          <button 
            className="discard-modal-cancel-button"
            onClick={() => setIsDeleteChatOpen(false)} 
          >
            Cancel
          </button>
        </div>
      </div>
  </div>
  );
};

export default DeleteChatModal;
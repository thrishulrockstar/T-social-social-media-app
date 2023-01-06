import { updateDoc, getFirestore, doc, setDoc, arrayRemove, getDoc, arrayUnion, } from 'firebase/firestore';
import './DirectMessageMemberModal.css';
import { v4 as uuidv4 } from 'uuid';
import { useLayoutEffect, useState } from 'react';

const db = getFirestore();

const DirectMessageMemberModal = (props) => {
  const {
    setIsMemberModalOpen,
    selectedMemberUID,
    selectedDirectMessageID,
    directMessages,
    userData,
  } = props;
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useLayoutEffect(() => {
    const index = directMessages.findIndex((message) => message.directMessageID === selectedDirectMessageID);
    const { adminUIDs } = directMessages[index];
    const profileIndex = adminUIDs.findIndex((uid) => uid === selectedMemberUID);
    if (profileIndex !== -1) {
      setIsUserAdmin(true);
    } else {
      setIsUserAdmin(false);
    };
  }, [])

  const adminToggle = async () => {
    const index = directMessages.findIndex((message) => message.directMessageID === selectedDirectMessageID);
    const { adminUIDs } = directMessages[index];
    const adminIndex = adminUIDs.findIndex((uid) => uid === selectedMemberUID);
    console.log(adminIndex, selectedMemberUID)
    if (adminIndex === -1) {
      await updateDoc(doc(db, 'directMessages', selectedDirectMessageID), {
        adminUIDs: arrayUnion(selectedMemberUID)
      });      
    } else {
      await updateDoc(doc(db, 'directMessages', selectedDirectMessageID), {
        adminUIDs: arrayRemove(selectedMemberUID)
      });      
    };
    setIsMemberModalOpen(false);   
  };

  const removeMember = async () => {
    const index = directMessages.findIndex((message) => message.directMessageID === selectedDirectMessageID);
    const { profiles } = directMessages[index];
    const profileIndex = profiles.findIndex((profile) => profile.uid === selectedMemberUID);
    const messageRef = doc(db, 'directMessages', selectedDirectMessageID)
    await updateDoc(messageRef, {
      UIDs: arrayRemove(selectedMemberUID),
      profiles: arrayRemove(profiles[profileIndex]),
      adminUIDs: arrayRemove(selectedMemberUID)
    });
    let UIDs;
    const messageSnap = await getDoc(messageRef);
    if (messageSnap.exists()) {
      UIDs = messageSnap.data().UIDs;
    };
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
       type: 'remove-member',
       removedUsername: profiles[profileIndex].username,
       date: Date.now() 
    });
    setIsMemberModalOpen(false);
  };

  return (
    <div 
      className="profile-photo-modal" 
      onClick={() => setIsMemberModalOpen(false)}
    >
        <div 
          className="post-links-content" 
          onClick={(event) => event.stopPropagation()}
        >
          <div className="post-links-buttons">
            <button 
              className='remove-from-group-button'
              onClick={removeMember}
            >
              Remove From Group
            </button>            
            <button 
              className="make-admin-button"
              onClick={adminToggle}
            >
              {isUserAdmin ? 'Remove as Admin' : 'Make Admin'}
            </button>                 
            <button 
              className="cancel-button"
              onClick={() => setIsMemberModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>      
    </div>
  )
};

export default DirectMessageMemberModal;
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import firebaseApp from '../Firebase';
import './MessageLinksModal.css';

const db = getFirestore();
const storage = getStorage();

const MessageLinksModal = (props) => {
  const {
    unsendHandler,
    copyHandler,
    userData,
    selectedMessage,
    setIsMessageLinksOpen
  } = props;

  const stopBubbles = (event) => {
    event.stopPropagation();
  }

  return (
    <div 
      className="profile-photo-modal" 
      onClick={() => setIsMessageLinksOpen(false)}
    >
        <div 
          className="post-links-content" 
          onClick={stopBubbles}
        >
          <div className="post-links-buttons">
            {selectedMessage.type !== 'heart' &&
              <button 
                className='copy-message-button'
                onClick={copyHandler}
              >
                Copy
              </button>            
            }
            {selectedMessage.uid === userData.uid &&
              <button 
                className="unsend-message-button"
                onClick={unsendHandler}
              >
                Unsend
              </button>                 
            }
            <button 
              className="cancel-button"
              onClick={() => setIsMessageLinksOpen(false)} 
            >
              Cancel
            </button>
          </div>
        </div>      
    </div>
  )
};

export default MessageLinksModal;
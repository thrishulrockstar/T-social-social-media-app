import { updateDoc, doc, getFirestore, setDoc } from 'firebase/firestore';
import { useLayoutEffect, useState } from 'react';
import './DirectMessageDetailsModal.css';
import { v4 as uuidv4 } from 'uuid';
import defaultProfileImage from "../images/default-profile-image.jpg";

const db = getFirestore();

const DirectMessageDetailsModal = (props) => {
  const {
    isMobile,
    setIsAddPeopleOpen,
    setSelectedMemberUID,
    setIsMemberModalOpen,
    setMessageTitle,
    messageTitle,
    setIsDeleteChatOpen,
    userData,
    setHideTopNavigation,
    selectedDirectMessageID,
    setIsMessageDetailsOpen,
    directMessages,
  } = props;
  const [members, setMemebers] = useState([]);
  const [UIDs, setUIDs] = useState([]); 
  const [titleString, setTitleString] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [adminUIDs, setAdminUIDs] = useState([]);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  const textInputHandler = (event) => {
    const {
      value
    } = event.target;
    setTitleString(value);
  }

  useLayoutEffect(() => {
    const index = directMessages.findIndex((message) => message.directMessageID === selectedDirectMessageID);
    const {
      isGroup,
      profiles,
      UIDs,
      adminUIDs
    } = directMessages[index];
    setTitleString(messageTitle);
    setIsGroup(isGroup);
    setMemebers(profiles);
    setUIDs(UIDs);
    setAdminUIDs(adminUIDs);
    const adminIndex = adminUIDs.findIndex((uid) => uid === userData.uid);
    if (adminIndex !== -1) {
      setIsCurrentUserAdmin(true);
    };
    return () => {
      setHideTopNavigation(false);
    }
  },[messageTitle, directMessages]);

  const saveTitle = async () => {
    await updateDoc(doc(db, 'directMessages', selectedDirectMessageID), {
      title: titleString
    }); 
    const {
      username,
      fullname,
      photoURL,
      uid,
    } = userData;
    let chatTitle;
    const messageID = uuidv4();
    if (titleString === '') {
      const fullnames = [];
      members.findIndex((profile) => {
        const {
          fullname,
        } = profile;
        if (profile.uid !== userData.uid) {
          fullnames.push(fullname);
        };
      });
      chatTitle = fullnames.join(', ')
    } else {
      chatTitle = titleString
    };
    await setDoc(doc(db, selectedDirectMessageID, messageID), {
      recipientUIDs: UIDs,
      notRead: UIDs,
      messageID: messageID,
      directMessageID: selectedDirectMessageID,
      username: username,
      fullname: fullname,
      photoURL: photoURL,
      uid: uid,
      type: 'group-name-change',
      title: chatTitle,
      date: Date.now(),
    });
    setMessageTitle(chatTitle);
    setTitleString(chatTitle);
  };

  const modalOpenHandler = (uid) => {
    setSelectedMemberUID(uid)
    setIsMemberModalOpen(true);
  }

  return (
    <main className='direct-message-details-modal'>
      {isMobile &&
        <header className='direct-message-details-header'>
          <button 
            className='back-button-header'
            onClick={() => setIsMessageDetailsOpen(false)}
          >
            <svg aria-label="Back" className="back-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M21 17.502a.997.997 0 01-.707-.293L12 8.913l-8.293 8.296a1 1 0 11-1.414-1.414l9-9.004a1.03 1.03 0 011.414 0l9 9.004A1 1 0 0121 17.502z"></path>
            </svg>
          </button>
          <h1 className='details-header-text'>
            Details
          </h1>
          <div className='header-spacer'>
            {messageTitle !== titleString &&
              <button 
                className='done-button'
                onClick={saveTitle}
              >
                Done
              </button>
            }
          </div>
        </header>      
      }
      <section className='direct-message-details-content'>
        {isGroup && isCurrentUserAdmin &&
          <form className='group-name-form'>
            <label className='group-name-label' htmlFor='group-name-input'>
              Group Name:
            </label>
            <input 
              name='group-name-input'
              className='group-name-input'
              placeholder='Add a name'
              value={titleString}
              onChange={textInputHandler}
              type='text'
            />
          </form>        
        }
        <div className='group-members-content'>
          <header className='group-members-header'>
            <h2 className='group-members-header-text'>
              Members
            </h2>
            {isGroup && isCurrentUserAdmin &&
              <button 
                className='add-people-button'
                onClick={() => setIsAddPeopleOpen(true)}
              >
                Add People
              </button>            
            }
          </header>
          <ul className='group-members-list'>
            {members.map((member) => {
              const {
                username,
                fullname,
                photoURL,
                uid,
              } = member;
              let isAdmin = false;
              adminUIDs.forEach((UID) => {
                if (UID === uid) {
                  isAdmin = true;
                };
              });
              
              if (!isGroup && uid === userData.uid) {
                return null
              } else {
                return (
                  <li 
                    className='group-member'
                    key={uid}
                  >
                    <div className='profile-photo-frame'>
                      <img alt='' className='profile-photo' src={photoURL === '' ? defaultProfileImage : photoURL} />
                    </div>
                    <div className='group-member-text'>
                      <span className='group-member-username'>
                        {username}
                      </span>
                    {isAdmin && isGroup
                      ? <span className='group-member-fullname'>
                          {`Admin ∙ ${fullname}`}
                        </span>
                      : <span className='group-member-fullname'>
                          {fullname}
                        </span>
                    }
                    </div>
                    {isGroup && uid !== userData.uid && isCurrentUserAdmin &&
                      <button 
                        className='group-member-options-button'
                        onClick={() => modalOpenHandler(uid)}
                      >
                        <svg aria-label="Edit options" className="edit-options-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="6" cy="12" r="1.5"></circle>
                          <circle cx="18" cy="12" r="1.5"></circle>
                        </svg>
                      </button>                    
                    }
                  </li>
                )                
              }
            })}
          </ul>
        </div>
        <footer className='edit-chat-buttons'>
          {isGroup &&
            <div className='leave-chat-wrapper'>
              <button className='leave-chat-button'>
                Leave Chat
              </button>
              <span className='leave-chat-text'>
                You won't get messages from this group unless someone adds you back to the chat.
              </span>            
            </div>          
          }
          <button 
            className='delete-chat-button'
            onClick={() => setIsDeleteChatOpen(true)}
          >
            Delete Chat
          </button>
        </footer>
      </section>
    </main>
  );
};

export default DirectMessageDetailsModal;
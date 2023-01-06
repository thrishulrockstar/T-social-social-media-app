import './DesktopDirectMessages.css';
import Inbox from './Inbox';
import DirectMessage from './DirectMessage';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import defaultProfileImage from "../images/default-profile-image.jpg";

const DesktopDirectMessages = (props) => {
  const {
    copyHandler,
    unsendHandler,
    isMessageDetailsOpen,
    setIsAddPeopleOpen,
    setSelectedMemberUID,
    setIsMemberModalOpen,
    setIsDeleteChatOpen,
    setHideTopNavigation,
    setIsMessageDetailsOpen,
    selectedDirectMessageID,
    getAllDirectMessages,
    setDirectMessages,
    isGettingDirectMessages,
    setIsNewMessageOpen,
    profilePhotoTitle,
    messageTitle,
    isInbox,
    userData,
    formatTimeShort,
    directMessages,
    setIsInboxOpen,
    setMessages,
    messages,
    setSelectedMessageID,
    setIsMessageLikesOpen,
    setSelectedDirectMessageID,
    setIsMessageLinksOpen,
    setProfilePhotoTitle,
    setMessageTitle,
    setSelectedMessage,
    selectedMessage
  } = props;
  const {
    username,
    fullname
  } = userData;
  const params = useParams();
  const [profilePhotos, setProfilePhotos] = useState([]);
  
  useEffect(() => {
    if (!isInbox) {
      const {
        messageID
      } = params;
      const index = directMessages
        .findIndex((message) => message.directMessageID === messageID);
      const {
        profiles,
        isGroup
      } = directMessages[index];
      const photoURLs = [];
      profiles.forEach((profile) => {
        if (profile.uid !== userData.uid) {
          const {
            photoURL
          } = profile;
          photoURLs.push(photoURL);
        };
      });
      if (photoURLs.length >= 1 && isGroup) {
        const index = profiles.findIndex((profile) => profile.uid === userData.uid);
        photoURLs.push(profiles[index].photoURL);
      };
      setProfilePhotos(photoURLs);
      console.log(photoURLs)      
    }
  },[directMessages.UIDs, isInbox, params.messageID]);

  const detailsHandler = () => {
    isMessageDetailsOpen 
      ? setIsMessageDetailsOpen(false)
      : setIsMessageDetailsOpen(true);
  }

  return (
    <div className='desktop-inbox-wrapper'>
      <main className='desktop-inbox'>
        <section className='inbox-side-menu'>
          <header className='inbox-side-menu-header'>
            <div className='button-spacer'>
            </div>
            <h1 className='inbox-side-header-text'>
              {fullname === '' ? username : fullname}
            </h1>
            <button 
              className='new-message-button'
              onClick={() => setIsNewMessageOpen(true)}
            >
              <svg aria-label="New Message" className="new-message-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                <path d="M12.202 3.203H5.25a3 3 0 00-3 3V18.75a3 3 0 003 3h12.547a3 3 0 003-3v-6.952" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 012.004 0l1.224 1.225a1.417 1.417 0 010 2.004z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153"></line>
              </svg>
            </button>
          </header>
          <Inbox
            setDirectMessages = {setDirectMessages}
            isGettingDirectMessages = {isGettingDirectMessages}
            formatTimeShort={formatTimeShort}
            userData={userData}
            directMessages={directMessages}
            setIsInboxOpen={setIsInboxOpen}
          />
        </section>
        <section className='selected-messages'>
          {isInbox &&
            <div className='inbox-placeholder'>
              <svg aria-label="Direct" className="inbox-placeholder-svg" color="#262626" fill="#262626" height="96" role="img" viewBox="0 0 96 96" width="96">
                <circle cx="48" cy="48" fill="none" r="47" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
                <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="69.286" x2="41.447" y1="33.21" y2="48.804"></line>
                <polygon fill="none" points="47.254 73.123 71.376 31.998 24.546 32.002 41.448 48.805 47.254 73.123" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon>
              </svg>
              <h2 className='inbox-placeholder-header-text'>
                Your Messages
              </h2>
              <span className='inbox-placeholder-text'>
                Send private photos and messages to a friend or group.
              </span>
              <button 
                className='inbox-placeholder-send-message'
                onClick={() => setIsNewMessageOpen(true)}
              >
                Send Message
              </button>
            </div>        
          }
          {!isInbox &&
          <Fragment>
            <header className='direct-message-header'>
              {!isMessageDetailsOpen &&
                <Fragment>
                  {profilePhotos.length > 1 &&
                    <div className="group-profile-photo-frame">
                      <div className='profile-photo-frame top'>
                        <img 
                          alt='' 
                          className='profile-photo' 
                          src={profilePhotos[0] === '' ? defaultProfileImage : profilePhotos[0]} 
                        />
                      </div>
                      <div className="profile-photo-border">
                        <div className='profile-photo-frame bottom'>
                          <img 
                            alt='' 
                            className='profile-photo' 
                            src={profilePhotos[1] === '' ? defaultProfileImage : profilePhotos[1]} 
                          />
                        </div>             
                      </div>          
                    </div>
                  }
                  {profilePhotos.length === 1 &&
                    <div className='profile-photo-frame'>
                      <img 
                        alt='' 
                        className='profile-photo' 
                        src={profilePhotos[0] === '' ? defaultProfileImage : profilePhotoTitle} 
                      />
                    </div>        
                  }          
                  <h1 className='message-username-header-text'>{messageTitle}</h1>        
                </Fragment>
              }
              {isMessageDetailsOpen &&
                <Fragment>
                  <div className='left-spacer'></div>
                  <h1 className='message-details-header-text'>
                    Details
                  </h1>                  
                </Fragment>
              }
              <button 
                className='message-info-button'
                onClick={detailsHandler}
              >
                {isMessageDetailsOpen
                  ? <svg aria-label="Navigate back to chat from thread details" className="message-info-selected-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <path d="M12.001.504a11.5 11.5 0 1011.5 11.5 11.513 11.513 0 00-11.5-11.5zm-.182 5.955a1.25 1.25 0 11-1.25 1.25 1.25 1.25 0 011.25-1.25zm1.614 11.318h-2.865a1 1 0 010-2H11V12.05h-.432a1 1 0 010-2H12a1 1 0 011 1v4.727h.433a1 1 0 110 2z"></path>
                    </svg>
                  : <svg aria-label="View Thread Details" className="message-info-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
                      <circle cx="11.819" cy="7.709" r="1.25"></circle>
                      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="10.569" x2="13.432" y1="16.777" y2="16.777"></line>
                      <polyline fill="none" points="10.569 11.05 12 11.05 12 16.777" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
                    </svg>
                }
              </button>
            </header>
            <DirectMessage
              copyHandler = {copyHandler}
              unsendHandler = {unsendHandler}
              isMessageDetailsOpen = {isMessageDetailsOpen}
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
              getAllDirectMessages = {getAllDirectMessages}
              formatTimeShort = {formatTimeShort}
              setMessages = {setMessages}
              messages = {messages}                  
              setSelectedMessageID = {setSelectedMessageID}
              setIsMessageLikesOpen = {setIsMessageLikesOpen}
              setSelectedDirectMessageID={setSelectedDirectMessageID}
              setIsMessageLinksOpen={setIsMessageLinksOpen}
              setProfilePhotoTitle={setProfilePhotoTitle}
              setSelectedMessage={setSelectedMessage}
              selectedMessage={selectedMessage}
              setIsInboxOpen = {setIsInboxOpen }
            />            
          </Fragment>

          }
        </section>
      </main>      
    </div>

  );
};

export default DesktopDirectMessages;
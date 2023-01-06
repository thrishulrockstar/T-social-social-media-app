import './MessageSuggestedPeople.css';
import { useLayoutEffect, useState } from 'react';
import defaultProfileImage from "../images/default-profile-image.jpg";

const MessageSuggestedPeople = (props) => {
  const {
    isAddPeople,
    groupUIDs,
    isSharePostOpen,
    userData,
    directMessage,
    recipientSelection,
    suggestionSelection,
  } = props;
  const {
    profiles,
    title,
    directMessageID,
    isGroup,
  } = directMessage;
  const [chatTitle, setChatTitle] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [usernames, setUsernames] = useState('');
  const [photoURLs, setPhotoURLs] = useState([]);
  const [isMember, setIsMember] = useState(false);

  useLayoutEffect(() => {
    const fullnames = [];
    const usernames = [];
    const UIDs = [];
    const photoURLs = [];
    profiles.forEach((profile) => {
      const {
        fullname,
        username,
        uid,
        photoURL
      } = profile;
      if (uid !== userData.uid) {
        fullnames.push(fullname);
        usernames.push(username);
        UIDs.push(uid);
        if (photoURL === '') {
          photoURLs.push(defaultProfileImage);
        } else {
          photoURLs.push(photoURL);
        };
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
        const newFullnames = [...fullnames];
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
    let usernameTitle = usernames.join(', ')
    if (usernames.length > 2) {
      const overflow = usernames.length - 2;
      const newUsernames = [...usernames];
      newUsernames.splice(2, overflow, `and ${overflow} ${
        overflow === 1
          ? 'other'
          : 'others'
      }`);
      usernameTitle = newUsernames.join(', ')
    }
    setUsernames(usernameTitle);
    setChatTitle(chatTitle);
    setPhotoURLs(photoURLs);
    const selectedArray = recipientSelection.map((recipient) => {
      if (UIDs.length > 1) {
        const index = recipientSelection.findIndex((recipient) =>  recipient === profiles);
        if (index !== -1) {
          return true;
        }
      } else {
        const recipientArray = [];
        recipient.forEach((user) => {
          if (user.uid !== userData.uid) {
            recipientArray.push(user);
          }
        });
        const userIndex = recipientArray.findIndex((user) => user.uid === UIDs[0]);
        if (recipientArray.length === 1) {
          if (userIndex !== -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }                
      }
    })
    const booleanIndex = selectedArray.findIndex((boolean) => boolean === true);
    if (booleanIndex !== -1) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }              
  },[directMessage, userData.uid, recipientSelection]);

  //removes suggested users already in group chat //
  useLayoutEffect(() => {
    if (isAddPeople && 
      directMessage.UIDs.length === 2 && 
      groupUIDs.length !== 0
    ) {
      const UIDsWithoutUser = [];
      directMessage.UIDs.forEach((uid) =>{
        if (uid !== userData.uid) {
          UIDsWithoutUser.push(uid);
        };
      }); 
      console.log(groupUIDs);     
      groupUIDs.forEach((uid) => {
        console.log(UIDsWithoutUser, uid);
        if (UIDsWithoutUser.length === 1 && uid === UIDsWithoutUser[0]) {
          return setIsMember(true);
        };
      }); 
    };
  },[groupUIDs])

  if (profiles.length > 2 && !isSharePostOpen) {
    return null;
  } else if (profiles.length === 1 || isMember || (isGroup && isMember)) {
    return null;
  } else {
    return (
      <li
        className='suggested-person'
        onClick={() => suggestionSelection(directMessage.profiles)}
      >
        {photoURLs.length > 1 &&
          <div className="group-profile-photo-frame">
            <div className='double-profile-photo-frame'>
              <img alt='' className='profile-photo' src={photoURLs[0]} />
            </div>
            <div className="profile-photo-border">
              <div className='double-profile-photo-frame bottom'>
                <img alt='' className='profile-photo' src={photoURLs[1]} />
              </div>             
            </div>          
          </div>
        }
        {photoURLs.length === 1 &&
          <div className='profile-photo-frame'>
            <img alt='' className='profile-photo' src={photoURLs[0]} />
          </div>        
        }
        <div className='direct-message-text'> 
          <span className='suggested-person-full-name'>
            {chatTitle}
          </span>
          <span className='suggested-person-username'>
            {usernames}
          </span>        
        </div>
        <div className='selected-checkmark'>
          {isSelected
            ? <svg aria-label="Toggle selection" className="selected-checkmark-svg" color="#0095f6" fill="#0095f6" height="24" role="img" viewBox="0 0 24 24" width="24">
                <path d="M12.001.504a11.5 11.5 0 1011.5 11.5 11.513 11.513 0 00-11.5-11.5zm5.706 9.21l-6.5 6.495a1 1 0 01-1.414-.001l-3.5-3.503a1 1 0 111.414-1.414l2.794 2.796L16.293 8.3a1 1 0 011.414 1.415z"></path>
              </svg>
            : <svg aria-label="Toggle selection" className="unselected-checkmark-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                <circle cx="12.008" cy="12" fill="none" r="11.25" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5"></circle>
              </svg>        
          }

        </div>       
      </li>
    );
  };
};

export default MessageSuggestedPeople;
import './AddPeopleModal.css';
import NewMessage from '../pages/NewMessage';
import { useEffect, useState } from 'react';
import { getFirestore, arrayUnion, doc, updateDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore();

const AddPeopleModal = (props) => {
  const {
    isMobile,
    setIsAddPeopleOpen,
    allMessages,
    directMessages,
    setIsInboxOpen,
    userData,
    recipientSelection,
    setRecipientSelection,
    setSearchString,
    searchString,
    searchResults,
    selectedDirectMessageID,
  } = props;
  const [groupUIDs, setGroupUIDs] = useState([]);

  useEffect(() => {
    const index = directMessages.findIndex((message) => message.directMessageID === selectedDirectMessageID);
    const { UIDs } = directMessages[index];
    setGroupUIDs(UIDs)
  }, []);

  const addPeople = async () => {
    console.log(recipientSelection);
    const newPeopleUIDs = [];
    const newProfiles = []
    const newUsernames = [];
    recipientSelection.forEach((recipient) => {
      recipient.forEach((profile) => {
        if (profile.uid !== userData.uid) {
          newPeopleUIDs.push(profile.uid);
          newProfiles.push(profile);
          newUsernames.push(profile.username);
        };        
      })
    });
    const newUIDs = [...groupUIDs, ...newPeopleUIDs]
    newUIDs.sort();
    console.log(newUIDs);
    await updateDoc(doc(db, 'directMessages', selectedDirectMessageID), {
      UIDs: newUIDs,
      profiles: arrayUnion(...newProfiles)
    });
    const messageID = uuidv4();
    const {
      username,
      fullname,
      photoURL,
      uid,
    } = userData;
    await setDoc(doc(db, 'messages', messageID), {
       recipientUIDs: newUIDs,
       notRead: newUIDs,
       seenBy: [],
       messageID: messageID,
       directMessageID: selectedDirectMessageID,
       username: username,
       fullname: fullname,
       photoURL: photoURL,
       uid: uid,
       type: 'group-add-people',
       newUsernames: newUsernames,
       date: Date.now() 
    });
    setIsAddPeopleOpen(false);
  }
  if (isMobile) {
    return (
      <main className='add-people-modal'>
        <header className='add-people-header'>
          <button 
            className='back-button-header'
            onClick={() => setIsAddPeopleOpen(false)}
          >
            <svg aria-label="Back" className="back-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M21 17.502a.997.997 0 01-.707-.293L12 8.913l-8.293 8.296a1 1 0 11-1.414-1.414l9-9.004a1.03 1.03 0 011.414 0l9 9.004A1 1 0 0121 17.502z"></path>
            </svg>
          </button>
          <h1 className='header-text'>
            Add People
          </h1>
          <div 
            className='next-button'
            onClick={addPeople}
          >
            Next
          </div>
        </header>
        <NewMessage
          isAddPeople={true}
          groupUIDs={groupUIDs}
          allMessages={allMessages}
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
  } else {
    return (
      <div 
        className='modal'
        onClick={() => setIsAddPeopleOpen(false)}
      >
        <main 
          className='add-people-modal-content'
          onClick={(event) => event.stopPropagation()}
        >
          <header className='add-people-header'>
            <button 
              className='back-button-header'
              onClick={() => setIsAddPeopleOpen(false)}
            >
              <svg aria-label="Back" className="back-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                <path d="M21 17.502a.997.997 0 01-.707-.293L12 8.913l-8.293 8.296a1 1 0 11-1.414-1.414l9-9.004a1.03 1.03 0 011.414 0l9 9.004A1 1 0 0121 17.502z"></path>
              </svg>
            </button>
            <h1 className='header-text'>
              Add People
            </h1>
            <div 
              className='next-button'
              onClick={addPeople}
            >
              Next
            </div>
          </header>
          <NewMessage
            isAddPeople={true}
            groupUIDs={groupUIDs}
            allMessages={allMessages}
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
      </div>      
    );
  };
};

export default AddPeopleModal;
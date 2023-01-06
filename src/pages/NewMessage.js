import './NewMessage.css';
import React, { useState, useRef, useEffect, useLayoutEffect, Fragment } from 'react';
import PeopleList from '../components/PeopleList';
import MessageSuggestedPeople from '../components/MessageSuggestedPeople';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, setDoc, getDoc, doc, query, collection, where, getDocs } from "firebase/firestore";
import firebaseApp from "../Firebase";

const db = getFirestore();

const NewMessage = (props) => {
  const {
    isMobile,
    setIsNewMessageOpen,
    groupUIDs,
    isAddPeople,
    isSharePostOpen,
    allMessages,
    sharePostText,
    sharePostTextHandler,
    sharePost,
    isModal,
    directMessages,
    userData,
    setIsInboxOpen,
    setRecipientSelection,
    recipientSelection,
    setSearchString,
    searchString,
    searchResults,
    getAllDirectMessages,
  } = props;
  const [selectedRecipient, setSelectedRecipient] = useState({username: null, uid: null});
  const newMessageSearchRef = useRef(null);
  const [suggestedUsers, setSuggestedUsers] = useState ([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const createMessage = async () => {
    setIsCreating(true);
    const { 
      uid, 
    } = userData;
    const directMessageID = uuidv4();
    const UIDs = [uid];
    console.log(recipientSelection);
    recipientSelection.forEach((recipient) => {
        recipient.forEach((user) => {
          if (user.uid !== uid) {
            UIDs.push(user.uid);
          };
        });        
    });
    UIDs.sort();
    const copyCheck = query(collection(db, 'directMessages'), 
      where('UIDs', '==', UIDs));
    console.log(UIDs);
    const copyCheckSnap = await getDocs(copyCheck);
    const docs = [];
    copyCheckSnap.forEach((doc) => {
      docs.push(doc.data());
    })
    console.log(docs.length);
    if (docs.length === 1) {
      return navigate(`/direct/t/${docs[0].directMessageID}`);
    }
    let profiles;
    const profilePromises = UIDs.map( async (UID) => {
      const documentSnapshot = await getDoc(doc(db, 'users', UID));
      const {
        fullname,
        username,
        photoURL,
        uid,
      } = documentSnapshot.data();
      return {
        fullname,
        username,
        photoURL,
        uid,
      }
    })
    await Promise.all(profilePromises).then((array) => {
      profiles = array
    })
    console.log(profiles);
    await setDoc(doc(db, 'directMessages', directMessageID), {
      directMessageID: directMessageID,
      isGroup: UIDs.length > 2 ? true : false,
      UIDs: UIDs,
      profiles,
      adminUIDs: [uid],
      title: '',
      date: Date.now(),
    });
    if (!isMobile) {
      setIsNewMessageOpen(false);
    }
    navigate(`/direct/t/${directMessageID}`);
    setIsCreating(false);
  };

  useEffect(() => {
    if (isModal) {
      setSuggestedUsers(directMessages);
    } else {
      const suggestions = [];
      directMessages.map((messsage) => {
        if (messsage.UIDs.length < 3) {
          suggestions.push(messsage);
        };
        return null
      });
      console.log(suggestions);
      setSuggestedUsers(suggestions);      
    }
  }, []);

  const onChangeHandler = (event) => {
    const { value } = event.target;
    setSearchString(value);
  }

  const searchSelection = (user) => {
    const {
      username,
      fullname,
      uid,
      photoURL,
    } = userData;
    const selection = [
    {
      username: user.username,
      fullname: user.fullname,
      uid: user.uid,
      photoURL: user.photoURL
    },
    {
      username: username,
      fullname: fullname,
      uid: uid,
      photoURL: photoURL
    }, 
    ];
    const UIDs = [];
    let index;
    selection.forEach((user) => {
      if (user.uid !== userData.uid) {
        UIDs.push(user.uid);
      }
    });
    index = recipientSelection.findIndex((recipients) => {
      const recipientUIDs = [];
      recipients.forEach((user) => {
        if (user.uid !== userData.uid) {
          recipientUIDs.push(user.uid);
        }
      });
      console.log(UIDs, recipientUIDs)
      return JSON.stringify(recipientUIDs) === JSON.stringify(UIDs);
    })
    if (index === -1) {
      setRecipientSelection([...recipientSelection, selection]);
    } else {
      const newArray = [...recipientSelection];
      newArray.splice(index, 1);
      setRecipientSelection(newArray);
    }
    setSearchString('');
  }

  useEffect(() => {
    console.log(recipientSelection);
  }, [recipientSelection])

  const suggestionSelection = (users) => {
    console.log('users:', users, 'recipients:',recipientSelection);
    const UIDs = [];
    let index;
    users.forEach((user) => {
      if (user.uid !== userData.uid) {
        UIDs.push(user.uid);
      }
    });
    index = recipientSelection.findIndex((recipients) => {
      const recipientUIDs = [];
      recipients.forEach((user) => {
        if (user.uid !== userData.uid) {
          recipientUIDs.push(user.uid);
        }
      });
      console.log(UIDs, recipientUIDs)
      return JSON.stringify(recipientUIDs) === JSON.stringify(UIDs);
    })
    if (index === -1) {
      setRecipientSelection([...recipientSelection, users]);
    } else {
      const newArray = [...recipientSelection];
      newArray.splice(index, 1);
      setRecipientSelection(newArray);
    }
    setSearchString('');
  }

  const recipientSelectionHandler = (recipient) => {
    if (selectedRecipient === recipient) {
      setSelectedRecipient({username: null, uid: null});
    } else {
      setSelectedRecipient(recipient);
    }
  }

  const deleteRecipient = (recipient) => {
    const newSelection = [...recipientSelection]
    const recipientIndex = recipientSelection.findIndex((recipients) => recipients === recipient);
    if (recipientIndex !== -1) {
      newSelection.splice(recipientIndex, 1);
    }
    setRecipientSelection(newSelection);
  }

  useEffect(() => {
    console.log(recipientSelection);
  }, [recipientSelection]);

  useEffect(() => {
    console.log(isMobile);
    newMessageSearchRef.current.focus();
    setIsInboxOpen(true);
    return () => {
      setRecipientSelection([]);
    }
  }, []);

  return (
    <main className='new-message'>
      {!isSharePostOpen && !isAddPeople &&
        <header className="mobile-navigation-header">
          <div className="mobile-navigation-icon-wrapper">
            {!isMobile &&
              <button
                className='back-button'
                onClick={() => setIsNewMessageOpen(false)}
              >
                <svg aria-label="Close" className="close-svg" color="#262626" fill="#262626" height="18" role="img" viewBox="0 0 24 24" width="18">
                  <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
                  <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
                </svg>
              </button>
            }
            {isMobile &&
              <button 
                className="back-button" 
                onClick={() => navigate(-1)}
              >
                <svg aria-label="Back" className="back-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M21 17.502a.997.997 0 01-.707-.293L12 8.913l-8.293 8.296a1 1 0 11-1.414-1.414l9-9.004a1.03 1.03 0 011.414 0l9 9.004A1 1 0 0121 17.502z"></path>
                </svg>
              </button>            
            }
            <h1 className="logo-header">
              New Message
            </h1>
            <button 
              className="create-message-button"
              onClick={createMessage}
              disabled={recipientSelection.length === 0}
            >
              Next
            </button>            
          </div>
        </header>       
      }
      <section 
        className='new-message-form'
        ref={inputRef}
      >
        <h2 className='to-title-text'>
          To:
        </h2>
        <section className='selected-recipients'>
          {recipientSelection.map((recipient) => {
            let username = recipient.username;
            let chatTitle;            
            if (recipient.length !== undefined) {
              const fullnames = [];
              const photoURLS = [];
              recipient.findIndex((profile) => {
                const {
                  fullname,
                  photoURL,
                } = profile;
                if (profile.uid !== userData.uid) {
                  fullnames.push(fullname);
                  photoURLS.push(photoURL)
                };
              });
              if (fullnames.length === 2) {
                chatTitle = fullnames.join(' and ')
              } else if (fullnames.length > 2) {
                const overflow = fullnames.length - 2;
                const newFullnames = [...fullnames];
                newFullnames.splice(2, overflow, `and ${overflow} ${
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
            }
            const {
              uid
            } = recipient;
            return (
              <button 
                key={uid}
                className={selectedRecipient === recipient ? 'selected-recipient-button selected' : 'selected-recipient-button'}
                onClick={() => recipientSelectionHandler(recipient)}
              >
                <span className={selectedRecipient === recipient ? 'selected-recipient-username selected' : 'selected-recipient-username'}>
                  {chatTitle}
                </span>
                {selectedRecipient === recipient &&
                  <div 
                    className='selected-recipient-delete'
                    onClick={() => deleteRecipient(recipient)}
                  >
                    <svg aria-label="Delete Item" className="delete-recipient-svg" color="#ffffff" fill="#ffffff" height="12" role="img" viewBox="0 0 24 24" width="12">
                      <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
                      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
                    </svg>
                  </div>                
                }
              </button>
            )
          })}
        </section>
        <input
          onFocus={() => setSelectedRecipient({username: null, uid: null})} 
          autoComplete='off'
          className='new-message-to-input'
          placeholder='Search...'
          spellCheck='false'
          type='text'
          onChange={onChangeHandler}
          value={searchString}
          ref={newMessageSearchRef}
        />
      </section>
      <section className='new-message-content'>
        {searchString !== '' &&
          <section 
            className='user-search-results'
          >
            <PeopleList
              isAddPeople = {isAddPeople}
              groupUIDs = {groupUIDs}
              userData={userData}
              recipientSelection={recipientSelection}
              searchSelection={searchSelection}
              allUserProfiles={searchResults}
              isSearch={true}
              isMessage={true}
            />
          </section>      
        }
        <h2 className='suggested-header-text'>
          Suggested
        </h2>
        <ul className='suggested-people'>
          
          {suggestedUsers.map((directMessage) => {
            return (
              <Fragment key={directMessage.directMessageID}>
                <MessageSuggestedPeople
                  isAddPeople={isAddPeople}
                  groupUIDs={groupUIDs}
                  isSharePostOpen={isSharePostOpen}
                  directMessage={directMessage}
                  allMessages={allMessages} 
                  suggestionSelection={suggestionSelection}
                  recipientSelection={recipientSelection}
                  isSuggestion={true}
                  userData={userData}
                  directMessages={suggestedUsers}
                  setIsInboxOpen={setIsInboxOpen}
                  setSearchString={setSearchString}
                  searchString={searchString}
                  searchResults={searchResults}
                />               
              </Fragment>
            )   
          })}        
        </ul>
        {isModal &&
        <React.Fragment>
          <hr className='line-spacer'/>
            <footer className='mobile-share-modal-footer'>
              <div 
                className='mobile-share-input-wrapper'
                style={{
                  height: `${recipientSelection.length === 0 ? 0 : 64}px`
                }}
              >
                {recipientSelection.length !== 0 &&
                  <input 
                    className='mobile-share-text-input'
                    type='text'
                    placeholder='Write a message...'
                    autoComplete='off'
                    onChange={sharePostTextHandler}
                    value={sharePostText}
                  />             
                }
              </div>
              <button
                onClick={sharePost} 
                className='send-share-button'
                disabled={recipientSelection.length === 0}
              >
                {recipientSelection.length > 1 ? 'Send Seperately' : 'Send'}
              </button>
            </footer>          
        </React.Fragment>
        }        
      </section>


    </main>
  )
}

export default NewMessage;
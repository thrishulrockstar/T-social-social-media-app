import './UploadPhotoMobileDetails.css'
import { useNavigate } from 'react-router-dom'
import React, { useEffect, useRef, useState } from 'react';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFirestore, documentId, setDoc, doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import firebaseApp from '../Firebase';
import {v4 as uuidv4} from 'uuid';
import PeopleList from '../components/PeopleList';

const storage = getStorage();
const db = getFirestore();

const UploadPhotoMobileDetails = (props) => {
  const {
    isSearchHashTag,
    setCaptionSearchString,
    setPhotoUploadText,
    captionSearchString,
    setUserIndex,
    userIndex,
    locationBeforeUpload,
    shareMobilePost,
    tagData,
    thumbnailImage,
    showNotification,
    photoUploadText,
    photoUploadTextHandler,
    editedPhoto,
    setPhotoUploadOpen, 
    profilePhotoURL,
    userData
  } = props;
  const navigate = useNavigate();
  const [sharingPost, setSharingPost] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const getSearchResults = async () => {
    setIsSearching(true);
    const matchedUsers = [];
    const searchTerm = captionSearchString.toLowerCase();
    let searchQuery;
    if (isSearchHashTag) {
      searchQuery = query(collection(db, 'hashTags'), 
        where(documentId(), '>=', searchTerm), where(documentId(), '<=', searchTerm+ '\uf8ff' ));
    } else {
      searchQuery = query(collection(db, 'users'), 
        where('username', '>=', searchTerm), where('username', '<=', searchTerm+ '\uf8ff' ));
    }
    const usersSnapshot = await getDocs(searchQuery);
    usersSnapshot.forEach((user) => {
      if (isSearchHashTag) {
        matchedUsers.push({
          hashTag: user.id,
          ...user.data()
        });
      } else {
        matchedUsers.push(user.data());
      };
    });
    setSearchResults(matchedUsers);
  }

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    setSearchResults([]);
    if (captionSearchString !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        getSearchResults(); 
      }, 300);     
    }; 
  }, [captionSearchString]);

  const searchSelection = (text) => {
    const slicedComment = photoUploadText.slice(0, userIndex);
    const name = `${text} `
    const newCommentText = slicedComment.concat(name);
    setPhotoUploadText(newCommentText);
    setUserIndex(null)
    setIsSearching(false);
    textareaRef.current.focus();
  }

  const shareNewPost = async () => {
    console.log('hi');
    setSharingPost(true);
    await shareMobilePost();
    setSharingPost(false);
    setPhotoUploadOpen(false);
    navigate(locationBeforeUpload.pathname);
  }

  const onBlurHandler = () => {
    setIsSearching(false);
  }

  useEffect(() => {
    setCaptionSearchString('');
    setPhotoUploadOpen(true);
  }, []);
  
  return (
    <section className='mobile-upload-photo-details'>
      <div className='upload-details-header-wrapper'>
        {sharingPost && 
          <React.Fragment>
            <div className='share-post-loading-bar'></div>
            <div className='loading-bar-modal'></div>            
          </React.Fragment>
        }
        <header className="new-post-header">
          {sharingPost 
            ? <div className="header-content-wrapper">
                
                <h1 className="new-post-header-text">Sharing...</h1>
              </div>
            : <div className="header-content-wrapper">
                <button 
                  className="close-new-post-button" 
                  onClick={() => navigate('/create/style')}
                >
                  <svg aria-label="Back" className="back-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <path d="M21 17.502a.997.997 0 01-.707-.293L12 8.913l-8.293 8.296a1 1 0 11-1.414-1.414l9-9.004a1.03 1.03 0 011.414 0l9 9.004A1 1 0 0121 17.502z"></path>
                  </svg>
                </button>
                <h1 className="new-post-header-text">New Post</h1>
                <button 
                  className="next-new-post-button" 
                  onClick={shareNewPost} 
                >
                  Share
                </button>
              </div>
          }

        </header>        
      </div>
      <div className='mobile-photo-details-wrapper'>
        <section className='mobile-photo-upload-text'>
          <div className='upload-text-profile-photo-wrapper'>
            <img alt={`${userData.displayName}'s profile`} className='upload-text-profile-photo' src={userData.photoURL} />
          </div>
          <div className='upload-textarea-wrapper'>
            <textarea
              onChange={photoUploadTextHandler}
              value={photoUploadText} 
              aria-label='Write a caption...' 
              placeholder='Write a caption...' 
              className='upload-textarea' 
              autoComplete='off' 
              autoCorrect='off'
              ref={textareaRef}
              onBlur={onBlurHandler}
            >
            </textarea>
            <div className='textarea-modal'></div>
          </div>
          <div className='upload-photo-preview-wrapper'>
            <img alt='Preview to be uploaded' className='upload-photo-preview' src={URL.createObjectURL(editedPhoto)} />
          </div>
          {isSearching && !isSearchHashTag &&
            <section className='profile-search-results'>
              <PeopleList 
                searchSelection={searchSelection}
                isTag={false}
                isSearch={true}
                isComment={true}
                allUserProfiles={searchResults}
              />              
            </section> 
          }
          {isSearching && isSearchHashTag && 
            <ul 
              className='profile-search-results'
            >
              {searchResults.map((hashTag) => {
                return (
                  <li 
                    className='hash-tag-search-result'
                    onClick={() => searchSelection(hashTag.hashTag)}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <span className='hash-tag-text'>
                      #{hashTag.hashTag}
                    </span>
                    <span className='hast-tag-post-length'>
                      {hashTag.posts.length} posts
                    </span>
                  </li>
                )
              })}
            </ul>
          }
        </section>
        <section className='write-alt-text-wrapper'>
          <button 
            className='write-alt-text-button'
            onClick={() => navigate('/create/tag/')}
          >
            <span className='alt-text'>Tag People</span>
            {tagData.length === 1 &&
              <span className='details-tags'>
                {tagData[0].username}
              </span>
            }
            {tagData.length > 1 &&
              <span className='details-tags'>
              {`${tagData.length} people`}
            </span>
            }
            <span className='sprite-right-chevron'></span>
          </button>
        </section>
      </div>
    </section>
  )
}

export default UploadPhotoMobileDetails;
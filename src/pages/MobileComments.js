import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './MobileComments.css'
import firebaseApp from '../Firebase';
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, query, collection, where, orderBy, getDocs, getDoc, documentId } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'
import { useParams } from 'react-router-dom';
import Comment from '../components/Comment';
import useWindowSize from '../hooks/useWindowSize';
import PeopleList from '../components/PeopleList';

const db = getFirestore();

const MobileComments = (props) => {
  const {
    setSelectedComment,
    isCommentDeleteOpen,
    setIsCommentDeleteOpen,
    profileTagHandler,
    stringToLinks,
    isMobile,
    setIsLoadingPage,
    userData,
    setDataLoading, 
    setSelectedPost,
    selectedPost,
  } = props;
  const [width, height] = useWindowSize();
  const params = useParams();
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  const commentsListRef = useRef(null);
  const headerRef = useRef(null);
  const [commentsHeight, setCommentsHeight] = useState(0);
  const [replyUser, setReplyUser] = useState(null);
  const [newReplyID, setNewReplyID] = useState('');
  const [userIndex, setUserIndex] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null); 
  const [isSearchHashTag, setIsSearchHashTag] = useState(false);

  const commentTextHandler = (event) => {
    const { value } = event.target;
    const valueArray = value.split('');
    const lastLetter = value.substring(value.length - 1);
    console.log(lastLetter);
    if (lastLetter === '@') {
      console.log('@ found');
      setUserIndex(value.length);
      setIsSearchHashTag(false);
    } else if (lastLetter === '#') {
      console.log('# found')
      setUserIndex(value.length);
      setIsSearchHashTag(true);
    }
    if (value.length < userIndex) {
      setUserIndex(null)
      setIsSearching(false);
      setIsSearchHashTag(false);
    };
    console.log(userIndex);
    if (userIndex !== null) {
      console.log(value.substring(userIndex))
      setSearchString(value.substring(userIndex));
      const lastLetter = value.substring(value.length - 1);
      console.log(lastLetter)
      if (lastLetter === ' ') {
        console.log('cleared');
        setUserIndex(null);
      }
    }
    if (commentText === '' && value === ' ') {
      return
    }
    if ((valueArray[valueArray.length - 1] === ' ' && commentText[commentText.length - 1] === ' ') || valueArray.length > 2200) {
      return
    } else {
      setCommentText(value)
    }
  }

  const getSearchResults = async () => {
    setIsSearching(true);
    const matchedUsers = [];
    const searchTerm = searchString.toLowerCase();
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
    if (searchString !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        getSearchResults(); 
      }, 300);     
    }; 
  }, [searchString]);

  const searchSelection = (text) => {
    const slicedComment = commentText.slice(0, userIndex);
    const name = `${text} `
    const newCommentText = slicedComment.concat(name);
    setCommentText(newCommentText);
    setUserIndex(null)
    setIsSearching(false);
    textareaRef.current.focus();
  }

  useEffect(() => {
    if (headerRef.current !== null) {
      const headerHeight = headerRef.current.getBoundingClientRect().height;
      const commentsHeight = (height - 88) - headerHeight;
      setCommentsHeight(commentsHeight);      
    }
  }, [headerRef.current])

  useLayoutEffect(() => {
    if (selectedPost !== '') {
      textareaRef.current.style.height = '1px'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;     
    }
  }, [commentText]);

  const getPostData = async () => {
    const { postID } = params;
    if (selectedPost === '') {
      setDataLoading(true)
    }
    const photoArray = [];
    const profilePhotoData = query(collection(db, 'photoUploads'), 
      where('postID', '==', postID), orderBy('index'));
    const profileImageDataSnap = await getDocs(profilePhotoData);
    profileImageDataSnap.forEach((doc) => {
      photoArray.push(doc.data());
    });
    const profilePostDocument = doc(db, 'postUploads', postID);
    const postSnap = await getDoc(profilePostDocument);

    console.log([postSnap.data(), ...photoArray]);
    setSelectedPost([postSnap.data(), ...photoArray]);
    setDataLoading(false);
  };

  useLayoutEffect(() => {
      getPostData();
  }, []);

  if (selectedPost !== '') {
    const {
      postID,
      comments,
      postCaption,
      uploadDate
    } = selectedPost[0];
    const {
      username,
      photoURL,
      uid,
      displayName,
      fullname
    } = userData;
    const {
      w150
    } = selectedPost[1];
    
    const postComment = async (event) => {
      const commentID = uuidv4();
      if (event !== undefined) {
        event.preventDefault();
      }
      setIsSaving(true);
      const postRef = doc(db, 'postUploads', postID);
      await updateDoc(postRef, {
        comments: arrayUnion({
          commentID,
          photoURL: photoURL,
          text: commentText,
          uid: uid,
          uploadDate: Date.now(),
          username: username,
          likes: [],
          replies: [],
        })
      });
      // 'textTags' referes to profile tags in post caption, 'profileTagHandler' gets UIDs from usernames //
      const textTags = await profileTagHandler(commentText);
      for (let index = 0; index < textTags.length; index++) {
        if (textTags[index] !== uid) {
          const notificationID = uuidv4();
          await setDoc(doc(db, 'notifications', notificationID), {
            originID: commentID,
            notificationID,
            recipientUID: textTags[index],
            notRead: true,
            postID,
            postPhotoURL: w150,
            comment: commentText,
            profile: {
              fullname,
              username,
              photoURL,
              uid,
            },
            type: 'mention',
            source: 'comment',
            date: Date.now()
          });          
        };

      };
      if (selectedPost[0].uid !== uid) {
        const notificationID = uuidv4();
        await setDoc(doc(db, 'notifications', notificationID), {
          originID: commentID,
          notificationID,
          recipientUID: selectedPost[0].uid,
          notRead: true,
          postID,
          postPhotoURL: w150,
          comment: commentText,
          profile: {
            fullname,
            username,
            photoURL,
            uid,
          },
          type: 'comment',
          source: 'post',
          date: Date.now()
        });        
      };
      const photoArray = [];
      const profilePhotoData = query(collection(db, 'photoUploads'), 
        where('postID', '==', postID), orderBy('index'));
      const profileImageDataSnap = await getDocs(profilePhotoData);
      profileImageDataSnap.forEach((doc) => {
        photoArray.push(doc.data());
      });
      const profilePostDocument = doc(db, 'postUploads', postID);
      const postSnap = await getDoc(profilePostDocument);
  
      console.log([postSnap.data(), ...photoArray]);
      setSelectedPost([postSnap.data(), ...photoArray]);
      setCommentText('');
      setIsSaving(false);
      commentsListRef.current.scrollTop = commentsListRef.current.scrollHeight;
    };
  
    const enterKeyHandler = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        replyUser === null
          ? postComment()
          : replyComment();
      };
    };
    
    const cancelReply = () => {
      setReplyUser(null);
      setCommentText('');
    }

    const replyComment = async (event) => {
      if (event !== undefined) {
        event.preventDefault();
      }
      setIsSaving(true);
      const {
        commentID,
      } = replyUser;
      const postRef = doc(db, 'postUploads', postID);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const { comments } = postSnap.data();
        const newComments = [...comments];
        const commentIndex = postSnap.data().comments
          .findIndex((comment) => comment.commentID === commentID)
        if (commentIndex !== -1) {
          const commentReplyID = uuidv4();
          const { replies } = postSnap.data().comments[commentIndex];
          const newReply = {
            commentID: commentReplyID,
            parentID: commentID,
            photoURL: photoURL,
            uid: uid,
            uploadDate: Date.now(),
            username: displayName,
            fullname: fullname,
            likes: [],
            text: commentText,
          }
          const newReplies = [...replies, newReply];
          const newComment = {...comments[commentIndex], replies: newReplies};
          newComments.splice(commentIndex, 1, newComment);
          await updateDoc(postRef, {
            comments: newComments
          });
          setIsSaving(false);
          setReplyUser(null);
          setCommentText('');
          getCommentData();
          setNewReplyID(commentID);
          // 'textTags' referes to profile tags in post caption, 'profileTagHandler' gets UIDs from usernames //
          const textTags = await profileTagHandler(commentText);
          for (let index = 0; index < textTags.length; index++) {
            if (textTags[index] !== replyUser.uid || textTags[index !== uid]) {
              const notificationID = uuidv4();
              await setDoc(doc(db, 'notifications', notificationID), {
                originID: commentReplyID,
                notificationID,
                recipientUID: textTags[index],
                notRead: true,
                postPhotoURL: w150,
                comment: commentText,
                postID,
                profile: {
                  fullname,
                  username,
                  photoURL,
                  uid,
                },
                type: 'mention',
                source: 'comment',
                date: Date.now()
              });              
            };
          };
          if (selectedPost[0].uid !== uid) {
            const notificationID = uuidv4();
            await setDoc(doc(db, 'notifications', notificationID), {
              originID: commentReplyID,
              notificationID,
              recipientUID: selectedPost[0].uid,
              notRead: true,
              postID,
              postPhotoURL: w150,
              comment: commentText,
              profile: {
                fullname,
                username,
                photoURL,
                uid,
              },
              type: 'reply',
              source: 'post',
              date: Date.now()
            });            
          };
          if (replyUser.uid !== uid) {
            const replyID = uuidv4();
            await setDoc(doc(db, 'notifications', replyID), {
              originID: commentReplyID,
              notificationID: replyID,
              recipientUID: replyUser.uid,
              notRead: true,
              postID,
              postPhotoURL: w150,
              comment: commentText,
              profile: {
                fullname,
                username,
                photoURL,
                uid,
              },
              type: 'reply',
              source: 'comment',
              date: Date.now()
            });            
          };
        } else {
          console.error('comment object not found');
        };
      } else {
        console.error('post document not found');
      };
    }

    const getCommentData = async () => {
      const postRef = doc(db, 'postUploads', postID);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const newPost = [...selectedPost];
        console.log(postSnap.data());
        newPost.splice(0, 1, postSnap.data());
        console.log(newPost);
        setSelectedPost(newPost);      
      } else {
        console.error('error no document found');
      }
    }

    return (
      <main className='post-comments-input'>
        <section 
          className='mobile-comments-input'
          ref={headerRef}
        >
          <div className='mobile-comments-input-wrapper'>
            <div className='profile-photo-frame'>
              <img 
                alt={`${username}'s profile`} 
                src={photoURL} 
                className="comments-profile-photo"
              /> 
            </div>
            <form className='comment-submit-form'>
              <div className={isSaving ? 'comment-spinner-wrapper' : 'comment-spinner-wrapper hidden'}>
                <svg aria-label="Loading..." className='spinner' viewBox="0 0 100 100">
                  <rect fill="#555555" height="6" opacity="0" rx="3" ry="3" transform="rotate(-90 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.08333333333333333" rx="3" ry="3" transform="rotate(-60 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.16666666666666666" rx="3" ry="3" transform="rotate(-30 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.25" rx="3" ry="3" transform="rotate(0 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.3333333333333333" rx="3" ry="3" transform="rotate(30 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.4166666666666667" rx="3" ry="3" transform="rotate(60 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.5" rx="3" ry="3" transform="rotate(90 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.5833333333333334" rx="3" ry="3" transform="rotate(120 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.6666666666666666" rx="3" ry="3" transform="rotate(150 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.75" rx="3" ry="3" transform="rotate(180 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.8333333333333334" rx="3" ry="3" transform="rotate(210 50 50)" width="25" x="72" y="47">
                  </rect>
                  <rect fill="#555555" height="6" opacity="0.9166666666666666" rx="3" ry="3" transform="rotate(240 50 50)" width="25" x="72" y="47">
                  </rect>
                </svg>        
              </div>
              <textarea 
                className='comment-textarea'
                aria-label='Add a comment...'
                placeholder='Add a comment...'
                autoComplete='off'
                autoCorrect='off'
                spellCheck='false'
                ref={textareaRef}
                value={commentText}
                onChange={commentTextHandler}
                onKeyDown={enterKeyHandler}
                onBlur={() => setIsSearching(false)}
              ></textarea>
              <button 
                className='mobile-post-comment-button'
                disabled={commentText.length === 0}
                type='button'
                onClick={replyUser === null ? postComment : replyComment}
              >
                Post
              </button>
            </form>              
          </div>
          {replyUser !== null &&
            <div className='replying-notification'>
              <span className='replying-notification-text'>
                {`Replying to ${replyUser.username}`}
              </span>
              <button 
                className='close-reply-notification'
                onClick={cancelReply}
              >
                ✕
              </button>
            </div>          
          }
          {isSearching && !isSearchHashTag &&
            <section className='comment-search-results'>
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
              className='comment-search-results'
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
        <div 
          className='post-comments-wrapper'
          style={{
            maxHeight: `${commentsHeight}px`
          }}  
        >
          <ul 
            className='comment-list'
            ref={commentsListRef}
          >
            <li className='caption-wrapper'>
              <div className='comment-profile-photo-frame'>
                <img 
                  alt={`${selectedPost[0].username}'s profile`} 
                  src={selectedPost[0].photoURL} 
                  className="comments-profile-photo"
                /> 
              </div>
              <div className='comment-text-time-wrapper'>
                <div className='comment-text-wrapper'>
                  <h2 className='comment-username'>
                    {selectedPost[0].username}
                  </h2>
                  <span 
                    className='comment-text'
                  >
                    {stringToLinks(postCaption)}
                  </span>                    
                </div>
                <footer className='comment-footer'>
                  <time className='comment-time-stamp'>
                    {new Date(uploadDate).toDateString()}
                  </time>                  
                </footer>
              </div>
              
            </li>
            {comments.map((comment) => {
              const {
                commentID,
              } = comment;
              return (
                <li key={commentID} className='comment-wrapper'>
                  <Comment
                    w150 = {selectedPost[1].w150}
                    setSelectedComment = {setSelectedComment}
                    isCommentDeleteOpen = {isCommentDeleteOpen}
                    setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
                    stringToLinks={stringToLinks}
                    getPostData={getPostData}
                    isMobile={isMobile}
                    setIsLoadingPage={setIsLoadingPage}
                    isReply={false}
                    newReplyID={newReplyID}
                    textareaRef={textareaRef}
                    setCommentText={setCommentText}
                    replyUser={replyUser}
                    setReplyUser={setReplyUser}
                    selectedPost={selectedPost}
                    setSelectedPost={setSelectedPost}
                    postID={postID}
                    userData={userData}
                    comment={comment}
                    // navigateUserProfile={navigateUserProfile}
                    // onMouseEnter={onMouseEnter}
                    // onMouseLeave={onMouseLeave}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </main>
    )    
  } else {
    return (
      <div></div>
    )
  }
}

export default MobileComments;
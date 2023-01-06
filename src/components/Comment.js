import { 
  arrayUnion, 
  getDoc, 
  updateDoc, 
  doc, 
  getFirestore, 
  setDoc, 
  deleteDoc,
  query,
  collection,
  where,
  getDocs
} from 'firebase/firestore';
import firebaseApp from '../Firebase';
import { useEffect, useRef, useState } from 'react';
import './Comment.css';
import { v4 as uuidv4 } from 'uuid'
import CommentReplies from './CommentReplies';
import { useNavigate } from 'react-router-dom';

const db = getFirestore();
let lastPress = 0;

const Comment = (props) => {
  const {
    w150,
    setSelectedComment,
    isCommentDeleteOpen,
    setIsCommentDeleteOpen,
    stringToLinks,
    isFeatured,
    setCommentIDs,
    setIsLikedByModalOpen,
    getPostData,
    isMobile,
    setIsLoadingPage,
    newReplyID,
    parentCommentID,
    isReply,
    textareaRef,
    setCommentText,
    replyUser,
    setReplyUser,
    setSelectedPost,
    selectedPost,
    userData,
    postID,
    comment,
    navigateUserProfile,
    onMouseEnter,
    onMouseLeave,
  } = props;
  const {
    commentID,
    username,
    text,
    photoURL,
    uploadDate,
    uid,
    likes,
    replies,
  } = comment;
  const photoRef = useRef(null);
  const usernameRef = useRef(null);
  const userLikeIndex = likes.findIndex((like) => like.uid === userData.uid)
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentLiked, setIsCommentLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const navigate = useNavigate();
  const touchTimer = useRef(null);
  const tagTimerRef = useRef(null);

  useEffect(() => {
    if (userLikeIndex === -1) {
      setIsCommentLiked(false);
    } else {
      setIsCommentLiked(true);
    }
    setLikeCount(likes.length);
  }, []);

  const likeUploadToggle = async () => {
    console.log(isReply);
    const {
      photoURL,
      uid,
      displayName,
      fullname
    } = userData;
    const postRef = doc(db, 'postUploads', postID);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const { 
        comments,
        photos
      } = postSnap.data();
      const newComments = [...comments];
      const commentIndex = postSnap.data().comments
        .findIndex((comment) => comment.commentID === (isReply ? parentCommentID : commentID));
      if (commentIndex !== -1) {
        console.log('comment-found');
        if (isReply) {
          const { replies } = comments[commentIndex];
          const newReplies = [...replies];
          const replyIndex = replies.findIndex((reply) => reply.commentID === commentID);
          if (replyIndex !== -1) {
            let newComment;
            const { likes } = replies[replyIndex];
            const likeIndex = likes.findIndex((like) => like.uid === uid);
            if (likeIndex === -1) {
              setIsLiked(true);
              setIsCommentLiked(true);
              setLikeCount(likeCount + 1);
              const likeID = uuidv4();
              const newLike = {
                likeID,
                photoURL: photoURL,
                uid: uid,
                uploadDate: Date.now(),
                username: displayName,
                fullname: fullname,
              };
              if (replies[replyIndex].uid !== uid) {
                const notificationID = uuidv4();
                await setDoc(doc(db, 'notifications', notificationID), {
                  notificationID,
                  originID: likeID,
                  recipientUID: replies[replyIndex].uid,
                  notRead: true,
                  postID,
                  postPhotoURL: w150,
                  comment: replies[replyIndex].text,
                  profile: {
                    fullname,
                    username,
                    photoURL,
                    uid,
                  },
                  type: 'like',
                  source: 'comment',
                  date: Date.now()
                });                
              };
              const newLikes = [...likes, newLike];
              // comment is reply in props
              const newReply = {...comment, likes: newLikes}
              newReplies.splice(replyIndex, 1, newReply);
              newComment = {...comments[commentIndex], replies: newReplies}              
            } else {
              setIsCommentLiked(false);
              setLikeCount(likeCount - 1);
              const {
                likeID
              } = likes[likeIndex]
              const notificationQuery = query(collection(db, 'notifications'), 
                where('originID', '==', likeID));
              const notificationSnapshot = await getDocs(notificationQuery);
              notificationSnapshot.forEach( async (document) => {
                await deleteDoc(doc(db, 'notifications', document.data().notificationID))
              });
              const newLikes = [...likes];
              newLikes.splice(likeIndex, 1);
              const newReply = {...comment, likes: newLikes};
              newReplies.splice(replyIndex, 1, newReply);
              console.log(newReplies);
              newComment = {...comments[commentIndex], replies: newReplies}   
            }
            newComments.splice(commentIndex, 1, newComment);
            await updateDoc(postRef, {
              comments: newComments
            });
          };
        } else {
          const { likes } = postSnap.data().comments[commentIndex];
          const likeIndex = likes.findIndex((like) => like.uid === uid)
          if (likeIndex === -1) {
            setIsLiked(true);
            setIsCommentLiked(true);
            setLikeCount(likeCount + 1);
            const likeID = uuidv4();
            const newLike = {
              likeID,
              photoURL: photoURL,
              uid: uid,
              uploadDate: Date.now(),
              username: displayName,
              fullname: fullname,
            };
            if (comments[commentIndex].uid !== uid) {
              const notificationID = uuidv4();
              await setDoc(doc(db, 'notifications', notificationID), {
                notificationID,
                originID: likeID,
                recipientUID: comments[commentIndex].uid,
                notRead: true,
                postID,
                postPhotoURL: w150,
                comment: comments[commentIndex].text,
                profile: {
                  fullname,
                  username,
                  photoURL,
                  uid,
                },
                type: 'like',
                source: 'comment',
                date: Date.now()
              });              
            };
            const newLikes = [...likes, newLike];
            const newComment = {...comment, likes: newLikes};
            newComments.splice(commentIndex, 1, newComment);
            await updateDoc(postRef, {
              comments: newComments
            });
          } else {
            setIsCommentLiked(false);
            setLikeCount(likeCount - 1);
            const {
              likeID
            } = likes[likeIndex]
            const notificationQuery = query(collection(db, 'notifications'), 
              where('originID', '==', likeID));
            const notificationSnapshot = await getDocs(notificationQuery);
            notificationSnapshot.forEach( async (document) => {
              const {
                notificationID,
              } = document.data();
              await deleteDoc(doc(db, 'notifications', notificationID));
            });
            const newLikes = [...likes];
            newLikes.splice(likeIndex, 1);
            const newComment = {...comment, likes: newLikes};
            newComments.splice(commentIndex, 1, newComment);
            await updateDoc(postRef, {
              comments: newComments
            });
          }          
        }
        if (isFeatured) {
          return getPostData();
        }
        getCommentData();
      } else {
        console.error('error comment-index-not-found', commentIndex);
      };
    };
  };

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

  const replyHandler = () => {
    setCommentText(`@${username} `)
    if (isReply) {
      setReplyUser({...comment, commentID: parentCommentID});
    } else {
      setReplyUser(comment);
    }
    textareaRef.current.focus();
  }

  const formatTime = () => {
    const timePast = Date.now() - uploadDate;
    const minutesPast = timePast / 60000;
    const hoursPast = minutesPast / 60;
    const daysPast = hoursPast / 24;
    const weeksPast = daysPast / 7;
    switch (true) {
      case minutesPast < 1:
        return 'Now';
      case minutesPast < 60 && minutesPast > 1:
        return `${Math.floor(minutesPast)}m`;
      case hoursPast >= 1 && hoursPast < 24:
        return `${Math.floor(hoursPast)}h`;
      case daysPast >= 1 && daysPast < 7:
        return `${Math.floor(daysPast)}d`;
      case weeksPast >= 1:
        return `${Math.floor(weeksPast)}w`;
      default:
    }
  };

  const navigateLikedBy = async () => {
    await getPostData();
    if (isMobile) {
      if (isReply) {
        navigate(`/p/${postID}/c/${commentID}/liked_by`, {state: parentCommentID});
      }
      navigate(`/p/${postID}/c/${commentID}/liked_by`);  
    } else {
      setIsLikedByModalOpen(true);
      setCommentIDs({commentID: commentID, parentCommentID: parentCommentID});
    }
    setIsLoadingPage(false);    
  };

  const touchStart = (comment) => {
    setSelectedComment(comment);
    touchTimer.current = setTimeout(() => {
      setIsCommentDeleteOpen(true);
    }, 1000);
    clearTimeout(tagTimerRef.current);
    const time = new Date().getTime();
    const delta = time - lastPress;

    const DOUBLE_PRESS_DELAY = 400;
    if (delta < DOUBLE_PRESS_DELAY) {
      console.log('double press');
      const index = likes.findIndex((like) => like.uid === userData.uid);
      if (index === -1) {
        likeUploadToggle();
        setIsLiked(true);
      }
    } else {
      console.log('press');
    }
    lastPress = time;        
  };

  const touchEnd = () => {
    clearTimeout(touchTimer.current);
    touchTimer.current = null;
  }

  const commentModalHandler = (comment) => {
    setSelectedComment(comment);
    setIsCommentDeleteOpen(true);
  }

  if (isFeatured !== true) {
    return (
      <div className='replies-wrapper'>
        <div 
          className='comment-content'
          onTouchStart = {() => touchStart(comment)}
          onTouchEnd = {touchEnd}
        >
          <div 
            className='comment-profile-photo-frame'
            onClick={() => navigateUserProfile(username)}
            ref={photoRef}
            onMouseEnter={() => onMouseEnter(uid, photoRef.current)}
            onMouseLeave={onMouseLeave} 
          >
            <img 
              alt={`${username}'s profile`} 
              src={photoURL} 
              className="comments-profile-photo"
            /> 
          </div>
          <div className='comment-text-time-wrapper'>
            <div className='comment-text-wrapper'>
              <h2 
                className='comment-username'
                onClick={() => navigateUserProfile(username)}
                ref={usernameRef}
                onMouseEnter={() => onMouseEnter(uid, usernameRef.current)}
                onMouseLeave={onMouseLeave} 
              >
                {username}
              </h2>
              <span 
                className='comment-text'
              >
                {stringToLinks(text)}
              </span>                    
            </div>
            <footer className='comment-footer'>
              <time 
                className='comment-time-stamp'
                title={new Date(uploadDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              >
                {formatTime()}
              </time>
              {likeCount !== 0 &&
                <button 
                  className='comment-likes-counter'
                  onClick={navigateLikedBy}
                >
                  {`${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}
                </button>          
              }
              <button 
                className='comment-reply-button'
                onClick={replyHandler}
              >
                Reply  
              </button>
              {!isMobile &&
              <button 
                className='comment-links-button'
                onClick={() => commentModalHandler(comment)}
              >
                <svg aria-label="Comment Options" className="comment-options-svg" color="#8e8e8e" fill="#8e8e8e" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <circle cx="12" cy="12" r="1.5"></circle>
                  <circle cx="6" cy="12" r="1.5"></circle>
                  <circle cx="18" cy="12" r="1.5"></circle>
                </svg>
              </button>
              }          
            </footer>
          </div> 
          <button 
            className='comment-like-button'
            onClick={likeUploadToggle}
          >
            {isCommentLiked
              ? <svg aria-label="Unlike" className={isLiked ? "like-filled-svg animated" : 'like-filled-svg'} color="#ed4956" fill="#ed4956" height="12" role="img" viewBox="0 0 48 48" width="12">
                  <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                </svg>
              : <svg aria-label="Like" className="heart-like-svg" color="#262626" fill="#262626" height="12" role="img" viewBox="0 0 24 24" width="12">
                  <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
                </svg>
            }
          </button>
        </div>
        {!isReply && replies.length !== 0 &&
          <CommentReplies
            w150 = {w150}
            setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
            setSelectedComment = {setSelectedComment}
            stringToLinks={stringToLinks}
            setIsLikedByModalOpen={setIsLikedByModalOpen}
            setCommentIDs={setCommentIDs}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            getPostData={getPostData}
            isMobile={isMobile}
            setIsLoadingPage={setIsLoadingPage}
            newReplyID={newReplyID}
            parentCommentID={commentID}
            textareaRef={textareaRef}
            setCommentText={setCommentText}
            replyUser={replyUser}
            setReplyUser={setReplyUser}
            selectedPost={selectedPost}
            setSelectedPost={setSelectedPost}
            postID={postID}
            userData={userData}
            replies={replies}
          />       
        }
      </div>
    );
  } else {
    return (
      <div className='comment-content'>
        <div className='comment-text-wrapper'>
          <h2 
            className='comment-username'
            onClick={() => navigateUserProfile(username)}
            ref={usernameRef}
            onMouseEnter={() => onMouseEnter(uid, usernameRef.current)}
            onMouseLeave={onMouseLeave} 
          >
            {username}
          </h2>
          <span 
            className='comment-text'
          >
            {stringToLinks(text)}
          </span>                    
        </div>
        <button 
          className='comment-like-button'
          onClick={likeUploadToggle}
        >
          {isCommentLiked
            ? <svg aria-label="Unlike" className={isLiked ? "like-filled-svg animated" : 'like-filled-svg'} color="#ed4956" fill="#ed4956" height="12" role="img" viewBox="0 0 48 48" width="12">
                <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
              </svg>
            : <svg aria-label="Like" className="heart-like-svg" color="#262626" fill="#262626" height="12" role="img" viewBox="0 0 24 24" width="12">
                <path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path>
              </svg>
          }
        </button>
      </div>
    );
  };
};

export default Comment;
import './PostComments.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import firebaseApp from '../Firebase';
import { getFirestore, setDoc, doc, updateDoc, arrayUnion, query, collection, where, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'
import { useParams } from 'react-router-dom';
import CommentSearchModal from './CommentSearchModal';
import EmojiModal from './EmojiModal';

const db = getFirestore();
// let userIndex = null

const PostComments = (props) => {
  const {
    getPostData,
    isContentClicked,
    w150,
    profileTagHandler,
    isSearchHashTag,
    setIsSearchHashTag,
    setIsSearching,
    isSearching,
    searchResults,
    setSearchString,
    commentText,
    setCommentText,
    textareaRef,
    postCommentsRef,
    setSelectedPost,
    newComments,
    setNewComments,
    userData,
    postID,
    replyUser,
    setReplyUser,
    setNewReplyID,
    selectedPost,
  } = props;
  const params = useParams();
  // const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // const textareaRef = useRef(null);
  const [isSearchModalFlipped, setIsSearchModalFlipped] = useState(false);
  const [userIndex, setUserIndex] = useState(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  useEffect(() => {
    if (commentText === '') {
      setReplyUser(null);
    }
  }, [commentText]);

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

  const insertEmoji = (hexNumber) => {
    setCommentText((commentText) => {
      return commentText.concat(String.fromCodePoint(hexNumber));
    });
  };

  useLayoutEffect(() => {
      textareaRef.current.style.height = '1px'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;    
  }, [commentText, textareaRef]);

  const {
    fullname,
    username,
    photoURL,
    uid,
  } = userData;
  
  const postComment = async (event) => {
    if (event !== undefined) {
      event.preventDefault();
    }
    setIsSaving(true);
    const postRef = doc(db, 'postUploads', postID);
    const commentID = uuidv4();
    const commentDoc = {
      commentID,
      photoURL: photoURL,
      text: commentText,
      uid: uid,
      uploadDate: Date.now(),
      username: username,
      likes: [],
      replies: [],
    }
    await updateDoc(postRef, {
      comments: arrayUnion(commentDoc)
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
    if (params.postID === undefined) {
      setNewComments([...newComments, commentDoc])      
    } else {
      const photoArray = [];
      const profilePhotoData = query(collection(db, 'photoUploads'), 
        where('postID', '==', postID), orderBy('index'));
      const profileImageDataSnap = await getDocs(profilePhotoData);
      profileImageDataSnap.forEach((doc) => {
        photoArray.push(doc.data());
      });
      const profilePostDocument = doc(db, 'postUploads', postID);
      const postSnap = await getDoc(profilePostDocument);

      setSelectedPost([postSnap.data(), ...photoArray]);
      postCommentsRef.current.scrollTop = postCommentsRef.current.scrollHeight;
    }
    getPostData();
    setCommentText('');
    setIsSaving(false);
  };

  const enterKeyHandler = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      replyUser === null
        ? postComment()
        : replyComment();
    };
  }

  const replyComment = async (event) => {
    const {
      displayName,
      fullname,
    } = userData;
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
          if (textTags[index] !== replyUser.uid || textTags[index] !== uid) {
            const notificationID = uuidv4();
            await setDoc(doc(db, 'notifications', notificationID), {
              originID: commentReplyID,
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

  const emojiModalHandler = (event) => {
    if (!isEmojiOpen) {
      event.stopPropagation();
    };
    setIsEmojiOpen(true);
  };

  return (
    <section className='post-comment'>
      {isEmojiOpen &&
        <EmojiModal
          isContentClicked = {isContentClicked}
          insertEmoji = {insertEmoji}
          setIsEmojiOpen = {setIsEmojiOpen}
        />
      }
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
      <button 
        className='emoji-menu-button'
        onClick={emojiModalHandler}
      >
        <svg aria-label="Emoji" className="emjoi-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
          <path d="M15.83 10.997a1.167 1.167 0 101.167 1.167 1.167 1.167 0 00-1.167-1.167zm-6.5 1.167a1.167 1.167 0 10-1.166 1.167 1.167 1.167 0 001.166-1.167zm5.163 3.24a3.406 3.406 0 01-4.982.007 1 1 0 10-1.557 1.256 5.397 5.397 0 008.09 0 1 1 0 00-1.55-1.263zM12 .503a11.5 11.5 0 1011.5 11.5A11.513 11.513 0 0012 .503zm0 21a9.5 9.5 0 119.5-9.5 9.51 9.51 0 01-9.5 9.5z"></path>
        </svg>
      </button>
      <form className='post-comment-form'>
        <textarea 
          className='comment-textarea'
          aria-label='Add a comment...'
          placeholder='Add a comment...'
          autoComplete='off'
          autoCorrect='off'
          ref={textareaRef}
          value={commentText}
          onChange={commentTextHandler}
          onKeyDown={enterKeyHandler}
          onBlur={() => setIsSearching(false)}
        ></textarea>
        <button 
          className='post-comment-button'
          disabled={commentText.length === 0}
          type='button'
          onClick={replyUser === null ? postComment : replyComment}
        >
          Post
        </button>
      </form>
      {isSearching &&
        <CommentSearchModal
          isSearchHashTag = {isSearchHashTag}
          textareaRef={textareaRef}
          setUserIndex={setUserIndex}
          setIsSearching={setIsSearching}
          userIndex={userIndex}
          commentText={commentText}
          setCommentText={setCommentText}
          isSearchModalFlipped={isSearchModalFlipped}
          searchResults={searchResults}
        />
      }
    </section>
  )
}

export default PostComments;
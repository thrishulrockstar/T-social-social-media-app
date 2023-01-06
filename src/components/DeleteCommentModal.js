import { query, collection, where, getDocs, arrayRemove, updateDoc, doc, getFirestore, getDoc, deleteDoc } from 'firebase/firestore';
import './DeleteCommentModal.css';
import firebaseApp from '../Firebase';
import { useEffect } from 'react';

const db = getFirestore();

const DeleteCommentModal = (props) => {
  const {
    userData,
    setSelectedPost,
    selectedPost,
    selectedComment,
    setIsCommentDeleteOpen,
  } = props;

  const deleteComment = async () => {
    const {
      commentID,
      parentID,
    } = selectedComment;
    const {
      postID,
    } = selectedPost[0];
    const postReference = doc(db, 'postUploads', postID);
    const postDocumentSnapshot = await getDoc(postReference);
    const {
      comments
    } = postDocumentSnapshot.data();
    if (parentID === undefined) {
      await updateDoc(postReference, {
        comments: arrayRemove(selectedComment)
      });

    } else {
      const index = comments.findIndex((comment) => comment.commentID === parentID);
      const replyIndex = comments[index].replies.findIndex((reply) => reply.commentID === commentID);
      const newComments = [...comments];
      const replies = [...comments[index].replies];
      replies.splice(replyIndex, 1);
      const newComment = {...comments[index], replies}
      newComments.splice(index, 1, newComment);
      await updateDoc(postReference, {
        comments: newComments
      });
    };
    const notificationQuery = query(collection(db, 'notifications'), where('originID', '==', commentID));
    const notificationSnapshot = await getDocs(notificationQuery);
    notificationSnapshot.forEach( async (document) => {
      const {
        notificationID
      } = document.data();
      await deleteDoc(doc(db, 'notifications', notificationID));
    });
    const newSelectedPost = [...selectedPost];
    const newPostSnapShot = await getDoc(postReference);
    newSelectedPost.splice(0, 1, newPostSnapShot.data());
    setSelectedPost(newSelectedPost)
    setIsCommentDeleteOpen(false);
  };

  useEffect(() => {
    console.log(selectedPost);
  }, []);

  return (
    <div 
      className='profile-photo-modal'
      onClick={() => setIsCommentDeleteOpen(false)}
    >
      <div 
        className='delete-comment-content'
        onClick={(event) => event.stopPropagation()}
      >
        {(selectedComment.uid === userData.uid || selectedPost[0].uid === userData.uid) &&
          <button 
            className='delete-comment-button'
            onClick={deleteComment}
          >
            Delete
          </button>        
        }
        <button 
          className='cancel-modal-button'
          onClick={() => setIsCommentDeleteOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteCommentModal;
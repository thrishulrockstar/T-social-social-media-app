import "./LikedByModal.css";
import LikedBy from "../pages/LikedBy";
import PeopleList from "./PeopleList";
import { useEffect, useState } from "react";

const LikedByModal = (props) => {
  const {
    setCommentIDs,
    commentIDs,
    onMouseEnter,
    onMouseLeave,
    selectedListProfile,
    setIsLikedByModalOpen,
    unfollowModalHandler,
    followHandler,
    userData,
    selectedPost,
    isFollowLoading,
  } = props;
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflowY = 'scroll';
    }
  }, []);

  const stopBubbles = (event) => {
    event.stopPropagation();
  }

  useEffect(() => {
    console.log(commentIDs)
  }, [commentIDs])

  useEffect(() => () => {
    setCommentIDs('');
  }, []);

  useEffect(() => {
    const { comments } = selectedPost[0];
    if (commentIDs.commentID !== undefined) {
      let commentID;
      commentIDs.parentCommentID !== undefined
        ? commentID = commentIDs.parentCommentID
        : commentID = commentIDs.commentID
      console.log(commentID);
      const commentIndex = comments
        .findIndex((comment) => comment.commentID === commentID);
      if (commentIndex !== -1) {
        setLikes(comments[commentIndex].likes);
      } else if (commentIDs.parentCommentID !== undefined) {
        const { replies } = comments[commentIndex];
        const replyIndex = replies
          .findIndex((reply) => reply.commentID === commentIDs.commentID);
        setLikes(replies[replyIndex].likes);
      }
    } else {
      setLikes(selectedPost[0].likes);
    }; 
  }, [commentIDs.commentID, commentIDs.parentCommentID, selectedPost]);

  return (
    <div className="profile-photo-modal" onClick={() => setIsLikedByModalOpen(false)}>
      <div className="liked-by-content" onClick={stopBubbles}>
        <header className="liked-by-modal-header">
          <h1 className="liked-by-modal-header-text">
            Likes
          </h1>
          <button className="liked-by-modal-close-button" onClick={() => setIsLikedByModalOpen(false)}>
            <svg aria-label="Close" className="close-svg" color="#262626" fill="#262626" height="18" role="img" viewBox="0 0 24 24" width="18">
              <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
            </svg>
          </button>
        </header>
        <section className="liked-profiles-wrapper">
          {/* <LikedBy 
            unfollowModalHandler={unfollowModalHandler}
            followHandler={followHandler}
            isFollowLoading={isFollowLoading}
            userData={userData} 
            selectedPost={selectedPost}
          />           */}
          <PeopleList
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            selectedListProfile={selectedListProfile}
            allUserProfiles={likes}
            userData={userData}
            followHandler={followHandler}
            isFollowLoading={isFollowLoading}
            unfollowModalHandler={unfollowModalHandler}
          /> 
        </section>

      </div>
    </div>
  );
};

export default LikedByModal;
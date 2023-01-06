import './CommentReplies.css';
import Comment from '../components/Comment';
import React, { useLayoutEffect, useState } from 'react';

const CommentReplies = (props) => {
  const {
    w150,
    setIsCommentDeleteOpen,
    setSelectedComment,
    stringToLinks,
    setIsLikedByModalOpen,
    setCommentIDs,
    onMouseEnter,
    onMouseLeave,
    setIsLoadingPage,
    getPostData,
    isMobile,
    newReplyID,
    parentCommentID,
    replies,
    textareaRef,
    setCommentText,
    replyUser,
    setReplyUser,
    setSelectedPost,
    selectedPost,
    userData,
    postID,
  } = props;
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const repliesToggle = () => {
    console.log('toggle');
    isRepliesOpen ? setIsRepliesOpen(false) : setIsRepliesOpen(true);
  }

  useLayoutEffect(() => {
    if (parentCommentID === newReplyID) {
      setIsRepliesOpen(true)
    }
  }, [newReplyID, parentCommentID]);

  return (
    <ul className='comment-replies'>
      <li className='toggle-replies-button-wrapper'>
        <button 
          className='toggle-replies-button'
          onClick={repliesToggle}
        >
          <div className='toggle-replies-long-dash'>
          </div>
          <span className='toggle-replies-text'>
            {isRepliesOpen 
              ? 'Hide replies'
              : `View replies (${replies.length})`
            }
          </span>
        </button>
      </li>
      {isRepliesOpen &&
        <React.Fragment>
          {replies.map((reply) => {
            return (
              <li 
                key={reply.commentID}
                className='comment-reply'
              >
                <Comment
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
                  parentCommentID={parentCommentID}
                  isReply={true} 
                  textareaRef={textareaRef}
                  setCommentText={setCommentText}
                  replyUser={replyUser}
                  setReplyUser={setReplyUser}
                  selectedPost={selectedPost}
                  setSelectedPost={setSelectedPost}
                  postID={postID}
                  userData={userData}
                  comment={reply}
                />
              </li>
            );
          })}        
        </React.Fragment>      
      }
    </ul>
  );
};

export default CommentReplies;
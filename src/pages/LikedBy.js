import { useEffect, useState } from 'react';
import './LikedBy.css'
import PeopleList from '../components/PeopleList';
import { useParams, useLocation } from 'react-router-dom';

const LikedBy = (props) => {
  const {
    selectedListProfile,
    unfollowModalHandler,
    followHandler,
    userData,
    selectedPost,
    isFollowLoading,
  } = props;
  const params = useParams();
  const location = useLocation();
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const { comments } = selectedPost[0];
    if (params.commentID !== undefined) {
      let commentID;
      location.state !== null
        ? commentID = location.state
        : commentID = params.commentID;
      console.log(commentID);
      const commentIndex = comments.findIndex((comment) => comment.commentID === commentID);
      if (commentIndex !== -1) {
        setLikes(comments[commentIndex].likes);
      } else if (location.state !== null) {
        const { replies } = comments[commentIndex];
        const replyIndex = replies.findIndex((reply) => reply.commentID === params.commentID);
        setLikes(replies[replyIndex].likes);
      }
    } else {
      setLikes(selectedPost[0].likes);
    }
  }, [location.state, params.commentID, selectedPost]);

  return (
    <main className='liked-by-wrapper'>
      <PeopleList
        // onMouseEnter={onMouseEnter}
        // onMouseLeave={onMouseLeave}
        selectedListProfile={selectedListProfile}
        allUserProfiles={likes}
        userData={userData}
        followHandler={followHandler}
        isFollowLoading={isFollowLoading}
        unfollowModalHandler={unfollowModalHandler}
      /> 
    </main>
  )
}

export default LikedBy
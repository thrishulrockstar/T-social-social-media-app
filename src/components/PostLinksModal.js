import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import './PostLinksModal.css'

const PostLinksModal = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const {
    isLocationPost,
    userData,
    deletePost,
    setSelectedPost,
    selectedPost,
    setIsPostLinksOpen,
  } = props;
  const [isDeleteClicked, setIsDeleteClicked] = useState(false);

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
    console.log(selectedPost);
  }, [selectedPost]);

  const navigationHandler = () => {
    console.log(selectedPost[1]);
    navigate(`/p/${selectedPost[1].postID}`);
    setIsPostLinksOpen(false);
  }

  const closeModal = () => {
    console.log(params);
    if (params.postID !== undefined) {
      setSelectedPost('')
    }
    setIsPostLinksOpen(false);
  }

  const deletePostHandler = async (postID) => {
    console.log(postID);
    await deletePost(postID);
    closeModal();
    navigate(-1);
  }

  useEffect(() => {
    console.log(params.postID)
  }, [params]);

  return (
    <div className="profile-photo-modal" onClick={closeModal}>
      {!isDeleteClicked &&
        <div className="post-links-content" onClick={stopBubbles}>
          <div className="post-links-buttons">
            {selectedPost[0].uid === userData.uid &&
              <button 
                className='delete-post-button'
                onClick={() => setIsDeleteClicked(true)}
              >
                Delete
              </button>            
            }
            {!isLocationPost &&
              <button 
                className="go-to-post-button"
                onClick={navigationHandler}
              >
                Go to Post
              </button>          
            }
            <button className="cancel-button" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>      
      }
      {isDeleteClicked &&
        <div className="post-links-content" onClick={stopBubbles}>
          <div className="post-links-buttons">
            <div className="discard-post-modal-text">
              <h1 className="discard-modal-title-text">
                Delete Post?
              </h1>
              <div className="discard-modal-text">
                Are you sure you want to delete this post?
              </div>
            </div>
            <button className="discard-modal-button" onClick={() => deletePostHandler(selectedPost[0].postID)} >Delete</button>
            <button className="discard-modal-cancel-button" onClick={closeModal} >Cancel</button>
          </div>
        </div>
      }

    </div>
  )
};

export default PostLinksModal
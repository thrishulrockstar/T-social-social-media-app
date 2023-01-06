import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import './MessagePost.css';

const MessagePost = (props) => {
  const {
    message,
  } = props;
  const {
    username,
    photoURL,
    postCaption,
    postID,
  } = message.post[0];
  const photo = message.post[1];
  const [postHidden, setPostHidden] = useState(true);

  const postHiddenToggle = () => postHidden ? setPostHidden(false) : setPostHidden(true);

  return (
    <section className='message-post'>
      <header className='message-post-header'>
        <div className='profile-photo-frame'>
          <img alt='' className='profile-photo' src={photoURL} />
        </div>
        <Link to={`/${username}`}>
          {username}
        </Link>
      </header>
      <Link 
        className='message-post-photo-frame'
        to={`/p/${postID}`}
        style={{paddingBottom: `${100 / photo.aspectRatio}%`}}    
      >
        <img
          decoding='sync' 
          alt={postCaption} 
          className='feed-photo-post-image' 
          sizes={`236px`}
          srcSet={`
            ${photo.w1080} 1080w,
            ${photo.w750} 750w,
            ${photo.w640} 640w,
            ${photo.w480} 480w,
            ${photo.w320} 320w,
            ${photo.w240} 240w,
            ${photo.w150} 150w
          `}

        />
        {message.post.length > 2 &&
          <span className='carousel-icon'>
            <svg aria-label="Carousel" className="carousel-svg" color="#ffffff" fill="#ffffff" height="22" role="img" viewBox="0 0 48 48" width="22">
              <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path>
            </svg>
          </span>
        }
      </Link>
      <footer className='message-post-footer'>
        <span className='message-post-caption-username'>
          {username}
        </span>
        {postCaption.length > 50 &&
          <span className='post-caption-text'>
            <span className='first-caption-section'>
              {postCaption.substring(0, 50)}
            </span>
            {postHidden &&
              <React.Fragment>
                <span className='caption-elipsis'>...</span>
                <button 
                  className='caption-more-button'
                  onClick={postHiddenToggle} 
                >
                  [...]
                </button> 
              </React.Fragment>                     
            }
            {!postHidden &&
              <span className='second-caption-section'>
                {postCaption.substring(50)}
              </span>
            }
          </span>                  
        }
        {postCaption.length < 50 &&
          <span className='post-caption-text'>
            {postCaption}                      
          </span>
        }
      </footer>
    </section>
  )
}

export default MessagePost;
import './PhotoGrid.css';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useWindowSize from '../hooks/useWindowSize';

const PhotoGrid = (props) => {
  const {
    photoRef,
    bottomRowsPast,
    topRowsPast,
    isMobile,
    getPostData,
    setIsLoadingPage,
    setBackgroundLocation,
    postsArray
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [width, height] = useWindowSize();
  const [photoWidth, setPhotoWidth] = useState(0);

  const imageSizeHandler = () => {
    let newWidth;
    if (width > 736) {
      newWidth = (width - 96) / 3;
      if (newWidth > 293) {
        newWidth = 293;
      };      
    } else {
      newWidth = (width - 6) / 3;
    }
    setPhotoWidth(newWidth);
  }

  useEffect(() => {
    console.log(photoWidth);
  }, [photoWidth]);

  useEffect(() => {
      imageSizeHandler();
  }, [width]);

  const navigatePost = async (postID) => {
    if (isMobile) {
      await getPostData(postID);
      navigate(`/p/${postID}`);
      setIsLoadingPage(false);      
    } else {
      setBackgroundLocation(location);
      navigate(`/p/${postID}`);
    }
  }

  return (
    <div className="photo-grid-content">
    {postsArray.map((post, index) => {
      const {
        photos,
        postID,
        likes,
        comments,
      } = post[0];
      const {
        photoID,
        aspectRatio,
        captionText,
      } = post[1];
      let photoCenter;
      if (aspectRatio > 1) {
        photoCenter = {
          left: `-${((photoWidth * aspectRatio) - photoWidth) / 2}px`
        }
      } else if (aspectRatio < 1) {
        photoCenter = {
          top: `-${((photoWidth / aspectRatio) - photoWidth) / 2}px`
        }
      }
      if (index < topRowsPast * 3) {
        return null;
      };
      if (index > bottomRowsPast * 3) {
        return null;
      }
      return (
        <div 
          key={photoID} 
          className="photo-post"
          onClick={() => navigatePost(postID)}
          ref={photoRef}
        >
          {!isMobile && 
            <div className='photo-hover-details'>
              <ul className='photo-hover-details-list'>
                <li className='likes-counter'>
                  <div className='likes-small-sprite'>
                  </div>                      
                  <span className='likes-number'>
                    {likes.length}
                  </span>
                </li>
                <li className='comments-counter'>
                  <div className='comments-small-sprite'>
                  </div>                      
                  <span className='comments-number'>
                    {comments.length}
                  </span>
                </li>
              </ul>
            </div>                
          }
          {photos.length > 1 &&
            <div className='post-gallery-icon'>
              <svg aria-label="Carousel" className="gallery-svg" color="#ffffff" fill="#ffffff" height="22" role="img" viewBox="0 0 48 48" width="22">
                <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path>
              </svg>
            </div>                
          }
          <div className="photo-post-padding">
            <img 
              alt={captionText} 
              className='photo-post-image' 
              sizes={aspectRatio > 1 ? `${photoWidth * aspectRatio}px` : `${photoWidth}px`} 
              srcSet={`
                ${post[1].w1080} 1080w,
                ${post[1].w750} 750w,
                ${post[1].w640} 640w,
                ${post[1].w480} 480w,
                ${post[1].w320} 320w,
                ${post[1].w240} 240w,
                ${post[1].w150} 150w
              `}
              style={photoCenter}
            />                    
          </div>
        </div>
      )
    })}
  </div>  
  );
};

export default PhotoGrid;
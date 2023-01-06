import './Tag.css';
import { useLayoutEffect, useEffect, useRef, useState } from 'react';

const Tag = (props) => {
  const {
    isPost,
    setTagIDs,
    tagIDs,
    isTagsHidden,
    deleteTagModal,
    isModal,
    setIsMoved,
    isMoved,
    imageDimensions,
    index,
    setTagData,
    tagData,
    imageRef,
    left,
    top,
    username,
  } = props;
  const tagRef = useRef();
  const [tagTabLeft, setTagTabLeft] = useState(50);
  const [tagTabTop, setTagTabTop] = useState(0);
  const [tagLeft, setTagLeft] = useState(50);
  const [isTagTapped, setIsTagTapped] = useState(false);

  const onTouchEnd = () => {
    console.log('end')
    if (isMoved) {
      setIsMoved(false);
    } else {
      isTagTapped 
        ? setIsTagTapped(false) 
        : setIsTagTapped(true);
    }
  }

  const tagOrientationHandler = () => {
    const tag = tagRef.current.getBoundingClientRect();
    const imageDimension = imageRef.current.getBoundingClientRect();
    const {
      width,
      height,
    } = imageDimension;
    const tagWidthOverflow = ((tag.width / width) * 100) / 2;
    const tagHeightOverflow = ((tag.height / height) * 100);
    const tagSizeMultiplyer = width / tag.width;
    const leftUpperBoundery = 100 - (tagWidthOverflow + 2.5);
    const leftLowerBoundery = tagWidthOverflow + 2.5;
    if (left >= leftUpperBoundery) { 
      const percentOverBoundery = left - leftUpperBoundery;
      const newLeft = 50 + (percentOverBoundery * tagSizeMultiplyer);
      setTagLeft(newLeft);
      if (newLeft > 85) {
        setTagTabLeft(85);
      } else {
        setTagTabLeft(newLeft);
      }
    } else if (left <= leftLowerBoundery){
      console.log(left, leftLowerBoundery, tag.width, width);
      const percentUnderBoundery = leftLowerBoundery - left;
      const newLeft = 50 - (percentUnderBoundery * tagSizeMultiplyer);
      setTagLeft(newLeft);
      if (newLeft < 15) {
        setTagTabLeft(15);
      } else {
        setTagTabLeft(newLeft);
      }
    } else {
      setTagTabLeft(50);
    }
    if (top >= (100 - tagHeightOverflow - 5)) {
      setTagTabTop(100);
    } else {
      setTagTabTop(0);
    }
  }

  const deleteTag = (event) => {
    console.log('delete');
    event.stopPropagation();
    const newData = [...tagData];
    newData.splice(index, 1);
    setTagData(newData);
    const newTagIDs = [...tagIDs];
    newTagIDs.splice(index, 1);
    setTagIDs(newTagIDs);
  }

  useLayoutEffect(() => {
    if (imageRef.current !== null) {
      tagOrientationHandler();
    }
  }, [tagData]);

  useEffect(() => {
    if (!isTagsHidden) {
      tagOrientationHandler();
    }
  }, [isTagsHidden])

  const mouseDownHandler = () => {
    if (isModal) {
      setIsTagTapped(true);
    }
  }

  const mouseUpHandler = () => {
    if (isModal && isPost) {
      setIsTagTapped(false);
    }
  }

  return (
    <div 
      className={tagTabTop === 100 ? 'photo-tag flipped' : 'photo-tag'}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-${tagLeft}%, -${tagTabTop}%) ${isTagTapped && isModal ? 'scale(1.08)' : ''}`

      }}
      ref={tagRef}
      onTouchEnd={onTouchEnd}
      onMouseUp={mouseUpHandler}
      onMouseDown={mouseDownHandler}
    >
      <div 
        className={tagTabTop === 100 ? 'photo-tag-tab flipped' : 'photo-tag-tab'}
        style={{
          left: `${tagTabLeft}%`
        }}
      ></div>
      <span 
        className='photo-tag-username'
        draggable='false'
      >
        {username}
      </span>
      {isTagTapped && !isMoved && !isModal && !isPost &&
        <span 
          className='photo-tag-delete-sprite'
          onTouchEnd={deleteTag}
        >
        </span>      
      }
      {isModal &&
        <button 
          className='modal-delete-tag-button'
          onClick={deleteTagModal}
        >
          <svg aria-label="Close" className="tag-delete-svg" color="#ffffff" fill="#ffffff" height="16" role="img" viewBox="0 0 24 24" width="16">
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line>
          </svg>
        </button>
      }
    </div>
  )
};

export default Tag;
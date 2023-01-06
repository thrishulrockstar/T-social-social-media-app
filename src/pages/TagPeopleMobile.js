import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TagPeopleMobile.css'
import TagSearch from '../components/TagSearch';
import Tag from '../components/Tag';
import useWindowSize from '../hooks/useWindowSize';

const TagPeopleMobile = (props) => {
  const {
    setIsSearchHashTag,
    tagData,
    setTagData,
    setSearchResults,
    setSearchString,
    searchResults,
    searchString,
    imageFitHeight,
    aspectRatio,
    imageFlipped,
    editedPhoto,
    imageHeight,
    imageWidth,
    setTagIDs,
    tagIDs
  } = props;
  const navigate = useNavigate();
  const [width, height] = useWindowSize()
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const imageRef = useRef(null);
  const [touchLocation, setTouchLocation] = useState(null);
  const [tagSelectedIndex, setTagSelectedIndex] = useState(-1);
  const [movementStart, setMovementStart] = useState(null);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [isMoved, setIsMoved] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);


  useLayoutEffect(() => {
    const image = imageRef.current.getBoundingClientRect();
    setImageDimensions({
      width: image.width,
      height: image.height,
      left: image.left,
      top: image.top
    })
  }, [width]);

  const getTouchLocation = (event) => {
    const {
      clientX,
      clientY,
    } = event.touches[0];
    setIsSearchOpen(true);
    setIsSearchHashTag(false);
    const image = imageRef.current.getBoundingClientRect();
    const {
      width,
      height,
      left,
      top,
    } = image
    let x = ((clientX - left) / width) * 100;
    let y = ((clientY - top) / height) * 100;
    console.log('left:', x, "top:", y);
    if (x > 95) {
      x = 95;
    };
    if (x < 5) {
      x = 5;
    };
    if (y > 95) {
      y = 95;
    };
    if (y < 2.5) {
      y = 2.5;
    };
    setTouchLocation({
      left: x,
      top: y,
    });
  }

  const onTouchStart = (event, index) => {
    console.log("start")
    const {
      clientX,
      clientY,
    } = event.touches[0];
    const {
      width,
      height,
      left,
      top
    } = imageDimensions;
    let startLeft = ((clientX - left) / width) * 100;
    let startTop = ((clientY - top) / height) * 100;
    setTagSelectedIndex(index);
    console.log(left,top);
    setPreviousPosition({
      previousLeft: tagData[index].left,
      previousTop: tagData[index].top,
    })
    setMovementStart({
      startLeft: startLeft,
      startTop: startTop 
    })
  };

  const onTouchMove = (event) => {
    console.log('middle')
    setIsMoved(true);
    // const image = imageRef.current.getBoundingClientRect();
    const {
      width,
      height,
      left,
      top,
    } = imageDimensions
    const {
      clientX,
      clientY
    } = event.touches[0];
    const {
      startLeft,
      startTop
    } = movementStart;
    const {
      previousLeft,
      previousTop
    } = previousPosition;
    console.log(startTop, startLeft, (clientY / height) * 100);
    const topOffset = startTop - previousTop;
    const leftOffset = startLeft - previousLeft;
    console.log(startTop, '-', previousTop, '=', topOffset);
    let movementX = (((clientX - left) / width) * 100) - leftOffset;
    let movementY = (((clientY - top) / height) * 100) - topOffset;
    console.log(clientX, clientY);
    if (movementX > 95) {
      movementX = 95;
    };
    if (movementX < 5) {
      movementX = 5;
    };
    if (movementY > 95) {
      movementY = 95;
    };
    if (movementY < 2.5) {
      movementY = 2.5;
    };
    const movement = {
      left: movementX,
      top: movementY,
    };
    console.log('x:', movementX, "y:", movementY);
    const newTagData = [...tagData];
    const newData = {...tagData[tagSelectedIndex], ...movement}
    newTagData.splice(tagSelectedIndex, 1, newData);
    setTagData(newTagData);
  };

  const navigationHandler = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
    } else {
      navigate(-1);
    }
  }

  useEffect(() => {
    console.log(tagData);
  },[tagData]);

  return (
    <main className='mobile-upload-tag-people'>
      <header className='mobile-upload-tag-people-header'>
        <div className='header-content-wrapper'>
          <button 
            className="close-new-post-button" 
            onClick={navigationHandler}
          >
            <svg aria-label="Close" className="close-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line>
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line>
            </svg>
          </button>
          <h1 className="new-post-header-text">
            Tag People
          </h1>
          <button 
            className={isSearchOpen ? "done-new-post-button hidden" : "done-new-post-button"}
            onClick={() => navigate('/create/details')}
          >
            Done
          </button>
        </div>
      </header>
      {isSearchOpen &&
        <section className='mobile-upload-tag-search'>
          <TagSearch
            setTagIDs={setTagIDs}
            tagIDs={tagIDs}
            setSearchResults={setSearchResults}
            tagData={tagData}
            touchLocation={touchLocation}
            setIsSearchOpen={setIsSearchOpen}
            setTagData={setTagData} 
            searchString={searchString}
            setSearchString={setSearchString}
            searchResults={searchResults}
          />
        </section>        
      }
      {!isSearchOpen &&
      <React.Fragment>
        <section className='photo-padding-wrapper'>
          <div 
            className='photo-background-wrapper'
            >
            <div 
              className='photo-tags-wrapper'
              style={imageFitHeight 
                ? {
                  height: `${aspectRatio >= 1 ? imageHeight : imageWidth}%`,
                  width: `${aspectRatio < 1 ? imageWidth : imageHeight}%`
                }
                : {
                    width: `${imageFlipped ? imageHeight : imageWidth}%`,
                    height: `${imageFlipped ? imageWidth : imageHeight}%`
                  }
              }
              ref={imageRef}
              onTouchMove={onTouchMove} 
            >
              <img 
                alt='' 
                className='uploaded-photo-people-tag' 
                src={URL.createObjectURL(editedPhoto)}
                onTouchStart={getTouchLocation}
              />
              {tagData.map((tag, index) => {
                const {
                  left,
                  top,
                  username,
                  uid,
                } = tag;
                return (
                  <div 
                    key={uid}
                    onTouchStart={(event) => onTouchStart(event, index)}
                  >
                    <Tag
                      setTagIDs={setTagIDs}
                      tagIDs={tagIDs}
                      setIsMoved={setIsMoved}
                      isMoved={isMoved}
                      imageDimensions={imageDimensions}
                      index={index}
                      setTagData={setTagData}
                      tagData={tagData}
                      key={uid}
                      imageRef={imageRef}
                      left={left}
                      top={top}
                      username={username}
                    />                    
                  </div>
                )
              })}              
            </div>
          </div>
        </section>
        <footer className='tag-people-info-footer'>
          <span className='tag-people-info-text'>
            Tap photo to tag people.
          </span>
          {tagData.length !== 0 &&
            <span className='tag-people-info-text-with-tag'>
              Drag to move, or tap to remove.
            </span>          
          }
        </footer>              
      </React.Fragment>
      }
    </main>
  );
};

export default TagPeopleMobile;
import normal from '../images/filters/normal.jpg';
import clarendon from '../images/filters/clarendon.jpg';
import gingham from '../images/filters/gingham.jpg';
import moon from '../images/filters/moon.jpg';
import lark from '../images/filters/lark.jpg';
import reyes from '../images/filters/reyes.jpg';
import juno from '../images/filters/juno.jpg';
import slumber from '../images/filters/slumber.jpg';
import crema from '../images/filters/crema.jpg';
import ludwig from '../images/filters/crema.jpg';
import aden from '../images/filters/aden.jpg';
import perpetua from '../images/filters/perpetua.jpg';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import './UploadModalFilters.css'
import UploadModalText from './UploadModalText';
import { async } from '@firebase/util';
import TagSearch from './TagSearch';
import Tag from './Tag';
import useWindowSize from '../hooks/useWindowSize';

const UploadModalFilters = (props) => {
  const {
    tagIDs,
    setTagIDs,
    clickLocation,
    isSearchOpen,
    setTagLocation,
    setIsSearchOpen,
    setClickLocation,
    setSearchResults,
    tagData,
    setTagData,
    searchString,
    setSearchString,
    searchResults,
    captionText,
    setCaptionText,
    userData,
    currentPage,
    photoUploads,
    selectedIndex,
    setSelectedIndex,
    selectedPhoto,
    setSelectedPhoto,
    frameDimensions,
    setPhotoUploads,
    canvasCrop,
    canvasRef
  } = props;
  const [width, height] = useWindowSize();
  const [currentFilterPage, setCurrentFilterPage] = useState('filters');
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [filterFadeValue, setFilterFadeValue] = useState(100);
  const [brightnessValue, setBrightnessValue] = useState('0');
  const [contrastValue, setContrastValue] = useState('0');
  const [saturationValue, setSaturationValue] = useState('0');
  const [temperatureValue, setTemperatureValue] = useState('0');
  const [fadeValue, setFadeValue] = useState('0');
  const [vignetteValue, setVignetteValue] = useState('0');
  const [isTagInstructionHidden, setIsTagInstructionHidden] = useState(true);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [tagSelectedIndex, setTagSelectedIndex] = useState(null);
  const [previousPosition, setPreviousPosition] = useState(null);
  const [movementStart, setMovementStart] = useState(null);
  const [isMoved, setIsMoved] = useState(false);
  const [isTagClicked, setIsTagClicked] = useState(false);
  const adjustments = [
    {
      title: 'brightness', 
      state: brightnessValue,
      valueHandler(event) {
        const { value } = event.target;
        setBrightnessValue(value);
      },
      resetValue() {
        setBrightnessValue('0');
      },
    },
    {
      title: 'contrast', 
      state: contrastValue, 
      valueHandler(event) {
        const { value } = event.target;
        setContrastValue(value);
      },
      resetValue() {
        setContrastValue('0');
      }
    },
    {
      title: 'saturation', 
      state: saturationValue, 
      valueHandler(event) {
        const { value } = event.target;
        setSaturationValue(value);
      },
      resetValue() {
        setSaturationValue('0');
      }
    },
    {
      title: 'temperature', 
      state: temperatureValue, 
      valueHandler(event) {
        const { value } = event.target;
        setTemperatureValue(value);
      },
      resetValue() {
        setTemperatureValue('0');
      }
    },
    {
      title: 'fade', 
      state: fadeValue, 
      valueHandler(event) {
        const { value } = event.target;
        setFadeValue(value);
      },
      resetValue() {
        setFadeValue('0');
      }
    },
    {
      title: 'vignette', 
      state: vignetteValue, 
      valueHandler(event) {
        const { value } = event.target;
        setVignetteValue(value);
      },
      resetValue() {
        setVignetteValue('0');
      }
    },
  ]
  const filters = [
    {
      image: normal, 
      title: 'normal'
    },
    {
      image: clarendon, 
      title: 'clarendon'
    }, 
    {
      image: gingham, 
      title: 'gingham'
    },
    {
      image: moon, 
      title: 'moon'
    },
    {
      image: lark, 
      title: 'lark'
    },
    {
      image: reyes, 
      title: 'reyes'
    },
    {
      image: juno, 
      title: 'juno'
    },
    {
      image: slumber, 
      title: 'slumber'
    },
    {
      image: crema, 
      title: 'crema'
    },
    {
      image: ludwig, 
      title: 'ludwig'
    },
    {
      image: aden, 
      title: 'aden'},
    {
      image: perpetua, 
      title: 'perpetua'
    },
  ] 

  useEffect(() => {
    if (currentPage === 'text'){
      setTimeout(() => {
        setIsTagInstructionHidden(false);
        setTimeout(() => {
          setIsTagInstructionHidden(true);
        }, 5000);        
      }, 300);
    }
  }, [currentPage])

  const filterPageToggle = () => {
    currentFilterPage === 'filters'
      ? setCurrentFilterPage('adjustments')
      : setCurrentFilterPage('filters');
  };

  const filterSelectionHandler = (event) => {
    const { id } = event.target;
    setSelectedFilter(id);
    const newArray = [...photoUploads];
    const newObject = {
      ...photoUploads[selectedIndex],
      filter: id,
    }
    newArray.splice(selectedIndex, 1, newObject);
    setPhotoUploads(newArray);  
  } 

  const filterFadeHandler = (event) => {
    const { value } = event.target;
    setFilterFadeValue(value);
  }

  const leftPhotoButton = () => {
    const nextIndex = selectedIndex - 1;
    const { 
      filter, 
      id, 
    } = photoUploads[nextIndex];
    setSelectedPhoto(id);
    setSelectedIndex(nextIndex);
    setSelectedFilter(filter);
    console.log(nextIndex);
  }

  const rightPhotoButton = () => {
    const nextIndex = selectedIndex + 1;
    const { 
      filter, 
      id, 
    } = photoUploads[nextIndex];
    setSelectedPhoto(id);
    setSelectedIndex(nextIndex);
    setSelectedFilter(filter);
  }

  const loadCanvasPhoto = async () => {
    console.log(photoUploads[selectedIndex]);
    const image = new Image();
    image.onload = () => {
      canvasCrop(image, selectedIndex, 1080, 'display').then((element) => {
        console.log(element);
      })
    };
    image.src = photoUploads[selectedIndex].url || photoUploads[selectedIndex].w1080;
  };

  useEffect(() => {
    loadCanvasPhoto();
  },[
    brightnessValue, 
    contrastValue, 
    saturationValue, 
    temperatureValue, 
    selectedIndex, 
    photoUploads[selectedIndex].filter
  ]);

  const getClickLocation = (event) => {
    if (isTagClicked) {
      return null
    };
    const {
      clientX,
      clientY,
    } = event;
    setIsSearchOpen(true);
    const image = canvasRef.current.getBoundingClientRect();
    const {
      width,
      height,
      left,
      top,
    } = image
    console.log(clientX);
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
    setTagLocation({
      left: x,
      top: y,
    })
    setClickLocation({
      left: clientX,
      top: clientY,
    });
  }

  const closeTagSearch = (event) => {
    event.stopPropagation();
    setIsSearchOpen(false);
  }

  useEffect(() => {
    if (isSearchOpen) {
      window.addEventListener('click', closeTagSearch)

      return () => {
        window.removeEventListener('click', closeTagSearch);
      }      
    }
  });

  useLayoutEffect(() => {
    const image = canvasRef.current.getBoundingClientRect();
    setImageDimensions({
      width: image.width,
      height: image.height,
      left: image.left,
      top: image.top
    })
  }, [width]);


  const onMouseDown = (event, index) => {
    const { tags } = photoUploads[selectedIndex]
    setIsMoved(true);
    setIsTagClicked(true);
    event.stopPropagation();
    console.log("start")
    const {
      clientX,
      clientY,
    } = event;
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
      previousLeft: tags[index].left,
      previousTop: tags[index].top,
    })
    setMovementStart({
      startLeft: startLeft,
      startTop: startTop 
    })
  };

  const onMouseMove = (event) => {
    const { tags } = photoUploads[selectedIndex]
    event.stopPropagation()
    console.log('middle')
    console.log(imageDimensions);
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
    } = event;
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
    const photos = [...photoUploads];
    const newTagData = [...tags];
    const newData = {...tags[tagSelectedIndex], ...movement}
    newTagData.splice(tagSelectedIndex, 1, newData);
    const newPhoto = {...photoUploads[selectedIndex], tags: newTagData}
    photos.splice(selectedIndex, 1, newPhoto);
    setPhotoUploads(photos);
  };

  const deleteTagModal = (index) => {
    const photos = [...photoUploads];
    const newTagData = [...photoUploads[selectedIndex].tags];
    newTagData.splice(index, 1);
    const newPhoto = {...photoUploads[selectedIndex], tags: newTagData};
    photos.splice(selectedIndex, 1, newPhoto);
    setPhotoUploads(photos);
    const newTagIDs = [...tagIDs];
    newTagIDs.splice(index, 1);
    setTagIDs(newTagIDs);
  }

  useEffect(() => {
    if (isMoved) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);      
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  }, [isMoved])

  const onMouseUp = (event) => {
    event.stopPropagation();
    setIsMoved(false);
  }

  const onMouseDownSearch = () => {
    setIsTagClicked(false);
  }

  return (
    <div className='upload-canvas-filters-wrapper'>
      <div className='upload-canvas-wrapper'>
        {!isTagInstructionHidden &&
          <div className='tag-photo-instruction'>
            <div className='tag-instruction-tab'>
            </div>
            <span className='tag-instruction-text'>
              Click photo to tag people
            </span>
          </div>        
        }
        <div 
          className='upload-canvas-fitted-wrapper'
          style={{
            width: `${frameDimensions.width}px`,
            height: `${frameDimensions.height}px`,
          }}
          onMouseDown={onMouseDownSearch}
          onClick={getClickLocation}
        >
          <canvas 
            ref={canvasRef} 
            className='upload-filter-canvas'
            style={{
              width: `${frameDimensions.width}px`,
              height: `${frameDimensions.height}px`,
            }}
          ></canvas>
          {photoUploads[selectedIndex].tags.map((tag, index) => {
            const {
              left,
              top,
              username,
              uid,
            } = tag;
            return (
              <div 
                key={uid}
                onMouseDown={(event) => onMouseDown(event, index)}
                onClick={(event) => event.stopPropagation()}
              >
                <Tag
                  deleteTagModal={deleteTagModal}
                  setIsMoved={setIsMoved}
                  isMoved={isMoved}
                  isModal={true}
                  imageDimensions={imageDimensions}
                  index={index}
                  setTagData={setTagData}
                  tagData={photoUploads[selectedIndex].tags}
                  key={uid}
                  imageRef={canvasRef}
                  left={left}
                  top={top}
                  username={username}
                />                    
              </div>
            )
          })}  
        </div>
        <div className='gallery-navigation-buttons'>
          {selectedIndex !== 0 &&
            <button className='left-photo-button' onClick={leftPhotoButton}>
              <svg aria-label="Left chevron" className="left-photo-svg" color="#ffffff" fill="#ffffff" height="16" role="img" viewBox="0 0 24 24" width="16">
                <polyline fill="none" points="16.502 3 7.498 12 16.502 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
              </svg>
            </button>                        
          }
          {selectedIndex !== photoUploads.length - 1 &&
            <button className='right-photo-button' onClick={rightPhotoButton}>
              <svg aria-label="Right chevron" className="right-photo-svg" color="#ffffff" fill="#ffffff" height="16" role="img" viewBox="0 0 24 24" width="16">
                <polyline fill="none" points="8 3 17.004 12 8 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
              </svg>
            </button>                        
          }
          {photoUploads.length > 1 &&
            <div className='upload-slide-indicators-wrapper'>
              {photoUploads.map((photo) => {
                if (photo.id === selectedPhoto) {
                  return (
                    <div key={photo.id} className='upload-slide-indicator selected'></div>
                  )
                } else {
                  return (
                    <div key={photo.id} className='upload-slide-indicator'></div>
                  )
                }
              })}
            </div>                        
          }
        </div>
      </div>
      {currentPage === 'text' &&
        <UploadModalText
          captionText={captionText}
          setCaptionText={setCaptionText}
          userData={userData}
        />
      }
      {currentPage === 'filter' &&
        <div className='upload-filters-wrapper'>
          <div className='upload-filter-tabs-wrapper'>
            <button 
              className={
                currentFilterPage === 'filters' 
                  ? ['upload-filters-button', 'selected'].join(' ') 
                  : 'upload-filters-button'
              }
              onClick={filterPageToggle}
            >
              Filters
            </button>
            <button 
              className={
                currentFilterPage === 'adjustments' 
                  ? ['upload-adjustments-button', 'selected'].join(' ') 
                  : 'upload-adjustments-button'
              }
              onClick={filterPageToggle}
            >
              Adjustments
            </button>
          </div>

          <div className='upload-filter-content'>
            {currentFilterPage === 'filters' &&
              <React.Fragment>
                <div className='upload-filter-grid-wrapper'>
                  {filters.map((filter) => {
                    const {
                      image,
                      title,
                    } = filter
                    return (
                      <button 
                        key={title} 
                        className={
                          selectedFilter === title 
                            ? [`upload-filter-button-${title}`, 'selected'].join(' ') 
                            : `upload-filter-button-${title}`
                        } 
                        id={title}
                        onClick={filterSelectionHandler}
                      >
                        <div className='upload-filter-image-wrapper'>
                          <img 
                            alt={`Filter: ${title}`} 
                            className='upload-filter-image' 
                            id={title} 
                            src={image} 
                            draggable='false'
                          />                      
                        </div>
                        <span id={title} className='upload-filter-title' >
                          {title}  
                        </span> 
                      </button>
                    )
                  })}
                </div>

              </React.Fragment>          
            }
            {currentFilterPage === 'adjustments' &&
              <div className='upload-filter-adjustments-wrapper'>
                {adjustments.map((adjustment) => {
                  const {
                    title,
                    state,
                    valueHandler,
                    resetValue,
                  } = adjustment
                  return (
                    <div
                      key={title}
                      className='filter-adjustment-input-wrapper'
                    >
                      <div className='adjustment-text-reset-wrapper'>
                        <span className={'adjustment-text'}>
                          {title}
                        </span>
                        {state !== '0' &&
                          <button 
                            onClick={resetValue}
                            className='adjustment-reset-button'
                          >
                            Reset
                          </button>                      
                        }
                      </div>
                      <div
                        className='adjustment-input-value-wrapper'>
                        {title === 'vignette'
                          ? <input 
                              className='adjustment-input' 
                              max='100' 
                              min='0' 
                              type='range'
                              style={{
                                backgroundImage: `linear-gradient(
                                  to right, 
                                  rgb(38, 38, 38) 0%, 
                                  rgb(38, 38, 38) ${state}%, 
                                  rgb(219, 219, 219) ${state}%, 
                                  rgb(219, 219, 219) 100%)`
                              }}
                              value={state}
                              onChange={valueHandler}
                            />
                          : <input 
                              className='adjustment-input' 
                              max='100' 
                              min='-100' 
                              type='range'
                              style={{
                                backgroundImage: `linear-gradient(
                                  to right, 
                                  rgb(219, 219, 219) 0%, 
                                  rgb(219, 219, 219) ${
                                    state < 0 
                                      ? 50 + (state / 2) 
                                      : 50
                                  }%, 
                                  rgb(38, 38, 38) ${
                                    state < 0 
                                      ? 50 + (state / 2) 
                                      : 50
                                  }%, 
                                  rgb(38, 38, 38) ${
                                    state > 0 
                                      ? 50 + (state / 2) 
                                      : 50
                                  }%, 
                                  rgb(219, 219, 219) ${
                                    state > 0 
                                      ? 50 + (state / 2) 
                                      : 50
                                  }%, 
                                  rgb(219, 219, 219) 100%)`,
                              }}
                              value={state}
                              onChange={valueHandler}
                            />
                        }
                        <span className={state === '0' ? ['adjustment-input-value', 'zero'].join(' ') : 'adjustment-input-value'}>
                          {state}
                        </span>                      
                      </div>
                    </div>
                  )
                })}
              </div>          
            }
          </div>
          {currentFilterPage === 'filters' && selectedFilter !== 'normal' &&
            <div className='filter-fade-input-wrapper'>
              <div className='filter-fade-input-value-wrapper'>
                <input 
                  className='filter-fade-input' 
                  max='100' 
                  min='0' 
                  type="range"
                  value={filterFadeValue}
                  onChange={filterFadeHandler}
                  style={{
                    backgroundImage: `linear-gradient(
                      to right, 
                      rgb(38, 38, 38) 0%, 
                      rgb(38, 38, 38) ${filterFadeValue}%, 
                      rgb(219, 219, 219) ${filterFadeValue}%, 
                      rgb(219, 219, 219) 100%)`
                  }}
                />
                <span className='filter-fade-input-value'>
                  {filterFadeValue}
                </span>
              </div>
            </div>        
          }
        </div>
      }      
      
    </div>
  )
}

export default UploadModalFilters;
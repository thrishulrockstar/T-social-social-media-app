import { useEffect, useRef, useState } from "react";
import './UploadPhotoMobile.css';
import { useNavigate } from "react-router-dom";
import MobileFilterSlider from "../components/MobileFilterSlider";

const UploadPhotoMobile = (props) => {
  const navigate = useNavigate();
  const {
    locationBeforeUpload,
    filterScrollLeft,
    setFilterScrollLeft,
    pointerX,
    pointerY,
    imageWidth,
    imageHeight,
    imageDegrees,
    originPointX,
    originPointY,
    imageFitHeight,
    imageFlipped,
    mobilePhotoUpload, 
    aspectRatio, 
    flippedAspectRatio, 
    setPhotoUploadOpen,
    pointerTracker,
    imageLocationHandler,
    verticalImageHandler,
    centerImage,
    toggleImageFit,
    verticalToggleFit,
    imageHandler,
    imageLoad,
    imageRotate,
    resizeCropFilterImage,
    filterToggle,
    canvasRef,
    pointerStart,
    selectedFilter,
  } = props;
  const [editorPage, setEditorPage] = useState('edit');
  const [canvasWrapperClass, setCanvasWrapperClass] = useState([]);
  const [canvasClass, setCanvasClass] = useState([]);
  const filterScrollRef = useRef(null);

  const photoCanvasWrapperClass = () => {  
    if (!imageFitHeight && !imageFlipped && (aspectRatio < 1)) {
      setCanvasWrapperClass(["photo-canvas-wrapper", "vertical-fitted"]);
      setCanvasClass(["photo-canvas", "vertical-fitted"]);
      return
    }
    if (!imageFitHeight && imageFlipped && (aspectRatio > 1)) {
      setCanvasClass(['photo-canvas', "vertical-fitted"]);
      setCanvasWrapperClass(['photo-canvas-wrapper', "vertical-fitted"]);
      return
    }
    setCanvasClass(['photo-canvas']);
    setCanvasWrapperClass(['photo-canvas-wrapper']);
  };

  const editPageToggle = () => {
    editorPage === 'edit' ? setEditorPage('filter') : setEditorPage('edit');
  }

  useEffect(() => {
    resizeCropFilterImage(true);
  }, []);

  useEffect(() => {
    photoCanvasWrapperClass()
  },[imageFitHeight, imageFlipped]);

  useEffect(() => () => {
    setPhotoUploadOpen(false);
    // resizeCropFilterImage(true);
  }, []);

  return (
    <section className="mobile-photo-upload-editor">
      <header className="new-post-header">
        <div className="header-content-wrapper">
          <button className="close-new-post-button" onClick={() => navigate(locationBeforeUpload.pathname)}>
            <svg aria-label="Close" className="close-post-svg" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line>
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line>
            </svg>
          </button>
          <h1 className="new-post-header-text">New Photo Post</h1>
          <button className="next-new-post-button" onClick={() => navigate('/create/details')}>Next</button>
        </div>
      </header>
      <div className={editorPage === 'edit' ? ["photo-canvas-preview", 'hidden'].join(' ') : 'photo-canvas-preview'}>
        <div className="photo-canvas-padding-wrapper">
          <div className={canvasWrapperClass.join(' ')}>
            <canvas className={canvasClass.join(' ')} ref={canvasRef} width='1080' height='1080'></canvas>
          </div>
        </div>
        {editorPage === 'filter' &&
          <MobileFilterSlider
            filterScrollRef={filterScrollRef} 
            filterScrollLeft={filterScrollLeft} 
            setFilterScrollLeft={setFilterScrollLeft} 
            selectedFilter={selectedFilter} 
            filterToggle={filterToggle}
          />        
        }
      </div>      
      <div className={editorPage === 'filter' ? ["photo-overflow-frame", 'hidden'].join(' ') : 'photo-overflow-frame'} 
        onPointerMove={pointerTracker} 
        onPointerDown={pointerStart} 
        onPointerUp={(aspectRatio < 1) ? verticalImageHandler : imageLocationHandler}
      >
        <div className="photo-padding-wrapper">
          <div className="photo-background-wrapper">
              <div className="uploaded-photo" 
                style={{ 
                  backgroundImage: `url(${mobilePhotoUpload})`, 
                  top: `${pointerY}%`, 
                  left: `${pointerX}%`, 
                  width: `${imageWidth}%`,
                  height: `${imageHeight}%`,
                  transform: `rotate(${imageDegrees}deg)`,
                  transformOrigin: `${originPointY}% ${originPointX}%`,
                }}>
              </div>
            {imageFitHeight &&
              <div className="photo-grid">
                <div className="grid-line vertical-left"></div>
                <div className="grid-line vertical-right"></div>
                <div className="grid-line horizontal-top"></div>
                <div className="grid-line horizontal-bottom"></div>  
              </div>            
            }
            <button className="fit-button" onClick={(aspectRatio < 1) ? verticalToggleFit : toggleImageFit}>
              <span className="fit-button-sprite"></span>  
            </button>
            <button className="rotate-button" onClick={imageRotate}>
              <span className="rotate-button-sprite"></span>
            </button>
          </div>
        </div>
      </div>
      <div className="editor-selection-tabs">
        <div className="button-tab-wrapper">
          <button className={editorPage === 'filter' ? ["filter-edit-button", 'selected'].join(' ') : 'filter-edit-button'} onClick={editPageToggle}>
            <div className="filter-button-inner-text">
              Filter
            </div>
          </button>
          <button className={editorPage === 'edit' ? ['edit-photo-button', 'selected'].join(' ') : "edit-photo-button"} onClick={editPageToggle}>
            <div className="edit-button-inner-text">
              Edit
            </div>
          </button>    
        </div>
      </div>
    </section>
  )
}

export default UploadPhotoMobile;
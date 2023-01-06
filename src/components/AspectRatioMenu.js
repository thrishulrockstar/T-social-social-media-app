import React, { useState } from 'react';
import './AspectRatioMenu.css';

const AspectRatioMenu = (props) => {
  const {
    sixteenByNineHandler,
    fourByFiveHandler,
    oneByOneRatioHandler,
    originalRatioHandler,
    slideMenuOpen,
    cropMenuOpen,
    zoomMenuOpen,
    toggleRatioMenu,
    toggleZoomMenu,
    animateRatioMenu,
    animateZoomMenu,
    hideCropMenu,
    hideZoomMenu,
    zoomValue,
    setZoomValue,
    cropSelection,
  } = props;

  const zoomHandler = (event) => {
    const { value } = event.target;
    setZoomValue(value);
  }

  return (
    <React.Fragment>
      <div className='aspect-ratio-button-menu'>
        {cropMenuOpen &&
          <div 
            className={animateRatioMenu ? ['aspect-ratio-menu-wrapper', 'slideDown'].join(' ') : 'aspect-ratio-menu-wrapper'}
            onAnimationEnd={hideCropMenu}
          >
            <button className='original-button' onClick={originalRatioHandler}>
              <div className='aspect-ratio-inner-button'>
                <span 
                  className={(cropSelection === 'original') ? ['inner-button-text', 'selected'].join(' ') : 'inner-button-text'}
                >
                  Original
                </span>
                <svg aria-label="Photo Outline Icon" className="orginal-svg" color={(cropSelection === 'original') ? '#ffffff' : "#8e8e8e"} fill={(cropSelection === 'original') ? '#ffffff' : "#8e8e8e"} height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M6.549 5.013A1.557 1.557 0 108.106 6.57a1.557 1.557 0 00-1.557-1.557z" fillRule="evenodd"></path>
                  <path d="M2 18.605l3.901-3.9a.908.908 0 011.284 0l2.807 2.806a.908.908 0 001.283 0l5.534-5.534a.908.908 0 011.283 0l3.905 3.905" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                  <path d="M18.44 2.004A3.56 3.56 0 0122 5.564h0v12.873a3.56 3.56 0 01-3.56 3.56H5.568a3.56 3.56 0 01-3.56-3.56V5.563a3.56 3.56 0 013.56-3.56z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
            </button>
            <hr className='aspect-ratio-divider'></hr>
            <button className='one-to-one-button' onClick={oneByOneRatioHandler}>
              <div className='aspect-ratio-inner-button'>
              <span 
                  className={(cropSelection === 'one-one') ? ['inner-button-text', 'selected'].join(' ') : 'inner-button-text'}
                >
                  1:1
                </span>
                <svg aria-label="Crop Square Icon" className="one-to-one-svg" color={(cropSelection === 'one-one') ? '#ffffff' : "#8e8e8e"} fill={(cropSelection === 'one-one') ? '#ffffff' : "#8e8e8e"} height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M19 23H5a4.004 4.004 0 01-4-4V5a4.004 4.004 0 014-4h14a4.004 4.004 0 014 4v14a4.004 4.004 0 01-4 4zM5 3a2.002 2.002 0 00-2 2v14a2.002 2.002 0 002 2h14a2.002 2.002 0 002-2V5a2.002 2.002 0 00-2-2z"></path>
                </svg>
              </div>
            </button>
            <hr className='aspect-ratio-divider'></hr>
            <button className='four-to-five-button' onClick={fourByFiveHandler}>
              <div className='aspect-ratio-inner-button'>
              <span 
                  className={(cropSelection === 'four-five') ? ['inner-button-text', 'selected'].join(' ') : 'inner-button-text'}
                >
                  4:5
                </span>
                <svg aria-label="Crop Portrait Icon" className="four-to-five-svg" color={(cropSelection === 'four-five') ? '#ffffff' : "#8e8e8e"} fill={(cropSelection === 'four-five') ? '#ffffff' : "#8e8e8e"} height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M16 23H8a4.004 4.004 0 01-4-4V5a4.004 4.004 0 014-4h8a4.004 4.004 0 014 4v14a4.004 4.004 0 01-4 4zM8 3a2.002 2.002 0 00-2 2v14a2.002 2.002 0 002 2h8a2.002 2.002 0 002-2V5a2.002 2.002 0 00-2-2z"></path>
                </svg>
              </div>
            </button>
            <hr className='aspect-ratio-divider'></hr>
            <button className='sixteen-to-nine-button' onClick={sixteenByNineHandler}>
              <div className='aspect-ratio-inner-button'>
              <span 
                  className={(cropSelection === 'sixteen-nine') ? ['inner-button-text', 'selected'].join(' ') : 'inner-button-text'}
                >
                  16:9
                </span>
                <svg aria-label="Crop Landscape Icon" className="sixteen-to-nine-svg" color={(cropSelection === 'sixteen-nine') ? '#ffffff' : "#8e8e8e"} fill={(cropSelection === 'sixteen-nine') ? '#ffffff' : "#8e8e8e"} height="24" role="img" viewBox="0 0 24 24" width="24">
                  <path d="M19 20H5a4.004 4.004 0 01-4-4V8a4.004 4.004 0 014-4h14a4.004 4.004 0 014 4v8a4.004 4.004 0 01-4 4zM5 6a2.002 2.002 0 00-2 2v8a2.002 2.002 0 002 2h14a2.002 2.002 0 002-2V8a2.002 2.002 0 00-2-2z"></path>
                </svg>
              </div>
            </button>
          </div>      
        }
        <div 
          className={
            (zoomMenuOpen || slideMenuOpen)
              ? ['aspect-ratio-button-wrapper', 'deselected'].join(' ')
              : cropMenuOpen 
                ? ["aspect-ratio-button-wrapper", "selected"].join(' ') 
                : "aspect-ratio-button-wrapper"
          }
        >
          <button 
            className="aspect-ratio-button" 
            onClick={toggleRatioMenu}
          >
            <div className='aspect-ratio-button-inner'>
              <svg aria-label="Select Crop" className="aspect-ratio-svg" color={cropMenuOpen ? "#262626" : "#ffffff"} fill={cropMenuOpen ? "#262626" : "#ffffff"} height="16" role="img" viewBox="0 0 24 24" width="16">
                <path d="M10 20H4v-6a1 1 0 00-2 0v7a1 1 0 001 1h7a1 1 0 000-2zM20.999 2H14a1 1 0 000 2h5.999v6a1 1 0 002 0V3a1 1 0 00-1-1z"></path>
              </svg>            
            </div>
          </button>
        </div>
      </div>
      <div className='zoom-button-menu'>
        {zoomMenuOpen &&
          <div 
            className={animateZoomMenu ? ['zoom-menu-wrapper', 'slideDown'].join(' ') : 'zoom-menu-wrapper'} 
            onAnimationEnd={hideZoomMenu}
          >
            <div className='zoom-input-wrapper'>
              <input 
                className='zoom-input' 
                value={zoomValue} 
                onChange={zoomHandler} 
                type='range' 
                max="100" 
                min="0"
                style={{
                  backgroundImage: `linear-gradient(to right, rgb(255, 255, 255) ${zoomValue}%, rgb(255, 255, 255) ${zoomValue}%, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)`,
                }}
              />
            </div>
          </div>        
        }
        <div 
          className={ 
            (slideMenuOpen || cropMenuOpen) 
              ? ['zoom-button-wrapper', 'deselected'].join(' ')
              : zoomMenuOpen 
                ? ["zoom-button-wrapper", "selected"].join(' ') 
                : "zoom-button-wrapper"
            }
        >
          <button className="zoom-button" onClick={toggleZoomMenu}>
            <div className='zoom-button-inner'>
              <svg aria-label="Select Zoom" className="zoom-svg" color={zoomMenuOpen ? "#262626" : "#ffffff"} fill={zoomMenuOpen ? "#262626" : "#ffffff"} height="16" role="img" viewBox="0 0 24 24" width="16">
                <path d="M22.707 21.293l-4.825-4.825a9.519 9.519 0 10-1.414 1.414l4.825 4.825a1 1 0 001.414-1.414zM10.5 18.001a7.5 7.5 0 117.5-7.5 7.509 7.509 0 01-7.5 7.5zm3.5-8.5h-2.5v-2.5a1 1 0 10-2 0v2.5H7a1 1 0 100 2h2.5v2.5a1 1 0 002 0v-2.5H14a1 1 0 000-2z"></path>
              </svg>           
            </div>
          </button>
        </div>
      </div>
    </React.Fragment>
    
  );
};

export default AspectRatioMenu;
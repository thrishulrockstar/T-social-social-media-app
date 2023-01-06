import './MobileFilterSlider.css';
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
import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';

const MobileFilterSlider = (props) => {
  const {
    filterScrollRef,
    selectedFilter, 
    filterToggle,
    filterScrollLeft,
    setFilterScrollLeft
  } = props;
  const filters = [
    {image: normal, title: 'normal'},
    {image: clarendon, title: 'clarendon'}, 
    {image: gingham, title: 'gingham'},
    {image: moon, title: 'moon'},
    {image: lark, title: 'lark'},
    {image: reyes, title: 'reyes'},
    {image: juno, title: 'juno'},
    {image: slumber, title: 'slumber'},
    {image: crema, title: 'crema'},
    {image: ludwig, title: 'ludwig'},
    {image: aden, title: 'aden'},
    {image: perpetua, title: 'perpetua'},
  ]
  const [width, height] = useWindowSize();
  const [visableFilters, setVisableFilters] = useState([]);
  const [filterPaddingRight, setFilterPaddingRight] = useState();
  const [filterPaddingLeft, setFilterPaddingLeft] = useState();

  const getFilters = (index) => {
    const filtersVisable = Math.ceil(width/106) + 2;
    console.log('filtersVisable:', filtersVisable, 'width:', width);
    const paddingRight = (filters.length - filtersVisable) - index;
    setFilterPaddingRight(paddingRight * 106);
    setFilterPaddingLeft(index * 106)
    const selectedFilters = filters.splice(index, filtersVisable);
    setVisableFilters(selectedFilters);
  }

  const scrollLocation = () => {
    const scrollLeft = filterScrollRef.current.scrollLeft;
    setFilterScrollLeft(scrollLeft);
    if (scrollLeft/125 < 1) {
      getFilters(0);
    }
    if (scrollLeft/125 > 1 && scrollLeft/125 < 2) {
      getFilters(1);
    }
    if (scrollLeft/125 > 2 && scrollLeft/125 < 3) {
      getFilters(2);
    }
    if (scrollLeft/125 > 3 && scrollLeft/125 < 4) {
      getFilters(3);
    }
    if (scrollLeft/125 > 4 && scrollLeft/125 < 5) {
      getFilters(4);
    }
    if (scrollLeft/125 > 5 && scrollLeft/125 < 6) {
      getFilters(5);
    }
    if (scrollLeft/125 > 6 && scrollLeft/125 < 7.5) {
      getFilters(6);
    }
  }

  useLayoutEffect(() => {
    getFilters(0);
    filterScrollRef.current.scrollLeft = filterScrollLeft;
  }, [width]);
  
  return (
    <div className='mobile-filter-slider' ref={filterScrollRef} onScroll={scrollLocation}>
      <div className='mobile-filter-slider-wrapper' style={{paddingLeft: `${filterPaddingLeft}px`, paddingRight: `${filterPaddingRight}px`}}>
        {visableFilters.map((filter) => {
          return (
            <button key={filter.title} className={`${filter.title}-filter-button`} id={filter.title} onClick={filterToggle}>
              <div className={selectedFilter === filter.title ? ['filter-button-text', 'selected'].join(' ') : 'filter-button-text'}>{filter.title}</div>
              <img alt={`Filter: ${filter.title}`} className='filter-image' id={filter.title} src={filter.image} />
            </button>            
          );
        })}
      </div>
    </div>
  )
};

export default MobileFilterSlider;
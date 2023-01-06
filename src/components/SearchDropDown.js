import { useEffect } from 'react';
import './SearchDropDown.css';
import SearchResults from './SearchResults';

const SearchDropDown = (props) => {
  const {
    isSearchAnimating,
    setIsSearchAnimating,
    setIsSearchClicked,
    deleteRecentHashTagSearch,
    saveRecentHashTagSearch,
    isSearchHashTag,
    deleteRecentSearch,
    isNoMatch,
    isSearching,
    clearRecentSearch,
    searchString,
    saveRecentSearch,
    setMenuClicked,
    setIsMouseHovering,
    setSearchResults,
    setSearchString,
    searchResults,
    selectedListProfile,
    unfollowModalHandler,
    followHandler,
    userData,
    isFollowLoading,
  } = props;

  const mouseDownHandler = () => {
    setMenuClicked(true);
  }

  const animateDropDown = () => {
    if (!isSearchAnimating) {
      setIsSearchAnimating(true);
    };
  };
  
  const hideDropDown = () => {
    if (isSearchAnimating) {
      setIsSearchClicked(false);
    };
  };

  useEffect(() => {
    window.addEventListener('click' , animateDropDown);
    return () => {
      window.removeEventListener('click', animateDropDown);
      setIsSearchAnimating(false);
    };
  }, []);

  return (
    <div 
      className='search-drop-down'
      onAnimationEnd = {hideDropDown}
    >
      <div 
        className={
          isSearchAnimating 
          ? 'search-drop-down-content animate'
          : 'search-drop-down-content'
        }
        onMouseDown={mouseDownHandler}
      >
        <div className='search-drop-down-triangle'>
        </div>
        <SearchResults
          setIsSearchClicked = {setIsSearchClicked}
          deleteRecentHashTagSearch = {deleteRecentHashTagSearch}
          saveRecentHashTagSearch = {saveRecentHashTagSearch}
          isSearchHashTag = {isSearchHashTag}
          deleteRecentSearch={deleteRecentSearch}
          isNoMatch={isNoMatch}
          isSearching={isSearching}
          clearRecentSearch={clearRecentSearch}
          searchString={searchString}
          saveRecentSearch={saveRecentSearch}
          setIsMouseHovering={setIsMouseHovering}
          setSearchString={setSearchString}
          setSearchResults={setSearchResults} 
          searchResults={searchResults}
          selectedListProfile={selectedListProfile}
          userData={userData}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          unfollowModalHandler={unfollowModalHandler}
        />
      </div>
    </div>
  );
};

export default SearchDropDown;
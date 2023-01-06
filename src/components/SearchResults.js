import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PeopleList from './PeopleList';
import './SearchResults.css';

const SearchResults = (props) => {
  const {
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
  const [sortedRecentSearch, setSortedRecentSearch] = useState([]);

  useEffect(() => {
    const sortedArray = [...userData.recentSearch]
    sortedArray.sort((a, z) => {
      return z.uploadDate - a.uploadDate; 
    })
    setSortedRecentSearch(sortedArray);
    console.log(userData.recentSearch);
  },[userData])

  const hashTagClickHandler = (result) => {
    setIsSearchClicked(false);
    saveRecentHashTagSearch(result)
  }

  return (
    <main className='search-results'>
      {searchString === '' &&
        <div className='recent-search-header'>
          <h1 className='recent-search-header-text'>
            Recent
          </h1>
          {userData.recentSearch.length > 0 &&
            <button 
              className='recent-search-clear-button'
              onClick={clearRecentSearch}
            >
              Clear All
            </button>          
          }
        </div>      
      }
      {isSearching &&
        <span className='no-recent-searches-text'>
          <svg aria-label="Loading..." className='spinner search' viewBox="0 0 100 100">
            <rect fill="#555555" height="6" opacity="0" rx="3" ry="3" transform="rotate(-90 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.08333333333333333" rx="3" ry="3" transform="rotate(-60 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.16666666666666666" rx="3" ry="3" transform="rotate(-30 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.25" rx="3" ry="3" transform="rotate(0 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.3333333333333333" rx="3" ry="3" transform="rotate(30 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.4166666666666667" rx="3" ry="3" transform="rotate(60 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.5" rx="3" ry="3" transform="rotate(90 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.5833333333333334" rx="3" ry="3" transform="rotate(120 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.6666666666666666" rx="3" ry="3" transform="rotate(150 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.75" rx="3" ry="3" transform="rotate(180 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.8333333333333334" rx="3" ry="3" transform="rotate(210 50 50)" width="25" x="72" y="47">
            </rect>
            <rect fill="#555555" height="6" opacity="0.9166666666666666" rx="3" ry="3" transform="rotate(240 50 50)" width="25" x="72" y="47">
            </rect>
          </svg>      
        </span>
      }
      {searchString !== '' && searchResults.length === 0 && isNoMatch &&
        <span className='no-recent-searches-text'>
          No match found.
        </span>
      }
      {searchString === '' && userData.recentSearch.length === 0 &&
        <span className='no-recent-searches-text'>
          No recent searches.
        </span>
      }
      {userData.recentSearch.length > 0 && searchString === '' &&        
        <PeopleList
          hashTagClickHandler = {hashTagClickHandler}
          setIsSearchClicked = {setIsSearchClicked}
          deleteRecentHashTagSearch = {deleteRecentHashTagSearch}
          isRecentSearch={true}
          deleteRecentSearch={deleteRecentSearch}
          isSearch={true}
          saveRecentSearch={saveRecentSearch}
          setIsMouseHovering={setIsMouseHovering}
          // onMouseEnter={onMouseEnter}
          // onMouseLeave={onMouseLeave}
          selectedListProfile={selectedListProfile}
          allUserProfiles={sortedRecentSearch}
          userData={userData}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          unfollowModalHandler={unfollowModalHandler}
        />         
      }
      {searchString !== '' && !isSearchHashTag &&
        <PeopleList
          isSearch={true}
          saveRecentSearch={saveRecentSearch}
          setIsMouseHovering={setIsMouseHovering}
          // onMouseEnter={onMouseEnter}
          // onMouseLeave={onMouseLeave}
          selectedListProfile={selectedListProfile}
          allUserProfiles={searchResults}
          userData={userData}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          unfollowModalHandler={unfollowModalHandler}
        />      
      }
      {isSearchHashTag &&
        <ul className='hash-tag-search-list'>
          {searchResults.map((result) => {
            return (
              <li 
                className='hash-tag-search-list-wrapper'
                onClick={() => hashTagClickHandler(result)}
              >
                <Link 
                  to={`/explore/tags/${result.hashTag}/`}
                  className='hash-tag-search-item'
                >
                  <div className='profile-photo-frame'>
                    <svg aria-label="Hashtag" className='hash-tag-svg' color="#262626" fill="#262626" height="16" role="img" viewBox="0 0 24 24" width="16">
                      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="4.728" x2="20.635" y1="7.915" y2="7.915"></line>
                      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3.364" x2="19.272" y1="15.186" y2="15.186"></line>
                      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="17.009" x2="13.368" y1="2" y2="22"></line>
                      <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="10.64" x2="7" y1="2" y2="22"></line>
                    </svg>

                  </div>
                  <div className='hash-tag-search-text'>
                    <span className='hash-tag-title'>
                      #{result.hashTag}
                    </span>
                    <span className='hash-tag-post-count'>
                      <span className='hash-tag-post-number'>
                        {result.posts.length}
                      </span>
                      posts
                    </span>
                  </div>                  
                </Link>
              </li>
            );
          })}
        </ul>
      }
    </main>
  );
};

export default SearchResults;
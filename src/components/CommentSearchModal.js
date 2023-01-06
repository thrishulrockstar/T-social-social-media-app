import { useEffect } from 'react';
import './CommentSearchModal.css';
import PeopleList from './PeopleList';

const CommentSearchModal = (props) => {
  const {
    isSearchHashTag,
    textareaRef,
    setUserIndex,
    setIsSearching,
    userIndex,
    commentText,
    setCommentText,
    isSearchModalFlipped,
    searchResults
  } = props;

  const searchSelection = (username) => {
    const slicedComment = commentText.slice(0, userIndex);
    const name = `${username} `
    const newCommentText = slicedComment.concat(name);
    setCommentText(newCommentText);
    setUserIndex(null)
    setIsSearching(false);
    textareaRef.current.focus();
  }

  useEffect(() => {
    console.log(isSearchHashTag);
  },[]);

  return (
    <section 
      className='comment-search-modal'
      style={isSearchModalFlipped 
        ? {
          transform: `translateY(${isSearchModalFlipped ? 100 : -100}%)`,
          bottom: 0
        }
        : {
          transform: `translateY(${isSearchModalFlipped ? 100 : -100}%)`,
          top: 0
        }
      }
    >
      {!isSearchHashTag &&
        <PeopleList
          searchSelection={searchSelection}
          isTag={false}
          isSearch={true}
          isComment={true}
          allUserProfiles={searchResults}
        />       
      }
      {isSearchHashTag &&
        <ul 
          className='comment-search-results'
        >
          {searchResults.map((hash) => {
            const {
              hashTag,
              posts
            } = hash;
            return (
              <li 
                className='hash-tag-search-result'
                key={hashTag}
                onClick={() => searchSelection(hashTag)}
                onMouseDown={(event) => event.preventDefault()}
              >
                <span className='hash-tag-text'>
                  #{hashTag}
                </span>
                <span className='hast-tag-post-length'>
                  {posts.length} posts
                </span>
              </li>
            );
          })}
        </ul>       
      }
    </section>
  )
}

export default CommentSearchModal;
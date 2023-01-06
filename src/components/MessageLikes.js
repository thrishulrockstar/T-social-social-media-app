import './MessageLikes.css';
import { useLayoutEffect, useState } from 'react';
import { getFirestore, updateDoc, doc, arrayRemove} from 'firebase/firestore';

const db = getFirestore();

const MessageLikes = (props) => {
  const {
    selectedMessageID,
    setIsMessageLikesOpen,
    messages,
    userData,
  } = props;
  const [likes, setLikes] = useState([]);

  useLayoutEffect(() => {
    const index = messages.findIndex((message) => message.messageID === selectedMessageID);
    if (index !== -1) {
      const {
        likes
      } = messages[index];
      const userIndex = likes.findIndex((like) => like.uid === userData.uid);
      if (userIndex !== -1) {
        const newLikes = [...likes];
        newLikes.splice(userIndex, 1);
        setLikes([likes[userIndex], ...newLikes]);
      } else {
        setLikes(messages[index].likes);        
      };
    };
  }, [messages]);

  const removeLike = async (like) => {
    setIsMessageLikesOpen(false);
    await updateDoc(doc(db, 'messages', selectedMessageID), {
      likes: arrayRemove(like),
    });
  };

  return (
    <ul className='message-likes-list'>
      {likes.map((like) => {
        const {
          photoURL,
          username,
          uid,
          likeID,
        } = like;
        return (
          <li 
            className='reaction'
            key={likeID}
            onClick = {() => removeLike(like)}
          >
            <div className='profile-photo-frame'>
              <img alt='' className='profile-photo' src={photoURL}/>
            </div>
            <div className='message-like-text'>
              <span className='message-like-name'>
                {username}
              </span>
              {uid === userData.uid &&
                <span className='remove-text'>
                  Tap to Remove
                </span>                  
              }
            </div>
            <span className='reaction-symbol'>
              ❤️
            </span>
          </li>
        )
      })}          
    </ul>
  );
};

export default MessageLikes;
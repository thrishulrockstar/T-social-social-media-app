import './HashTagPage.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc, getFirestore, getDocs, collection, limit, orderBy } from 'firebase/firestore';
import PhotoGrid from '../components/PhotoGrid';

const db = getFirestore();

const HashTagPage = (props) => {
  const {
    hashTagString,
    setHashTagString,
    getPhotoURLs,
    isMobile,
    getPostData,
    setIsLoadingPage,
    setBackgroundLocation,
  } = props;
  const [postsArray, setPostsArray] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [featuredPhoto, setFeaturedPhoto] = useState('');
  const params = useParams();

  const getHashTagPosts = async () => {
    const {
      hashTag
    } = params;
    setHashTagString(hashTag);
    const postsSnapshot = await getDocs(collection(db, hashTag), orderBy('date', 'desc'));
    const documents = []
    postsSnapshot.forEach((document) => {
      documents.push(document.data());
    })
    setPostCount(documents.length);
    const postsArray = [];
    for (let index = 0; index < documents.length; index++) {
      const postDocument = await getDoc(doc(db, 'postUploads', documents[index].postID));
      const newPost = getPhotoURLs(postDocument.data());
      postsArray.push(newPost);      
    }
    console.log(postsArray)
    Promise.all(postsArray).then((posts) => {
      setPostsArray(posts);
      setFeaturedPhoto(posts[0][1].w240)
    });
  };

  useEffect(() => {
    getHashTagPosts();
  }, []);

  return (
    <main className='hash-tag-page'>
      <div className='hash-tag-content'>
        <div className='hash-tag-information'>
          <div className='profile-photo-frame'>
            <img alt='' className='profile-photo' src={featuredPhoto}/>
          </div>
          <div className='hash-tag-page-text-wrapper'>
            {!isMobile &&
              <h1 className='hash-tag-header-text'>
                #{hashTagString}
              </h1>            
            }
            <span className='hash-tag-post-count'>
              <span className='post-count'>
                {postCount}
              </span> 
              {postCount.length === 1
                ? 'post'
                : 'posts'
              }
            </span>            
          </div>

        </div>
        <div className='most-recent-photos'>
          <h2 className='most-recent-header'>
            Most recent
          </h2>
          {postsArray.length !== 0 &&
            <PhotoGrid
              isMobile = {isMobile}
              getPostData = {getPostData}
              setIsLoadingPage = {setIsLoadingPage}
              setBackgroundLocation = {setBackgroundLocation}
              postsArray = {postsArray}
            />
          }
        </div>
      </div>
    </main>
  );
};

export default HashTagPage;
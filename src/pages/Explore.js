import { getFirestore, query, collection, getDocs, limit, orderBy, startAfter } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import useWindowSize from "../hooks/useWindowSize";
import { useNavigate, useLocation } from "react-router-dom";
import './Explore.css';
import PhotoGrid from "../components/PhotoGrid";

const db = getFirestore();

const Explore = (props) => {
  const {
    getPhotoURLs,
    isMobile,
    getPostData,
    setIsLoadingPage,
    setBackgroundLocation
  } = props;
  const [width, height] = useWindowSize();
  const [postsArray, _setPostsArray] = useState([]);
  const postsArrayReference = useRef(postsArray);
  const setPostsArray = (data) => {
    postsArrayReference.current = data;
    _setPostsArray(data)
  }
  const [lastPostDocument, _setLastPostDocument] = useState('');
  const lastPostDocumentReference = useRef(lastPostDocument);
  const setLastPostDocument = (data) => {
    lastPostDocumentReference.current = data;
    _setLastPostDocument(data);
  };
  const [isLoading, setIsLoading] = useState(false);
  const firedRef = useRef(false);
  const [topRowsPast, setTopRowsPast] = useState(0);
  const [bottomRowsPast, setBottomRowsPast] = useState(0);
  const photoRef = useRef(null);
  const photoHeight = useRef(null);

  useEffect(() => {
    if (width !== 0 && photoRef.current !== null) {
      console.log('hi');
      photoHeight.current = photoRef.current.getBoundingClientRect().height;
    }
  },[width, photoRef.current]);

  const getExplorePosts = async (user) => {
    setIsLoading(true);
    const postArray = [];
    const postData = query(collection(db, 'postUploads'), 
      orderBy('uploadDate', 'desc'), 
      limit(12)); 
    const explorePostSnapshot = await getDocs(postData);
    explorePostSnapshot.forEach((post) => {
      let newPost = getPhotoURLs(post.data());
      postArray.push(newPost);
    })
    Promise.all(postArray).then((posts) => {
      setPostsArray(posts);
      setIsLoading(false);
    });
    setLastPostDocument(explorePostSnapshot.docs[explorePostSnapshot.docs.length-1]);
  };

  const getNextExplorePosts = async () => {
    console.log('getNextExplorePosts')
    const promiseArray = [];
    const postData = query(collection(db, 'postUploads'), 
      orderBy('uploadDate', 'desc'), 
      startAfter(lastPostDocumentReference.current),
      limit(12)); 
    const nextPostSnapshot = await getDocs(postData);
    nextPostSnapshot.forEach((post) => {
      let newPost = getPhotoURLs(post.data());
      promiseArray.push(newPost);
    })
    Promise.all(promiseArray).then((posts) => {
      setPostsArray([...postsArrayReference.current, ...posts]);
    });
    setLastPostDocument(nextPostSnapshot.docs[nextPostSnapshot.docs.length-1]);
    firedRef.current = false;
  };

  const scrollHandler = () => {
    console.log(photoHeight.current);
    const bufferFromBottom = 300;
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const {
      scrollHeight
    } = document.documentElement;
    if ((scrollPosition + bufferFromBottom) > scrollHeight && firedRef.current === false) {
      console.log('next posts fetching')
      getNextExplorePosts();
      firedRef.current = true;
    };
    rowsPastHandler();
  };

  const rowsPastHandler = () => {
    const scrollPosition = window.pageYOffset;
    const rowsPast = Math.floor(scrollPosition / photoHeight.current);
    const buffer = 3;
    setTopRowsPast(rowsPast - buffer);
    console.log(rowsPast, scrollPosition, photoHeight);
    const rowsVisable = Math.floor(window.innerHeight / photoHeight.current);
    setBottomRowsPast(rowsPast + rowsVisable + buffer);
  };

  useEffect(() => {
    const { 
      scrollHeight 
    } = document.documentElement;
    if (!isLoading && scrollHeight === window.innerHeight) {
      getNextExplorePosts();
      rowsPastHandler();
    };
  },[isLoading])

  useEffect(() => {
    window.addEventListener('scroll', scrollHandler);
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, []);

  useEffect(() => {
    getExplorePosts();
  },[]);

  return (
    <div 
      className="explore-page"
      style={{
        paddingTop: `${photoHeight.current * topRowsPast}px`
      }}
    >
      {isLoading &&
        <div className='explore-spinner-wrapper'>
          <svg aria-label="Loading..." className='spinner explore' viewBox="0 0 100 100">
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
        </div>      
      }
      {postsArray.length !== 0 &&
        <PhotoGrid
          photoRef = {photoRef}
          bottomRowsPast = {bottomRowsPast}
          topRowsPast = {topRowsPast}
          isMobile = {isMobile}
          getPostData = {getPostData}
          setIsLoadingPage = {setIsLoadingPage}
          setBackgroundLocation = {setBackgroundLocation}
          postsArray = {postsArray}
        />
      }

    </div>
  )
}

export default Explore;
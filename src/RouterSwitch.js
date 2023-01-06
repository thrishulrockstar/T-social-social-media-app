import './RouterSwitch.css';
import MobileNavigationBars from './components/MobileNavigationBars.js'
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { BrowserRouter, Route, Routes, Link, useParams, useLocation} from "react-router-dom";
import Homepage from "./pages/Homepage";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import firebaseApp from "./Firebase"; 
import { confirmPasswordReset, getAuth, onAuthStateChanged, updateProfile} from "firebase/auth";
import NavigationBar from "./components/NavigationBar";
import Inbox from "./pages/Inbox";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import defaultProfileImage from "./images/default-profile-image.jpg";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import EditProfile from './pages/EditProfile';
import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs, 
  orderBy, 
  arrayUnion, 
  updateDoc, 
  arrayRemove, 
  deleteDoc, 
  onSnapshot,
  limit,
  documentId,
  startAfter,
} from 'firebase/firestore';
import UploadPhotoMobile from './pages/UploadPhotoMobile';
import UploadPhotoMobileDetails from './pages/UploadPhotoMobileDetails';
import UploadPhotoModal from './components/UploadPhotoModal';
import PostLinksModal from './components/PostLinksModal';
import MobilePhotoPost from './pages/MobilePhotoPost';
import MobileComments from './pages/MobileComments';
import { v4 as uuidv4 } from 'uuid';
import LikedBy from './pages/LikedBy';
import UnfollowModal from './components/UnfollowModal';
import LikedByModal from './components/LikedByModal';
import PhotoPostModal from './components/PhotoPostModal';
import ProfileModal from './components/ProfileModal';
import ExplorePeople from './pages/ExplorePeople';
import Followers from './pages/Followers';
import Following from './pages/Following';
import FollowersModal from './components/FollowersModal';
import FollowingModal from './components/FollowingModal';
import SearchResults from './components/SearchResults';
import TagPeopleMobile from './pages/TagPeopleMobile';
import NewMessage from './pages/NewMessage';
import DirectMessage from './pages/DirectMessage';
import MobileShareModal from './components/MobileShareModal';
import MessageLinksModal from './components/MessageLinksModal';
import DirectMessageDetailsModal from './components/DirectMesssageDetailsModal';
import DeleteChatModal from './components/DeleteChatModal';
import DirectMessageMemberModal from './components/DirectMessageMemberModal';
import AddPeopleModal from './components/AddPeopleModal';
import MessageLikesMobile from './components/MessageLikesMobile';
import DesktopDirectMessages from './pages/DesktopDirectMessages';
import NewMessageModal from './components/NewMessageModal';
import SharePostModal from './components/SharePostModal';
import MessageLikesModal from './components/MessageLikesModal';
import { type } from '@testing-library/user-event/dist/type';
import HashTagPage from './pages/HashTagPage';
import DeleteCommentModal from './components/DeleteCommentModal';
import NotificationPage from './pages/NotificationPage';

const auth = getAuth();
const storage = getStorage();
const db = getFirestore();

const RouterSwitch = () => {

  // Site Wide //

  const [userLoggedIn, setUserLoggedIn] = useState('');
  const [userData, setUserData] = useState({});
  const [displayNotification, setDisplayNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hideTopNavigation, setHideTopNavigation] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [currentUsersPage, setCurrentUsersPage] = useState(false);

  const [currentPath, setCurrentPath] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileNavigate, setProfileNavigate] = useState('');
  const [usernameLink, setUsernameLink] = useState('');
  const [isPostLinksOpen, setIsPostLinksOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState('');
  const [photosArray, setPhotosArray] = useState([]);

  const [selectedListProfile, setSelectedListProfile] = useState('');
  const [isLikedByModalOpen, setIsLikedByModalOpen] = useState(false);
  const [backgroundLocation, setBackgroundLocation] = useState(null);
  const [allUserProfiles, setAllUserProfiles] = useState([]);
  const [profileModalData, setProfileModalData] = useState(null);
  const [profileModalPosts, setProfileModalPosts] = useState(null);
  const [isMouseHovering, setIsMouseHovering] = useState(false);
  const [profileModalLocation, setProfileModalLocation] = useState(null);
  const [profileModalTimeoutID, setProfileModalTimeoutID] = useState(null);
  const timerRef = useRef();
  const [isLocationPost, setIsLocationPost] = useState(false)
  const [commentIDs, setCommentIDs] = useState('');
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // COMMENTS //
  const [selectedComment, setSelectedComment] = useState(null);
  const [isCommentDeleteOpen, setIsCommentDeleteOpen] = useState(false);

  // Profile //
  const nextPostsFired = useRef(false);  
  const [profilePosts, _setProfilePosts] = useState([]);
  const profilePostsReference = useRef(profilePosts);
  const setProfilePosts = (data) => {
    profilePostsReference.current = data;
    _setProfilePosts(data);
  };
  const [profileData, _setProfileData] = useState([]);
  const profileDataReference = useRef(profileData);
  const setProfileData = (data) => {
    profileDataReference.current = data;
    _setProfileData(data);
  };
  const [lastProfilePostDocument, _setLastProfilePostDocument] = useState('')
  const lastProfilePostDocumentReference = useRef(lastProfilePostDocument);
  const setLastProfilePostDocument = (data) => {
    lastProfilePostDocumentReference.current = data;
    _setLastProfilePostDocument(data);
  };
  const [profileImages, setProfileImages] = useState([]);
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [profileUpload, setProfileUpload] = useState('');
  const profileImageRef = ref(storage, `profilePhotos/${userData.uid}.jpg`);
  const [profilePhotoModal, setProfilePhotoModal] = useState(false);
  const [isProfilePhotoUploading, setIsProfilePhotoUploading] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [profileTaggedPosts, setProfileTaggedPosts] = useState([]);
  const [profileSavedPosts, setProfileSavedPosts] = useState([]);

  // DESKTOP IMAGE UPLOAD //

  const [photoUploadModalOpen, setPhotoUploadModalOpen] = useState(false);

  // MOBILE IMAGE UPLOAD //

  const [aspectRatio, setAspectRatio] = useState('');
  const [flippedAspectRatio, setFlippedAspectRatio] = useState('');
  const [mobilePhotoUpload, setMobilePhotoUpload] = useState('');
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [editedPhoto, setEditedPhoto] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);
  const [imageFitHeight, setImageFitHeight] = useState(true);
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [imageDegrees, setImageDegrees] = useState(0);
  const [originPointY, setOriginPointY] = useState(50);
  const [lastOrginY, setLastOriginY] = useState(50);
  const [originPointX, setOriginPointX] = useState(50);
  const [lastOrginX, setLastOriginX] = useState(50);
  const [imageFlipped, setImageFlipped] = useState(false);
  const [imageOrientation, setImageOrientation] = useState('horizontal-up')
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [pointerStartXY, setPointerStartXY] = useState({});
  const [filterScrollLeft, setFilterScrollLeft] = useState(0);
  const [photoUploadText, setPhotoUploadText] = useState('');
  const canvasRef = useRef(null);
  const shortestImageRatio = 1080/565;
  const widestImageRatio = 1080/1350;
  const [tagData, setTagData] = useState([]);
  const [tagIDs, setTagIDs] = useState([]);
  const [locationBeforeUpload, setLocationBeforeUpload] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const uploadCanvasRef = useRef(null);
  const [croppedAspectRatio, setCroppedAspectRatio] = useState(0);
  const [userIndex, setUserIndex] = useState(null);
  const [photoUploadTextArray, setPhotoUploadTextArray] = useState([]);
  const [captionSearchString, setCaptionSearchString] = useState('')

  // SEARCH //

  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const searchTimeoutRef = useRef();
  const [isSearching, setIsSearching] = useState(false);
  const [isNoMatch, setIsNoMatch] = useState(false);
  const [isSearchHashTag, setIsSearchHashTag] = useState(false);

  // MESSAGES //

  const [recipientSelection, setRecipientSelection] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [profilePhotoTitle, setProfilePhotoTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [postToSend, setPostToSend] = useState(null);
  const [isSharePostOpen, setIsSharePostOpen] = useState(false);
  const [isMessageLinksOpen, setIsMessageLinksOpen] = useState(false);
  const [isMessageDetailsOpen, setIsMessageDetailsOpen] = useState(false);
  const [selectedDirectMessageID, setSelectedDirectMessageID] = useState('');
  const [isDeleteChatOpen, setIsDeleteChatOpen] = useState(false);
  const [notReadCount, setNotReadCount] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMemberUID, setSelectedMemberUID] = useState('');
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [selectedMessageID, setSelectedMessageID] = useState('');
  const [isMessageLikesOpen, setIsMessageLikesOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [isGettingDirectMessages, setIsGettingDirectMessages] = useState(false);

  //HASH TAG //
  const [hashTagString, setHashTagString] = useState('');

  //NOTIFICATIONS //
  const [userNotifications, setUserNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState({
    comment: 0,
    like: 0,
    follow: 0,
  });
  const [isNotificationsNotRead, setIsNotificationsNotRead] = useState(false);
  const [isNotificationPopUpVisable, setIsNotificationPopUpVisable] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  //HOMEPAGE//
  const [postHeightArray, setPostHeightArray] = useState([]);
  const [pageYOffset, setPageYOffset] = useState(0);
  const [indexInView, setIndexInView] = useState(0);
  const [isHomePageLoading, setIsHomePageLoading] = useState(false);

  const getNotReadNotifications = async () => {
    const commentsArray = [];
    const followsArray = [];
    const likesArray = [];    
    const notificationsQuery = query(collection(db, 'notifications'),
      where('recipientUID', '==', userData.uid), where('notRead', '==', true));
    const notificationSnapshot = await getDocs(notificationsQuery);
    notificationSnapshot.forEach((document) => {
      const {
        type
      } = document.data();
      if (type === 'mention' || type === 'comment') {
        commentsArray.push(document.data());
      }
      if (type === 'follow') {
        followsArray.push(document.data());
      }
      if (type === 'like') {
        likesArray.push(document.data());
      };
    });
    setNotificationCount({
      comment: commentsArray.length,
      like: likesArray.length,
      follow: followsArray.length
    });
    if (commentsArray.length !== 0 ||
      likesArray.length !== 0 ||
      followsArray.length !== 0) {
        setIsNotificationsNotRead(true);
        setIsNotificationPopUpVisable(true);
    };
  };

  useEffect(() => {
    if (userData.uid !== undefined) {
      getNotReadNotifications();
    };
  }, [userData]);

  const getNotifications = async () => {
    setIsActivityLoading(true);
    const {
      uid
    } = userData;
    const notificationsQuery = query(collection(db, 'notifications'),
      where('recipientUID', '==', uid), orderBy('date', 'desc'));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    const notificationsArray = [];
    const notReadArray = [];
    notificationsSnapshot.forEach((document) => {
      const {
        notRead
      } = document.data();
      if (notRead) {
        notReadArray.push(document.data());
      }
      notificationsArray.push(document.data());
    });
    for (let index = 0; index < notReadArray.length; index++) {
      const {
        notificationID
      } = notReadArray[index];
      await updateDoc(doc(db, 'notifications', notificationID), {
        notRead: false
      });
    };
    const newNotificationsArray = notificationsArray.map((notification) => {
      const {
        date,
        notRead,
      } = notification;
      if (notRead) {
        return {...notification, title: 'New'};
      } else {
        const title = notificationTitleHandler(date);
        return {...notification, title};        
      };
    });
    setIsActivityLoading(false);
    setUserNotifications(newNotificationsArray);
    console.log(newNotificationsArray);
  };

  const notificationTitleHandler = (date) => {
    const timePast = Date.now() - date;
    const minutesPast = timePast / 60000;
    const hoursPast = minutesPast / 60;
    const daysPast = hoursPast / 24;
    const weeksPast = daysPast / 7;
    switch (true) {
      case hoursPast < 24:
        return 'Today';
      case daysPast > 1 && daysPast < 2:
        return 'Yesterday';
      case daysPast > 2 && weeksPast < 1:
        return 'This Week';
      case weeksPast > 1 && weeksPast < 4:
        return 'This Month';
      case weeksPast > 4:
        return 'Earlier';
      default:
    }
  }


  //SITE WIDE//

  const formatTime = (uploadDate) => {
    const currentDate = Date.now();
    const timePast = Date.now() - uploadDate;
    const timeStampYear = new Date(uploadDate).getFullYear();
    const currentYear = new Date(currentDate).getFullYear();
    const minutesPast = timePast / 60000;
    const hoursPast = minutesPast / 60;
    const daysPast = hoursPast / 24;
    switch (true) {
      case minutesPast < 1:
        return 'NOW';
      case minutesPast < 60 && minutesPast > 1:
        const minutes = Math.floor(minutesPast)
        return `${minutes} ${
          minutes < 1 
            ? 'MINUTE' 
            : 'MINUTES'
        } AGO`;
      case hoursPast >= 1 && hoursPast < 24:
        const hours = Math.floor(hoursPast)
        return `${hours} ${
          hours < 1 
            ? 'HOUR' 
            : 'HOURS'
        } AGO`;
      case daysPast >= 1 && daysPast < 8:
        const days = Math.floor(daysPast)
        return `${days} ${
          days < 1 
            ? 'DAY' 
            : 'DAYS'
        } AGO`;
      default:
        if (timeStampYear === currentYear) {
          return `${new Date(uploadDate)
            .toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
            })}`.toUpperCase();
        } else {
          return `${new Date(uploadDate)
            .toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`.toUpperCase();
        }
    }
  }

  const formatTimeShort = (uploadDate) => {
    const timePast = Date.now() - uploadDate;
    const minutesPast = timePast / 60000;
    const hoursPast = minutesPast / 60;
    const daysPast = hoursPast / 24;
    const weeksPast = daysPast / 7;
    switch (true) {
      case minutesPast < 1:
        return 'Now';
      case minutesPast < 60 && minutesPast > 1:
        return `${Math.floor(minutesPast)}m`;
      case hoursPast >= 1 && hoursPast < 24:
        return `${Math.floor(hoursPast)}h`;
      case daysPast >= 1 && daysPast < 7:
        return `${Math.floor(daysPast)}d`;
      case weeksPast >= 1:
        return `${Math.floor(weeksPast)}w`;
      default:
    }
  };

  //MESSAGES //

  const getNotReadMessages = () => {
    const notReadQuery = query(collection(db, 'messages'), 
      where('notRead', 'array-contains', userData.uid)
      );
    onSnapshot(notReadQuery, (querySnapShot) => {
      const notReadArray = [];
      querySnapShot.forEach((document) => {
        notReadArray.push(document.data());
      })
      console.log(notReadArray.length);
      setNotReadCount(notReadArray.length);
    })
  }

  const getDirectMessages = async () => {
    const {
      uid
    } = userData;
    const allDirectMessagesQuery = query(collection(db, 'directMessages'),
      where('UIDs', 'array-contains', uid),
      orderBy('date', 'desc')
    );
    const messagesSnapshot = await getDocs(allDirectMessagesQuery);
    setDirectMessages(() => {
      const messagesArray = [];
      messagesSnapshot.forEach((document) => {
        messagesArray.push(document.data());
      });
      return messagesArray;      
    });
  };

  useEffect(() => {
    if (userData.uid !== undefined) {
      getNotReadMessages();
      getDirectMessages();
    };
  }, [userData]);

  // SEARCH //

  const deleteRecentSearch = async (event, uid) => {
    event.stopPropagation();
    const { recentSearch } = userData;
    const index = recentSearch.findIndex((search) => search.uid === uid);
    const currentUserDataRef = doc(db, 'users', userData.uid);
    if (index !== -1) {
      await updateDoc(currentUserDataRef, {
        recentSearch: arrayRemove(recentSearch[index])
      });
      console.log('success: recentSearch removed');
    } else {
      console.log('error: recentSearch delete');
    }
    getUserProfileDoc(userData);
  }

  const deleteRecentHashTagSearch = async (event, hashTag) => {
    event.stopPropagation();
    event.preventDefault();
    const { recentSearch } = userData;
    const index = recentSearch.findIndex((search) => search.hashTag === hashTag);
    const currentUserDataRef = doc(db, 'users', userData.uid);
    if (index !== -1) {
      await updateDoc(currentUserDataRef, {
        recentSearch: arrayRemove(recentSearch[index])
      });
      console.log('success: recentSearch removed');
    } else {
      console.log('error: recentSearch delete');
    }
    getUserProfileDoc(userData);
  }

  const clearRecentSearch = async () => {
    const currentUserDataRef = doc(db, 'users', userData.uid); 
    await updateDoc(currentUserDataRef, {recentSearch: []});
    getUserProfileDoc(userData);
  }

  const saveRecentSearch = async (uid) => {
    const profileDataRef = doc(db, 'users', uid);
    const currentUserDataRef = doc(db, 'users', userData.uid); 
    const profileDataSnap = await getDoc(profileDataRef);
    const currentUserDataSnap = await getDoc(currentUserDataRef);
    if (currentUserDataSnap.exists()) {
      const {
        photoURL,
        username,
        fullname,
        uid
      } = profileDataSnap.data();
      const {
        recentSearch
      } = currentUserDataSnap.data();
      const index = recentSearch.findIndex((search) => search.uid === uid);
      if (index === -1) {
        await updateDoc(currentUserDataRef, {
          recentSearch: arrayUnion({
            searchID: uuidv4(),
            photoURL: photoURL,
            uid: uid,
            uploadDate: Date.now(),
            username: username,
            fullName: fullname
          })
        });         
      } else {
        await updateDoc(currentUserDataRef, {
          recentSearch: arrayRemove(recentSearch[index])
        });
        await updateDoc(currentUserDataRef, {
          recentSearch: arrayUnion({
            searchID: uuidv4(),
            photoURL: photoURL,
            uid: uid,
            uploadDate: Date.now(),
            username: username,
            fullName: fullname
          })
        });  
      }
    }
    getUserProfileDoc(userData);
  }

  const saveRecentHashTagSearch = async (hash) => {
    console.log('saveRecentHashTag', hash);
    const {
      hashTag,
      posts
    } = hash;
    const currentUserDataRef = doc(db, 'users', userData.uid);
    const currentUserDataSnapshot = await getDoc(currentUserDataRef);
    if (currentUserDataSnapshot.exists()) {
      const {
        recentSearch
      } = currentUserDataSnapshot.data();
      const index = recentSearch.findIndex((search) => search.hashTag === hashTag);
      console.log(index);
      if (index === -1) {
        await updateDoc(currentUserDataRef, {
          recentSearch: arrayUnion({
            hashTag,
            postCount: posts.length,
            uploadDate: Date.now(),
          })
        });
      } else {
        await updateDoc(currentUserDataRef, {
          recentSearch: arrayRemove(recentSearch[index])
        });
        await updateDoc(currentUserDataRef, {
          recentSearch: arrayUnion({
            hashTag,
            postCount: posts.length,
            uploadDate: Date.now(),
          })
        });
      };
    };
    getUserProfileDoc(userData);
    setSearchString('');
  };

  const getSearchResults = async () => {
    setIsNoMatch(false);
    setIsSearching(true);
    const matchedUsers = [];
    let searchTerm = searchString.toLowerCase();
    let searchQuery;
    console.log(isSearchHashTag);
    if (isSearchHashTag) {
      searchTerm = searchTerm.slice(1);
      searchQuery = query(collection(db, 'hashTags'), 
        where(documentId(), '>=', searchTerm), where(documentId(), '<=', searchTerm+ '\uf8ff' ));
    } else {
      searchQuery = query(collection(db, 'users'), 
        where('username', '>=', searchTerm), where('username', '<=', searchTerm+ '\uf8ff' ));
    }
    console.log(searchQuery);
    console.log(searchTerm)
    const usersSnapshot = await getDocs(searchQuery);
    usersSnapshot.forEach((user) => {
      if (isSearchHashTag) {
        matchedUsers.push({
          hashTag: user.id,
          ...user.data()
        });
      } else {
        matchedUsers.push(user.data());
      };
    });
    if (matchedUsers.length === 0) {
      setIsNoMatch(true);
    }
    setSearchResults(matchedUsers);
    setIsSearching(false);
  }

  useEffect(() => {
    console.log(searchString);
    clearTimeout(searchTimeoutRef.current);
    setSearchResults([]);
    if (searchString !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        getSearchResults(); 
      }, 300);     
    }; 
  }, [searchString]);

  useEffect(() => {
    console.log(searchResults);
  }, [searchResults]);

  // HOMEPAGE //

  const onMouseEnter = (uid, ref) => {
    setProfileModalData(null);
    setProfileModalPosts(null);
    console.log(ref);
    console.log('mouse entered');
    // clearTimeout(timerRef.current);
    const location = ref.getBoundingClientRect();
    const locationHeight = ref.offsetHeight;
    let locationY = location.y + window.pageYOffset + locationHeight
    if (window.innerHeight < (location.y + locationHeight + 350)) {
      locationY = location.y + window.pageYOffset - 346;
    }
    setProfileModalLocation({
      x: location.x,
      y: locationY
    });
    timerRef.current = setTimeout(() => {
      getModalProfileData(uid);
      setIsMouseHovering(true);      
    }, 400);
  }

  const onMouseLeave = () => {
    console.log('mouse left');
    console.log('set:', timerRef.current)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsMouseHovering(false);
    }, 400);     
  }

  const getModalProfileData = async (uid) => {
    let urlArray = []
    console.log(uid);
    const profileDataRef = doc(db, 'users', uid);
    const profileDataSnap = await getDoc(profileDataRef);
    const profileImageData = query(collection(db, 'postUploads'), 
      where('uid', '==', uid), orderBy('uploadDate', 'desc'));
    const profileImageDataSnap = await getDocs(profileImageData);
    profileImageDataSnap.forEach((doc) => {
      let newPost = getPhotoURLs(doc.data());
      urlArray.push(newPost);
    });
    console.log(urlArray);
    Promise.all(urlArray).then((values) => {
      setProfileModalData(profileDataSnap.data());
      setProfileModalPosts(values);    
    })
  }

  useEffect(() => {
    console.log(profileModalData);
    console.log(isMouseHovering);
  },[profileModalData]);

  const getUserProfiles = async () => {
    console.log('getuserprofiles')
    const allUsers = [];
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    usersSnap.forEach((doc) => {
      if (doc.data().uid === userData.uid) {
        return null
      }
      const followersIndex = doc.data().followersUID.findIndex((follower) => follower === userData.uid);
      console.log(followersIndex, doc.data());
      if (followersIndex !== -1) {
        return null;
      }
      allUsers.push(doc.data());
    });
    console.log(allUsers);
    setAllUserProfiles(allUsers);
  }

  const getFollowingPosts = async () => {
    setIsHomePageLoading(true)
    const { 
      following,
    } = userData;
    const followingAndUser = [...following, userData]
    const followingPosts = Array.from({length: followingAndUser.length}, async (_, i) => {
      const postData = query(collection(db, 'postUploads'), where('uid', '==', followingAndUser[i].uid));
      return new Promise( async (resolve) => {
        const postArray = [];
        const followingPostsSnap = await getDocs(postData);
        followingPostsSnap.forEach((post) => {
          let newPost = getPhotoURLs(post.data());
          postArray.push(newPost);
        })
        Promise.all(postArray).then((posts) => {
          resolve(posts);
        })
      })
    })
    Promise.all(followingPosts).then((posts) => {
      const allPosts = [];
      posts.forEach((post) => allPosts.push(...post));
      allPosts.sort((a, b) => {
        return b[0].uploadDate - a[0].uploadDate;
      });
      console.log(allPosts);
      setPhotosArray(allPosts);
      setIsHomePageLoading(false);
    })
  }

  useEffect(() => {
    if (userData !== undefined) {
      getFollowingPosts();
    }
  }, [userData.uid])

  // POSTS //

  const stringToLinks = (string) => {

    // finds links in string //
    const profileIndexs = [];
    const hashTagIndexs = [];
    const stringArray = string.split(' ');
    stringArray.forEach((string, index) => {
      if (string[0] === '@') {
        profileIndexs.push(index);
      };
      if (string[0] === '#') {
        hashTagIndexs.push(index);
      }
    });

    // replaces strings with links //
    profileIndexs.forEach((index) => {
      const username = stringArray[index].substring(1);
      const profileLink = <Link to={`/${username}`}>@{username}</Link>
      stringArray.splice(index, 1, profileLink);
    });
    hashTagIndexs.forEach((index) => {
      const hashTag = stringArray[index].substring(1);
      const profileLink = <Link to={`/explore/tags/${hashTag}`}>#{hashTag}</Link>
      stringArray.splice(index, 1, profileLink);
    });

    // adds spaces to words //
    let wordsSection = [];
    const entireCaption = [];
    stringArray.forEach((word) => {
      if (typeof word === 'string') {
        return wordsSection.push(word);
      }
      if (word instanceof Object) {
        if (wordsSection.length === 0) {
          return entireCaption.push(word);
        } else {
          const sentence = wordsSection.join(' ');
          wordsSection = [];
          entireCaption.push(sentence);
          return entireCaption.push(word);
        }
      }
    });
    if (wordsSection.length !== 0) {
      const sentence = wordsSection.join(' ');
      entireCaption.push(sentence);
    }
    return (
      entireCaption
    );
  };

  const deletePost = async (postID) => {
    const notificationsQuery = query(collection(db, 'notifications'), where('postID', '==', postID))
    const notificationSnapshot = await getDocs(notificationsQuery);
    notificationSnapshot.forEach( async (document) => {
      const {
        notificationID
      } = document.data();
      await deleteDoc(doc(db, 'notifications', notificationID));
    });
    const deleteRef = doc(db, 'postUploads', postID)
    const deleteDocument = await getDoc(deleteRef);
    const { 
      photos,
      hashTags, 
    } = deleteDocument.data();
    hashTags.forEach( async (hashTag) => {
      await deleteDoc(doc(db, hashTag, postID));
      await updateDoc(doc(db, 'hashTags', hashTag), {
        posts: arrayRemove(postID)
      });
    });
    photos.map( async (photo, index) => {
      await deletePhoto(photo[index]);
    });
    await deleteDoc(deleteRef);
  }

  const deletePhoto = async (photoID) => {
    const w1080Ref = ref(storage, `w1080_photoUploads/${photoID}.jpg`);
    const w750Ref = ref(storage, `w750_photoUploads/${photoID}.jpg`);
    const w640Ref = ref(storage, `w640_photoUploads/${photoID}.jpg`);
    const w480Ref = ref(storage, `w480_photoUploads/${photoID}.jpg`);
    const w320Ref = ref(storage, `w320_photoUploads/${photoID}.jpg`);
    const w240Ref = ref(storage, `w240_photoUploads/${photoID}.jpg`);
    const w150Ref = ref(storage, `w150_photoUploads/${photoID}.jpg`);
    try {
      await deleteDoc(doc(db, 'photoUploads', photoID));
      await deleteObject(w1080Ref);
      await deleteObject(w750Ref);
      await deleteObject(w640Ref);
      await deleteObject(w480Ref);
      await deleteObject(w320Ref);
      await deleteObject(w240Ref);
      await deleteObject(w150Ref);
    } catch (error) {
      console.log(error);
    }
  }

  const likeUploadToggle = async (postID, w150) => {
    const {
      photoURL,
      uid,
      displayName,
      fullname,
      username
    } = userData;
    const postRef = doc(db, 'postUploads', postID);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const { 
        likes,
      } = postSnap.data();
      const likeIndex = likes.findIndex((like) => like.uid === uid)
      if (likeIndex === -1) {
        const likeID = uuidv4();
        await updateDoc(postRef, {
          likes: arrayUnion({
            likeID,
            photoURL: photoURL,
            uid: uid,
            uploadDate: Date.now(),
            username: displayName,
            fullName: fullname
          })
        });
        if (postSnap.data().uid !== uid) {
          const notificationID = uuidv4();
          await setDoc(doc(db, 'notifications', notificationID), {
            notificationID,
            originID: likeID,
            notRead: true,
            recipientUID: postSnap.data().uid,
            postID,
            postPhotoURL: w150,
            profile: {
              fullname,
              username,
              photoURL,
              uid,
            },
            type: 'like',
            source: 'post',
            date: Date.now()
          })             
        } 
      } else {
        const {
          likeID
        } = likes[likeIndex]
        const notificationQuery = query(collection(db, 'notifications'), 
          where('originID', '==', likeID));
        const notificationSnapshot = await getDocs(notificationQuery);
        notificationSnapshot.forEach( async (document) => {
          await deleteDoc(doc(db, 'notifications', document.data().notificationID))
        });
        await updateDoc(postRef, {
          likes: arrayRemove(likes[likeIndex])
        });        
      }
    }
  };
  
  useEffect(() => {
    console.log(selectedPost);
  },[selectedPost]);

  const getPostData = async (postID) => {
    setIsLoadingPage(true);
    const photoArray = [];
    const profilePhotoData = query(collection(db, 'photoUploads'), 
      where('postID', '==', postID), orderBy('index'));
    const profileImageDataSnap = await getDocs(profilePhotoData);
    profileImageDataSnap.forEach((doc) => {
      photoArray.push(doc.data());
    });
    const profilePostDocument = doc(db, 'postUploads', postID);
    const postSnap = await getDoc(profilePostDocument);

    console.log([postSnap.data(), ...photoArray]);
    setSelectedPost([postSnap.data(), ...photoArray]);
  };

  useEffect(() => {
    console.log(selectedPost);
  }, [selectedPost])

  // PROFILE //

  const followHandler = async (userProfile) => {
    const {
      uid,
      photoURL,
      username,
      fullname,
    } = userData;
    console.log(userProfile);
    setSelectedListProfile(userProfile);
    setIsFollowLoading(true);
    setIsUnfollowModalOpen(false);
    const followingRef = doc(db, 'users', userData.uid);
    const followersRef = doc(db, 'users', userProfile.uid);
    const followingSnap = await getDoc(followingRef);
    if (followingSnap.exists()) {
      const { following } = followingSnap.data();
      const followingIndex = following.findIndex((user) => user.uid === userProfile.uid);
      if (followingIndex === -1) {
        await updateDoc(followingRef, {
          following: arrayUnion({
            uid: userProfile.uid,
            photoURL: userProfile.photoURL,
            username: userProfile.username,
            fullName: userProfile.fullName || userProfile.fullname,
          })
        });
        await updateDoc(followingRef, {
          followingUID: arrayUnion(userProfile.uid)
        });        
      } else {
        await updateDoc(followingRef, {
          following: arrayRemove(following[followingIndex])
        });
        await updateDoc(followingRef, {
          followingUID: arrayRemove(userProfile.uid)
        });
      };
    };
    const followerSnap = await getDoc(followersRef);
    if (followerSnap.exists()) {
      const { followers } = followerSnap.data();
      const followersIndex = followers.findIndex((user) => user.uid === userData.uid);
      if (followersIndex === -1) {
        await updateDoc(followersRef, {
          followers: arrayUnion({
            uid,
            photoURL,
            username,
            fullname,
          })
        });
        await updateDoc(followersRef, {
          followersUID: arrayUnion(userData.uid)
        });
        const notificationID = uuidv4();
        await setDoc(doc(db, 'notifications', notificationID), {
          notificationID,
          originID: uid,
          notRead: true,
          recipientUID: userProfile.uid,
          profile: {
            fullname,
            username,
            photoURL,
            uid,
          },
          type: 'follow',
          source: 'follow',
          date: Date.now()
        });      
      } else {
        console.log('unfollow!')
        await updateDoc(followersRef, {
          followers: arrayRemove(followers[followersIndex])
        });
        await updateDoc(followersRef, {
          followersUID: arrayRemove(userData.uid)
        });
        const notificationQuery = query(collection(db, 'notifications'),
          where('originID', '==', uid));
        const notificationSnapshot = await getDocs(notificationQuery);
        notificationSnapshot.forEach( async (document) => {
          await deleteDoc(doc(db, 'notifications', document.data().notificationID));
        });
      };
    };
    await getUserProfileDoc(auth.currentUser);
    if (profileData.length !== 0) {
      await getUserProfileData(userProfile.username);  
    }
    setIsFollowLoading(false);
    setSelectedListProfile('');
  };

  const unfollowModalHandler = (user) => {
    console.log('user:', user);
    setSelectedListProfile(user);
    isUnfollowModalOpen
      ? setIsUnfollowModalOpen(false)
      : setIsUnfollowModalOpen(true);
  }

  // MOBILE IMAGE UPLOAD //

  const photoUploadTextHandler = (event) => {
    const { value } = event.target;
    const valueArray = value.split('');
    const lastLetter = value.substring(value.length - 1);
    console.log(lastLetter);
    if (lastLetter === '@') {
      console.log('@ found');
      setUserIndex(value.length)
    } else if (lastLetter === '#') {
      console.log('# found');
      setUserIndex(value.length);
      setIsSearchHashTag(true);
    }
    if (value.length < userIndex) {
      setUserIndex(null);
      setIsSearching(false);
      setIsSearchHashTag(false);
    };
    console.log(userIndex);
    if (userIndex !== null) {
      console.log(value.substring(userIndex))
      setCaptionSearchString(value.substring(userIndex));
      const lastLetter = value.substring(value.length - 1);
      console.log(lastLetter)
      if (lastLetter === ' ') {
        console.log('cleared');
        setUserIndex(null);
      }
    }
    if ((valueArray[valueArray.length - 1] === ' ' && 
      photoUploadTextArray[photoUploadTextArray.length - 1] === ' ') || 
      valueArray.length > 2200) {
      return
    } else {
      setPhotoUploadText(value);
    }
  }

  useEffect(() => {
    setPhotoUploadTextArray(photoUploadText.split(''));
  }, [photoUploadText]);

  useEffect(() => {
    if (!photoUploadOpen) {
      console.log('unmount')
      centerImage();
      imageLoad();
      setImageDegrees(0);
      setImageOrientation('horizontal-up');
      setSelectedFilter('normal');
      setImageFlipped(false);
      setImageFitHeight(true);
      setFilterScrollLeft(0);
      setPhotoUploadText('');
      setMobilePhotoUpload('');
      setTagData([]);
    }
  }, [photoUploadOpen]);

  useEffect(() => {
    centerImage();
    imageLoad();
  },[aspectRatio, flippedAspectRatio]);

  useEffect(() => {
    imageHandler();
  }, [imageFitHeight]);

  useEffect(() => {
    if (!imageFitHeight) {
      imageHandler();
    };
  }, [imageFlipped]);

  useEffect(() => {
    resizeCropFilterImage(true);
  }, [imageX, imageY, selectedFilter, imageDegrees, imageFitHeight]);

  const pointerStart = (event) => {
    const x = event.screenX
    const y = event.screenY
    setPointerStartXY({ 
      x: x, 
      y: y
    });
  }

  const pointerTracker = (event) => {
    let x;
    let y;
    if (imageOrientation === 'vertical-up') {
      y = (pointerStartXY.x - event.screenX) * -1;
      x = (pointerStartXY.y - event.screenY);
    } else if (imageOrientation === 'horizontal-down') {
      x = (pointerStartXY.x - event.screenX);
      y = (pointerStartXY.y - event.screenY);
    } else if (imageOrientation === 'vertical-down') {
      y = (pointerStartXY.x - event.screenX);
      x = (pointerStartXY.y - event.screenY) * -1;
    } else {
      x = (pointerStartXY.x - event.screenX) * -1;
      y = (pointerStartXY.y - event.screenY) * -1;  
    }
    if (imageFitHeight) {
      setPointerX((x/4) + imageX);
      setPointerY((y/4) + imageY);
      setOriginPointX(lastOrginX - (((y/4) / (imageHeight / 2)) * 50));
      setOriginPointY(lastOrginY - (((x/4) / (imageWidth / 2)) * 50));    
    }
  };

  const imageLocationHandler = () => {
    if (imageFitHeight) {
      if (pointerY !== 0) {
        setPointerY(0);
        setImageY(0);
        setLastOriginX(50);
        setOriginPointX(50);
      }
      if (pointerX <= ((aspectRatio * 100) - 100) * -1) {
        setPointerX(((aspectRatio * 100) - 100) * -1);
        setImageX(((aspectRatio * 100) - 100) * -1);
        setOriginPointY(50 + ((((imageWidth - 100) / 2) / (imageWidth / 2)) * 50));
        setLastOriginY(50 + ((((imageWidth - 100) / 2) / (imageWidth / 2)) * 50));
        return
      }
    }
    if (pointerX >= 0) {
      setPointerX(0);
      setImageX(0);
      setOriginPointY(50 - ((((imageWidth - 100) / 2) / (imageWidth / 2)) * 50));
      setLastOriginY(50 - ((((imageWidth - 100) / 2) / (imageWidth / 2)) * 50));
      return
    }
    setImageX(pointerX);
    setLastOriginY(originPointY);
  }

  const verticalImageHandler = () => {
    if (imageFitHeight) {
      if (pointerX !== 0) {
        setPointerX(0);
        setImageX(0);
        setLastOriginY(50);
        setOriginPointY(50);
      }
      if (pointerY <= ((flippedAspectRatio * 100) - 100) * -1) {
        setPointerY(((flippedAspectRatio * 100) - 100) * -1);
        setImageY(((flippedAspectRatio * 100) - 100) * -1);
        setOriginPointX(50 + ((((imageHeight - 100) / 2) / (imageHeight / 2)) * 50));
        setLastOriginX(50 + ((((imageHeight - 100) / 2) / (imageHeight / 2)) * 50));
        return
      }
    }
    if (pointerY >= 0) {
      setPointerY(0);
      setImageY(0);
      setOriginPointX(50 - ((((imageHeight - 100) / 2) / (imageHeight / 2)) * 50));
      setLastOriginX(50 - ((((imageHeight - 100) / 2) / (imageHeight / 2)) * 50));
      return
    }
    setImageY(pointerY);
    setLastOriginX(originPointX);
  }

  const centerImage = () => {
    const percent = (((aspectRatio * 100) - 100) / 2) * -1;
    const verticalPercent = (((flippedAspectRatio * 100) - 100) / 2) * -1;
    if (aspectRatio < 1) {
      setImageX(0);
      setPointerX(0);
      setPointerY(verticalPercent);
      setImageY(verticalPercent);
    } 
    if (aspectRatio > 1) {
      setPointerY(0);
      setImageY(0);    
      setPointerX(percent);
      setImageX(percent);
    }
    setLastOriginX(50);
    setOriginPointX(50);
    setLastOriginY(50);
    setOriginPointY(50);
  }

  const toggleImageFit = () => {
    if (!imageFitHeight) {
      setImageFitHeight(true)
      const percent = (((aspectRatio * 100) - 100) / 2) * -1;
      setPointerX(percent);
      setImageX(percent);
      setPointerY(0);
      setImageY(0);
    } else {
      setImageFitHeight(false);
      let percent;
      if (flippedAspectRatio * 100 < 52.356) {
        percent = (((shortestImageRatio * 100) - 100) / 4);
        setPointerX((((aspectRatio * 52.356) - 100) / 2) * -1);
        setImageX((((aspectRatio * 52.356) - 100) / 2) * -1);
        setPointerY(percent);
        setImageY(percent);
      } else {
        percent = (((flippedAspectRatio * 100) - 100) / 2) * -1;
        setPointerX(0);
        setImageX(0);
        setPointerY(percent);
        setImageY(percent);
      }
    }
    setLastOriginX(50);
    setOriginPointX(50);
    setLastOriginY(50);
    setOriginPointY(50);
  };

  const verticalToggleFit = () => {
    if (!imageFitHeight) {
      setImageFitHeight(true);
      const verticalPercent = (((flippedAspectRatio * 100) - 100) / 2) * -1;
      setPointerX(0);
      setImageX(0);
      setPointerY(verticalPercent);
      setImageY(verticalPercent);
    } else {
      setImageFitHeight(false);
      let percent;
      if (aspectRatio * 100 < 80) {
        percent = 10;
        setPointerY((((flippedAspectRatio * 80) - 100) / 2) * -1);
        setImageY((((flippedAspectRatio * 80) - 100) / 2) * -1);
        setPointerX(percent);
        setImageX(percent);
      } else {
        percent = ((aspectRatio * 100) - 100) / 2;
        setPointerY(0);
        setImageY(0)
        setPointerX(percent);
        setImageX(percent);
      }
    }
    setLastOriginX(50);
    setOriginPointX(50);
    setLastOriginY(50);
    setOriginPointY(50);
  }

  const imageHandler = () => {
    if (aspectRatio === 1) {
      setImageWidth(100);
      setImageHeight(100);
      return
    };
    if (aspectRatio < 1) {
      if (!imageFitHeight) {
        if (imageFlipped) {
          const imageWidth = (aspectRatio * 100) < 52.356 ? 52.356 : ((aspectRatio * 100));
          setImageHeight((aspectRatio * 100) < 52.356 ? aspectRatio * 52.356 : 100);
          setImageWidth(imageWidth);
          setPointerY(0);
          setImageY(0);
          setPointerX((100 - imageWidth) / 2);
          setImageX((100 - imageWidth) / 2);
          setOriginPointX(50);
          setLastOriginX(50);
          setOriginPointY(50);
          setLastOriginY(50);
          return
        }
        let percent;
        if (aspectRatio * 100 < 80) {
          percent = 10;
          setPointerY((((flippedAspectRatio * 80) - 100) / 2) * -1);
          setImageY((((flippedAspectRatio * 80) - 100) / 2) * -1);
          setPointerX(percent);
          setImageX(percent);
        } else {
          percent = ((aspectRatio * 100) - 100) / 2;
          setPointerY(0);
          setImageY(0)
          setPointerX(percent);
          setImageX(percent);
        }
        setImageHeight((aspectRatio * 100) < 80 ? flippedAspectRatio * 80 : 100);
        setImageWidth((aspectRatio * 100) < 80 ? 80 : (aspectRatio * 100));
        return
      }
      setImageWidth(100)
      setImageHeight((flippedAspectRatio * 100));
      return
    } 
    if (aspectRatio > 1) {
      if (!imageFitHeight) {
        if (imageFlipped) {
          const imageWidth = 80;
          setImageWidth(aspectRatio * 80);
          setImageHeight(imageWidth);
          setPointerY(10);
          setImageY(10);
          setPointerX((100 - (aspectRatio * 80)) / 2);
          setImageX((100 - (aspectRatio * 80)) / 2)
          setOriginPointX(50);
          setLastOriginX(50);
          setOriginPointY(50);
          setLastOriginY(50);
          return
        }
        let percent;
        if (flippedAspectRatio * 100 < 52.356) {
          percent = (((shortestImageRatio * 100) - 100) / 4);
          setPointerX((((aspectRatio * 52.356) - 100) / 2) * -1);
          setImageX((((aspectRatio * 52.356) - 100) / 2) * -1);
          setPointerY(percent);
          setImageY(percent);
        } else {
          percent = (((flippedAspectRatio * 100) - 100) / 2) * -1;
          setPointerX(0);
          setImageX(0);
          setPointerY(percent);
          setImageY(percent);
        }
        setImageWidth((flippedAspectRatio * 100) < 52.356 ? aspectRatio * 52.356 : 100);
        setImageHeight((flippedAspectRatio * 100) < 52.356 ? 52.356 : (flippedAspectRatio * 100));
        return
      }
      setImageWidth((aspectRatio * 100));
      setImageHeight(100)
    }
  }

  const imageLoad = () => {
    if (aspectRatio < 1) {
      setImageWidth(100)
      setImageHeight((flippedAspectRatio * 100));
      return
    } 
    if (aspectRatio > 1) {
      setImageWidth((aspectRatio * 100));
      setImageHeight(100)
    }
  }

  const imageRotate = () => {
    setImageDegrees(imageDegrees - 90);
    imageFlipped ? setImageFlipped(false) : setImageFlipped(true);
    if (imageOrientation === 'horizontal-up') {
      setImageOrientation('vertical-up');
    }
    if (imageOrientation === 'vertical-up') {
      setImageOrientation('horizontal-down');
    }
    if (imageOrientation === 'horizontal-down') {
      setImageOrientation('vertical-down');
    }
    if (imageOrientation === 'vertical-down') {
      setImageOrientation('horizontal-up');
    }
  }
  
  const resizeCropFilterImage = (upload) => {
    if (mobilePhotoUpload !== '') {
      const img = new Image();
      img.onload = () => {
          canvasCropFilterResize(img, 1080, 'display').then((blob) => {
            setEditedPhoto(blob);
          })    
      };
      img.src = mobilePhotoUpload;      
    }
  }

  const shareMobilePost = async () => {
    const postID = uuidv4();
    const resizedPhotos = await resizePhoto();
    const {
      photoID,
      aspectRatio,
      w1080,
      w750,
      w640,
      w480,
      w320,
      w240,
      w150,
    } = resizedPhotos;
    const {
      fullname,
      username,
      photoURL,
      uid,
    } = userData;

    const w1080Ref = ref(storage, `w1080_photoUploads/${photoID}.jpg`);
    const w750Ref = ref(storage, `w750_photoUploads/${photoID}.jpg`);
    const w640Ref = ref(storage, `w640_photoUploads/${photoID}.jpg`);
    const w480Ref = ref(storage, `w480_photoUploads/${photoID}.jpg`);
    const w320Ref = ref(storage, `w320_photoUploads/${photoID}.jpg`);
    const w240Ref = ref(storage, `w240_photoUploads/${photoID}.jpg`);
    const w150Ref = ref(storage, `w150_photoUploads/${photoID}.jpg`);
    const w1080Upload = await uploadBytes(w1080Ref, w1080);
    const w1080URL = await getDownloadURL(
      ref(storage, w1080Upload.metadata.fullPath)
    );
    const w750Upload = await uploadBytes(w750Ref, w750);
    const w750URL = await getDownloadURL(
      ref(storage, w750Upload.metadata.fullPath)
    );
    const w640Upload = await uploadBytes(w640Ref, w640);
    const w640URL = await getDownloadURL(
      ref(storage, w640Upload.metadata.fullPath)
    );
    const w480Upload = await uploadBytes(w480Ref, w480);
    const w480URL = await getDownloadURL(
      ref(storage, w480Upload.metadata.fullPath)
    );
    const w320Upload = await uploadBytes(w320Ref, w320);
    const w320URL = await getDownloadURL(
      ref(storage, w320Upload.metadata.fullPath)
    );
    const w240Upload = await uploadBytes(w240Ref, w240);
    const w240URL = await getDownloadURL(
      ref(storage, w240Upload.metadata.fullPath)
    );
    const w150Upload = await uploadBytes(w150Ref, w150);
    const w150URL = await getDownloadURL(
      ref(storage, w150Upload.metadata.fullPath)
    );
    const photoURLS = {
      photoID: photoID,
      aspectRatio: aspectRatio,
      postID: postID,
      index: 0,
      tags: tagData,
      w1080: w1080URL,
      w750: w750URL,
      w640: w640URL,
      w480: w480URL,
      w320: w320URL,
      w240: w240URL,
      w150: w150URL,
      uploadDate: Date.now(),
    }

    // hash tags //
    const hashTags = hashTagHandler(photoUploadText);
    console.log(hashTags);
    for (let index = 0; index < hashTags.length; index++) {
      await setDoc(doc(db, hashTags[index], postID), {
        postID,
        date: Date.now(),
      });
      const documentReference = (doc(db, 'hashTags', hashTags[index]))
      const documentSnapshot = await getDoc(documentReference);
      if (documentSnapshot.exists()) {
        await updateDoc(documentReference, {
          posts: arrayUnion(postID)
        });
      } else {
        await setDoc(documentReference, {
          posts: [postID]
        });        
      };
    };

    // 'textTags' referes to profile tags in post caption, 'profileTagHandler' gets UIDs from usernames //
    const textTags = await profileTagHandler(photoUploadText);
    for (let index = 0; index < textTags.length; index++) {
      if (textTags[index] !== uid) {
        const notificationID = uuidv4();
        await setDoc(doc(db, 'notifications', notificationID), {
          notificationID,
          notRead: true,
          recipientUID: textTags[index],
          postID,
          postPhotoURL: w150URL,
          comment: photoUploadText,
          profile: {
            fullname,
            username,
            photoURL,
            uid,
          },
          type: 'mention',
          source: 'post',
          date: Date.now()
        });        
      };
    };

    // photo tags //
    for (let index = 0; index < tagIDs.length; index++) {
      if (tagIDs[index] !== uid) {
        const notificationID = uuidv4();
        await setDoc(doc(db, 'notifications', notificationID), {
          notificationID,
          notRead: true,
          recipientUID: tagIDs[index],
          postID,
          postPhotoURL: w150URL,
          comment: photoUploadText,
          profile: {
            fullname,
            username,
            photoURL,
            uid,
          },
          type: 'photo-tag',
          source: 'post',
          date: Date.now()
        });        
      };
    };

    await setDoc(doc(db, 'photoUploads', photoID), photoURLS);
    await setDoc(doc(db, 'postUploads', postID), {
      postID: postID,
      photos: [photoID],
      postCaption: photoUploadText,
      comments: [],
      likes: [],
      saved: [],
      tags: tagIDs,
      hashTags,
      uid: userData.uid,
      username: userData.displayName,
      photoURL: userData.photoURL,
      uploadDate: Date.now(),
    });
    console.log('photo uploaded', w1080URL);
  }

  const hashTagHandler = (text) => {
    const textArray = text.split(' ');
    const hashTags = [];
    textArray.forEach((word) => {
      if (word[0] === '#') {
        hashTags.push(word.slice(1));
      };
    });
    return hashTags;
  };

  const profileTagHandler = async (text) => {
    const textArray = text.split(' ');
    const usernames = [];
    textArray.forEach((word) => {
      if (word[0] === '@') {
        usernames.push(word);
      };
    });
    const UIDs = [];
    for (let index = 0; index < usernames.length; index++) {
      const username = usernames[index].slice(1);
      const profileQuery = query(collection(db, 'users'), where('username', '==', username));
      const profileSnapshot = await getDocs(profileQuery);
      profileSnapshot.forEach((document) => {
        console.log(document.data());
        const {
          uid,
        } = document.data();
        UIDs.push(uid);        
      })
    };
    console.log(UIDs)
    return UIDs;
  };

  const resizePhoto = async () => {
    setIsResizing(true);
    const image = new Image();
    image.src = mobilePhotoUpload;
    return new Promise((resolve) => {
      let resizedPhotos = {
        photoID: uuidv4(),
        aspectRatio: croppedAspectRatio
      };
      image.onload = async () => {
        const w1080 = await canvasCropFilterResize(image, 1080, 'hide');
        resizedPhotos = {...resizedPhotos, w1080: w1080};
        const w750 = await canvasCropFilterResize(image, 750, 'hide');
        resizedPhotos = {...resizedPhotos, w750: w750};
        const w640 = await canvasCropFilterResize(image, 640, 'hide');
        resizedPhotos = {...resizedPhotos, w640: w640};
        const w480 = await canvasCropFilterResize(image, 480, 'hide');
        resizedPhotos = {...resizedPhotos, w480: w480};
        const w320 = await canvasCropFilterResize(image, 320, 'hide');
        resizedPhotos = {...resizedPhotos, w320: w320};
        const w240 = await canvasCropFilterResize(image, 240, 'hide');
        resizedPhotos = {...resizedPhotos, w240: w240};
        const w150 = await canvasCropFilterResize(image, 150, 'hide');
        resizedPhotos = {...resizedPhotos, w150: w150};
        console.log(resizedPhotos);
        resolve({
          ...resizedPhotos
        })
        setIsResizing(false);
      }
    })
  }
 
  function canvasCropFilterResize(img, width, result) {
    return new Promise((resolve) => {
      let canvas;
      if (result === 'display') {
        canvas = canvasRef.current;
      } else if (result === 'hide') {
        canvas = uploadCanvasRef.current;
      }

      const ctx = canvas.getContext("2d");
      const aspectRatioUpperBoundery = width / (1080/565);
      const aspectRatioLowerBoundery = width / (1080/1350);
      
      canvas.width = width;
      if (imageFitHeight) {
        canvas.height = canvas.width;
      }
      if (!imageFitHeight && !imageFlipped && (aspectRatio > 1)) {
        const height = canvas.width * flippedAspectRatio;
        if (height < aspectRatioUpperBoundery) {
          canvas.height = aspectRatioUpperBoundery;
        } else {
          canvas.height = height;        
        }
        
      }
      if (!imageFitHeight && !imageFlipped && (aspectRatio < 1)) {
        const height = canvas.width * flippedAspectRatio;
        if (height > aspectRatioLowerBoundery) {
          canvas.height = aspectRatioLowerBoundery;
        } else {
          canvas.height = height;        
        }
      }
      if (!imageFitHeight && imageFlipped && (aspectRatio > 1)) {
        const height = canvas.width * aspectRatio;
        if (height > aspectRatioLowerBoundery) {
          canvas.height = aspectRatioLowerBoundery;
        } else {
          canvas.height = height;     
        };
      };
      if (!imageFitHeight && imageFlipped && (aspectRatio < 1)) {
        const height = canvas.width * aspectRatio;
        if (height < aspectRatioUpperBoundery) {
          canvas.height = aspectRatioUpperBoundery;
        } else {
          canvas.height = height;
        };
      };
      setCroppedAspectRatio(canvas.width / canvas.height);

      ctx.globalCompositeOperation = 'destination-under';
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ratio = img.width / img.height;
      let newWidth = canvas.width;
      let newHeight = newWidth / ratio;
      if (!imageFitHeight && imageFlipped && (aspectRatio < 1)) {
        newHeight = canvas.width;
        newWidth = canvas.width * ratio;    
      }
      if (newHeight < canvas.height) {
        if (imageFlipped && (aspectRatio > 1)) {
          newHeight = canvas.width;
          newWidth = canvas.width * ratio;    
        }    
        if (!imageFlipped) {
          newHeight = canvas.height;
          newWidth = newHeight * ratio;        
        }
      }

      let xOffset;
      let yOffset;
      if (imageFitHeight) {
        xOffset = (newHeight * (pointerX / 100));
        yOffset = (newWidth * (pointerY / 100));   
      }   
      if (!imageFitHeight && (aspectRatio > 1)) {
        xOffset = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
        yOffset = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;
      }
      if (!imageFitHeight && (aspectRatio < 1)) {
        xOffset = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
        yOffset = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;
      }
      if (!imageFitHeight && imageFlipped && (aspectRatio > 1)) {
        xOffset = (canvas.height - newWidth) / 2;
        yOffset = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;
      }
      if (!imageFitHeight && imageFlipped && (aspectRatio < 1)) {
        xOffset = (canvas.height - newWidth) / 2;
        yOffset = newHeight > canvas.width ? (canvas.height - newHeight) / 2 : 0;
      }
      switch (true) {
        case imageOrientation === 'vertical-up':
          if (!imageFitHeight) {
            ctx.translate(0, canvas.height);
          } else {
            ctx.translate(0, canvas.width);
          };
          break;
        case imageOrientation === 'horizontal-down':
          if (!imageFitHeight) {
            if (newWidth > canvas.width) {
              ctx.translate(newWidth - (newWidth - canvas.width), newHeight);
            } else if (newHeight > canvas.height) {
              ctx.translate(newWidth, newHeight - (newHeight - canvas.height))
            } else {
              ctx.translate(newWidth, newHeight);
            };
          };
          if (imageFitHeight) {
            ctx.translate(canvas.height, canvas.width);
          }
          break;
        case imageOrientation === 'vertical-down':
          if (!imageFitHeight) {
            ctx.translate(canvas.width, 0);
          } else {
            ctx.translate(canvas.height, 0);
          }
          break;
        default: 
      }
      switch (true) {
        case selectedFilter === 'moon':
          ctx.filter = 'grayscale(100%) brightness(125%)';
          break;
        case selectedFilter === 'clarendon':
          ctx.filter = 'saturate(130%) brightness(115%) contrast(120%) hue-rotate(5deg)';
          break;
        case selectedFilter === 'gingham':
          ctx.filter = 'contrast(75%) saturate(90%) brightness(115%)'
          break;
        case selectedFilter === 'lark':
          ctx.filter = 'saturate(115%) brightness(110%) hue-rotate(5deg)';
          break;
        case selectedFilter === 'reyes':
          ctx.filter = 'contrast(50%) saturate(75%) brightness(125%) hue-rotate(355deg)';
          break;
        case selectedFilter === 'juno':
          ctx.filter = 'contrast(90%) hue-rotate(10deg) brightness(110%)';
          break;
        case selectedFilter === 'slumber':
          ctx.filter = 'brightness(80%) hue-rotate(350deg) saturate(125%)';
          break;
        case selectedFilter === 'crema':
          ctx.filter = 'brightness(85%) hue-rotate(5deg) saturate(90%)';
          break;
        case selectedFilter === 'ludwig':
          ctx.filter = 'hue-rotate(355deg) saturate(125%)';
          break;
        case selectedFilter === 'aden':
          ctx.filter = 'sepia(50%) saturate(150%)';
          break;
        case selectedFilter === 'perpetua':
          ctx.filter = 'brightness(80%) saturate(130%)';
          break;
        default: 
      }

      ctx.rotate(imageDegrees * Math.PI / 180);
      ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        const image = new Image();
        image.src = blob;
        resolve(blob);
      });      
    })
  }

  const filterToggle = (event) => {
    const { id } = event.target;
    setSelectedFilter(id);
  }

  const mobilePhotoUploadHandler = (event) => {
    const file = event.target.files[0];
    if (file) {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        console.log(image.naturalWidth/ image.naturalHeight);
        setAspectRatio(image.naturalWidth/ image.naturalHeight);
        setFlippedAspectRatio(image.naturalHeight / image.naturalWidth);
      }
      setMobilePhotoUpload(image.src);
      setPhotoUploadOpen(true);
    }
  }

  const toggleTopNavigation = (boolean) => {
    setHideTopNavigation(boolean)
  }

  const showNotification = (text) => {
    setNotificationText(text);
    setDisplayNotification(true);
    setTimeout(() => {
      setDisplayNotification(false)
    }, 4000);
  };

  const clearNotificationText = () => {
    if (!displayNotification) {
      setNotificationText('');      
    }
  }

  const profilePhotoModalToggle = () => {
    profilePhotoModal
      ? setProfilePhotoModal(false)
      : setProfilePhotoModal(true);
  };
  
  const removeProfilePhoto = async () => {
    profilePhotoModalToggle()
    setIsProfilePhotoUploading(true);
    await deleteObject(profileImageRef);
    await updateProfile(auth.currentUser, {
      photoURL: ''
    });
    await setDoc(doc(db, 'users', userData.uid), {photoURL: ''}, {merge: true});
    setUserData({...userData, photoURL: ''});
    setProfileData({...profileData, photoURL: ''});
    showNotification('Profile photo removed.')
    setIsProfilePhotoUploading(false);
  }

  useEffect(() => {
    if (profileUpload !== '') {
      if (profilePhotoModal === true) {
        setProfilePhotoModal(false);
      };
    resizeImage();      
    };
  },[profileUpload]);

  const uploadPhoto = async (blob) => {
    setIsProfilePhotoUploading(true);
    const photoUpload = await uploadBytes(profileImageRef, blob);
    const photoURL = await getDownloadURL(ref(storage, photoUpload.metadata.fullPath))
    setProfileUpload('');
    console.log(photoUpload);
    await setDoc(doc(db, 'users', userData.uid), {photoURL: photoURL}, {merge: true});
    setUserData({...userData, photoURL: photoURL});
    setProfileData({...profileData, photoURL: photoURL});
    showNotification('Profile photo added.')
    setIsProfilePhotoUploading(false);
  }

  const uploadHandler = (event) => {
    const {files} = event.target;
    setProfileUpload(files[0]);
  }

  const uploadClick = (event) => {
    event.target.value = null;
  }

  const resizeImage = () => {
    const reader = new FileReader();
    const img = new Image();
    img.crossOrigin = "anonymous";
    reader.onload = () => {
      img.onload = function() {
        canvas_scale(img)
      }; 
      img.src = reader.result;      
    };
    reader.readAsDataURL(profileUpload);
  }

  function canvas_scale(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");

    canvas.width = 150;
    canvas.height = 150;

    ctx.globalCompositeOperation = 'destination-under';
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ratio = img.width / img.height;
    let newWidth = canvas.width;
    let newHeight = newWidth / ratio;
    if (newHeight < canvas.height) {
      newHeight = canvas.height;
      newWidth = newHeight * ratio;
    }
    const xOffset = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
    const yOffset = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;
    ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);

    canvas.toBlob((blob) => {
      const image = new Image();
      image.src = blob;
      uploadPhoto(blob);
    });
  }

  // SITE WIDE //

  const monitorAuthState = async () => {
    onAuthStateChanged(auth, user => {
      if (user) {
        console.log(user);
        setUserLoggedIn(true);
        setAuthLoading(false);
        getUserProfileDoc(user);
      }
      else {
        setUserLoggedIn(false);
        setAuthLoading(false);
      }
    });
  };

  const getUserProfileDoc = async (user) => {
    const { uid } = user;
    const profileDataRef = doc(db, 'users', uid);
    const profileDataSnap = await getDoc(profileDataRef);
    if (profileDataSnap.exists()) {
      console.log('success!');
      setUserData({...user,...profileDataSnap.data()});
      console.log(profileDataSnap.data());
    }
  }

  useEffect(() => {
    console.log(userData);
  },[userData]);

  useEffect(() => {
    monitorAuthState();
  }, []);

  const checkForMobile = () => {
    if (/Mobi|Andriod/i.test(navigator.userAgent)) {
      setIsMobile(true);
      console.log('isMobile');
    }
  }

  const getPhotoURLs = async (document) => {
    const { postID } = document;
    const photoArray = [document];
    const profilePhotoData = query(collection(db, 'photoUploads'), 
      where('postID', '==', postID), orderBy('index'));
    const profileImageDataSnap = await getDocs(profilePhotoData);
    profileImageDataSnap.forEach((doc) => {
      photoArray.push(doc.data());
    });
    return photoArray
  }

  useEffect(() => {
    console.log(photosArray);
  }, [photosArray]);

  const getUserProfileData = async (username, page) => {
    console.log('current user:', userData.uid);
    const displayNameRef = doc(db, 'displayNames', username);
    const docSnap = await getDoc(displayNameRef);
    if (docSnap.exists()) {
      const { uid } = docSnap.data();
      let taggedArray = [];
      let savedArray = [];

      const profileDataRef = doc(db, 'users', uid);
      const profileDataSnap = await getDoc(profileDataRef);
      if (profileDataSnap.exists()) {
        setProfileData(profileDataSnap.data());
        console.log("page:", page);
        if (page === 'feed' || page === 'tagged' || page === undefined) {
          setProfileExists(true);
        } else if (page === 'saved' && uid === userData.uid){
          setProfileExists(true);
        } else {
          setProfileExists(false);
        }
        if (uid === userData.uid) {
          setCurrentUsersPage(true);
        } else {
          setCurrentUsersPage(false);
        };

      } else {
        console.log('no profile data document')
      }      

      await getProfilePosts(uid);

      const taggedImageData = query(collection(db, 'postUploads'),
        where('tags', 'array-contains', uid), orderBy('uploadDate', 'desc'));
      const taggedImageDataSnap = await getDocs(taggedImageData);
      taggedImageDataSnap.forEach((doc) => {
        taggedArray.push(getPhotoURLs(doc.data()));
      });
      Promise.all(taggedArray).then((values) => {
        console.log(values);
        setProfileTaggedPosts(values);
      })

      const savedPostsData = query(collection(db, 'postUploads'),
        where('saved', 'array-contains', uid), orderBy('uploadDate', 'desc'));
      const savedPostsDataSnap = await getDocs(savedPostsData);
      savedPostsDataSnap.forEach((doc) => {
        console.log('HELLO!');
        savedArray.push(getPhotoURLs(doc.data()));
      });
      Promise.all(savedArray).then((values) => {
        setProfileSavedPosts(values);
        console.log(values);
      })
    } else {
      console.log('no displayName document');
      setProfileExists(false);
      setDataLoading(false);
    }
  };

  const getProfilePosts = async (uid) => {
    let imageArray = [];
    let urlArray = [];
    const profileImageData = query(collection(db, 'postUploads'), 
      where('uid', '==', uid), 
      orderBy('uploadDate', 'desc'), 
      limit(12));
    const profileImageDataSnap = await getDocs(profileImageData);
    profileImageDataSnap.forEach((doc) => {
      imageArray.push(doc.data());
      let newPost = getPhotoURLs(doc.data());
      urlArray.push(newPost);
    });
    console.log(urlArray);
    Promise.all(urlArray).then((values) => {
      console.log(values);
      setProfilePosts(values);
      setIsLoadingPage(false);
      setDataLoading(false);
    })
    const lastVisableDocument = profileImageDataSnap.docs[profileImageDataSnap.docs.length-1]
    setLastProfilePostDocument(lastVisableDocument);
    setProfileImages(imageArray);
    console.log(imageArray);
  }

  const getNextProfilePosts = async () => {
    const {
      uid
    } = profileDataReference.current;
    let imageArray = [];
    let urlArray = [];
    const nextQuery = query(collection(db, 'postUploads'),
      where('uid', '==', uid),
      orderBy('uploadDate', 'desc'),
      startAfter(lastProfilePostDocumentReference.current),
      limit(12));
    const nextSnapshot = await getDocs(nextQuery);
    nextSnapshot.forEach((doc) => {
      imageArray.push(doc.data());
      let newPost = getPhotoURLs(doc.data());
      urlArray.push(newPost);
    });

    console.log(urlArray);
    Promise.all(urlArray).then((values) => {
      setProfilePosts([...profilePostsReference.current, ...values]);
      setIsLoadingPage(false);
      setDataLoading(false);
    })
    const lastVisableDocument = nextSnapshot.docs[nextSnapshot.docs.length-1]
    setLastProfilePostDocument(lastVisableDocument);
    nextPostsFired.current = false;
  };

  useEffect(() => {
    console.log('last document changed');
    console.log(lastProfilePostDocument)
  }, [lastProfilePostDocument])

  useEffect(() => {
    console.log(profilePosts);
  }, [profilePosts]);

  useEffect(() => {
    console.log(profileData);
  }, [profileData])

  useEffect(() => {
    checkForMobile();
  }, []);

  const unsendHandler = async () => {
    const {
      type,
      photoURLs,
      messageID,
    } = selectedMessage;
    if (type === 'photo') {
      const {
        photoID
      } = photoURLs;
      console.log(photoID);
      const w640Ref = ref(storage, `w640_photoUploads/${photoID}.jpg`);
      const w480Ref = ref(storage, `w480_photoUploads/${photoID}.jpg`);
      const w320Ref = ref(storage, `w320_photoUploads/${photoID}.jpg`);
      const w240Ref = ref(storage, `w240_photoUploads/${photoID}.jpg`);
      const w150Ref = ref(storage, `w150_photoUploads/${photoID}.jpg`);
      try {
        await deleteObject(w640Ref);
        await deleteObject(w480Ref);
        await deleteObject(w320Ref);
        await deleteObject(w240Ref);
        await deleteObject(w150Ref);
      } catch (error) {
        console.log(error);
      }
    }
    setIsMessageLinksOpen(false);
    await deleteDoc(doc(db, 'messages', messageID));
  }

  const copyHandler = () => {
    const {
      type,
      text,
      post,
    } = selectedMessage;
    let copyText;
    if (type === 'text') {
      copyText = text;
    } else if (type === 'post') {
      copyText = `https://${window.location.host}/p/${post[0].postID}`
    }
    navigator.clipboard.writeText(copyText)
      .then(() => {
        console.log('copy sucessful');
      }, (err) => {
        console.log('error: copy unsucessful');
      })
    setIsMessageLinksOpen(false);
  }
  
  return (
    <BrowserRouter>
      {isCommentDeleteOpen &&
        <DeleteCommentModal
          userData = {userData}
          setSelectedPost = {setSelectedPost}
          selectedPost = {selectedPost}
          selectedComment = {selectedComment}
          setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
        />
      }
      {isNewMessageOpen &&
        <NewMessageModal
          isMobile = {isMobile}
          setIsNewMessageOpen = {setIsNewMessageOpen}
          isSharePostOpen={isSharePostOpen}
          directMessages={directMessages}
          setIsInboxOpen={setIsInboxOpen}
          userData={userData}
          recipientSelection={recipientSelection}
          setRecipientSelection={setRecipientSelection}
          setSearchString={setSearchString}
          searchString = {searchString}
          searchResults = {searchResults}
        />
      }
      {isMessageLikesOpen && isMobile &&
        <MessageLikesMobile 
          userData = {userData}
          messages = {messages}
          setIsMessageLikesOpen = {setIsMessageLikesOpen}
          selectedMessageID = {selectedMessageID}
        />
      }
      {isMessageLikesOpen &&
        <MessageLikesModal
          userData = {userData}
          messages = {messages}
          setIsMessageLikesOpen = {setIsMessageLikesOpen}
          selectedMessageID = {selectedMessageID}
        />
      }
      {isAddPeopleOpen &&
        <AddPeopleModal
          isMobile = {isMobile}
          selectedDirectMessageID = {selectedDirectMessageID}
          setIsAddPeopleOpen = {setIsAddPeopleOpen}
          isModal={true}
          directMessages={directMessages}
          setIsInboxOpen={setIsInboxOpen}
          userData={userData}
          recipientSelection={recipientSelection}
          setRecipientSelection={setRecipientSelection}
          setSearchString={setSearchString}
          searchString = {searchString}
          searchResults = {searchResults}
        />
      }
      {isMemberModalOpen &&
        <DirectMessageMemberModal
          selectedDirectMessageID={selectedDirectMessageID}
          setIsMemberModalOpen={setIsMemberModalOpen}
          selectedMemberUID={selectedMemberUID}
          directMessages={directMessages}
          userData={userData}
        />
      }
      {isDeleteChatOpen &&
        <DeleteChatModal
          directMessages = {directMessages}
          setIsMessageDetailsOpen={setIsMessageDetailsOpen}
          userData={userData}
          setIsDeleteChatOpen={setIsDeleteChatOpen}
          selectedDirectMessageID={selectedDirectMessageID}
        />
      }
      {isMessageLinksOpen &&
        <MessageLinksModal
          copyHandler = {copyHandler}
          unsendHandler = {unsendHandler}
          userData={userData}
          selectedMessage={selectedMessage}
          setIsMessageLinksOpen={setIsMessageLinksOpen}
        />
      }
      {isSharePostOpen &&
        <SharePostModal
          isMobile = {isMobile}
          isSharePostOpen={isSharePostOpen}
          showNotification={showNotification}
          postToSend = {postToSend}
          directMessages={directMessages}
          setIsSharePostOpen={setIsSharePostOpen}
          setIsInboxOpen={setIsInboxOpen}
          userData={userData}
          recipientSelection={recipientSelection}
          setRecipientSelection={setRecipientSelection}
          setSearchString={setSearchString}
          searchString = {searchString}
          searchResults = {searchResults}
        />
      }
      {isSharePostOpen && isMobile && 
        <MobileShareModal
          isMobile = {isMobile}
          isSharePostOpen={isSharePostOpen}
          showNotification={showNotification}
          postToSend = {postToSend}
          directMessages={directMessages}
          setIsSharePostOpen={setIsSharePostOpen}
          setIsInboxOpen={setIsInboxOpen}
          userData={userData}
          recipientSelection={recipientSelection}
          setRecipientSelection={setRecipientSelection}
          setSearchString={setSearchString}
          searchString = {searchString}
          searchResults = {searchResults}
        />
      }
      {isResizing &&
        <canvas className='upload-canvas' ref={uploadCanvasRef}>
        </canvas>
      }
      {!isMobile && isMouseHovering && profileModalPosts !== null &&
        <ProfileModal
          setIsLoadingPage={setIsLoadingPage}
          getUserProfileData={getUserProfileData}
          timerRef={timerRef}
          setProfileModalTimeoutID={setProfileModalTimeoutID}
          profileModalTimeoutID={profileModalTimeoutID}
          profileModalLocation={profileModalLocation}
          setIsMouseHovering={setIsMouseHovering}
          isMouseHovering={isMouseHovering}
          selectedListProfile={selectedListProfile}
          userData={userData}
          isFollowLoading={isFollowLoading}
          followHandler={followHandler}
          unfollowModalHandler={unfollowModalHandler}
          profileModalData={profileModalData}
          profileModalPosts={profileModalPosts}
          setProfileModalData={setProfileModalData}
          setProfileModalPosts={setProfileModalPosts}
        />
      }
      {isLikedByModalOpen &&
        <LikedByModal
          setCommentIDs={setCommentIDs}
          commentIDs={commentIDs}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          selectedListProfile={selectedListProfile}
          setIsLikedByModalOpen={setIsLikedByModalOpen}
          unfollowModalHandler={unfollowModalHandler}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          userData={userData} 
          selectedPost={selectedPost}
        />
      }
      {isUnfollowModalOpen &&
        <UnfollowModal
          setIsMouseHovering={setIsMouseHovering}
          timerRef={timerRef}
          followHandler={followHandler} 
          profileData={profileData}
          unfollowModalHandler={unfollowModalHandler}
          selectedListProfile={selectedListProfile}
        />
      }
      {isPostLinksOpen &&
        <PostLinksModal
          isLocationPost={isLocationPost}
          userData={userData}
          deletePost={deletePost}
          setSelectedPost={setSelectedPost}
          selectedPost={selectedPost}
          setIsPostLinksOpen={setIsPostLinksOpen} 
        />
      }
      {photoUploadModalOpen &&
        <UploadPhotoModal
          profileTagHandler = {profileTagHandler}
          hashTagHandler = {hashTagHandler}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          tagData={tagData}
          setTagData={setTagData}
          searchString={searchString}
          setSearchString={setSearchString}
          userData={userData}
          setCurrentPath={setCurrentPath}
          setPhotoUploadModalOpen={setPhotoUploadModalOpen} 
        />
      }
      <section className="entire-wrapper">
        {(authLoading || dataLoading) &&
          <div className='loading-placeholder'>
            <svg width="50" height="50" viewBox="0 0 50 50" className='loading-placeholder-svg' fill='#c7c7c7'>
              <path d="M25 1c-6.52 0-7.34.03-9.9.14-2.55.12-4.3.53-5.82 1.12a11.76 11.76 0 0 0-4.25 2.77 11.76 11.76 0 0 0-2.77 4.25c-.6 1.52-1 3.27-1.12 5.82C1.03 17.66 1 18.48 1 25c0 6.5.03 7.33.14 9.88.12 2.56.53 4.3 1.12 5.83a11.76 11.76 0 0 0 2.77 4.25 11.76 11.76 0 0 0 4.25 2.77c1.52.59 3.27 1 5.82 1.11 2.56.12 3.38.14 9.9.14 6.5 0 7.33-.02 9.88-.14 2.56-.12 4.3-.52 5.83-1.11a11.76 11.76 0 0 0 4.25-2.77 11.76 11.76 0 0 0 2.77-4.25c.59-1.53 1-3.27 1.11-5.83.12-2.55.14-3.37.14-9.89 0-6.51-.02-7.33-.14-9.89-.12-2.55-.52-4.3-1.11-5.82a11.76 11.76 0 0 0-2.77-4.25 11.76 11.76 0 0 0-4.25-2.77c-1.53-.6-3.27-1-5.83-1.12A170.2 170.2 0 0 0 25 1zm0 4.32c6.4 0 7.16.03 9.69.14 2.34.11 3.6.5 4.45.83 1.12.43 1.92.95 2.76 1.8a7.43 7.43 0 0 1 1.8 2.75c.32.85.72 2.12.82 4.46.12 2.53.14 3.29.14 9.7 0 6.4-.02 7.16-.14 9.69-.1 2.34-.5 3.6-.82 4.45a7.43 7.43 0 0 1-1.8 2.76 7.43 7.43 0 0 1-2.76 1.8c-.84.32-2.11.72-4.45.82-2.53.12-3.3.14-9.7.14-6.4 0-7.16-.02-9.7-.14-2.33-.1-3.6-.5-4.45-.82a7.43 7.43 0 0 1-2.76-1.8 7.43 7.43 0 0 1-1.8-2.76c-.32-.84-.71-2.11-.82-4.45a166.5 166.5 0 0 1-.14-9.7c0-6.4.03-7.16.14-9.7.11-2.33.5-3.6.83-4.45a7.43 7.43 0 0 1 1.8-2.76 7.43 7.43 0 0 1 2.75-1.8c.85-.32 2.12-.71 4.46-.82 2.53-.11 3.29-.14 9.7-.14zm0 7.35a12.32 12.32 0 1 0 0 24.64 12.32 12.32 0 0 0 0-24.64zM25 33a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm15.68-20.8a2.88 2.88 0 1 0-5.76 0 2.88 2.88 0 0 0 5.76 0z"></path>
            </svg>
          </div>
        }
        {isLoadingPage &&
            <div className='share-post-loading-bar'></div>
        }

        {(userLoggedIn && !isMobile) &&
          <NavigationBar
            isActivityLoading = {isActivityLoading}
            getNotifications = {getNotifications}
            userNotifications = {userNotifications}
            setIsNotificationsNotRead = {setIsNotificationsNotRead}
            formatTimeShort = {formatTimeShort}
            dataLoading = {dataLoading}
            isLoadingPage = {isLoadingPage}
            isNotificationPopUpVisable = {isNotificationPopUpVisable}
            setIsNotificationPopUpVisable = {setIsNotificationPopUpVisable}
            notificationCount = {notificationCount}
            isNotificationsNotRead = {isNotificationsNotRead}
            deleteRecentHashTagSearch = {deleteRecentHashTagSearch}
            saveRecentHashTagSearch = {saveRecentHashTagSearch}
            isSearchHashTag = {isSearchHashTag}
            setIsSearchHashTag = {setIsSearchHashTag}
            notReadCount = {notReadCount}
            deleteRecentSearch={deleteRecentSearch}
            isNoMatch={isNoMatch}
            isSearching={isSearching}
            clearRecentSearch={clearRecentSearch}
            saveRecentSearch={saveRecentSearch}
            isSearchClicked={isSearchClicked}
            setIsSearchClicked={setIsSearchClicked}
            searchString={searchString}
            setIsMouseHovering={setIsMouseHovering}
            setSearchString={setSearchString}
            setSearchResults={setSearchResults} 
            searchResults={searchResults}
            selectedListProfile={selectedListProfile}
            followHandler={followHandler}
            isFollowLoading={isFollowLoading}
            unfollowModalHandler={unfollowModalHandler}
            currentPath={currentPath} 
            setCurrentPath={setCurrentPath}
            photoUploadModalOpen={photoUploadModalOpen}
            setPhotoUploadModalOpen={setPhotoUploadModalOpen}
            profilePhotoURL={profilePhotoURL} 
            userData={userData}
          />
            
        }
        {(userLoggedIn && isMobile && !photoUploadOpen) &&
          <MobileNavigationBars
            selectedPost = {selectedPost}
            setPostToSend = {setPostToSend}
            setIsSharePostOpen = {setIsSharePostOpen}
            dataLoading = {dataLoading}
            setIsNotificationPopUpVisable = {setIsNotificationPopUpVisable}
            isNotificationPopUpVisable = {isNotificationPopUpVisable}
            isNotificationsNotRead = {isNotificationsNotRead}
            setIsNotificationsNotRead = {setIsNotificationsNotRead}
            notificationCount = {notificationCount}
            setIsSearchHashTag = {setIsSearchHashTag}
            hashTagString = {hashTagString}
            notReadCount={notReadCount}
            setHideTopNavigation={setHideTopNavigation}
            setIsMessageDetailsOpen={setIsMessageDetailsOpen}
            profilePhotoTitle={profilePhotoTitle}
            messageTitle={messageTitle}
            selectedMessage={selectedMessage}
            directMessages={directMessages}
            recipientSelection={recipientSelection}
            isInboxOpen={isInboxOpen}
            setLocationBeforeUpload={setLocationBeforeUpload}
            searchString={searchString}
            setSearchResults={setSearchResults}
            setSearchString={setSearchString}
            setProfileNavigate={setProfileNavigate}
            profileNavigate={profileNavigate}
            isLoadingPage={isLoadingPage}
            setIsLoadingPage={setIsLoadingPage}
            profileUsername={profileUsername}
            profileExists={profileExists} 
            getUserProfileData={getUserProfileData}
            profileData={profileData}
            profileImages={profileImages}
            currentUsersPage={currentUsersPage}
            mobilePhotoUploadHandler={mobilePhotoUploadHandler} 
            toggleTopNavigation={toggleTopNavigation} 
            hideTopNavigation={hideTopNavigation}  
            profilePhotoURL={profilePhotoURL} 
            userData={userData}
          />
        }
        <Routes location={backgroundLocation}>
          {userLoggedIn === '' &&
            <React.Fragment>
              <Route path='/' element={<div></div>} />
              <Route path='/accounts/emailsignup' element={<div></div>} />            
            </React.Fragment>
          }
          {!userLoggedIn &&
            <React.Fragment>
              <Route path='/' element={<LogIn />} />
              <Route path='/accounts/emailsignup' element={
                <SignUp
                  setUserData={setUserData} 
                />
              } />
            </React.Fragment>
          }
          {userLoggedIn &&
            <React.Fragment>
              <Route path='/' element={
                <Homepage
                  postHeightArray = {postHeightArray}
                  setPostHeightArray = {setPostHeightArray}
                  pageYOffset = {pageYOffset}
                  setPageYOffset = {setPageYOffset}
                  indexInView = {indexInView}
                  setIndexInView = {setIndexInView}
                  dataLoading = {dataLoading}
                  isHomePageLoading = {isHomePageLoading}
                  profileTagHandler = {profileTagHandler}
                  setIsSharePostOpen={setIsSharePostOpen}
                  setPostToSend={setPostToSend}
                  searchResults={searchResults}
                  setSearchString={setSearchString}
                  stringToLinks={stringToLinks}
                  setIsLocationPost={setIsLocationPost}
                  setIsPostLinksOpen={setIsPostLinksOpen}
                  isPostLinksOpen={isPostLinksOpen}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  setIsMouseHovering={setIsMouseHovering}
                  selectedListProfile={selectedListProfile}
                  followHandler={followHandler}
                  isFollowLoading={isFollowLoading}
                  unfollowModalHandler={unfollowModalHandler}
                  getUserProfiles={getUserProfiles}
                  allUserProfiles={allUserProfiles}
                  getUserProfileData={getUserProfileData}
                  setBackgroundLocation={setBackgroundLocation}
                  setIsLikedByModalOpen={setIsLikedByModalOpen}
                  setSelectedPost={setSelectedPost}
                  setDataLoading={setDataLoading}
                  getFollowingPosts={getFollowingPosts}
                  likeUploadToggle={likeUploadToggle}
                  userData={userData}
                  setIsLoadingPage={setIsLoadingPage}
                  getPostData={getPostData}
                  isMobile={isMobile}
                  profileData={profileData} 
                  photosArray={photosArray}
                  setPhotosArray={setPhotosArray}
                />
              } />
              <Route path='/direct/inbox/' element={
                isMobile 
                  ? <Inbox
                      setDirectMessages = {setDirectMessages}
                      formatTimeShort={formatTimeShort}
                      userData={userData}
                      directMessages={directMessages}
                      setIsInboxOpen={setIsInboxOpen}
                    />
                  : <DesktopDirectMessages
                      setDirectMessages = {setDirectMessages}
                      isGettingDirectMessages = {isGettingDirectMessages}
                      isInbox = {true}
                      setIsNewMessageOpen = {setIsNewMessageOpen}
                      formatTimeShort={formatTimeShort}
                      userData={userData}
                      directMessages={directMessages}
                      setIsInboxOpen={setIsInboxOpen}
                    />
              } />
              <Route path='/direct/new/' element={
                <NewMessage
                  isMobile = {isMobile}
                  isSharePostOpen={isSharePostOpen}
                  directMessages={directMessages}
                  setIsInboxOpen={setIsInboxOpen}
                  userData={userData}
                  recipientSelection={recipientSelection}
                  setRecipientSelection={setRecipientSelection}
                  setSearchString={setSearchString}
                  searchString = {searchString}
                  searchResults = {searchResults}
                />
              } />
              <Route path='/direct/t/:messageID' element={
                isMobile
                  ? <DirectMessage
                      isMobile = {isMobile}
                      isMessageDetailsOpen = {isMessageDetailsOpen}
                      setIsAddPeopleOpen={setIsAddPeopleOpen}
                      setSelectedMemberUID={setSelectedMemberUID}
                      setIsMemberModalOpen={setIsMemberModalOpen}
                      messageTitle={messageTitle}
                      setMessageTitle={setMessageTitle}
                      setIsDeleteChatOpen={setIsDeleteChatOpen}
                      userData={userData}
                      setHideTopNavigation = {setHideTopNavigation}
                      directMessages={directMessages}
                      setIsMessageDetailsOpen={setIsMessageDetailsOpen}
                      selectedDirectMessageID={selectedDirectMessageID}
                      formatTimeShort = {formatTimeShort}
                      setMessages = {setMessages}
                      messages = {messages}                  
                      setSelectedMessageID = {setSelectedMessageID}
                      setIsMessageLikesOpen = {setIsMessageLikesOpen}
                      setSelectedDirectMessageID={setSelectedDirectMessageID}
                      setIsMessageLinksOpen={setIsMessageLinksOpen}
                      setProfilePhotoTitle={setProfilePhotoTitle}
                      setSelectedMessage={setSelectedMessage}
                      selectedMessage={selectedMessage}
                      setIsInboxOpen = {setIsInboxOpen }
                    />
                  : <DesktopDirectMessages
                      copyHandler = {copyHandler}
                      unsendHandler = {unsendHandler}
                      isMessageDetailsOpen = {isMessageDetailsOpen}
                      setIsAddPeopleOpen={setIsAddPeopleOpen}
                      setSelectedMemberUID={setSelectedMemberUID}
                      setIsMemberModalOpen={setIsMemberModalOpen}
                      messageTitle={messageTitle}
                      setMessageTitle={setMessageTitle}
                      setIsDeleteChatOpen={setIsDeleteChatOpen}
                      userData={userData}
                      setHideTopNavigation = {setHideTopNavigation}
                      directMessages={directMessages}
                      setIsMessageDetailsOpen={setIsMessageDetailsOpen}
                      selectedDirectMessageID={selectedDirectMessageID}
                      setDirectMessages = {setDirectMessages}
                      setIsNewMessageOpen = {setIsNewMessageOpen}
                      profilePhotoTitle = {profilePhotoTitle}
                      isInbox = {false}
                      formatTimeShort={formatTimeShort}
                      setIsInboxOpen={setIsInboxOpen}
                      setMessages = {setMessages}
                      messages = {messages}                  
                      setSelectedMessageID = {setSelectedMessageID}
                      setIsMessageLikesOpen = {setIsMessageLikesOpen}
                      setSelectedDirectMessageID={setSelectedDirectMessageID}
                      setIsMessageLinksOpen={setIsMessageLinksOpen}
                      setProfilePhotoTitle={setProfilePhotoTitle}
                      setSelectedMessage={setSelectedMessage}
                      selectedMessage={selectedMessage}
                    />
              } />
              <Route path='/explore/' element={
                <Explore 
                  setUserNotifications = {setUserNotifications}
                  getPhotoURLs = {getPhotoURLs}
                  isMobile = {isMobile}
                  getPostData = {getPostData}
                  setIsLoadingPage = {setIsLoadingPage}
                  setBackgroundLocation = {setBackgroundLocation}
                />
              }/>
              <Route path='/explore/tags/:hashTag' element={
                <HashTagPage
                  hashTagString = {hashTagString}
                  setHashTagString = {setHashTagString}
                  getPhotoURLs = {getPhotoURLs}
                  isMobile = {isMobile}
                  getPostData = {getPostData}
                  setIsLoadingPage = {setIsLoadingPage}
                  setBackgroundLocation = {setBackgroundLocation}
                />
              }/>
              <Route path='/explore/search' element={
                <SearchResults
                  deleteRecentHashTagSearch = {deleteRecentHashTagSearch}
                  saveRecentHashTagSearch = {saveRecentHashTagSearch}
                  isSearchHashTag = {isSearchHashTag}
                  deleteRecentSearch={deleteRecentSearch}
                  isNoMatch={isNoMatch}
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
              }/>
              <Route path='/accounts/activity' element={
                <NotificationPage 
                  selectedListProfile = {selectedListProfile}
                  followHandler = {followHandler}
                  unfollowModalHandler = {unfollowModalHandler}
                  isFollowLoading = {isFollowLoading}
                  userData = {userData}
                  getNotifications = {getNotifications}
                  userNotifications = {userNotifications}
                  setIsNotificationsNotRead = {setIsNotificationsNotRead}
                  setIsNotificationPopUpVisable = {setIsNotificationPopUpVisable}
                  formatTimeShort = {formatTimeShort}
                />
              }/>
              <Route path='/accounts/edit' element={
                <EditProfile
                  showNotification={showNotification} 
                  profilePhotoModal={profilePhotoModal} 
                  profilePhotoModalToggle={profilePhotoModalToggle} 
                  removeProfilePhoto={removeProfilePhoto} 
                  uploadHandler={uploadHandler} 
                  uploadClick={uploadClick} 
                  profilePhotoURL={profilePhotoURL} 
                  userData={userData}
                />
              } />
              <Route path='/create/style' element={
                <UploadPhotoMobile
                  locationBeforeUpload={locationBeforeUpload}
                  filterScrollLeft={filterScrollLeft}
                  setFilterScrollLeft={setFilterScrollLeft}
                  selectedFilter={selectedFilter}
                  pointerStart={pointerStart}
                  pointerX={pointerX}
                  pointerY={pointerY}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                  imageDegrees={imageDegrees}
                  originPointX={originPointX}
                  originPointY={originPointY}
                  imageFitHeight={imageFitHeight}
                  imageFlipped={imageFlipped}
                  canvasRef={canvasRef}
                  pointerTracker={pointerTracker}
                  imageLocationHandler={imageLocationHandler}
                  verticalImageHandler={verticalImageHandler}
                  centerImage={centerImage}
                  toggleImageFit={toggleImageFit}
                  verticalToggleFit={verticalToggleFit}
                  imageHandler={imageHandler}
                  imageLoad={imageLoad}
                  imageRotate={imageRotate}
                  resizeCropFilterImage={resizeCropFilterImage}
                  filterToggle={filterToggle}
                  setPhotoUploadOpen={setPhotoUploadOpen} 
                  flippedAspectRatio={flippedAspectRatio} 
                  aspectRatio={aspectRatio} 
                  mobilePhotoUpload={mobilePhotoUpload} 
                  setMobilePhotoUpload={setMobilePhotoUpload}
                />
              } />
              <Route path='/create/details' element={ 
                <UploadPhotoMobileDetails
                  isSearchHashTag = {isSearchHashTag}
                  setCaptionSearchString = {setCaptionSearchString}
                  setPhotoUploadText={setPhotoUploadText}
                  captionSearchString={captionSearchString}
                  setUserIndex={setUserIndex}
                  userIndex={userIndex}
                  locationBeforeUpload={locationBeforeUpload}
                  shareMobilePost={shareMobilePost}
                  tagData={tagData}
                  showNotification={showNotification}
                  photoUploadText={photoUploadText}
                  photoUploadTextHandler={photoUploadTextHandler}
                  resizeCropFilterImage={resizeCropFilterImage}
                  canvasRef={canvasRef}
                  setPhotoUploadOpen={setPhotoUploadOpen}
                  editedPhoto={editedPhoto}
                  thumbnailImage={thumbnailImage}
                  userData={userData}
                  profilePhotoURL={profilePhotoURL} 
                />
              } />
              <Route path='/create/tag/' element={
                <TagPeopleMobile
                  setIsSearchHashTag = {setIsSearchHashTag}
                  setTagIDs={setTagIDs}
                  tagIDs={tagIDs}
                  tagData={tagData}
                  setTagData={setTagData}
                  setSearchResults={setSearchResults}
                  searchResults={searchResults}
                  searchString={searchString}
                  setSearchString={setSearchString}
                  imageFitHeight={imageFitHeight}
                  imageFlipped={imageFlipped}
                  imageHeight={imageHeight}
                  imageWidth={imageWidth}
                  editedPhoto={editedPhoto}
                  aspectRatio={aspectRatio}
                />
              } />         
            </React.Fragment>
          }
          <Route path='/:username' element={
            <Profile
              dataLoading = {dataLoading}
              nextPostsFired = {nextPostsFired}
              getNextProfilePosts = {getNextProfilePosts}
              profileSavedPosts={profileSavedPosts}
              profileTaggedPosts={profileTaggedPosts}
              setIsPostLinksOpen={setIsPostLinksOpen}
              setIsSearchClicked={setIsSearchClicked}
              setSearchResults={setSearchResults}
              setSearchString={setSearchString}
              setProfileData={setProfileData}
              setSelectedPost={setSelectedPost}
              setBackgroundLocation={setBackgroundLocation}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
              followHandler={followHandler}
              likeUploadToggle={likeUploadToggle}
              setPhotosArray={setPhotosArray}
              setIsLoadingPage={setIsLoadingPage}
              getPostData={getPostData}
              photosArray={photosArray}
              profilePosts={profilePosts}
              setProfileUsername={setProfileUsername}
              isMobile={isMobile}
              setCurrentPath={setCurrentPath}
              setPhotoUploadModalOpen={setPhotoUploadModalOpen}
              isProfilePhotoUploading={isProfilePhotoUploading}
              setDataLoading={setDataLoading}
              getUserProfileData={getUserProfileData}
              profileExists={profileExists}
              setProfileExists={setProfileExists}
              currentUsersPage={currentUsersPage}
              profileData={profileData}
              profileImages={profileImages}
              toggleTopNavigation={toggleTopNavigation}
              profilePhotoModal={profilePhotoModal} 
              profilePhotoModalToggle={profilePhotoModalToggle} 
              removeProfilePhoto={removeProfilePhoto} 
              uploadHandler={uploadHandler} 
              uploadClick={uploadClick}  
              profilePhotoURL={profilePhotoURL} 
              userData={userData}
            />} 
          />
          <Route path='/:username/:page' element={
            <Profile
              dataLoading = {dataLoading}
              nextPostsFired = {nextPostsFired}
              getNextProfilePosts = {getNextProfilePosts}
              stringToLinks = {stringToLinks}
              profileSavedPosts={profileSavedPosts}
              profileTaggedPosts={profileTaggedPosts}
              setIsPostLinksOpen={setIsPostLinksOpen}
              setIsSearchClicked={setIsSearchClicked}
              setSearchResults={setSearchResults}
              setSearchString={setSearchString}
              setProfileData={setProfileData}
              setSelectedPost={setSelectedPost}
              setBackgroundLocation={setBackgroundLocation}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
              followHandler={followHandler}
              likeUploadToggle={likeUploadToggle}
              setPhotosArray={setPhotosArray}
              setIsLoadingPage={setIsLoadingPage}
              getPostData={getPostData}
              photosArray={photosArray}
              profilePosts={profilePosts}
              setProfileUsername={setProfileUsername}
              isMobile={isMobile}
              setCurrentPath={setCurrentPath}
              setPhotoUploadModalOpen={setPhotoUploadModalOpen}
              isProfilePhotoUploading={isProfilePhotoUploading}
              setDataLoading={setDataLoading}
              getUserProfileData={getUserProfileData}
              setProfileExists={setProfileExists}
              profileExists={profileExists}
              currentUsersPage={currentUsersPage}
              profileData={profileData}
              profileImages={profileImages}
              toggleTopNavigation={toggleTopNavigation}
              profilePhotoModal={profilePhotoModal} 
              profilePhotoModalToggle={profilePhotoModalToggle} 
              removeProfilePhoto={removeProfilePhoto} 
              uploadHandler={uploadHandler} 
              uploadClick={uploadClick} 
              profilePhotoURL={profilePhotoURL} 
              userData={userData}
            />} 
          />
          <Route path='/p/:postID' element={
            <MobilePhotoPost
              setIsSharePostOpen = {setIsSharePostOpen}
              setPostToSend = {setPostToSend}
              profileTagHandler = {profileTagHandler}
              setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
              setSelectedComment = {setSelectedComment}
              stringToLinks={stringToLinks}
              setCommentIDs={setCommentIDs}
              setIsLocationPost={setIsLocationPost}
              setIsPostLinksOpen={setIsPostLinksOpen}
              isPostLinksOpen={isPostLinksOpen}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              setIsMouseHovering={setIsMouseHovering}
              getUserProfileData={getUserProfileData}
              setBackgroundLocation={setBackgroundLocation}
              isMobile={isMobile}
              setIsLikedByModalOpen={setIsLikedByModalOpen}
              setSelectedPost={setSelectedPost}
              setDataLoading={setDataLoading}
              setPhotosArray={setPhotosArray}
              photosArray={photosArray}
              getFollowingPosts={getFollowingPosts}
              selectedPost={selectedPost}
              setIsLoadingPage={setIsLoadingPage}
              likeUploadToggle={likeUploadToggle}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
              allUserProfiles={allUserProfiles}
              selectedListProfile={selectedListProfile}
            />} 
          />
          <Route path='/p/:postID/comments' element={
            <MobileComments
              setSelectedComment = {setSelectedComment}
              isCommentDeleteOpen = {isCommentDeleteOpen}
              setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
              profileTagHandler = {profileTagHandler}
              stringToLinks={stringToLinks}
              getPostData={getPostData}
              isMobile={isMobile}
              setIsLoadingPage={setIsLoadingPage}
              userData={userData}
              setDataLoading={setDataLoading}
              selectedPost={selectedPost}
              setSelectedPost={setSelectedPost}
              setIsSearchHashTag = {setIsSearchHashTag}
            />}
          />
          <Route path='/p/:postID/liked_by' element={
            <LikedBy
              selectedListProfile={selectedListProfile}
              unfollowModalHandler={unfollowModalHandler}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              userData={userData} 
              selectedPost={selectedPost}
            />
          } />
          <Route path='/p/:postID/c/:commentID/liked_by' element={
            <LikedBy
              selectedListProfile={selectedListProfile}
              unfollowModalHandler={unfollowModalHandler}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              userData={userData} 
              selectedPost={selectedPost}
            />
          } />
          <Route path='/explore/people' element={
            <ExplorePeople
              getUserProfiles={getUserProfiles}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              selectedListProfile={selectedListProfile}
              allUserProfiles={allUserProfiles}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
            />
          } />
          <Route path='/:username/followers' element={
            <Followers 
              selectedListProfile={selectedListProfile}
              profileData={profileData}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
            />
          }/>
          <Route path='/:username/following' element={
            <Following 
              selectedListProfile={selectedListProfile}
              profileData={profileData}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
            />
          }/>
          <Route path='*' element={<div className="no-user-profile">
            <h2 className="no-user-header">Sorry, this page isn't availble.</h2>
            <div className="no-user-text">The link you followed may be broken, or the page may have been removed. <Link to='/'>Go Back to Instagram.</Link></div>
          </div>} />
        </Routes>
        {backgroundLocation !== null &&
        <Routes>
          <Route path='/p/:postID' element={
            <PhotoPostModal
              setIsSharePostOpen = {setIsSharePostOpen}
              setPostToSend = {setPostToSend}
              profileTagHandler = {profileTagHandler}
              setIsCommentDeleteOpen = {setIsCommentDeleteOpen}
              setSelectedComment = {setSelectedComment}
              stringToLinks={stringToLinks}
              setCommentIDs={setCommentIDs}
              setIsLocationPost={setIsLocationPost}
              setIsPostLinksOpen={setIsPostLinksOpen}
              isPostLinksOpen={isPostLinksOpen}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              backgroundLocation={backgroundLocation}
              setBackgroundLocation={setBackgroundLocation} 
              setIsMouseHovering={setIsMouseHovering}
              getUserProfileData={getUserProfileData}
              isMobile={isMobile}
              setIsLikedByModalOpen={setIsLikedByModalOpen}
              setSelectedPost={setSelectedPost}
              setDataLoading={setDataLoading}
              setPhotosArray={setPhotosArray}
              photosArray={photosArray}
              getFollowingPosts={getFollowingPosts}
              selectedPost={selectedPost}
              setIsLoadingPage={setIsLoadingPage}
              likeUploadToggle={likeUploadToggle}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
              allUserProfiles={allUserProfiles}
              selectedListProfile={selectedListProfile}
            />} 
          />
          <Route path='/:username/followers' element={
            <FollowersModal
              setBackgroundLocation={setBackgroundLocation}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              selectedListProfile={selectedListProfile}
              profileData={profileData}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
            />
          }/>
          <Route path='/:username/following' element={
            <FollowingModal
              setBackgroundLocation={setBackgroundLocation}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              selectedListProfile={selectedListProfile}
              profileData={profileData}
              userData={userData}
              followHandler={followHandler}
              isFollowLoading={isFollowLoading}
              unfollowModalHandler={unfollowModalHandler}
            />
          }/>
        </Routes>
        }
      </section>
      <div className='bottom-notification-bar'>
        <div 
          className={displayNotification ? ['notification-bar-content', 'slide-up'].join(' ') : ['notification-bar-content', 'slide-down'].join(' ')} 
          onTransitionEnd={clearNotificationText} 
        >
          {notificationText}          
        </div>
      </div>
    </BrowserRouter>
  );
}

export default RouterSwitch;
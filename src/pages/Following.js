import './Following.css'
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import PeopleList from '../components/PeopleList';

const Following = (props) => {
  const {
    selectedListProfile,
    unfollowModalHandler,
    followHandler,
    userData,
    profileData,
    isFollowLoading,
  } = props;
  const navigate = useNavigate();
  const params = useParams();
  
  useEffect(() => {
    if (profileData.length === 0) {
      navigate(`/${params.username}`)
    }
  },[])

  return (
    <main className='following-page'>
      <PeopleList
        selectedListProfile={selectedListProfile}
        allUserProfiles={profileData.following}
        userData={userData}
        followHandler={followHandler}
        isFollowLoading={isFollowLoading}
        unfollowModalHandler={unfollowModalHandler}
      /> 
    </main>
  );
};

export default Following;
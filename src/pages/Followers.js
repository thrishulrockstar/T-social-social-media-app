import './Followers.css';
import PeopleList from '../components/PeopleList';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Followers = (props) => {
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
    <main className='followers-page'>
      <PeopleList
        selectedListProfile={selectedListProfile}
        allUserProfiles={profileData.followers}
        userData={userData}
        followHandler={followHandler}
        isFollowLoading={isFollowLoading}
        unfollowModalHandler={unfollowModalHandler}
      /> 
    </main>
  );
};

export default Followers;
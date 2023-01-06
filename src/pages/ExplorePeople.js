import './ExplorePeople.css';
import PeopleList from '../components/PeopleList';
import { useEffect } from 'react';

const ExplorePeople = (props) => {
  const {
    getUserProfiles,
    onMouseEnter,
    onMouseLeave,
    selectedListProfile,
    allUserProfiles,
    userData,
    followHandler,
    isFollowLoading,
    unfollowModalHandler,
  } = props;

  useEffect(() => {
    getUserProfiles();
  },[userData])

  return (
    <main className='explore-people'>
      <div className='explore-people-content'>
        <h1 className='explore-people-header'>Suggested</h1>
        <PeopleList
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          selectedListProfile={selectedListProfile}
          allUserProfiles={allUserProfiles}
          userData={userData}
          followHandler={followHandler}
          isFollowLoading={isFollowLoading}
          unfollowModalHandler={unfollowModalHandler}
        />
      </div>
    </main>
  );
};

export default ExplorePeople;
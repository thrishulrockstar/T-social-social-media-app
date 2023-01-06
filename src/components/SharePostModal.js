import MobileShareModal from './MobileShareModal';
import './SharePostModal.css';

const SharePostModal = (props) => {
  const {
    isMobile,
    isSharePostOpen,
    showNotification,
    postToSend,
    directMessages,
    setIsSharePostOpen,
    setIsInboxOpen,
    userData,
    recipientSelection,
    setRecipientSelection,
    setSearchString,
    searchString,
    searchResults,
  } = props;

  return (
    <div className='modal'>
      <main className='share-post-content'>
        <MobileShareModal
          isMobile = {isMobile}
          isSharePostOpen = {isSharePostOpen}
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
      </main>
    </div>
  );
};

export default SharePostModal;
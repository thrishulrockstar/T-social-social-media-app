import './NewMessageModal.css';
import NewMessage from '../pages/NewMessage';

const NewMessageModal = (props) => {
  const {
    getAllDirectMessages,
    isMobile,
    setIsNewMessageOpen,
    isSharePostOpen,
    directMessages,
    userData,
    setIsInboxOpen,
    setRecipientSelection,
    recipientSelection,
    setSearchString,
    searchString,
    searchResults
  } = props;

  return (
    <div 
      className='modal'
      onClick={() => setIsNewMessageOpen(false)}
    >
      <main 
        className='new-message-modal-content'
        onClick={(event) => event.stopPropagation()}
      >
        <NewMessage
          getAllDirectMessages = {getAllDirectMessages}
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
      </main>
    </div>
  );
};

export default NewMessageModal;
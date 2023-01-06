import './DiscardPostModal.css';

const DiscardPhotoModal = (props) => {
  const {
    discardPhotoHandler,
    setDiscardPhotoModalOpen,
  } = props;

  const stopBubbles = (event) => {
    event.stopPropagation();
  }

  const cancelHandler = () => {
    setDiscardPhotoModalOpen(false);
  }

  const discardHandler = () => {
    setDiscardPhotoModalOpen(false);
    discardPhotoHandler();
  }

  return (
    <div className="discard-post-modal" onClick={cancelHandler}>
      <div className="discard-post-modal-content" onClick={stopBubbles}>
        <div className="discard-modal-content-wrapper">
          <div className="discard-post-modal-text">
            <h1 className="discard-modal-title-text">
              Discard photo?
            </h1>
            <div className="discard-modal-text">
              This will remove the photo from your post.
            </div>
          </div>
          <button className="discard-modal-button" onClick={discardHandler} >Discard</button>
          <button className="discard-modal-cancel-button" onClick={cancelHandler} >Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default DiscardPhotoModal
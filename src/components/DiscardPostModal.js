import './DiscardPostModal.css';

const DiscardPostModal = (props) => {
  const {
    discardPostHandler,
    setDiscardPostModalOpen,
  } = props;

  const stopBubbles = (event) => {
    event.stopPropagation();
  }

  const cancelHandler = () => {
    setDiscardPostModalOpen(false);
  }

  return (
    <div className="discard-post-modal" onClick={cancelHandler}>
      <div className="discard-post-modal-content" onClick={stopBubbles}>
        <div className="discard-modal-content-wrapper">
          <div className="discard-post-modal-text">
            <h1 className="discard-modal-title-text">
              Discard post?
            </h1>
            <div className="discard-modal-text">
              if you leave, your edits won't be saved.
            </div>
          </div>
          <button className="discard-modal-button" onClick={discardPostHandler} >Discard</button>
          <button className="discard-modal-cancel-button" onClick={cancelHandler} >Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default DiscardPostModal
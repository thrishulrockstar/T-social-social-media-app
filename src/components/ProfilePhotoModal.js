import "./ProfilePhotoModal.css"

const ProfilePhotoModal = (props) => {
  const { 
    profilePhotoModalToggle, 
    removeProfilePhoto, 
    uploadClick, 
    uploadHandler 
  } = props;

  const stopBubbles = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="profile-photo-modal" onClick={profilePhotoModalToggle}>
      <div className="profile-photo-content" onClick={stopBubbles}>
        <h3 className="profile-photo-title">
          Change Profile Photo
        </h3>
        <div className="profile-photo-buttons">
          <div className="upload-button">
            <label htmlFor="profile-upload-input" className="upload-button-label">
              Upload Photo
            </label>            
          </div>
          <button className="remove-button" onClick={removeProfilePhoto}>
            Remove Current Photo
          </button>
          <button className="cancel-button" onClick={profilePhotoModalToggle}>
            Cancel
          </button>
          <form>
            <input accept="image/jpeg,image/png" className="profile-upload-input" id='profile-upload-input' type="file" onClick={uploadClick} onChange={uploadHandler} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoModal;
import { EnlargedViewProps } from '../types/interfaces';

function EnlargedView({ enlargedImageIndex, mediaFiles, closeEnlargedView, goToPrevious, goToNext }: EnlargedViewProps) {
  if (enlargedImageIndex === null) return null;
  
  const currentFile = mediaFiles[enlargedImageIndex];
  
  // Rendu différent selon le type de média (image ou vidéo)
  const renderMedia = () => {
    if (currentFile.isVideo) {
      return (
        <video 
          src={`file://${currentFile.path}`}
          className="enlarged-item"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
        />
      );
    } else {
      return (
        <img 
          src={`file://${currentFile.path}`}
          alt={`Enlarged media ${enlargedImageIndex}`}
          className="enlarged-item"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }
  };

  return (
    <div className="enlarged-view-overlay" onClick={closeEnlargedView}>
      <div className="enlarged-view-container">
        {renderMedia()}
        
        {/* Boutons de navigation */}
        {enlargedImageIndex > 0 && (
          <button className="nav-button prev-button" onClick={goToPrevious}>
            <i className="fi fi-br-angle-left"></i>
          </button>
        )}
        
        {enlargedImageIndex < mediaFiles.length - 1 && (
          <button className="nav-button next-button" onClick={goToNext}>
            <i className="fi fi-br-angle-right"></i>
          </button>
        )}
        
        {/* Bouton de fermeture */}
        <button className="close-button" onClick={closeEnlargedView}>
          <i className="fi fi-br-cross"></i>
        </button>
      </div>
    </div>
  );
}

export default EnlargedView;
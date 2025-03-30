import { EnlargedViewProps } from '../types/interfaces';
import { useEffect } from 'react';

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

  // Ajouter un gestionnaire d'événements pour les touches fléchées
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious(event); // Exécuter goToPrevious si flèche gauche
      } else if (event.key === 'ArrowRight') {
        goToNext(event); // Exécuter goToNext si flèche droite
      } else if (event.key === 'Escape') {
        closeEnlargedView(); // Fermer la vue agrandie si Échap est pressé
      }
    };

    // Ajouter l'écouteur d'événements au document
    document.addEventListener('keydown', handleKeyDown);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPrevious, goToNext, closeEnlargedView]);

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
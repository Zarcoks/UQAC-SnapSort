import { useState } from 'react';

// Définition du type pour les props
interface ImagesViewerProps {
  files: string[];
}

function ImagesViewer({ files }: ImagesViewerProps) {
  // État pour suivre le niveau de zoom (par défaut 200px)
  const [imageHeight, setImageHeight] = useState<number>(200);
  
  // État pour suivre l'image actuellement agrandie (null si aucune)
  const [enlargedImageIndex, setEnlargedImageIndex] = useState<number | null>(null);
  
  // Fonction pour augmenter la taille des images
  const zoomIn = () => {
    setImageHeight((prev: number) => Math.min(prev + 25, 300));
  };
  
  // Fonction pour diminuer la taille des images
  const zoomOut = () => {
    setImageHeight((prev: number) => Math.max(prev - 25, 75));
  };
  
  // Fonction pour ouvrir l'image en mode agrandi
  const openEnlargedView = (index: number) => {
    setEnlargedImageIndex(index);
  };
  
  // Fonction pour fermer l'image en mode agrandi
  const closeEnlargedView = () => {
    setEnlargedImageIndex(null);
  };
  
  // Navigation vers l'image précédente
  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la propagation qui fermerait la vue
    if (enlargedImageIndex !== null && enlargedImageIndex > 0) {
      setEnlargedImageIndex(enlargedImageIndex - 1);
    }
  };
  
  // Navigation vers l'image suivante
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la propagation qui fermerait la vue
    if (enlargedImageIndex !== null && enlargedImageIndex < files.length - 1) {
      setEnlargedImageIndex(enlargedImageIndex + 1);
    }
  };

  return (
    <div className="images-viewer">
      <div className="images-viewer-header">
        <p>zoom :</p>
        <span className="zoom-level">{imageHeight}px</span>
        <i className="fi fi-br-add" onClick={zoomIn}></i>
        <i className="fi fi-br-minus-circle" onClick={zoomOut}></i>
      </div>

      <div className="images-viewer-container">
        {files.map((file, index) => (
          <div className="images-viewer-item" key={index}>
            <img
              src={`file://${file}`}
              alt={`Media ${index}`}
              className="media-item"
              style={{ height: `${imageHeight}px` }}
              onClick={() => openEnlargedView(index)}
            />
          </div>
        ))}
      </div>
      
      {/* Overlay pour l'image agrandie */}
      {enlargedImageIndex !== null && (
        <div className="enlarged-view-overlay" onClick={closeEnlargedView}>
          <div className="enlarged-view-container">
            <img 
              src={`file://${files[enlargedImageIndex]}`} 
              alt={`Enlarged media ${enlargedImageIndex}`}
              className="enlarged-image"
              onClick={(e) => e.stopPropagation()} // Empêche la fermeture en cliquant sur l'image
            />
            
            {/* Boutons de navigation */}
            {enlargedImageIndex > 0 && (
              <button className="nav-button prev-button" onClick={goToPrevious}>
                <i className="fi fi-br-angle-left"></i>
              </button>
            )}
            
            {enlargedImageIndex < files.length - 1 && (
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
      )}
    </div>
  );
}

export default ImagesViewer;
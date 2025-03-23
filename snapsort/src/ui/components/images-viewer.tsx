import { useState } from 'react';

// Définition du type pour les props
interface ImagesViewerProps {
    files: string[];
  }

function ImagesViewer({ files }: ImagesViewerProps) {

    // État pour suivre le niveau de zoom (par défaut 200px)
  const [imageHeight, setImageHeight] = useState<number>(200);
  
  // Fonction pour augmenter la taille des images
  const zoomIn = () => {
    // Augmenter par incréments de 50px jusqu'à une limite de 400px
    setImageHeight((prev: number) => Math.min(prev + 25, 300));
  };
  
  // Fonction pour diminuer la taille des images
  const zoomOut = () => {
    // Diminuer par incréments de 50px jusqu'à une limite de 100px
    setImageHeight((prev: number) => Math.max(prev - 25, 75));
  };

    return (
        <div className="images-viewer">
            <div className="images-viewer-header">
                <p>zoom :</p>
                <span className="zoom-level">{imageHeight}%</span>
                <i className="fi fi-br-add" onClick={zoomIn}></i>
                <i className="fi fi-br-minus-circle" onClick={zoomOut}></i>
                
            </div>

            <div className="images-viewer-container">
                {files.map((file, index) => (
                    <div className="images-viewer-item">
                        <img
                            key={index}
                            src={`file://${file}`}
                            alt={`Media ${index}`}
                            className="media-item"
                            style={{ height: `${imageHeight}px` }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
  }
  
  export default ImagesViewer;
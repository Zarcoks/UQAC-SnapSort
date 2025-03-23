import React, { useEffect, useState } from "react";

function UnsortedImages() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    // Charger le chemin du dossier principal
    (window as any).electron.getSetting("directoryPath").then((path: string) => {
      
      if (path) {
        // Créer le chemin vers le sous-dossier "unsorted_images"
        const unsortedPath = `${path}${path.endsWith('/') || path.endsWith('\\') ? '' : '/'}unsorted_images`;
        
        // Charger les fichiers du sous-dossier
        (window as any).electron.getMediaFiles(unsortedPath).then((response: any) => {
          if (response.files) {
            setFiles(response.files);
          } else if (response.error) {
            console.error("Error loading media files:", response.error);
          }
        });
      }
    });
  }, []);

  return (
    <div className="unsorted-images">

        <div className="unsorted-images-header">
            <p></p>
        </div>
        
        <div className="unsorted-images-container">
            {files.map((file, index) => (
                <div className="unsorted-images-item">
                    <img key={index} src={`file://${file}`} alt={`Media ${index}`} className="media-item" />
                </div>
            ))}
        </div>

        <div className="unsorted-images-bottombar">
            <button>Trier</button>
        </div>
    </div>
  );
}

export default UnsortedImages;

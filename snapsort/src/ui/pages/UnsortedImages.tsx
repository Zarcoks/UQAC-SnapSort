import { useEffect, useState } from "react";
import '../styles/components.css';
import ImagesViewer from "../components/ImageViewer";
import { MediaFile } from "../types/interfaces";

function UnsortedImages() {
  const [files, setFiles] = useState<MediaFile[]>([]);

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

        <ImagesViewer mediaFiles={files} />

        <div className="unsorted-images-bottombar">
            <button>Trier (défaut)</button>
            <button>Trier (avancée)</button>
        </div>
    </div>
  );
}

export default UnsortedImages;

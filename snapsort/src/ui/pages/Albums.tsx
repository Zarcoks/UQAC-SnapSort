import ImagesViewer from "../components/ImageViewer";
import FolderTree from "../components/FolderTree";
import { MediaFile } from "../types/interfaces";
import { useEffect, useState } from "react";
import '../styles/components.css';

const Albums = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);

    // const handleDirectorySelect = async () => {
    //     const selectedPath = await (window as any).electron.selectDirectory();
    //     if (selectedPath) {
    //       setDirectoryPath(selectedPath);
    //       setChanged(true);
    //     }
    //   };

    useEffect(() => {
        // Charger le chemin du dossier principal
        (window as any).electron.getSetting("directoryPath").then((path: string) => {
          
            if (path) {
                handleGetMediaFiles(path); // Charger les fichiers du dossier principal s'il existe
            }
        });
    }, []);

    const handleGetMediaFiles = async (path: String) => {
        // Charger les fichiers du sous-dossier
        (window as any).electron.getMediaFiles(path).then((response: any) => {
            if (response.files) {
                setFiles(response.files);
            } else if (response.error) {
                console.error("Error loading media files:", response.error);
            }
        });
    }

    return (
        <div className="albums">
            <div className="arborescence">
                <FolderTree handleGetMediaFiles={handleGetMediaFiles}/>
            </div>
            <div className="albums-content">
                <ImagesViewer mediaFiles={files} />
            </div>
        </div>
    )
}

export default Albums
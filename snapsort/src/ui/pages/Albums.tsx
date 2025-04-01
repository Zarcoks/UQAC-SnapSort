import ImagesViewer from "../components/ImageViewer";
import FolderTree from "../components/FolderTree";
import { MediaFile } from "../types/types";
import { useEffect, useState, useRef } from "react";
import '../styles/components.css';

const Albums = () => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [leftWidth, setLeftWidth] = useState(250); // Largeur initiale en pixels
    const resizerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        // Charger le chemin du dossier principal
        (window as any).electron.getSetting("directoryPath").then((path: string) => {
            if (path) {
                handleGetMediaFiles(path); // Charger les fichiers du dossier principal s'il existe
            }
        });

        // Gestionnaires d'événements pour le redimensionnement
        const handleMouseDown = () => {
            isDraggingRef.current = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !containerRef.current) return;
            
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = e.clientX - containerRect.left;
            
            // Limiter la largeur minimale et maximale
            const minWidth = 100;
            const maxWidth = containerRect.width - 200;
            
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setLeftWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        const resizer = resizerRef.current;
        if (resizer) {
            resizer.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (resizer) {
                resizer.removeEventListener('mousedown', handleMouseDown);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        };
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
        <div className="albums" ref={containerRef}>
            <div className="arborescence" style={{ width: `${leftWidth}px` }}>
                <FolderTree handleGetMediaFiles={handleGetMediaFiles}/>
            </div>
            <div 
                className="resizer" 
                ref={resizerRef}
                title="Glisser pour redimensionner"
            />
            <div className="albums-content" style={{ width: `calc(100% - ${leftWidth}px - 5px)` }}>
                <ImagesViewer mediaFiles={files} />
            </div>
        </div>
    )
}

export default Albums
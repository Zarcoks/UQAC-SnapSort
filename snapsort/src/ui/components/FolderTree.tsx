
import { useState, useEffect } from "react";
import { Folder } from "../types/interfaces";
import '../styles/components.css';
import { FolderTreeProps } from "../types/interfaces";

const FolderTree = ({handleGetMediaFiles}:FolderTreeProps) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {

        (window as any).electron.getSetting("directoryPath").then((path: string) => {
      
            // Demander les dossiers racine
            (window as any).electron.getFolders(path as string) // Modifie avec ton chemin
                            .then((folders: Folder[]) => {
                                console.log("Dossiers récupérés :", folders); // Afficher les dossiers dans la console
                                setFolders(folders);
                            })
                            .catch((err: Error) => console.error("Erreur:", err));
        }
        // Charger les dossiers au démarrage
        );

    }, []);

    const toggleExpand = (path: string) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const renderTree = (nodes: Folder[]) => {
        return nodes.map((folder) => (
            <div className="items-item" key={folder.path}>
                <div className="items-elem" onClick={() => toggleExpand(folder.path)}>
                    {folder.children.length > 0 ? (
                        <div className="items-folder-icon"><span>{expanded[folder.path] ? "📂▼" : "📂▶"} </span></div>
                    ) : "📁 "}
                    <div className="items-folder-text" onClick={() => handleGetMediaFiles(folder.path)}>{folder.name}</div>
                </div>
                {expanded[folder.path] && <div className="items-child">{renderTree(folder.children)}</div>}
            </div>
        ));
    };

    return <div className="items">{renderTree(folders)}</div>;
};

export default FolderTree;

import { useEffect, useState } from "react";
import '../styles/components.css';
import ImagesViewer from "../components/ImageViewer";
import { MediaFile } from "../types/types";
import { Status } from "../types/types";

function UnsortedImages() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [status, SetStatus] = useState<Status>('no-loading');
  const [logs, setLogs] = useState<string[]>([]);

  const runPythonScript = async () => {
    SetStatus('loading');
    try {
      const output = await (window as any).electron.runPython();
      console.log(output);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const handleExtendLoading = () => {
    SetStatus('extended-loading');
  }

  const handleReduceLoading = () => {
    SetStatus('loading');
  }

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

    (window as any).electron.onPythonError((msg: any) => {
      console.error("Error:", msg);
    });

    (window as any).electron.onPythonFinished(() => {
      console.log("Python script finished");
    });
  }, []);

  useEffect(() => {
    // Écouter les événements du script Python
    const handleLog = (msg: string) => {
      setLogs(prevLogs => {
        const newLogs = [...prevLogs, msg];
        // Keep only the last 30 messages
        return newLogs.length > 30 ? newLogs.slice(newLogs.length - 30) : newLogs;
      });
    };

    (window as any).electron.onPythonLog(handleLog);
  }, [logs]);

  return (
    <div className="unsorted-images">

        {status === "no-loading" && (<ImagesViewer mediaFiles={files} />)}
        {status === "loading" && (<ImagesViewer mediaFiles={files} height={175.6}/>)}
        {status === "extended-loading" && (<ImagesViewer mediaFiles={files} height={504.4}/>)}

        {status === "loading" && (
          <div className="unsorted-images-loading-bar">
            <i onClick={handleExtendLoading} className="fi fi-rr-angle-double-small-up"></i>
            <div className="unsorted-images-loading-bar-progress">
              <progress value="10" max="100"></progress>
              <span>100 %</span>
            </div>
          </div>
        )}

        {status === "extended-loading" && (
          <div className="unsorted-images-loading-bar">
            <i onClick={handleReduceLoading} className="fi fi-rr-angle-double-small-down"></i>
            <p>Traitement des images en cours...</p>
            <div className="unsorted-images-loading-bar-progress">
              <progress value="10" max="100"></progress>
              <span>100 %</span>
            </div>
            <div className="unsorted-images-log-container">
              <div className="unsorted-images-log-content">
                {logs.map((log, index) => (
                  <div key={index}>log : {log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="unsorted-images-bottombar">
          <button onClick={runPythonScript}>Trie automatique</button>
          <button>Trie avancé (experimental)</button>
        </div>
    </div>
  );
}

export default UnsortedImages;

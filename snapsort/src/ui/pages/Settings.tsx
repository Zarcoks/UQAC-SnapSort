import { useEffect, useState } from "react";
import '../styles/components.css';

const Settings = () => {
  const [directoryPath, setDirectoryPath] = useState<string>("");
  const [nbrOfFilesLoaded, setNbrOfFilesLoaded] = useState<number>(10);
  const [changed, setChanged] = useState(false);

  // Charger les valeurs depuis Electron Store au démarrage
  useEffect(() => {
    (window as any).electron.getSetting("directoryPath").then(setDirectoryPath);
    (window as any).electron.getSetting("nbrOfFilesLoaded").then(setNbrOfFilesLoaded);
  }, []);

  const handleSave = () => {
    (window as any).electron.setSetting("directoryPath", directoryPath);
    (window as any).electron.setSetting("nbrOfFilesLoaded", nbrOfFilesLoaded);
    setChanged(false);
  };

  const handleDirectorySelect = async () => {
    const selectedPath = await (window as any).electron.selectDirectory();
    if (selectedPath) {
      setDirectoryPath(selectedPath);
      setChanged(true);
    }
  };

  return (
    <div className="settings-container">
      <div>
        <h2>Paramètres</h2>
      </div>
      

      <div className="setting-items">
        <div className="setting-item">
          <label>Nombre de fichiers chargés :</label>
          <input
            type="number"
            min="5"
            max="100"
            value={nbrOfFilesLoaded}
            onChange={(e) => {
              setNbrOfFilesLoaded(Number(e.target.value));
              setChanged(true);
            }}
          />
        </div>

        <div className="setting-item">
          <label>Répertoire :</label>
          <input type="text" value={directoryPath} readOnly />
          <button onClick={handleDirectorySelect}>Choisir un dossier</button>
        </div>
      </div>

      

      {changed && (
        <div className="settings-buttons">
          <button onClick={() => setChanged(false)}>Annuler</button>
          <button onClick={handleSave}>Sauvegarder</button>
        </div>
      )}
    </div>
  );
};

export default Settings;

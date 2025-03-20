import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [images, setImages] = useState([]);
  const [folderPath, setFolderPath] = useState('');
  const [pythonOutput, setPythonOutput] = useState<string>('');

  const openFolder = async () => {
      const result  = await (window as any).electron.openDirectory();
      if (result) {
        setFolderPath(result.folderPath);
        setImages(result.files);
      }
  };

  const runPythonScript = async () => {
    try {
      const output = await (window as any).electron.runPython();
      setPythonOutput(output);
    } catch (error) {
      setPythonOutput(`Error: ${error}`);
    }
  };

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <div>
      <button onClick={openFolder}>Ouvrir un dossier</button>
      {folderPath && <h2>Dossier sélectionné : {folderPath}</h2>}
      <div className="gallery">
        {images.map((image, index) => (
          <img
            key={index}
            src={`file://${folderPath}/${image}`}
            alt={image}
            style={{ width: '200px', margin: '10px' }}
          />
        ))}
      </div>
    </div>
    <div>
      <button onClick={runPythonScript}>Run Python Script</button>
      {pythonOutput && <p>Python Output: {pythonOutput}</p>}
    </div>
    </>
  )
}

export default App

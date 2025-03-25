// import logo from '../assets/logo_pro.png'; // Exemple de logo si nécessaire
import { useState, useEffect, useRef } from "react";
import QRCode from 'qrcode';

function Connexion() {
  const [wifiString, setWifiString] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");  // État pour stocker l'URL du QR Code
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleStartHotspot = async () => {
    const result = await (window as any).electron.startHotspot();
    
    if (result?.wifiString) {
      setWifiString(result.wifiString); // Stocke uniquement la string
      console.log("Hotspot activé: ", result.wifiString);
      generateQRCode(result.wifiString); // Génère le QR Code
    } else {
      setWifiString(result?.error || "Erreur lors de l'activation du hotspot");
    }
  };

  const generateQRCode = async (wifiString: string) => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(wifiString); // Génére l'image QR en base64
      setQrCode(qrCodeDataUrl); // Sauvegarde le QR Code dans l'état
    } catch (err) {
      console.error("Erreur lors de la génération du QR code: ", err);
    }
  };

  useEffect(() => {
    if (canvasRef.current && qrCode) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        const img = new Image();
        img.src = qrCode; // Lien de l'image en base64
        img.onload = () => {
          context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          context.drawImage(img, 0, 0); // Dessine l'image QR Code sur le canvas
        };
      }
    }
  }, [qrCode]);  // Re-générer l'image lorsque qrCode change

  return (
    <div className="connexion-page">
      <main className="main-content">
        <section className="access-point-section">
          <button onClick={handleStartHotspot} className="btn-access-point">
            Se mettre en point d'accès
          </button>
          <div className="access-info">
            <p>{wifiString}</p>
          </div>
        </section>

        <section className="qrcode-section">
          {qrCode && (
            <div>
              <h3>Scan QR Code to connect:</h3>
              <canvas ref={canvasRef} width={200} height={200} />
              {/* Affichage alternatif avec une balise <img> */}
              {/* <img src={qrCode} alt="QR Code" /> */}
            </div>
          )}
        </section>
        
        <section className="devices-section">
          <ul>
            <li>Appareil 1</li>
            <li>Appareil 2</li>
            <li>Appareil 3</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

  
  export default Connexion;
  
import { useState, useEffect, useRef } from "react";
import QRCode from 'qrcode';

interface TransferInfo {
  fileName: string;
  progress: number;
  receivedBytes: number;
  totalBytes: number;
  index?: number;
  total?: number;
}

interface ConnectedDevice {
  ip: string;
  mac: string;
  name: string;
}

function Connexion() {
  // États pour le hotspot et le QR code WiFi
  const [wifiString, setWifiString] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [phoneIp, setPhoneIp] = useState<string>("");
  
  // États pour le service de transfert
  const [isTransferServiceActive, setIsTransferServiceActive] = useState<boolean>(false);
  const [transferQrCode, setTransferQrCode] = useState<string>("");
  const [transferInfo, setTransferInfo] = useState<TransferInfo | null>(null);
  const [completedTransfers, setCompletedTransfers] = useState<string[]>([]);
  const [currentTransfer, setCurrentTransfer] = useState<TransferInfo | null>(null);
  const [serverIp, setServerIp] = useState<string>("");
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  
  // Référence pour le canvas du QR code
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fonction pour démarrer le hotspot
  const handleStartHotspot = async () => {
    const result = await (window as any).electron.startHotspot();
    
    if (result?.wifiString) {
      setWifiString(result.wifiString);
      console.log("Hotspot activé: ", result.wifiString);
      generateQRCode(result.wifiString);
    } else {
      setWifiString(result?.error || "Erreur lors de l'activation du hotspot");
    }
  };

  // Fonction pour générer le QR code WiFi
  const generateQRCode = async (wifiString: string) => {
    try {
      // Nettoyage du wifiString avant génération du QR Code
      const cleanedWifiString = wifiString.trim()
        .replace(/\r/g, "")  
        .replace(/\n/g, "") 
        .replace(/\s*;\s*/g, ";")  
        .replace(/\s+/g, " ");  

      // Génération du QR Code avec la string nettoyée
      const qrCodeDataUrl = await QRCode.toDataURL(cleanedWifiString, {
        errorCorrectionLevel: 'H',  
        width: 300,  
        margin: 1,  
        color: {
          dark: '#000000', 
          light: '#FFFFFF'  
        }
      });
      setQrCode(qrCodeDataUrl);

    } catch (error) {
      console.error("Erreur lors de la génération du QR Code:", error);
    }
  };

  // Fonction pour récupérer l'adresse IP du téléphone
  const fetchIpAddress = async () => {
    const result = await (window as any).electron.getIpAdress();
    setPhoneIp(result);
    console.log("Phone IP Address:", result);
  };

  // Fonction pour récupérer les appareils connectés
  const fetchConnectedDevices = async () => {
    try {
      const devices = await (window as any).electron.getConnectedDevices();
      setConnectedDevices(Array.isArray(devices) ? devices : []);
    } catch (error) {
      console.error("Erreur lors de la récupération des appareils connectés:", error);
    }
  };

  // Fonction pour démarrer le service de transfert d'images
  const startTransferService = async () => {
    try {
      // Démarrage du service
      const result = await (window as any).electron.startImageTransferService();
      
      if (result.error) {
        console.error("Erreur lors du démarrage du service:", result.error);
        return;
      }
      
      // Mise à jour des états avec les infos du service
      setIsTransferServiceActive(true);
      setServerIp(result.serverIp);
      
      // Génération du QR code pour le transfert
      const transferQrString = await (window as any).electron.generateTransferQRCode(
        result.wifiString, 
        result.serverIp
      );
      
      // Génération du QR code
      const qrCodeDataUrl = await QRCode.toDataURL(transferQrString, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 1,
      });
      
      setTransferQrCode(qrCodeDataUrl);
      console.log("Service de transfert démarré:", result);
      
    } catch (error) {
      console.error("Erreur lors du démarrage du service de transfert:", error);
    }
  };

  // Fonction pour arrêter le service de transfert
  const stopTransferService = async () => {
    try {
      const result = await (window as any).electron.stopImageTransferService();
      setIsTransferServiceActive(false);
      setTransferQrCode("");
      setCurrentTransfer(null);
      console.log("Service de transfert arrêté:", result);
    } catch (error) {
      console.error("Erreur lors de l'arrêt du service de transfert:", error);
    }
  };

  // Configurer les écouteurs d'événements au chargement
  useEffect(() => {
    // Vérifier l'état initial du service
    const checkServiceStatus = async () => {
      const status = await (window as any).electron.getTransferServiceStatus();
      setIsTransferServiceActive(status.active);
    };
    
    checkServiceStatus();
    
    // Configuration des gestionnaires d'événements
    const unsubscribeStart = (window as any).electron.on('transfer:start', (info: TransferInfo) => {
      console.log("Transfert démarré:", info);
      setCurrentTransfer({
        fileName: info.fileName,
        progress: 0,
        receivedBytes: 0,
        totalBytes: info.fileSize,
        index: info.index,
        total: info.total
      });
    });
    
    const unsubscribeProgress = (window as any).electron.on('transfer:progress', (info: TransferInfo) => {
      setCurrentTransfer(info);
    });
    
    const unsubscribeComplete = (window as any).electron.on('transfer:complete', (info: { fileName: string }) => {
      console.log("Transfert terminé:", info);
      setCompletedTransfers(prev => [...prev, info.fileName]);
      setCurrentTransfer(null);
    });
    
    const unsubscribeError = (window as any).electron.on('transfer:error', (info: { error: string }) => {
      console.error("Erreur de transfert:", info);
    });
    
    // Nettoyage des écouteurs à la destruction du composant
    return () => {
      unsubscribeStart();
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, []);

  // Récupérer les appareils connectés périodiquement
  useEffect(() => {
    if (isTransferServiceActive) {
      fetchConnectedDevices();
      const interval = setInterval(fetchConnectedDevices, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isTransferServiceActive]);

  // Formater la taille des fichiers
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="connexion-page p-4">
      <h2 className="text-2xl font-bold mb-6">Connexion et Transfert</h2>
      
      {/* Section Point d'accès */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Point d'Accès WiFi</h3>
        <button 
          onClick={handleStartHotspot} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Activer le point d'accès
        </button>
        
        {wifiString && (
          <div className="mt-4">
            <div className="bg-gray-100 p-3 rounded mb-4">
              <p className="font-mono text-sm">
                {wifiString.replace(/WIFI:/, "WiFi: ").replace(/;/g, "; ")}
              </p>
            </div>
            
            {qrCode && (
              <div className="flex flex-col items-center">
                <h4 className="text-lg font-medium mb-2">Scanner pour se connecter:</h4>
                <img src={qrCode} alt="QR Code WiFi" className="w-64 h-64" />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Section Service de Transfert */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Service de Transfert d'Images</h3>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <button 
            onClick={startTransferService} 
            disabled={isTransferServiceActive}
            className={`py-2 px-4 rounded font-medium ${isTransferServiceActive 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            Démarrer le service
          </button>
          
          <button 
            onClick={stopTransferService} 
            disabled={!isTransferServiceActive}
            className={`py-2 px-4 rounded font-medium ${!isTransferServiceActive 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            Arrêter le service
          </button>
          
          <button 
            onClick={fetchIpAddress} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Récupérer l'IP
          </button>
        </div>
        
        {serverIp && (
          <div className="bg-gray-100 p-3 rounded mb-4">
            <p><strong>Serveur IP:</strong> {serverIp}</p>
            <p><strong>Port:</strong> 8080</p>
            {phoneIp && <p><strong>Téléphone IP:</strong> {phoneIp}</p>}
          </div>
        )}
        
        {isTransferServiceActive && transferQrCode && (
          <div className="flex flex-col items-center mt-4">
            <h4 className="text-lg font-medium mb-2">Scanner pour configurer l'application mobile:</h4>
            <img src={transferQrCode} alt="QR Code Transfert" className="w-64 h-64" />
          </div>
        )}
      </div>
      
      {/* Section Progression du Transfert */}
      {isTransferServiceActive && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Progression du Transfert</h3>
          
          {currentTransfer ? (
            <div className="space-y-3">
              <p>
                <strong>Fichier en cours:</strong> {currentTransfer.fileName}
                {currentTransfer.index && currentTransfer.total && (
                  <span className="ml-2 text-gray-500">
                    ({currentTransfer.index}/{currentTransfer.total})
                  </span>
                )}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${Math.min(currentTransfer.progress * 100, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600">
                {formatFileSize(currentTransfer.receivedBytes)} / {formatFileSize(currentTransfer.totalBytes)} 
                ({(currentTransfer.progress * 100).toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p>En attente de transfert...</p>
          )}
          
          {completedTransfers.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Transferts complétés: {completedTransfers.length}</h4>
              <div className="max-h-40 overflow-y-auto">
                <ul className="list-disc pl-5 space-y-1">
                  {completedTransfers.slice(0, 10).map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">{file}</li>
                  ))}
                  {completedTransfers.length > 10 && (
                    <li className="text-sm text-gray-600">...et {completedTransfers.length - 10} de plus</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Section Appareils Connectés */}
      {isTransferServiceActive && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Appareils Connectés</h3>
          
          {connectedDevices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {connectedDevices.map((device, index) => (
                <li key={index} className="py-3">
                  <p><strong>{device.name || 'Appareil inconnu'}</strong></p>
                  <p className="text-sm text-gray-600">IP: {device.ip}</p>
                  <p className="text-sm text-gray-600">MAC: {device.mac}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun appareil connecté détecté</p>
          )}
          
          <button 
            onClick={fetchConnectedDevices}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded text-sm"
          >
            Rafraîchir
          </button>
        </div>
      )}
    </div>
  );
}

export default Connexion;
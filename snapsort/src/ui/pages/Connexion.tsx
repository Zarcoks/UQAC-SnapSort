import { useState, useEffect, useRef } from "react";
import QRCode from 'qrcode';
import '../styles/components.css';

interface TransferInfo {
  fileName: string;
  progress: number;
  receivedBytes: number;
  totalBytes: number;
  fileSize?: number;
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

      console.log("Service de transfert démarré:", result.serverIp);
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
        totalBytes: info.fileSize || 0,
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
    return "0 B";
  };

  return (
    <div className="bg-gray-50 min-h-screen connexion-container">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Centre de Connexion et Transfert</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Point d'accès */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-600 py-4 px-6">
              <h2 className="text-xl font-semibold text-white">Point d'Accès WiFi</h2>
            </div>
            <div className="p-6">
              <button 
                onClick={handleStartHotspot} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg transition duration-150 ease-in-out flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Activer le point d'accès
              </button>
              
              {wifiString && (
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-mono text-sm break-words">
                      {wifiString.replace(/WIFI:/, "WiFi: ").replace(/;/g, "; ")}
                    </p>
                  </div>
                  
                  {qrCode && (
                    <div className="flex flex-col items-center mt-6">
                      <h4 className="text-lg font-medium mb-3 text-gray-700">Scanner pour se connecter:</h4>
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <img src={qrCode} alt="QR Code WiFi" className="w-64 h-64" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Section Service de Transfert */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-green-600 py-4 px-6">
              <h2 className="text-xl font-semibold text-white">Service de Transfert d'Images</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <button 
                  onClick={startTransferService} 
                  disabled={isTransferServiceActive}
                  className={`py-3 px-5 rounded-lg font-medium flex items-center transition duration-150 ease-in-out ${isTransferServiceActive 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Démarrer le service
                </button>
                
                <button 
                  onClick={stopTransferService} 
                  disabled={!isTransferServiceActive}
                  className={`py-3 px-5 rounded-lg font-medium flex items-center transition duration-150 ease-in-out ${!isTransferServiceActive 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Arrêter le service
                </button>
                
                <button 
                  onClick={fetchIpAddress} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg transition duration-150 ease-in-out flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Récupérer l'IP
                </button>
              </div>
              
              {serverIp && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">Serveur IP:</span>
                    <span className="font-mono">{serverIp}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-32">Port:</span>
                    <span className="font-mono">8080</span>
                  </div>
                  {phoneIp && (
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 w-32">Téléphone IP:</span>
                      <span className="font-mono">{phoneIp}</span>
                    </div>
                  )}
                </div>
              )}
              
              {isTransferServiceActive && transferQrCode && (
                <div className="flex flex-col items-center mt-6">
                  <h4 className="text-lg font-medium mb-3 text-gray-700">Scanner pour configurer l'application mobile:</h4>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <img src={transferQrCode} alt="QR Code Transfert" className="w-64 h-64" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Rangée inférieure - uniquement visible si le service est actif */}
        {isTransferServiceActive && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Section Progression du Transfert */}
            {/* <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-indigo-600 py-4 px-6">
                <h2 className="text-xl font-semibold text-white">Progression du Transfert</h2>
              </div>
              <div className="p-6">
                {currentTransfer ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="truncate pr-4 flex-1">
                        <p className="font-medium text-gray-800 truncate">{currentTransfer.fileName}</p>
                        {currentTransfer.index && currentTransfer.total && (
                          <p className="text-sm text-gray-500">
                            Fichier {currentTransfer.index} sur {currentTransfer.total}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-indigo-600">
                        {(currentTransfer.progress * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${Math.min(currentTransfer.progress * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-sm text-gray-600 flex justify-between">
                      <span>{formatFileSize(currentTransfer.receivedBytes)}</span>
                      <span>{formatFileSize(currentTransfer.totalBytes)}</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-gray-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    En attente de transfert...
                  </div>
                )}
                
                {completedTransfers.length > 0 && (
                  <div className="mt-8 border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-700">Transferts complétés</h4>
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {completedTransfers.length}
                      </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto pr-2 rounded-lg bg-gray-50 p-3">
                      <ul className="space-y-2">
                        {completedTransfers.slice(0, 10).map((file, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="truncate">{file}</span>
                          </li>
                        ))}
                        {completedTransfers.length > 10 && (
                          <li className="text-sm text-gray-500 italic">
                            ...et {completedTransfers.length - 10} de plus
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div> */}
            
            {/* Section Appareils Connectés */}
            {/* <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-purple-600 py-4 px-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Appareils Connectés</h2>
                <button 
                  onClick={fetchConnectedDevices}
                  className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium py-1 px-3 rounded transition duration-150 ease-in-out flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Rafraîchir
                </button>
              </div>
              <div className="p-6">
                {connectedDevices.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {connectedDevices.map((device, index) => (
                      <li key={index} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{device.name || 'Appareil inconnu'}</p>
                            <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500">
                              <p>IP: <span className="font-mono">{device.ip}</span></p>
                              <p>MAC: <span className="font-mono">{device.mac}</span></p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Aucun appareil connecté détecté</p>
                    <p className="text-sm mt-1">Les appareils apparaîtront ici une fois connectés</p>
                  </div>
                )}
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Connexion;
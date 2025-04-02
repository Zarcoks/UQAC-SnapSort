import { exec } from "child_process";
import { getScriptsPath } from './pathResolver.js';

// execute command to start hotspot
export function startHotspot(): Promise<string> {
    return new Promise((resolve, reject) => {
        const command = `powershell -Command "Start-Process powershell -Verb runAs -ArgumentList '-Command [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime]::CreateFromConnectionProfile([Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime]::GetInternetConnectionProfile()).StartTetheringAsync()'"`;

        exec(command, (error, stdout, stderr) => {

            if (error) {
                reject(`Erreur: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Erreur PowerShell: ${stderr}`);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

export async function getWifiInfo(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Exécuter un fichier PowerShell séparé
    const scriptPath = getScriptsPath('getWifiInfo.ps1'); // Chemin vers le script PowerShell
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur: ${error.message}`);
        reject(`Erreur: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Erreur PowerShell: ${stderr}`);
        reject(`Erreur PowerShell: ${stderr}`);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export function extractWifiInfo(data: string): { ssid: string | null; password: string | null } {
  // Initialiser les valeurs par défaut
  let ssid: string | null = null;
  let password: string | null = null;
  
  // Rechercher le SSID
  const ssidMatch = data.match(/ssid:\s*(.+)/i);
  if (ssidMatch && ssidMatch[1]) {
    ssid = ssidMatch[1].trim();
  }
  
  // Rechercher le mot de passe
  const passwordMatch = data.match(/password:\s*(.+)/i);
  if (passwordMatch && passwordMatch[1]) {
    password = passwordMatch[1].trim();
  }
  
  return { ssid, password };
}

  

// getPhoneIpAddress function using Promise
export function getPhoneIpAddress(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    // Execute the arp -a command to retrieve the ARP table
    exec('arp -a', (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      
      if (stderr) {
        reject(`Error in standard error output: ${stderr}`);
        return;
      }
      
    resolve(stdout);
    });
  });
}


export function extractIpAddress(arpOutput: string): string | null {
    const interfaces = arpOutput.split(/Interface:/).slice(1); // Séparer les interfaces
    const targetInterface = interfaces.find(block => block.includes("192.168.137.")); // Trouver l'interface cible

    if (!targetInterface) return null;

    const lines = targetInterface.split("\n").map(line => line.trim()); // Séparer les lignes et nettoyer
    const startIndex = lines.findIndex(line => line.startsWith("Internet Address")); // Trouver l'en-tête

    if (startIndex === -1 || startIndex + 1 >= lines.length) return null; // Vérification de validité

    for (let i = startIndex + 1; i < lines.length; i++) { // Parcourir après l'en-tête
        const match = lines[i].match(/^192\.168\.137\.\d+/); // Capturer la première adresse IP valide
        if (match) {
            return match[0]; // Retourner l'adresse trouvée
        }
    }

    return null; // Aucune adresse trouvée
}


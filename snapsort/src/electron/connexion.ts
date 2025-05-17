import { getScriptsPath } from './pathResolver.js';
import { execPowerShell } from './util.js';

/**
 * Start the mobile hotspot on your Windows machine using PowerShell.
 * @description This function executes a PowerShell command to start a mobile hotspot on Windows.
 * @returns {Promise<string>} - The output of the PowerShell command.
 * @throws {Error} - If there is an error executing the command or if PowerShell returns an error.
 */
export function startHotspot(): Promise<string> {
    const command = `powershell -Command "Start-Process powershell -Verb runAs -ArgumentList '-Command [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime]::CreateFromConnectionProfile([Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime]::GetInternetConnectionProfile()).StartTetheringAsync()'"`;
    return execPowerShell(command, "Erreur lors du démarrage du hotspot");
}

/**
 * Get the SSID of the mobile hotspot of your Windows machine using PowerShell.
 * @description This function executes a PowerShell command to retrieve the SSID of the mobile hotspot on Windows.
 * @returns {Promise<string>} - The output of the PowerShell command.
 * @throws {Error} - If there is an error executing the command or if PowerShell returns an error.
 */
export function getSSID(): Promise<string> {
    const scriptPath = getScriptsPath('powershell/getSSID.ps1');
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
    return execPowerShell(command, "Erreur lors de la récupération du SSID");
}

/**
 * Get the security key (Wi-Fi password) of the mobile hotspot of your Windows machine using PowerShell.
 * @description This function executes a PowerShell script to retrieve the security key (Wi-Fi password) of the mobile hotspot on Windows.
 * @returns {Promise<string>} - The output of the PowerShell command (the security key).
 * @throws {Error} - If there is an error executing the command or if PowerShell returns an error.
 */
export function getSecurityKey(): Promise<string> {
    const scriptPath = getScriptsPath('powershell/getSecurityKey.ps1');
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
    return execPowerShell(command, "Erreur lors de la récupération de la clé de sécurité");
}

/**
 * Extract the SSID from the output of getSSID.
 * @description This function parses the output string from the getSSID PowerShell command and extracts the SSID value.
 * @param output - The raw output string from the PowerShell command.
 * @returns The SSID as a string if found, otherwise null.
 */
export function extractSSID(output: string): string | null {
  const match = output.match(/SSID:\s*(.+)/i);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * Extract the Wi-Fi security key from the output of getSecurityKey.
 * @description This function parses the output string from the getSecurityKey PowerShell command and extracts the Wi-Fi password.
 * @param output - The raw output string from the PowerShell command.
 * @returns The security key as a string if found, otherwise null.
 */
export function extractUserSecurityKey(output: string): string | null {
  const match = output.match(/Key:\s*(.+)/i);
  return match && match[1] ? match[1].trim() : null;
}

export async function getWifiInfo(): Promise<string> {
  const scriptPath = getScriptsPath('powershell/getWifiInfo.ps1'); 
  const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
  return execPowerShell(command, "Erreur lors de la récupération des informations Wi-Fi");
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

/**
 * Get the phone's IP address connected to the Windows hotspot.
 * @description This function executes the `arp -a` command to retrieve the ARP table and returns the output as a string.
 * @returns {Promise<string>} - The output of the arp command (the ARP table).
 * @throws {Error} - If there is an error executing the command.
 */
export function getPhoneIpAddress(): Promise<string> {
  const command = 'arp -a';
  return execPowerShell(command, "Erreur lors de la récupération de l'adresse IP du téléphone");
}

export function extractIpAddress(arpOutput: string): string {
    const interfaces = arpOutput.split(/Interface:/).slice(1); // Séparer les interfaces
    const targetInterface = interfaces.find(block => block.includes("192.168.137.")); // Trouver l'interface cible

    if (!targetInterface) return "";

    const lines = targetInterface.split("\n").map(line => line.trim()); // Séparer les lignes et nettoyer
    const startIndex = lines.findIndex(line => line.startsWith("Internet Address")); // Trouver l'en-tête

    if (startIndex === -1 || startIndex + 1 >= lines.length) return ""; // Vérification de validité

    for (let i = startIndex + 1; i < lines.length; i++) { // Parcourir après l'en-tête
        const match = lines[i].match(/^192\.168\.137\.\d+/); // Capturer la première adresse IP valide
        if (match) {
            return match[0]; // Retourner l'adresse trouvée
        }
    }

    return ""; // Aucune adresse trouvée
}
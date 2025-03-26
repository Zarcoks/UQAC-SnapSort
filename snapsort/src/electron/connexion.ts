import { exec } from "child_process";

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

// execute command to get SSID
export function getSSID(): Promise<string> {
    return new Promise((resolve, reject) => {
        const command = `powershell -Command "(netsh wlan show hostednetwork) -match 'SSID name'"`;

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

// execute command to get security key
export function getSecurityKey(): Promise<string> {
    return new Promise((resolve, reject) => {
        const command = `powershell -Command "(netsh wlan show hostednetwork setting=security) -match 'User security key'"`;

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

// extractSSID function
export function extractSSID(data: string): string | null {
    const match = data.match(/SSID name\s*:\s*"([^"]+)"/);
    return match ? match[1] : null;
}

// extractSecurityKey function
export function extractUserSecurityKey(data: string): string | null {
    const match = data.match(/User security key\s*:\s*([^\s]+)/);
    return match ? match[1] : null;
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

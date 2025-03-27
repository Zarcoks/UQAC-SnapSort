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



// Fonction pour récupérer la langue de la console
export function getConsoleLanguage(): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `powershell -Command "(Get-UICulture).Name"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur: ${error.message}`);
        return reject(`Erreur: ${error.message}`);
      }
      if (stderr) {
        console.error(`Erreur PowerShell: ${stderr}`);
        return reject(`Erreur PowerShell: ${stderr}`);
      }
      const lang = stdout.trim();
      console.log(`Langue détectée: ${lang}`);
      resolve(lang);
    });
  });
}
// Fonction pour récupérer le SSID en fonction de la langue et en forçant UTF-8
export async function getSSID(): Promise<string> {
    try {
      const lang = await getConsoleLanguage();
      // Définir le filtre en fonction de la langue
      let matchString;
      if (lang.startsWith("fr")) {
        matchString = "Nom du SSID";
      } else if (lang.startsWith("en")) {
        matchString = "SSID name";
      } else {
        matchString = "SSID name";
      }
      // Forcer la sortie en UTF-8 en définissant $OutputEncoding
      const command = `powershell -Command "$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; (netsh wlan show hostednetwork) -match '${matchString}'"`;
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Erreur: ${error.message}`);
            return reject(`Erreur: ${error.message}`);
          }
          if (stderr) {
            console.error(`Erreur PowerShell: ${stderr}`);
            return reject(`Erreur PowerShell: ${stderr}`);
          }
          const output = stdout.trim();
          console.log(`SSID brut: ${output}`);
          resolve(output);
        });
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error(String(err));
      }
    }
  }
  
  // Fonction pour récupérer la clé de sécurité en fonction de la langue et en forçant UTF-8
  export async function getSecurityKey(): Promise<string> {
    try {
      const lang = await getConsoleLanguage();
      // Définir le filtre en fonction de la langue
      let matchString;
      if (lang.startsWith("fr")) {
        matchString = "Clé de sécurité utilisateur";
      } else if (lang.startsWith("en")) {
        matchString = "User security key";
      } else {
        matchString = "User security key";
      }
      const command = `powershell -Command "$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; (netsh wlan show hostednetwork setting=security) -match '${matchString}'"`;
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Erreur: ${error.message}`);
            return reject(`Erreur: ${error.message}`);
          }
          if (stderr) {
            console.error(`Erreur PowerShell: ${stderr}`);
            return reject(`Erreur PowerShell: ${stderr}`);
          }
          const output = stdout.trim();
          console.log(`Clé de sécurité brute: ${output}`);
          resolve(output);
        });
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error(String(err));
      }
    }
  }
// extractSSID function
export function extractSSID(data: string): string | null {
    // Recherche une ligne qui commence par "Nom du SSID" et capture la chaîne comprise entre « et »
    const match = data.match(/Nom du SSID\s*:\s*«\s*([^»]+)\s*»/);
    return match ? match[1] : null;
  }
  

// extractSecurityKey function
export function extractUserSecurityKey(data: string): string | null {
    // Recherche la ligne "Clé de sécurité utilisateur" et capture tout le contenu après le deux-points
    const match = data.match(/Clé de sécurité utilisateur\s*:\s*(.+)/);
    return match ? match[1].trim() : null;
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


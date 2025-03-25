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
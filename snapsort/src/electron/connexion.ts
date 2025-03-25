import { exec } from "child_process";

export function startHotspot(): Promise<string> {
    return new Promise((resolve, reject) => {
        const command = `powershell -Command "Start-Process powershell -Verb runAs -ArgumentList '-Command [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager, Windows.Networking.NetworkOperators, ContentType=WindowsRuntime]::CreateFromConnectionProfile([Windows.Networking.Connectivity.NetworkInformation, Windows.Networking.Connectivity, ContentType=WindowsRuntime]::GetInternetConnectionProfile()).StartTetheringAsync()'"`;


        console.log("🟢 Exécution de la commande PowerShell...");

        exec(command, (error, stdout, stderr) => {
            console.log("🟣 Commande exécutée, traitement des résultats...");

            if (error) {
                console.error(`❌ Erreur lors du démarrage du Hotspot: ${error.message}`);
                reject(`Erreur: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`⚠️ Erreur PowerShell: ${stderr}`);
                reject(`Erreur PowerShell: ${stderr}`);
                return;
            }

            console.log(`✅ Hotspot démarré avec succès ! Résultat: ${stdout}`);
            resolve(`Hotspot démarré avec succès ! Résultat: ${stdout}`);
        });
    });
}

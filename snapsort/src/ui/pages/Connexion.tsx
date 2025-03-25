// import logo from '../assets/logo_pro.png'; // Exemple de logo si nécessaire
import { useState } from "react";

function Connexion() {
  const [message, setMessage] = useState<string>("");

  const handleStartHotspot = async () => {
    try {
        console.log("🟢 Demande d'activation du Hotspot...");
        const result = await (window as any).electron.startHotspot();
        console.log("✅ Résultat reçu :", result);
        setMessage(result);
    } catch (error) {
        console.error("❌ Erreur lors de l'activation du Hotspot :", error);
        setMessage("Erreur lors de l'activation du Hotspot.");
    }
};


    return (
      <div className="connexion-page">
  
        
        {/* Contenu principal */}
        <main className="main-content">
          <section className="access-point-section">
            <button onClick={handleStartHotspot} className="btn-access-point">
              Se mettre en point d'accès
            </button>
            <div className="access-info">
              <p>{message}</p>
            </div>
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
  };
  
  export default Connexion;
  
import Store from "electron-store";

// Interface pour les paramètres utilisateur
interface SettingsSchema {
  directoryPath: string;
  nbrOfFilesLoaded: number;
}

// Interface pour les variables globales
interface GlobalVarsSchema {
  AIProcessing: boolean;
  // Ajoute ici d'autres variables globales si besoin
}

// Store pour les paramètres utilisateur
const store = new Store<SettingsSchema>({
  name: "settings",
  defaults: {
    directoryPath: "",
    nbrOfFilesLoaded: 10,
  },
});

// Store pour les variables globales
const globalStore = new Store<GlobalVarsSchema>({
  name: "global",
  defaults: {
    AIProcessing: false,
  },
});

export { store, globalStore };
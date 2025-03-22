import Store from "electron-store";

interface SettingsSchema {
  directoryPath: string;
  nbrOfFilesLoaded: number;
}

const store = new Store<SettingsSchema>({
  defaults: {
    directoryPath: "",
    nbrOfFilesLoaded: 10,
  },
});

export default store;
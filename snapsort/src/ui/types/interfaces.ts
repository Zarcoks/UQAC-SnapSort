// Définition du type pour les props
export interface MediaFiles {
    mediaFiles: MediaFile[];
}

// Types pour le média
export interface MediaFile {
    path: string;
    name: string;
    isVideo: boolean;
    thumbnailPath: string;
}

export interface NavBarItemProps {
    label: string;
    imageUrl: string;
    redirectTo: string;
}
  
export interface BottomItemProps {
    imageUrl: string;
    redirectTo: string;
}

// Définition des props pour le composant
export interface RenderMediaItemProps {
    mediaFile: MediaFile;
    imageHeight: number;
    index: number;
    openEnlargedView: (index: number) => void;
  }

export interface EnlargedViewProps {
    enlargedImageIndex: number | null;
    mediaFiles: MediaFile[];
    closeEnlargedView: () => void;
    goToPrevious: (e: React.MouseEvent) => void;
    goToNext: (e: React.MouseEvent) => void;
}
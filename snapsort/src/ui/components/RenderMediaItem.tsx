import { RenderMediaItemProps } from '../types/interfaces';

// Fonction pour rendre un élément média (image ou vidéo)
function RenderMediaItem({ mediaFile, imageHeight, index, openEnlargedView }: RenderMediaItemProps) {
  if (mediaFile.isVideo) {
      return (
      <div className="image-viewer-item" key={index}>
          <img
            src={`file://${mediaFile.thumbnailPath}`}
            alt={`Media ${index}`}
            style={{ height: `${imageHeight}px` }}
            onClick={() => openEnlargedView(index)}
          />
          <div className="play-button-overlay">
          <i className="fi fi-br-play"></i>
        </div>
      </div>
      
      );
  } else {
      return (
      <div className="image-viewer-item" key={index}>
          <img
          src={`file://${mediaFile.path}`}
          alt={`Media ${index}`}
          style={{ height: `${imageHeight}px` }}
          onClick={() => openEnlargedView(index)}
          />
      </div>
      );
    }
  };

export default RenderMediaItem;
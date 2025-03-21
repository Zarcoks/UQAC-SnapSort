import { Link } from 'react-router-dom';
import '../styles/components.css';
import logo from '../assets/logo.png';
import iconAlbums from '../assets/icon_albums.png';
import iconSettings from '../assets/icon_settings.png';
import iconUser from '../assets/icon_user.png';
import iconUnsortedImages from '../assets/icon_unsorted_images.png';
import iconWifi from '../assets/icon_wifi.png';

interface NavBarItemProps {
  label: string;  // Le nom du bouton (par exemple "Albums")
  imageUrl: string;  // L'URL de l'image pour le bouton
  redirectTo: string;  // L'URL vers laquelle le bouton redirige
}

const NavBarItem: React.FC<NavBarItemProps> = ({ label, imageUrl, redirectTo }) => {
  return (
    <Link to={redirectTo} className="sidebar-item">
      <img src={imageUrl} alt={label} className="sidebar-icon" />
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <div className="top">
          <img src={logo} className="sidebar-logo" alt="logo" />
        </div>
        <div className="mid">
          <NavBarItem
            label="Albums"
            imageUrl={iconAlbums}
            redirectTo="/albums"
          />
          <NavBarItem
            label="Images non triées"
            imageUrl={iconUnsortedImages}
            redirectTo="/untagged-images"
          />
          <NavBarItem
            label="Connexion"
            imageUrl={iconWifi}
            redirectTo="/login"
          />
        </div>
        <div className="bottom">
          <div className="bottom-item">
            <img src={iconSettings} className="bottom-icon" alt="logo" />
          </div>
          <div className="bottom-item">
            <img src={iconUser} className="bottom-icon" alt="logo" />
          </div>
        </div>
    </div>
  )
}

export default Sidebar
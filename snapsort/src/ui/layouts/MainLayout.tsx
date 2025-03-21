import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import '../styles/components.css';

const MainLayout = () => {
  return (
    <div className="app-container">
    <Sidebar />
    <main className="page-content">
        <Outlet />
    </main>
    </div>
  );
};

export default MainLayout;
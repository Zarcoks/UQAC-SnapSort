import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import MainLayout from "./layouts/MainLayout";

import './App.css'
import './styles/global.css'
import './styles/themes.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages sans Sidebar/Navbar (ex: login, signup) */}

        {/* Pages avec Sidebar/Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

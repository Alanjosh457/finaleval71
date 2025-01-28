
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './Login';
import Register from './Register';





import Navbar from './Navbar';

import './App.css';
import Linkpage from './Linkpage';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import SettingsPage from './SettingsPage';

import RedirectHandler from './RedirectHandler'; // Adjust the path as needed

const App = () => {
  const location = useLocation();
 

  const showNavbar = ['/settings', '/dash','/link','/aly'].some((path) =>
    location.pathname.startsWith(path)
  );



  // Redirect to long URL when short URL is visited



  return (
    <div>
      <Toaster />
      {showNavbar && <Navbar />}

      <Routes>
        {/* Define your routes */}
      
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
     
        <Route path="/settings" element={<SettingsPage />} />
     
        <Route path="/link/:userId/" element={<Linkpage />} />
    
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/aly" element={<Analytics />} />
        <Route path="/:shortenedKey" element={<RedirectHandler />} />
      </Routes>
    </div>
  );
};

export default App;

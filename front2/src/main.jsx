

import { createRoot } from 'react-dom/client';
import './index.css';
import { HashRouter} from 'react-router-dom';
import App from './App';
import { UserProvider } from './UserContext';

createRoot(document.getElementById('root')).render(

    <HashRouter>
      <UserProvider>
      <App />
      </UserProvider>
    
    </HashRouter>

);

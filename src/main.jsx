import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import  store  from './Redux/Store.js'
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Optional, choose a theme
import 'primereact/resources/primereact.min.css'; // Core styles
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // For utility classes (optional)
import { Provider } from 'react-redux';


import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'; 


createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)

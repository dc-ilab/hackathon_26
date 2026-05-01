import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import Accounts from './pages/Accounts';
import ClientProfile from './pages/ClientProfile';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/client" element={<ClientProfile />} />
        <Route path="/client/:clientId" element={<ClientProfile />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

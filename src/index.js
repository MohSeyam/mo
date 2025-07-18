import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { ToastProvider } from './context/ToastContext';
import { AppProvider } from './context/AppContext';
// import { planData } from './components/App';
import planData from './components/planData';
// import planData from '../data/planData.json';

ReactDOM.render(
  <ToastProvider>
    <AppProvider planData={planData}>
      <App />
    </AppProvider>
  </ToastProvider>,
  document.getElementById('root')
);

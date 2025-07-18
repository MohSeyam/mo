import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { AppProvider } from './context/AppContext';
import planData from './components/planData';

// نمرر بيانات الخطة (planData) للـ AppProvider ليتم توزيعها على كل المكونات عبر الـ Context
ReactDOM.render(
  <React.StrictMode>
    <AppProvider planData={planData}>
      <App />
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

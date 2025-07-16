import React, { createContext, useContext, useState, useCallback } from 'react';
import Spinner from '../components/Spinner';

const SpinnerContext = createContext();

export function SpinnerProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const showSpinner = useCallback(() => setLoading(true), []);
  const hideSpinner = useCallback(() => setLoading(false), []);
  return (
    <SpinnerContext.Provider value={{ loading, showSpinner, hideSpinner }}>
      {children}
      {loading && <Spinner fullscreen />}
    </SpinnerContext.Provider>
  );
}

export function useSpinner() {
  return useContext(SpinnerContext);
}
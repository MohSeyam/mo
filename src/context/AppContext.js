import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';
import { updateNoteInState, deleteNoteInState } from '../utils/stateUtils';

const AppContext = createContext();

export function AppProvider({ children, planData }) {
  const [appState, setAppState] = useState({});
  const { showToast } = useToast();

  // تحديث الملاحظة
  const updateNote = (note, newNoteData) => {
    try {
      setAppState(prev => updateNoteInState(prev, planData, note, newNoteData));
      showToast('تم الحفظ بنجاح', 'success');
    } catch (e) {
      showToast('حدث خطأ ما', 'error');
    }
  };

  // حذف الملاحظة
  const deleteNote = (note) => {
    try {
      setAppState(prev => deleteNoteInState(prev, planData, note));
      showToast('تم الحذف بنجاح', 'success');
    } catch (e) {
      showToast('حدث خطأ ما', 'error');
    }
  };

  return (
    <AppContext.Provider value={{ appState, setAppState, updateNote, deleteNote, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
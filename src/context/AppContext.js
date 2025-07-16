import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

// --- الحل ---
// 1. نستورد دوال تحديث الحالة من ملف الأدوات، وهذا أفضل من ناحية تنظيم الكود.
import { updateNoteInState, deleteNoteInState } from '../utils/stateUtils'; 
// ملاحظة: قد تحتاج إلى إضافة دوال أخرى مثل updateJournalEntry إذا كانت موجودة في stateUtils

// 2. ننشئ الـ Context
export const AppContext = createContext();

export function AppProvider({ children, planData }) {
    const [appState, setAppState] = useState({ notes: {}, journal: {} }); // افترضت بنية الحالة الأولية
    const { showToast } = useToast();

    /**
     * دالة لتحديث ملاحظة.
     * تجمع بين استدعاء دالة التحديث المنطقية من stateUtils (من فرعك)
     * مع إظهار الإشعار (من فرع main).
     */
    const updateNote = (note, newNoteData) => {
        try {
            // 3. نستخدم دالة التحديث المنفصلة لتغيير الحالة
            setAppState(prev => updateNoteInState(prev, planData, note, newNoteData));
            showToast('تم الحفظ بنجاح', 'success');
        } catch (e) {
            console.error("Error updating note:", e);
            showToast('حدث خطأ ما أثناء الحفظ', 'error');
        }
    };

    /**
     * دالة لحذف ملاحظة.
     * تجمع بين استدعاء دالة الحذف المنطقية من stateUtils (من فرعك)
     * مع إظهار الإشعار (من فرع main).
     */
    const deleteNote = (note) => {
        try {
            // 4. نستخدم دالة الحذف المنفصلة لتغيير الحالة
            setAppState(prev => deleteNoteInState(prev, planData, note));
            showToast('تم الحذف بنجاح', 'success');
        } catch (e) {
            console.error("Error deleting note:", e);
            showToast('حدث خطأ ما أثناء الحذف', 'error');
        }
    };

    // 5. نمرر الدوال والقيم عبر الـ Provider
    const contextValue = {
        lang: 'ar', // قيمة افتراضية
        appState,
        setAppState,
        planData,
        showToast,
        updateNote,
        deleteNote,
        // أضف أي دوال أو قيم أخرى تحتاجها هنا
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

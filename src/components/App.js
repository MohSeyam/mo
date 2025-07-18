import React, { useContext } from 'react';
import Toast from './Toast';
import { AppContext } from '../context/AppContext';

function App() {
  // الحصول على البيانات والدوال من الـ Context
  const { planData, lang, appState, updateNote, deleteNote, showToast } = useContext(AppContext);

return (
    <>
      <Toast rtl={lang === 'ar'} />
      <div style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <h1>مرحبًا بك في تطبيق الخطة السيبرانية</h1>
        <p>عدد الأسابيع في الخطة: {planData.length}</p>
        <ul>
          {planData.map(week => (
            <li key={week.week}>
              {week.title[lang]}
            </li>
          ))}
        </ul>
        {/* مثال على استخدام دوال التحديث والحذف */}
        {/* <button onClick={() => updateNote(note, newNoteData)}>تحديث ملاحظة</button> */}
        {/* <button onClick={() => deleteNote(note)}>حذف ملاحظة</button> */}
      </div>
        </>
  );
}

export default App;

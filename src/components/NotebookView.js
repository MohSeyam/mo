import React, { useState, useMemo } from 'react';
import NoteEditor from './components/NoteEditor';
import TaskNotesList from './components/TaskNotesList';
import JournalEntriesList from './components/JournalEntriesList';
import { useAppContext } from '../context/AppContext';
import { getStats, exportAllData, importAllData } from '../utils/noteUtils';

function NotebookView() {
    const { lang, appState, setAppState, setModal, planData, translations, updateNote, deleteNote, showToast } = useAppContext();
    const t = translations[lang];
    const [activeTab, setActiveTab] = useState('tasks');
    const [showGraph, setShowGraph] = useState(false);

    const allTaskNotes = useMemo(() => {
        if (!appState || !appState.notes) return [];
        const notesList = [];
        Object.keys(appState.notes).forEach(weekKey => {
            Object.keys(appState.notes[weekKey].days).forEach(dayIdx => {
                const dayNotes = appState.notes[weekKey].days[dayIdx];
                Object.keys(dayNotes).forEach(taskId => {
                    const note = dayNotes[taskId];
                    const weekData = planData.find(w => w.week === parseInt(weekKey));
                    const dayData = weekData?.days[parseInt(dayIdx)];
                    const taskData = dayData?.tasks.find(t => t.id === taskId);
                    if (weekData && dayData && taskData) {
                        notesList.push({ ...note, weekData, dayData, taskData });
                    }
                });
            });
        });
        // ترتيب حسب خاصية order إذا وجدت، وإلا حسب updatedAt
        return notesList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [appState.notes, planData]);
    
    const allJournalEntries = useMemo(() => {
        if (!appState || !appState.journal) return [];
        const entriesList = [];
        Object.keys(appState.journal).forEach(weekKey => {
            Object.keys(appState.journal[weekKey].days).forEach(dayIdx => {
                const entry = appState.journal[weekKey].days[dayIdx];
                if(entry) {
                    const weekData = planData.find(w => w.week === parseInt(weekKey));
                    const dayData = weekData?.days[parseInt(dayIdx)];
                    if (weekData && dayData) {
                        entriesList.push({ ...entry, weekData, dayData });
                    }
                }
            });
        });
        return entriesList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [appState.journal, planData]);

    // استخراج جميع المهام المتاحة من planData
    const allTasks = useMemo(() => {
        const tasks = [];
        planData.forEach(week => {
            week.days.forEach(day => {
                day.tasks.forEach(task => {
                    tasks.push({
                        ...task,
                        week,
                        day,
                    });
                });
            });
        });
        return tasks;
    }, [planData]);

    const stats = useMemo(() => getStats(allTaskNotes, allJournalEntries), [allTaskNotes, allJournalEntries]);

    const openNoteModal = (note) => {
        const currentIndex = allTaskNotes.findIndex(n => n.updatedAt === note.updatedAt);
        setModal({
            isOpen: true,
            content: <NoteEditor 
                        note={note} 
                        taskDescription={note.taskData.description[lang]}
                        onSave={(newNoteData) => {
                            updateNote(note, newNoteData);
                            setModal({ isOpen: false, content: null });
                        }}
                        onDelete={() => {
                            deleteNote(note);
                            setModal({ isOpen: false, content: null });
                        }}
                        currentIndex={currentIndex}
                        notes={allTaskNotes}
                        onNavigate={idx => {
                            const nextNote = allTaskNotes[idx];
                            if (nextNote) openNoteModal(nextNote);
                        }}
                        allTasks={allTasks}
                    />
        });
    };

    // دالة إعادة ترتيب الملاحظات في الحالة
    const handleReorderNotes = (reorderedNotes) => {
        setAppState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            reorderedNotes.forEach((note, idx) => {
                const weekKey = note.weekData.week;
                const dayIdx = note.dayData.key;
                const taskId = note.taskData.id;
                const week = newState.notes[weekKey];
                if (week && week.days[dayIdx] && week.days[dayIdx][taskId]) {
                    newState.notes[weekKey].days[dayIdx][taskId].order = idx;
                }
            });
            return newState;
        });
        showToast('تم تحديث ترتيب الملاحظات', 'success');
    };

    const handleExportAll = () => {
        const data = exportAllData(appState);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('تم تصدير جميع البيانات بنجاح', 'success');
    };
    const handleImportAll = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const importedData = JSON.parse(evt.target.result);
                setAppState(prev => importAllData(prev, importedData));
                showToast('تم الاستيراد ودمج البيانات بنجاح', 'success');
            } catch {
                showToast('فشل الاستيراد: ملف غير صالح', 'error');
            }
        };
        reader.readAsText(file);
    };

    // دالة إعادة ترتيب الملاحظات في الحالة
    const handleReorderNotes = (reorderedNotes) => {
        // تحديث ترتيب الملاحظات في appState.notes حسب الترتيب الجديد
        // سنضيف خاصية order لكل ملاحظة ونرتبها بناءً عليها
        setAppState(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            reorderedNotes.forEach((note, idx) => {
                const weekKey = note.weekData.week;
                const dayIdx = note.dayData.key;
                const taskId = note.taskData.id;
                const week = newState.notes[weekKey];
                if (week && week.days[dayIdx] && week.days[dayIdx][taskId]) {
                    newState.notes[weekKey].days[dayIdx][taskId].order = idx;
                }
            });
            return newState;
        });
        showToast('تم تحديث ترتيب الملاحظات', 'success');
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl h-full flex flex-col border border-gray-100 dark:border-gray-800">
            {/* أزرار التصدير والاستيراد */}
            <div className="mb-4 flex gap-4">
                <button onClick={handleExportAll} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">تصدير الكل</button>
                <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                    استيراد
                    <input type="file" accept="application/json" onChange={handleImportAll} className="hidden" />
                </label>
            </div>
            {/* لوحة الإحصائيات */}
            <div className="mb-6 flex flex-wrap gap-6 items-center justify-start">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-2 text-blue-900 dark:text-blue-100 font-semibold">
                    📝 {t.notesCount || 'عدد الملاحظات'}: {stats.notesCount}
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg px-4 py-2 text-green-900 dark:text-green-100 font-semibold">
                    📔 {t.journalCount || 'عدد التدوينات'}: {stats.journalCount}
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg px-4 py-2 text-yellow-900 dark:text-yellow-100 font-semibold flex items-center gap-2">
                    <span>🏷️ {t.topTags || 'أكثر التاجات'}:</span>
                    {stats.topTags.map(tagObj => (
                        <span key={tagObj.tag} className="bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 rounded px-2 mx-1">
                            {tagObj.tag} ({tagObj.count})
                        </span>
                    ))}
                </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <nav className="-mb-px flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
                    <button onClick={() => setActiveTab('tasks')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t.taskNotes}
                    </button>
                    <button onClick={() => setActiveTab('journal')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'journal' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t.journalEntries}
                    </button>
                </nav>
                <button onClick={()=>setShowGraph(true)} className="ml-4 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 text-sm font-medium">العرض البياني</button>
            </div>
            {/* Graph view and notes rendering would go here, omitted for brevity */}
            <div className="overflow-y-auto flex-grow mt-6">
                {activeTab === 'tasks' && (
                    <TaskNotesList notes={allTaskNotes} lang={lang} onEdit={openNoteModal} onReorder={handleReorderNotes} />
                )}
                {activeTab === 'journal' && (
                    <JournalEntriesList entries={allJournalEntries} lang={lang} />
                )}
            </div>
        </div>
    );
}

export default NotebookView;
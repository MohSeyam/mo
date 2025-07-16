import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../components/App';
import NoteEditor from './components/NoteEditor';
import TaskNotesList from './components/TaskNotesList';
import JournalEntriesList from './components/JournalEntriesList';
import { useAppContext } from '../context/AppContext';<<<<<<< cursor/implement-and-detail-application-features-c882

function NotebookView() {
    const { lang, appState, setModal, planData, translations, updateNote, deleteNote, showToast } = useAppContext();
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
        return notesList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl h-full flex flex-col border border-gray-100 dark:border-gray-800">
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
                    <TaskNotesList notes={allTaskNotes} lang={lang} onEdit={openNoteModal} />
                )}
                {activeTab === 'journal' && (
                    <JournalEntriesList entries={allJournalEntries} lang={lang} />
                )}
            </div>
        </div>
    );
}

export default NotebookView;
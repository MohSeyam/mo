import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../components/App';
import NoteEditor from './components/NoteEditor';
import TaskNotesList from './components/TaskNotesList';
import JournalEntriesList from './components/JournalEntriesList';
import { useAppContext } from '../context/AppContext';

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

    const openNoteModal = (note) => {
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
                    />
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl h-full flex flex-col border border-gray-100 dark:border-gray-800">
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
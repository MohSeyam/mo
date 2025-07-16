import React, { useState, useMemo, useContext, useRef } from 'react';
import { AppContext } from '../components/App';
import NoteEditor from '../components/NoteEditor';
import TaskNotesList from '../components/TaskNotesList';
import JournalEntriesList from '../components/JournalEntriesList';
import { extractAllTaskNotes, extractAllJournalEntries } from '../utils/noteUtils';
import { updateNoteInState, deleteNoteInState } from '../utils/stateUtils';
import MonthTemplate from '../components/MonthTemplate';

function NotebookView() {
    const { lang, appState, setModal, planData, translations, showToast, setAppState, rtl } = useContext(AppContext);
    const t = translations[lang];
    const [activeTab, setActiveTab] = useState('tasks');
    const [showGraph, setShowGraph] = useState(false);
    const [modal, setLocalModal] = useState({ open: false, content: null });

    const allTaskNotes = useMemo(() => extractAllTaskNotes(appState, planData), [appState.notes, planData]);
    const allJournalEntries = useMemo(() => extractAllJournalEntries(appState, planData), [appState.journal, planData]);

    // حساب الإحصائيات الخاصة بالدفتر
    const stats = useMemo(() => {
        return {
            totalTasks: allTaskNotes.length,
            completedTasks: allTaskNotes.filter(n => n.completed).length,
            totalTime: allTaskNotes.reduce((acc, n) => acc + (n.duration || 0), 0),
            notesCount: allTaskNotes.length,
            journalCount: allJournalEntries.length,
            resourcesCount: 0, // يمكن حسابها إذا كانت متوفرة
            sectionStats: {}, // يمكن حسابها إذا كانت متوفرة
            tagStats: {}, // يمكن حسابها إذا كانت متوفرة
        };
    }, [allTaskNotes, allJournalEntries]);
    const isAllComplete = stats.totalTasks === stats.completedTasks && stats.totalTasks > 0;
    const logo = null;
    const charts = null;

    function handlePrint(ref) {
        if (ref && ref.current) {
            const printContents = ref.current.innerHTML;
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Print</title></head><body>' + printContents + '</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }
    function openMonthTemplate() {
        setLocalModal({
            open: true,
            content: <MonthTemplate logo={logo} stats={stats} charts={charts} isAllComplete={isAllComplete} rtl={rtl} lang={lang} onPrint={handlePrint} />
        });
    }
    function Modal({ open, content, onClose }) {
        if (!open) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative">
                    <button onClick={onClose} className="absolute top-2 left-2 text-gray-500 hover:text-gray-700">&times;</button>
                    {content}
                </div>
            </div>
        );
    }

    const openNoteModal = (note) => {
        setModal({
            isOpen: true,
            content: <NoteEditor 
                        note={note} 
                        taskDescription={note.taskData.description[lang]}
                        onSave={(newNoteData) => {
                            setAppState(prev => updateNoteInState(prev, planData, note, newNoteData));
                            setModal({ isOpen: false, content: null });
                        }}
                        onDelete={() => {
                            setAppState(prev => deleteNoteInState(prev, planData, note));
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
                <div className="flex gap-2">
                    <button onClick={openMonthTemplate} className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-medium">{lang === 'ar' ? 'عرض ملخص الشهر' : 'Show Month Summary'}</button>
                    <button onClick={()=>setShowGraph(true)} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700 text-sm font-medium">{lang === 'ar' ? 'العرض البياني' : 'Show Graph'}</button>
                </div>
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
            <Modal open={modal.open} content={modal.content} onClose={() => setLocalModal({ open: false, content: null })} />
        </div>
    );
}

export default NotebookView;
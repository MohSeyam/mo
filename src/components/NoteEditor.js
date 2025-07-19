import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
// --- FIX: Named import for ReactMde ---
import { ReactMde } from 'react-mde';
import Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde.css';
// import 'react-mde/lib/styles/css/react-mde-all.css';
import { AppContext } from '../context/AppContext';
import noteTemplates from './NoteTemplates';

const NoteEditor = React.memo(function NoteEditor({ note, taskDescription, onSave, onDelete, currentIndex, notes, onNavigate, allTasks }) {
    // --- Context and State Hooks ---
    const { lang, translations, setModal, showToast } = useContext(AppContext);
    const t = translations[lang];

    const [title, setTitle] = useState(note?.title || '');
    const [tags, setTags] = useState(note?.keywords || []);
    const [content, setContent] = useState(note?.content || '');
    const [template, setTemplate] = useState(note?.templateType || '');
    const [selectedTaskId, setSelectedTaskId] = useState(note?.taskData?.id || '');
    const [selectedTab, setSelectedTab] = useState('write');
    const fileInputRef = useRef(null);
    const converter = new Showdown.Converter({ tables: true, simplifiedAutoLink: true, strikethrough: true });

    // --- Handlers and Logic ---

    const handleAddTag = useCallback((e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const newTag = e.target.value.trim();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            e.target.value = '';
        }
    }, [tags]);

    const handleRemoveTag = useCallback((tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    }, [tags]);
    
    const handleSave = useCallback(() => {
        if (!title.trim()) {
            showToast(t.titleRequired, 'error');
            return;
        }
        if (!content.trim()) {
            showToast(t.contentRequired, 'error');
            return;
        }
        const selectedTask = allTasks.find(t => t.id === selectedTaskId);
        onSave({
            ...note, // Preserve original note ID and other properties
            title,
            content,
            keywords: tags,
            taskId: selectedTaskId,
            taskData: selectedTask,
            templateType: template
        });
        showToast('تم الحفظ بنجاح!', 'success');
    }, [title, content, tags, selectedTaskId, allTasks, onSave, showToast, t, template, note]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            } else if (e.key === 'Escape') {
                setModal({ isOpen: false, content: null });
            } else if (e.key === 'ArrowRight') {
                if (onNavigate && currentIndex < notes.length - 1) onNavigate(currentIndex + 1);
            } else if (e.key === 'ArrowLeft') {
                if (onNavigate && currentIndex > 0) onNavigate(currentIndex - 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, setModal, onNavigate, currentIndex, notes]);


    const handleImageUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const imageMarkdown = `![صورة](${reader.result})`;
            setContent(prev => {
                const textarea = document.querySelector('.mde-text');
                const pos = textarea ? textarea.selectionStart : prev.length;
                return prev.slice(0, pos) + imageMarkdown + prev.slice(pos);
            });
        };
        reader.readAsDataURL(file);
    }, []);
    
    const templates = noteTemplates;

    const insertTemplate = useCallback((templateContent, templateType) => {
        setContent(prev => {
            const textarea = document.querySelector('.mde-text');
            if (textarea && textarea.selectionStart !== undefined) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                return prev.slice(0, start) + templateContent + prev.slice(end);
            }
            return templateContent;
        });
        setTemplate(templateType);
    }, []);
    
    const handleInitialTemplateChange = useCallback((e) => {
        const selectedValue = e.target.value;
        setTemplate(selectedValue);
        if (selectedValue === 'video') {
            setTitle(t.videoSummary);
            setContent('النقاط الرئيسية:\n- \n\nمصطلحات جديدة:\n- \n\nأسئلة للمتابعة:\n- ');
        } else if (selectedValue === 'tool') {
            setTitle(t.toolAnalysis);
            setContent('الغرض من الأداة:\n\nأهم الأوامر:\n\nبدائل:');
        } else {
            setTitle('');
            setContent('');
        }
    }, [t]);

    const customCommands = [
        {
            name: 'image',
            icon: () => <span role="img" aria-label="صورة">🖼️</span>,
            execute: () => fileInputRef.current.click()
        }
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{t.editNote}</h3>
                    {taskDescription && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.noteOnTask} "{taskDescription}"</p>}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onNavigate(currentIndex - 1)} disabled={!onNavigate || currentIndex === 0} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50" title={t.previous}>◀</button>
                    <button onClick={() => onNavigate(currentIndex + 1)} disabled={!onNavigate || currentIndex >= notes.length - 1} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50" title={t.next}>▶</button>
                </div>
            </div>

            <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto flex-grow">
                {!note?.id && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.chooseTemplate}</label>
                        <select value={template} onChange={handleInitialTemplateChange} className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="">{t.noTemplate}</option>
                            <option value="video">{t.videoSummary}</option>
                            <option value="tool">{t.toolAnalysis}</option>
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="note-title-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.noteTitle}</label>
                    <input id="note-title-editor" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.keywords}</label>
                    <div className="flex flex-wrap gap-2 my-2">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {tag}
                                <button type="button" className="ml-1.5 text-blue-500 hover:text-red-500 focus:outline-none" onClick={() => handleRemoveTag(tag)}>×</button>
                            </span>
                        ))}
                    </div>
                    <input type="text" placeholder={t.addNewTag} onKeyDown={handleAddTag} className="p-2 border rounded-md w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                </div>

                {allTasks && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.linkedTask}</label>
                        <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            <option value="">-- غير مرتبط --</option>
                            {allTasks.map(task => (
                                <option key={task.id} value={task.id}>{task.title?.[lang] || task.id}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.noteContent}</label>
                    <div className="mb-2 flex flex-wrap gap-2">
                        {templates.map((tpl, idx) => (
                            <button key={idx} type="button" className={`px-2 py-1 rounded text-xs border ${tpl.templateType === 'cyber' ? 'bg-blue-100 text-blue-800 border-blue-200' : tpl.templateType === 'policy' ? 'bg-green-100 text-green-800 border-green-200' : tpl.templateType === 'soft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`} style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }} onClick={() => insertTemplate(tpl.content, tpl.templateType)} title={tpl.label}>
                                {tpl.label}
                            </button>
                        ))}
                    </div>
                    <ReactMde
                        value={content}
                        onChange={setContent}
                        selectedTab={selectedTab}
                        onTabChange={setSelectedTab}
                        generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
                        l18n={{ write: t.write, preview: t.preview }}
                        minEditorHeight={150}
                        heightUnits="px"
                        toolbarCommands={[['bold', 'italic', 'strikethrough'], ['link', 'quote', 'image'], ['unordered-list', 'ordered-list']]}
                        commands={{ image: customCommands[0] }}
                    />
                    <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 flex flex-row-reverse items-center">
                <button onClick={handleSave} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    {t.saveNote}
                </button>
                <button onClick={() => setModal({ isOpen: false, content: null })} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                    {t.cancel}
                </button>
                {onDelete && (
                    <button onClick={onDelete} type="button" className="ml-auto px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400">
                        {t.deleteNote}
                    </button>
                )}
            </div>
        </div>
    );
});

// The demo App part is removed for brevity, but the component itself is corrected.
export default NoteEditor;

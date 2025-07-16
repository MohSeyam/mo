import React, { useState, useEffect, useContext, useRef } from 'react';
import TagInput from './components/TagInput';
import ReactMde from 'react-mde';
import Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { AppContext } from '../components/App';

function NoteEditor({ note, taskDescription, onSave, onDelete, currentIndex, notes, onNavigate, allTasks }) {
    const { lang, translations, setModal, showToast } = useContext(AppContext);
    const t = translations[lang];
    const [title, setTitle] = useState(note.title || '');
    const [tags, setTags] = useState(note.keywords || []);
    const [content, setContent] = useState(note.content || '');
    const [template, setTemplate] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState(note.taskData?.id || '');
    const [selectedTab, setSelectedTab] = useState('write');
    const fileInputRef = useRef();
    const converter = new Showdown.Converter({tables: true, simplifiedAutoLink: true});
    useEffect(() => {
        if (!note.title && template) {
            if (template === 'video') {
                setTitle('ملخص فيديو');
                setContent('النقاط الرئيسية:\n- \nمصطلحات جديدة:\n- \nأسئلة للمتابعة:\n- ');
            } else if (template === 'tool') {
                setTitle('تحليل أداة');
                setContent('الغرض من الأداة:\n\nأهم الأوامر:\n\nبدائل:');
            }
        }
    }, [template]);
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
    }, [title, content, tags, template, currentIndex, notes, onNavigate]);
    const handleAddTag = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            if (!tags.includes(e.target.value.trim())) setTags([...tags, e.target.value.trim()]);
            e.target.value = '';
        }
    };
    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };
    const handleSave = () => {
        if (!title.trim()) {
            showToast(t.titleRequired, 'error');
            return;
        }
        if (!content.trim()) {
            showToast(t.contentRequired, 'error');
            return;
        }
        const selectedTask = allTasks.find(t => t.id === selectedTaskId);
        onSave({ title, content, keywords: tags, taskId: selectedTaskId, taskData: selectedTask });
    };
    // زر رفع صورة
    const handleImageUpload = (e) => {
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
    };
    // --- قوالب جاهزة ---
    const templates = [
        // قوالب سيبرانية
        { label: 'تقرير حادث أمني', content: `# تقرير حادث أمني\n\n**التاريخ:** \n**الموقع:** \n**الوصف:** \n**الإجراءات المتخذة:** \n**التوصيات:** \n` },
        { label: 'تحليل ثغرة', content: `# تحليل ثغرة\n\n**اسم الثغرة:** \n**الوصف:** \n**تأثيرها:** \n**كيفية الاستغلال:** \n**طرق الحماية:** \n` },
        { label: 'مذكرة اختبار اختراق', content: `# مذكرة اختبار اختراق\n\n**النطاق:** \n**الأدوات المستخدمة:** \n**النتائج:** \n**الثغرات المكتشفة:** \n**التوصيات:** \n` },
        { label: 'ملخص دورة/شهادة', content: `# ملخص دورة/شهادة\n\n**اسم الدورة/الشهادة:** \n**المحتوى الأساسي:** \n**المهارات المكتسبة:** \n**ملاحظات:** \n` },
        { label: 'مراجعة أداة أمنية', content: `# مراجعة أداة أمنية\n\n**اسم الأداة:** \n**الغرض:** \n**المميزات:** \n**العيوب:** \n**أوامر مهمة:** \n` },
        { label: 'خطة استجابة للحوادث', content: `# خطة استجابة للحوادث\n\n1. التحضير\n2. الكشف والتحليل\n3. الاحتواء\n4. الاستئصال\n5. الاستعادة\n6. الدروس المستفادة\n` },
        { label: 'مذكرة تحليل برمجية خبيثة', content: `# مذكرة تحليل برمجية خبيثة\n\n**اسم الملف:** \n**نوع البرمجية:** \n**سلوكها:** \n**طرق الانتشار:** \n**طرق الحماية:** \n` },
        { label: 'مخطط اختبار اجتماعي', content: `# مخطط اختبار اجتماعي\n\n**الهدف:** \n**السيناريوهات:** \n**النتائج المتوقعة:** \n**الملاحظات:** \n` },
        { label: 'مذكرة تحليل شبكة', content: `# مذكرة تحليل شبكة\n\n**النطاق:** \n**الأدوات:** \n**النتائج:** \n**الملاحظات:** \n` },
        { label: 'مذكرة مراجعة كود', content: `# مذكرة مراجعة كود\n\n**المشروع:** \n**النطاق:** \n**الثغرات المحتملة:** \n**التوصيات:** \n` },
        // قوالب سياسات أمنية
        { label: 'سياسة كلمة المرور', content: `# سياسة كلمة المرور\n\n- يجب أن تتكون كلمة المرور من 12 حرفًا على الأقل.\n- يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز.\n- تغيير كلمة المرور كل 90 يومًا.\n- عدم مشاركة كلمة المرور مع أي شخص.\n` },
        { label: 'سياسة استخدام البريد الإلكتروني', content: `# سياسة استخدام البريد الإلكتروني\n\n- يمنع فتح الروابط المشبوهة.\n- يمنع تحميل المرفقات من مصادر غير موثوقة.\n- الإبلاغ عن أي رسائل تصيد.\n` },
        { label: 'سياسة الأجهزة المحمولة', content: `# سياسة الأجهزة المحمولة\n\n- تفعيل القفل التلقائي للجهاز.\n- استخدام التشفير.\n- عدم تثبيت تطبيقات غير موثوقة.\n- الإبلاغ عن فقدان الجهاز فورًا.\n` },
        { label: 'سياسة الوصول للأنظمة', content: `# سياسة الوصول للأنظمة\n\n- منح الصلاحيات حسب الحاجة فقط.\n- مراجعة الصلاحيات بشكل دوري.\n- إلغاء صلاحيات الموظفين المنتهية خدمتهم فورًا.\n` },
        // قوالب مهارات ناعمة
        { label: 'تقييم مهارة التواصل', content: `# تقييم مهارة التواصل\n\n**الموقف:** \n**ما الذي سار بشكل جيد؟** \n**ما الذي يمكن تحسينه؟** \n**خطة التحسين:** \n` },
        { label: 'خطة تطوير مهارة القيادة', content: `# خطة تطوير مهارة القيادة\n\n- نقاط القوة الحالية:\n- نقاط الضعف:\n- أهداف التطوير:\n- خطوات عملية:\n` },
        { label: 'مذكرة إدارة الوقت', content: `# مذكرة إدارة الوقت\n\n**المهام الرئيسية:** \n**الأولويات:** \n**العقبات:** \n**خطوات التحسين:** \n` },
        { label: 'تقييم العمل الجماعي', content: `# تقييم العمل الجماعي\n\n**المشروع:** \n**دورك:** \n**ما الذي نجح؟** \n**ما الذي يمكن تحسينه؟** \n` },
        { label: 'خطة تطوير مهارة حل المشكلات', content: `# خطة تطوير مهارة حل المشكلات\n\n- المشكلة:\n- التحليل:\n- الحلول المقترحة:\n- الخطة التنفيذية:\n` },
    ];
    // إدراج القالب في مكان المؤشر أو استبدال النص إذا كان فارغًا
    const insertTemplate = (templateContent) => {
        setContent(prev => {
            const textarea = document.querySelector('.mde-text');
            if (textarea && textarea.selectionStart !== undefined) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                return prev.slice(0, start) + templateContent + prev.slice(end);
            }
            return templateContent;
        });
    };
    // أمر مخصص للزر
    const customCommands = [
        {
            name: 'image',
            icon: () => <span role="img" aria-label="صورة">🖼️</span>,
            execute: () => fileInputRef.current.click()
        }
    ];
    return (
        <>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{t.editNote}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.noteOnTask} "{taskDescription}"</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onNavigate && currentIndex > 0 && onNavigate(currentIndex - 1)}
                        disabled={!onNavigate || currentIndex === 0}
                        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                        title={lang === 'ar' ? 'السابق' : 'Previous'}
                    >
                        ◀
                    </button>
                    <button
                        onClick={() => onNavigate && currentIndex < notes.length - 1 && onNavigate(currentIndex + 1)}
                        disabled={!onNavigate || currentIndex === notes.length - 1}
                        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                        title={lang === 'ar' ? 'التالي' : 'Next'}
                    >
                        ▶
                    </button>
                </div>
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                    <label htmlFor="note-title-editor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.noteTitle}</label>
                    <input id="note-title-editor" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                {/* واجهة تعديل التاجات السريع */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.keywords}</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {tag}
                                <button type="button" className="ml-1 text-blue-500 hover:text-red-500" onClick={() => handleRemoveTag(tag)}>×</button>
                            </span>
                        ))}
                    </div>
                    <input type="text" placeholder={lang === 'ar' ? 'أضف تاجًا جديدًا' : 'Add new tag'} onKeyDown={handleAddTag} className="p-2 border rounded-md w-full dark:bg-gray-700" />
                </div>
                {/* قائمة ربط المهمة */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.task || 'المهمة المرتبطة'}</label>
                    <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700">
                        {allTasks.map(task => (
                            <option key={task.id} value={task.id}>{task.title?.[lang] || task.id}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.noteContent}</label>
                    <ReactMde
                        value={content}
                        onChange={setContent}
                        selectedTab={selectedTab}
                        onTabChange={setSelectedTab}
                        generateMarkdownPreview={markdown => Promise.resolve(converter.makeHtml(markdown))}
                        childProps={{
                            writeButton: { 'aria-label': 'Write' },
                            previewButton: { 'aria-label': 'Preview' }
                        }}
                        l18n={{
                            write: lang === 'ar' ? 'كتابة' : 'Write',
                            preview: lang === 'ar' ? 'معاينة' : 'Preview'
                        }}
                        minEditorHeight={120}
                        minPreviewHeight={120}
                        style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                        toolbarCommands={[
                            ['bold', 'italic', 'strikethrough', 'link', 'image'],
                        ]}
                        commands={{
                            image: customCommands[0]
                        }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 flex flex-row-reverse">
                <button onClick={handleSave} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    {t.saveNote}
                </button>
                <button onClick={() => setModal({isOpen: false, content: null})} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                    {t.cancel}
                </button>
                 <button onClick={onDelete} type="button" className="mr-auto px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800">
                    {t.deleteNote}
                </button>
            </div>
            {!note.title && (
                <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اختر قالب:</label>
                    <select value={template} onChange={e => setTemplate(e.target.value)} className="mt-1 w-full p-2 border rounded">
                        <option value="">بدون قالب</option>
                        <option value="video">ملخص فيديو</option>
                        <option value="tool">تحليل أداة</option>
                    </select>
                </div>
            )}
            <div className="mb-2 flex flex-wrap gap-2">
                {templates.map((tpl, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs border border-blue-200"
                        style={{direction: lang === 'ar' ? 'rtl' : 'ltr'}}
                        onClick={() => insertTemplate(tpl.content)}
                        title={tpl.label}
                    >
                        {tpl.label}
                    </button>
                ))}
            </div>
        </>
    );
}

export default NoteEditor;
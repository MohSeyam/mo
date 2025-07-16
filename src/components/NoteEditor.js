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
        onSave({ title, content, keywords: tags, taskId: selectedTaskId, taskData: selectedTask, templateType: template });
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
    // --- قوالب احترافية مع نوع القالب ---
    const templates = [
        // قوالب سيبرانية
        {
            label: 'تقرير حادث أمني',
            templateType: 'cyber',
            content: `# تقرير حادث أمني

| العنصر              | التفاصيل                |
|---------------------|-------------------------|
| التاريخ             |                         |
| الموقع/النظام       |                         |
| نوع الحادث          |                         |
| مستوى الخطورة       | منخفض/متوسط/مرتفع       |
| وصف الحادث          |                         |
| الإجراءات المتخذة   |                         |
| الجهات المشاركة     |                         |
| التوصيات            |                         |
| التاريخ/الوقت       |                         |
`
        },
        {
            label: 'تحليل ثغرة أمنية',
            templateType: 'cyber',
            content: `# تحليل ثغرة أمنية

**اسم الثغرة:**
**الرقم المرجعي (CVE):**
**الوصف:**
**تأثيرها:**
**كيفية الاستغلال:**
**الأنظمة المتأثرة:**
**درجة الخطورة:**
**طرق الكشف:**
**طرق الحماية/الترقيع:**
**مصادر:**
`
        },
        {
            label: 'مذكرة اختبار اختراق',
            templateType: 'cyber',
            content: `# مذكرة اختبار اختراق

## النطاق
- الأنظمة/العناوين:
- الأدوات المستخدمة:

## خطوات التنفيذ
1. 
2. 

## النتائج
- الثغرات المكتشفة:
- توصيات:

## ملاحظات إضافية
`
        },
        {
            label: 'ملخص دورة/شهادة',
            templateType: 'cyber',
            content: `# ملخص دورة/شهادة

| العنصر            | التفاصيل         |
|-------------------|------------------|
| اسم الدورة/الشهادة|                  |
| الجهة             |                  |
| المحتوى الأساسي   |                  |
| المهارات المكتسبة |                  |
| ملاحظات           |                  |
`
        },
        {
            label: 'مراجعة أداة أمنية',
            templateType: 'cyber',
            content: `# مراجعة أداة أمنية

**اسم الأداة:**
**الغرض:**
**المميزات:**
**العيوب:**
**أوامر مهمة:**
**رابط رسمي:**
`
        },
        {
            label: 'خطة استجابة للحوادث',
            templateType: 'cyber',
            content: `# خطة استجابة للحوادث

1. التحضير (تدريب، تجهيز الأدوات)
2. الكشف والتحليل (تحديد الحادث، جمع الأدلة)
3. الاحتواء (عزل الأنظمة المتأثرة)
4. الاستئصال (إزالة التهديد)
5. الاستعادة (إرجاع الأنظمة للعمل)
6. الدروس المستفادة (تحديث السياسات)
`
        },
        {
            label: 'مذكرة تحليل برمجية خبيثة',
            templateType: 'cyber',
            content: `# مذكرة تحليل برمجية خبيثة

| العنصر         | التفاصيل         |
|----------------|------------------|
| اسم الملف      |                  |
| نوع البرمجية   |                  |
| سلوكها         |                  |
| طرق الانتشار   |                  |
| طرق الحماية    |                  |
| أدوات التحليل  |                  |
`
        },
        {
            label: 'مخطط اختبار اجتماعي',
            templateType: 'cyber',
            content: `# مخطط اختبار اجتماعي

**الهدف:**
**السيناريوهات:**
**النتائج المتوقعة:**
**الملاحظات:**
`
        },
        {
            label: 'مذكرة تحليل شبكة',
            templateType: 'cyber',
            content: `# مذكرة تحليل شبكة

| العنصر      | التفاصيل         |
|-------------|------------------|
| النطاق      |                  |
| الأدوات     |                  |
| النتائج     |                  |
| الملاحظات   |                  |
`
        },
        {
            label: 'مذكرة مراجعة كود',
            templateType: 'cyber',
            content: `# مذكرة مراجعة كود

**المشروع:**
**النطاق:**
**الثغرات المحتملة:**
**التوصيات:**
**ملاحظات:**
`
        },
        // قوالب سياسات أمنية
        {
            label: 'سياسة كلمة المرور',
            templateType: 'policy',
            content: `# سياسة كلمة المرور

- يجب أن تتكون كلمة المرور من 12 حرفًا على الأقل.
- يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز.
- تغيير كلمة المرور كل 90 يومًا.
- عدم مشاركة كلمة المرور مع أي شخص.
- تفعيل المصادقة الثنائية إن أمكن.
`
        },
        {
            label: 'سياسة استخدام البريد الإلكتروني',
            templateType: 'policy',
            content: `# سياسة استخدام البريد الإلكتروني

- يمنع فتح الروابط المشبوهة.
- يمنع تحميل المرفقات من مصادر غير موثوقة.
- الإبلاغ عن أي رسائل تصيد.
- استخدام البريد الرسمي فقط للأعمال.
`
        },
        {
            label: 'سياسة الأجهزة المحمولة',
            templateType: 'policy',
            content: `# سياسة الأجهزة المحمولة

- تفعيل القفل التلقائي للجهاز.
- استخدام التشفير.
- عدم تثبيت تطبيقات غير موثوقة.
- الإبلاغ عن فقدان الجهاز فورًا.
- تحديث النظام والتطبيقات باستمرار.
`
        },
        {
            label: 'سياسة الوصول للأنظمة',
            templateType: 'policy',
            content: `# سياسة الوصول للأنظمة

- منح الصلاحيات حسب الحاجة فقط (Least Privilege).
- مراجعة الصلاحيات بشكل دوري.
- إلغاء صلاحيات الموظفين المنتهية خدمتهم فورًا.
- تسجيل الدخول والخروج من الأنظمة.
`
        },
        // قوالب مهارات ناعمة
        {
            label: 'تقييم مهارة التواصل',
            templateType: 'soft',
            content: `# تقييم مهارة التواصل

**الموقف:**
**ما الذي سار بشكل جيد؟**
**ما الذي يمكن تحسينه؟**
**خطة التحسين:**
**أمثلة عملية:**
`
        },
        {
            label: 'خطة تطوير مهارة القيادة',
            templateType: 'soft',
            content: `# خطة تطوير مهارة القيادة

- نقاط القوة الحالية:
- نقاط الضعف:
- أهداف التطوير:
- خطوات عملية:
- متابعة وتقييم:
`
        },
        {
            label: 'مذكرة إدارة الوقت',
            templateType: 'soft',
            content: `# مذكرة إدارة الوقت

| المهمة         | الأولوية | الوقت المتوقع | الوقت الفعلي | ملاحظات |
|---------------|----------|---------------|--------------|---------|
|               |          |               |              |         |

**العقبات:**
**خطوات التحسين:**
`
        },
        {
            label: 'تقييم العمل الجماعي',
            templateType: 'soft',
            content: `# تقييم العمل الجماعي

**المشروع:**
**دورك:**
**ما الذي نجح؟**
**ما الذي يمكن تحسينه؟**
**خطة التحسين:**
`
        },
        {
            label: 'خطة تطوير مهارة حل المشكلات',
            templateType: 'soft',
            content: `# خطة تطوير مهارة حل المشكلات

- المشكلة:
- التحليل:
- الحلول المقترحة:
- الخطة التنفيذية:
- التقييم والمتابعة:
`
        },
        // قالب عام
        {
            label: 'ملاحظة عامة',
            templateType: 'general',
            content: `# ملاحظة عامة

- ...
`
        },
    ];
    // إدراج القالب في مكان المؤشر أو استبدال النص إذا كان فارغًا، وتعيين نوع القالب
    const insertTemplate = (templateContent, templateType) => {
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
                        className={`px-2 py-1 rounded text-xs border mr-1 ${tpl.templateType === 'cyber' ? 'bg-blue-100 text-blue-800 border-blue-200' : tpl.templateType === 'policy' ? 'bg-green-100 text-green-800 border-green-200' : tpl.templateType === 'soft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                        style={{direction: lang === 'ar' ? 'rtl' : 'ltr'}}
                        onClick={() => insertTemplate(tpl.content, tpl.templateType)}
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
const fs = require('fs');

// اقرأ محتوى ملف 2.md
let raw = fs.readFileSync('2.md', 'utf8');

// أزل كل backslash قبل أي رمز ما عدا علامات الاقتباس داخل النصوص
raw = raw
  .replace(/\\([\\{}\[\]])/g, '$1') // أزل backslash قبل الأقواس
  .replace(/\\n/g, '\n') // newlines
  .replace(/\\([^\"])/g, '$1'); // أزل أي backslash ليس قبل اقتباس

// احفظ الناتج في ملف جديد
fs.writeFileSync('2_clean.json', raw, 'utf8');
console.log('تم تنظيف الملف بعمق وحفظه في 2_clean.json');
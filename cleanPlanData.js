const fs = require('fs');

// اقرأ محتوى ملف 2.md
let raw = fs.readFileSync('2.md', 'utf8');

// تنظيف backslash الزائدة قبل الأقواس أو علامات الاقتباس أو الحروف
raw = raw
  .replace(/\\\[/g, '[')
  .replace(/\\\]/g, ']')
  .replace(/\\\{/g, '{')
  .replace(/\\\}/g, '}')
  .replace(/\\"/g, '"')
  .replace(/\\n/g, '\n');

// احفظ الناتج في ملف جديد
fs.writeFileSync('2_clean.json', raw, 'utf8');
console.log('تم تنظيف الملف وحفظه في 2_clean.json');
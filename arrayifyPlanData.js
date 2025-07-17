const fs = require('fs');

// اقرأ محتوى ملف 2_clean.json
const raw = fs.readFileSync('2_clean.json', 'utf8');

// اجمع جميع الكائنات المتتالية في مصفوفة
const objects = raw
  .split(/\n(?=\{)/) // يفصل عند كل بداية كائن جديد في سطر جديد
  .map(obj => obj.trim())
  .filter(obj => obj.length > 0);

const arrayText = '[
' + objects.join(',
') + '
]';

fs.writeFileSync('2_array.json', arrayText, 'utf8');
console.log('تم جمع جميع الكائنات في مصفوفة وحفظها في 2_array.json');
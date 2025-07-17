const fs = require('fs');

// اقرأ كل النص
const raw = fs.readFileSync('2_array.json', 'utf8');

// اجمع كل الكائنات أو المصفوفات في مصفوفة واحدة
const objects = [];
let buffer = '';
let depth = 0;
for (let i = 0; i < raw.length; i++) {
  const char = raw[i];
  if (char === '{' || char === '[') depth++;
  if (char === '}' || char === ']') depth--;
  buffer += char;
  if (depth === 0 && buffer.trim()) {
    try {
      const obj = JSON.parse(buffer);
      if (Array.isArray(obj)) {
        objects.push(...obj);
      } else {
        objects.push(obj);
      }
    } catch (e) {
      // تجاهل الكائنات غير الصالحة
    }
    buffer = '';
  }
}

// اكتب الناتج في ملف جديد
fs.writeFileSync('2_final.json', JSON.stringify(objects, null, 2), 'utf8');
console.log('تم تصحيح الملف وحفظه في 2_final.json');
const fs = require('fs');

// اقرأ محتوى ملف 2_array.json
const raw = fs.readFileSync('2_array.json', 'utf8');

let planData;
try {
  planData = JSON.parse(raw);
} catch (e) {
  console.error('تعذر تحويل النص إلى JSON. تحقق من تنسيق الملف.');
  console.error(e);
  process.exit(1);
}

// حضّر النص النهائي
const output = `const planData = ${JSON.stringify(planData, null, 2)};\n\nexport default planData;\n`;

// اكتب الناتج في src/components/planData.js
fs.writeFileSync('src/components/planData.js', output, 'utf8');

console.log('تم تحويل الخطة بنجاح إلى src/components/planData.js');
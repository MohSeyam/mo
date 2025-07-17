const fs = require('fs');

// اقرأ محتوى ملف 2.md
const raw = fs.readFileSync('2.md', 'utf8');

// حاول تصحيح الأقواس إذا كان هناك \[ أو \] أو اقتباسات زائدة
let json = raw
  .replace(/\\n/g, '') // إزالة newlines الزائدة
  .replace(/\\"/g, '"') // تصحيح الاقتباسات
  .replace(/\\\[/g, '[').replace(/\\\]/g, ']') // تصحيح الأقواس المربعة
  .replace(/\\\{/g, '{').replace(/\\\}/g, '}'); // تصحيح الأقواس المعقوفة

// حاول تحويل النص إلى كائن جافاسكريبت
let planData;
try {
  planData = JSON.parse(json);
} catch (e) {
  console.error('تعذر تحويل النص إلى JSON. تحقق من تنسيق الملف.');
  console.error(e);
  process.exit(1);
}

// إذا كان الكائن ليس مصفوفة، ضعه داخل مصفوفة
if (!Array.isArray(planData)) {
  planData = [planData];
}

// حضّر النص النهائي
const output = `const planData = ${JSON.stringify(planData, null, 2)};\n\nexport default planData;\n`;

// اكتب الناتج في src/components/planData.js
fs.writeFileSync('src/components/planData.js', output, 'utf8');

console.log('تم تحويل الخطة بنجاح إلى src/components/planData.js');
#!/bin/bash
for i in {1..8}
do
  cp 2_$i.md 2.md
  node deepCleanPlanData.js
  mv 2_clean.json 2_clean_$i.json
done
echo "تم تنظيف جميع الأجزاء وحفظها في 2_clean_1.json ... 2_clean_8.json"
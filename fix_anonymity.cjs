const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

content = content.replace(
  /<option value="czesto">Przełożony \/ Ścisła współpraca \(często\)<\/option>/g,
  '<option value="czesto">Ścisła, bieżąca współpraca (bardzo często)</option>'
);

content = content.replace(
  /<option value="okazjonalnie">Regularna współpraca \(np\. raz w tygodniu\)<\/option>/g,
  '<option value="okazjonalnie">Regularna współpraca (np. raz w tygodniu)</option>' // unchanged, but let's be explicit
);

content = content.replace(
  /<option value="rzadko">Sporadyczna współpraca \(np\. raz w miesiącu\)<\/option>/g,
  '<option value="rzadko">Sporadyczna współpraca (np. raz w miesiącu lub rzadziej)</option>'
);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Fixed anonymity in survey context");

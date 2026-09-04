const fs = require('fs');

let surveyQs = fs.readFileSync('src/data/surveyQuestions.ts', 'utf8');

surveyQs = surveyQs.replace(
  /\{ score: 11, shortLabel: 'Kosmos \(11\/10\)', summary: 'Jest tak zajebiście, że brakuje skali\. Pełen zachwyt!' \},/g,
  "{ score: 11, shortLabel: 'Poziom Dokurwienie 👑 (11/10)', summary: 'Jest po prostu zajebiście. Totalny fenomen, jestem w chuj zadowolony i zachwycony poziomem.' },"
);

fs.writeFileSync('src/data/surveyQuestions.ts', surveyQs);
console.log("Updated 11 description");

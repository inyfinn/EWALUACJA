const fs = require('fs');

let content = fs.readFileSync('src/utils/surveyStorage.ts', 'utf8');

// Replace distribution mapping to include 11
content = content.replace(
  /distribution: \{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 \}/g,
  'distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 }'
);

fs.writeFileSync('src/utils/surveyStorage.ts', content);
console.log("Updated surveyStorage.ts to support 11/10");

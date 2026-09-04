const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

const regex = /\{val && \([\s\S]*?Wybrano: \{val\}\/10[\s\S]*?\) \}/;
content = content.replace(regex, '');

// Wait, the string is "{val && (\n <span ... > \n Wybrano: {val}/10 \n </span>\n )}"
// Let's replace precisely:
content = content.replace(
  /\{val && \([\s\S]*?Wybrano: \{val\}\/10[\s\S]*?<\/span>[\s\S]*?\)\}/g,
  ''
);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);

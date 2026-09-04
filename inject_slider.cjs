const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

const regex = /<div className="grid grid-cols-6 sm:grid-cols-11 gap-1 sm:gap-1\.5 mt-2">[\s\S]*?<\/div>/;

if (regex.test(content)) {
  content = content.replace(regex, '<GestureSlider value={val} onChange={(newVal) => handleSelectScore(sq.id, newVal)} sqId={sq.id} />');
  fs.writeFileSync('src/components/SurveyFillView.tsx', content);
  console.log("Successfully replaced the old grid with GestureSlider!");
} else {
  console.log("Failed to find the grid to replace.");
}

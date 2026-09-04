const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// Update GestureSlider props and definition
const oldSliderStart = `const GestureSlider = ({ value, onChange, sqId }: { value: number | undefined, onChange: (val: number) => void, sqId: string }) => {`;
const newSliderStart = `import { ScoreLevelDescription } from '../types';\nconst GestureSlider = ({ value, onChange, sqId, scoreDescriptions }: { value: number | undefined, onChange: (val: number) => void, sqId: string, scoreDescriptions?: ScoreLevelDescription[] }) => {`;

content = content.replace(oldSliderStart, newSliderStart);
content = content.replace(
  `const scoreDesc = value ? SCORE_LEVEL_DESCRIPTIONS.find(d => d.score === value) : null;`,
  `const scoreDesc = value && scoreDescriptions ? scoreDescriptions.find(d => d.score === value) : (value ? SCORE_LEVEL_DESCRIPTIONS.find(d => d.score === value) : null);`
);

// We also need to fix where GestureSlider is rendered
// It looks like: <GestureSlider value={val} onChange={(newVal) => handleSelectScore(sq.id, newVal)} sqId={sq.id} />
// We need to pass scoreDescriptions={q.scoreDescriptions}
// In the mapping `questions.map((q, idx) => { ... q.subQuestions.map(sq => ... ) })`
content = content.replace(
  /<GestureSlider value=\{val\} onChange=\{\(newVal\) => handleSelectScore\(sq\.id, newVal\)\} sqId=\{sq\.id\} \/>/g,
  `<GestureSlider value={val} onChange={(newVal) => handleSelectScore(sq.id, newVal)} sqId={sq.id} scoreDescriptions={q.scoreDescriptions} />`
);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Updated GestureSlider with scoreDescriptions");

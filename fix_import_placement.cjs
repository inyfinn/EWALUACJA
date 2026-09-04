const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// Remove the inline import
content = content.replace("import { ScoreLevelDescription } from '../types';\nconst GestureSlider", "const GestureSlider");

// Ensure it's imported at the top
if (!content.includes('ScoreLevelDescription')) {
  content = content.replace(/import \{ SurveyQuestion \} from '\.\.\/types';/, "import { SurveyQuestion, ScoreLevelDescription } from '../types';");
} else {
  // If it's used elsewhere, just update the top import
  content = content.replace(/import \{ SurveyQuestion \} from '\.\.\/types';/, "import { SurveyQuestion, ScoreLevelDescription } from '../types';");
}

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Fixed import placement");

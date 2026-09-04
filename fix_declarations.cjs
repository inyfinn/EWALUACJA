const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// Remove old handleSelectScore
const oldSelectScoreMatch = content.match(/const handleSelectScore = \(questionId: string, score: number\) => {[\s\S]*?};\n/);
if (oldSelectScoreMatch) {
  content = content.replace(oldSelectScoreMatch[0], '');
}

// Remove old handleToggleFactor
// Let's check where it is:
// const handleToggleFactor = (questionId: string, factor: string) => { ... }
const oldToggleFactorMatch = content.match(/const handleToggleFactor = \(questionId: string, factor: string\) => {[\s\S]*?};\n/);
if (oldToggleFactorMatch && !content.includes('const handleToggleFactor = (subQuestionId')) {
  // It's still needed, don't remove it unless I rewrote it. Actually I didn't rewrite handleToggleFactor.
  // Wait, I didn't redefine handleToggleFactor in my block, so I should leave it.
}

// Remove old handlePrevStep
const oldPrevMatch = content.match(/const handlePrevStep = \(\) => {[\s\S]*?};\n/);
if (oldPrevMatch) {
  // Replace the first occurrence only?
  content = content.replace(oldPrevMatch[0], '');
}

// Remove old handleNextStep
const oldNextMatch = content.match(/const handleNextStep = \(\) => {[\s\S]*?};\n/);
if (oldNextMatch) {
  content = content.replace(oldNextMatch[0], '');
}

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Fixed declarations");

const fs = require('fs');

let fillView = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// Fix saveResponse call
const oldHandleSubmit = `const res = saveResponse(
      tokenInput,
      answers,
      selectedFactors,
      dimensionComments,
      collaborationContext,
      teamRelation
    );`;

const newHandleSubmit = `const res = saveResponse({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tokenUsed: tokenInput || 'PREVIEW',
      answers,
      selectedFactors,
      dimensionComments,
      collaborationContext,
      teamRelation
    });`;

fillView = fillView.replace(oldHandleSubmit, newHandleSubmit);
fs.writeFileSync('src/components/SurveyFillView.tsx', fillView);
console.log("Fixed saveResponse in SurveyFillView");

let reportView = fs.readFileSync('src/components/ReportDashboard.tsx', 'utf8');
// Fix trim() error in ReportDashboard.tsx
reportView = reportView.replace(/c\.trim\(\)\.length/g, '(typeof c === "string" ? c.trim().length : 0)');
fs.writeFileSync('src/components/ReportDashboard.tsx', reportView);
console.log("Fixed trim error in ReportDashboard");

let surveyQs = fs.readFileSync('src/data/surveyQuestions.ts', 'utf8');
surveyQs = surveyQs.replace(/dimension: 'organizacja',/g, "dimension: 'terminowosc',");
fs.writeFileSync('src/data/surveyQuestions.ts', surveyQs);
console.log("Fixed DimensionKey in surveyQuestions");


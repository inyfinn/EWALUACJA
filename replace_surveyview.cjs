const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

// 1. Add dimensionComments state
content = content.replace(
  /const \[selectedFactors, setSelectedFactors\] = useState<Record<string, string\[\]>>\({}\);/,
  `const [selectedFactors, setSelectedFactors] = useState<Record<string, string[]>>({});\n  const [dimensionComments, setDimensionComments] = useState<Record<string, string>>({});`
);

// 2. Change context options
content = content.replace(
  /<option value="czesto">Codziennie \/ Bardzo często<\/option>\s*<option value="okazjonalnie">Okazjonalnie \(kilka razy w miesiącu\)<\/option>\s*<option value="rzadko">Rzadko \(sporadyczny kontakt\)<\/option>/,
  `<option value="czesto">Przełożony / Ścisła współpraca (często)</option>\n                  <option value="okazjonalnie">Regularna współpraca (np. raz w tygodniu)</option>\n                  <option value="rzadko">Sporadyczna współpraca (np. raz w miesiącu)</option>`
);

// 3. Update handleSubmit
content = content.replace(
  /answers,\n\s*selectedFactors,\n\s*collaborationContext,/,
  `answers,\n      selectedFactors,\n      dimensionComments,\n      collaborationContext,`
);

// 4. In Step 5 (Summary), render average score and comment
// Search for score rendering in summary
const summaryBlockStart = `const score = answers\\[q.id\\];`;
content = content.replace(/const score = answers\[q\.id\];/g, `
              const subScores = q.subQuestions.map(sq => answers[sq.id]).filter(s => s !== undefined);
              const score = subScores.length > 0 ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length) : 0;
`);

// Add comment to summary
content = content.replace(
  /<\/ul>\n\s*\)}\n\s*<\/div>/g,
  `</ul>\n                    )}\n                    {dimensionComments[q.id] && (\n                      <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 italic">"{dimensionComments[q.id]}"</div>\n                    )}\n                  </div>`
);


// 5. Update PDF summary
content = content.replace(/<div className="text-xs mt-1 font-bold">Ocena: \{answers\[q\.id\]\}\/10<\/div>/g, 
  `<div className="text-xs mt-1 font-bold">Średnia ocena z wymiaru: {Math.round(q.subQuestions.map(sq => answers[sq.id]).reduce((a, b) => a + b, 0) / 3)}/10</div>`
);


// 6. Rewrite Question rendering block (from `if (surveyStage === 'question') {` to the end of that block)
// This is the hardest part. Let's do it via regex matching the block.

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Updated basic parts of SurveyFillView.tsx");

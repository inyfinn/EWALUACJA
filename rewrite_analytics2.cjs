const fs = require('fs');
let content = fs.readFileSync('src/utils/surveyStorage.ts', 'utf8');

const startStr = '  // Process responses';
const endStr = '  // Calculate averages per dimension';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  const replacement = `  // Process responses
  responses.forEach(resp => {
    questions.forEach(q => {
      // Calculate respondent's average for this dimension based on the 3 sub-questions
      const subScores = q.subQuestions.map(sq => resp.answers[sq.id]).filter(s => s !== undefined);
      let score = undefined;
      
      if (subScores.length > 0) {
        const avgScoreRaw = subScores.reduce((acc, val) => acc + val, 0) / subScores.length;
        score = Math.round(avgScoreRaw); // Round to nearest int for distribution (1-10)

        initialStats[q.dimension].distribution[score] = (initialStats[q.dimension].distribution[score] || 0) + 1;
        initialStats[q.dimension].totalVotes += 1;
        totalScoreSum += score;
        totalScoreCount += 1;
      }

      // Selected behavioral factors
      const factors = resp.selectedFactors?.[q.id] || [];
      factors.forEach(f => {
        factorTallies[q.dimension][f] = (factorTallies[q.dimension][f] || 0) + 1;

        if (score !== undefined && score >= 7) {
          globalDriversTally[f] = (globalDriversTally[f] || 0) + 1;
        } else if (score !== undefined && score < 7) {
          globalImprovementsTally[f] = (globalImprovementsTally[f] || 0) + 1;
        }
      });
    });
  });

`;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/utils/surveyStorage.ts', content);
  console.log("Success");
} else {
  console.log("Could not find delimiters");
}

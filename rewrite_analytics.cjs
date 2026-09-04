const fs = require('fs');
let content = fs.readFileSync('src/utils/surveyStorage.ts', 'utf8');

const analyticsStart = 'responses.forEach(resp => {';
const analyticsEnd = '  // Calculate averages per dimension';

const replacement = `responses.forEach(resp => {
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

content = content.replace(new RegExp(analyticsStart.replace(/[.*+?^$\{key\}()|[\\]\\]/g, '\\$&') + '[\\s\\S]*?' + analyticsEnd.replace(/[.*+?^$\{key\}()|[\\]\\]/g, '\\$&')), replacement + analyticsEnd);

fs.writeFileSync('src/utils/surveyStorage.ts', content);
console.log("Updated analytics loop");

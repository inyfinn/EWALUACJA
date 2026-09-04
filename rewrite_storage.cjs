const fs = require('fs');
let content = fs.readFileSync('src/utils/surveyStorage.ts', 'utf8');

// Update to v5
content = content.replace(/_v4/g, '_v5');

// Replace demo generator
const demoRegex = /export function initializeDemoResponses\(\): SurveyResponse\[\] \{[\s\S]*?^}/m;
const newDemo = `export function initializeDemoResponses(): SurveyResponse[] {
  return [
    {
      id: 'resp_seed_1',
      createdAt: new Date().toISOString(),
      tokenUsed: 'KUB-1DEMO',
      answers: {
        kom_1_task: 10, kom_1_perception: 10, kom_1_relation: 10,
        term_1_task: 10, term_1_perception: 10, term_1_relation: 10,
        jak_1_task: 10, jak_1_perception: 10, jak_1_relation: 10,
        wklad_1_task: 10, wklad_1_perception: 10, wklad_1_relation: 10,
      },
      selectedFactors: {
        kom_1: [
          'Naprawdę świetnie mi się z nim współpracuje – jest życzliwy, pomocny i buduje świetną atmosferę',
          'Zawsze jasno, konkretnie i bez niedomówień formułuje ustalenia',
          'Doskonale słucha innych, szanuje odmienne zdanie i jest w 100% otwarty na dialog'
        ],
        term_1: [
          'Zawsze domyka terminy, nawet pod bardzo dużą presją czasu',
          'Zadania są często gotowe przed wyznaczonym czasem – przerasta pod tym względem oczekiwania'
        ],
        jak_1: [
          'Naprawdę rzetelnie, skrupulatnie i dokładnie wykonuje swoją pracę',
          'Samodzielnie wyszukuje i eliminuje błędy zanim dotrą do odbiorcy lub przełożonego'
        ],
        wklad_1: [
          'Stara się i wkłada mnóstwo serca oraz autentycznego zaangażowania w pracę',
          'Prawdziwy filar i motor napędowy dobrej energii – w wielu aspektach przerasta oczekiwania'
        ],
      },
      dimensionComments: {
        kom_1: 'Pełen profesjonalizm i świetny kontakt na co dzień.',
        wklad_1: 'Niezastąpiony członek zespołu, wspaniała inicjatywa.'
      },
      collaborationContext: 'czesto',
      teamRelation: 'ten_sam_zespol',
    }
  ];
}`;

content = content.replace(demoRegex, newDemo);

fs.writeFileSync('src/utils/surveyStorage.ts', content);
console.log("Updated storage storage demo");

const fs = require('fs');

let storage = fs.readFileSync('src/utils/surveyStorage.ts', 'utf8');

// Update return type
storage = storage.replace(
  /keyTalkingPoints: string\[\];/g,
  `keyTalkingPoints: string[];
  employeeArchetype: { title: string; description: string; };
  competencyProfile: { relational: number; execution: number; quality: number; initiative: number; };`
);

// Update initial state in default return (when responses.length === 0)
storage = storage.replace(
  /keyTalkingPoints: \[\n[\s\S]*?\],\n    \};/g,
  `keyTalkingPoints: [
        'Ankieta jest gotowa do rozesłania współpracownikom w firmie Kubara Sp. z o.o.',
        'W zakładce „Kody Zaproszeń” znajdziesz gotowe, indywidualne linki i kody dla zespołu.',
        'Gdy współpracownicy oddadzą pierwsze głosy, raport automatycznie wyliczy średnie i podsumowanie.',
      ],
      employeeArchetype: { title: 'Brak danych', description: 'Oczekujemy na głosy...' },
      competencyProfile: { relational: 0, execution: 0, quality: 0, initiative: 0 },
    };`
);

// Compute competencies and archetype
const newLogic = `
  // Compute Competencies (0-100) based on max possible score of 11.
  // Actually, average is out of 10 or 11. Let's cap at 10 for percentage so 11 is "off the charts"
  const relational = Math.min(100, Math.round((initialStats.komunikacja.average / 10) * 100));
  const execution = Math.min(100, Math.round((initialStats.terminowosc.average / 10) * 100));
  const quality = Math.min(100, Math.round((initialStats.jakosc.average / 10) * 100));
  const initiative = Math.min(100, Math.round((initialStats.wklad_wlasny.average / 10) * 100));

  const maxVal = Math.max(relational, execution, quality, initiative);
  let archetypeTitle = '';
  let archetypeDesc = '';

  if (overallAvg >= 9.5) {
    archetypeTitle = 'Diament Zespołu (Kompletny Ekspert)';
    archetypeDesc = 'Pracownik o najwyższych, wybitnych notach we wszystkich wymiarach. Stanowi wzór i ogromną wartość dodaną dla firmy.';
  } else if (overallAvg < 5) {
    archetypeTitle = 'Osoba Wymagająca Wsparcia';
    archetypeDesc = 'Wyniki wskazują na pilną potrzebę wdrożenia planu naprawczego i bezpośredniego mentoringu we wszystkich obszarach.';
  } else {
    // Determine main strength
    if (initiative === maxVal && initiative >= 70) {
      archetypeTitle = 'Innowator i Motor Napędowy';
      archetypeDesc = 'Osoba z ogromną energią, która chętnie wychodzi z własną inicjatywą i wprowadza pozytywne zmiany do procesów.';
    } else if (execution === maxVal && execution >= 70) {
      archetypeTitle = 'Perfekcyjny Egzekutor';
      archetypeDesc = 'Niezawodny i świetnie zorganizowany profesjonalista. Dowozi zadania na czas, nawet pod presją wielu wątków.';
    } else if (relational === maxVal && relational >= 70) {
      archetypeTitle = 'Spoiwo Zespołu (Lider Relacji)';
      archetypeDesc = 'Buduje genialną atmosferę, rozwiązuje konflikty i dba o przejrzystą, bezstresową komunikację między działami.';
    } else if (quality === maxVal && quality >= 70) {
      archetypeTitle = 'Gwarant Najwyższej Jakości';
      archetypeDesc = 'Jego praca nie wymaga poprawek. Bardzo skrupulatny, dokładny ekspert w swoim obszarze.';
    } else {
      archetypeTitle = 'Stabilny Współpracownik';
      archetypeDesc = 'Pracownik o bardzo wyrównanym profilu. Spełnia swoje obowiązki stabilnie i rzetelnie we wszystkich płaszczyznach.';
    }
  }

  return {
    overallAverage: overallAvg,
    overallAverage5: overallAvg5,
    totalResponses: responses.length,
    dimensions: initialStats,
    readyForManagerMeeting: responses.length >= 3,
    salaryReadinessScore: salaryReadiness,
    topGlobalDrivers,
    topImprovementGlobal,
    keyTalkingPoints,
    employeeArchetype: { title: archetypeTitle, description: archetypeDesc },
    competencyProfile: { relational, execution, quality, initiative }
  };
`;

storage = storage.replace(/return \{\n    overallAverage: overallAvg,[\s\S]*?\};\n\}/g, newLogic + "\n}");

fs.writeFileSync('src/utils/surveyStorage.ts', storage);
console.log("Updated analytics in storage");

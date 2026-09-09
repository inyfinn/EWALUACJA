import { SurveyQuestion, SurveyResponse, VoterToken, DimensionStats, DimensionKey, FactorCount } from '../types';
import { DEFAULT_QUESTIONS } from '../data/surveyQuestions';

const STORAGE_KEYS = {
  TOKENS: 'kubara_eval_tokens_v6',
  RESPONSES: 'kubara_eval_responses_v6',
  CONFIG: 'kubara_eval_config_v6',
  CURRENT_TOKEN: 'kubara_eval_current_token_v6',
  CUSTOM_BASE_URL: 'kubara_eval_base_url_v6',
};

// Immediately wipe any old mock/seed data from previous versions in browser
if (typeof window !== 'undefined') {
  try {
    ['kubara_eval_responses_v5', 'kubara_eval_tokens_v5', 
     'kubara_eval_responses_v4', 'kubara_eval_tokens_v4',
     'kubara_eval_responses_v3', 'kubara_eval_tokens_v3',
     'kubara_eval_responses_v2', 'kubara_eval_tokens_v2',
     'kubara_eval_responses_v1', 'kubara_eval_tokens_v1'
    ].forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // ignore
  }
}

// Generate random safe 6-character alphanumeric code (e.g. KUB-842)
export function generateTokenCode(index: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KUB-${index + 1}${rand}`;
}

export function initializeDefaultTokens(cleanState: boolean = true): VoterToken[] {
  const initialLabels = [
    'Współpracownik 1 (Dział Produkcji / Technologii)',
    'Współpracownik 2 (Dział Handlowy / B2B)',
    'Współpracownik 3 (Logistyka / Magazyn)',
    'Współpracownik 4 (Dział Jakości i Certyfikacji)',
    'Współpracownik 5 (Finanse / Administracja)',
    'Współpracownik 6 (Projekt międzywydziałowy)',
    'Współpracownik 7 (Współpracownik kluczowy)',
    'Współpracownik 8 (Dział Obsługi Klienta)',
  ];

  return initialLabels.map((label, idx) => ({
    id: `token_${idx + 1}_${Date.now()}`,
    code: generateTokenCode(idx),
    label,
    used: false,
  }));
}

export function initializeDefaultResponses(): SurveyResponse[] {
  // Strictly empty - no fake or demo data
  return [];
}

export function getStoredTokens(): VoterToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!raw) {
      const initial = initializeDefaultTokens(true);
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading tokens from localStorage', e);
    return initializeDefaultTokens(true);
  }
}

export function saveTokens(tokens: VoterToken[]) {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
}

export function getStoredResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    if (!raw) {
      const initial = initializeDefaultResponses();
      localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading responses from localStorage', e);
    return [];
  }
}

export function saveResponse(response: SurveyResponse): { success: boolean; error?: string } {
  const tokens = getStoredTokens();
  const token = tokens.find(t => t.code.trim().toUpperCase() === response.tokenUsed.trim().toUpperCase());

  // Allow preview demo token
  if (response.tokenUsed.trim().toUpperCase() === 'PODGLAD' || response.tokenUsed.trim().toUpperCase() === 'PREVIEW') {
    const responses = getStoredResponses();
    responses.push(response);
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Nieprawidłowy kod jednorazowy. Sprawdź czy wpisałeś poprawny kod zaproszenia.' };
  }

  if (token.used) {
    return { success: false, error: 'Ten kod jednorazowy został już wcześniej wykorzystany do oddania głosu. Każda osoba może wypełnić ankietę tylko 1 raz.' };
  }

  // Mark token as used
  token.used = true;
  token.usedAt = new Date().toISOString();
  token.responseId = response.id;
  saveTokens(tokens);

  const responses = getStoredResponses();
  responses.push(response);
  localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));

  return { success: true };
}

export function addCustomToken(label: string): VoterToken {
  const tokens = getStoredTokens();
  const newToken: VoterToken = {
    id: `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    code: generateTokenCode(tokens.length),
    label: label.trim() || `Współpracownik ${tokens.length + 1}`,
    used: false,
  };
  tokens.push(newToken);
  saveTokens(tokens);
  return newToken;
}

export function deleteToken(id: string) {
  const tokens = getStoredTokens().filter(t => t.id !== id);
  saveTokens(tokens);
}

export function clearAllResponses() {
  localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify([]));
  const tokens = getStoredTokens().map(t => ({
    ...t,
    used: false,
    usedAt: undefined,
    responseId: undefined,
  }));
  saveTokens(tokens);
}

// Base URL resolution for survey links (ensures links do not require Google login)
export interface SurveyBaseUrlInfo {
  url: string;
  mode: 'shared' | 'dev' | 'custom';
  isAiStudioDev: boolean;
  defaultDevUrl: string;
  publicSharedUrl: string;
  customUrl: string;
}

export function getSurveyBaseUrlInfo(): SurveyBaseUrlInfo {
  if (typeof window === 'undefined') {
    return {
      url: '',
      mode: 'dev',
      isAiStudioDev: false,
      defaultDevUrl: '',
      publicSharedUrl: '',
      customUrl: '',
    };
  }

  const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_BASE_URL) || '';
  const storedMode = (localStorage.getItem('kubara_eval_url_mode_v5') as 'shared' | 'dev' | 'custom') || null;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const isAiStudioDev = origin.includes('ais-dev-');

  const defaultDevUrl = `${origin}${pathname}`.replace(/\/+$/, '');
  const publicSharedUrl = isAiStudioDev 
    ? `${origin.replace('ais-dev-', 'ais-pre-')}${pathname}`.replace(/\/+$/, '') 
    : defaultDevUrl;

  // Mode resolution
  let mode: 'shared' | 'dev' | 'custom' = storedMode || (isAiStudioDev ? 'shared' : 'dev');
  if (storedMode === 'custom' && !custom.trim()) {
    mode = isAiStudioDev ? 'shared' : 'dev';
  }

  let resolvedUrl = defaultDevUrl;
  if (mode === 'shared') {
    resolvedUrl = publicSharedUrl;
  } else if (mode === 'custom' && custom.trim()) {
    resolvedUrl = custom.trim().replace(/\/+$/, '');
  } else {
    resolvedUrl = defaultDevUrl;
  }

  return {
    url: resolvedUrl,
    mode,
    isAiStudioDev,
    defaultDevUrl,
    publicSharedUrl,
    customUrl: custom,
  };
}

export function setSurveyUrlMode(mode: 'shared' | 'dev' | 'custom') {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kubara_eval_url_mode_v5', mode);
}

export function setSurveyCustomBaseUrl(url: string | null) {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_BASE_URL);
  } else {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BASE_URL, url.trim().replace(/\/+$/, ''));
    localStorage.setItem('kubara_eval_url_mode_v5', 'custom');
  }
}

// Generate direct URL for a specific token
export function getSurveyUrl(tokenCode: string): string {
  const info = getSurveyBaseUrlInfo();
  const code = tokenCode.trim().toUpperCase();
  if (!info.url) return `?token=${code}`;
  return `${info.url}?token=${code}`;
}

export function validateTokenCode(code: string): { valid: boolean; used: boolean; label?: string; error?: string } {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode === 'PODGLAD' || cleanCode === 'PREVIEW' || cleanCode === 'DEMO') {
    return { valid: true, used: false, label: 'Tryb Podglądu (Test)' };
  }
  const tokens = getStoredTokens();
  const found = tokens.find(t => t.code.toUpperCase() === cleanCode);
  if (!found) {
    return { valid: false, used: false, error: 'Nieprawidłowy kod zaproszenia. Sprawdź czy wpisałeś poprawny kod z wiadomości.' };
  }
  if (found.used) {
    return { valid: true, used: true, label: found.label, error: 'Ten unikalny link został już wcześniej wykorzystany do oddania głosu. Każdy współpracownik może wypełnić ankietę tylko 1 raz.' };
  }
  return { valid: true, used: false, label: found.label };
}

// Calculate 4 Dimensions Analytics with 1-10 Scale and Behavioral Tag Drivers
export function computeDimensionsAnalytics(
  questions: SurveyQuestion[],
  responses: SurveyResponse[]
): {
  overallAverage: number; // Scale 1.0 - 10.0
  overallAverage5: number; // Scale 1.0 - 5.0
  totalResponses: number;
  dimensions: Record<DimensionKey, DimensionStats>;
  readyForManagerMeeting: boolean;
  salaryReadinessScore: number; // 0 - 100
  topGlobalDrivers: FactorCount[];
  topImprovementGlobal: FactorCount[];
  keyTalkingPoints: string[];
  employeeArchetype: { title: string; description: string; };
  competencyProfile: { relational: number; execution: number; quality: number; initiative: number; };
} {
  const dimensionKeys: DimensionKey[] = ['komunikacja', 'terminowosc', 'jakosc', 'wklad_wlasny'];
  const titles: Record<DimensionKey, string> = {
    komunikacja: '1. Komunikacja i relacje',
    terminowosc: '2. Terminowość i niezawodność',
    jakosc: '3. Jakość pracy i samodzielność',
    wklad_wlasny: '4. Wkład własny i inicjatywa',
  };

  const initialStats: Record<DimensionKey, DimensionStats> = {} as any;

  dimensionKeys.forEach(dim => {
    initialStats[dim] = {
      dimension: dim,
      title: titles[dim],
      average: 0,
      averageOutOfFive: 0,
      totalVotes: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 },
      topPositiveFactors: [],
      topImprovementFactors: [],
      businessImpactAnalysis: '',
    };
  });

  if (responses.length === 0) {
    return {
      overallAverage: 0,
      overallAverage5: 0,
      totalResponses: 0,
      dimensions: initialStats,
      readyForManagerMeeting: false,
      salaryReadinessScore: 0,
      topGlobalDrivers: [],
      topImprovementGlobal: [],
      keyTalkingPoints: [],
      employeeArchetype: { title: 'Brak danych', description: 'Oczekujemy na głosy...' },
      competencyProfile: { relational: 0, execution: 0, quality: 0, initiative: 0 },
    };
  }

  // Count factors across all questions
  const factorTallies: Record<DimensionKey, Record<string, number>> = {
    komunikacja: {},
    terminowosc: {},
    jakosc: {},
    wklad_wlasny: {},
  };

  const globalDriversTally: Record<string, number> = {};
  const globalImprovementsTally: Record<string, number> = {};

  let totalScoreSum = 0;
  let totalScoreCount = 0;

  // Process responses
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

        // Categorize by factor's true intrinsic type (high vs mid/low) rather than score
        const isImprovement = q.factors.low.includes(f) || q.factors.mid.includes(f);
        if (isImprovement) {
          globalImprovementsTally[f] = (globalImprovementsTally[f] || 0) + 1;
        } else {
          globalDriversTally[f] = (globalDriversTally[f] || 0) + 1;
        }
      });
    });
  });

  // Calculate averages per dimension
  dimensionKeys.forEach(dim => {
    const d = initialStats[dim];
    let dimSum = 0;
    Object.entries(d.distribution).forEach(([scoreStr, count]) => {
      dimSum += Number(scoreStr) * count;
    });

    d.average = d.totalVotes > 0 ? Number((dimSum / d.totalVotes).toFixed(1)) : 0;
    d.averageOutOfFive = Number((d.average / 2).toFixed(1));

    // Convert factor tallies to sorted list
    const tally = factorTallies[dim];
    const sortedFactors: FactorCount[] = Object.entries(tally)
      .map(([text, count]) => ({
        text,
        count,
        percentage: Math.round((count / responses.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Differentiate positive vs improvement factors based on default definitions
    const q = questions.find(item => item.dimension === dim);
    const lowAndMidList = q ? [...q.factors.mid, ...q.factors.low] : [];

    d.topPositiveFactors = sortedFactors.filter(f => !lowAndMidList.includes(f.text));
    d.topImprovementFactors = sortedFactors.filter(f => lowAndMidList.includes(f.text));

    // Generate constructive impact note
    if (d.average >= 8.5) {
      d.businessImpactAnalysis = `Wybitny filar w firmie Kubara Sp. z o.o. (${d.average}/10). Działania Krzysztofa w tym obszarze znacząco podnoszą efektywność zespołu, minimalizują ryzyko błędów i stanowią mocny argument do rozmowy o awansie i rozwoju.`;
    } else if (d.average >= 7.0) {
      d.businessImpactAnalysis = `Bardzo solidny, wysoki poziom (${d.average}/10). Pełne spełnienie oczekiwań stanowiskowych z wyraźnym zaufaniem współpracowników i przestrzenią do dalszego skalowania.`;
    } else if (d.average >= 5.0) {
      d.businessImpactAnalysis = `Poprawny standard (${d.average}/10). Wskazano kilka cennych wskazówek, których wdrożenie pozwoli osiągnąć jeszcze wyższą płynność współpracy.`;
    } else {
      d.businessImpactAnalysis = `Obszar zidentyfikowany do wspólnego zaplanowania priorytetów z przełożonym (${d.average}/10).`;
    }
  });

  const overallAvg = totalScoreCount > 0 ? Number((totalScoreSum / totalScoreCount).toFixed(1)) : 0;
  const overallAvg5 = Number((overallAvg / 2).toFixed(1));

  // Global top drivers (sorted)
  const topGlobalDrivers: FactorCount[] = Object.entries(globalDriversTally)
    .map(([text, count]) => ({
      text,
      count,
      percentage: Math.round((count / responses.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Global improvement points
  const topImprovementGlobal: FactorCount[] = Object.entries(globalImprovementsTally)
    .map(([text, count]) => ({
      text,
      count,
      percentage: Math.round((count / responses.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Salary & career readiness index (0..100)
  // Higher weight for quality (30%), initiative (30%), timeliness (20%), communication (20%)
  const salaryReadiness = Math.min(
    100,
    Math.round(
      (initialStats.jakosc.average * 3.0 +
        initialStats.wklad_wlasny.average * 3.0 +
        initialStats.terminowosc.average * 2.0 +
        initialStats.komunikacja.average * 2.0) *
        (responses.length >= 3 ? 1 : 0.7)
    )
  );

  const keyTalkingPoints: string[] = [];
  if (overallAvg >= 8.0) {
    keyTalkingPoints.push(`🏆 Wynik ogólny ${overallAvg}/10.0 (${overallAvg5}/5.0) potwierdza wysokie zadowolenie zespołu ze współpracy z Krzysztofem.`);
    keyTalkingPoints.push(`⭐ Najwyżej oceniony filar: ${titles[getHighestDim(initialStats)]} (${initialStats[getHighestDim(initialStats)].average}/10.0).`);
    keyTalkingPoints.push(`📈 Spójny feedback od ${responses.length} współpracowników stanowi mocny, obiektywny materiał do rozmowy o dalszej ścieżce kariery.`);
    if (topImprovementGlobal.length > 0) {
      keyTalkingPoints.push(`💡 Dojrzałość rozwojowa: zidentyfikowano konkretne wskazówki do oszlifowania w drugim roku.`);
    }
  } else {
    keyTalkingPoints.push(`🎯 Średnia ogólna wynosi ${overallAvg}/10.0. Raport ułatwia merytoryczną rozmowę o priorytetach i wsparciu.`);
    keyTalkingPoints.push(`🔍 Najważniejszy wymiar do zaadresowania: ${titles[getLowestDim(initialStats)]}.`);
  }

  
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

}

function getHighestDim(stats: Record<DimensionKey, DimensionStats>): DimensionKey {
  let highest: DimensionKey = 'komunikacja';
  let max = -1;
  (Object.keys(stats) as DimensionKey[]).forEach(k => {
    if (stats[k].average > max) {
      max = stats[k].average;
      highest = k;
    }
  });
  return highest;
}

function getLowestDim(stats: Record<DimensionKey, DimensionStats>): DimensionKey {
  let lowest: DimensionKey = 'komunikacja';
  let min = 999;
  (Object.keys(stats) as DimensionKey[]).forEach(k => {
    if (stats[k].average < min) {
      min = stats[k].average;
      lowest = k;
    }
  });
  return lowest;
}

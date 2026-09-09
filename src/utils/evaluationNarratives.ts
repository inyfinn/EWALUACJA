import { DimensionKey, SurveyQuestion, SurveyResponse } from '../types';
import { DEFAULT_QUESTIONS } from '../data/surveyQuestions';

export interface DimensionNarrativeLevel {
  level: number;
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  sentences: string;
}

export interface DimensionSummaryItem {
  key: DimensionKey;
  title: string;
  emoji: string;
  score: number;
  maxScore: number;
  level: number;
  levelTitle: string;
  sentences: string;
}

export interface OverallEvaluationSummary {
  isFirstSubmission: boolean;
  priorSubmissionsCount: number;
  userTotalScore: number;
  maxTotalScore: number;
  userAverageScore: number;
  favourabilityDiffPercent: number; // e.g. +50 for 50% more favorable, -20 for 20% less
  negativityDiffPercent: number; // capped / normalized percentage
  userNegativeDiffCount: number; // net difference in count, e.g. +2.5 or -1.0
  positivityDiffPercent: number;
  userNegativeCount: number;
  groupAvgNegativeCount: number;
  dimensions: DimensionSummaryItem[];
  cohesiveStory: string;
  overallVerdictTitle: string;
  overallVerdictEmoji: string;
  overallVerdictText: string;
}

// 11 progressive levels (from level 1 = 3 pkt, to level 11 = 33 pkt) for each of the 4 dimensions
export const DIMENSION_NARRATIVES: Record<DimensionKey, DimensionNarrativeLevel[]> = {
  komunikacja: [
    {
      level: 1,
      minScore: 3,
      maxScore: 5,
      title: 'Totalna katastrofa i armata 💥',
      emoji: '💣',
      sentences: 'Oceniasz tę osobę tragicznie pod względem komunikacji – to dla Ciebie kompletna katastrofa i za żadne skarby nie chcesz go w swojej drużynie. Najchętniej wsadziłbyś go w wielką armatę i wystrzelił w daleki kosmos, żeby nie psuł nikomu krwi.',
    },
    {
      level: 2,
      minScore: 6,
      maxScore: 8,
      title: 'Głuchy telefon i toksyczna ściana 🚫',
      emoji: '🤬',
      sentences: 'W codziennych relacjach z nim widzisz ciągły głuchy telefon, fochy i potężny mur nie do przebicia. Każda próba wymiany maili lub ustaleń to dla Ciebie droga przez mękę i totalne marnotrawstwo nerwów.',
    },
    {
      level: 3,
      minScore: 9,
      maxScore: 11,
      title: 'Ciężka droga przez mękę 🛑',
      emoji: '⚠️',
      sentences: 'Wymiana informacji z nim leży i kwiczy, a atmosfera przy wspólnych tematach jest niesamowicie gęsta i napięta. Zdecydowanie wolisz omijać go szerokim łukiem, żeby tylko nie wejść na kolejną niepotrzebną minę.',
    },
    {
      level: 4,
      minScore: 12,
      maxScore: 14,
      title: 'Częste zgrzyty i chaos 📉',
      emoji: '⚡',
      sentences: 'Komunikacja bardzo często szwankuje, maile bywają chaotyczne i wiecznie trzeba po nim dopytywać innych ludzi. Trudno tu mówić o płynnym dialogu, a drobne zgrzyty i niedomówienia to u Was chleb powszedni.',
    },
    {
      level: 5,
      minScore: 15,
      maxScore: 17,
      title: 'Szorstki chłód i rezerwa 🧊',
      emoji: '😐',
      sentences: 'Kontakt z nim oceniasz jako mocno chłodny, do bólu oszczędny i raczej pozbawiony jakiejkolwiek empatii. Nie ma tu otwartej wojny, ale codzienne porozumienie przychodzi z dużym trudem i sporą dawką dystansu.',
    },
    {
      level: 6,
      minScore: 18,
      maxScore: 20,
      title: 'Standardowa poprawność biurowa 📋',
      emoji: '🆗',
      sentences: 'W komunikacji prezentuje poziom poprawny i standardowy – bez wielkich zachwytów, ale też bez ciągłych dramatów. Czasem trzeba ponaglić odpowiedź lub coś dopytać, lecz w gruncie rzeczy da się z nim spokojnie pracować.',
    },
    {
      level: 7,
      minScore: 21,
      maxScore: 23,
      title: 'Kulturalny i uporządkowany dialog 🤝',
      emoji: '🙂',
      sentences: 'Oceniasz go jako kulturalnego i zrównoważonego rozmówcę, z którym na ogół sprawnie załatwia się bieżące sprawy. Wymiana informacji jest uporządkowana i rzadko dochodzi między Wami do poważniejszych nieporozumień.',
    },
    {
      level: 8,
      minScore: 24,
      maxScore: 26,
      title: 'Płynna, zgrana współpraca ✨',
      emoji: '👍',
      sentences: 'Komunikuje się z nim jasno, rzeczowo i w bardzo dobrej atmosferze opartej na wzajemnym szacunku. Jego wiadomości są w punkt, a bieżąca współpraca projektowa przebiega gładko i bez niepotrzebnych tarć.',
    },
    {
      level: 9,
      minScore: 27,
      maxScore: 29,
      title: 'Wysoka dojrzałość i pełne zaufanie 🛡️',
      emoji: '⭐',
      sentences: 'To wysoce dojrzały, opanowany partner w zespole, który potrafi uważnie słuchać i buduje autentyczne zaufanie. Zawsze wiesz, na czym stoisz, a nawet najtrudniejsze tematy wyjaśniacie z uśmiechem, spokojem i klasą.',
    },
    {
      level: 10,
      minScore: 30,
      maxScore: 32,
      title: 'Wzór kultury i spoiwo zespołu 💎',
      emoji: '🌟',
      sentences: 'Wzorowa kultura osobista, bezbłędny kontakt i niezwykły talent do rozładowywania napięć w całym zespole. Praca z nim na co dzień to czysta przyjemność, a jego obecność gwarantuje rewelacyjną atmosferę w pokoju.',
    },
    {
      level: 11,
      minScore: 33,
      maxScore: 33,
      title: 'Chodzące złoto i absolutny fenomen 👑',
      emoji: '👑',
      sentences: 'Absolutne chodzące złoto w relacjach i totalny geniusz komunikacji na poziomie 11/10! Zero kwasów, niesamowita empatia i człowiek, z którym każdy w firmie chciałby siedzieć biurko w biurko każdego dnia.',
    },
  ],

  terminowosc: [
    {
      level: 1,
      minScore: 3,
      maxScore: 5,
      title: 'Czarna dziura terminowa 🕳️',
      emoji: '💣',
      sentences: 'Jeśli chodzi o terminy i dotrzymywanie słowa, to dla Ciebie totalna czarna dziura i gwarancja katastrofy. Powierzenie mu jakiegokolwiek krytycznego terminu kończy się pożarem w całym projekcie i rwaniem włosów z głowy.',
    },
    {
      level: 2,
      minScore: 6,
      maxScore: 8,
      title: 'Permanentny pożar i chaos 🔥',
      emoji: '🚨',
      sentences: 'Notorycznie spóźnia się z zadaniami, a jego obietnice są dla Ciebie warte tyle co zeszłoroczny śnieg. Ciągłe gaszenie pożarów na ostatnią chwilę i organizacyjny rozgardiasz doprowadzają Cię do szewskiej pasji.',
    },
    {
      level: 3,
      minScore: 9,
      maxScore: 11,
      title: 'Wieczne obsuwy i lawina wymówek ⏳',
      emoji: '⚠️',
      sentences: 'Terminowość leży u niego na całej linii i rzadko dowozi cokolwiek na czas bez kilkukrotnych, irytujących ponagleń. Zamiast gotowych efektów na biurku dostajesz zazwyczaj tylko lawinę wymówek i kolejne przekładanie dat.',
    },
    {
      level: 4,
      minScore: 12,
      maxScore: 14,
      title: 'Ciągłe poślizgi harmonogramu 📉',
      emoji: '🐌',
      sentences: 'Jego zadania regularnie łapią niebezpieczne poślizgi, a wyznaczone harmonogramy traktowane są mocno umownie. Musisz nieustannie trzymać rękę na pulsie i pilnować każdego etapu, bo inaczej sprawa ugrzęźnie w martwym punkcie.',
    },
    {
      level: 5,
      minScore: 15,
      maxScore: 17,
      title: 'W kratkę i pod nadzorem 📊',
      emoji: '😐',
      sentences: 'Z terminowością bywa u niego w kratkę – proste tematy idą sprawnie, ale gdy dochodzi presja, terminy zaczynają uciekać. Wymaga stałego przypominania, choć w ostatecznym rozrachunku jakoś domyka sprawy.',
    },
    {
      level: 6,
      minScore: 18,
      maxScore: 20,
      title: 'Standardowa poprawność czasowa ⏱️',
      emoji: '🆗',
      sentences: 'Działa na przyzwoitym, standardowym poziomie terminowości i zazwyczaj mieści się w wyznaczonych ramach. Jeśli pojawia się opóźnienie, zazwyczaj uprzedza o tym wcześniej i stara się nadrobić zaległości.',
    },
    {
      level: 7,
      minScore: 21,
      maxScore: 23,
      title: 'Pewny i przewidywalny w realizacji 📅',
      emoji: '🙂',
      sentences: 'To solidny i przewidywalny współpracownik, na którego słowie można spokojnie polegać w codziennych projektach. Rzadko pozwala sobie na wpadkę i nie musisz nad nim wisieć, żeby zadanie zostało zrobione.',
    },
    {
      level: 8,
      minScore: 24,
      maxScore: 26,
      title: 'Żelazna dyscyplina i spokój 🛡️',
      emoji: '👍',
      sentences: 'Wykazuje bardzo wysoką dyscyplinę czasową oraz świetne planowanie własnego grafiku pracy. Dowozi tematy terminowo i rzetelnie, dając całemu zespołowi ogromny spokój psychiczny.',
    },
    {
      level: 9,
      minScore: 27,
      maxScore: 29,
      title: 'Szwajcarski zegarek pod presją 🕰️',
      emoji: '⭐',
      sentences: 'Działa precyzyjnie jak szwajcarski zegarek i nigdy nie rzuca słów na wiatr. Nawet w warunkach ostrego deadlinu zachowuje zimną krew i domyka projekty punktualnie co do minuty.',
    },
    {
      level: 10,
      minScore: 30,
      maxScore: 32,
      title: 'Mistrzowska punktualność przed czasem 🚀',
      emoji: '🌟',
      sentences: 'Wybitna niezawodność – zadania często lądują u Ciebie jeszcze przed wyznaczonym terminem z dopiętym każdym detalem. Stanowi w firmie żywy wzór żelaznej punktualności i absolutnej odpowiedzialności.',
    },
    {
      level: 11,
      minScore: 33,
      maxScore: 33,
      title: 'Prędkość światła i zero poślizgów 👑',
      emoji: '👑',
      sentences: 'Dowozi tematy z prędkością światła i chirurgiczną precyzją, kompletnie deklasując wszelkie rynkowe standardy. Gdy bierze cokolwiek na klatę, masz 1000% gwarancji, że efekt będzie perfekcyjny i gotowy przed czasem.',
    },
  ],

  jakosc: [
    {
      level: 1,
      minScore: 3,
      maxScore: 5,
      title: 'Totalna fuszerka i zgliszcza 🏚️',
      emoji: '💣',
      sentences: 'Jakość jego pracy to według Ciebie kompletne dno, prowizorka i fuszerka wołająca o pomstę do nieba. Wszystko po nim trzeba poprawiać od zera, bo zostawia po sobie wyłącznie chaos, błędy i rozczarowanie.',
    },
    {
      level: 2,
      minScore: 6,
      maxScore: 8,
      title: 'Masa byków i niedoróbek ❌',
      emoji: '🛑',
      sentences: 'Masa rażących niedoróbek, powierzchowne podejście i brak elementarnej staranności w wykonywaniu obowiązków. Sprawdzanie jego pracy to udręka, bo błędy i niedopatrzenia rzucają się w oczy już na pierwszy rzut oka.',
    },
    {
      level: 3,
      minScore: 9,
      maxScore: 11,
      title: 'Kiepska merytoryka i luki 📉',
      emoji: '⚠️',
      sentences: 'Poziom merytoryczny budzi Twoje bardzo poważne zastrzeżenia i wymaga nieustannych poprawek ze strony innych. Zamiast dopracowanego materiału dostajesz surową wersję roboczą pełną widocznych braków.',
    },
    {
      level: 4,
      minScore: 12,
      maxScore: 14,
      title: 'Nierówny poziom i brak wnikliwości 🔍',
      emoji: '⚡',
      sentences: 'Jakość pracy jest mocno chwiejna – brakuje mu dbałości o szczegóły, co odbija się czkawką na kolejnych etapach zadań. Brakuje mu nawyku dokładnego sprawdzania własnych wyników przed ich wysłaniem.',
    },
    {
      level: 5,
      minScore: 15,
      maxScore: 17,
      title: 'Przeciętne odhaczanie zadań 📄',
      emoji: '😐',
      sentences: 'Pracę wykonuje na poziomie przeciętnym – poprawnie odhacza powierzone tematy, lecz bez głębszego zacięcia czy wnikliwości. Wyniki są znośne, chociaż w wielu miejscach widać spore pole do dopracowania.',
    },
    {
      level: 6,
      minScore: 18,
      maxScore: 20,
      title: 'Dobra, rzetelna robota 🛠️',
      emoji: '🆗',
      sentences: 'Prezentuje solidną, rzemieślniczą robotę, która w zupełności spełnia podstawowe wymagania i standardy firmy. Merytorycznie trzyma przyzwoity poziom i rzadko przepuszcza jakiekolwiek krytyczne potknięcia.',
    },
    {
      level: 7,
      minScore: 21,
      maxScore: 23,
      title: 'Staranność i porządny warsztat 📐',
      emoji: '🙂',
      sentences: 'Wykazuje się rzetelną wiedzą i starannym podejściem do każdego powierzonego zadania. Efekty jego pracy są czytelne, estetyczne i dopracowane pod kątem merytorycznym bez konieczności ciągłych poprawek.',
    },
    {
      level: 8,
      minScore: 24,
      maxScore: 26,
      title: 'Wysoka klasa i dbałość o detal 🎯',
      emoji: '👍',
      sentences: 'Wysoki kunszt i widoczna dbałość o każdy istotny szczegół – widać, że zależy mu na wysokiej klasie dostarczanych rozwiązań. Samodzielnie wyłapuje nieścisłości i dostarcza materiały dopięte na ostatni guzik.',
    },
    {
      level: 9,
      minScore: 27,
      maxScore: 29,
      title: 'Ekspercka wiedza i bezkompromisowość 🔬',
      emoji: '⭐',
      sentences: 'Głęboka wiedza ekspercka i wysoka kultura pracy, która stawia poprzeczkę bardzo wysoko w zespole. Efekty jego działań można bez cienia obaw prezentować bezpośrednio zarządowi i kluczowym klientom.',
    },
    {
      level: 10,
      minScore: 30,
      maxScore: 32,
      title: 'Perfekcjonizm w każdym calu 🏆',
      emoji: '🌟',
      sentences: 'Perfekcjonizm w najczystszej postaci – bezbłędna merytoryka, wybitne wyczucie detalu i zero miejsca na przypadek. Każdy projekt wychodzący spod jego ręki staje się wzorem jakości do naśladowania dla reszty.',
    },
    {
      level: 11,
      minScore: 33,
      maxScore: 33,
      title: 'Arcydzieło bez najmniejszej skazy 👑',
      emoji: '👑',
      sentences: 'Totalne arcydzieło i absolutne mistrzostwo kunsztu – jakość jego pracy po prostu zwala z nóg i zachwyca na każdym kroku. Wyznacza w firmie zupełnie nowy, niemal niedościgniony pułap profesjonalizmu.',
    },
  ],

  wklad_wlasny: [
    {
      level: 1,
      minScore: 3,
      maxScore: 5,
      title: 'Totalny leń i balast 🪨',
      emoji: '💣',
      sentences: 'Zaangażowanie oceniasz na poziomie ujemnym – to według Ciebie totalny leń patentowany, który tylko odbija kartę i czeka na fajrant. Wkłada w firmę okrągłe zero serca i stanowi wyłącznie balast hamujący cały zespół.',
    },
    {
      level: 2,
      minScore: 6,
      maxScore: 8,
      title: 'Praca jak za karę 😒',
      emoji: '🛑',
      sentences: 'Brak jakiejkolwiek inicjatywy i permanentne unikanie wysiłku, jakby pracował tutaj za najcięższą karę. Gdy pojawia się jakikolwiek problem, pierwszy chowa głowę w piasek i udaje, że temat go w ogóle nie dotyczy.',
    },
    {
      level: 3,
      minScore: 9,
      maxScore: 11,
      title: 'Absolutne minimum i opór 🛑',
      emoji: '⚠️',
      sentences: 'Robi wyłącznie bezduszne minimum, a każda prośba o dodatkowy krok spotyka się z jawnym oporem i marudzeniem. Entuzjazm i chęć rozwoju gasną u niego szybciej niż pojedyncza zapałka na silnym wietrze.',
    },
    {
      level: 4,
      minScore: 12,
      maxScore: 14,
      title: 'Brak własnego napędu 📉',
      emoji: '⚡',
      sentences: 'Własna inicjatywa pojawia się u niego niezwykle rzadko i wymaga silnego bodźcowania oraz poganiania z zewnątrz. Brakuje mu wewnętrznego silnika i odwagi do wychodzenia poza najprostsze, wydeptane ścieżki.',
    },
    {
      level: 5,
      minScore: 15,
      maxScore: 17,
      title: 'Bezpieczny bieg jałowy 🚗',
      emoji: '😐',
      sentences: 'Pracuje na bezpiecznym biegu jałowym – solidnie odhacza to, co wprost zlecone, ale ani centymetra więcej. Nie wykazuje szczególnej pasji, choć nie można mu też zarzucić celowego zaniedbywania obowiązków.',
    },
    {
      level: 6,
      minScore: 18,
      maxScore: 20,
      title: 'Uczciwa cegiełka do sukcesu 🧱',
      emoji: '🆗',
      sentences: 'Wykazuje uczciwe zaangażowanie w codzienne zadania i gotowość do wsparcia zespołu, gdy sytuacja staje się napięta. To stabilny pracownik, który rzetelnie dokłada swoją cegiełkę do wspólnego sukcesu firmy.',
    },
    {
      level: 7,
      minScore: 21,
      maxScore: 23,
      title: 'Chęć do działania i proaktywność 💡',
      emoji: '🙂',
      sentences: 'Widać u niego autentyczną chęć do działania i odwagę w podejmowaniu nowych, ambitniejszych wyzwań. Pozytywnie wpływa na tempo pracy i od czasu do czasu wychodzi z cennymi, świeżymi pomysłami.',
    },
    {
      level: 8,
      minScore: 24,
      maxScore: 26,
      title: 'Prawdziwy motor napędowy 🚀',
      emoji: '👍',
      sentences: 'Bardzo aktywny i pełen energii motor napędowy wielu firmowych przedsięwzięć i inicjatyw. Widać gołym okiem, że autentycznie zależy mu na sukcesie projektów i dynamicznym rozwoju całej organizacji.',
    },
    {
      level: 9,
      minScore: 27,
      maxScore: 29,
      title: 'Wielka pasja i pociąg w górę 🌟',
      emoji: '⭐',
      sentences: 'Prawdziwy pasjonat z niespożytą energią – nie czeka bezczynnie na polecenia, lecz sam diagnozuje potrzeby i sprawnie działa. Wnosi ogromną wartość dodaną i swoją postawą motywuje innych do dawania z siebie więcej.',
    },
    {
      level: 10,
      minScore: 30,
      maxScore: 32,
      title: 'Wulkan energii i 200% normy 🔥',
      emoji: '🌟',
      sentences: 'Płonie w nim ogień autentycznego zaangażowania, a jego poświęcenie i proaktywność budzą najwyższe uznanie w zespole. Zawsze gotowy dać z siebie 200% dla wspólnego celu i pociągnąć najtrudniejszy temat.',
    },
    {
      level: 11,
      minScore: 33,
      maxScore: 33,
      title: 'Żywa petarda i przenosiciel gór 👑',
      emoji: '👑',
      sentences: 'Żywa petarda, tytan pracy i niepowstrzymany wulkan energii, który własnoręcznie przenosi góry dla firmy! Człowiek-instytucja, którego zapał, lojalność i serce do pracy elektryzują każdego w firmie.',
    },
  ],
};

const DIMENSION_METADATA: Record<DimensionKey, { title: string; emoji: string }> = {
  komunikacja: { title: '1. Komunikacja i relacje', emoji: '💬' },
  terminowosc: { title: '2. Terminowość i obietnice', emoji: '⏱️' },
  jakosc: { title: '3. Jakość i merytoryka', emoji: '🎯' },
  wklad_wlasny: { title: '4. Wkład własny i energia', emoji: '🚀' },
};

/**
 * Calculates level 1 to 11 based on score (3 to 33)
 */
export function getDimensionLevel(score: number): number {
  const clamped = Math.min(33, Math.max(3, score));
  // Range is 30 points (from 3 to 33)
  const normalized = (clamped - 3) / 30; // 0.0 to 1.0
  const level = Math.round(normalized * 10) + 1; // 1 to 11
  return Math.min(11, Math.max(1, level));
}

export function getNarrativeForDimension(dimKey: DimensionKey, score: number): DimensionNarrativeLevel {
  const level = getDimensionLevel(score);
  const list = DIMENSION_NARRATIVES[dimKey];
  return list.find(item => item.level === level) || list[0];
}

/**
 * Computes full evaluation summary, comparisons, and cohesive narrative
 */
export function buildOverallEvaluationSummary(
  answers: Record<string, number>,
  selectedFactors: Record<string, string[]>,
  priorResponses: SurveyResponse[]
): OverallEvaluationSummary {
  const dimensionKeys: DimensionKey[] = ['komunikacja', 'terminowosc', 'jakosc', 'wklad_wlasny'];

  // Calculate scores per dimension
  const dimensions: DimensionSummaryItem[] = dimensionKeys.map(key => {
    // Find all subQuestions belonging to this dimension
    const questionObj = DEFAULT_QUESTIONS.find(q => q.dimension === key);
    let score = 0;
    if (questionObj) {
      const qIdx = DEFAULT_QUESTIONS.indexOf(questionObj) + 1;
      questionObj.subQuestions.forEach((sq, sqIdx) => {
        if (typeof answers[sq.id] === 'number') {
          score += answers[sq.id];
          return;
        }
        const letter = String.fromCharCode(97 + sqIdx);
        const fb = [`q${qIdx}_${letter}`, `q${qIdx}_${sqIdx + 1}`, `${key}_${sqIdx + 1}`];
        for (const k of fb) {
          if (typeof answers[k] === 'number') {
            score += answers[k];
            return;
          }
        }
        score += 6; // default 6 if unset
      });
    } else {
      score = 18;
    }

    const narrative = getNarrativeForDimension(key, score);
    const meta = DIMENSION_METADATA[key];

    return {
      key,
      title: meta.title,
      emoji: meta.emoji,
      score,
      maxScore: 33,
      level: narrative.level,
      levelTitle: narrative.title,
      sentences: narrative.sentences,
    };
  });

  const userTotalScore = dimensions.reduce((acc, d) => acc + d.score, 0);
  const maxTotalScore = 132;
  const userAverageScore = Number((userTotalScore / 12).toFixed(2));

  // Count user negative and positive indicators
  let userNegativeCount = 0;
  let userPositiveCount = 0;

  Object.values(answers).forEach(val => {
    if (val <= 4) userNegativeCount += 1;
    if (val >= 8) userPositiveCount += 1;
  });

  Object.entries(selectedFactors).forEach(([qId, factors]) => {
    const q = DEFAULT_QUESTIONS.find(item => item.id === qId);
    if (q) {
      factors.forEach(f => {
        if (q.factors.low.includes(f) || q.factors.mid.includes(f)) {
          userNegativeCount += 0.5;
        } else if (q.factors.high.includes(f)) {
          userPositiveCount += 0.5;
        }
      });
    }
  });

  const validPriorResponses = priorResponses.filter(r => !r.excludedFromReport);
  const isFirstSubmission = validPriorResponses.length === 0;
  const priorSubmissionsCount = validPriorResponses.length;

  let favourabilityDiffPercent = 0;
  let negativityDiffPercent = 0;
  let userNegativeDiffCount = 0;
  let positivityDiffPercent = 0;
  let groupAvgNegativeCount = 0;

  if (!isFirstSubmission) {
    // Calculate prior responses averages
    let priorTotalAvgSum = 0;
    let priorNegativeSum = 0;
    let priorPositiveSum = 0;

    validPriorResponses.forEach(r => {
      let rSum = 0;
      let rCount = 0;
      let rNeg = 0;
      let rPos = 0;

      Object.values(r.answers).forEach(val => {
        rSum += val;
        rCount += 1;
        if (val <= 4) rNeg += 1;
        if (val >= 8) rPos += 1;
      });

      if (r.selectedFactors) {
        Object.entries(r.selectedFactors).forEach(([qId, factors]) => {
          const q = DEFAULT_QUESTIONS.find(item => item.id === qId);
          if (q) {
            factors.forEach(f => {
              if (q.factors.low.includes(f) || q.factors.mid.includes(f)) {
                rNeg += 0.5;
              } else if (q.factors.high.includes(f)) {
                rPos += 0.5;
              }
            });
          }
        });
      }

      const rAvg = rCount > 0 ? rSum / rCount : 6;
      priorTotalAvgSum += rAvg;
      priorNegativeSum += rNeg;
      priorPositiveSum += rPos;
    });

    const priorGroupAvg = priorTotalAvgSum / priorResponses.length;
    groupAvgNegativeCount = Number((priorNegativeSum / priorResponses.length).toFixed(1));
    const priorGroupPosCount = priorPositiveSum / priorResponses.length;

    // Favourability diff
    favourabilityDiffPercent = Math.round(((userAverageScore - priorGroupAvg) / priorGroupAvg) * 100);

    // Difference in counts (e.g. +2.5 or -1.0)
    userNegativeDiffCount = Number((userNegativeCount - groupAvgNegativeCount).toFixed(1));

    // Negativity diff percentage (capped to reasonable bounds to avoid extreme 900% spikes from low baselines)
    if (groupAvgNegativeCount > 0) {
      const rawPct = ((userNegativeCount - groupAvgNegativeCount) / Math.max(1, groupAvgNegativeCount)) * 100;
      negativityDiffPercent = Math.max(-100, Math.min(100, Math.round(rawPct)));
    } else {
      negativityDiffPercent = userNegativeCount > 0 ? 50 : 0;
    }

    // Positivity diff
    if (priorGroupPosCount > 0) {
      const rawPos = ((userPositiveCount - priorGroupPosCount) / Math.max(1, priorGroupPosCount)) * 100;
      positivityDiffPercent = Math.max(-100, Math.min(100, Math.round(rawPos)));
    } else {
      positivityDiffPercent = userPositiveCount > 0 ? 50 : 0;
    }
  } else {
    userNegativeDiffCount = 0;
  }

  // Generate Cohesive Story across 4 dimensions
  const cohesiveStory = dimensions.map(d => `${d.sentences}`).join(' ');

  // Verdict based on overall points (12 to 132)
  let overallVerdictTitle = '';
  let overallVerdictEmoji = '⭐';
  let overallVerdictText = '';

  if (userTotalScore >= 120) {
    overallVerdictEmoji = '👑';
    overallVerdictTitle = 'Absolutny Filar i Fenomen Firmy (Ocena Wybitna)';
    overallVerdictText = `Twoja ocena to laurka najwyższej możliwej próby (${userTotalScore}/132 pkt). Postrzegasz Krzysztofa jako niezastąpioną perłę zespołu, mistrza relacji i człowieka, na którym bez wahania można oprzeć rozwój całej firmy.`;
  } else if (userTotalScore >= 100) {
    overallVerdictEmoji = '🌟';
    overallVerdictTitle = 'Mocny Filar i Zaufany Partner (Ocena Bardzo Wysoka)';
    overallVerdictText = `Wystawiłeś bardzo wysoką notę (${userTotalScore}/132 pkt). Doceniasz jego rzetelność, profesjonalizm i świetne relacje, widząc w nim kluczowego gracza w zespole o ugruntowanej pozycji i wielkim zaufaniu.`;
  } else if (userTotalScore >= 80) {
    overallVerdictEmoji = '👍';
    overallVerdictTitle = 'Solidny i Pewny Pracownik (Ocena Dobra z Plusem)';
    overallVerdictText = `Twoja ewaluacja wskazuje na stabilnego i wartościowego członka zespołu (${userTotalScore}/132 pkt). Współpraca układa się dobrze, pojawiają się sporadyczne niuanse do dopracowania, lecz bilans jest zdecydowanie na plus.`;
  } else if (userTotalScore >= 60) {
    overallVerdictEmoji = '⚖️';
    overallVerdictTitle = 'Standardowa Praca z Potencjałem do Rozwoju (Ocena Umiarkowana)';
    overallVerdictText = `Oceniasz jego wkład na poziomie poprawnym, umiarkowanym (${userTotalScore}/132 pkt). Zauważasz zarówno dobre momenty, jak i konkretne obszary wymagające większego skupienia, lepszej koordynacji i szlifu.`;
  } else if (userTotalScore >= 40) {
    overallVerdictEmoji = '⚠️';
    overallVerdictTitle = 'Poważne Zastrzeżenia i Sygnał Ostrzegawczy (Ocena Niska)';
    overallVerdictText = `Twoja ocena jest surowa i krytyczna (${userTotalScore}/132 pkt). Zidentyfikowałeś liczne zgrzyty i przeszkody we współpracy, które w Twojej opinii wymagają pilnej rozmowy i konkretnego planu naprawczego.`;
  } else {
    overallVerdictEmoji = '💥';
    overallVerdictTitle = 'Krytyczny Kryzys Współpracy (Ocena Skrajnie Niska)';
    overallVerdictText = `Wystawiłeś notę alarmującą (${userTotalScore}/132 pkt). Współpraca z Krzysztofem jest dla Ciebie pasmem frustracji i barier, które w obecnej formule uważasz za całkowicie nie do zaakceptowania.`;
  }

  return {
    isFirstSubmission,
    priorSubmissionsCount,
    userTotalScore,
    maxTotalScore,
    userAverageScore,
    favourabilityDiffPercent,
    negativityDiffPercent,
    userNegativeDiffCount,
    positivityDiffPercent,
    userNegativeCount,
    groupAvgNegativeCount,
    dimensions,
    cohesiveStory,
    overallVerdictTitle,
    overallVerdictEmoji,
    overallVerdictText,
  };
}

const fs = require('fs');

const content = `import { SurveyQuestion, ScoreLevelDescription } from '../types';

export const SCORE_LEVEL_DESCRIPTIONS: ScoreLevelDescription[] = [
  { score: 11, shortLabel: 'Kosmos (11/10)', summary: 'Jest tak zajebiście, że brakuje skali. Pełen zachwyt!' },
  { score: 10, shortLabel: 'Wybitny standard (10/10)', summary: 'Przerasta wszelkie oczekiwania, wnosi ogromną wartość i inspiruje innych' },
  { score: 9, shortLabel: 'Prawie doskonały (9/10)', summary: 'Wyjątkowa rzetelność, pełne zaufanie zespołu i wysoka kultura pracy' },
  { score: 8, shortLabel: 'Bardzo wysoki (8/10)', summary: 'Zdecydowanie powyżej standardu rynkowego, pełna samodzielność' },
  { score: 7, shortLabel: 'Dobry, solidny plus (7/10)', summary: 'Pewny i rzetelny filar zespołu, spełnia oczekiwania z nawiązką' },
  { score: 6, shortLabel: 'Powyżej przeciętnej (6/10)', summary: 'Dobry poziom, drobne kwestie organizacyjne do oszlifowania' },
  { score: 5, shortLabel: 'Standardowy, poprawny (5/10)', summary: 'Spełnia podstawowe wymagania i cele na danym stanowisku' },
  { score: 4, shortLabel: 'Dostateczny z zastrzeżeniami (4/10)', summary: 'Wymaga pewnej uwagi i koordynacji w trudniejszych tematach' },
  { score: 3, shortLabel: 'Wymaga poprawy (3/10)', summary: 'Widoczne luki wymagające planu wsparcia i szkoleń' },
  { score: 2, shortLabel: 'Istotne trudności (2/10)', summary: 'Częste przeszkody wpływające na tempo pracy otoczenia' },
  { score: 1, shortLabel: 'Krytyczny obszar (1/10)', summary: 'Pilna potrzeba gruntownego przedefiniowania zadań' },
];

export const DEFAULT_QUESTIONS: SurveyQuestion[] = [
  // 1. KOMUNIKACJA I RELACJE ZE WSPÓŁPRACOWNIKAMI
  {
    id: 'kom_1',
    dimension: 'komunikacja',
    dimensionTitle: '1. Komunikacja i relacje ze współpracownikami',
    dimensionSubtitle: 'Klarowność ustaleń, otwartość w dialogu, atmosfera i zadowolenie ze współpracy',
    subQuestions: [
      { id: 'kom_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz jasność i efektywność komunikacji w codziennych zadaniach?' },
      { id: 'kom_1_perception', label: 'Postrzeganie osoby', text: 'Jakie ogólne wrażenie sprawia Krzysztof w kontaktach zawodowych?' },
      { id: 'kom_1_relation', label: 'Relacje partnerskie', text: 'Jak oceniasz jakość budowanych przez niego relacji i atmosferę współpracy?' }
    ],
    contextHelp: 'Oceń otwartość w dialogu, jasność przekazywanych informacji, życzliwość, słuchanie innych oraz codzienną współpracę.',
    factors: {
      high: [
        'Atmosfera: Naprawdę świetnie mi się z nim współpracuje – jest życzliwy, pomocny i buduje świetny klimat',
        'Humor: Równy chłop, można z nim normalnie pogadać i pożartować, a robota i tak jest zrobiona na czas',
        'Jasność: Zawsze bardzo konkretnie i bez niedomówień formułuje ustalenia',
        'Otwartość: Doskonale słucha innych, szanuje odmienne zdanie i jest w 100% otwarty na dialog',
        'Przepływ: Natychmiast uprzedza o wszelkich zmianach, ryzykach lub postępach w zadaniach',
        'Kontakt: Szybko odpowiada na wiadomości i telefony, nie trzyma nikogo w niepewności',
        'Profesjonalizm: Rzeczowo i spokojnie podchodzi do trudnych tematów bez zbędnych emocji',
        'Mosty: Świetnie łączy współpracę między różnymi działami w firmie',
        'Dojrzałość: Przyjmuje uwagi z pełną kulturą i natychmiast wdraża poprawki',
        'Epickość: Po prostu zajebiście się z nim gada, w lot łapie o co chodzi bez zbędnego tłumaczenia',
      ],
      mid: [
        'Bieżący kontakt: Kontakt jest dobry, chociaż czasami zdarzają się minimalne przestoje w odpowiedziach',
        'Sygnalizacja: Warto popracować nad szybszym uprzedzaniem o napotkanych trudnościach',
        'Skrótowość: Bywa odrobinę zbyt lakoniczny w komunikacji e-mail, co wymaga dopytania',
        'Opanowanie: Zdarza mu się ulegać drobnym emocjom w stresujących sytuacjach',
        'Forma: Mógłby nieco bardziej dbać o zrozumiałość techniczną swojego przekazu',
        'Dostępność: Czasami trudniej go uchwycić na komunikatorach przy głębokiej pracy',
        'Słuchanie: Na ogół słucha dobrze, ale bywa, że potrzebuje ponownego wyjaśnienia intencji',
      ],
      low: [
        'Przepływ informacji: Niezbędna jest znaczna poprawa w informowaniu zespołu o zmianach',
        'Odpowiadanie: Długi czas oczekiwania na odpowiedzi negatywnie wpływa na postępy',
        'Otwartość: Wymagana większa elastyczność i szacunek dla innych perspektyw',
        'Zrozumienie: Często dochodzi do nieporozumień z powodu braku jasności komunikatów',
        'Styl: Konieczna zmiana zbyt szorstkiego i oceniającego tonu rozmów',
        'Emocje: Zbyt często przenosi napięcie na współpracowników w sytuacjach presji',
        'Silokowość: Brakuje proaktywnego budowania relacji z innymi działami',
      ],
    },
  },
  
  // 2. ORGANIZACJA PRACY I TERMINOWOŚĆ
  {
    id: 'org_1',
    dimension: 'organizacja',
    dimensionTitle: '2. Organizacja pracy własnej i terminowość',
    dimensionSubtitle: 'Zarządzanie czasem, priorytetyzacja, dotrzymywanie słowa i deadlineów',
    subQuestions: [
      { id: 'org_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz jego zdolność do planowania, organizowania i terminowej realizacji zadań?' },
      { id: 'org_1_perception', label: 'Postrzeganie osoby', text: 'Czy uważasz, że jest to osoba świetnie zorganizowana, potrafiąca radzić sobie z priorytetami?' },
      { id: 'org_1_relation', label: 'Wpływ na innych', text: 'W jakim stopniu jego organizacja pracy pomaga innym w terminowym zamykaniu swoich tematów?' }
    ],
    contextHelp: 'Oceń, czy dotrzymuje obietnic, sprawnie zarządza wieloma wątkami oraz czy umie dobrze ustawić priorytety.',
    factors: {
      high: [
        'Samodzielność: Jest po prostu przejebany, sam sobie wszystko genialnie organizuje i planuje',
        'Niezawodność: Zawsze dowozi na czas, ani razu nie musiałem mu przypominać o terminach',
        'Automatyzacja: Sam sobie pisze programiki i skrypty, ułatwia robotę sobie i innym',
        'Planowanie: Perfekcyjnie ocenia realny czas i ramy na realizację skomplikowanych tematów',
        'Multitasking: Świetnie żongluje priorytetami nawet pod gigantyczną presją czasu',
        'Priorytety: Umiejętnie odsiewa sprawy kluczowe od tych mniej pilnych',
        'Uporządkowanie: Zawsze ma porządek w projektach i wie, na jakim jest etapie',
        'Sygnalizacja: Wzorowo zarządza ryzykiem i z wielkim wyprzedzeniem uprzedza o opóźnieniach',
        'Wsparcie: Zawsze wyciąga rękę, by pomóc zoptymalizować organizację reszty zespołu',
        'Zaufanie: Ślepo mu ufam w sprawach deadline’ów – jak mówi że będzie, to jest',
      ],
      mid: [
        'Solidność: Z reguły na czas, bardzo sporadycznie zdarzy się drobny poślizg',
        'Zarządzanie: Zdarza się, że potrzebuje małego przypomnienia przy mniej istotnych tematach',
        'Planowanie: Mógłby nieco lepiej kalibrować kalendarz w gorących okresach',
        'Skupienie: W standardowych zadaniach terminowy, przy spiętrzeniu priorytetów gubi rytm',
        'Inicjatywa: Reaguje na pilne tematy, ale wymaga to czasami podkreślenia przez szefa',
        'Eskalacja: Warto popracować nad nieco szybszym sygnalizowaniem zagrożenia terminów',
        'Dokładność: Czasem przy pośpiechu brakuje ostatniego szlifu organizacyjnego',
      ],
      low: [
        'Szanse na poprawę: Warto mocno podszkolić się w priorytetyzowaniu zadań i hierarchii',
        'Narzędzia: Konieczne wdrożenie podstawowych nawyków zarządzania własnym kalendarzem',
        'Ostrzeganie: Brakuje nawyku uprzedzania zespołu o przesuwających się deadline’ach',
        'Estymacje: Bardzo często przeszacowuje swoje moce przerobowe, obiecując za dużo',
        'Domykanie: Zauważalny problem z końcowym domykaniem rozpoczętych tematów',
        'Zagubienie: Łatwo traci kontrolę przy większej liczbie wątków do obsłużenia',
        'Dyscyplina: Konieczne ograniczenie odkładania trudniejszych zadań na ostatnią chwilę',
      ],
    },
  },

  // 3. JAKOŚĆ PRACY I SAMODZIELNOŚĆ
  {
    id: 'jak_1',
    dimension: 'jakosc',
    dimensionTitle: '3. Jakość pracy, rzetelność i samodzielność',
    dimensionSubtitle: 'Dokładność, bezbłędność, wiedza merytoryczna i dbałość o standardy',
    subQuestions: [
      { id: 'jak_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz merytoryczną jakość, bezbłędność i staranność wykonywanych obowiązków?' },
      { id: 'jak_1_perception', label: 'Postrzeganie osoby', text: 'Czy postrzegasz pracownika jako niezależnego profesjonalistę o wysokim standardzie?' },
      { id: 'jak_1_relation', label: 'Wsparcie jakościowe', text: 'W jakim stopniu jego jakość pracy i samodzielność ułatwiają działanie Twojego zespołu?' }
    ],
    contextHelp: 'Oceń czy efekty pracy są dopracowane, czy nie wymagają poprawek oraz czy wykazuje pełną samodzielność.',
    factors: {
      high: [
        'Bezbłędność: Efekty pracy są niesamowicie dopracowane – kompletnie nie wymagają weryfikacji',
        'Ekspertyza: Autentyczny profesjonalista w swojej dziedzinie, ma potężną wiedzę merytoryczną',
        'Skrupulatność: Sam z siebie wyłapuje i eliminuje błędy zanim ktokolwiek inny je zauważy',
        'Mózg: Szybko się uczy nowych rzeczy i łapie lotne koncepcje w mgnieniu oka',
        'Samodzielność: Podejmuje trafne decyzje i bierze za nie pełną odpowiedzialność',
        'Ambicja: Dowozi kozacką jakość, która przerasta standardowe oczekiwania w zespole',
        'Zaufanie: Śmiało można mu dać najtrudniejsze projekty bez prowadzenia za rękę',
        'Mistrzostwo: Wnosi niesamowity kunszt i rzetelność, chroniąc firmę przed stratami',
        'Estetyka: Nawet dokumentację i nudne rzeczy przygotowuje super czytelnie i czysto',
        'Klasa: Gość ma smykałkę, po prostu siada, robi robotę tak że kopara opada i gotowe',
      ],
      mid: [
        'Poprawność: Jakość jest na dobrym poziomie, choć czasami wymaga kontrolnego zerknięcia',
        'Dokładność: Przy rutynie super, przy zupełnie nowych zadaniach drobne potknięcia',
        'Rozwiązywanie problemów: Z większością radzi sobie sam, przy trudniejszych musi dopytać',
        'Autokontrola: Warto wprowadzić dodatkowy check przed puszczaniem materiałów w eter',
        'Rozwój: Baza wiedzy jest fajna, ale potrzebuje doszlifowania kilku standardów',
        'Pewność siebie: Mógłby odważniej podejmować decyzje we własnym obszarze',
        'Precyzja: Czasem przyśpieszenie tempa powoduje drobne literówki w pracy',
      ],
      low: [
        'Niestaranność: Niezbędna drastyczna poprawa autokontroli, jest za dużo prostych błędów',
        'Poleganie na innych: Szuka pomocy, zamiast samodzielnie zgłębić temat w instrukcjach',
        'Kompetencje: Wymagane intensywne przeszkolenie i podciągnięcie merytoryki',
        'Powtarzalność błędów: Zaskakująco często powiela te same niedopatrzenia',
        'Nieuwaga: Totalnie brakuje precyzji, zwłaszcza w momentach podwyższonej presji',
        'Niezgodność: Efekt końcowy często odbiega od pierwotnych wytycznych szefa',
        'Asysta: Konieczny ścisły nadzór (mentoring) przy realizowaniu bardziej złożonych prac',
      ],
    },
  },

  // 4. WKŁAD WŁASNY, WNIESIONA WARTOŚĆ I INICJATYWA
  {
    id: 'wklad_1',
    dimension: 'wklad_wlasny',
    dimensionTitle: '4. Wkład własny, zaangażowanie i inicjatywa',
    dimensionSubtitle: 'Zaangażowanie, pomysły na usprawnienia, wniesiona wartość dodana i rozwój',
    subQuestions: [
      { id: 'wklad_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz jego proaktywność, innowacyjność i zaangażowanie w codziennych procesach?' },
      { id: 'wklad_1_perception', label: 'Postrzeganie osoby', text: 'Czy uważasz, że jest to osoba pełna dobrej energii z głową do wprowadzania zmian?' },
      { id: 'wklad_1_relation', label: 'Motywowanie innych', text: 'Jak jego inicjatywa i chęć doskonalenia pracy wpływają na motywację otoczenia?' }
    ],
    contextHelp: 'Oceń czy wnosi realną wartość, angażuje się w usprawnienia procesów, wspiera innych oraz wykazuje inicjatywę.',
    factors: {
      high: [
        'Energia: Prawdziwy filar i motor napędowy fajnej energii, dodaje kopa całemu działowi',
        'Wartość: Wygenerował zajebistą wartość dodaną, oszczędza nam masę czasu i kosztów',
        'Innowacje: Stale wychodzi z własną inicjatywą i ma mnóstwo mądrych, trafionych pomysłów',
        'Pomoc: Od razu rzuca się pomagać innym, chętnie uczy i dzieli się trikami',
        'Proaktywność: Sam odnajduje bolączki zespołu i przynosi nam już gotowe rozwiązania',
        'Perspektywa: Nie zamyka się u siebie w excelu, patrzy całościowo na biznes',
        'Odpowiedzialność: Dojrzała postawa, bierze w 100% odpowiedzialność za to co wdraża',
        'Elastyczność: Otwarty na każdy nowy temat, nie kręci nosem gdy wpada trudne wyzwanie',
        'Pasja: Widać, że mu się po prostu bardzo chce i wkłada w pracę mnóstwo serducha',
        'Rozwój: Rewelacyjny potencjał, zdecydowanie widzę go przy coraz większych projektach',
      ],
      mid: [
        'Zadania: Stabilnie dowozi swoje tematy, ale stosunkowo rzadko proponuje przełomowe zmiany',
        'Wsparcie: Chętnie pomoże jak ktoś poprosi, ale rzadko sam proponuje inicjatywę',
        'Pomysłowość: Przydałoby się odważniejsze wychodzenie z nowymi koncepcjami',
        'Status Quo: Skupiony na operacyjnej rutynie, warto rozszerzyć perspektywę',
        'Eksponowanie: Ma fajne pomysły, ale trochę za bardzo trzyma je w ukryciu',
        'Cele: Solidnie wywiązuje się z założeń, to fajna baza na ambitniejsze plany w przyszłości',
        'Aktywność: Sympatyczna obecność, jednak oczekiwałbym minimalnie większej charyzmy',
      ],
      low: [
        'Bierność: Kompletnie brakuje proaktywności czy wykraczania poza minimalne polecenie',
        'Zmiany: Zdecydowanie wykazuje zbyt duży opór wobec wszelkich optymalizacji',
        'Zamknięcie: Brak zainteresowania wspólnymi, grupowymi inicjatywami',
        'Przeczekanie: W momentach mniejszego obciążenia czeka na przydział, nie szuka sam pracy',
        'Pesymizm: Zbyt często skupia się na wymyślaniu przeszkód zamiast szukać rozwiązań',
        'Marazm: Da się odczuć wyraźny spadek autentycznego zaangażowania we współpracę',
        'Otwartość: Nie przyjmuje nowości organizacyjnych i nie chce adaptować usprawnień',
      ],
    },
  },
];

export const DEFAULT_CONFIG = {
  employeeName: 'Krzysztof Wieczorek',
  companyName: 'Kubara Sp. z o.o.',
  tenure: '1 rok (rocznica współpracy)',
  targetRoleOrGoal: 'Podsumowanie rocznych osiągnięć, wniesionej wartości, mocnych stron, obszarów do doszlifowania oraz ustalenie dalszych celów rozwojowych',
  questions: DEFAULT_QUESTIONS,
};
`
fs.writeFileSync('src/data/surveyQuestions.ts', content);
console.log("Updated questions with category tags and loose language.");

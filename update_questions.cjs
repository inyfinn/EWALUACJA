const fs = require('fs');

let content = fs.readFileSync('src/data/surveyQuestions.ts', 'utf8');

const preMatch = content.match(/([\s\S]*?export const DEFAULT_QUESTIONS: SurveyQuestion\[\] = \[)/);
const postMatch = content.match(/(];\n\nexport const DEFAULT_CONFIG[\s\S]*)/);

if (!preMatch || !postMatch) {
    console.error("Could not parse file structure.");
    process.exit(1);
}

const newQuestions = `
  // 1. KOMUNIKACJA I RELACJE ZE WSPÓŁPRACOWNIKAMI
  {
    id: 'kom_1',
    dimension: 'komunikacja',
    dimensionTitle: '1. Komunikacja, empatia i współpraca zespołowa',
    dimensionSubtitle: 'Zrozumienie intencji, klarowność, asertywność oraz życzliwość',
    subQuestions: [
      { id: 'kom_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz codzienną wymianę informacji, maili i ustaleń projektowych z tą osobą?' },
      { id: 'kom_1_perception', label: 'Postrzeganie osoby', text: 'Czy uważasz, że jest to osoba bezkonfliktowa, asertywna i budująca pozytywną atmosferę?' },
      { id: 'kom_1_relation', label: 'Motywowanie innych', text: 'Jak obecność tej osoby wpływa na nastrój i chęć do działania całego Twojego zespołu?' }
    ],
    contextHelp: 'Oceń styl komunikacji, empatię i kulturę dyskusji. Czy współpracuje się lekko, przyjemnie i skutecznie?',
    scoreDescriptions: [
      { score: 11, shortLabel: 'Poziom Dokurwienie 👑 (11/10)', summary: 'Absolutny fenomen relacyjny, z nikim w firmie nie współpracuje mi się aż tak dobrze.' },
      { score: 10, shortLabel: 'Wybitnie (10/10)', summary: 'Buduje rewelacyjną atmosferę i rozwiązuje każdy problem z uśmiechem na ustach.' },
      { score: 9, shortLabel: 'Bardzo dobrze (9/10)', summary: 'Zawsze pomocny, a codzienna komunikacja jest wzorowa i całkowicie bezproblemowa.' },
      { score: 8, shortLabel: 'Solidny plus (8/10)', summary: 'Zdecydowanie powyżej normy, bardzo jasna, konkretna i przyjemna współpraca.' },
      { score: 7, shortLabel: 'Dobrze (7/10)', summary: 'Pewny i rzetelny w kontakcie, spełnia oczekiwania w codziennych relacjach.' },
      { score: 6, shortLabel: 'Powyżej przeciętnej (6/10)', summary: 'Jest w porządku, chociaż czasem przydałoby się trochę więcej otwartości.' },
      { score: 5, shortLabel: 'Standardowo (5/10)', summary: 'Kontakt jest poprawny, ale czysto zadaniowy i suchy. Spełnia minimum.' },
      { score: 4, shortLabel: 'Zastrzeżenia (4/10)', summary: 'Zdarzają się niepotrzebne zgrzyty i nieporozumienia, które trochę psują nastrój.' },
      { score: 3, shortLabel: 'Wymaga poprawy (3/10)', summary: 'Często trudno się dogadać, bywa nieprzyjemnie lub zbyt nerwowo w rozmowach.' },
      { score: 2, shortLabel: 'Istotne trudności (2/10)', summary: 'Atmosfera jest bardzo napięta, a komunikacja w zasadzie mocno kuleje.' },
      { score: 1, shortLabel: 'Krytycznie (1/10)', summary: 'Całkowity brak komunikacji lub mocno toksyczne relacje, pilnie trzeba to naprawić.' },
    ],
    factors: {
      high: [
        'Super kontakt: Od razu wiadomo o co chodzi, gada się bardzo konkretnie i rzeczowo.',
        'Mówi wprost: Zero owijania w bawełnę, brak zbędnej korpo-nowomowy.',
        'Dobry vibe: Wnosi fajny luz do zespołu, zdecydowanie lepiej się z nim pracuje na co dzień.',
        'Słuchanie: Słucha z uwagą, nie musisz mu powtarzać tych samych ustaleń po trzy razy.',
        'Rozładowywanie napięcia: Świetnie potrafi załagodzić każdą "spinkę" w zespole.',
        'Szczerość: Jak coś się wysypie, to przyznaje to bez kręcenia i od razu działa by naprawić.',
        'Kulturalna asertywność: Potrafi powiedzieć "nie", zachowując przy tym pełen szacunek.',
        'Zawsze pomocny: Jak go poprosisz, znajdzie chwilę, żeby pomóc z problemem.',
        'Brak dram: Trzyma się z dala od firmowych plotek, nie nakręca negatywnych emocji.',
        'Przejrzystość: Maile i notatki są czytelne, wszystko widać czarno na białym bez domysłów.',
      ],
      mid: [
        'Komunikacja jest w porządku, chociaż czasami wydaje się trochę zbyt oschła lub oficjalna.',
        'Dogadujemy się spoko, ale to kontakt czysto zadaniowy, zamyka się głównie na swoich celach.',
        'Zdarza mu się zapomnieć o jakichś detalach z naszych ustaleń i trzeba przypominać.',
        'Mógłby trochę szybciej dawać znać, na jakim etapie są aktualnie jego sprawy.',
        'Zbyt szybko przyjmuje nowe zadania na klatę, zamiast realnie negocjować z nami terminy.',
        'Czasami muszę dopytać, co dokładnie miał na myśli w mailu, bo pisze trochę skrótowo.',
        'Wolę z nim rozmawiać na żywo, w formie pisemnej bywa trudny do odczytania.',
      ],
      low: [
        'Bardzo słabo odpisuje, czasem trzeba go kilka razy ścigać, żeby dostać zwykłe "tak/nie".',
        'Zbyt często wprowadza chaos. Pisze chaotycznie i trudno w ogóle zrozumieć jego intencje.',
        'Głuchy telefon: Puszczasz mu informacje i nigdy nie masz pojęcia, czy on to w ogóle przeczytał.',
        'Zdarza mu się bywać niemiłym, używa sarkazmu, który niepotrzebnie psuje nam atmosferę.',
        'Bierze każdy feedback mocno do siebie. Od razu przechodzi do obrony i tłumaczenia się.',
        'Bywa nietaktowny, rzuci słowo za dużo bez przemyślenia, co rodzi potem spięcia w dziale.',
        'Bardzo trudno się z nim na spokojnie dogadać i ułożyć płynną, ludzką współpracę.',
      ],
    },
  },
  // 2. TERMINOWOŚĆ I ORGANIZACJA
  {
    id: 'term_1',
    dimension: 'terminowosc',
    dimensionTitle: '2. Terminowość, niezawodność i organizacja',
    dimensionSubtitle: 'Dowożenie na czas, szacowanie zadań, radzenie sobie z wielowątkowością',
    subQuestions: [
      { id: 'term_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz zdolność do dotrzymywania obiecanych terminów i dowożenia zadań?' },
      { id: 'term_1_perception', label: 'Postrzeganie osoby', text: 'Czy uważasz, że jest to osoba świetnie zorganizowana, potrafiąca radzić sobie ze stresem?' },
      { id: 'term_1_relation', label: 'Wsparcie niezawodnością', text: 'Czy punktualność tej osoby daje Tobie i zespołowi poczucie spokoju i bezpieczeństwa?' }
    ],
    contextHelp: 'Oceń, czy pracownik panuje nad kalendarzem, czy umie odmawiać i czy na czas dowozi to, co obiecał.',
    scoreDescriptions: [
      { score: 11, shortLabel: 'Poziom Dokurwienie 👑 (11/10)', summary: 'Maszyna do dowożenia. Zawsze przed czasem, zawsze idealnie. Organizacyjny absolutny geniusz.' },
      { score: 10, shortLabel: 'Wybitnie (10/10)', summary: 'Nigdy nas nie zawodzi, fenomenalnie radzi sobie z presją i wieloma trudnymi projektami naraz.' },
      { score: 9, shortLabel: 'Bardzo dobrze (9/10)', summary: 'Zawsze na czas. Świetnie układa sobie pracę i na bieżąco o wszystkim uprzedza zespół.' },
      { score: 8, shortLabel: 'Solidny plus (8/10)', summary: 'Bardzo dobra organizacja na co dzień. Rzadko kiedy cokolwiek umyka jego uwadze.' },
      { score: 7, shortLabel: 'Dobrze (7/10)', summary: 'Po prostu dowozi to, na co się umawiamy. Bardzo rzetelny współpracownik w tym aspekcie.' },
      { score: 6, shortLabel: 'Powyżej przeciętnej (6/10)', summary: 'Ogólnie jest na czas, czasem tylko zdarzają się lekkie opóźnienia, gdy pojawia się duża presja.' },
      { score: 5, shortLabel: 'Standardowo (5/10)', summary: 'Dowozi większość rzeczy, ale trzeba mu czasem przypominać o deadline\\'ach i kontrolować status.' },
      { score: 4, shortLabel: 'Zastrzeżenia (4/10)', summary: 'Niestety zdarzają się poślizgi bez wcześniejszego uprzedzenia, co utrudnia planowanie innym.' },
      { score: 3, shortLabel: 'Wymaga poprawy (3/10)', summary: 'Bardzo często nie wyrabia się w umówionym terminie, przez co mocno blokuje pracę innych osób.' },
      { score: 2, shortLabel: 'Istotne trudności (2/10)', summary: 'Panuje u niego duży chaos organizacyjny. Terminy projektów są przez niego regularnie zawalane.' },
      { score: 1, shortLabel: 'Krytycznie (1/10)', summary: 'Całkowity brak panowania nad czasem i swoimi zadaniami. Praca z nim przypomina ruletkę.' },
    ],
    factors: {
      high: [
        'Jak powie, że dowiezie, to dowiezie. Można na nim zawsze polegać w 100%.',
        'Świetnie planuje sobie pracę, praktycznie nie zdarzają mu się nieprzemyślane obsuwy.',
        'Gdy w firmie wszystko "płonie", potrafi na chłodno wyznaczyć priorytety i ratować sytuację.',
        'Rzucasz mu temat i nie musisz się już martwić, bo wiadomo, że o nim nie zapomni.',
        'Bardzo trafnie ocenia, ile czasu zajmie mu praca – estymacje ma w punkt.',
        'Jak widzi, że się nie wyrobi na jutro, od razu daje znać z góry, zamiast udawać że zdąży.',
        'Prowadzi kilka dużych projektów jednocześnie i jakimś cudem żaden mu nie spada.',
        'Super ogarnięty kalendarz i notatki, w jego zadaniach panuje wzorowy porządek.',
        'Daje duży komfort psychiczny w zespole – jeśli on ma projekt, to zespół śpi spokojnie.',
        'Na bieżąco wrzuca statusy prac, dzięki czemu cały czas wiesz na czym wszyscy stoją.',
      ],
      mid: [
        'Zazwyczaj jest na czas, chociaż czasem pod koniec zadania robi się trochę niepotrzebnie nerwowo.',
        'Główne tematy ogarnia super, ale mniejsze drobnostki potrafią u niego ugrzęznąć na długo.',
        'Mógłby uprzedzać o poślizgach nieco szybciej, niż dopiero w dniu zaplanowanego deadline\\'u.',
        'Czasami bywa zbytnim optymistą czasowym i obiecuje szybciej, niż fizycznie jest w stanie to zrobić.',
        'Trochę gubi swój rytm pracy, jak z boku wpadnie mu naraz kilka niezapowiedzianych "wrzutek".',
        'Dopina sprawy na ostatnią chwilę – ostatecznie dowozi, ale kosztuje to wszystkich trochę stresu.',
        'Co jakiś czas trzeba mu łagodnie przypomnieć, żeby pchnął zapomniany wątek do przodu.',
      ],
      low: [
        'O poślizgach dowiaduję się grubo po fakcie, kiedy temat już leży, a on nie poinformował wcześniej.',
        'Regularnie nie dowozi rzeczy, na które się umawialiśmy. To bardzo psuje plany nam wszystkim.',
        'Często łapie zbyt wiele srok za ogon, przez co żadna z tych rzeczy nie jest doprowadzona do mety.',
        'Zdecydowanie musi skończyć z nawykiem odkładania trudnych i nużących zadań na sam koniec.',
        'Zupełnie nie potrafi wycenić własnego czasu – ciągle przeszacowuje to, co zdoła danego dnia zrobić.',
        'Bardzo szybko zapomina o ważnych ustaleniach, jeśli nie dostanie ich na piśmie lub w systemie.',
        'Słabo radzi sobie pod presją. Jak nagromadzi się dużo roboty, to kompletnie się w niej blokuje.',
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
    scoreDescriptions: [
      { score: 11, shortLabel: 'Poziom Dokurwienie 👑 (11/10)', summary: 'Wymiatacz i absolutny ekspert. Dostarcza nam taką jakość, o której inni w branży mogą pomarzyć.' },
      { score: 10, shortLabel: 'Wybitnie (10/10)', summary: 'Całkowicie bezbłędny i w 100% samodzielny. Można mu powierzyć najtrudniejsze zadania wręcz "na ślepo".' },
      { score: 9, shortLabel: 'Bardzo dobrze (9/10)', summary: 'Świetna jakość. Niemal w ogóle się nie myli i potrafi sam rozpracować i rozwiązać większość trudnych problemów.' },
      { score: 8, shortLabel: 'Solidny plus (8/10)', summary: 'Bardzo rzetelna praca. Rzadko trzeba cokolwiek po nim poprawiać, wykazuje bardzo dużą samodzielność.' },
      { score: 7, shortLabel: 'Dobrze (7/10)', summary: 'Dobra, zadowalająca jakość. Wykonuje swoje zadania dokładnie tak, jak przewidują nasze standardy.' },
      { score: 6, shortLabel: 'Powyżej przeciętnej (6/10)', summary: 'Większość zadań wykonana fajnie, ale czasami brakuje w tym takiego ostatecznego, drobnego szlifu.' },
      { score: 5, shortLabel: 'Standardowo (5/10)', summary: 'Jakość jest po prostu okej. Często potrzebuje jednak trochę merytorycznego wsparcia lub weryfikacji ze strony innych.' },
      { score: 4, shortLabel: 'Zastrzeżenia (4/10)', summary: 'Niestety pojawiają się u niego proste błędy i literówki. Jego praca wymaga od nas częstego sprawdzania.' },
      { score: 3, shortLabel: 'Wymaga poprawy (3/10)', summary: 'Zdecydowanie za dużo niedoróbek w plikach i wynikach. Wyraźnie brakuje mu samodzielności przy podstawach.' },
      { score: 2, shortLabel: 'Istotne trudności (2/10)', summary: 'Jakość pracy mocno odstaje w dół od naszych standardów, przez co stale trzeba mu asystować i pomagać.' },
      { score: 1, shortLabel: 'Krytycznie (1/10)', summary: 'Wyniki są pełne grubych błędów. Praktycznie każda jego praca wymaga zrobienia jej od nowa przez kogoś innego.' },
    ],
    factors: {
      high: [
        'Ma głowę na karku – sam sobie pisze skrypty albo optymalizuje procesy, żeby odwalały za niego czarną robotę.',
        'Dowozi nam tak dobrą jakość, że w zasadzie wysyłamy to bez żadnego sprawdzania i kontroli.',
        'Prawdziwy ekspert w swoim obszarze działania. Jak jest trudne pytanie, to w zespole idzie się tylko do niego.',
        'Sam rozwiązuje swoje zatory i problemy. Nie biega z każdą drobną sprawą zawracać głowę innym.',
        'Bardzo skrupulatnie pilnuje detali – jest wręcz pedantyczny w pozytywnym sensie (zero głupich literówek).',
        'Bardzo szybko łapie nowe i skomplikowane koncepty. Nie trzeba mu tłumaczyć dwa razy jak coś działa.',
        'Podejmuje trafne i samodzielne decyzje, nie boi się brać pełnej odpowiedzialności za efekty swojego działu.',
        'Ma ambicję na dobrą robotę – nigdy nie schodzi poniżej fajnego, wysokiego standardu.',
        'Nawet nudne dokumentacje i analizy wyglądają u niego czysto, czytelnie i profesjonalnie.',
        'Po prostu świetny fachowiec: przychodzi, robi co ma robić, efekt jest klasa i po temacie.',
      ],
      mid: [
        'Robota jest zrobiona ogólnie dobrze, chociaż od czasu do czasu po prostu brakuje w niej ostatecznego szlifu.',
        'Przy rutynowych zadaniach jest super, ale jak wejdzie całkowicie nowy temat, to woli żeby ktoś go sprawdził.',
        'Zazwyczaj sam rozkminia problemy, ale jak trafi się coś bardziej zawiłego, to musi poprosić o wskazówki.',
        'Byłoby fajnie, gdyby robił dla siebie taki krótki "self-check" zanim wyśle skończony temat dalej w świat.',
        'Zna świetnie swój obecny wycinek pracy, ale trochę omija zgłębianie nowości i uczenie się innych dziedzin.',
        'Czasem ma naprawdę fajne, poprawne wnioski, ale mówi o nich za cicho i z braku pewności chowa do szuflady.',
        'Zdarza mu się w pośpiechu przeoczyć jakiegoś drobnego "babola", na szczęście gdy mu się powie, szybko poprawia.',
      ],
      low: [
        'Wypuszcza bardzo dużo niedopatrzenia i głupich pomyłek. Ciągle ktoś w dziale musi pełnić rolę jego korektora.',
        'Pracuje w sposób dość chaotyczny, jego pliki, tabele czy maile bywają trudne do rozszyfrowania dla innych.',
        'Brak mu samodzielności na co dzień. Pytania, które ma, mógłby sam rozwiązać szukając na własną rękę.',
        'Dość mocno frustrujące jest to, że niestety ma tendencję do powtarzania dokładnie tych samych błędów.',
        'Mocno rzuca się w oczy fakt, że niezbyt mu zależy na wysokiej estetyce. Robi rzeczy tak, żeby tylko odbębnić.',
        'Nie ma w nim chęci głębszego zrozumienia procesów. Płynie z prądem i realizuje proste kroki jak robot.',
        'Żeby poprawnie i bezpiecznie realizował trudniejsze zadania, dosłownie trzeba stać nad nim i go mocno mentorować.',
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
    scoreDescriptions: [
      { score: 11, shortLabel: 'Poziom Dokurwienie 👑 (11/10)', summary: 'Innowator totalny. Zmienia ten dział na lepsze każdego dnia, niesamowity, pozytywny napęd.' },
      { score: 10, shortLabel: 'Wybitnie (10/10)', summary: 'Stale proponuje bardzo trafne usprawnienia i chętnie bierze na siebie wprowadzanie innowacji.' },
      { score: 9, shortLabel: 'Bardzo dobrze (9/10)', summary: 'Często sam z siebie robi dużo więcej niż musi, podrzuca fajne pomysły i uczy resztę zespołu.' },
      { score: 8, shortLabel: 'Solidny plus (8/10)', summary: 'Bardzo zaangażowany, chętnie pomaga przy optymalizacjach i sam z siebie szuka lepszych rozwiązań.' },
      { score: 7, shortLabel: 'Dobrze (7/10)', summary: 'Robi swoje zadania z fajnym, pozytywnym nastawieniem i zawsze stara się pomóc, gdy jest taka potrzeba.' },
      { score: 6, shortLabel: 'Powyżej przeciętnej (6/10)', summary: 'Poprawnie zaangażowany w życie działu, chociaż rzadko zdarza mu się jakoś mocno wyjść przed szereg z czymś nowym.' },
      { score: 5, shortLabel: 'Standardowo (5/10)', summary: 'Wykonuje sumiennie tylko to, co dostanie w zadaniach do zrobienia. Typowy, solidny rzemieślnik.' },
      { score: 4, shortLabel: 'Zastrzeżenia (4/10)', summary: 'Raczej unika angażowania się w jakiekolwiek dodatkowe inicjatywy, robi tylko swoje absolutne minimum.' },
      { score: 3, shortLabel: 'Wymaga poprawy (3/10)', summary: 'Uosobienie bierności w pracy. Bardzo trudno jest go zmotywować do czegokolwiek poza sztywną rutyną.' },
      { score: 2, shortLabel: 'Istotne trudności (2/10)', summary: 'Jawnie narzeka na wszelkie nowości i potrafi swoim nastawieniem demotywować innych do wprowadzania zmian.' },
      { score: 1, shortLabel: 'Krytycznie (1/10)', summary: 'Aktywnie blokuje nowe rozwiązania, zawsze znajdzie mnóstwo problemów i zraża do siebie całe otoczenie.' },
    ],
    factors: {
      high: [
        'Super napędza nasz zespół do działania, roztacza dookoła bardzo pozytywną energię i zapał.',
        'Stale wymyśla sprytne, drobne usprawnienia, które w dłuższej perspektywie mocno ułatwiają nam życie.',
        'Zawsze znajdzie czas, żeby pomóc z trudnym tematem i podzielić się własnymi patentami z młodszymi.',
        'Nie czeka, aż szef pokaże palcem co poprawić – sam analizuje co kuleje i od razu podrzuca plan naprawy.',
        'Po prostu gołym okiem widać, że chłopakowi zależy na firmie, bardzo angażuje się w nasze sprawy na 100%.',
        'Patrzy na biznes zdecydowanie szerzej – nie kisi się tylko w swojej "kuwecie", ale wspiera działania innych.',
        'Bierze nowości na klatę. Nawet trudny temat potrafi przekuć w ciekawe wyzwanie, nie boi się nieznanego.',
        'Świetnie chłonie nową wiedzę, cały czas się rozwija i podnosi poprzeczkę sobie i wszystkim obok.',
        'Zero narzekania, gdy nagle musimy przeskoczyć na całkiem nowy system – po prostu siada i bada możliwości.',
        'Realnie przynosi oszczędności finansowe lub czasowe przez swoje zoptymalizowane podejście do procesów.',
      ],
      mid: [
        'Robi po prostu to co do niego należy rzetelnie i spokojnie, chociaż rzadko zaskakuje nas czymś ekstra.',
        'Pomoże, jeśli ktoś konkretnie poprosi o poradę, ale raczej sam nie wychodzi pierwszy z żadną inicjatywą.',
        'Fajnie by było, jakby czasem odważył się głośniej zaprezentować swoje pomysły na szerszym forum firmy.',
        'Mocno skupiony wyłącznie na przetrwaniu dzisiejszego dnia. Warto by spróbował spojrzeć na proces z lotu ptaka.',
        'Ma głowę pełną pomysłów, tylko trochę zbyt długo i zachowawczo ukrywa je w sobie zamiast rzucić na stół.',
        'Z reguły potrzebuje bezpośredniego zachęcenia przez przełożonego, żeby samemu wziąć się za coś innowacyjnego.',
        'Płynie raczej z prądem. Angażuje się w zmiany dopiero, kiedy z góry narzuca to ogólna sytuacja w dziale.',
      ],
      low: [
        'Jest z góry negatywnie nastawiony na słowo "zmiana". Jak wprowadzamy nowości, to u niego jest tylko zgrzytanie zębów.',
        'Robi przysłowiowe "absolutne minimum", byle tylko odhaczyć 8 godzin, spakować się i nie interesować się resztą.',
        'Ma w sobie dużo pesymizmu. Kiedy szukamy rozwiązania, on skupia się na znalezieniu 10 nowych powodów dlaczego to nie zadziała.',
        'Zupełnie brakuje u niego otwartości na wsparcie kolegów z biurka obok, zachowuje się trochę "egoistycznie" zadaniowo.',
        'Stosuje wymówki jako główną tarczę. O wiele częściej słyszę od niego, że to "nie leży w jego kompetencjach".',
        'Zamiast wyciągać wnioski, woli tkwić w przestarzałych procesach, bo uważa że "przecież zawsze tak się to robiło".',
        'Daje się zauważyć bardzo mocny zjazd jego zaangażowania. Dawniej chciało mu się bardziej, teraz jest zupełnie odcięty.',
      ],
    },
  },
`;

content = preMatch[1] + newQuestions + postMatch[1];
fs.writeFileSync('src/data/surveyQuestions.ts', content);
console.log("Updated DEFAULT_QUESTIONS with contextual scores and natural loose language!");

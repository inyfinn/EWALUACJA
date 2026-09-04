const fs = require('fs');
let content = fs.readFileSync('src/data/surveyQuestions.ts', 'utf8');

// I will extract the file up to `export const DEFAULT_QUESTIONS = [`
// and after the end of DEFAULT_QUESTIONS, and reconstruct DEFAULT_QUESTIONS with the new loose texts.

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
    factors: {
      high: [
        'Zajebisty kontakt: Gada się z nim mega konkretnie, od razu łapie w lot o co chodzi.',
        'Klarowność: Wali prosto z mostu, zero owijania w bawełnę i korpo-gadki.',
        'Luz i empatia: Wnosi taki fajny chill do zespołu, że aż się chce z nim robić te projekty.',
        'Słuchanie: Serio gość słucha co się do niego mówi i nie musi 10 razy pytać o to samo.',
        'Pozytywna aura: Zajebiście rozładowuje napięcie, z każdym potrafi złapać fajny przelot.',
        'Szczerość: Jak coś spierdoli, to mówi prosto z mostu i od razu to naprawia.',
        'Asertywność: Umie elegancko powiedzieć "nie", zachowując przy tym pełen szacunek.',
        'Pomocna dłoń: Zawsze znajdzie chwilę, żeby na luzaku odpisać i podrzucić rozwiązanie.',
        'Rozwiązywanie kwasów: Świetnie gasi konflikty, nie daje się wciągnąć w firmowe dramy.',
        'Przejrzystość: Mega czytelne maile i notatki, wszystko widać jak na dłoni bez zgadywania.',
      ],
      mid: [
        'Rzeczowość: Komunikacja jest okej, chociaż czasem trochę zbyt oschła.',
        'Uważność: Fajnie słucha, ale czasem zdarza mu się zapomnieć o jakimś detalu z maila.',
        'Relacje: Dogadujemy się bez problemu, jest poprawnie, bez większych fajerwerków.',
        'Feedback: Przydałoby się, żeby dawał znać szybciej na jakim etapie jest sprawa.',
        'Asertywność: Czasem za szybko godzi się na wrzutki zamiast twardo negocjować termin.',
        'Klarowność: Zdarza się, że muszę dopytać co autor miał na myśli, ale ogólnie jest spoko.',
        'Rozmowy: Wolę z nim gadać na żywo, bo na Slacku/mailu pisze trochę zbyt formalnie.',
      ],
      low: [
        'Blokada: Bardzo słabo odpisuje, czasem trzeba go ganiać żeby dostać zwykłe tak/nie.',
        'Chaos informacyjny: Strasznie mota w wiadomościach, nie wiadomo w końcu o co chodzi.',
        'Głuchy telefon: Puszczasz informacje i nie masz pojęcia, czy w ogóle to przeczytał.',
        'Ton: Często bywa nieprzyjemny albo zbyt sarkastyczny, co psuje atmosferę.',
        'Defensywa: Zbyt osobiście bierze każdy feedback i od razu się tłumaczy/broni.',
        'Brak taktu: Zdarza mu się walnąć coś bez przemyślenia, co rodzi niepotrzebne konflikty.',
        'Trudny kontakt: Ogólnie ciężko się z nim dogadać i ułożyć płynną, ludzką współpracę.',
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
    factors: {
      high: [
        'Słowo honoru: Jak powiedział, że będzie, to będzie siedzieć do północy, ale dowiezie.',
        'Dyscyplina: Jest przejebany, sam sobie wszystko tak super planuje, że nigdy nie ma wtopy.',
        'Spokój w pożarach: Kiedy wszystko płonie, on na luzaku ogarnia priorytety i ratuje tyłek.',
        'Niezawodność: Można mu rzucić temat i po prostu o nim zapomnieć, bo wiadomo że zrobi.',
        'Estymacje: Kurde, jak mówi że coś zajmie 3 dni, to idealnie mieści się w punkt.',
        'Szczerość czasowa: Z góry wali, że nie da rady czegoś zrobić na jutro, zamiast ściemniać.',
        'Wielowątkowość: Robi 5 projektów naraz i jakimś cudem żaden nie leży. Klasa.',
        'Porządek: Zajebiście ogarnięty kalendarz i taski, u niego wszystko działa jak w szwajcarskim zegarku.',
        'Zaufanie: Śpisz spokojnie jak on ma projekt, bo kontroluje każdy, nawet najmniejszy deadline.',
        'Przejrzystość: Na bieżąco rzuca update, wiesz na jakim jest etapie bez zadawania pytań.',
      ],
      mid: [
        'Regularność: Zazwyczaj jest na czas, chociaż czasem coś utknie na ostatniej prostej.',
        'Priorytety: Ogarnia bazowe tematy super, ale drobnostki potrafią mu długo leżeć w kolejce.',
        'Ostrzeganie: Mógłby dawać znać o pół dnia wcześniej, że jednak nie wyrobi się z czasem.',
        'Wycena: Często jest zbytnim optymistą czasowym i potem musi gonić na pełnych obrotach.',
        'Organizacja: Trochę gubi rytm, jak wpadną mu ze 2-3 niezapowiedziane wrzutki od szefa.',
        'Deadline: Dopina sprawy na ostatnią chwilę – dowozi, ale kosztuje to czasem trochę nerwów.',
        'Follow-up: Czasami trzeba mu delikatnie przypomnieć, żeby pchnął zapomniany temat.',
      ],
      low: [
        'Brak ostrzeżeń: Zero info o poślizgach, dowiadujesz się po terminie, że temat nawet nie ruszył.',
        'Opóźnienia: Regularnie nie dowozi tego, na co się umawia. Strasznie to rozwala pracę innym.',
        'Chaos: Łapie za dużo srok za ogon i w efekcie mało co jest doprowadzane do końca.',
        'Nieterminowość: Zdecydowanie musi przestać odkładać najtrudniejsze taski na ostatni moment.',
        'Szacunki: Zupełnie nie potrafi wycenić ile czasu zajmie mu praca – ciągle przeszacowuje.',
        'Gubienie wątków: Notorycznie zapomina o ustaleniach, które nie zostały nigdzie zapisane.',
        'Stres: Bardzo źle radzi sobie z presją, jak jest dużo roboty to całkowicie się blokuje.',
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
        'Automatyzacja: On to jest mózg, do wszystkiego używa swoich małych programików i skryptów.',
        'Patenty: Na pewno ma na to już napisany jakiś programik, który mu robi połowę roboty.',
        'Perfekcja: Gość ma taką smykałkę, po prostu siada, robi robotę, że kopara opada i gotowe.',
        'Bystrzak: Łapie lotne tematy w mgnieniu oka, nie ma problemu którego by samodzielnie nie rozpykał.',
        'Jakość premium: Dowozi tak dopracowane rzeczy, że nawet nie trzeba po nim tego weryfikować.',
        'Ekspertyza: Autentyczny wymiatacz w swojej działce, jak masz trudne pytanie to tylko do niego.',
        'Niezależność: Podejmuje trafne decyzje, nie truje tyłka o byle co, tylko bierze i załatwia.',
        'Dokładność: Jest pedantyczny w dobrym tego słowa znaczeniu – zero głupich błędów czy literówek.',
        'Ambicja: Poniżej pewnego zajebistego poziomu nie schodzi. Wnosi do firmy mega jakość.',
        'Czystość: Nawet najnudniejsze dokumenty i tabelki wyglądają u niego super czysto i czytelnie.',
      ],
      mid: [
        'Poprawność: Robota jest zrobiona spoko, chociaż czasem brakuje takiego ostatecznego szlifu.',
        'Weryfikacja: Przy standardach super, ale przy całkowicie nowych tematach trzeba jeszcze rzucić okiem.',
        'Rozwiązywanie problemów: Z reguły sam daje radę, choć przy grubszych zatorach musi pytać.',
        'Skrupulatność: Przydałoby się, żeby robił szybki self-check zanim wyśle coś do klienta/zespołu.',
        'Sztampa: Dobrze zna swój wycinek pracy, ale trochę omija wgryzanie się w nowe, dziwne tematy.',
        'Pewność siebie: Czasami ma fajne wnioski, ale za cicho o nich mówi i chowa je do szuflady.',
        'Szczegóły: Od czasu do czasu w pośpiechu przepuści jakiegoś babola, chociaż szybko to poprawia.',
      ],
      low: [
        'Błędy: Strasznie dużo niedopatrzenia. Często ktoś po nim musi robić kontrolę jakości.',
        'Nieczytelność: Robi bardzo "na brudno", jego formatowanie czy pliki to czasem totalny chaos.',
        'Brak samodzielności: Prowadzenie za rączkę – co chwilę pyta o rzeczy, które mógłby wygooglać.',
        'Powtarzanie wtóp: Kurde, najgorsze, że dosyć często popełnia dokładnie te same błędy.',
        'Brak dbałości: Efekt jego prac często odstaje od naszych firmowych standardów, jest zrobiony na odwal się.',
        'Płycizna: Nie wgryza się głęboko w temat, tylko robi absolutne minimum po łebkach.',
        'Asysta: Żeby dowoził złożone rzeczy poprawnie, potrzeba nad nim dosłownie stać i mentorować.',
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
        'Napęd: Prawdziwa petarda, dodaje wielkiego kopa całemu działowi swoją pozytywną energią.',
        'Patenty: Stale przynosi jakieś zaje-fajne pomysły, które faktycznie oszczędzają nam masę czasu.',
        'Wsparcie: Super kumpel do pomocy, od razu rzuca się pomagać i pokazuje własne myczki i triki.',
        'Inicjatywa: Sam widzi co nie działa i przychodzi z gotowym, super mądrym rozwiązaniem.',
        'Pasja: Po prostu gołym okiem widać, że gościowi się w chuj chce i ma z tego fun.',
        'Szerokie horyzonty: Nie kisi się w swoim kociołku, patrzy też jak pomóc innym działom obok.',
        'Wzięcie na klatę: Sam się zgłasza do nowych trudnych tematów i bierze za nie pełną odpowiedzialność.',
        'Elastyczność: Zero marudzenia jak wpadnie jakaś gruba nowość – po prostu siada i rozkminia.',
        'Rozwój: Zajebiście chłonie wiedzę. Mega progresuje i ciągnie za sobą do góry też innych.',
        'Oszczędności: Jego wkład autentycznie robi różnicę i optymalizuje koszty w zespole. Sztos.',
      ],
      mid: [
        'Solidność: Robi to, czego się od niego oczekuje, ale rzadko rzuca się z jakimiś rewolucjami.',
        'Wsparcie: Jak poprosisz to pomoże, ale raczej sam z siebie nie wyskoczy z inicjatywą.',
        'Strefa komfortu: Fajnie by było, jakby czasem odważył się wyjść z nowym pomysłem na forum.',
        'Rutyna: Mocno operacyjny, skupia się na tu i teraz. Warto by spróbował spojrzeć szerzej.',
        'Ukryty potencjał: Gość ma łeb na karku, tylko trochę za bardzo kisi te swoje pomysły w szufladzie.',
        'Oczekiwane polecenia: Raczej czeka na zielone światło i zadanie od szefa, niż działa sam z siebie.',
        'Reaktywność: Kiedy sytuacja tego wymusi, to się angażuje. Na co dzień płynie z prądem.',
      ],
      low: [
        'Opornik: Ma straszny ból tyłka o wszelkie nowości. Z góry zakłada, że nowe = złe.',
        'Marazm: Widać u niego mocny zjazd zaangażowania, robi absolutne, gołe minimum byle odbębnić.',
        'Bierność: Typowe czekanie "aż samo się rozwiąże" albo "niech się inni martwią".',
        'Pesymista: Więcej u niego narzekania i wynajdywania problemów, niż chęci do ich ogarniania.',
        'Zamknięcie: Działa totalnie z klapkami na oczach, nie interesuje go wsparcie reszty paczki.',
        'Wymówki: Dość mocno obudował się alibi, zawsze znajdzie powód, dlaczego to nie jego robota.',
        'Cofanie się: Zamiast szukać optymalizacji, woli ślęczeć nad przestarzałymi procesami.',
      ],
    },
  },
`;

content = preMatch[1] + newQuestions + postMatch[1];
fs.writeFileSync('src/data/surveyQuestions.ts', content);
console.log("Updated DEFAULT_QUESTIONS with loose language!");

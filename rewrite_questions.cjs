const fs = require('fs');

let content = fs.readFileSync('src/data/surveyQuestions.ts', 'utf8');

// kom_1
content = content.replace(/questionText: 'Jak ogólnie oceniasz komunikację.*?Krzysztofem Wieczorkiem\?',/g, 
`subQuestions: [
      { id: 'kom_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz jasność i efektywność komunikacji w codziennych zadaniach?' },
      { id: 'kom_1_perception', label: 'Postrzeganie osoby', text: 'Jakie ogólne wrażenie sprawia Krzysztof w kontaktach zawodowych?' },
      { id: 'kom_1_relation', label: 'Relacje partnerskie', text: 'Jak oceniasz jakość budowanych przez niego relacji i atmosferę współpracy?' }
    ],`);

// term_1
content = content.replace(/questionText: 'Jak oceniasz.*?w zespole\?',/g, 
`subQuestions: [
      { id: 'term_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz punktualność i terminowość dostarczania powierzonych mu zadań?' },
      { id: 'term_1_perception', label: 'Postrzeganie osoby', text: 'Czy postrzegasz go jako osobę godną zaufania i rzetelną w swoich deklaracjach?' },
      { id: 'term_1_relation', label: 'Wpływ na zespół', text: 'W jakim stopniu jego zarządzanie czasem wspiera organizację Twojej własnej pracy?' }
    ],`);

// jak_1
content = content.replace(/questionText: 'Jak oceniasz staranność.*?rezultatów\?',/g, 
`subQuestions: [
      { id: 'jak_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz merytoryczną jakość, bezbłędność i staranność wykonywanych przez niego obowiązków?' },
      { id: 'jak_1_perception', label: 'Postrzeganie osoby', text: 'Czy postrzegasz pracownika jako niezależnego profesjonalistę, który dba o wysoki standard swojej pracy?' },
      { id: 'jak_1_relation', label: 'Wsparcie jakościowe', text: 'W jakim stopniu poziom merytoryczny jego pracy ułatwia i wspiera funkcjonowanie innych?' }
    ],`);

// wklad_1
content = content.replace(/questionText: 'Jak oceniasz zaangażowanie.*?Krzysztofa Wieczorka\?',/g, 
`subQuestions: [
      { id: 'wklad_1_task', label: 'Współpraca zadaniowa', text: 'Jak oceniasz jego wkład własny i zaangażowanie w wykonywanie codziennych procesów?' },
      { id: 'wklad_1_perception', label: 'Postrzeganie osoby', text: 'Czy w Twoich oczach jest to osoba poszukująca nowych rozwiązań i usprawnień?' },
      { id: 'wklad_1_relation', label: 'Motywowanie innych', text: 'Jak jego własna inicjatywa i chęć pomocy wpływa na współpracę całego zespołu?' }
    ],`);

fs.writeFileSync('src/data/surveyQuestions.ts', content);
console.log("Updated questions");

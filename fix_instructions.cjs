const fs = require('fs');

let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

const instructionHTML = `
      {/* Intrukcja wypełniania ankiety (Widoczna na starcie) */}
      {currentStepIndex === 0 && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-4 sm:p-5 shadow-sm">
          <h3 className="text-sm sm:text-base font-black text-indigo-900 mb-2 flex items-center gap-2">
             <HelpCircle className="w-5 h-5 text-indigo-500" /> 
             Jak wypełniać tę ankietę?
          </h3>
          <p className="text-xs sm:text-sm text-indigo-800/80 leading-relaxed mb-0">
             Oceniamy tutaj pracownika na wielu płaszczyznach. To jest pierwsza z nich. 
             Wybierz odpowiednią liczbę na suwaku (od 1 do 11) dla każdego pytania, 
             a na końcu zaznacz komentarz, który najlepiej oddaje powód Twojej oceny. 
             Gdy odpowiesz na wszystkie pytania w sekcji, przejdziesz do kolejnej płaszczyzny.
          </p>
        </div>
      )}
      {/* Visual 4-Step Navigation Stepper Tabs`;

content = content.replace(
  /\{\/\* Visual 4-Step Navigation Stepper Tabs/g,
  instructionHTML
);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);

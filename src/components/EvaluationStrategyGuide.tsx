import React, { useState } from 'react';
import { 
  Building2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Clock, 
  Target, 
  CheckCircle2, 
  Compass,
  Briefcase,
  FileCheck
} from 'lucide-react';

export const EvaluationStrategyGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('agenda');

  const toggle = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Przewodnik Rozmowy Rocznej
          </span>
          <span className="text-xs text-slate-400">Kubara Sp. z o.o.</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Jak wykorzystać ankietę do rozmowy podsumowującej z przełożonym?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Przełożony poprosił o zebranie feedbacku na 4 polach (Komunikacja, Terminowość, Jakość, Wkład własny). 
          To podstawa do dojrzałej rozmowy: podsumowania roku, weryfikacji zadowolenia zespołu ze współpracy oraz zaplanowania <strong>dalszych celów rozwojowych</strong> i obszarów do doszlifowania.
        </p>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-4">
        {/* 1. STRUKTURA SPOTKANIA Z PRZEŁOŻONYM */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggle('agenda')}
            className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5 font-extrabold tracking-tight">
              <Compass className="w-5 h-5 text-slate-800 shrink-0" />
              1. Gotowy skrypt rozmowy: Podsumowanie osiągnięć i plan rozwoju
            </span>
            {openSection === 'agenda' ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          </button>
          {openSection === 'agenda' && (
            <div className="p-5 sm:p-6 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4 border-t border-slate-100">
              <p>
                Oto jak poprowadzić spotkanie w 4 logicznych krokach, wykorzystując wygenerowany z ankiety Raport PDF:
              </p>
              
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                    <span>Wstęp i realizacja prośby przełożonego</span>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/60 mt-1.5">
                    „Zgodnie z naszą ustaleniami, poprosiłem współpracowników o anonimowy feedback na 4 wskazanych polach: Komunikacja, Terminowość, Jakość i Wkład własny. Przygotowałem z tego rzetelne podsumowanie.”
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                    <span>Podsumowanie wniesionej wartości i zadowolenia zespołu</span>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/60 mt-1.5">
                    „Bardzo zależało mi, aby dowiedzieć się, jak zespołowi się ze mną współpracuje i jak oceniają zrealizowane zadania. Raport wskazuje doceniane atuty, m.in. terminowość pod presją, samodzielność i dobrą kulturę współpracy.”
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
                    <span>Analiza: Co się udało, a jakie kwestie warto doszlifować</span>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/60 mt-1.5">
                    „Chcę również otwarcie spojrzeć na kwestie do dalszego doszlifowania w kolejnym roku. Zależy mi na ciągłym podnoszeniu jakości i efektywności pracy.”
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                    <span>Dalsza ścieżka rozwoju i kolejne cele</span>
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/60 mt-1.5">
                    „Po tym pierwszym roku czuję dużą motywację do dalszej pracy. Chciałbym zapytać, jak widzisz moją dalszą ścieżkę rozwoju w Kubara Sp. z o.o. oraz jakie nowe cele możemy wyznaczyć na kolejny okres.”
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. ANTY-DUPLIKAT I ANONIMOWOŚĆ */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggle('duplicates')}
            className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5 font-extrabold tracking-tight">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              2. Jak ankieta chroni anonimowość i zapobiega wielokrotnemu głosowaniu?
            </span>
            {openSection === 'duplicates' ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          </button>
          {openSection === 'duplicates' && (
            <div className="p-5 sm:p-6 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 border-t border-slate-100">
              <p>
                Aby feedback był szczery i w 100% wiarygodny:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-1 text-xs">🔑 Tokeny jednorazowe</span>
                  <span className="text-[11px] text-slate-600">Każdy współpracownik otrzymuje indywidualny kod. Po oddaniu głosu token staje się nieaktywny.</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-1 text-xs">🔒 Zero identyfikacji</span>
                  <span className="text-[11px] text-slate-600">Odpowiedzi są odseparowane od tożsamości – nikt nie wie, kto jak zagłosował.</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-1 text-xs">✍️ Skala 1–10 + Kryteria</span>
                  <span className="text-[11px] text-slate-600">Zamiast tekstu otwartego (gdzie widać styl pisania), współpracownicy wybierają gotowe kryteria behawioralne.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. DLACZEGO TE 4 POLA SĄ KLUCZOWE? */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggle('dimensions')}
            className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-slate-900 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5 font-extrabold tracking-tight">
              <Target className="w-5 h-5 text-slate-800 shrink-0" />
              3. 4 wymiary ewaluacji (komunikacja, terminowość, jakość, wkład własny)
            </span>
            {openSection === 'dimensions' ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          </button>
          {openSection === 'dimensions' && (
            <div className="p-5 sm:p-6 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 border-t border-slate-100">
              <p>
                Główne filary ewaluacji w firmie Kubara Sp. z o.o.:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block text-xs">💬 1. Komunikacja i atmosfera</span>
                  <span className="text-xs text-slate-600 mt-1 block">Pokazuje kulturę dialogu, otwartość na współpracę i budowanie zaufania między działami.</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block text-xs">⏱️ 2. Terminowość i niezawodność</span>
                  <span className="text-xs text-slate-600 mt-1 block">Świadczy o przewidywalności, dotrzymywaniu terminów i szanowaniu czasu innych.</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block text-xs">⭐ 3. Jakość i samodzielność</span>
                  <span className="text-xs text-slate-600 mt-1 block">Rzetelność, dokładność merytoryczna i brak konieczności ciągłych poprawek.</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="font-bold text-slate-900 block text-xs">💡 4. Wkład własny i inicjatywa</span>
                  <span className="text-xs text-slate-600 mt-1 block">Własne pomysły na usprawnienia, wspieranie zespołu i zaangażowanie w rozwój firmy.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

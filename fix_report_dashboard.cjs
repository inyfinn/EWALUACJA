const fs = require('fs');

let report = fs.readFileSync('src/components/ReportDashboard.tsx', 'utf8');

// 1. Update the Props interface to include new fields
report = report.replace(
  /keyTalkingPoints: string\[\];/g,
  `keyTalkingPoints: string[];
    employeeArchetype: { title: string; description: string; };
    competencyProfile: { relational: number; execution: number; quality: number; initiative: number; };`
);

// 2. We'll find a good place to insert the "Profil i Charakterystyka Pracownika"
// Let's insert it before the "Szczegółowy przegląd 4 wymiarów"
const overviewSectionTarget = `{/* --- WIDOK KAFELKOWY / WYKRESY (BENTO) --- */}`;

const profileSection = `
        {/* --- PROFIL PRACOWNIKA (NOWA SEKCJA ANALITYCZNA) --- */}
        {stats.totalResponses > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 mb-6">
            <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> Profil Pracownika: 
              <span className="text-indigo-600">{stats.employeeArchetype.title}</span>
            </h2>
            <p className="text-slate-600 text-sm mb-6 max-w-3xl leading-relaxed">
              {stats.employeeArchetype.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
               {[
                 { label: 'Współpraca i Relacje (EQ)', val: stats.competencyProfile.relational, color: 'bg-blue-500' },
                 { label: 'Niezawodność i Egzekucja', val: stats.competencyProfile.execution, color: 'bg-emerald-500' },
                 { label: 'Ekspertyza i Jakość', val: stats.competencyProfile.quality, color: 'bg-amber-500' },
                 { label: 'Inicjatywa i Proaktywność', val: stats.competencyProfile.initiative, color: 'bg-purple-500' }
               ].map((comp, idx) => (
                 <div key={idx}>
                   <div className="flex justify-between items-center mb-1.5">
                     <span className="text-xs font-bold text-slate-700">{comp.label}</span>
                     <span className="text-[10px] font-black text-slate-500">{comp.val}%</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                     <div className={\`h-2.5 rounded-full \${comp.color} transition-all duration-1000\`} style={{ width: \`\${comp.val}%\` }}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
        
        {/* --- WIDOK KAFELKOWY / WYKRESY (BENTO) --- */}`;

report = report.replace(overviewSectionTarget, profileSection);

// 3. Update the Scenariusz rozmowy to not be black
const darkCardTarget = `bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden`;
const lightCardReplacement = `bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-sm border border-indigo-100 mb-6 relative overflow-hidden`;
report = report.replace(darkCardTarget, lightCardReplacement);

// 4. Update the text colors inside the Scenariusz rozmowy
report = report.replace(/text-slate-400 font-black tracking-widest/g, 'text-indigo-600/80 font-black tracking-widest');
report = report.replace(/border-slate-800 pb-4/g, 'border-indigo-100 pb-4');
report = report.replace(/bg-slate-800\/50 border border-slate-700/g, 'bg-white border border-indigo-100 shadow-sm');
report = report.replace(/text-slate-400 mb-2/g, 'text-slate-500 mb-2');
report = report.replace(/text-emerald-400 font-bold/g, 'text-emerald-600 font-bold');
report = report.replace(/text-amber-400 font-bold/g, 'text-amber-600 font-bold');
report = report.replace(/text-slate-300 font-bold/g, 'text-slate-700 font-bold');
report = report.replace(/bg-emerald-500\/20 text-emerald-400/g, 'bg-emerald-100 text-emerald-700 border border-emerald-200');
report = report.replace(/bg-emerald-500 text-white/g, 'bg-emerald-600 text-white');
report = report.replace(/bg-slate-800 text-slate-400/g, 'bg-white text-slate-500 border border-slate-200');

fs.writeFileSync('src/components/ReportDashboard.tsx', report);
console.log("Updated ReportDashboard.tsx");

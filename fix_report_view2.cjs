const fs = require('fs');

let content = fs.readFileSync('src/components/ReportDashboard.tsx', 'utf8');

// 1. Fix the distribution breakdown
content = content.replace(
  /grid-cols-10/g,
  'grid-cols-11'
);

content = content.replace(
  /Rozkład ocen \(1 do 10\):/g,
  'Rozkład ocen (1 do 11):'
);

content = content.replace(
  /\{\[1, 2, 3, 4, 5, 6, 7, 8, 9, 10\]\.map/g,
  '{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map'
);

// 2. Fix the factor text rendering. Replace the inner span.
content = content.replace(
  /<span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">\s*\{driver\.text\}\s*<\/span>/g,
  `<div className="flex flex-col text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
      {driver.text.includes(':') ? (
        <>
          <span className="font-black text-emerald-800">{driver.text.split(':')[0]}</span>
          <span className="font-normal text-slate-600">{driver.text.split(':').slice(1).join(':').trim()}</span>
        </>
      ) : (
        <span>{driver.text}</span>
      )}
   </div>`
);

content = content.replace(
  /<span className="leading-snug">✓ \{f\.text\}<\/span>/g,
  `<div className="flex flex-col gap-0.5">
      {f.text.includes(':') ? (
        <>
          <span className="text-[11px] font-black text-emerald-800">✓ {f.text.split(':')[0]}</span>
          <span className="leading-snug text-slate-700 pl-4">{f.text.split(':').slice(1).join(':').trim()}</span>
        </>
      ) : (
        <span className="leading-snug">✓ {f.text}</span>
      )}
   </div>`
);

content = content.replace(
  /<span className="leading-snug">💡 \{f\.text\}<\/span>/g,
  `<div className="flex flex-col gap-0.5">
      {f.text.includes(':') ? (
        <>
          <span className="text-[11px] font-black text-amber-900">💡 {f.text.split(':')[0]}</span>
          <span className="leading-snug text-amber-900 pl-5">{f.text.split(':').slice(1).join(':').trim()}</span>
        </>
      ) : (
        <span className="leading-snug">💡 {f.text}</span>
      )}
   </div>`
);

fs.writeFileSync('src/components/ReportDashboard.tsx', content);
console.log("Updated ReportDashboard.tsx");

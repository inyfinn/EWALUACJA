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

// 2. Fix the factor text rendering (topPositiveFactors and topImprovementFactors) in Dimension section
const oldPositiveSpan = `<span className="leading-snug">✓ {f.text}</span>`;
const newPositiveSpan = `<div className="flex flex-col gap-0.5 w-full">
                              {f.text.includes(':') ? (
                                <>
                                  <span className="text-[11px] font-black text-emerald-800">
                                    ✓ {f.text.split(':')[0]}
                                  </span>
                                  <span className="leading-snug text-slate-700 pl-4">{f.text.split(':').slice(1).join(':').trim()}</span>
                                </>
                              ) : (
                                <span className="leading-snug">✓ {f.text}</span>
                              )}
                            </div>`;

content = content.replace(new RegExp(oldPositiveSpan.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newPositiveSpan);

const oldImprovementSpan = `<span className="leading-snug">💡 {f.text}</span>`;
const newImprovementSpan = `<div className="flex flex-col gap-0.5 w-full">
                              {f.text.includes(':') ? (
                                <>
                                  <span className="text-[11px] font-black text-amber-900">
                                    💡 {f.text.split(':')[0]}
                                  </span>
                                  <span className="leading-snug text-amber-900 pl-5">{f.text.split(':').slice(1).join(':').trim()}</span>
                                </>
                              ) : (
                                <span className="leading-snug">💡 {f.text}</span>
                              )}
                            </div>`;

content = content.replace(new RegExp(oldImprovementSpan.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), newImprovementSpan);

// 3. Fix the top global drivers and improvements sections.
// Those might not use the same spans. Let's find out how they are rendered.

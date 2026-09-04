const fs = require('fs');
let content = fs.readFileSync('src/components/SurveyFillView.tsx', 'utf8');

const oldNumbers = `<div className="absolute inset-0 w-full h-full flex flex-nowrap z-20">
          {[1,2,3,4,5,6,7,8,9,10,11].map(num => {
            const isSelected = value === num;
            return (
              <div key={num} className="flex-1 flex items-center justify-center font-black text-[11px] sm:text-[14px] select-none pointer-events-none min-w-0">
                 <span className={\`\${isSelected ? (num === 11 ? 'text-amber-600 scale-125' : 'text-slate-900 scale-125') : 'text-slate-500/80'} transition-transform duration-200 flex items-center justify-center whitespace-nowrap\`}>
                   {num === 11 && !isSelected ? <Crown className="w-3.5 h-3.5 text-amber-500/70" /> : num}
                 </span>
              </div>
            );
          })}
        </div>`;

const newNumbers = `<div className="absolute inset-0 w-full h-full flex flex-nowrap z-20 px-0.5">
          {[1,2,3,4,5,6,7,8,9,10,11].map(num => {
            const isSelected = value === num;
            return (
              <div key={num} className="flex-1 flex items-center justify-center font-black select-none pointer-events-none min-w-0">
                 <span 
                    className={\`transition-all duration-200 flex items-center justify-center whitespace-nowrap \${
                      isSelected 
                        ? (num === 11 ? 'text-amber-600 text-[14px] sm:text-[18px] scale-110' : 'text-slate-900 text-[14px] sm:text-[18px] scale-110') 
                        : 'text-slate-500/70 text-[9px] sm:text-[12px]'
                    }\`}
                 >
                   {num === 11 && !isSelected ? <Crown className="w-3 h-3 text-amber-500/70" /> : num}
                 </span>
              </div>
            );
          })}
        </div>`;

content = content.replace(oldNumbers, newNumbers);

fs.writeFileSync('src/components/SurveyFillView.tsx', content);
console.log("Updated slider numbers wrapping");

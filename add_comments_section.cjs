const fs = require('fs');
let content = fs.readFileSync('src/components/ReportDashboard.tsx', 'utf8');

const targetStr = '{/* Script for 1-on-1 Meeting - Bento Dark Card */}';
const replacement = `
        {/* Detailed Comments Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 mb-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
            Szczegółowe komentarze tekstowe od zespołu
          </h3>
          {responses.some(r => r.dimensionComments && Object.values(r.dimensionComments).some(c => c.trim().length > 0)) ? (
            <div className="space-y-4">
              {responses.map(resp => {
                const hasComments = resp.dimensionComments && Object.values(resp.dimensionComments).some(c => c.trim().length > 0);
                if (!hasComments) return null;
                
                return (
                  <div key={resp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                       <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                         Odpowiedź z {new Date(resp.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    {Object.entries(resp.dimensionComments).map(([dimId, comment]) => {
                       if (!comment.trim()) return null;
                       const q = questions.find(q => q.id === dimId);
                       return (
                         <div key={dimId} className="text-sm">
                           <span className="font-bold text-slate-700">{q?.dimensionTitle || dimId}:</span>
                           <p className="text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100 mt-1">"{comment}"</p>
                         </div>
                       );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Brak dodatkowych komentarzy tekstowych od uczestników.</p>
          )}
        </div>

        {/* Script for 1-on-1 Meeting - Bento Dark Card */}`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/ReportDashboard.tsx', content);
console.log("Added comments section");

import { useRef } from 'react';
import { LogFile } from '@/lib/fs';
import { Theme, getThemeColors } from '@/lib/theme';

export function Sidebar({ 
  currentDate, 
  changeMonth,
  viewMode, 
  setViewMode, 
  dirHandle, 
  logs, 
  isFallbackMode,
  onFallbackLoad,
  onClearDir,
  onNewFolder,
  needsResume,
  onResumeFolder,
  onRefresh,
  theme,
  showLogTitles,
  setShowLogTitles
}: any) {
  
  const yyyy = currentDate.getFullYear();
  const mmName = currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = getThemeColors(theme as Theme);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFallbackLoad?.(e.target.files);
    }
  };

  return (
    <aside className={`w-64 border-r ${colors.border} flex flex-col ${colors.panelBg} overflow-y-auto`}>
      
      {/* 01 TRACK INFO */}
      <div className={`p-4 border-b ${colors.border}`}>
        <div className={`text-[9px] tracking-widest ${colors.textMain} mb-4 pb-1 border-b ${colors.border}`}>01 TRACK INFO</div>
        <div className="flex items-center justify-between mt-2">
           <button onClick={() => changeMonth(-1)} className={`${colors.textSub} ${colors.textSubHover} p-1 transition-colors px-2`}>&lt;</button>
           <div className="text-center cursor-pointer" onClick={() => {
             // Reset to today when clicking the month/year
             const today = new Date();
             changeMonth((today.getFullYear() - yyyy) * 12 + today.getMonth() - currentDate.getMonth());
           }}>
             <div className={`text-sm font-bold ${colors.textMain} tracking-wider`}>{yyyy}</div>
             <div className={`text-xs ${colors.textSub}`}>{mmName}</div>
           </div>
           <button onClick={() => changeMonth(1)} className={`${colors.textSub} ${colors.textSubHover} p-1 transition-colors px-2`}>&gt;</button>
        </div>

        {/* MINI CALENDAR */}
        <div className="mt-4 grid grid-cols-7 gap-1 text-center select-none">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={`col-${idx}`} className={`text-[8px] ${colors.textSub} font-bold opacity-50`}>{day}</div>
          ))}
          {Array.from({ length: new Date(yyyy, currentDate.getMonth(), 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: new Date(yyyy, currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
            const day = i + 1;
            const isToday = new Date().toDateString() === new Date(yyyy, currentDate.getMonth(), day).toDateString();
            return (
              <div 
                key={`day-${day}`} 
                className={`text-[9px] py-1 transition-colors rounded-[2px] ${isToday ? `${colors.activeBg} ${colors.activeText}` : `${colors.textSub} ${colors.bgHover}`}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* 02 FORMATION ENGINE */}
      <div className={`p-4 border-b ${colors.border}`}>
        <div className={`text-[9px] tracking-widest ${colors.textMain} mb-4 pb-1 border-b ${colors.border}`}>02 FORMATION ENGINE</div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button 
            onClick={() => setViewMode('SQUARE')}
            className={`py-1.5 text-[10px] font-bold border flex items-center justify-center gap-2 transition-colors ${viewMode === 'SQUARE' ? `${colors.activeBg} ${colors.borderStrong} ${colors.textMain}` : `${colors.border} ${colors.textSub} ${colors.textSubHover}`}`}>
            <div className="flex flex-wrap w-2 h-2 gap-[1px]">
              <div className="w-[3px] h-[3px] bg-current"></div>
              <div className="w-[3px] h-[3px] bg-current"></div>
              <div className="w-[3px] h-[3px] bg-current"></div>
              <div className="w-[3px] h-[3px] bg-current"></div>
            </div>
            SQUARE
          </button>

          <button 
            onClick={() => setViewMode('LIST')}
            className={`py-1.5 text-[10px] font-bold border flex items-center justify-center gap-2 transition-colors ${viewMode === 'LIST' ? `${colors.activeBg} ${colors.borderStrong} ${colors.textMain}` : `${colors.border} ${colors.textSub} ${colors.textSubHover}`}`}>
            <span className="opacity-70">≡</span> LIST
          </button>
        </div>

        {/* SHOW LOG TITLES TOGGLE (Moved here) */}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color, rgba(0,0,0,0.1))' }}>
          <div className={`text-[10px] font-bold ${colors.textMain} tracking-widest flex items-center justify-between`}>
            <span>SHOW LOG TITLES</span>
            <span className={colors.textMain}>{showLogTitles ? 'ON' : 'OFF'}</span>
          </div>
          <div className={`flex border ${colors.borderStrong} p-0.5`} style={{ backgroundColor: theme === 'LIGHT' ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.2)' }}>
            <button onClick={() => setShowLogTitles(true)} className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${showLogTitles ? `${colors.activeBg} ${colors.activeText} shadow-sm border ${colors.borderStrong}` : colors.textSub}`}>ON</button>
            <button onClick={() => setShowLogTitles(false)} className={`flex-1 py-1 text-xs font-bold font-mono tracking-widest ${!showLogTitles ? `${colors.activeBg} ${colors.activeText} shadow-sm border ${colors.borderStrong}` : colors.textSub}`}>OFF</button>
          </div>
        </div>
      </div>

      {/* 03 DATA SETS */}
      <div className="p-4 flex-1">
        <div className={`text-[9px] tracking-widest ${colors.textMain} mb-4 pb-1 border-b ${colors.border}`}>03 DATA SETS</div>
        
        <div className="flex flex-col gap-2">
          {needsResume && !dirHandle && (
            <button onClick={onResumeFolder} className={`flex-1 border ${colors.borderStrong} py-2 font-bold text-[10px] ${colors.textMain} ${colors.accentBgHover} transition-colors bg-slate-800/50`}>
              再接続する (RESUME)
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onNewFolder} className={`flex-1 border ${colors.border} py-1.5 text-[10px] ${colors.textSub} ${colors.textSubHover} ${colors.borderHover} transition-colors`}>
              フォルダーを開く (CONNECT)
            </button>
          </div>
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full mt-3 border ${colors.border} border-dashed py-2 text-[10px] ${colors.textSub} ${colors.accentBgHover} flex flex-col items-center justify-center gap-1 transition-colors`}>
           <span className="font-bold">↓ DIRECTORY IMPORT</span>
           <span className="text-[8px] opacity-70">MEMORY ONLY / iFrame SAFE</span>
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          {...{ webkitdirectory: "", directory: "" } as any} 
          multiple
        />

        {dirHandle && (
           <div className={`mt-6 border ${colors.borderStrong} ${colors.panelBg} p-3 relative group`}>
             <button 
                onClick={onClearDir} 
                className={`absolute top-2 right-2 w-5 h-5 flex items-center justify-center border ${colors.border} ${colors.textSub} ${colors.textSubHover} ${colors.borderHover} transition-colors`}
                title="Clear Directory"
              >
               ✕
             </button>
             <div className={`text-[10px] ${colors.textMain} mb-1 flex justify-between pr-6`}>
                <span>TOTAL LOGS:</span>
                <span className={`${colors.textMain}`}>{logs.length}</span>
             </div>
             
             {isFallbackMode ? (
               <div className="mt-4 flex flex-col gap-1 text-[9px] text-yellow-600/80">
                  <div>⚠ VIEWER MODE ACTIVE</div>
                  <div>Read-only mode. Saves are disabled.</div>
               </div>
             ) : (
               <div className={`mt-4 flex flex-col gap-1 text-[9px] ${colors.textSub}`}>
                  <button onClick={onRefresh} className={`text-left ${colors.textSubHover} cursor-pointer transition-colors`}>[ REFRESH INDEX ]</button>
                  <div className="opacity-60">[x] YYYYMMDD_HHMM_ TITLE.txt</div>
               </div>
             )}
           </div>
        )}
      </div>
      
      <div className={`p-4 border-t ${colors.border} text-[8px] ${colors.textDim} flex justify-between`}>
         <span>SYSTEM_READY_</span>
         <span>ENGINE IDLE</span>
      </div>
    </aside>
  );
}

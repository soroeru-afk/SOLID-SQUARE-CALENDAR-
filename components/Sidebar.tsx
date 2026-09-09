import { useRef } from 'react';
import { LogFile } from '@/lib/fs';
import { Theme, getThemeColors } from '@/lib/theme';
import { FolderOpen, RefreshCw } from 'lucide-react';

export function Sidebar({
  currentDate,
  changeMonth,
  logs,
  onLogClick,
  onNewLog,
  dirHandle,
  onOpenFolder,
  onResumeFolder,
  onRefresh,
  theme,
  systemFont,
  dateFont,
  showMonthWatermark = true,
  monthWatermarkSize = 180,
  monthWatermarkOpacity = 10,
  monthWatermarkOffsetY = -15,
  showLogTitles,
  setShowLogTitles
}: any) {
  
  const yyyy = currentDate.getFullYear();
  const monthNum = currentDate.getMonth() + 1;
  const mmName = theme === "JAPAN" 
    ? `${monthNum}月` 
    : currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colors = getThemeColors(theme as Theme);

  const miniDays = theme === "JAPAN"
    ? ["日", "月", "火", "水", "木", "金", "土"]
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const logsByDate = logs.reduce((acc: Record<string, LogFile[]>, log: LogFile) => {
    if (!acc[log.dateStr]) acc[log.dateStr] = [];
    acc[log.dateStr].push(log);
    return acc;
  }, {});

  return (
    <aside className={`w-64 border-r ${colors.border} flex flex-col ${colors.panelBg} overflow-y-auto`}>
      
      {/* 01 TRACK INFO */}
      <div className={`p-4 border-b ${colors.border} relative overflow-hidden`}>
        <div className={`text-[9px] tracking-widest ${colors.textMain} mb-4 pb-1 border-b ${colors.border}`}>01 TRACK INFO</div>
        <div className="flex items-center justify-between mt-2">
           <button onClick={() => changeMonth(-1)} className={`${colors.textSub} ${colors.textSubHover} p-1 transition-colors px-2`}>&lt;</button>
           <div className="text-center">
             <div className={`text-xl font-bold tracking-wider ${colors.textMain}`}>{yyyy}</div>
             <div className={`text-xs tracking-widest ${colors.textSub} font-bold`}>{mmName}</div>
           </div>
           <button onClick={() => changeMonth(1)} className={`${colors.textSub} ${colors.textSubHover} p-1 transition-colors px-2`}>&gt;</button>
        </div>

        {/* MINI CALENDAR WITH MONTH WATERMARK */}
        <div className="mt-4 relative select-none">
          {/* DAY HEADERS */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {miniDays.map((day, idx) => (
              <div key={`col-${idx}`} className={`text-[10px] ${colors.textSub} font-bold opacity-50`}>{day}</div>
            ))}
          </div>

          {/* DATES CONTAINER (FIXED 6-ROW HEIGHT SO WATERMARK NEVER SHIFTS) */}
          <div className="relative h-[164px]">
            {/* BACKGROUND MONTH WATERMARK - CENTERED WITH ADJUSTABLE Y-OFFSET */}
            {showMonthWatermark && (
              <div 
                className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 ${colors.textMain}`}
                style={{ 
                  opacity: (monthWatermarkOpacity || 8) / 100,
                  transform: `translateY(${monthWatermarkOffsetY || 0}px)`,
                }}
                aria-hidden="true"
              >
                <span
                  className="font-bold leading-none select-none tracking-tighter"
                  style={{
                    fontFamily: dateFont,
                    fontSize: `${monthNum >= 10 ? Math.round(monthWatermarkSize * 0.82) : monthWatermarkSize}px`,
                  }}
                >
                  {monthNum}
                </span>
              </div>
            )}

            {/* DATES GRID */}
            <div className="relative z-10 grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: new Date(yyyy, currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-6" />
              ))}
              {Array.from({ length: new Date(yyyy, currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const day = i + 1;
                const isToday = new Date().toDateString() === new Date(yyyy, currentDate.getMonth(), day).toDateString();
                return (
                  <div 
                    key={`day-${day}`} 
                    className={`text-[9.5px] font-bold h-6 flex items-center justify-center transition-colors rounded-[2px] ${
                      isToday 
                        ? `${colors.activeBg} ${colors.activeText} shadow-xs ring-1 ${colors.borderStrong}` 
                        : `${colors.textMain} ${colors.bgHover}`
                    }`}
                    style={{
                      textShadow: colors.isDark 
                        ? '0 0 3px rgba(0,0,0,0.95), 0 0 5px rgba(0,0,0,0.85)' 
                        : '0 0 3px rgba(255,255,255,0.95), 0 0 5px rgba(255,255,255,0.9)',
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 02 SYSTEM CONTROLS */}
      <div className={`p-4 border-b ${colors.border}`}>
        <div className={`text-[9px] tracking-widest ${colors.textMain} mb-3 pb-1 border-b ${colors.border}`}>02 SYSTEM CONTROLS</div>
        
        {/* FOLDER CONNECT BUTTON */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onOpenFolder}
            className={`w-full py-2 px-3 border ${colors.borderStrong} ${colors.panelBg} ${colors.textMain} hover:${colors.activeBg} transition-colors flex items-center justify-between text-xs font-bold tracking-wider group shadow-sm`}
          >
            <span className="flex items-center gap-2">
              <FolderOpen size={14} className={colors.textSub} />
              {dirHandle ? "CHANGE LOG FOLDER" : "CONNECT LOG FOLDER"}
            </span>
            <span className={`text-[10px] ${colors.textSub} opacity-50 group-hover:opacity-100`}>F</span>
          </button>

          {/* REFRESH / RESUME ACTIONS */}
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className={`flex-1 py-1.5 px-2 border ${colors.border} ${colors.itemBg} ${colors.textSub} ${colors.textSubHover} hover:${colors.borderStrong} transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider`}
              title="Refresh log files"
            >
              <RefreshCw size={12} />
              <span>REFRESH</span>
            </button>
            
            {dirHandle && (
              <button
                onClick={onResumeFolder}
                className={`flex-1 py-1.5 px-2 border ${colors.border} ${colors.itemBg} ${colors.textSub} ${colors.textSubHover} hover:${colors.borderStrong} transition-colors flex items-center justify-center text-[10px] font-bold tracking-wider`}
                title="Re-request permission for active folder"
              >
                <span>RESUME</span>
              </button>
            )}
          </div>
        </div>

        {/* DISPLAY OPTIONS */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
           <span className={`text-[10px] ${colors.textSub} font-bold tracking-wider font-mono`}>SHOW TITLES</span>
           <button 
             onClick={() => setShowLogTitles(!showLogTitles)}
             className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${colors.borderStrong} ${showLogTitles ? `${colors.activeBg} ${colors.activeText}` : colors.textSub}`}
           >
             {showLogTitles ? "ON" : "OFF"}
           </button>
        </div>
      </div>

      {/* 03 STATS / LOG COUNT */}
      <div className="p-4 flex-1 flex flex-col justify-end">
         <div className={`text-[9px] tracking-widest ${colors.textMain} mb-2 pb-1 border-b ${colors.border}`}>03 METRICS</div>
         <div className="flex justify-between items-baseline">
            <span className={`text-xs ${colors.textSub}`}>TOTAL LOGS</span>
            <span className={`text-lg font-bold ${colors.textMain}`}>{logs.length}</span>
         </div>
      </div>

    </aside>
  );
}

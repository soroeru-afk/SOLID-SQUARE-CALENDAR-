import { LogFile } from '@/lib/fs';
import { getMonthDays, toYYYYMMDD, formatTimeStr } from '@/lib/date-utils';
import { Theme, getThemeColors } from '@/lib/theme';

export function ListView({ currentDate, logs, onLogClick, onNewLog, theme, textSize, textFont, dateSize, dateFont, showLogTitles }: any) {
  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const todayYYYYMMDD = toYYYYMMDD(new Date());

  const colors = getThemeColors(theme as Theme);

  const logsByDate = logs.reduce((acc: Record<string, LogFile[]>, log: LogFile) => {
    if (!acc[log.dateStr]) acc[log.dateStr] = [];
    acc[log.dateStr].push(log);
    return acc;
  }, {});

  const getLogsForDay = (dateStr: string) => {
    return logsByDate[dateStr] || [];
  };

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className={`h-full flex flex-col p-4 w-full ${colors.textMain} relative`}>
      <div className={`flex-none flex items-center justify-between mb-4 border-b ${colors.border} pb-2 px-2`}>
         <div className={`text-[10px] ${colors.textMain} tracking-widest uppercase`}>04 DATA BANKS</div>
         <div className={`text-[10px] ${colors.textSub} tracking-widest flex gap-3`}>
           <span>SORT: <span className={`${colors.textMain}`}>DATE ↓</span></span>
           <span className={`${colors.textMain} font-bold`}>LIST VIEW</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-0 pb-4 no-scrollbar">
        {days.map((dateObj: Date) => {
           const dateStr = toYYYYMMDD(dateObj);
           const dayLogs = getLogsForDay(dateStr);
           const isToday = dateStr === todayYYYYMMDD;
           const dd = dateObj.getDate();
           const dName = dayNames[dateObj.getDay()];

           return (
             <div key={dateStr} className={`w-full flex border-b ${colors.border} group`}>
               {/* Left: Date */}
               <div className={`w-32 flex-none flex flex-col items-center justify-center py-6 border-r ${colors.border}`}>
                 <div className="flex flex-col items-center relative pl-4">
                   <div 
                     className={`font-bold leading-none ${isToday ? colors.textMain : colors.textSub}`}
                     style={{ fontSize: `${dateSize}px`, fontFamily: dateFont }}
                   >
                     {dd}
                   </div>
                   <div className={`text-[10px] ${colors.textMain} font-bold mt-1 text-center`}>{dName}</div>
                   <button 
                     onClick={() => onNewLog(dateObj)}
                     className={`absolute -right-2 top-0 translate-x-full opacity-0 group-hover:opacity-100 text-[10px] ${colors.textSub} ${colors.textSubHover} border ${colors.borderStrong} ${colors.borderHover} ${colors.panelBg} px-2 py-0.5 transition-colors whitespace-nowrap`}
                   >
                     + NEW
                   </button>
                 </div>
               </div>

               {/* Right: Logs */}
               <div className="flex-1 flex flex-col justify-center px-6 py-4">
                 {dayLogs.map((log: LogFile) => (
                   <div 
                     key={log.name} 
                     onClick={() => onLogClick(log)}
                     className={`flex items-center gap-4 py-3 border-b ${colors.border} last:border-b-0 cursor-pointer group/log ${colors.itemBgHover} transition-colors -mx-4 px-4`}
                   >
                     <div className={`text-[9px] ${colors.textSub} font-mono w-12 flex-none text-right`}>
                       {formatTimeStr(log.timeStr)}
                     </div>
                     <div 
                       className={`flex-1 ${colors.textMain} leading-relaxed font-bold truncate`}
                       style={{ fontSize: `${textSize}px`, fontFamily: textFont }}
                     >
                       {showLogTitles ? log.title : (<><span className="group-hover/log:hidden">***</span><span className="hidden group-hover/log:inline opacity-80 truncate" title={log.title}>{log.title}</span></>)}
                     </div>
                     <div className={`opacity-0 group-hover/log:opacity-100 text-[10px] ${colors.textMain} font-bold`}>EDIT</div>
                   </div>
                 ))}
                 
                 {dayLogs.length === 0 && (
                   <div className={`text-[10px] ${colors.textDim} italic py-2`}>NO RECORDS</div>
                 )}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}

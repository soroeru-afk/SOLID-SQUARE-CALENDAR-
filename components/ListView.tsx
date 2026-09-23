import { LogFile } from '@/lib/fs';
import { getMonthDays, toYYYYMMDD, formatTimeStr } from '@/lib/date-utils';
import { Theme, getThemeColors } from '@/lib/theme';
import * as JapaneseHolidays from "japanese-holidays";

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

  const dayNames = theme === "JAPAN" 
    ? ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"] 
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
           const dayOfWeek = dateObj.getDay();
           const dName = dayNames[dayOfWeek];

           let dateNumColor = isToday ? colors.textMain : colors.textSub;
           let dNameColor = colors.textMain;
           let holidayName = undefined;

           if (theme === "JAPAN") {
             holidayName = JapaneseHolidays.isHoliday(dateObj);
             if (dayOfWeek === 0 || holidayName) {
               dateNumColor = "text-red-600";
               dNameColor = "text-red-600";
             } else if (dayOfWeek === 6) {
               dateNumColor = "text-blue-600";
               dNameColor = "text-blue-600";
             } else {
               dateNumColor = colors.textMain;
             }
           }

           return (
             <div 
               key={dateStr} 
               className={`relative w-full flex border-b ${colors.border} group transition-colors ${
                 isToday ? `ring-1 ring-inset ${colors.todayRing}` : ""
               }`}
             >
               {/* TODAY STRIPED BACKGROUND */}
               {isToday && (
                 <div
                   className={`absolute inset-0 pointer-events-none z-0 ${colors.todayStripe}`}
                   aria-hidden="true"
                 />
               )}

               {/* Left: Date */}
               <div className={`relative z-10 w-32 flex-none flex flex-col items-center justify-center py-6 border-r ${colors.border}`}>
                 {isToday && (
                   <div className="mb-1.5">
                     <span className={`px-1.5 py-0.5 text-[9px] font-bold font-sans tracking-wider leading-none select-none rounded-[2px] shadow-xs ${colors.todayBadge}`}>
                       {theme === "JAPAN" ? "今日" : "TODAY"}
                     </span>
                   </div>
                 )}
                 <div className="flex flex-col items-center relative pl-4">
                   <div 
                     className={`font-bold leading-none ${dateNumColor}`}
                     style={{ fontSize: `${dateSize}px`, fontFamily: dateFont }}
                   >
                     {dd}
                   </div>
                   <div className={`text-xs ${dNameColor} font-bold mt-1 text-center`}>
                     {dName}
                     {holidayName && (
                        <div className="text-[11px] font-bold opacity-90 mt-1 max-w-[96px] leading-snug break-words">
                          {holidayName}
                        </div>
                     )}
                   </div>
                   <button 
                     onClick={() => onNewLog(dateObj)}
                     className={`absolute -right-2 top-0 translate-x-full opacity-0 group-hover:opacity-100 text-[10px] ${colors.textSub} ${colors.textSubHover} border ${colors.borderStrong} ${colors.borderHover} ${colors.panelBg} px-2 py-0.5 transition-colors whitespace-nowrap`}
                   >
                     + NEW
                   </button>
                 </div>
               </div>

               {/* Right: Logs */}
               <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-4">
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

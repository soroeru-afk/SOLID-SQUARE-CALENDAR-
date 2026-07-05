import { LogFile } from "@/lib/fs";
import { getCalendarDays, toYYYYMMDD, formatTimeStr } from "@/lib/date-utils";
import { Theme, getThemeColors } from "@/lib/theme";

export function GridSqView({
  currentDate,
  logs,
  onLogClick,
  onNewLog,
  theme,
  textSize,
  previewWidth,
  previewHeight,
  previewOpacity,
  textFont,
  dateSize,
  dateFont,
  showLogTitles,
}: any) {
  const days = getCalendarDays(
    currentDate.getFullYear(),
    currentDate.getMonth(),
  );
  const todayYYYYMMDD = toYYYYMMDD(new Date());

  const colors = getThemeColors(theme as Theme);

  const logsByDate = logs.reduce(
    (acc: Record<string, LogFile[]>, log: LogFile) => {
      if (!acc[log.dateStr]) acc[log.dateStr] = [];
      acc[log.dateStr].push(log);
      return acc;
    },
    {},
  );

  const getLogsForDay = (dateStr: string) => {
    return logsByDate[dateStr] || [];
  };

  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="h-full flex flex-col p-4 w-full">
      <div className="flex-none flex items-center justify-between mb-2">
        <div
          className={`text-[10px] ${colors.textMain} tracking-widest uppercase`}
        >
          04 CALENDAR BANKS
        </div>
        <div
          className={`text-[10px] ${colors.textSub} tracking-widest flex gap-3`}
        >
          <span>
            SORT: <span className={`${colors.textMain}`}>DATE ↓</span>
          </span>
          <span className={`${colors.textMain} font-bold`}>GRID-SQ VIEW</span>
        </div>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-7 gap-1 flex-none mb-1">
        {dayNames.map((name) => (
          <div
            key={name}
            className={`text-[9px] font-bold ${colors.textMain} tracking-widest text-center py-1`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-[2px] overflow-hidden">
        {days.slice(0, 35).map((dateStrObj: Date, idx: number) => {
          const dateStr = toYYYYMMDD(dateStrObj);
          const isCurrentMonth =
            dateStrObj.getMonth() === currentDate.getMonth();
          const dayLogs = getLogsForDay(dateStr);
          const isToday = dateStr === todayYYYYMMDD;
          
          const isRightSide = (idx % 7) >= 4;
          const isBottom = idx >= 21;

          return (
            <div
              key={dateStr + idx}
              className={`relative border flex flex-col group transition-all duration-300 hover:z-50 hover:opacity-100
                ${isCurrentMonth ? `${colors.border} ${colors.itemBg}` : `${colors.border} opacity-50`} 
                ${isToday ? `ring-2 ring-inset ${colors.ring}` : ""}
              `}
            >
              {/* DEFAULT VIEW (CLIPPED) */}
              <div className="absolute inset-0 p-1 flex flex-col overflow-hidden pointer-events-none group-hover:opacity-0 transition-opacity">
                {/* DATE NUMBER */}
                <div
                  className={`absolute top-0 right-1 font-bold select-none leading-none pt-1 ${isToday ? colors.dateNumToday : colors.dateNum}`}
                  style={{ fontSize: `${dateSize}px`, fontFamily: dateFont }}
                >
                  {dateStrObj.getDate()}
                </div>

                <div className="flex-1 mt-6 flex flex-col gap-[2px]">
                  {showLogTitles &&
                    dayLogs.slice(0, 3).map((log: LogFile) => (
                      <div
                        key={log.name}
                        className={`border ${colors.borderStrong} ${colors.panelBg} ${colors.textMain} p-0.5 px-1 truncate pointer-events-auto ${colors.shadow}`}
                        style={{
                          fontSize: `${textSize}px`,
                          fontFamily: textFont,
                        }}
                      >
                        {log.title}
                      </div>
                    ))}
                  {showLogTitles && dayLogs.length > 3 && (
                    <div
                      className={`text-[9px] ${colors.textSub} mt-0.5 pl-1 font-bold`}
                    >
                      + {dayLogs.length - 3} LOGS
                    </div>
                  )}
                </div>
              </div>

              {/* OVERLAY EXPANDED VIEW (VISIBLE ON HOVER) */}
              <div
                className={`absolute ${isBottom ? 'bottom-0' : 'top-0'} ${isRightSide ? 'right-0' : 'left-0'} min-h-full ${colors.itemBg} border ${colors.borderStrong} ${colors.shadowLg} flex flex-col pointer-events-auto overlay-preview z-50 overflow-y-auto no-scrollbar`}
                style={{
                  width: `${previewWidth}%`,
                  maxHeight: `${previewHeight}px`,
                  "--preview-opacity": previewOpacity / 100,
                } as React.CSSProperties}
              >
                {/* PREVIEW HEADER */}
                <div className={`sticky top-0 left-0 w-full flex items-center justify-between z-30 p-1 mb-1 border-b ${colors.borderStrong} ${colors.itemBg}`}>
                  <button
                    onClick={() => onNewLog(dateStrObj)}
                    className={`shrink-0 w-4 h-4 ${colors.panelBg} border ${colors.borderStrong} ${colors.textSub} flex items-center justify-center text-[10px] ${colors.accentBgHover} ${colors.textSubHover} cursor-pointer shadow-sm transition-colors`}
                  >
                    +
                  </button>
                  <div 
                    className={`font-bold text-right leading-none ${isToday ? colors.dateNumToday : colors.textMain}`}
                    style={{ fontSize: `12px`, fontFamily: dateFont, letterSpacing: '0.1em' }}
                  >
                    {dateStrObj.toLocaleString("en-US", { month: "short" }).toUpperCase()} {dateStrObj.getDate()}
                  </div>
                </div>

                {/* LOG STACK */}
                <div className="relative z-20 flex flex-col gap-[2px] p-1 pt-0">
                  {dayLogs.map((log: LogFile) => (
                    <div
                      key={log.name}
                      onClick={() => onLogClick(log)}
                      className={`border ${colors.borderStrong} ${colors.panelBg} ${colors.textMain} p-0.5 px-1 truncate cursor-pointer ${colors.itemBgHover} ${colors.borderHover} ${colors.shadow} transition-colors`}
                      title={log.title}
                      style={{
                        fontSize: `${textSize}px`,
                        fontFamily: textFont,
                      }}
                    >
                      <span className="opacity-50 mr-1">
                        {formatTimeStr(log.timeStr)}
                      </span>
                      {log.title}
                    </div>
                  ))}
                  {dayLogs.length === 0 && (
                    <div className={`text-[9px] ${colors.textDim} mt-1 pl-1`}>
                      NO LOGS
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

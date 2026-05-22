export type Theme = 'NAVY' | 'LIGHT';
export type TextSize = 'SM' | 'MD' | 'LG';
export type FontType = 'SANS' | 'MONO' | 'SERIF';

export function getThemeColors(theme: Theme) {
  const isDark = theme === 'NAVY';
  return {
    isDark,
    bg: isDark ? 'bg-[#0B121C]' : 'bg-slate-50',
    panelBg: isDark ? 'bg-[#060A11]' : 'bg-white', // Sidebar etc
    itemBg: isDark ? 'bg-[#0E1724]' : 'bg-white', // Cards
    itemBgHover: isDark ? 'hover:bg-[#131F33]' : 'hover:bg-slate-50',
    border: isDark ? 'border-[#1C2C40]' : 'border-slate-300',
    borderStrong: isDark ? 'border-[#2B405C]' : 'border-slate-400',
    borderHover: isDark ? 'hover:border-[#385273]' : 'hover:border-slate-500',
    textMain: isDark ? 'text-[#CFE1F0]' : 'text-slate-900',
    textSub: isDark ? 'text-[#6A86A1]' : 'text-slate-500',
    textSubHover: isDark ? 'hover:text-[#A3BBD1]' : 'hover:text-slate-800',
    textDim: isDark ? 'text-[#455D75]' : 'text-slate-400',
    dateNum: isDark ? 'text-[#1C2C40]' : 'text-slate-300',
    dateNumToday: isDark ? 'text-[#385273]' : 'text-slate-500',
    accentBg: isDark ? 'bg-[#111B2B]' : 'bg-slate-200',
    accentBgHover: isDark ? 'hover:bg-[#1A2A40]' : 'hover:bg-slate-300',
    activeBg: isDark ? 'bg-[#20334C]' : 'bg-slate-200',
    activeText: isDark ? 'text-[#FFFFFF]' : 'text-slate-900',
    ring: isDark ? 'ring-[#2B405C]' : 'ring-slate-800',
    shadow: isDark ? 'shadow-none' : 'shadow-sm',
    shadowLg: isDark ? 'shadow-2xl shadow-black/80' : 'shadow-xl shadow-slate-200',
  };
}

export function getTextSizeClasses(size: TextSize) {
  switch (size) {
    case 'SM': return 'text-[9px] leading-[1.4]';
    case 'MD': return 'text-[12px] leading-[1.5]';
    case 'LG': return 'text-[15px] leading-[1.6]';
    default: return 'text-[9px]';
  }
}

export function getHeaderSizeClasses(size: TextSize) {
  switch (size) {
    case 'SM': return 'text-[10px]';
    case 'MD': return 'text-xs';
    case 'LG': return 'text-sm';
    default: return 'text-[10px]';
  }
}

export function getDateNumberSizeClasses(size: TextSize) {
  switch (size) {
    case 'SM': return 'text-4xl';
    case 'MD': return 'text-6xl';
    case 'LG': return 'text-8xl';
    default: return 'text-4xl';
  }
}

export function getFontFamilyClass(font: FontType) {
  switch (font) {
    case 'SANS': return 'font-sans';
    case 'MONO': return 'font-mono';
    case 'SERIF': return 'font-serif';
    default: return 'font-sans';
  }
}

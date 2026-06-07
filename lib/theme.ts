export type Theme = "NAVY" | "LIGHT" | "MONOTONE" | "ROSE";
export type TextSize = "SM" | "MD" | "LG";
export type FontType = "SANS" | "MONO" | "SERIF";

export function getThemeColors(theme: Theme) {
  if (theme === "MONOTONE") {
    return {
      isDark: true,
      bg: "bg-zinc-950",
      panelBg: "bg-black", // Header and Sidebar look
      itemBg: "bg-zinc-900",
      itemBgHover: "hover:bg-zinc-800",
      border: "border-zinc-800",
      borderStrong: "border-zinc-700",
      borderHover: "hover:border-zinc-600",
      textMain: "text-zinc-100",
      textSub: "text-zinc-400",
      textSubHover: "hover:text-zinc-200",
      textDim: "text-zinc-600",
      dateNum: "text-zinc-700",
      dateNumToday: "text-zinc-300",
      accentBg: "bg-zinc-900",
      accentBgHover: "hover:bg-zinc-800",
      activeBg: "bg-zinc-800",
      activeText: "text-white",
      ring: "ring-zinc-700",
      shadow: "shadow-none",
      shadowLg: "shadow-2xl shadow-black",
    };
  }

  if (theme === "ROSE") {
    return {
      isDark: false,
      bg: "bg-[#FDF8F8]",
      panelBg: "bg-[#FFFFFF]",
      itemBg: "bg-[#FFFFFF]",
      itemBgHover: "hover:bg-[#F9EFF0]",
      border: "border-[#DBC9CB]",
      borderStrong: "border-[#8C6D70]",
      borderHover: "hover:border-[#915B61]",
      textMain: "text-[#332225]",
      textSub: "text-[#765C5F]",
      textSubHover: "hover:text-[#8C484F]",
      textDim: "text-[#9E8789]",
      dateNum: "text-[#E6D6D8]",
      dateNumToday: "text-[#915B61]",
      accentBg: "bg-[#F5D8DB]",
      accentBgHover: "hover:bg-[#E8C2C6]",
      activeBg: "bg-[#EDDCE0]",
      activeText: "text-[#4A3B3E]",
      ring: "ring-[#915B61]/70",
      shadow: "shadow-sm shadow-[#8C6D70]/10",
      shadowLg: "shadow-xl shadow-[#8C6D70]/20",
    };
  }

  const isDark = theme === "NAVY";
  return {
    isDark,
    bg: isDark ? "bg-[#0B121C]" : "bg-slate-50",
    panelBg: isDark ? "bg-[#060A11]" : "bg-white", // Sidebar etc
    itemBg: isDark ? "bg-[#0E1724]" : "bg-white", // Cards
    itemBgHover: isDark ? "hover:bg-[#131F33]" : "hover:bg-slate-50",
    border: isDark ? "border-[#1C2C40]" : "border-slate-300",
    borderStrong: isDark ? "border-[#2B405C]" : "border-slate-400",
    borderHover: isDark ? "hover:border-[#385273]" : "hover:border-slate-500",
    textMain: isDark ? "text-[#CFE1F0]" : "text-slate-900",
    textSub: isDark ? "text-[#6A86A1]" : "text-slate-500",
    textSubHover: isDark ? "hover:text-[#A3BBD1]" : "hover:text-slate-800",
    textDim: isDark ? "text-[#455D75]" : "text-slate-400",
    dateNum: isDark ? "text-[#2B405C]" : "text-slate-400",
    dateNumToday: isDark ? "text-[#6A86A1]" : "text-slate-800",
    accentBg: isDark ? "bg-[#111B2B]" : "bg-slate-200",
    accentBgHover: isDark ? "hover:bg-[#1A2A40]" : "hover:bg-slate-300",
    activeBg: isDark ? "bg-[#20334C]" : "bg-slate-200",
    activeText: isDark ? "text-[#FFFFFF]" : "text-slate-900",
    ring: isDark ? "ring-[#2B405C]" : "ring-slate-400",
    shadow: isDark ? "shadow-none" : "shadow-sm",
    shadowLg: isDark
      ? "shadow-2xl shadow-black/80"
      : "shadow-xl shadow-slate-200",
  };
}

export function getTextSizeClasses(size: TextSize) {
  switch (size) {
    case "SM":
      return "text-[9px] leading-[1.4]";
    case "MD":
      return "text-[12px] leading-[1.5]";
    case "LG":
      return "text-[15px] leading-[1.6]";
    default:
      return "text-[9px]";
  }
}

export function getHeaderSizeClasses(size: TextSize) {
  switch (size) {
    case "SM":
      return "text-[10px]";
    case "MD":
      return "text-xs";
    case "LG":
      return "text-sm";
    default:
      return "text-[10px]";
  }
}

export function getDateNumberSizeClasses(size: TextSize) {
  switch (size) {
    case "SM":
      return "text-4xl";
    case "MD":
      return "text-6xl";
    case "LG":
      return "text-8xl";
    default:
      return "text-4xl";
  }
}

export function getFontFamilyClass(font: FontType) {
  switch (font) {
    case "SANS":
      return "font-sans";
    case "MONO":
      return "font-mono";
    case "SERIF":
      return "font-serif";
    default:
      return "font-sans";
  }
}

export interface ColorConfig {
  gradient: string;
  shadowRgb: string;
  highlight: string;
}

export const CONTROL_COLORS: ColorConfig[] = [
  // 0 coral
  { gradient: "radial-gradient(ellipse at 50% 20%, #ffcbb8 0%, #f87868 30%, #e84830 65%, #c83018 100%)", shadowRgb: "160,36,14",  highlight: "rgba(255,220,205,0.6)" },
  // 1 blue
  { gradient: "radial-gradient(ellipse at 50% 20%, #c8e8ff 0%, #74b8ff 30%, #3e88f0 65%, #2060cc 100%)", shadowRgb: "22,72,160",   highlight: "rgba(210,235,255,0.6)" },
  // 2 green
  { gradient: "radial-gradient(ellipse at 50% 20%, #b8f8d4 0%, #52e08a 30%, #1ec862 65%, #14a048 100%)", shadowRgb: "12,110,48",   highlight: "rgba(195,255,220,0.6)" },
  // 3 amber
  { gradient: "radial-gradient(ellipse at 50% 20%, #fde68a 0%, #fbbf24 30%, #d97706 65%, #b45309 100%)", shadowRgb: "140,80,0",    highlight: "rgba(255,240,180,0.6)" },
  // 4 purple
  { gradient: "radial-gradient(ellipse at 50% 20%, #e9d5ff 0%, #c084fc 30%, #9333ea 65%, #6b21a8 100%)", shadowRgb: "100,20,140",  highlight: "rgba(230,200,255,0.6)" },
  // 5 pink
  { gradient: "radial-gradient(ellipse at 50% 20%, #fce7f3 0%, #f472b6 30%, #ec4899 65%, #be185d 100%)", shadowRgb: "160,20,80",   highlight: "rgba(255,210,235,0.6)" },
  // 6 teal
  { gradient: "radial-gradient(ellipse at 50% 20%, #ccfbf1 0%, #2dd4bf 30%, #0d9488 65%, #0f766e 100%)", shadowRgb: "10,100,88",   highlight: "rgba(180,255,245,0.6)" },
];

/** Stable color assigned to a control by hashing its ID string. */
export function getControlColor(id: string): ColorConfig {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CONTROL_COLORS[h % CONTROL_COLORS.length];
}

/** Generates the standard puffy box-shadow for a pill button. */
export function pillBoxShadow(c: ColorConfig, size: "sm" | "md" = "md"): string {
  return size === "sm"
    ? `inset 0 1px 5px ${c.highlight}, inset 0 -3px 7px rgba(0,0,0,0.2), 0 5px 14px rgba(${c.shadowRgb},0.42)`
    : `inset 0 2px 10px ${c.highlight}, inset 0 -6px 14px rgba(0,0,0,0.18), 0 8px 22px rgba(${c.shadowRgb},0.45)`;
}

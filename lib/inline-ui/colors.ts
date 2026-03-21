export interface ColorConfig {
  gradient: string;
  shadowRgb: string;
  highlight: string;
}

export const CONTROL_COLORS: ColorConfig[] = [
  // 0 coral
  { gradient: "linear-gradient(180deg, #f07b68 0%, #e45438 58%, #c93a1d 100%)", shadowRgb: "160,36,14",  highlight: "rgba(255,220,205,0.16)" },
  // 1 blue
  { gradient: "linear-gradient(180deg, #71b4ff 0%, #448cf1 58%, #245fcd 100%)", shadowRgb: "22,72,160",   highlight: "rgba(210,235,255,0.16)" },
  // 2 green
  { gradient: "linear-gradient(180deg, #58df8c 0%, #25c965 58%, #169e4d 100%)", shadowRgb: "12,110,48",   highlight: "rgba(195,255,220,0.16)" },
  // 3 amber
  { gradient: "linear-gradient(180deg, #f2c448 0%, #db8a18 58%, #b75b0d 100%)", shadowRgb: "140,80,0",    highlight: "rgba(255,240,180,0.16)" },
  // 4 purple
  { gradient: "linear-gradient(180deg, #c489fb 0%, #9640ea 58%, #6e25a8 100%)", shadowRgb: "100,20,140",  highlight: "rgba(230,200,255,0.16)" },
  // 5 pink
  { gradient: "linear-gradient(180deg, #f27ab7 0%, #ec4c99 58%, #bf1d62 100%)", shadowRgb: "160,20,80",   highlight: "rgba(255,210,235,0.16)" },
  // 6 teal
  { gradient: "linear-gradient(180deg, #36d5c1 0%, #11998b 58%, #0e776d 100%)", shadowRgb: "10,100,88",   highlight: "rgba(180,255,245,0.16)" },
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

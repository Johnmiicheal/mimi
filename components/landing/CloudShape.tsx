"use client";

export function CloudShape({ scale = 1 }: { scale?: number }) {
  const w = 220 * scale;
  return (
    <div className="relative" style={{ width: w, height: w * 0.42 }}>
      <div
        className="absolute bottom-0 left-0 right-0 rounded-full"
        style={{
          height: "55%",
          background: "linear-gradient(to bottom, #ffffff, #eef3ff)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: "40%", left: "8%", width: "38%", height: "85%",
          background: "linear-gradient(to bottom, #ffffff, #f0f5ff)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: "42%", left: "30%", width: "44%", height: "100%",
          background: "linear-gradient(to bottom, #ffffff, #eef3ff)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: "35%", left: "58%", width: "32%", height: "75%",
          background: "linear-gradient(to bottom, #f8fbff, #e8f0ff)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        }}
      />
    </div>
  );
}

import { useEffect, useRef } from "react";
// Pixel-accurate robot silhouette (traced from the artwork's black outline), cropped to the globe disc.
import robotMaskUrl from "../assets/robot-mask.png";

// Pseudo-continents: threshold on a sum of smooth waves over lat/lon.
const isLand = (lat, lon) => {
  const a = lat * Math.PI / 180, b = lon * Math.PI / 180;
  const v =
    Math.sin(b * 2 + 1.3) * Math.cos(a * 2 - 0.4) +
    0.7 * Math.sin(b * 3 - a * 2 + 0.5) +
    0.5 * Math.cos(b * 5 + a * 3);
  return v > 0.55;
};


const DOTS = [];
for (let lat = -84; lat <= 84; lat += 5) {
  const step = 5 / Math.max(Math.cos((lat * Math.PI) / 180), 0.15);
  for (let lon = -180; lon < 180; lon += step) {
    if (isLand(lat, lon)) DOTS.push([(lat * Math.PI) / 180, (lon * Math.PI) / 180]);
  }
}

export default function SpinGlobe() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf, rot = 0, last = performance.now();
    const mask = new Image();
    mask.src = robotMaskUrl;
    mask.onload = () => { if (reduce) draw(performance.now()); };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
    };
    size();
    window.addEventListener("resize", size);

    const draw = (now) => {
      rot += ((now - last) / 1000) * 0.16; // rad/s: one turn ≈ 40s
      last = now;
      const w = cv.width, r = w / 2, dot = Math.max(w / 110, 3);
      ctx.clearRect(0, 0, w, w);
      // dark disc hides the static globe baked into the artwork
      const g = ctx.createRadialGradient(r, r, r * 0.2, r, r, r);
      g.addColorStop(0, "rgba(14,66,34,0.97)");
      g.addColorStop(0.75, "rgba(10,48,26,0.97)");
      g.addColorStop(1, "rgba(22,110,52,0.97)"); // brighter rim
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.fill();
      // meridians + parallels so the turning is easy to see
      ctx.strokeStyle = "#39FF65";
      ctx.lineWidth = Math.max(w / 600, 1);
      ctx.globalAlpha = 0.4;
      for (let m = 0; m < 12; m++) {
        const l = rot + (m * Math.PI) / 6;
        const sx = Math.sin(l);
        ctx.beginPath();
        let pen = false;
        for (let t = -90; t <= 90; t += 6) {
          const a = (t * Math.PI) / 180;
          if (Math.cos(a) * Math.cos(l) < 0) { pen = false; continue; }
          const x = r + r * Math.cos(a) * sx, y = r - r * Math.sin(a);
          if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          pen = true;
        }
        ctx.stroke();
      }
      for (const lat of [-60, -30, 0, 30, 60]) {
        const a = (lat * Math.PI) / 180, ry = r * Math.sin(a), rx = r * Math.cos(a);
        ctx.beginPath();
        ctx.ellipse(r, r - ry, rx, 0.001, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#6dff8f";
      ctx.shadowColor = "#39FF65";
      ctx.shadowBlur = dot * 1.5;
      for (const [lat, lon] of DOTS) {
        const l = lon + rot;
        const z = Math.cos(lat) * Math.cos(l);
        if (z <= 0) continue;
        const x = r + r * Math.cos(lat) * Math.sin(l);
        const y = r - r * Math.sin(lat);
        ctx.globalAlpha = 0.4 + 0.6 * z;
        ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot);
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      // cut the robot (and the ground it sits on) out so the artwork shows through untouched
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      if (mask.complete && mask.naturalWidth) ctx.drawImage(mask, 0, 0, w, w);
      ctx.restore();
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  return <canvas ref={ref} className="wg-spin-globe" aria-hidden="true" />;
}

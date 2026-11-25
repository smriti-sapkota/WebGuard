import { useEffect, useRef } from "react";
import Icon from "./Icon";
import robotImg from "../assets/hero-robot.webp";
import "../hero.css";

const PARTICLES = Array.from({ length: 26 }, (_, i) => {
  const r = (n) => {
    const x = Math.sin(i * 97.13 + n * 31.7) * 10000;
    return x - Math.floor(x);
  };
  return {
    left: `${r(1) * 100}%`,
    top: `${r(2) * 100}%`,
    size: 3 + Math.round(r(3) * 5),
    dur: 9 + r(4) * 14,
    delay: -r(5) * 20,
    dx: Math.round((r(6) - 0.5) * 80),
    dy: Math.round((r(7) - 0.5) * 120),
    op: 0.2 + r(8) * 0.45,
  };
});

const FEATURES = [
  { icon: "shieldcheck", title: "Real-Time Protection", text: "Block threats instantly" },
  { icon: "zap", title: "AI-Powered Detection", text: "Smarter, deeper analysis" },
  { icon: "chart", title: "Detailed Insights", text: "Know. Improve. Grow." },
  { icon: "users", title: "Trusted by Developers", text: "Built for the modern web" },
];

export default function Hero({ setPage }) {
  const artRef = useRef(null);

  // Irregular blinking: random gaps, occasional double blink.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t;
    const timers = [];
    const blink = (cb) => {
      artRef.current?.classList.add("shut");
      timers.push(
        setTimeout(() => {
          artRef.current?.classList.remove("shut");
          cb?.();
        }, 130),
      );
    };
    const loop = () => {
      t = setTimeout(
        () =>
          blink(() =>
            Math.random() < 0.25 ? timers.push(setTimeout(() => blink(loop), 170)) : loop(),
          ),
        1800 + Math.random() * 4200,
      );
    };
    loop();
    return () => {
      clearTimeout(t);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="wg-hero">
      <div className="wg-particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.op,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="wg-hero-inner">
        <div className="wg-copy">
          <div className="wg-tag"><i /> Secure · Monitor · Protect</div>
          <h1>
            Stronger Security.
            <br />
            <span>A Safer</span> Web.
          </h1>
          <p className="wg-desc">
            WebGuard helps you detect threats, prevent attacks, and keep your web
            applications <em>secure</em> — effortlessly.
          </p>
          <div className="wg-btns">
            <button className="wg-btn wg-btn-primary" onClick={() => setPage("scanner")}>
              Start Scanning
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button
              className="wg-btn wg-btn-ghost"
              onClick={() => document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 3l15 9-15 9z" />
              </svg>
            </button>
          </div>
          <div className="wg-try" aria-hidden="true">
            <svg width="70" height="40" viewBox="0 0 70 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 4C4 22 22 34 52 30M46 25l8 5-9 5" />
            </svg>
            <span>Try it now!</span>
          </div>
        </div>

        <div className="wg-stage">
          <div ref={artRef} className="wg-art">
            <img src={robotImg} alt="WebGuard pixel guardian holding a security shield in front of a digital globe" />
            <div className="wg-globe-sweep" aria-hidden="true" />
            <div className="wg-shield-glow" aria-hidden="true" />
            <span className="wg-lid wg-lid-l" aria-hidden="true" />
            <span className="wg-lid wg-lid-r" aria-hidden="true" />
          </div>

          <div className="wg-panel wg-panel-a">
            <div className="wg-dots"><i /><i /><i /></div>
            <div className="wg-scan-title">Scanning...</div>
            <div className="wg-bar"><b /></div>
          </div>
          <div className="wg-panel wg-panel-b">
            <div className="wg-tilt">
              {["No Threats Found", "All Systems Secure", "You're Safe!"].map((t) => (
                <div key={t} className="wg-check">
                  <Icon name="checkbox" size={22} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wg-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="wg-feature">
            <Icon name={f.icon} size={30} />
            <div>
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";

import { GardenLife } from "./GardenLife";

/**
 * Illustrated garden + waterfall scene with two elegant silhouettes
 * representing Shihab & Lia (not their real likeness). Everything is inline
 * SVG driven by one requestAnimationFrame clock, so the walk cycle, the sit
 * and the slow sideways camera pan stay perfectly in sync.
 *
 * Times are seconds since the guest tapped "Buka Undangan".
 */
export const JOURNEY_TIMES = {
  panStart: 4.4,
  panEnd: 10.4,
  walkStart: 4.6,
  walkEnd: 10.0,
  sitStart: 10.2,
  sitEnd: 11.8,
} as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const X_START = -40;
const X_SEAT = 414;
const groundY = (x: number) => 842 - ((x - X_START) / (X_SEAT - X_START)) * 52;
const depthScale = (x: number) => 1.1 - ((x - X_START) / (X_SEAT - X_START)) * 0.18;

type Limb = SVGGElement | null;

export function GardenJourney({ startAt }: { startAt: number }) {
  const back = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLDivElement>(null);
  const fore = useRef<HTMLDivElement>(null);
  const groom = useRef<SVGGElement>(null);
  const groomBody = useRef<SVGGElement>(null);
  const bride = useRef<SVGGElement>(null);
  const brideBody = useRef<SVGGElement>(null);
  const skirtStand = useRef<SVGGElement>(null);
  const skirtSit = useRef<SVGPathElement>(null);
  const limbs = useRef<Record<string, Limb>>({});
  const setLimb = (k: string) => (el: SVGGElement | null) => {
    limbs.current[k] = el;
  };

  useEffect(() => {
    let raf = 0;
    const T = JOURNEY_TIMES;
    const rot = (k: string, deg: number) => limbs.current[k]?.setAttribute("transform", `rotate(${deg.toFixed(2)})`);

    function frame(now: number) {
      const e = (now - startAt) / 1000;

      // Camera: one slow, steady pan towards the waterfall (no zooming).
      const pan = ease((e - T.panStart) / (T.panEnd - T.panStart));
      if (back.current) back.current.style.transform = `translate3d(${(-23 * pan).toFixed(3)}%,0,0)`;
      if (main.current) main.current.style.transform = `translate3d(${(-37.5 * pan).toFixed(3)}%,0,0)`;
      if (fore.current) fore.current.style.transform = `translate3d(${(-47 * pan).toFixed(3)}%,0,0)`;

      // Walk: position eases in/out; the stride is tied to distance so feet never slide.
      const wu = clamp01((e - T.walkStart) / (T.walkEnd - T.walkStart));
      const x = lerp(X_START, X_SEAT, ease(wu));
      const s = ease((e - T.sitStart) / (T.sitEnd - T.sitStart));
      const amp = Math.min(1, Math.sin(Math.PI * wu) * 1.8) * (1 - s);
      const phi = ((x - X_START) / 30) * Math.PI;
      const sin = Math.sin(phi);
      const cos = Math.cos(phi);
      const bob = -Math.abs(sin) * 1.4 * amp;
      const drop = 22 * s;

      const thighF = lerp(24 * amp * sin, -86, s);
      const thighB = lerp(-24 * amp * sin, -84, s);
      const shinF = lerp(14 * amp * Math.max(0, cos), 86, s);
      const shinB = lerp(14 * amp * Math.max(0, -cos), 84, s);
      const armF = lerp(-18 * amp * sin, -40, s);
      const armB = lerp(18 * amp * sin, -30, s);

      const xb = x;
      const xg = x - 15;
      groom.current?.setAttribute(
        "transform",
        `translate(${xg.toFixed(2)} ${(groundY(xg) - 6).toFixed(2)}) scale(${(depthScale(xg) * 0.98).toFixed(4)})`,
      );
      bride.current?.setAttribute(
        "transform",
        `translate(${xb.toFixed(2)} ${groundY(xb).toFixed(2)}) scale(${depthScale(xb).toFixed(4)})`,
      );
      groomBody.current?.setAttribute("transform", `translate(0 ${(bob + drop).toFixed(2)})`);
      brideBody.current?.setAttribute("transform", `translate(0 ${(bob * 0.8 + drop).toFixed(2)})`);

      rot("gThighF", thighF);
      rot("gThighB", thighB);
      rot("gShinF", shinF);
      rot("gShinB", shinB);
      rot("gArmF", armF);
      rot("gArmB", armB);
      rot("bArmF", lerp(-14 * amp * sin, -44, s));
      rot("bArmB", lerp(14 * amp * sin, -34, s));

      skirtStand.current?.setAttribute(
        "transform",
        `translate(0 -46) skewX(${(4 * amp * sin).toFixed(2)}) translate(0 46)`,
      );
      skirtStand.current?.setAttribute("opacity", (1 - s).toFixed(3));
      skirtSit.current?.setAttribute("opacity", s.toFixed(3));

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [startAt]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* BACK — sky, sun, distant hills */}
      <div ref={back} className="absolute inset-y-0 left-0 w-[130%] will-change-transform">
        <svg viewBox="0 0 640 900" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
          <defs>
            <linearGradient id="gj-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--garden-sky-top)" />
              <stop offset="0.45" stopColor="var(--garden-sky-mid)" />
              <stop offset="0.72" stopColor="var(--garden-sky-low)" />
            </linearGradient>
            <radialGradient id="gj-sun">
              <stop offset="0" stopColor="var(--gold-light)" stopOpacity="1" />
              <stop offset="0.25" stopColor="var(--gold-light)" stopOpacity="0.7" />
              <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="640" height="900" fill="url(#gj-sky)" />
          <circle cx="380" cy="560" r="190" fill="url(#gj-sun)" />
          <circle cx="380" cy="560" r="34" fill="var(--gold-light)" />
          <path d="M0 610 Q 120 540 250 590 T 470 570 T 640 585 L640 900 L0 900Z" fill="var(--garden-hill-far)" opacity="0.75" />
          <path d="M0 650 Q 150 590 300 640 T 640 625 L640 900 L0 900Z" fill="var(--garden-hill)" />
          {[60, 130, 210, 420, 480, 560, 610].map((cx, i) => (
            <circle key={cx} cx={cx} cy={622 - (i % 3) * 8} r={18 + (i % 2) * 8} fill="var(--garden-leaf-deep)" opacity="0.7" />
          ))}
        </svg>
      </div>

      {/* Warm sun rays */}
      <div className="animate-rays absolute left-[30%] top-[40%] h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-30 mix-blend-screen">
        <div className="bg-light-rays h-full w-full" />
      </div>

      {/* MAIN — waterfall, pool, trees, path, bench, Shihab & Lia */}
      <div ref={main} className="absolute inset-y-0 left-0 w-[160%] will-change-transform">
        <svg viewBox="0 0 640 900" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
          <defs>
            <filter id="gj-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <linearGradient id="gj-fall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--garden-water)" stopOpacity="0.95" />
              <stop offset="1" stopColor="var(--garden-water)" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Ground */}
          <path d="M0 668 Q 160 646 320 662 T 640 655 L640 900 L0 900Z" fill="var(--garden-grass)" />
          <path d="M0 720 Q 200 700 400 716 T 640 712 L640 900 L0 900Z" fill="var(--garden-leaf)" opacity="0.35" />

          {/* Back tree */}
          <rect x="296" y="540" width="9" height="120" fill="var(--garden-wood)" opacity="0.8" />
          <g className="animate-leaf-sway" style={{ "--dur": "7s" } as React.CSSProperties}>
            <circle cx="300" cy="520" r="44" fill="var(--garden-leaf-light)" opacity="0.85" />
            <circle cx="272" cy="548" r="30" fill="var(--garden-leaf)" opacity="0.85" />
            <circle cx="330" cy="550" r="32" fill="var(--garden-leaf)" opacity="0.85" />
          </g>

          {/* Cliff + trees on top */}
          <path d="M462 730 L470 560 Q 478 450 512 380 L530 345 Q 575 318 640 326 L640 760 Z" fill="var(--garden-rock)" />
          <path d="M478 600 Q 490 480 520 400 L534 372 L540 380 Q 510 450 498 560 Z" fill="var(--garden-rock-light)" opacity="0.6" />
          <path d="M600 360 Q 615 450 610 560 L630 560 Q 632 450 620 360Z" fill="var(--garden-rock-light)" opacity="0.4" />
          <g className="animate-leaf-sway" style={{ "--dur": "8s" } as React.CSSProperties}>
            <circle cx="520" cy="340" r="30" fill="var(--garden-leaf-deep)" />
            <circle cx="566" cy="318" r="34" fill="var(--garden-leaf)" />
            <circle cx="612" cy="310" r="42" fill="var(--garden-leaf-deep)" />
            <circle cx="650" cy="330" r="36" fill="var(--garden-leaf)" />
          </g>

          {/* Waterfall */}
          <rect x="545" y="350" width="46" height="384" rx="6" fill="url(#gj-fall)" />
          {[549, 556, 563, 570, 577, 584].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1="350"
              x2={x + (i % 2 ? 1 : -1)}
              y2="734"
              stroke="var(--cream)"
              strokeOpacity={0.55 + (i % 3) * 0.12}
              strokeWidth={i % 2 ? 1.4 : 2.2}
              strokeDasharray={i % 2 ? "18 22" : "34 26"}
              className="animate-water-flow"
              style={{ "--dur": `${1.1 + (i % 3) * 0.35}s` } as React.CSSProperties}
            />
          ))}
          <ellipse cx="568" cy="352" rx="28" ry="6" fill="var(--garden-water)" />

          {/* Pool with reflected light */}
          <ellipse cx="562" cy="748" rx="112" ry="26" fill="var(--garden-water-deep)" />
          <ellipse cx="562" cy="744" rx="96" ry="18" fill="var(--garden-water)" opacity="0.35" />
          {[
            [520, 750, 30, "0s"],
            [600, 742, 22, "-1s"],
            [560, 758, 38, "-2s"],
            [490, 742, 16, "-0.5s"],
          ].map(([cx, cy, rx, d]) => (
            <ellipse
              key={`${cx}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry="1.6"
              fill="var(--gold-light)"
              className="animate-water-shimmer"
              style={{ "--delay": d } as React.CSSProperties}
            />
          ))}
          <ellipse cx="568" cy="730" rx="54" ry="20" fill="var(--cream)" opacity="0.55" filter="url(#gj-blur)" className="animate-mist-pulse" />

          {/* Bushes framing the pool */}
          <circle cx="452" cy="752" r="22" fill="var(--garden-leaf)" />
          <circle cx="474" cy="760" r="16" fill="var(--garden-leaf-light)" />
          <circle cx="664" cy="760" r="40" fill="var(--garden-leaf-deep)" />

          {/* Garden path */}
          <path
            d="M-20 900 Q 110 858 220 836 Q 330 812 470 800 L472 814 Q 330 830 236 860 Q 140 890 70 900 Z"
            fill="var(--garden-path)"
            opacity="0.55"
          />

          {/* Left tree */}
          <rect x="50" y="470" width="13" height="250" rx="4" fill="var(--garden-wood)" />
          <g className="animate-leaf-sway" style={{ "--dur": "6s" } as React.CSSProperties}>
            <circle cx="58" cy="440" r="62" fill="var(--garden-leaf)" />
            <circle cx="16" cy="486" r="46" fill="var(--garden-leaf-deep)" />
            <circle cx="104" cy="482" r="48" fill="var(--garden-leaf-light)" opacity="0.9" />
            <circle cx="62" cy="392" r="42" fill="var(--garden-leaf-light)" opacity="0.8" />
          </g>
          <circle cx="40" cy="712" r="26" fill="var(--garden-leaf-deep)" />
          <circle cx="90" cy="716" r="18" fill="var(--garden-leaf)" />
          <circle cx="210" cy="700" r="16" fill="var(--garden-leaf)" opacity="0.8" />

          {/* Bench facing the waterfall */}
          <g transform={`translate(430 ${groundY(X_SEAT)}) scale(${depthScale(X_SEAT)})`}>
            <path d="M-30 -24 L20 -24 L24 -30 L-24 -30 Z" fill="var(--garden-wood)" />
            <rect x="-30" y="-25" width="50" height="4" rx="1.5" fill="var(--gold-dark)" />
            <rect x="-30" y="-62" width="4" height="38" rx="1.5" fill="var(--gold-dark)" />
            <rect x="-30" y="-58" width="4" height="4" fill="var(--gold)" />
            <rect x="-27" y="-22" width="3" height="22" fill="var(--garden-wood)" />
            <rect x="15" y="-22" width="3" height="22" fill="var(--garden-wood)" />
          </g>

          {/* Shihab (groom) — silhouette */}
          <g ref={groom}>
            <g ref={groomBody}>
              <g transform="translate(0 -70)">
                <g ref={setLimb("gArmB")}>
                  <rect x="-1.8" y="0" width="3.6" height="27" rx="1.8" fill="var(--navy)" />
                </g>
              </g>
              <g transform="translate(0 -44)">
                <g ref={setLimb("gThighB")}>
                  <rect x="-2.6" y="0" width="5.2" height="23" rx="2.4" fill="var(--navy)" />
                  <g transform="translate(0 22)">
                    <g ref={setLimb("gShinB")}>
                      <rect x="-2.4" y="0" width="4.8" height="22" rx="2.2" fill="var(--navy)" />
                      <ellipse cx="2.6" cy="22" rx="4.4" ry="1.8" fill="var(--navy-deep)" />
                    </g>
                  </g>
                </g>
              </g>
              <path
                d="M-6.5 -42 L6.8 -42 L7.4 -70 Q 0 -75 -7.2 -70 Z"
                fill="var(--navy-deep)"
                stroke="var(--gold)"
                strokeOpacity="0.7"
                strokeWidth="0.7"
              />
              <path d="M2 -71 L3 -52" stroke="var(--gold)" strokeWidth="1" />
              <circle cx="1" cy="-80" r="6.2" fill="var(--navy-deep)" stroke="var(--gold)" strokeOpacity="0.7" strokeWidth="0.7" />
              <path d="M-5.6 -82 Q 1 -90 7 -82 L7 -84.5 Q 1 -92 -5.6 -84.5Z" fill="var(--burgundy-deep)" />
              <g transform="translate(0 -44)">
                <g ref={setLimb("gThighF")}>
                  <rect x="-2.6" y="0" width="5.2" height="23" rx="2.4" fill="var(--navy-deep)" />
                  <g transform="translate(0 22)">
                    <g ref={setLimb("gShinF")}>
                      <rect x="-2.4" y="0" width="4.8" height="22" rx="2.2" fill="var(--navy-deep)" />
                      <ellipse cx="2.6" cy="22" rx="4.4" ry="1.8" fill="var(--navy-deep)" />
                    </g>
                  </g>
                </g>
              </g>
              <g transform="translate(0 -70)">
                <g ref={setLimb("gArmF")}>
                  <rect x="-1.9" y="0" width="3.8" height="27" rx="1.9" fill="var(--navy-deep)" stroke="var(--gold)" strokeOpacity="0.5" strokeWidth="0.5" />
                </g>
              </g>
            </g>
          </g>

          {/* Lia (bride) — silhouette in a flowing gown and hijab */}
          <g ref={bride}>
            <g ref={brideBody}>
              <g transform="translate(0 -69)">
                <g ref={setLimb("bArmB")}>
                  <rect x="-1.6" y="0" width="3.2" height="25" rx="1.6" fill="var(--gold-light)" />
                </g>
              </g>
              <g ref={skirtStand}>
                <path
                  d="M-6 -47 L6 -47 Q 10 -20 16 0 L-17 0 Q -11 -22 -6 -47Z"
                  fill="var(--cream)"
                  stroke="var(--gold-dark)"
                  strokeWidth="0.7"
                />
              </g>
              <path
                ref={skirtSit}
                opacity="0"
                d="M-8 -48 L5 -48 Q 21 -48 23 -40 Q 25 -30 26 -22 L8 -22 Q 9 -30 8 -36 L-9 -36 Z"
                fill="var(--cream)"
                stroke="var(--gold-dark)"
                strokeWidth="0.7"
              />
              <path d="M-5.5 -46 L5.5 -46 L6 -69 Q 0 -73 -6 -69 Z" fill="var(--cream)" stroke="var(--gold-dark)" strokeWidth="0.6" />
              <path
                d="M-7 -70 Q -8 -88 1 -88 Q 9 -88 8 -76 L8.5 -66 Q 0 -61 -7.5 -66 Z"
                fill="var(--cream)"
                stroke="var(--gold-dark)"
                strokeWidth="0.6"
              />
              <path d="M-4 -61.5 Q 0 -59 4.5 -61.5" stroke="var(--gold)" strokeWidth="0.9" fill="none" />
              <g transform="translate(0 -69)">
                <g ref={setLimb("bArmF")}>
                  <rect x="-1.7" y="0" width="3.4" height="25" rx="1.7" fill="var(--cream)" stroke="var(--gold-dark)" strokeWidth="0.5" />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* FORE — soft dark foliage at the frame edges for depth */}
      <div ref={fore} className="absolute inset-y-0 left-0 w-[190%] blur-[2px] will-change-transform">
        <svg viewBox="0 0 760 900" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
          <g fill="var(--garden-leaf-deep)">
            <circle cx="-10" cy="880" r="70" />
            <circle cx="60" cy="915" r="52" />
            <circle cx="-20" cy="780" r="44" />
            <circle cx="380" cy="935" r="48" />
            <circle cx="780" cy="860" r="74" />
            <circle cx="720" cy="920" r="50" />
          </g>
        </svg>
      </div>

      {/* Garden life */}
      <GardenLife birds={2} butterflies={2} tone="text-navy-deep" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy-deep/40 to-transparent" />
    </div>
  );
}

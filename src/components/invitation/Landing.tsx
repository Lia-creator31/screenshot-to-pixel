import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Atmosphere } from "./Atmosphere";
import { official, scenery } from "./assets";
import { couple } from "./data";
import { EASE_LUX } from "./motion";

type Phase = "idle" | "opening" | "entering";

type Props = {
  guest: string;
  onOpenStart: () => void;
  onOpened: () => void;
};

export function Landing({ guest, onOpenStart, onOpened }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const reduce = useReducedMotion();

  function open() {
    if (phase !== "idle") return;
    setPhase("opening");
    onOpenStart();
    const t1 = reduce ? 200 : 2300;
    const t2 = reduce ? 500 : 3500;
    window.setTimeout(() => setPhase("entering"), t1);
    window.setTimeout(onOpened, t2);
  }

  const opening = phase !== "idle";
  // Doors use a slower in-out curve so the swing reads as cinematic.
  const doorTransition = {
    duration: reduce ? 0.2 : 2.2,
    ease: [0.45, 0, 0.2, 1] as const,
    delay: reduce ? 0 : 0.35,
  };

  return (
    <motion.section
      aria-label="Halaman pembuka undangan"
      className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 overflow-hidden bg-burgundy-deep"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "entering" ? 0 : 1 }}
      transition={{ duration: 1.1, ease: EASE_LUX, delay: phase === "entering" ? 0.2 : 0 }}
    >
      {/* Cinematic botanical garden backdrop */}
      <motion.img
        src={scenery.gardenBg}
        alt=""
        aria-hidden
        width={1024}
        height={1792}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.12 }}
        animate={{ scale: opening ? 1.3 : 1.05 }}
        transition={{ duration: opening ? 3 : 8, ease: EASE_LUX }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-burgundy-deep/90 via-burgundy/55 to-navy-deep/90"
        animate={{ opacity: opening ? 0.35 : 1 }}
        transition={{ duration: 2, ease: EASE_LUX }}
      />
      <div
        aria-hidden
        className="animate-mist absolute inset-x-[-10%] bottom-0 h-1/3 bg-gradient-to-t from-cream/15 to-transparent blur-2xl"
      />
      <Atmosphere petals={opening ? 22 : 8} particles={opening ? 30 : 14} />

      <div className="relative flex h-full flex-col items-center justify-between px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] text-center">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={opening ? { opacity: 0, y: -40 } : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE_LUX, delay: opening ? 0.2 : 0.3 }}
          className="flex flex-col items-center"
        >
          <img
            src={official.monogram}
            alt="Monogram S&L"
            width={209}
            height={268}
            className="drop-glow h-auto w-14"
          />
          <p className="text-eyebrow mt-4 text-cream/90">The Wedding of</p>
          <h1 className="text-fluid-hero text-gold-shimmer mt-1 font-script">{couple.short}</h1>
        </motion.div>

        {/* Gate */}
        <motion.div
          className="relative flex w-[66%] max-w-[270px] items-center justify-center"
          style={{ perspective: 1200 }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={
            phase === "entering"
              ? { opacity: 0, scale: 2.8 }
              : { opacity: 1, scale: opening ? 1.08 : 1 }
          }
          transition={{
            duration: phase === "entering" ? 1.4 : 1.2,
            ease: EASE_LUX,
            delay: phase === "idle" ? 0.5 : 0,
          }}
        >
          {/* Garden glow revealed behind the doors */}
          <motion.div
            aria-hidden
            className="absolute inset-[8%_10%_2%] overflow-hidden rounded-t-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: opening ? 1 : 0.4 }}
            transition={{ duration: 1.4, ease: EASE_LUX, delay: opening ? 0.4 : 0 }}
          >
            <img
              src={scenery.gardenBg}
              alt=""
              className="h-full w-full object-cover object-[50%_40%]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,var(--gold-light)_0%,transparent_60%)] opacity-60 mix-blend-screen" />
          </motion.div>

          {/* Official closed gate */}
          <motion.img
            src={official.gateClosed}
            alt="Gerbang undangan"
            width={214}
            height={276}
            className="relative z-10 h-auto w-full drop-shadow-[0_20px_40px_oklch(0_0_0/0.6)]"
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: opening ? 0.3 : 0 }}
          />

          {/* Official left & right doors that swing open in 3D */}
          <div
            aria-hidden
            className="absolute inset-0 z-20 flex"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.img
              src={official.gateLeft}
              alt=""
              className="h-full w-1/2 object-fill"
              style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
              initial={{ opacity: 0, rotateY: 0 }}
              animate={opening ? { opacity: [0, 1, 1, 0], rotateY: -112 } : { opacity: 0, rotateY: 0 }}
              transition={{ ...doorTransition, opacity: { duration: reduce ? 0.2 : 2.6, times: [0, 0.1, 0.85, 1], delay: 0.25 } }}
            />
            <motion.img
              src={official.gateRight}
              alt=""
              className="h-full w-1/2 object-fill"
              style={{ transformOrigin: "right center", backfaceVisibility: "hidden" }}
              initial={{ opacity: 0, rotateY: 0 }}
              animate={opening ? { opacity: [0, 1, 1, 0], rotateY: 112 } : { opacity: 0, rotateY: 0 }}
              transition={{ ...doorTransition, opacity: { duration: reduce ? 0.2 : 2.6, times: [0, 0.1, 0.85, 1], delay: 0.25 } }}
            />
          </div>

          {/* Golden burst when doors open */}
          <AnimatePresence>
            {opening && !reduce && (
              <motion.div
                aria-hidden
                className="absolute inset-0 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 18 }).map((_, i) => {
                  const angle = (i / 18) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold-light"
                      style={{ boxShadow: "0 0 10px var(--gold)" }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                      animate={{
                        x: Math.cos(angle) * (90 + (i % 3) * 30),
                        y: Math.sin(angle) * (110 + (i % 4) * 25),
                        opacity: [0, 1, 0],
                        scale: [0.4, 1.2, 0.6],
                      }}
                      transition={{ duration: 1.8, ease: EASE_LUX, delay: 0.7 + (i % 5) * 0.05 }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Guest + Buka Undangan */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={opening ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_LUX, delay: opening ? 0.5 : 0.7 }}
          className="flex flex-col items-center"
        >
          <p className="text-xs tracking-wide text-cream/75">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <p className="mt-1 font-display text-2xl font-semibold text-cream">{guest}</p>
          <motion.button
            type="button"
            onClick={open}
            aria-label="Buka Undangan"
            className="relative mt-3 grid h-32 w-32 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            animate={
              opening
                ? { scale: [1, 1.15, 1.05], filter: "drop-shadow(0 0 30px oklch(0.85 0.13 92 / 0.9))" }
                : { scale: 1 }
            }
            transition={{ duration: 0.6, ease: EASE_LUX }}
          >
            <span aria-hidden className="absolute inset-3 rounded-full bg-gold/25 blur-xl" />
            <img
              src={official.bukaUndangan}
              alt=""
              width={263}
              height={240}
              className="animate-pulse-glow relative h-auto w-full"
            />
          </motion.button>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-gold-light/80">
            Ketuk untuk membuka
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}

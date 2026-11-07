import { motion } from "framer-motion";
import { BookHeart, CalendarHeart, Gift, Images, Ticket } from "lucide-react";
import { useEffect, useState } from "react";

import { official } from "./assets";
import { EASE_LUX } from "./motion";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "pembuka", label: "Galeri", icon: Images },
  { id: "acara", label: "Acara", icon: CalendarHeart },
  { id: "tiket", label: "Tiket", icon: Ticket },
  { id: "ucapan", label: "Ucapan", icon: BookHeart },
  { id: "kado", label: "Kado", icon: Gift },
] as const;

export function FloatingControls({
  playing,
  onToggleMusic,
}: {
  playing: boolean;
  onToggleMusic: () => void;
}) {
  const [active, setActive] = useState<string>("pembuka");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[420px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE_LUX, delay: 0.4 }}
    >
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={onToggleMusic}
          aria-label={playing ? "Matikan musik" : "Putar musik"}
          aria-pressed={playing}
          className="pointer-events-auto relative grid h-12 w-12 place-items-center rounded-full bg-navy-deep/70 shadow-[var(--shadow-gold)] backdrop-blur"
        >
          <img
            src={official.disc}
            alt=""
            className={cn(
              "h-10 w-10 animate-spin-slow",
              !playing && "[animation-play-state:paused] opacity-60",
            )}
          />
          {!playing && (
            <span aria-hidden className="absolute h-0.5 w-8 rotate-45 rounded bg-cream/80" />
          )}
        </button>
      </div>
      <nav
        aria-label="Navigasi undangan"
        className="pointer-events-auto isolate grid grid-cols-5 rounded-2xl border border-gold/30 bg-navy-deep/80 p-1.5 shadow-[var(--shadow-card)] backdrop-blur-md"
      >
        {NAV.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[0.62rem] tracking-wide transition-colors duration-500",
              active === id ? "text-primary-foreground" : "text-cream/65",
            )}
          >
            {active === id && (
              <motion.span
                layoutId="nav-pill"
                className="bg-gold absolute inset-0 -z-10 rounded-xl"
                transition={{ duration: 0.5, ease: EASE_LUX }}
              />
            )}
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </a>
        ))}
      </nav>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Camera } from "lucide-react";

import { GardenLife } from "./GardenLife";
import { official } from "./assets";
import { couplePeople, type CouplePerson } from "./data";
import { EASE_LUX, fadeUp, viewportOnce } from "./motion";
import { Divider, SectionHeading } from "./Ornaments";
import { cn } from "@/lib/utils";

function Portrait({ person }: { person: CouplePerson }) {
  return (
    <div className="gold-frame relative aspect-[3/4] w-full overflow-hidden rounded-t-full">
      {person.photo ? (
        <img
          src={person.photo}
          alt={`Foto ${person.name}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-2",
            person.role === "groom" ? "bg-navy-gradient" : "bg-burgundy-gradient",
          )}
        >
          <img src={official.emblem} alt="" aria-hidden loading="lazy" className="h-auto w-14 opacity-30" />
          <span className="flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.25em] text-gold-light/80">
            <Camera className="h-3 w-3" aria-hidden /> Foto {person.name}
          </span>
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, from }: { person: CouplePerson; from: "left" | "right" }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: from === "left" ? -36 : 36, y: 16 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: EASE_LUX, delay: from === "left" ? 0 : 0.25 }}
      className="card-lux relative flex flex-col items-center rounded-t-[999px] rounded-b-2xl px-2.5 pb-4 pt-2.5 text-center"
    >
      <Portrait person={person} />
      <p className="text-eyebrow mt-4 text-gold/80">{person.label}</p>
      <h3 className="font-script text-[2.1rem] leading-tight text-gold-shimmer">{person.name}</h3>
      {person.details && (
        <p className="mt-1 font-display text-sm italic leading-snug text-cream/80">{person.details}</p>
      )}
    </motion.article>
  );
}

/** "The Bride & The Groom" — editorial introduction shown before Our Gallery. */
export function Couple() {
  const { groom, bride } = couplePeople;
  return (
    <div id="mempelai" className="relative mx-4 mt-14">
      <GardenLife birds={1} butterflies={1} tone="text-gold-light" className="opacity-60" />
      <div className="relative">
        <SectionHeading eyebrow="Mempelai Kami" title="The Bride & The Groom" />
        <div className="relative mt-7 grid grid-cols-2 gap-3">
          <PersonCard person={groom} from="left" />
          <PersonCard person={bride} from="right" />
          <motion.img
            src={official.monogram}
            alt=""
            aria-hidden
            loading="lazy"
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 1, ease: EASE_LUX, delay: 0.5 }}
            className="drop-glow pointer-events-none absolute left-1/2 top-[38%] h-auto w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-deep/80 p-1.5"
          />
        </div>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <Divider className="mt-6" />
        </motion.div>
      </div>
    </div>
  );
}

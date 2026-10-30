"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Loading screen: doar logo-ul. Dispare după ~1.5s (sincronizat cu --enter din globals.css). */
export function EntranceLoader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const out = window.setTimeout(() => setLeaving(true), 1500);
    const remove = window.setTimeout(() => setGone(true), 2150);
    return () => {
      window.clearTimeout(out);
      window.clearTimeout(remove);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`entrance-loader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="Se încarcă"
    >
      <Image
        className="loader-logo"
        src="/eastpoint-logo.png"
        alt="GTA5EastPoint"
        width={320}
        height={320}
        priority
        unoptimized
      />
    </div>
  );
}

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins once at module load on the client (per gsap-react & gsap-plugins skills).
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };

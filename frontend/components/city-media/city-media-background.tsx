"use client";
/* eslint-disable @next/next/no-img-element -- local placeholder backgrounds need direct missing-file fallback events. */

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore, useState } from "react";
import type { CityMedia } from "@/lib/city-media";
import { useCityMedia } from "@/components/city-media/city-media-provider";

const AmbientParticles = dynamic(
  () => import("./subtle-particle-overlay").then((module) => module.SubtleParticleOverlay),
  { ssr: false },
);

const subscribeToDeviceProfile = () => () => undefined;

function readLimitedDeviceProfile() {
  const device = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = device.deviceMemory !== undefined && device.deviceMemory <= 4;
  const lowCores = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;

  return lowMemory || lowCores;
}

function useLimitedDeviceProfile() {
  return useSyncExternalStore(subscribeToDeviceProfile, readLimitedDeviceProfile, () => true);
}

export function CityMediaBackground() {
  const { media } = useCityMedia();
  const reducedMotion = Boolean(useReducedMotion());
  const limitedDevice = useLimitedDeviceProfile();
  const simplified = reducedMotion || limitedDevice;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence mode="sync" initial={false}>
        <CityMediaLayer key={media.id} media={media} simplified={simplified} />
      </AnimatePresence>
      {!simplified && <AmbientParticles media={media} />}
    </div>
  );
}

function CityMediaLayer({ media, simplified }: { media: CityMedia; simplified: boolean }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const useVideo = !simplified && !videoFailed;
  const useImage = simplified || videoFailed;
  const transition = simplified ? { duration: 0 } : { duration: 0.85, ease: "easeInOut" as const };

  return (
    <motion.div
      className="absolute inset-0"
      initial={simplified ? false : { opacity: 0, scale: 1.035 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={simplified ? undefined : { opacity: 0, scale: 1.025 }}
      transition={transition}
    >
      {useVideo && (
        <video
          className={`city-media-visual media-motion-${media.motionStyle} ${videoReady ? "opacity-100" : "opacity-0"}`}
          style={{ filter: media.colorGrade, objectPosition: media.focalPoint }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        >
          {/* Add licensed, optimized local city footage at this path; no external video is requested. */}
          <source src={media.videoSrc} type="video/mp4" />
        </video>
      )}
      {useImage && !imageFailed && (
        <img
          className={`city-media-visual ${simplified ? "" : `media-motion-${media.motionStyle}`}`}
          style={{ filter: media.colorGrade, objectPosition: media.focalPoint }}
          src={media.imageSrc}
          alt=""
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="city-media-soft-blur" />
      <div className="city-media-grade" style={{ background: media.overlayGradient }} />
      <div
        className="city-media-glow"
        style={{ background: `radial-gradient(circle at ${media.focalPoint}, ${media.palette.ambientGlow}27, transparent 42%)` }}
      />
      <div className="city-media-edge-mask" />
      <div className="city-media-interface-veil" />
    </motion.div>
  );
}

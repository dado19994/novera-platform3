"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { CityMedia } from "@/lib/city-media";

export function SubtleParticleOverlay({ media }: { media: CityMedia }) {
  return (
    <div className="city-particle-overlay absolute inset-0">
      <Canvas
        dpr={[1, 1.15]}
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <Sparkles
          count={media.ambientParticles.count}
          scale={[7.6, 4.2, 2]}
          position={[0, 0.45, 0]}
          size={1.2}
          opacity={0.4}
          speed={media.ambientParticles.speed}
          color={media.palette.ambientGlow}
        />
      </Canvas>
    </div>
  );
}

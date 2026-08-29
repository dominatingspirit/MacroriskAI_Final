"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";
import { useChartMode } from "@/lib/hooks/use-chart-mode";

function DriftingCore() {
  const meshRef = useRef<Mesh>(null);
  const mode = useChartMode();
  const color = mode === "dark" ? "#3987e5" : "#2a78d6";

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={2.1}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.15}
          metalness={0.65}
          distort={0.32}
          speed={1.6}
          envMapIntensity={0.9}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  const mode = useChartMode();

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 42 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 3, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color={mode === "dark" ? "#86b6ef" : "#ffffff"} />
      <DriftingCore />
      <Sparkles count={60} scale={7} size={2} speed={0.25} opacity={0.5} color={mode === "dark" ? "#c3c2b7" : "#52514e"} />
      <Environment preset="city" environmentIntensity={0.35} />
    </Canvas>
  );
}

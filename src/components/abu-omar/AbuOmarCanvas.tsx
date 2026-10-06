"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { abuOmarModelUrl } from "@/content/site";
import AbuOmarCharacter from "./AbuOmarCharacter";
import AbuOmarModel from "./AbuOmarModel";

export default function AbuOmarCanvas({ progress }: { progress: RefObject<number> }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering when the hero is off-screen.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 0.5, 7.5], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#10b0f0" />
        <directionalLight position={[4, 1, -3]} intensity={0.8} color="#3040f0" />

        <Suspense fallback={null}>
          {abuOmarModelUrl ? (
            <AbuOmarModel url={abuOmarModelUrl} progress={progress} />
          ) : (
            <AbuOmarCharacter progress={progress} />
          )}
          <Environment resolution={128}>
            <Lightformer intensity={2} position={[0, 5, -6]} scale={[10, 3, 1]} />
            <Lightformer intensity={1.5} color="#10b0f0" position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
            <Lightformer intensity={1} color="#3040f0" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          </Environment>
        </Suspense>

        <ContactShadows position={[0, -1.25, 0]} opacity={0.55} scale={6} blur={2.6} far={3} />
      </Canvas>
    </div>
  );
}

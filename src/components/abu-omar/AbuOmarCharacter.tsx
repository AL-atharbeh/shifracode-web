"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Placeholder Abu Omar built from primitives: friendly developer with
 * glasses and a beard. Replaced by the real GLB once `abuOmarModelUrl` is set.
 */

const SKIN = "#d9a47c";
const HAIR = "#1b1411";
const HOODIE = "#1d1d22";
const ACCENT = "#19b5f5";

const lerp = THREE.MathUtils.lerp;

export default function AbuOmarCharacter({ progress }: { progress: RefObject<number> }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const emblem = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progress.current ?? 0;
    const { pointer } = state;

    if (root.current) {
      // Gentle float, then turn and settle as the hero scrolls.
      root.current.position.y = Math.sin(t * 1.2) * 0.04 - 0.15 - p * 0.25;
      const targetRotY = lerp(-0.25, 0.35, p) + pointer.x * 0.15;
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetRotY, 4, delta);
      const s = lerp(1, 0.82, p);
      root.current.scale.setScalar(s);
    }

    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.x * 0.45, 5, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.y * 0.25, 5, delta);
      head.current.rotation.z = Math.sin(t * 0.8) * 0.03;
    }

    // Wave on load and while the greeting is on screen.
    const waving = t < 3.5 || (p > 0.05 && p < 0.55);
    // Arms hang along -y; positive z-rotation swings the right arm outward/up.
    if (rightArm.current) {
      const target = waving ? 2.6 + Math.sin(t * 9) * 0.3 : 0.15 + Math.sin(t * 1.2) * 0.04;
      rightArm.current.rotation.z = THREE.MathUtils.damp(rightArm.current.rotation.z, target, 8, delta);
    }
    if (leftArm.current) {
      leftArm.current.rotation.z = -0.15 - Math.sin(t * 1.2 + 1) * 0.04;
    }

    // Blink every few seconds.
    if (eyes.current) {
      const phase = t % 4;
      eyes.current.scale.y = phase > 3.85 ? 0.1 : 1;
    }

    if (emblem.current) {
      emblem.current.emissiveIntensity = 1.6 + Math.sin(t * 2) * 0.5;
    }
  });

  return (
    <group ref={root}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.58, 0.75, 12, 32]} />
        <meshStandardMaterial color={HOODIE} roughness={0.75} />
      </mesh>
      {/* Hoodie collar */}
      <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.07, 16, 48]} />
        <meshStandardMaterial color="#26262c" roughness={0.8} />
      </mesh>
      {/* Glowing </> emblem */}
      <group position={[0, 0.2, 0.585]}>
        <mesh position={[-0.11, 0, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.03, 0.12, 0.02]} />
          <meshStandardMaterial ref={emblem} color={ACCENT} emissive={ACCENT} emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.11, -0.07, 0]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.03, 0.12, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.11, 0, 0]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.03, 0.12, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.11, -0.07, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.03, 0.12, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2} />
        </mesh>
        <mesh position={[0, -0.035, 0]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.025, 0.2, 0.02]} />
          <meshStandardMaterial color="#f5f5f7" emissive="#f5f5f7" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Arms (pivot at the shoulder) */}
      <group ref={rightArm} position={[0.6, 0.45, 0]}>
        <mesh position={[0.08, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.5, 8, 16]} />
          <meshStandardMaterial color={HOODIE} roughness={0.75} />
        </mesh>
        <mesh position={[0.1, -0.78, 0]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>
      <group ref={leftArm} position={[-0.6, 0.45, 0]}>
        <mesh position={[-0.08, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.5, 8, 16]} />
          <meshStandardMaterial color={HOODIE} roughness={0.75} />
        </mesh>
        <mesh position={[-0.1, -0.78, 0]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
      </group>

      {/* Head */}
      <group ref={head} position={[0, 1.3, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 48, 48]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        {/* Ears */}
        <mesh position={[0.49, 0, 0]} scale={[0.5, 1, 0.8]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <mesh position={[-0.49, 0, 0]} scale={[0.5, 1, 0.8]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.14, -0.04]} scale={[1.04, 0.82, 1.04]}>
          <sphereGeometry args={[0.5, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={HAIR} roughness={0.9} />
        </mesh>
        {/* Beard */}
        <mesh position={[0, -0.3, 0.04]} scale={[0.92, 0.5, 0.9]}>
          <sphereGeometry args={[0.47, 48, 48, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={HAIR} roughness={0.95} />
        </mesh>
        {/* Moustache + smile */}
        <mesh position={[0, -0.14, 0.47]} rotation={[0, 0, Math.PI / 2]} scale={[0.6, 1, 0.6]}>
          <capsuleGeometry args={[0.04, 0.2, 6, 12]} />
          <meshStandardMaterial color={HAIR} roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.22, 0.47]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.07, 0.015, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#f5f5f7" roughness={0.4} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0, 0.5]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#cf946a" roughness={0.6} />
        </mesh>
        {/* Eyes */}
        <group ref={eyes} position={[0, 0.09, 0.43]}>
          {[-0.16, 0.16].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.075, 24, 24]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0, 0.06]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshStandardMaterial color="#111" roughness={0.1} />
              </mesh>
            </group>
          ))}
        </group>
        {/* Glasses */}
        <group position={[0, 0.09, 0.49]}>
          {[-0.16, 0.16].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <torusGeometry args={[0.12, 0.016, 12, 48]} />
              <meshStandardMaterial color="#2c2c30" metalness={0.8} roughness={0.25} />
            </mesh>
          ))}
          <mesh>
            <boxGeometry args={[0.08, 0.016, 0.016]} />
            <meshStandardMaterial color="#2c2c30" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
        {/* Eyebrows */}
        {[-0.16, 0.16].map((x) => (
          <mesh key={x} position={[x, 0.27, 0.44]} rotation={[0, 0, Math.PI / 2 + (x > 0 ? 0.12 : -0.12)]}>
            <capsuleGeometry args={[0.02, 0.1, 4, 8]} />
            <meshStandardMaterial color={HAIR} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

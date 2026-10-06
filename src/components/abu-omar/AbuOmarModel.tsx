"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** Decoder files are served from /public/draco (copied from three/examples). */
const DRACO_PATH = "/draco/";
/** Rendered height of the character in scene units, feet resting on the floor. */
const HEIGHT = 2.5;
const FLOOR_Y = -1.25;
/** Hero scroll range in which Abu Omar's greeting line is on screen. */
const GREETING = [0.05, 0.55] as const;
/** How far (radians) neck + head may turn toward the cursor, and the body's share. */
const LOOK_YAW = 0.5;
const LOOK_PITCH = 0.22;
const BODY_YAW = 0.12;
/** After this long without mouse movement he eases back to look at the visitor. */
const IDLE_LOOK_MS = 3500;
/** Share of the look turned at the neck joint; the head joint turns the rest. */
const NECK_SHARE = 0.4;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

/**
 * The real Abu Omar GLB (built from character1.fbx): plays "Wave" on load and
 * whenever the greeting appears, otherwise loops "Idle". The glowing eyes
 * (AbuEyes) carry a "Blink" morph target.
 */
export default function AbuOmarModel({ url, progress }: { url: string; progress: RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url, DRACO_PATH);
  const { actions, mixer } = useAnimations(animations, group);
  const greeted = useRef(false);
  const tmp = useMemo(
    () => ({
      turn: new THREE.Quaternion(),
      pitch: new THREE.Quaternion(),
      world: new THREE.Matrix4(),
      step: new THREE.Matrix4(),
      rot: new THREE.Matrix4(),
      back: new THREE.Matrix4(),
      inv: new THREE.Matrix4(),
      pivot: new THREE.Vector3(),
      neckPivot: new THREE.Vector3(),
      scale: new THREE.Vector3(),
    }),
    [],
  );

  // Fit to a fixed height with the feet on the floor.
  const fit = useMemo(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.frustumCulled = false; // skinned bounds don't follow the animation
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = HEIGHT / size.y;
    return { scale, offsetY: FLOOR_Y - box.min.y * scale };
  }, [scene]);

  // Cursor position over the whole window (-1..1), so he follows the mouse
  // even when it's over the hero text rather than the canvas.
  const cursor = useRef({ x: 0, y: 0, moved: 0 });
  const look = useRef({ yaw: 0, pitch: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      cursor.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      cursor.current.moved = performance.now();
    };
    const onLeave = () => {
      cursor.current.x = 0;
      cursor.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Animated parts of the face, looked up once the model is loaded.
  const neck = useRef<THREE.Object3D | null>(null);
  const head = useRef<THREE.Object3D | null>(null);
  const waving = useRef(false);
  const eyes = useRef<THREE.Mesh | null>(null);
  const glow = useRef<THREE.MeshStandardMaterial | null>(null);
  useEffect(() => {
    // GLTFLoader strips dots from names, so "head.x" becomes "headx".
    neck.current = scene.getObjectByName("neckx") ?? null;
    head.current = scene.getObjectByName("headx") ?? null;
    eyes.current = (scene.getObjectByName("AbuEyes") as THREE.Mesh | undefined) ?? null;
    const mouth = scene.getObjectByName("AbuMouth") as THREE.Mesh | undefined;
    glow.current = (mouth?.material as THREE.MeshStandardMaterial | undefined) ?? null;
  }, [scene]);

  const wave = () => {
    const w = actions.Wave;
    const idle = actions.Idle;
    if (!w) return;
    waving.current = true;
    w.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.5).play();
    idle?.fadeOut(0.5);
  };

  useEffect(() => {
    actions.Idle?.play();
    wave();
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action === actions.Wave) {
        waving.current = false;
        actions.Idle?.reset().fadeIn(0.6).play();
        actions.Wave?.fadeOut(0.6);
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, mixer]);

  /**
   * Apply world-space look rotations to a bone. Each step rotates about a pivot
   * (null = the bone's own, already-moved origin) by `share` of the current look.
   */
  const turnBone = (bone: THREE.Object3D, steps: [THREE.Vector3 | null, number][]) => {
    const l = look.current;
    const W = tmp.world.copy(bone.matrixWorld);
    for (const [pivot, share] of steps) {
      const p = pivot ?? tmp.pivot.setFromMatrixPosition(W);
      tmp.turn.setFromAxisAngle(Y_AXIS, l.yaw * share).multiply(tmp.pitch.setFromAxisAngle(X_AXIS, l.pitch * share));
      // step = T(p) · R · T(-p): rotate about the pivot.
      tmp.step
        .makeTranslation(p.x, p.y, p.z)
        .multiply(tmp.rot.makeRotationFromQuaternion(tmp.turn))
        .multiply(tmp.back.makeTranslation(-p.x, -p.y, -p.z));
      W.premultiply(tmp.step);
    }
    // Back into the parent's space.
    W.premultiply(tmp.inv.copy(bone.parent!.matrixWorld).invert());
    W.decompose(bone.position, bone.quaternion, tmp.scale);
  };

  useFrame((state, delta) => {
    if (!group.current) return;
    const p = progress.current ?? 0;
    const t = state.clock.elapsedTime;

    // Follow the cursor while it moves; drift back to the visitor once it rests.
    const c = cursor.current;
    const active = performance.now() - c.moved < IDLE_LOOK_MS ? 1 : 0;
    const strength = active * (waving.current ? 0.35 : 1);
    const cx = c.x * strength;
    const cy = (c.y - 0.15) * strength; // the head sits above screen centre

    // Body turns only a little; the neck and head do most of the looking.
    const target = THREE.MathUtils.lerp(-0.2, 0.25, p) + cx * BODY_YAW;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, target, 2.5, delta);
    group.current.position.y = fit.offsetY - p * 0.2;

    // Wave again when the greeting line scrolls in.
    const inGreeting = p > GREETING[0] && p < GREETING[1];
    if (inGreeting && !greeted.current) wave();
    greeted.current = inGreeting;

    // Neck + head look at the cursor, layered on top of the pose the mixer just applied.
    const l = look.current;
    l.yaw = THREE.MathUtils.damp(l.yaw, THREE.MathUtils.clamp(cx, -1, 1) * LOOK_YAW, 3.5, delta);
    l.pitch = THREE.MathUtils.damp(l.pitch, -THREE.MathUtils.clamp(cy, -1, 1) * LOOK_PITCH, 3.5, delta);
    // In this rig the head is not parented to the neck, so the head is turned about the
    // neck joint first (carrying it along) and then about its own joint.
    const n = neck.current;
    const h = head.current;
    if (n?.parent && h?.parent) {
      n.updateWorldMatrix(true, false);
      tmp.neckPivot.setFromMatrixPosition(n.matrixWorld);
      turnBone(n, [[tmp.neckPivot, NECK_SHARE]]);
      h.updateWorldMatrix(true, false);
      turnBone(h, [
        [tmp.neckPivot, NECK_SHARE],
        [null, 1 - NECK_SHARE],
      ]);
    }

    // Blink every ~4 s.
    const blink = t % 4 > 3.88 ? 1 : 0;
    const influences = eyes.current?.morphTargetInfluences;
    // three.js objects are mutable scene state, not React state.
    // eslint-disable-next-line react-hooks/immutability
    if (influences) influences[0] = THREE.MathUtils.damp(influences[0], blink, 30, delta);

    if (glow.current) glow.current.emissiveIntensity = 5 + Math.sin(t * 2) * 1.2;
  });

  return (
    <group ref={group} scale={fit.scale}>
      <primitive object={scene} />
    </group>
  );
}

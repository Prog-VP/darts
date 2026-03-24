"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const isMobile = mobileQuery.matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    let group: THREE.Group | null = null;
    let ringMaterial: THREE.MeshBasicMaterial | null = null;
    let cyanMaterial: THREE.MeshBasicMaterial | null = null;
    let torusOuter: THREE.Mesh | null = null;
    let torusInner: THREE.Mesh | null = null;
    let knot: THREE.Mesh | null = null;
    let core: THREE.Mesh | null = null;

    if (!isMobile) {
      group = new THREE.Group();
      scene.add(group);

      ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x8a5cff,
        wireframe: true,
        transparent: true,
        opacity: 0.46
      });

      cyanMaterial = new THREE.MeshBasicMaterial({
        color: 0x45d5ff,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });

      torusOuter = new THREE.Mesh(
        new THREE.TorusGeometry(2.8, 0.045, 20, 170),
        ringMaterial
      );
      torusInner = new THREE.Mesh(
        new THREE.TorusGeometry(1.85, 0.035, 20, 160),
        cyanMaterial
      );
      knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.1, 0.03, 170, 20), ringMaterial);
      core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), cyanMaterial);

      torusOuter.rotation.x = 0.95;
      torusInner.rotation.y = 0.65;
      knot.rotation.z = 0.45;

      group.add(torusOuter, torusInner, knot, core);
    }

    const buildParticles = (count: number, color: number, spread: number) => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = (Math.random() - 0.5) * (spread * 0.7);
        positions[i3 + 2] = (Math.random() - 0.5) * spread;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        size: 0.028,
        color,
        transparent: true,
        opacity: 0.7
      });
      return new THREE.Points(geometry, material);
    };

    const particlesFront = buildParticles(360, 0xcde7ff, 22);
    const particlesBack = buildParticles(220, 0x8a5cff, 28);
    particlesBack.position.z = -2;

    scene.add(particlesFront, particlesBack);

    const mouse = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    onResize();
    window.addEventListener("resize", onResize);
    if (!isMobile) {
      window.addEventListener("pointermove", onPointerMove);
    }

    let frame = 0;
    let rafId = 0;

    const animate = () => {
      frame += 0.006;
      if (group && knot && core) {
        group.rotation.y = frame + mouse.x * 0.2;
        group.rotation.x = Math.sin(frame * 0.75) * 0.18 + mouse.y * 0.08;
        knot.rotation.x += 0.008;
        knot.rotation.y += 0.006;
        core.rotation.y -= 0.01;
        core.rotation.x += 0.008;
      }
      particlesFront.rotation.y = -frame * 0.35;
      particlesBack.rotation.y = frame * 0.2;
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      if (!isMobile) {
        window.removeEventListener("pointermove", onPointerMove);
      }
      container.removeChild(renderer.domElement);

      torusOuter?.geometry.dispose();
      torusInner?.geometry.dispose();
      knot?.geometry.dispose();
      core?.geometry.dispose();

      ringMaterial?.dispose();
      cyanMaterial?.dispose();

      (particlesFront.geometry as THREE.BufferGeometry).dispose();
      (particlesBack.geometry as THREE.BufferGeometry).dispose();
      (particlesFront.material as THREE.PointsMaterial).dispose();
      (particlesBack.material as THREE.PointsMaterial).dispose();

      renderer.dispose();
    };
  }, []);

  return <div className="three-canvas" ref={containerRef} aria-hidden="true" />;
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function createParticleField(
  count: number,
  color: number,
  spread: number,
  size: number,
  opacity: number
) {
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const cursor = index * 3;
    positions[cursor] = (Math.random() - 0.5) * spread;
    positions[cursor + 1] = (Math.random() - 0.5) * spread * 0.65;
    positions[cursor + 2] = (Math.random() - 0.5) * spread;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isCompactViewport = window.innerWidth < 768;

    const density = prefersReducedMotion ? 0.45 : isCompactViewport ? 0.7 : 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isCompactViewport,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, isCompactViewport ? 1.5 : 2)
    );

    container.appendChild(renderer.domElement);

    const particlesRed = createParticleField(
      Math.round(120 * density),
      0xe63946,
      28,
      0.012,
      0.42
    );
    const particlesAmber = createParticleField(
      Math.round(260 * density),
      0xf4a024,
      24,
      0.014,
      0.34
    );
    const particlesGold = createParticleField(
      Math.round(140 * density),
      0xffd666,
      30,
      0.01,
      0.28
    );

    particlesGold.position.z = -3;

    scene.add(particlesRed, particlesAmber, particlesGold);

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
      renderer.render(scene, camera);
    };

    onResize();
    window.addEventListener("resize", onResize);

    if (hasFinePointer && !prefersReducedMotion) {
      window.addEventListener("pointermove", onPointerMove);
    }

    let frame = 0;
    let rafId = 0;

    const renderFrame = () => {
      frame += prefersReducedMotion ? 0.0015 : 0.004;

      particlesRed.rotation.y = frame * 0.25 + mouse.x * 0.04;
      particlesRed.rotation.x = mouse.y * 0.025;

      particlesAmber.rotation.y = -frame * 0.18 + mouse.x * 0.06;
      particlesAmber.rotation.x = Math.sin(frame * 0.45) * 0.1 + mouse.y * 0.03;

      particlesGold.rotation.y = frame * 0.12;
      particlesGold.rotation.x = Math.cos(frame * 0.25) * 0.08;

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(renderFrame);
    };

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);

      if (hasFinePointer && !prefersReducedMotion) {
        window.removeEventListener("pointermove", onPointerMove);
      }

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      [particlesRed, particlesAmber, particlesGold].forEach((particles) => {
        particles.geometry.dispose();
        (particles.material as THREE.PointsMaterial).dispose();
      });

      renderer.dispose();
    };
  }, []);

  return <div className="three-canvas" ref={containerRef} aria-hidden="true" />;
}

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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x8a5cff,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });

    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x45d5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });

    const torus1 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.04, 18, 120), ringMaterial);
    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.04, 18, 140), ringMaterial2);
    const torus3 = new THREE.Mesh(new THREE.TorusKnotGeometry(1.1, 0.03, 120, 16), ringMaterial);

    torus1.rotation.x = 0.8;
    torus2.rotation.y = 0.6;
    torus3.rotation.z = 0.4;

    ringGroup.add(torus1, torus2, torus3);

    const particlesCount = 420;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i += 1) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 22;
      positions[i3 + 1] = (Math.random() - 0.5) * 16;
      positions[i3 + 2] = (Math.random() - 0.5) * 18;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xcde7ff,
      transparent: true,
      opacity: 0.75
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    onResize();
    window.addEventListener("resize", onResize);

    let frame = 0;
    let rafId = 0;

    const animate = () => {
      frame += 0.006;
      ringGroup.rotation.y = frame;
      ringGroup.rotation.x = Math.sin(frame * 0.8) * 0.18;
      torus3.rotation.x += 0.008;
      torus3.rotation.y += 0.005;
      particles.rotation.y = -frame * 0.35;
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      torus1.geometry.dispose();
      torus2.geometry.dispose();
      torus3.geometry.dispose();
      ringMaterial.dispose();
      ringMaterial2.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div className="three-canvas" ref={containerRef} aria-hidden="true" />;
}

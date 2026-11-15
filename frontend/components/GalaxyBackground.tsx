"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GalaxyBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 55, 95);
    camera.lookAt(0, 0, 0);

    // ── Helper: random float ─────────────────────────────────────────────────
    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    // ────────────────────────────────────────────────────────────────────────
    // 1. BACKGROUND STAR FIELD (distant, dim, uniform)
    // ────────────────────────────────────────────────────────────────────────
    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#cce0ff"),
      new THREE.Color("#ffe8cc"),
      new THREE.Color("#d0ccff"),
      new THREE.Color("#ccf0ff"),
    ];

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = rand(200, 900);
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
      const c = starPalette[Math.floor(Math.random() * starPalette.length)];
      const dim = rand(0.3, 1.0);
      starColors[i * 3]     = c.r * dim;
      starColors[i * 3 + 1] = c.g * dim;
      starColors[i * 3 + 2] = c.b * dim;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color",    new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // ────────────────────────────────────────────────────────────────────────
    // 2. GALAXY SPIRAL ARMS
    // ────────────────────────────────────────────────────────────────────────
    const GALAXY_PARTICLES = 18000;
    const ARMS = 3;
    const ARM_SPREAD = 0.42;
    const GALAXY_RADIUS = 90;

    const galaxyGeo  = new THREE.BufferGeometry();
    const galaxyPos  = new Float32Array(GALAXY_PARTICLES * 3);
    const galaxyCol  = new Float32Array(GALAXY_PARTICLES * 3);
    const galaxySizes = new Float32Array(GALAXY_PARTICLES);

    // Core → arm colour gradient
    const innerColor = new THREE.Color("#4f8eff"); // bright blue-white core
    const midColor   = new THREE.Color("#a855f7"); // purple mid
    const outerColor = new THREE.Color("#0f172a"); // fade to dark

    for (let i = 0; i < GALAXY_PARTICLES; i++) {
      const arm   = i % ARMS;
      const t     = Math.pow(Math.random(), 0.6); // bias towards core
      const r     = t * GALAXY_RADIUS;
      const spin  = r * 0.025;                     // how much arm curls
      const angle = (arm / ARMS) * Math.PI * 2 + spin;

      // scatter perpendicular to arm
      const spread = (1 - t) * ARM_SPREAD * GALAXY_RADIUS * 0.4 + 0.5;
      const offsetX = (Math.random() - 0.5) * spread * 2;
      const offsetZ = (Math.random() - 0.5) * spread * 2;
      const offsetY = (Math.random() - 0.5) * spread * 0.3; // flat galaxy

      galaxyPos[i * 3]     = Math.cos(angle) * r + offsetX;
      galaxyPos[i * 3 + 1] = offsetY;
      galaxyPos[i * 3 + 2] = Math.sin(angle) * r + offsetZ;

      // colour
      const mixedColor = new THREE.Color();
      if (t < 0.35) {
        mixedColor.lerpColors(innerColor, midColor, t / 0.35);
      } else {
        mixedColor.lerpColors(midColor, outerColor, (t - 0.35) / 0.65);
      }
      galaxyCol[i * 3]     = mixedColor.r;
      galaxyCol[i * 3 + 1] = mixedColor.g;
      galaxyCol[i * 3 + 2] = mixedColor.b;

      // size: core = bigger, rim = smaller
      galaxySizes[i] = rand(0.3, t < 0.15 ? 2.8 : 1.4) * (1 - t * 0.5);
    }

    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute("color",    new THREE.BufferAttribute(galaxyCol, 3));
    galaxyGeo.setAttribute("size",     new THREE.BufferAttribute(galaxySizes, 1));

    // Custom shader for glowing, size-attenuated particles
    const galaxyMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:    { value: 0.0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (280.0 / -mvPos.z);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float strength = 1.0 - (d * 2.0);
          strength = pow(strength, 2.2);
          gl_FragColor = vec4(vColor * (strength + 0.15), strength * 0.92);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxy);

    // ────────────────────────────────────────────────────────────────────────
    // 3. GALACTIC CORE GLOW (layered billboards)
    // ────────────────────────────────────────────────────────────────────────
    const coreGlowGeo = new THREE.BufferGeometry();
    const CORE_PARTICLES = 1200;
    const corePos = new Float32Array(CORE_PARTICLES * 3);
    const coreCol = new Float32Array(CORE_PARTICLES * 3);
    const coreSizes = new Float32Array(CORE_PARTICLES);
    const coreColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#93c5fd"),
      new THREE.Color("#c4b5fd"),
      new THREE.Color("#7dd3fc"),
    ];

    for (let i = 0; i < CORE_PARTICLES; i++) {
      const r = Math.pow(Math.random(), 2.5) * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.6;
      corePos[i * 3]     = Math.cos(theta) * r * Math.cos(phi);
      corePos[i * 3 + 1] = Math.sin(phi) * r * 0.3;
      corePos[i * 3 + 2] = Math.sin(theta) * r * Math.cos(phi);
      const c = coreColors[Math.floor(Math.random() * coreColors.length)];
      const bright = rand(0.6, 1.0);
      coreCol[i * 3]     = c.r * bright;
      coreCol[i * 3 + 1] = c.g * bright;
      coreCol[i * 3 + 2] = c.b * bright;
      coreSizes[i] = rand(1.0, 4.5);
    }
    coreGlowGeo.setAttribute("position", new THREE.BufferAttribute(corePos, 3));
    coreGlowGeo.setAttribute("color",    new THREE.BufferAttribute(coreCol, 3));
    coreGlowGeo.setAttribute("size",     new THREE.BufferAttribute(coreSizes, 1));

    const coreGlowMat = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (350.0 / -mvPos.z);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float s = pow(1.0 - d * 2.0, 3.0);
          gl_FragColor = vec4(vColor, s * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const coreGlow = new THREE.Points(coreGlowGeo, coreGlowMat);
    scene.add(coreGlow);

    // ────────────────────────────────────────────────────────────────────────
    // 4. NEBULA DUST CLOUDS (large, slow, translucent blobs)
    // ────────────────────────────────────────────────────────────────────────
    const NEBULA_COUNT = 1800;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebPos    = new Float32Array(NEBULA_COUNT * 3);
    const nebCol    = new Float32Array(NEBULA_COUNT * 3);
    const nebSizes  = new Float32Array(NEBULA_COUNT);

    const nebulaPalette = [
      new THREE.Color("#1e3a8a"),
      new THREE.Color("#312e81"),
      new THREE.Color("#1e1b4b"),
      new THREE.Color("#0c4a6e"),
      new THREE.Color("#4c1d95"),
      new THREE.Color("#0f172a"),
    ];

    for (let i = 0; i < NEBULA_COUNT; i++) {
      const arm   = i % ARMS;
      const t     = rand(0.1, 1.0);
      const r     = t * GALAXY_RADIUS * 1.3;
      const spin  = r * 0.022;
      const angle = (arm / ARMS) * Math.PI * 2 + spin + rand(-0.4, 0.4);
      const spread = rand(3, 22);

      nebPos[i * 3]     = Math.cos(angle) * r + rand(-spread, spread);
      nebPos[i * 3 + 1] = rand(-4, 4);
      nebPos[i * 3 + 2] = Math.sin(angle) * r + rand(-spread, spread);

      const c = nebulaPalette[Math.floor(Math.random() * nebulaPalette.length)];
      const bright = rand(0.4, 1.0);
      nebCol[i * 3]     = c.r * bright;
      nebCol[i * 3 + 1] = c.g * bright;
      nebCol[i * 3 + 2] = c.b * bright;
      nebSizes[i] = rand(6, 28);
    }
    nebulaGeo.setAttribute("position", new THREE.BufferAttribute(nebPos, 3));
    nebulaGeo.setAttribute("color",    new THREE.BufferAttribute(nebCol, 3));
    nebulaGeo.setAttribute("size",     new THREE.BufferAttribute(nebSizes, 1));

    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (220.0 / -mvPos.z);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float s = pow(1.0 - d * 2.0, 1.4);
          gl_FragColor = vec4(vColor, s * 0.18);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // ────────────────────────────────────────────────────────────────────────
    // 5. TWINKLING BRIGHT FOREGROUND STARS
    // ────────────────────────────────────────────────────────────────────────
    const TWINKLE_COUNT = 280;
    const twinkleGeo = new THREE.BufferGeometry();
    const twinklePos  = new Float32Array(TWINKLE_COUNT * 3);
    const twinkleSizes = new Float32Array(TWINKLE_COUNT);
    const twinklePhases = new Float32Array(TWINKLE_COUNT);

    for (let i = 0; i < TWINKLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = rand(80, 500);
      twinklePos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      twinklePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      twinklePos[i * 3 + 2] = r * Math.cos(phi);
      twinkleSizes[i]  = rand(0.8, 2.6);
      twinklePhases[i] = Math.random() * Math.PI * 2;
    }
    twinkleGeo.setAttribute("position", new THREE.BufferAttribute(twinklePos, 3));
    twinkleGeo.setAttribute("size",     new THREE.BufferAttribute(twinkleSizes, 1));
    twinkleGeo.setAttribute("phase",    new THREE.BufferAttribute(twinklePhases, 1));

    const twinkleMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        varying float vBright;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vBright = 0.55 + 0.45 * sin(uTime * 2.0 + phase);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * vBright * uPixelRatio * (300.0 / -mvPos.z);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vBright;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float core  = pow(1.0 - d * 2.0, 3.5);
          float spike = max(0.0, 1.0 - abs(gl_PointCoord.x - 0.5) * 10.0) * max(0.0, 1.0 - d * 4.0);
          spike      += max(0.0, 1.0 - abs(gl_PointCoord.y - 0.5) * 10.0) * max(0.0, 1.0 - d * 4.0);
          float s = core + spike * 0.35;
          gl_FragColor = vec4(0.88, 0.94, 1.0, s * vBright);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const twinkleStars = new THREE.Points(twinkleGeo, twinkleMat);
    scene.add(twinkleStars);

    // ── Mouse parallax ───────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouse = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse);

    // ── Resize handler ───────────────────────────────────────────────────────
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ── Animation loop ───────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow galaxy rotation
      galaxy.rotation.y     = t * 0.018;
      coreGlow.rotation.y   = t * 0.025;
      nebula.rotation.y     = t * 0.012;
      starField.rotation.y  = t * 0.004;
      starField.rotation.x  = t * 0.002;

      // Update time uniforms
      (galaxyMat.uniforms.uTime as { value: number }).value  = t;
      (twinkleMat.uniforms.uTime as { value: number }).value = t;

      // Camera gentle parallax from mouse
      targetRotX = mouseY * 0.12;
      targetRotY = mouseX * 0.12;
      camera.position.x += (Math.sin(targetRotY) * 20 - camera.position.x) * 0.03;
      camera.position.y += (Math.sin(targetRotX) * 15 + 55 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      [starGeo, galaxyGeo, coreGlowGeo, nebulaGeo, twinkleGeo].forEach((g) => g.dispose());
      [starMat, galaxyMat, coreGlowMat, nebulaMat, twinkleMat].forEach((m) => m.dispose());
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
}


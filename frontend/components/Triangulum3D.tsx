"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Triangulum3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeVertex, setActiveVertex] = useState<number>(0);

  const VERTEX_DESCRIPTIONS = [
    {
      title: "VERTEX I // ATMOSPHERE",
      metric: "Precipitation & Monsoon Dynamics",
      detail: "Monsoon intensity, rainfall volume, and extreme climate volatility anomalies.",
      color: "#60a5fa", // Blue
    },
    {
      title: "VERTEX II // HYDROSPHERE",
      metric: "Topography & Watershed Integrity",
      detail: "River capacity, basin drainage gradients, siltation buildup, and terrain runoff velocity.",
      color: "#38bdf8", // Cyan
    },
    {
      title: "VERTEX III // ANTHROPOSPHERE",
      metric: "Infrastructure & Preparedness",
      detail: "Impermeable urban sprawl, aging dams, deforested buffers, and early warning logistics.",
      color: "#818cf8", // Indigo
    },
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Parent group for overall rotation & mouse parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // -------------------------------------------------------------
    // 1. The Core Triangulum Prism / Tetrahedron
    // -------------------------------------------------------------
    // Equilateral triangle base in the XZ plane + top vertex along Y
    const r = 2.4;
    const h = 1.8;
    const v0 = new THREE.Vector3(0, h * 0.9, 0); // Apex (Atmosphere)
    const v1 = new THREE.Vector3(
      r * Math.cos(0),
      -h * 0.5,
      r * Math.sin(0)
    ); // Hydrosphere
    const v2 = new THREE.Vector3(
      r * Math.cos((2 * Math.PI) / 3),
      -h * 0.5,
      r * Math.sin((2 * Math.PI) / 3)
    ); // Anthroposphere
    const v3 = new THREE.Vector3(
      r * Math.cos((4 * Math.PI) / 3),
      -h * 0.5,
      r * Math.sin((4 * Math.PI) / 3)
    ); // Base anchor

    // Geometry faces
    const positions = new Float32Array([
      // Face 1: Apex, V1, V2
      v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z,
      // Face 2: Apex, V2, V3
      v0.x, v0.y, v0.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z,
      // Face 3: Apex, V3, V1
      v0.x, v0.y, v0.z, v3.x, v3.y, v3.z, v1.x, v1.y, v1.z,
      // Base: V1, V3, V2
      v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v2.x, v2.y, v2.z,
    ]);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.computeVertexNormals();

    // Semi-transparent iridescent mesh
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.85,
      thickness: 1.2,
      transparent: true,
      opacity: 0.22,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const faceMesh = new THREE.Mesh(geom, faceMaterial);
    mainGroup.add(faceMesh);

    // Glowing wireframe edges
    const wireframeGeom = new THREE.WireframeGeometry(geom);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });
    const wireframeLines = new THREE.LineSegments(wireframeGeom, wireframeMaterial);
    mainGroup.add(wireframeLines);

    // -------------------------------------------------------------
    // 2. Vertex Glowing Energy Beacons
    // -------------------------------------------------------------
    const vertices = [v0, v1, v2];
    const beaconColors = [0x60a5fa, 0x38bdf8, 0x818cf8];
    const beaconMeshes: THREE.Mesh[] = [];

    vertices.forEach((pos, idx) => {
      // Beacon Sphere
      const sphereGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: beaconColors[idx],
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.copy(pos);
      mainGroup.add(sphere);
      beaconMeshes.push(sphere);

      // Pulsing Ring around each beacon
      const ringGeom = new THREE.RingGeometry(0.2, 0.23, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: beaconColors[idx],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2;
      mainGroup.add(ring);
    });

    // -------------------------------------------------------------
    // 3. Inner Swirling Fluid Core (Water Particles)
    // -------------------------------------------------------------
    const innerParticleCount = 180;
    const innerPositions = new Float32Array(innerParticleCount * 3);
    for (let i = 0; i < innerParticleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rad = Math.cbrt(Math.random()) * 0.9;
      const sinPhi = Math.sin(phi);

      innerPositions[i * 3] = rad * sinPhi * Math.cos(theta);
      innerPositions[i * 3 + 1] = rad * sinPhi * Math.sin(theta);
      innerPositions[i * 3 + 2] = rad * Math.cos(phi);
    }

    const innerGeom = new THREE.BufferGeometry();
    innerGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(innerPositions, 3)
    );
    const innerMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const innerPoints = new THREE.Points(innerGeom, innerMat);
    mainGroup.add(innerPoints);

    // -------------------------------------------------------------
    // 4. Outer Celestial Orbital Ring
    // -------------------------------------------------------------
    const orbitRadius = 3.2;
    const orbitPointsCount = 120;
    const orbitCurve = new THREE.EllipseCurve(
      0,
      0,
      orbitRadius,
      orbitRadius * 0.75,
      0,
      2 * Math.PI,
      false,
      0
    );
    const orbitPoints = orbitCurve.getPoints(orbitPointsCount);
    const orbitGeom = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.35,
    });
    const orbitLine = new THREE.Line(orbitGeom, orbitMat);
    orbitLine.rotation.x = Math.PI / 4;
    orbitLine.rotation.z = Math.PI / 8;
    mainGroup.add(orbitLine);

    // -------------------------------------------------------------
    // 5. Lights
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x60a5fa, 3, 20);
    pointLight.position.set(4, 5, 4);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x38bdf8, 2, 20);
    secondaryLight.position.set(-4, -3, 3);
    scene.add(secondaryLight);

    // -------------------------------------------------------------
    // 6. Interaction & Parallax
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      targetX = x * 0.9;
      targetY = y * 0.9;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // -------------------------------------------------------------
    // 7. Animation Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth parallax dampening
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Base rotation + mouse tilt
      mainGroup.rotation.y = elapsedTime * 0.35 + mouseX;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15 - mouseY;

      // Inner water core rotation
      innerPoints.rotation.y = -elapsedTime * 0.5;
      innerPoints.rotation.x = Math.cos(elapsedTime * 0.4) * 0.2;

      // Orbital ring wobble
      orbitLine.rotation.z = Math.PI / 8 + Math.sin(elapsedTime * 0.3) * 0.08;

      // Pulse beacon sizes
      beaconMeshes.forEach((mesh, i) => {
        const s = 1.0 + 0.25 * Math.sin(elapsedTime * 3.0 + i * 2.0);
        mesh.scale.set(s, s, s);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Rotate active vertex info every 4 seconds
    const interval = setInterval(() => {
      setActiveVertex((prev) => (prev + 1) % 3);
    }, 4500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="relative w-full h-[300px] sm:h-[350px] lg:h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      >
        {/* Subtle radial aura behind the 3D model */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none rounded-full blur-3xl"></div>

        {/* Holographic HUD corner brackets */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-blue-500/40 pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-blue-500/40 pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-blue-500/40 pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-blue-500/40 pointer-events-none"></div>

        {/* Floating status tag */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 pointer-events-none">
          3D CONVERGENCE MATRIX
        </div>
      </div>

      {/* Tripartite Vertex Meaning Showcase */}
      <div className="w-full mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 px-1">
        {VERTEX_DESCRIPTIONS.map((v, idx) => {
          const isActive = activeVertex === idx;
          return (
            <div
              key={v.title}
              onClick={() => setActiveVertex(idx)}
              className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                isActive
                  ? "bg-slate-900/95 border-blue-500 shadow-md shadow-blue-500/20"
                  : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="text-[10px] font-mono font-bold tracking-wider uppercase"
                  style={{ color: v.color }}
                >
                  {v.title}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {v.metric}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

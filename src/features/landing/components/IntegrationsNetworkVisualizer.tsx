import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Globe, Layers, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

interface NetworkNode {
  name: string;
  category: 'Courier' | 'Store';
  x: number;
  y: number;
  z: number;
  color: number;
}

const networkNodes: NetworkNode[] = [
  { name: 'Delhivery', category: 'Courier', x: 8, y: 0.5, z: 0, color: 0x2563eb },
  { name: 'Blue Dart', category: 'Courier', x: -8, y: -0.5, z: 0, color: 0x3b82f6 },
  { name: 'DHL Express', category: 'Courier', x: 0, y: 6.5, z: 0, color: 0xeab308 },
  { name: 'Xpressbees', category: 'Courier', x: 0, y: -6.5, z: 0, color: 0xa855f7 },
  { name: 'Shopify', category: 'Store', x: 6, y: 5, z: -1, color: 0x10b981 },
  { name: 'WooCommerce', category: 'Store', x: -6, y: 5, z: -1, color: 0x8b5cf6 },
  { name: 'Ecom Express', category: 'Courier', x: 6, y: -5, z: -1, color: 0x06b6d4 },
  { name: 'Shadowfax', category: 'Courier', x: -6, y: -5, z: -1, color: 0xf97316 },
];

export const IntegrationsNetworkVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // WebGL support check
    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!hasWebGL) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Central ShipSmarter Core Node
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Inner Core Solid Orb
    const innerGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Peripheral Network Nodes & Connection Lines
    const nodeGroup = new THREE.Group();
    const lineGroup = new THREE.Group();
    const particlePulseGroup = new THREE.Group();

    networkNodes.forEach((node) => {
      // Node Sphere
      const nGeo = new THREE.SphereGeometry(0.75, 24, 24);
      const nMat = new THREE.MeshBasicMaterial({
        color: node.color,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.set(node.x, node.y, node.z);
      nodeGroup.add(nMesh);

      // Inner solid node
      const nInnerGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const nInnerMat = new THREE.MeshBasicMaterial({ color: node.color });
      const nInnerMesh = new THREE.Mesh(nInnerGeo, nInnerMat);
      nInnerMesh.position.set(node.x, node.y, node.z);
      nodeGroup.add(nInnerMesh);

      // Connection Line to Center
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(node.x, node.y, node.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      lineGroup.add(line);

      // Data Flow Pulse Spheres traveling along line
      const pulseGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.userData = {
        startX: 0, startY: 0, startZ: 0,
        endX: node.x, endY: node.y, endZ: node.z,
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.006,
      };
      particlePulseGroup.add(pulseMesh);
    });

    scene.add(nodeGroup);
    scene.add(lineGroup);
    scene.add(particlePulseGroup);

    // Mouse Parallax Logic
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Render Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Smooth Mouse Tilt
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 2.5;
      camera.position.y = -targetY * 2.5;
      camera.lookAt(scene.position);

      // Rotate Core
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;

      // Rotate Peripheral Nodes
      nodeGroup.rotation.z += 0.001;
      lineGroup.rotation.z += 0.001;
      particlePulseGroup.rotation.z += 0.001;

      // Move Data Flow Pulses along connection lines
      particlePulseGroup.children.forEach((child) => {
        const p = child.userData;
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        child.position.x = THREE.MathUtils.lerp(p.startX, p.endX, p.progress);
        child.position.y = THREE.MathUtils.lerp(p.startY, p.endY, p.progress);
        child.position.z = THREE.MathUtils.lerp(p.startZ, p.endZ, p.progress);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="integrations" 
      className="py-20 sm:py-24 px-4 sm:px-8 bg-slate-50 border-b border-slate-200 overflow-hidden relative"
    >

      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 text-blue-800 text-xs font-extrabold border border-blue-200/80 shadow-xs backdrop-blur-xs">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>API &amp; Multi-Courier Ecosystem • 2.5D Three.js Network</span>
            </span>
          </div>

          <h2 className="text-[32px] sm:text-[42px] md:text-[48px] lg:text-[54px] font-black leading-tight tracking-tight font-display max-w-4xl mx-auto text-slate-900">
            Connect 7+ Carriers &amp; E-Commerce Platforms
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-[800px] mx-auto font-medium leading-relaxed">
            ShipSmarter normalizes status events, freight APIs, and store orders through a single high-performance integration engine.
          </p>
        </motion.div>

        {/* 2.5D Three.js Network Canvas Container / WebGL Fallback */}
        <div className="relative w-full h-[460px] sm:h-[500px] bg-slate-900 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden group">
          {webglSupported ? (
            <div ref={mountRef} className="absolute inset-0 w-full h-full z-10" />
          ) : (
            /* HTML/CSS WebGL Fallback Diagram */
            <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
              <div className="relative w-full max-w-2xl h-64 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center font-display shadow-2xl ring-8 ring-blue-500/20 z-20">
                  SHIPSMARTER
                </div>
                {networkNodes.slice(0, 4).map((node, idx) => (
                  <div key={idx} className="absolute p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold shadow-md">
                    {node.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Hub Badge Overlay */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-extrabold flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>ShipSmarter API Hub Active</span>
            </span>
          </div>

          <div className="absolute bottom-6 right-6 z-20">
            <Link to="/integrations">
              <button className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold shadow-md backdrop-blur-md text-xs px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2">
                <span>Explore API Integrations</span>
                <ArrowRight className="w-4 h-4 text-slate-900" />
              </button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-display">Real-Time API Sync</span>
              <span className="block text-[11px] text-slate-500 font-medium">Sub-second webhook updates</span>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-display">Unified Status Events</span>
              <span className="block text-[11px] text-slate-500 font-medium">Normalized multi-carrier tracking</span>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900 font-display">99.9% API Uptime</span>
              <span className="block text-[11px] text-slate-500 font-medium">Enterprise grade reliability</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

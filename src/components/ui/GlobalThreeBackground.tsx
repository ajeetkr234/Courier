import React, { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  IcosahedronGeometry,
  OctahedronGeometry,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from 'three';

export const GlobalThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Floating 3D Particles
    const particleCount = 180;
    const particleGeo = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Soft blue / cyan / indigo palette
      colors[i * 3] = 0.2 + Math.random() * 0.2;     // R
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.4; // G
      colors[i * 3 + 2] = 0.95;                      // B
    }

    particleGeo.setAttribute('position', new BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new BufferAttribute(colors, 3));

    const particleMat = new PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    });

    const particles = new Points(particleGeo, particleMat);
    scene.add(particles);

    // Add 3 Floating Wireframe Geometries (Icosahedron, Octahedron, Cube)
    const geometries = [
      new IcosahedronGeometry(2.5, 1),
      new OctahedronGeometry(2.2, 0),
      new BoxGeometry(2, 2, 2)
    ];

    const meshes: Mesh[] = [];
    geometries.forEach((geo, idx) => {
      const mat = new MeshBasicMaterial({
        color: 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      const mesh = new Mesh(geo, mat);
      mesh.position.set(
        (idx - 1) * 18,
        (idx % 2 === 0 ? 1 : -1) * 8,
        -5
      );
      meshes.push(mesh);
      scene.add(mesh);
    });

    // Mouse Parallax Logic
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      particles.rotation.y = scrollY * 0.0003;
      meshes.forEach((m, idx) => {
        m.rotation.x = scrollY * 0.0002 * (idx + 1);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 3;
      camera.position.y = -targetY * 3;
      camera.lookAt(scene.position);

      particles.rotation.y += 0.0005;
      meshes.forEach((mesh, idx) => {
        mesh.rotation.x += 0.003 * (idx + 1);
        mesh.rotation.y += 0.004 * (idx + 1);
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      // Clean up WebGL resources to avoid GPU memory leaks
      particleGeo.dispose();
      particleMat.dispose();
      geometries.forEach((geo) => geo.dispose());
      meshes.forEach((mesh) => {
        if (mesh.material instanceof MeshBasicMaterial) {
          mesh.material.dispose();
        }
      });

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden" 
    />
  );
};

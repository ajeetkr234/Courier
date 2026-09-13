import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  Zap, ArrowRight, CheckCircle2, Globe, Layers, Activity, 
  Terminal, Cpu, Server, Radio, Code2, 
  Check, Gauge, Play, Pause, ShieldCheck, 
  Copy, Wifi
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface NetworkNode {
  id: string;
  name: string;
  category: 'Store' | 'Courier' | 'API';
  x: number;
  y: number;
  z: number;
  color: string;
  hexColor: number;
  protocol: string;
  latency: string;
  status: 'Active' | 'Optimal';
  badge: string;
}

const networkNodes: NetworkNode[] = [
  { id: 'shopify', name: 'Shopify', category: 'Store', x: -8, y: 4.5, z: 0, color: '#10b981', hexColor: 0x10b981, protocol: 'Webhooks / REST', latency: '42ms', status: 'Active', badge: '1-Click Hook' },
  { id: 'woocommerce', name: 'WooCommerce', category: 'Store', x: -8, y: -0.5, z: 0, color: '#8b5cf6', hexColor: 0x8b5cf6, protocol: 'REST v3 Sync', latency: '58ms', status: 'Active', badge: 'Plugin Sync' },
  { id: 'custom_api', name: 'Developer REST API', category: 'API', x: -8, y: -5.5, z: 0, color: '#06b6d4', hexColor: 0x06b6d4, protocol: 'JSON / HTTPS', latency: '24ms', status: 'Optimal', badge: 'Sub-30ms' },
  { id: 'delhivery', name: 'Delhivery', category: 'Courier', x: 8, y: 5.5, z: 0, color: '#2563eb', hexColor: 0x2563eb, protocol: 'Direct API', latency: '35ms', status: 'Optimal', badge: 'Direct API' },
  { id: 'bluedart', name: 'Blue Dart', category: 'Courier', x: 8, y: 2.0, z: 0, color: '#3b82f6', hexColor: 0x3b82f6, protocol: 'SOAP / REST', latency: '48ms', status: 'Active', badge: 'Air Express' },
  { id: 'dhl', name: 'DHL Express', category: 'Courier', x: 8, y: -1.5, z: 0, color: '#eab308', hexColor: 0xeab308, protocol: 'Global API', latency: '62ms', status: 'Active', badge: 'Cross-Border' },
  { id: 'xpressbees', name: 'Xpressbees', category: 'Courier', x: 8, y: -5.0, z: 0, color: '#a855f7', hexColor: 0xa855f7, protocol: 'V2 Webhooks', latency: '39ms', status: 'Optimal', badge: 'Surface & Air' },
];

const nodePayloads: Record<string, Record<string, any>> = {
  shopify: {
    event: "orders/create",
    platform: "Shopify Plus",
    order_id: "SH-984210",
    customer_pincode: "400001",
    weight_kg: 0.85,
    payment_mode: "Prepaid",
    smart_route: {
      algorithm: "cheapest_fastest_composite",
      assigned_carrier: "Delhivery Surface",
      awb: "DEL-892104921",
      est_delivery: "2 Business Days"
    },
    latency: "38ms",
    status: "200_OK"
  },
  woocommerce: {
    event: "woocommerce_order_created",
    platform: "WooCommerce v8.4",
    order_id: "WC-84910",
    customer_pincode: "560001",
    weight_kg: 1.25,
    payment_mode: "COD",
    smart_route: {
      algorithm: "cod_safest_sla",
      assigned_carrier: "Blue Dart Air",
      awb: "BLU-99410291",
      cod_risk_score: "LOW"
    },
    latency: "44ms",
    status: "200_OK"
  },
  custom_api: {
    endpoint: "POST /v2/shipments/instant-dispatch",
    idempotency_key: "sf_idemp_990182",
    seller_tier: "Enterprise Pro",
    payload_format: "application/json",
    declared_value: 4500,
    smart_route: {
      algorithm: "least_cost_matrix",
      assigned_carrier: "Xpressbees Surface",
      awb: "XPB-77401928"
    },
    latency: "21ms",
    status: "201_CREATED"
  },
  delhivery: {
    carrier: "Delhivery Direct API",
    endpoint: "https://track.delhivery.com/api/v2/manifest",
    direct_pincode_reach: "18,600+ Pincodes",
    active_service_types: ["Surface", "Express", "Heavy"],
    auto_failover_standby: "Blue Dart",
    p95_response_time: "32ms",
    service_health: "Optimal (99.98% SLA)"
  },
  bluedart: {
    carrier: "Blue Dart Air Express",
    endpoint: "https://api.bluedart.com/v1/shipments",
    direct_pincode_reach: "14,200+ Pincodes",
    active_service_types: ["Apex Air", "Domestic Priority"],
    auto_failover_standby: "Delhivery Express",
    p95_response_time: "44ms",
    service_health: "Optimal (99.95% SLA)"
  },
  dhl: {
    carrier: "DHL Express Global",
    endpoint: "https://express.api.dhl.com/mydhlapi/shipments",
    global_reach: "220+ Countries",
    customs_clearance: "Automated Paperless Trade",
    p95_response_time: "58ms",
    service_health: "Optimal (99.99% SLA)"
  },
  xpressbees: {
    carrier: "Xpressbees Logistics",
    endpoint: "https://shipment.xpressbees.com/api/v2",
    direct_pincode_reach: "17,500+ Pincodes",
    active_service_types: ["Surface Standard", "Air Fast"],
    auto_failover_standby: "Shadowfax",
    p95_response_time: "39ms",
    service_health: "Optimal (99.91% SLA)"
  }
};

const simulatedWebhooks = [
  { id: 'evt_101', time: 'Just now', event: 'order.created', source: 'Shopify Store', payload: 'ORD-9821 • 0.8 kg • COD', status: '200 OK', latency: '32ms' },
  { id: 'evt_102', time: '1s ago', event: 'rate.calculated', source: 'Routing Engine', payload: 'Delhivery Surface • ₹74.00', status: '200 OK', latency: '18ms' },
  { id: 'evt_103', time: '3s ago', event: 'awb.assigned', source: 'Delhivery Gateway', payload: 'AWB: DEL-884920192', status: '201 Created', latency: '45ms' },
  { id: 'evt_104', time: '5s ago', event: 'tracking.updated', source: 'Blue Dart', payload: 'In Transit • Mumbai Hub', status: '200 OK', latency: '28ms' },
  { id: 'evt_105', time: '7s ago', event: 'label.generated', source: 'Thermal Engine', payload: '4x6 PDF Barcode Ready', status: '200 OK', latency: '12ms' },
];

const carrierMetrics = [
  { name: 'Delhivery Surface & Express', uptime: '99.98%', latency: '32ms', load: '34%', status: 'Optimal' },
  { name: 'Blue Dart Air Express', uptime: '99.95%', latency: '44ms', load: '28%', status: 'Optimal' },
  { name: 'DHL Express International', uptime: '99.99%', latency: '58ms', load: '14%', status: 'Optimal' },
  { name: 'Xpressbees Logistics', uptime: '99.91%', latency: '39ms', load: '18%', status: 'Optimal' },
  { name: 'Shadowfax Local & Air', uptime: '99.89%', latency: '41ms', load: '6%', status: 'Optimal' },
];

export const IntegrationsNetworkVisualizer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [webglSupported] = useState<boolean>(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState<'visualizer' | 'webhooks' | 'matrix'>('visualizer');
  const [selectedNode, setSelectedNode] = useState<NetworkNode>(networkNodes[0]);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showPayload, setShowPayload] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
    }, 900);
  };

  const handleCopyPayload = () => {
    const payload = nodePayloads[selectedNode.id] || {};
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!webglSupported) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !mountRef.current || activeTab !== 'visualizer') return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Central Core Node
    const coreGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    const innerGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    const nodeGroup = new THREE.Group();
    const lineGroup = new THREE.Group();
    const particlePulseGroup = new THREE.Group();

    networkNodes.forEach((node) => {
      const nGeo = new THREE.SphereGeometry(0.65, 24, 24);
      const nMat = new THREE.MeshBasicMaterial({
        color: node.hexColor,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
      });
      const nMesh = new THREE.Mesh(nGeo, nMat);
      nMesh.position.set(node.x, node.y, node.z);
      nodeGroup.add(nMesh);

      const nInnerGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const nInnerMat = new THREE.MeshBasicMaterial({ color: node.hexColor });
      const nInnerMesh = new THREE.Mesh(nInnerGeo, nInnerMat);
      nInnerMesh.position.set(node.x, node.y, node.z);
      nodeGroup.add(nInnerMesh);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(node.x, node.y, node.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      lineGroup.add(line);

      // Dynamic Data Pulse Particles
      for (let i = 0; i < 2; i++) {
        const pulseGeo = new THREE.SphereGeometry(0.14, 12, 12);
        const pulseMat = new THREE.MeshBasicMaterial({ color: node.category === 'Store' ? 0x34d399 : 0x60a5fa });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        
        const isFromStore = node.category === 'Store';
        pulseMesh.userData = {
          startX: isFromStore ? node.x : 0,
          startY: isFromStore ? node.y : 0,
          startZ: isFromStore ? node.z : 0,
          endX: isFromStore ? 0 : node.x,
          endY: isFromStore ? 0 : node.y,
          endZ: isFromStore ? 0 : node.z,
          progress: i * 0.5 + Math.random() * 0.2,
          speed: 0.007 + Math.random() * 0.005,
        };
        particlePulseGroup.add(pulseMesh);
      }
    });

    scene.add(nodeGroup);
    scene.add(lineGroup);
    scene.add(particlePulseGroup);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 1.6;
      camera.position.y = -targetY * 1.6;
      camera.lookAt(scene.position);

      coreMesh.rotation.y += 0.006;
      coreMesh.rotation.x += 0.003;

      nodeGroup.rotation.z += 0.0005;
      lineGroup.rotation.z += 0.0005;
      particlePulseGroup.rotation.z += 0.0005;

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
  }, [activeTab, webglSupported]);

  return (
    <section 
      ref={sectionRef} 
      id="architecture" 
      className="py-10 sm:py-16 px-3 xs:px-4 sm:px-8 lg:px-12 bg-white border-b border-slate-200/80 relative overflow-hidden scroll-mt-20"
    >
      {/* Subtle Atmospheric Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-tr from-blue-100/40 via-indigo-100/30 to-teal-50/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Standardized Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 sm:space-y-3.5 max-w-5xl mx-auto px-1 xs:px-2"
        >
          <div className="inline-block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 xs:px-3.5 rounded-full bg-blue-50 text-blue-700 text-[11px] xs:text-xs font-extrabold border border-blue-200/80 shadow-xs">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="uppercase tracking-wider">UNIFIED INTEGRATION ENGINE • LIVE MULTI-CARRIER ROUTING</span>
            </div>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
            One Core Integration.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Every Carrier &amp; Storefront.
            </span>
          </h2>

          <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            ShipFaster Logistic normalizes status events, freight rate APIs, and storefront orders through a unified high-concurrency API hub.
          </p>
        </motion.div>

        {/* Live Network Control Deck (Status Ribbon + Mode Tabs) */}
        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          
          {/* Real-time Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 text-[11px] xs:text-xs font-mono">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold">API Hub Online (v2.4)</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse shrink-0" />
              <span>14,250 req/min</span>
            </div>

            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>&lt;28ms Avg Routing</span>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-2.5 xs:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'visualizer' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Interactive Network</span>
            </button>

            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-2.5 xs:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'webhooks' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span>Live Event Ticker</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-2.5 xs:px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'matrix' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 shrink-0" />
              <span>Gateway Matrix</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Unique Interactive Mesh & Telemetry Studio */}
        {activeTab === 'visualizer' && (
          <div className="relative w-full space-y-5 sm:space-y-6">
            
            {/* Visualizer Canvas Area with Left & Right Node Columns */}
            <div className="relative min-h-[440px] md:min-h-[480px] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 md:gap-4 p-2 xs:p-3 md:p-0 overflow-hidden rounded-2xl border border-slate-200/70 md:border-none bg-slate-50/50 md:bg-transparent">
              
              {/* Background Subtle Tech Dot Matrix */}
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

              {/* Three.js 3D Background Canvas (Fully Unobscured) */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40 md:opacity-100">
                {webglSupported && <div ref={mountRef} className="w-full h-full" />}
              </div>

              {/* Floating Center Orbit HUD Tag */}
              <div className="relative md:absolute md:top-2 md:left-1/2 md:-translate-x-1/2 z-10 pointer-events-none flex justify-center order-first md:order-none mb-1 md:mb-0">
                <div className="px-3 py-1 xs:px-3.5 xs:py-1.5 rounded-full bg-white/95 border border-blue-300/80 shadow-xs backdrop-blur-md flex items-center gap-1.5 xs:gap-2 text-[10px] xs:text-[11px] font-mono text-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" style={{ animationDuration: '8s' }} />
                  <span className="font-bold">ShipFaster Core Mesh</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-semibold">Normalized Event Bus</span>
                </div>
              </div>

              {/* Left Column: Input Storefronts */}
              <div className="relative z-10 flex flex-col gap-2 xs:gap-2.5 w-full md:max-w-[250px] lg:max-w-[270px]">
                <div className="flex items-center gap-2 px-1 text-[10px] xs:text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  <Wifi className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Input Storefronts</span>
                </div>

                {networkNodes.filter(n => n.category !== 'Courier').map(node => {
                  const isSelected = selectedNode.id === node.id;
                  const isHovered = hoveredNodeId === node.id;

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`px-3 py-2 xs:px-3.5 xs:py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer backdrop-blur-md flex items-center justify-between gap-2.5 xs:gap-3 ${
                        isSelected 
                          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20 text-slate-900 md:translate-x-1' 
                          : isHovered 
                            ? 'bg-white border-slate-300 shadow-xs text-slate-900 md:translate-x-0.5' 
                            : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-xs" 
                          style={{ backgroundColor: node.color }} 
                        />
                        <div className="truncate">
                          <span className="block text-xs font-bold text-slate-900 truncate">{node.name}</span>
                          <span className="block text-[10px] text-slate-500 font-mono truncate">{node.protocol}</span>
                        </div>
                      </div>

                      <span className="text-[9px] xs:text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 xs:px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {node.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Carrier Gateways */}
              <div className="relative z-10 flex flex-col gap-2 xs:gap-2.5 w-full md:max-w-[250px] lg:max-w-[270px]">
                <div className="flex items-center justify-start md:justify-end gap-2 px-1 text-[10px] xs:text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  <span>Carrier Gateways</span>
                  <Server className="w-3 h-3 text-blue-500 shrink-0" />
                </div>

                {networkNodes.filter(n => n.category === 'Courier').map(node => {
                  const isSelected = selectedNode.id === node.id;
                  const isHovered = hoveredNodeId === node.id;

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`px-3 py-2 xs:px-3.5 xs:py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer backdrop-blur-md flex items-center justify-between gap-2.5 xs:gap-3 ${
                        isSelected 
                          ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20 text-slate-900 md:-translate-x-1' 
                          : isHovered 
                            ? 'bg-white border-slate-300 shadow-xs text-slate-900 md:-translate-x-0.5' 
                            : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-xs" 
                          style={{ backgroundColor: node.color }} 
                        />
                        <div className="truncate">
                          <span className="block text-xs font-bold text-slate-900 truncate">{node.name}</span>
                          <span className="block text-[10px] text-slate-500 font-mono truncate">{node.protocol}</span>
                        </div>
                      </div>

                      <span className="text-[9px] xs:text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 xs:px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        {node.latency}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Interactive Telemetry & Route Inspector Dock */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                
                {/* Active Route Pipeline Breadcrumb */}
                <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 text-[11px] xs:text-xs font-mono">
                  <span className="text-slate-400 font-medium">ACTIVE ROUTE:</span>
                  
                  <div className="flex items-center gap-1.5 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedNode.color }} />
                    <span className="truncate max-w-[120px] xs:max-w-none">{selectedNode.name}</span>
                  </div>

                  <span className="text-slate-400">──▶</span>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>ShipFaster Engine</span>
                  </div>

                  <span className="text-slate-400">──▶</span>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 xs:px-2.5 xs:py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                    <span>Delhivery / Blue Dart</span>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleTestPing}
                    disabled={isPinging}
                    className="flex-1 xs:flex-initial justify-center px-2.5 xs:px-3 py-1.5 rounded-lg text-[11px] xs:text-xs font-mono font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Radio className={`w-3.5 h-3.5 text-blue-600 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Handshake: 200 OK (18ms)' : 'Ping API Handshake'}</span>
                  </button>

                  <button
                    onClick={() => setShowPayload(!showPayload)}
                    className={`flex-1 xs:flex-initial justify-center px-2.5 xs:px-3 py-1.5 rounded-lg text-[11px] xs:text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border ${
                      showPayload 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{showPayload ? 'Hide Live Payload' : 'View Live Payload JSON'}</span>
                  </button>

                  <Link to="/register" className="w-full xs:w-auto text-center">
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors cursor-pointer">
                      <span>Connect Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>

              </div>

              {/* Expandable Live JSON Payload Inspector */}
              <AnimatePresence>
                {showPayload && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 xs:p-4 text-xs font-mono shadow-xl relative text-slate-200">
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          <span className="text-slate-200 font-bold truncate">Realtime Webhook: {selectedNode.name}</span>
                        </div>

                        <button
                          onClick={handleCopyPayload}
                          className="self-start xs:self-auto px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {copied ? (
                            <><Check className="w-3 h-3 text-emerald-400" /> Copied!</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy JSON</>
                          )}
                        </button>
                      </div>

                      <pre className="overflow-x-auto text-emerald-400/90 leading-relaxed text-[10px] xs:text-[11px] max-h-56">
                        {JSON.stringify(nodePayloads[selectedNode.id] || {}, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

        {/* TAB 2: Live Webhook Stream Ticker */}
        {activeTab === 'webhooks' && (
          <div className="space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between pb-2 border-b border-slate-200/80 gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-900">Real-Time Webhook Log Ticker</span>
              </div>
              <button 
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className="self-start xs:self-auto px-2.5 xs:px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {isLiveStreaming ? (
                  <><Pause className="w-3 h-3 text-amber-500" /> Pause Feed</>
                ) : (
                  <><Play className="w-3 h-3 text-emerald-600" /> Resume Feed</>
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {simulatedWebhooks.map((wh) => (
                <motion.div
                  key={wh.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2.5 xs:p-3 rounded-xl bg-white border border-slate-200 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-300 shadow-2xs transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-700">
                      {wh.event}
                    </span>
                    <span className="text-slate-500 text-[10px] xs:text-[11px]">{wh.source}</span>
                    <span className="text-slate-900 text-[11px] xs:text-xs font-semibold">{wh.payload}</span>
                  </div>

                  <div className="flex items-center gap-2.5 xs:gap-3 text-[10px] xs:text-[11px] justify-between sm:justify-end border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100">
                    <span className="text-emerald-600 font-bold">{wh.status}</span>
                    <span className="text-slate-500">{wh.latency}</span>
                    <span className="text-slate-400">{wh.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Carrier Gateway Performance Matrix */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between pb-2 border-b border-slate-200/80 gap-1">
              <span className="text-xs font-mono font-bold text-slate-900">Carrier Gateway SLA &amp; Auto-Failover Health</span>
              <span className="text-xs font-mono text-emerald-600 font-bold">All 12 Gateways Operational</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {carrierMetrics.map((c, i) => (
                <div key={i} className="p-3.5 xs:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 font-display">{c.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2 pt-2 border-t border-slate-100 text-[10px] xs:text-[11px] font-mono text-slate-600">
                    <div>
                      <span className="block text-[9px] xs:text-[10px] text-slate-400">SLA Uptime</span>
                      <span className="text-emerald-600 font-bold">{c.uptime}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] xs:text-[10px] text-slate-400">Latency</span>
                      <span className="text-blue-600 font-bold">{c.latency}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] xs:text-[10px] text-slate-400">Engine Load</span>
                      <span className="text-slate-700 font-bold">{c.load}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streamlined Architecture Capability Ribbon */}
        <div className="pt-6 sm:pt-8 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-slate-200/80">
          
          {/* Feature 1 */}
          <div className="py-2 md:py-0 md:px-5 lg:px-6 first:pl-0 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-2xs shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-950 font-display">Sub-50ms Webhook Engine</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Instant JSON event dispatch for order creation, AWB assignments, and real-time shipping status pings.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] xs:text-[11px] font-mono font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Zero-lag event bus</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="py-2 md:py-0 md:px-5 lg:px-6 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-950 font-display">Normalized Tracking Schema</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Standardize heterogeneous courier API responses from Delhivery, Blue Dart &amp; DHL into 5 clean lifecycle events.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] xs:text-[11px] font-mono font-bold text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Unified multi-carrier mapping</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="py-2 md:py-0 md:px-5 lg:px-6 last:pr-0 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-950 font-display">99.99% Enterprise SLA</h3>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Automated courier API failover with idempotent webhooks and exponential retry buffers for zero dropped orders.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] xs:text-[11px] font-mono font-bold text-blue-600">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Automated API failover</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

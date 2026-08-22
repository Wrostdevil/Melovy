import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePlayer } from '../../lib/playerContext';
import { audioEngine } from '../../lib/audioEngine';
import { Disc3, Volume2 } from 'lucide-react';

interface GramophoneCanvasProps {
  compact?: boolean;
}

export const GramophoneCanvas: React.FC<GramophoneCanvasProps> = ({ compact = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { currentSong, isPlaying, currentTime, duration, gramophoneQuality, setGramophoneQuality } = usePlayer();

  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  // References for Three.js animation
  const recordGroupRef = useRef<THREE.Group | null>(null);
  const toneArmGroupRef = useRef<THREE.Group | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    if (gramophoneQuality === '2d-vinyl' || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || (compact ? 300 : 500);
    const height = container.clientHeight || (compact ? 300 : 450);

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 7, 8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Clear existing canvas
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Dynamic Mood Point Light
    const moodColor = new THREE.Color(currentSong?.ambientColor || '#4f46e5');
    const pointLight = new THREE.PointLight(moodColor, 3, 10);
    pointLight.position.set(0, 3, 0);
    scene.add(pointLight);
    lightRef.current = pointLight;

    // 5. Turntable Base (Wooden Plinth)
    const baseGeo = new THREE.BoxGeometry(4.2, 0.4, 4.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917, // Dark mahogany / charcoal
      roughness: 0.3,
      metalness: 0.2,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.2;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Brass corner trim & feet
    const feetGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.2, 16);
    const feetMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.3 });
    [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].forEach(([x, z]) => {
      const foot = new THREE.Mesh(feetGeo, feetMat);
      foot.position.set(x, -0.4, z);
      scene.add(foot);
    });

    // Metallic Platter
    const platterGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 64);
    const platterMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.9, roughness: 0.2 });
    const platterMesh = new THREE.Mesh(platterGeo, platterMat);
    platterMesh.position.y = 0.05;
    scene.add(platterMesh);

    // Center Spindle
    const spindleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 16);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.9 });
    const spindleMesh = new THREE.Mesh(spindleGeo, spindleMat);
    spindleMesh.position.y = 0.2;
    scene.add(spindleMesh);

    // 6. Vinyl Record Group
    const recordGroup = new THREE.Group();
    recordGroupRef.current = recordGroup;

    // Record Disc
    const recordGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.03, 64);
    const recordMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.4,
      metalness: 0.5,
    });
    const recordMesh = new THREE.Mesh(recordGeo, recordMat);
    recordMesh.position.y = 0.1;
    recordGroup.add(recordMesh);

    // Vinyl Grooves (Concentric rings)
    for (let r = 0.5; r < 1.4; r += 0.08) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.02, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x27272a, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.118;
      recordGroup.add(ringMesh);
    }

    // Record Label Texture (Album Cover)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      currentSong?.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&q=80',
      (texture) => {
        const labelGeo = new THREE.CircleGeometry(0.48, 64);
        labelGeo.rotateX(-Math.PI / 2);
        const labelMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.y = 0.12;
        recordGroup.add(labelMesh);
      }
    );

    scene.add(recordGroup);

    // 7. Tonearm Assembly
    const toneArmGroup = new THREE.Group();
    toneArmGroupRef.current = toneArmGroup;
    toneArmGroup.position.set(1.4, 0.15, 1.3); // Pivot position

    // Pivot Base
    const pivotGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 16);
    const pivotMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
    const pivotMesh = new THREE.Mesh(pivotGeo, pivotMat);
    toneArmGroup.add(pivotMesh);

    // Arm Pole (S-shape curve mesh)
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.6, 16);
    armGeo.rotateZ(Math.PI / 2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.9, roughness: 0.1 });
    const armMesh = new THREE.Mesh(armGeo, armMat);
    armMesh.position.set(-0.7, 0.2, -0.2);
    toneArmGroup.add(armMesh);

    // Cartridge & Stylus Needle
    const headGeo = new THREE.BoxGeometry(0.12, 0.08, 0.2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(-1.4, 0.15, -0.2);
    toneArmGroup.add(headMesh);

    scene.add(toneArmGroup);

    // Mouse Interaction Drag to Rotate Scene
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      scene.rotation.y += deltaX * 0.008;
      scene.rotation.x = Math.max(-0.2, Math.min(0.8, scene.rotation.x + deltaY * 0.008));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate Record when playing
      if (recordGroupRef.current && isPlaying) {
        recordGroupRef.current.rotation.y += 0.03;
      }

      // Smoothly animate Tonearm onto record
      if (toneArmGroupRef.current) {
        // Target rotation angle: resting = 0, playing = ~0.35 rad inward
        const targetAngle = isPlaying ? 0.38 + (currentTime / (duration || 200)) * 0.15 : 0;
        toneArmGroupRef.current.rotation.y += (targetAngle - toneArmGroupRef.current.rotation.y) * 0.05;
      }

      // Pulse ambient point light with audio frequency
      if (lightRef.current) {
        const freq = audioEngine.getFrequencyData();
        const avgFreq = freq.reduce((a, b) => a + b, 0) / (freq.length || 1);
        lightRef.current.intensity = 2 + (avgFreq / 255) * 3;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isPlaying, currentSong, gramophoneQuality, compact]);

  // Update light color dynamically
  useEffect(() => {
    if (lightRef.current && currentSong) {
      lightRef.current.color.set(currentSong.ambientColor || '#4f46e5');
    }
  }, [currentSong]);

  // 2D Fallback or Quality Toggle
  if (!hasWebGL || gramophoneQuality === '2d-vinyl') {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 ${compact ? 'max-w-[280px]' : 'max-w-[420px]'} mx-auto`}>
        <div className="relative group">
          {/* Outer Vinyl Glow */}
          <div 
            className="absolute -inset-4 rounded-full blur-xl opacity-40 transition-all duration-700 animate-pulse"
            style={{ backgroundColor: currentSong?.ambientColor || '#4f46e5' }}
          />

          {/* 2D Animated Disc */}
          <div className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden ${isPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '8s' }}>
            
            {/* Concentric Grooves */}
            <div className="absolute inset-4 rounded-full border border-zinc-800/80" />
            <div className="absolute inset-10 rounded-full border border-zinc-800/60" />
            <div className="absolute inset-16 rounded-full border border-zinc-800/40" />

            {/* Album Cover Label */}
            <img 
              src={currentSong?.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&q=80'} 
              alt="Record Label" 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-zinc-900 shadow-inner"
            />

            {/* Spindle hole */}
            <div className="absolute w-4 h-4 bg-zinc-900 border border-zinc-600 rounded-full shadow-inner" />
          </div>
        </div>

        {/* Quality selector option */}
        <button 
          onClick={() => setGramophoneQuality('high-3d')}
          className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 px-3 py-1.5 rounded-full border border-indigo-500/20"
        >
          <Disc3 className="w-3.5 h-3.5" /> Enable 3D WebGL Gramophone
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Container for Three.js Canvas */}
      <div 
        ref={containerRef} 
        className={`w-full ${compact ? 'h-[280px]' : 'h-[380px] sm:h-[450px]'} rounded-2xl cursor-grab active:cursor-grabbing relative overflow-hidden`}
      />

      {/* 3D Interaction overlay guidance */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-slate-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800 backdrop-blur-md flex items-center gap-1.5 pointer-events-none opacity-80">
        <Volume2 className="w-3 h-3 text-indigo-400" /> Drag to rotate 3D view • Real-time turntable playback
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePlayer } from '../../lib/playerContext';
import { audioEngine } from '../../lib/audioEngine';
import { RotateCw, Volume2, Sparkles, Music } from 'lucide-react';

interface Realistic3DGramophoneProps {
  compact?: boolean;
}

export const Realistic3DGramophone: React.FC<Realistic3DGramophoneProps> = ({ compact = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { currentSong, isPlaying, currentTime, duration } = usePlayer();

  const [hasWebGL, setHasWebGL] = useState(true);

  // References to animate inside Three.js render loop
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const toneArmGroupRef = useRef<THREE.Group | null>(null);
  const hornLightRef = useRef<THREE.PointLight | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const soundRingsRef = useRef<THREE.Mesh[]>([]);
  const resetCameraRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || (compact ? 320 : 480);
    const height = container.clientHeight || (compact ? 320 : 480);

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(0, 3.2, 5.8);
    camera.position.copy(defaultCamPos);
    camera.lookAt(0, 0.4, 0);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff3db, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffe6a8, 2.2);
    mainKeyLight.position.set(4, 8, 5);
    mainKeyLight.castShadow = true;
    scene.add(mainKeyLight);

    const fillLight = new THREE.DirectionalLight(0x7c3aed, 1.2);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.5);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Horn Interior Glow Light
    const hornLight = new THREE.PointLight(0xf59e0b, 2.5, 6);
    hornLight.position.set(-0.8, 2.8, 0.4);
    scene.add(hornLight);
    hornLightRef.current = hornLight;

    // Mood Accent Light under base
    const baseGlow = new THREE.PointLight(
      new THREE.Color(currentSong?.ambientColor || currentSong?.colors?.[0] || '#9b6bff'),
      2.0,
      7
    );
    baseGlow.position.set(0, -0.2, 0);
    scene.add(baseGlow);

    // 4. Materials
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xdeb340,
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 1.5,
    });

    const polishedGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5c342,
      metalness: 0.95,
      roughness: 0.15,
    });

    const mahoganyWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d1a0e,
      roughness: 0.4,
      metalness: 0.1,
    });

    const darkWoodTrim = new THREE.MeshStandardMaterial({
      color: 0x240e06,
      roughness: 0.35,
      metalness: 0.15,
    });

    const vinylRecordMaterial = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.28,
      metalness: 0.7,
    });

    // 5. Build Victorian Wooden Cabinet Base (Plinth)
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Main Box
    const boxGeo = new THREE.BoxGeometry(2.4, 0.65, 2.4);
    const boxMesh = new THREE.Mesh(boxGeo, mahoganyWoodMaterial);
    boxMesh.position.y = -0.325;
    boxMesh.receiveShadow = true;
    baseGroup.add(boxMesh);

    // Top Molded Trim
    const topTrimGeo = new THREE.BoxGeometry(2.55, 0.1, 2.55);
    const topTrim = new THREE.Mesh(topTrimGeo, darkWoodTrim);
    topTrim.position.y = 0.04;
    baseGroup.add(topTrim);

    // Bottom Base Tier
    const botTrimGeo = new THREE.BoxGeometry(2.6, 0.12, 2.6);
    const botTrim = new THREE.Mesh(botTrimGeo, darkWoodTrim);
    botTrim.position.y = -0.68;
    baseGroup.add(botTrim);

    // Brass Carved Corner Feet (4 corner legs)
    const footGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.25, 16);
    [[-1.15, -1.15], [1.15, -1.15], [-1.15, 1.15], [1.15, 1.15]].forEach(([x, z]) => {
      const foot = new THREE.Mesh(footGeo, brassMaterial);
      foot.position.set(x, -0.8, z);
      baseGroup.add(foot);

      // Brass Corner bracket on top
      const bracketGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
      const bracket = new THREE.Mesh(bracketGeo, brassMaterial);
      bracket.position.set(x * 0.95, -0.32, z * 0.95);
      baseGroup.add(bracket);
    });

    // Engraved Brass Plaque on front
    const plaqueGeo = new THREE.BoxGeometry(1.0, 0.2, 0.02);
    const plaque = new THREE.Mesh(plaqueGeo, polishedGoldMaterial);
    plaque.position.set(0, -0.32, 1.21);
    baseGroup.add(plaque);

    // Mechanical Crank Handle on right side
    const crankStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 12);
    crankStemGeo.rotateZ(Math.PI / 2);
    const crankStem = new THREE.Mesh(crankStemGeo, brassMaterial);
    crankStem.position.set(1.35, -0.3, 0);
    baseGroup.add(crankStem);

    const crankArmGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12);
    const crankArm = new THREE.Mesh(crankArmGeo, brassMaterial);
    crankArm.position.set(1.52, -0.15, 0);
    baseGroup.add(crankArm);

    const crankKnobGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const crankKnob = new THREE.Mesh(crankKnobGeo, darkWoodTrim);
    crankKnob.position.set(1.52, 0.02, 0);
    baseGroup.add(crankKnob);

    // 6. Turntable & Vinyl Record Group (Rotating Part)
    const turntableGroup = new THREE.Group();
    turntableGroupRef.current = turntableGroup;
    turntableGroup.position.set(0.2, 0.1, 0.15); // Offset to allow space for tonearm & horn bracket
    scene.add(turntableGroup);

    // Brass Platter Rim
    const platterGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.06, 64);
    const platter = new THREE.Mesh(platterGeo, brassMaterial);
    platter.position.y = 0.02;
    turntableGroup.add(platter);

    // Velvet/Felt Slipmat
    const matGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.02, 64);
    const matMat = new THREE.MeshStandardMaterial({ color: 0x4c0519, roughness: 0.9 });
    const slipmat = new THREE.Mesh(matGeo, matMat);
    slipmat.position.y = 0.055;
    turntableGroup.add(slipmat);

    // Vinyl Record Disc
    const recordGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.02, 64);
    const recordMesh = new THREE.Mesh(recordGeo, vinylRecordMaterial);
    recordMesh.position.y = 0.07;
    turntableGroup.add(recordMesh);

    // Realistic Grooves (Shinier concentric specular rings)
    for (let r = 0.42; r <= 0.94; r += 0.06) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.015, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x27272a, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.082;
      turntableGroup.add(ringMesh);
    }

    // Center Album Art Label
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      currentSong?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
      (texture) => {
        const labelGeo = new THREE.CircleGeometry(0.36, 64);
        labelGeo.rotateX(-Math.PI / 2);
        const labelMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4, side: THREE.DoubleSide });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.y = 0.084;
        turntableGroup.add(labelMesh);
      }
    );

    // Center Spindle Pin
    const spindleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 16);
    const spindle = new THREE.Mesh(spindleGeo, polishedGoldMaterial);
    spindle.position.y = 0.14;
    turntableGroup.add(spindle);

    // 7. Mechanical Tonearm Assembly
    const toneArmGroup = new THREE.Group();
    toneArmGroupRef.current = toneArmGroup;
    toneArmGroup.position.set(1.05, 0.12, 0.9); // Pivot base
    scene.add(toneArmGroup);

    // Tonearm Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.1, 0.14, 0.28, 16);
    const pillar = new THREE.Mesh(pillarGeo, brassMaterial);
    toneArmGroup.add(pillar);

    // Counterweight
    const counterGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 16);
    counterGeo.rotateZ(Math.PI / 2);
    const counterWeight = new THREE.Mesh(counterGeo, polishedGoldMaterial);
    counterWeight.position.set(0.16, 0.16, 0.12);
    toneArmGroup.add(counterWeight);

    // Curved S-shape brass arm pole
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.16, 0),
      new THREE.Vector3(-0.35, 0.18, -0.2),
      new THREE.Vector3(-0.7, 0.14, -0.45),
      new THREE.Vector3(-0.95, 0.08, -0.75),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.02, 12, false);
    const armPole = new THREE.Mesh(tubeGeo, polishedGoldMaterial);
    toneArmGroup.add(armPole);

    // Soundbox / Reproducer Head & Stylus
    const soundBoxGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.06, 24);
    soundBoxGeo.rotateX(Math.PI / 4);
    const soundBox = new THREE.Mesh(soundBoxGeo, brassMaterial);
    soundBox.position.set(-0.95, 0.07, -0.75);
    toneArmGroup.add(soundBox);

    const needleGeo = new THREE.ConeGeometry(0.015, 0.08, 12);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(-0.95, 0.01, -0.75);
    toneArmGroup.add(needle);

    // 8. Fluted Antique Brass Gramophone Horn (Acoustic Bell)
    const hornGroup = new THREE.Group();
    hornGroup.position.set(-0.75, 0.1, -0.7); // Mount on back-left of cabinet
    scene.add(hornGroup);

    // Support Bracket & Swivel Base
    const hornBaseGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.35, 16);
    const hornBase = new THREE.Mesh(hornBaseGeo, brassMaterial);
    hornGroup.add(hornBase);

    // Curved Gooseneck / Conduit Tube leading to horn
    const gooseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(0, 0.9, 0),
      new THREE.Vector3(0.2, 1.4, 0.3),
      new THREE.Vector3(0.5, 1.8, 0.6),
    ]);
    const gooseGeo = new THREE.TubeGeometry(gooseCurve, 32, 0.07, 16, false);
    const gooseTube = new THREE.Mesh(gooseGeo, brassMaterial);
    hornGroup.add(gooseTube);

    // Big Majestic Fluted Horn Bell using Lathe
    const hornPoints: THREE.Vector2[] = [];
    const hornLength = 2.4;
    const numPoints = 28;
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const radius = 0.08 + Math.pow(t, 2.5) * 1.25; // Exponential horn flare
      const height = t * hornLength;
      hornPoints.push(new THREE.Vector2(radius, height));
    }
    const hornGeo = new THREE.LatheGeometry(hornPoints, 32);
    // Orient horn pointing upward and slightly tilted forward/right toward listener
    const hornMesh = new THREE.Mesh(hornGeo, brassMaterial);
    hornMesh.position.set(0.5, 1.8, 0.6);
    hornMesh.rotation.x = Math.PI / 3;
    hornMesh.rotation.z = -Math.PI / 6;
    hornGroup.add(hornMesh);

    // Fluted Petal Scalloped Rim on Bell opening
    const rimGeo = new THREE.TorusGeometry(1.33, 0.04, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, polishedGoldMaterial);
    rimMesh.position.set(0.5 + Math.sin(Math.PI / 6) * 1.2, 1.8 + Math.cos(Math.PI / 3) * hornLength * 0.88, 0.6 + Math.sin(Math.PI / 3) * hornLength * 0.88);
    rimMesh.rotation.x = Math.PI / 3;
    rimMesh.rotation.z = -Math.PI / 6;
    hornGroup.add(rimMesh);

    // 9. Floating Acoustic Sound Particles & Expanding Resonance Rings
    const soundRings: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.RingGeometry(0.3, 0.38, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0.8, 3.4, 2.3);
      ring.rotation.x = -Math.PI / 6;
      ring.rotation.y = Math.PI / 6;
      scene.add(ring);
      soundRings.push(ring);
    }
    soundRingsRef.current = soundRings;

    // Glowing Golden Sparkle Dust Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = 0.6 + (Math.random() - 0.5) * 1.5;
      particlePositions[i + 1] = 2.8 + Math.random() * 2.5;
      particlePositions[i + 2] = 1.6 + (Math.random() - 0.5) * 1.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfcd34d,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    // 10. Interactive Drag / Orbit Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      targetRotationY += dx * 0.008;
      targetRotationX = Math.max(-0.35, Math.min(0.65, targetRotationX + dy * 0.008));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Reset camera function
    resetCameraRef.current = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    // 11. Main Animation Loop
    let animationFrameId: number;
    let ringTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera orbit interpolation
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      scene.rotation.y = currentRotationY;
      scene.rotation.x = currentRotationX;

      // Audio Frequency Analysis
      const freqData = audioEngine.getFrequencyData();
      const avgFreq = freqData.length ? freqData.reduce((a, b) => a + b, 0) / freqData.length : 0;
      const bassFreq = freqData.length ? (freqData[0] + freqData[1] + freqData[2] + freqData[3]) / 4 : 0;
      const audioPulse = avgFreq / 255;
      const bassPulse = bassFreq / 255;

      // Rotate Vinyl Record when playing
      if (turntableGroupRef.current) {
        if (isPlaying) {
          turntableGroupRef.current.rotation.y += 0.035;
        }
      }

      // Smooth Tonearm Engagement (Moves on & drops stylus)
      if (toneArmGroupRef.current) {
        const targetAngle = isPlaying ? 0.32 + (currentTime / (duration || 200)) * 0.18 : 0;
        toneArmGroupRef.current.rotation.y += (targetAngle - toneArmGroupRef.current.rotation.y) * 0.06;
      }

      // Horn Light & Sound Particles Dynamics
      if (hornLightRef.current) {
        hornLightRef.current.intensity = isPlaying ? 2.5 + audioPulse * 4.5 : 0.8;
      }

      // Animate Floating Sound Rings
      if (isPlaying) {
        ringTimer += 0.03 + bassPulse * 0.04;
        soundRingsRef.current.forEach((ring, idx) => {
          const progress = (ringTimer + idx * 0.25) % 1.0;
          const scale = 0.5 + progress * 2.2;
          ring.scale.set(scale, scale, scale);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.sin(progress * Math.PI) * (0.35 + audioPulse * 0.5);
          ring.position.y = 3.2 + progress * 1.5;
          ring.position.x = 0.8 + progress * 0.4;
          ring.position.z = 2.1 + progress * 0.5;
        });

        // Drift particles
        if (particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] += 0.015 + audioPulse * 0.02;
            if (positions[i] > 5.5) {
              positions[i] = 2.8;
            }
          }
          particlesRef.current.geometry.attributes.position.needsUpdate = true;
          (particlesRef.current.material as THREE.PointsMaterial).opacity = 0.5 + audioPulse * 0.5;
        }
      } else {
        soundRingsRef.current.forEach((ring) => {
          (ring.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPlaying, currentSong, compact]);

  if (!hasWebGL) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-amber-200">
        <Music className="w-12 h-12 mb-2 animate-bounce" />
        <p className="text-xs font-mono">3D WebGL accelerated gramophone is initializing...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[260px] xs:min-h-[300px] md:min-h-[420px] rounded-3xl cursor-grab active:cursor-grabbing relative overflow-hidden touch-none"
      />

      {/* Floating Status & Interaction Hint Badge */}
      <div className="absolute bottom-2 xs:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 xs:gap-2 bg-[#0a0810]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-[10px] xs:text-[11px] font-mono text-amber-200/90 shadow-lg pointer-events-auto max-w-[92%] truncate">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
        <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">Drag to orbit 3D</span>
        <button
          onClick={() => resetCameraRef.current?.()}
          className="ml-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          title="Reset 3D Angle"
        >
          <RotateCw className="w-2.5 h-2.5" /> Reset
        </button>
      </div>
    </div>
  );
};

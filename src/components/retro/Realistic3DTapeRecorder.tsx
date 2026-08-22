import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePlayer } from '../../lib/playerContext';
import { audioEngine } from '../../lib/audioEngine';
import { RotateCw, Disc, Radio, Activity } from 'lucide-react';

interface Realistic3DTapeRecorderProps {
  compact?: boolean;
}

export const Realistic3DTapeRecorder: React.FC<Realistic3DTapeRecorderProps> = ({ compact = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { currentSong, isPlaying, currentTime, duration } = usePlayer();

  const [hasWebGL, setHasWebGL] = useState(true);

  // References for Three.js animation
  const leftReelRef = useRef<THREE.Group | null>(null);
  const rightReelRef = useRef<THREE.Group | null>(null);
  const leftTapePackRef = useRef<THREE.Mesh | null>(null);
  const rightTapePackRef = useRef<THREE.Mesh | null>(null);
  const vuLeftNeedleRef = useRef<THREE.Mesh | null>(null);
  const vuRightNeedleRef = useRef<THREE.Mesh | null>(null);
  const tubeLightsRef = useRef<THREE.PointLight[]>([]);
  const resetCameraRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || (compact ? 320 : 480);
    const height = container.clientHeight || (compact ? 320 : 480);

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(0, 0, 5.2);
    camera.position.copy(defaultCamPos);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch {
      setHasWebGL(false);
      return;
    }

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-4, -2, 2);
    scene.add(dirLight2);

    // Warm VU Meter & Tube Backlight Glow
    const vuBacklight = new THREE.PointLight(0xf59e0b, 2.5, 4);
    vuBacklight.position.set(0, -1.1, 0.4);
    scene.add(vuBacklight);

    const tubeLight1 = new THREE.PointLight(0xff6b00, 2.0, 3);
    tubeLight1.position.set(-1.0, -1.0, 0.3);
    scene.add(tubeLight1);

    const tubeLight2 = new THREE.PointLight(0xff6b00, 2.0, 3);
    tubeLight2.position.set(1.0, -1.0, 0.3);
    scene.add(tubeLight2);

    tubeLightsRef.current = [tubeLight1, tubeLight2, vuBacklight];

    // 4. Materials
    const aluminumFaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      metalness: 0.85,
      roughness: 0.28,
    });

    const brushedSilverMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.95,
      roughness: 0.18,
    });

    const darkChassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.3,
    });

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.2,
    });

    const magneticTapeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // Deep magnetic brown oxide
      roughness: 0.35,
      metalness: 0.3,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });

    // 5. Build Main Chassis
    const deckGroup = new THREE.Group();
    scene.add(deckGroup);

    // Main Faceplate Body
    const faceplateGeo = new THREE.BoxGeometry(3.6, 2.8, 0.25);
    const faceplate = new THREE.Mesh(faceplateGeo, aluminumFaceMaterial);
    faceplate.receiveShadow = true;
    deckGroup.add(faceplate);

    // Beveled Metal Trim Border
    const borderGeo = new THREE.BoxGeometry(3.68, 2.88, 0.22);
    const border = new THREE.Mesh(borderGeo, darkChassisMaterial);
    border.position.z = -0.04;
    deckGroup.add(border);

    // Corner Screws & Rack Mount Bolts
    const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
    screwGeo.rotateX(Math.PI / 2);
    [
      [-1.7, 1.3], [1.7, 1.3],
      [-1.7, -1.3], [1.7, -1.3],
      [-1.7, 0], [1.7, 0]
    ].forEach(([x, y]) => {
      const screw = new THREE.Mesh(screwGeo, brushedSilverMaterial);
      screw.position.set(x, y, 0.13);
      deckGroup.add(screw);
    });

    // Top Brand Nameplate ("MELOVY MASTER STUDIO · 7.5 IPS")
    const brandBadgeGeo = new THREE.BoxGeometry(1.6, 0.18, 0.02);
    const brandBadge = new THREE.Mesh(brandBadgeGeo, goldAccentMaterial);
    brandBadge.position.set(0, 1.25, 0.13);
    deckGroup.add(brandBadge);

    // 6. Dual 10.5" Aluminum Open Reels (Left & Right)
    const createReelMesh = (isLeft: boolean) => {
      const reelGroup = new THREE.Group();

      // Center NAB Reel Hub
      const hubGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.14, 32);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, goldAccentMaterial);
      hub.position.z = 0.18;
      reelGroup.add(hub);

      // 3 Precision Locking Clamps on hub
      for (let i = 0; i < 3; i++) {
        const clampGeo = new THREE.BoxGeometry(0.05, 0.16, 0.06);
        const clamp = new THREE.Mesh(clampGeo, brushedSilverMaterial);
        const angle = (i * Math.PI * 2) / 3;
        clamp.position.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0.24);
        clamp.rotation.z = angle;
        reelGroup.add(clamp);
      }

      // Back Aluminum Flange Disc
      const flangeBackGeo = new THREE.RingGeometry(0.24, 0.85, 48);
      const flangeBack = new THREE.Mesh(flangeBackGeo, brushedSilverMaterial);
      flangeBack.position.z = 0.14;
      reelGroup.add(flangeBack);

      // Front Aluminum Flange with 6 Oval Weight-Reduction Cutout Holes
      const frontFlangeGroup = new THREE.Group();
      frontFlangeGroup.position.z = 0.22;
      reelGroup.add(frontFlangeGroup);

      const outerRingGeo = new THREE.RingGeometry(0.72, 0.85, 48);
      const outerRing = new THREE.Mesh(outerRingGeo, brushedSilverMaterial);
      frontFlangeGroup.add(outerRing);

      const innerRingGeo = new THREE.RingGeometry(0.24, 0.38, 48);
      const innerRing = new THREE.Mesh(innerRingGeo, brushedSilverMaterial);
      frontFlangeGroup.add(innerRing);

      // 6 Spokes
      for (let i = 0; i < 6; i++) {
        const spokeGeo = new THREE.BoxGeometry(0.08, 0.42, 0.015);
        const spoke = new THREE.Mesh(spokeGeo, brushedSilverMaterial);
        const angle = (i * Math.PI * 2) / 6;
        spoke.position.set(Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0);
        spoke.rotation.z = angle + Math.PI / 2;
        frontFlangeGroup.add(spoke);
      }

      // Spool Magnetic Tape Pack Cylinder between flanges
      const initialTapeRadius = isLeft ? 0.76 : 0.42;
      const tapePackGeo = new THREE.CylinderGeometry(initialTapeRadius, initialTapeRadius, 0.07, 48);
      tapePackGeo.rotateX(Math.PI / 2);
      const tapePack = new THREE.Mesh(tapePackGeo, magneticTapeMaterial);
      tapePack.position.z = 0.18;
      reelGroup.add(tapePack);

      if (isLeft) {
        leftTapePackRef.current = tapePack;
      } else {
        rightTapePackRef.current = tapePack;
      }

      return reelGroup;
    };

    const leftReel = createReelMesh(true);
    leftReel.position.set(-0.85, 0.45, 0);
    deckGroup.add(leftReel);
    leftReelRef.current = leftReel;

    const rightReel = createReelMesh(false);
    rightReel.position.set(0.85, 0.45, 0);
    deckGroup.add(rightReel);
    rightReelRef.current = rightReel;

    // 7. Threaded Magnetic Tape Path, Rollers & Magnetic Head Assembly
    const tapePathGroup = new THREE.Group();
    deckGroup.add(tapePathGroup);

    // Guide Rollers (Chrome cylinders with bearings)
    const rollerPositions: [number, number][] = [
      [-1.35, -0.2], // Left tension arm roller
      [-0.55, -0.42], // Left head guide
      [0.55, -0.42],  // Right capstan roller
      [1.35, -0.2],   // Right tension arm roller
    ];

    rollerPositions.forEach(([x, y]) => {
      const rollerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 24);
      rollerGeo.rotateX(Math.PI / 2);
      const roller = new THREE.Mesh(rollerGeo, brushedSilverMaterial);
      roller.position.set(x, y, 0.18);
      tapePathGroup.add(roller);

      const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.16, 16);
      pinGeo.rotateX(Math.PI / 2);
      const pin = new THREE.Mesh(pinGeo, goldAccentMaterial);
      pin.position.set(x, y, 0.2);
      tapePathGroup.add(pin);
    });

    // Central Tape Head Block (Erase, Record, Playback heads)
    const headBlockGeo = new THREE.BoxGeometry(0.8, 0.35, 0.14);
    const headBlock = new THREE.Mesh(headBlockGeo, darkChassisMaterial);
    headBlock.position.set(0, -0.42, 0.18);
    tapePathGroup.add(headBlock);

    // 3 Shiny Mu-Metal Head Cores
    [-0.22, 0, 0.22].forEach((x) => {
      const headCoreGeo = new THREE.BoxGeometry(0.12, 0.18, 0.08);
      const headCore = new THREE.Mesh(headCoreGeo, brushedSilverMaterial);
      headCore.position.set(x, -0.38, 0.23);
      tapePathGroup.add(headCore);
    });

    // Rubber Pinch Roller (Black rubber wheel pressing against capstan)
    const pinchGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.09, 24);
    pinchGeo.rotateX(Math.PI / 2);
    const pinchMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.9 });
    const pinch = new THREE.Mesh(pinchGeo, pinchMat);
    pinch.position.set(0.65, -0.35, 0.18);
    tapePathGroup.add(pinch);

    // Visible Magnetic Tape Ribbon Strip threaded across path
    const tapePoints = [
      new THREE.Vector3(-0.85, 0.45 - 0.72, 0.18),
      new THREE.Vector3(-1.35, -0.2, 0.18),
      new THREE.Vector3(-0.55, -0.42, 0.18),
      new THREE.Vector3(0, -0.36, 0.22),
      new THREE.Vector3(0.55, -0.42, 0.18),
      new THREE.Vector3(1.35, -0.2, 0.18),
      new THREE.Vector3(0.85, 0.45 - 0.45, 0.18),
    ];
    const tapeCurve = new THREE.CatmullRomCurve3(tapePoints);
    const tapeRibbonGeo = new THREE.TubeGeometry(tapeCurve, 40, 0.018, 8, false);
    const tapeRibbon = new THREE.Mesh(tapeRibbonGeo, magneticTapeMaterial);
    tapePathGroup.add(tapeRibbon);

    // 8. Lower Control Panel: Dual Amber Backlit VU Meters & Analog Tubes
    const lowerPanelGroup = new THREE.Group();
    deckGroup.add(lowerPanelGroup);

    // Create VU Meter Frame
    const createVUMeter = (xPos: number, isLeftChannel: boolean) => {
      const vuGroup = new THREE.Group();
      vuGroup.position.set(xPos, -0.98, 0.13);

      // Meter Backplate (Warm Cream Parchment)
      const meterBackGeo = new THREE.BoxGeometry(0.85, 0.52, 0.02);
      const meterBackMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.6,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
      });
      const meterBack = new THREE.Mesh(meterBackGeo, meterBackMat);
      vuGroup.add(meterBack);

      // Glass Cover
      const glassGeo = new THREE.BoxGeometry(0.88, 0.55, 0.03);
      const glass = new THREE.Mesh(glassGeo, glassMaterial);
      glass.position.z = 0.04;
      vuGroup.add(glass);

      // Bezel Frame
      const bezelGeo = new THREE.BoxGeometry(0.92, 0.58, 0.05);
      const bezel = new THREE.Mesh(bezelGeo, darkChassisMaterial);
      bezel.position.z = 0.02;
      vuGroup.add(bezel);

      // Meter Needle (Pivot at bottom center)
      const needlePivot = new THREE.Group();
      needlePivot.position.set(0, -0.2, 0.02);

      const needleBladeGeo = new THREE.BoxGeometry(0.015, 0.36, 0.01);
      const needleMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const needleBlade = new THREE.Mesh(needleBladeGeo, needleMat);
      needleBlade.position.y = 0.18;
      needlePivot.add(needleBlade);

      vuGroup.add(needlePivot);

      if (isLeftChannel) {
        vuLeftNeedleRef.current = needlePivot as any;
      } else {
        vuRightNeedleRef.current = needlePivot as any;
      }

      return vuGroup;
    };

    const vuLeft = createVUMeter(-0.7, true);
    lowerPanelGroup.add(vuLeft);

    const vuRight = createVUMeter(0.7, true);
    lowerPanelGroup.add(vuRight);

    // Center Mechanical Tape Counter ("0 4 2 8")
    const counterBoxGeo = new THREE.BoxGeometry(0.48, 0.22, 0.06);
    const counterBox = new THREE.Mesh(counterBoxGeo, darkChassisMaterial);
    counterBox.position.set(0, -0.98, 0.15);
    lowerPanelGroup.add(counterBox);

    // Analog Vacuum Triode Tubes (Glowing glass tubes on left & right edges)
    const createTube = (xPos: number) => {
      const tubeGroup = new THREE.Group();
      tubeGroup.position.set(xPos, -0.98, 0.2);

      // Base socket
      const socketGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.08, 16);
      socketGeo.rotateX(Math.PI / 2);
      const socket = new THREE.Mesh(socketGeo, goldAccentMaterial);
      tubeGroup.add(socket);

      // Glass Bulb
      const bulbGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 16);
      bulbGeo.rotateX(Math.PI / 2);
      const bulb = new THREE.Mesh(bulbGeo, glassMaterial);
      bulb.position.z = 0.2;
      tubeGroup.add(bulb);

      // Glowing Orange Filament Core
      const filGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8);
      filGeo.rotateX(Math.PI / 2);
      const filMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xff7700,
        emissiveIntensity: 3.5,
      });
      const fil = new THREE.Mesh(filGeo, filMat);
      fil.position.z = 0.2;
      tubeGroup.add(fil);

      return tubeGroup;
    };

    const tubeL = createTube(-1.45);
    lowerPanelGroup.add(tubeL);

    const tubeR = createTube(1.45);
    lowerPanelGroup.add(tubeR);

    // 9. Interactive Drag / Orbit
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotY = 0;
    let targetRotX = 0;
    let curRotY = 0;
    let curRotX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      targetRotY += dx * 0.008;
      targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX + dy * 0.008));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    resetCameraRef.current = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    // 10. Render & Animation Loop
    let animationFrameId: number;
    let leftNeedleSmooth = -0.5;
    let rightNeedleSmooth = -0.5;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Orbit
      curRotY += (targetRotY - curRotY) * 0.08;
      curRotX += (targetRotX - curRotX) * 0.08;
      scene.rotation.y = curRotY;
      scene.rotation.x = curRotX;

      // Audio Frequency Physics
      const freqData = audioEngine.getFrequencyData();
      const avgFreq = freqData.length ? freqData.reduce((a, b) => a + b, 0) / freqData.length : 0;
      const bassFreq = freqData.length ? (freqData[0] + freqData[1] + freqData[2]) / 3 : 0;
      const trebleFreq = freqData.length ? (freqData[10] + freqData[12] + freqData[15]) / 3 : 0;

      const normLeft = isPlaying ? Math.min(1, (bassFreq / 255) * 1.3) : 0;
      const normRight = isPlaying ? Math.min(1, (trebleFreq / 255) * 1.3) : 0;

      // Needle deflections (-0.6 rad to +0.6 rad)
      const targetNeedleL = -0.6 + normLeft * 1.2;
      const targetNeedleR = -0.6 + normRight * 1.2;
      leftNeedleSmooth += (targetNeedleL - leftNeedleSmooth) * 0.25;
      rightNeedleSmooth += (targetNeedleR - rightNeedleSmooth) * 0.25;

      if (vuLeftNeedleRef.current) {
        vuLeftNeedleRef.current.rotation.z = -leftNeedleSmooth;
      }
      if (vuRightNeedleRef.current) {
        vuRightNeedleRef.current.rotation.z = -rightNeedleSmooth;
      }

      // Rotate Spools when playing
      if (isPlaying) {
        if (leftReelRef.current) {
          leftReelRef.current.rotation.z -= 0.04;
        }
        if (rightReelRef.current) {
          rightReelRef.current.rotation.z -= 0.04;
        }
      }

      // Tape distribution (left reel depletes, right reel fills)
      const playProgress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
      const leftScale = 1.0 - playProgress * 0.45;
      const rightScale = 0.55 + playProgress * 0.45;

      if (leftTapePackRef.current) {
        leftTapePackRef.current.scale.set(leftScale, leftScale, 1);
      }
      if (rightTapePackRef.current) {
        rightTapePackRef.current.scale.set(rightScale, rightScale, 1);
      }

      // Tube lights pulsation
      tubeLightsRef.current.forEach((light, i) => {
        light.intensity = isPlaying ? 1.8 + (avgFreq / 255) * (2 + i) : 0.6;
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
  }, [isPlaying, currentTime, duration, compact]);

  if (!hasWebGL) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-amber-200">
        <Radio className="w-12 h-12 mb-2 animate-bounce" />
        <p className="text-xs font-mono">3D Reel-to-Reel Tape Recorder is initializing...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      <div
        ref={containerRef}
        className="w-full h-full min-h-[260px] xs:min-h-[300px] md:min-h-[420px] rounded-3xl cursor-grab active:cursor-grabbing relative overflow-hidden touch-none"
      />

      {/* Floating Status & Interaction Badge */}
      <div className="absolute bottom-2 xs:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 xs:gap-2 bg-[#0a0810]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/30 text-[10px] xs:text-[11px] font-mono text-amber-200/90 shadow-lg pointer-events-auto max-w-[92%] truncate">
        <span className={`w-2 h-2 rounded-full shrink-0 ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">7.5 IPS Reel Deck</span>
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

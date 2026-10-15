import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundSynth } from './audioSynth';
import { Volume2, VolumeX, Pause, Play, RotateCcw, X, Shield, Zap, Crosshair, Award } from 'lucide-react';

interface MolecularDefenseGameProps {
  onExit: () => void;
}

type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

interface Enemy {
  id: number;
  type: 'spike' | 'radical' | 'prion';
  mesh: THREE.Group;
  velocity: THREE.Vector3;
  health: number;
  maxHealth: number;
  radius: number;
  telegraphTimer: number; // for windup attack telegraph
  isTelegraphing: boolean;
  baseColor: number;
}

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
}

interface ATPOrb {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  rotationSpeed: number;
}

export const MolecularDefenseGame: React.FC<MolecularDefenseGameProps> = ({ onExit }) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [energy, setEnergy] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [neutralizedCount, setNeutralizedCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundSynth.getIsMuted());
  const [screenFlash, setScreenFlash] = useState<'hit' | 'heal' | null>(null);

  // Canvas & Three.js refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Game mutable simulation state stored in refs to bypass React re-renders
  const simRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    player: THREE.Group | null;
    playerVelocity: THREE.Vector3;
    playerSpeed: number;
    playerHealth: number;
    playerEnergy: number;
    score: number;
    wave: number;
    neutralized: number;
    enemies: Enemy[];
    projectiles: Projectile[];
    atpOrbs: ATPOrb[];
    particles: Particle[];
    macromoleculeGroup: THREE.Group | null;
    keysHeld: Record<string, boolean>;
    mousePosition: THREE.Vector2;
    cameraShake: number;
    hitStopFrames: number;
    lastTime: number;
    animFrameId: number;
    state: GameState;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    playerVelocity: new THREE.Vector3(),
    playerSpeed: 18,
    playerHealth: 100,
    playerEnergy: 100,
    score: 0,
    wave: 1,
    neutralized: 0,
    enemies: [],
    projectiles: [],
    atpOrbs: [],
    particles: [],
    macromoleculeGroup: null,
    keysHeld: {},
    mousePosition: new THREE.Vector2(),
    cameraShake: 0,
    hitStopFrames: 0,
    lastTime: 0,
    animFrameId: 0,
    state: 'title'
  });

  const triggerScreenFlash = (type: 'hit' | 'heal') => {
    setScreenFlash(type);
    setTimeout(() => setScreenFlash(null), 120);
  };

  const handleToggleMute = useCallback(() => {
    const muted = soundSynth.toggleMute();
    setIsMuted(muted);
  }, []);

  // Start / Restart game loop
  const startGame = useCallback(() => {
    const sim = simRef.current;
    sim.state = 'playing';
    sim.playerHealth = 100;
    sim.playerEnergy = 100;
    sim.score = 0;
    sim.wave = 1;
    sim.neutralized = 0;
    sim.enemies = [];
    sim.projectiles = [];
    sim.atpOrbs = [];
    sim.cameraShake = 0;
    sim.hitStopFrames = 0;

    if (sim.player) {
      sim.player.position.set(0, 0, 0);
      sim.playerVelocity.set(0, 0, 0);
    }

    setHealth(100);
    setEnergy(100);
    setScore(0);
    setWave(1);
    setNeutralizedCount(0);
    setGameState('playing');
    soundSynth.playPickup();
  }, []);

  const pauseGame = useCallback(() => {
    simRef.current.state = 'paused';
    setGameState('paused');
  }, []);

  const resumeGame = useCallback(() => {
    simRef.current.state = 'playing';
    setGameState('playing');
  }, []);

  // Initialize Three.js Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060d19, 0.012);
    scene.background = new THREE.Color(0x060d19);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 8, 22);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Lighting (Bio-fluorescent palette)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(15, 25, 20);
    scene.add(dirLight);

    const secondaryLight = new THREE.PointLight(0x10b981, 2.2, 80);
    secondaryLight.position.set(-15, -10, 5);
    scene.add(secondaryLight);

    // Build Atmospheric 3D AlphaFold Macromolecule Environment
    const macromoleculeGroup = new THREE.Group();
    
    // 1. Alpha-Helices (Curved procedural tubes with AlphaFold pLDDT coloration)
    const plddtColors = [0x0053D6, 0x65CBF3, 0xFFDB13, 0xFF7D45]; // >90 Blue, 70-90 Light Blue, 50-70 Yellow, <50 Orange
    for (let h = 0; h < 6; h++) {
      const curvePoints: THREE.Vector3[] = [];
      const radius = 12 + h * 4;
      const angleOffset = (h * Math.PI) / 3;
      for (let t = 0; t <= 40; t++) {
        const theta = (t / 40) * Math.PI * 4 + angleOffset;
        curvePoints.push(
          new THREE.Vector3(
            Math.cos(theta) * radius + Math.sin(t * 0.4) * 2,
            (t - 20) * 1.5,
            Math.sin(theta) * radius + Math.cos(t * 0.4) * 2
          )
        );
      }
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 60, 0.6, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: plddtColors[h % plddtColors.length],
        roughness: 0.3,
        metalness: 0.2,
        emissive: plddtColors[h % plddtColors.length],
        emissiveIntensity: 0.15
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      macromoleculeGroup.add(tubeMesh);
    }

    // 2. Beta-Sheets (Twisted flat ribbons)
    for (let b = 0; b < 4; b++) {
      const ribbonGeo = new THREE.PlaneGeometry(16, 2.2, 12, 1);
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        side: THREE.DoubleSide,
        roughness: 0.2,
        metalness: 0.3
      });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.set((b - 1.5) * 10, -5 + b * 4, -10 + b * 2);
      ribbon.rotation.set(0.4 * b, 0.6 * b, 0.2 * b);
      macromoleculeGroup.add(ribbon);
    }

    // 3. Floating Nucleotide Spheres & Cellular Medium
    const sphereGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.4
    });
    for (let s = 0; s < 60; s++) {
      const atom = new THREE.Mesh(sphereGeo, sphereMat);
      atom.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 50
      );
      macromoleculeGroup.add(atom);
    }

    scene.add(macromoleculeGroup);

    // Build Player 3D Nanobiological Repair Capsule
    const playerGroup = new THREE.Group();
    
    // Main capsule fuselage
    const bodyGeo = new THREE.CapsuleGeometry(0.65, 1.4, 12, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.rotation.x = Math.PI / 2;
    playerGroup.add(bodyMesh);

    // Wing guides / CRISPR guide RNA probes
    const wingGeo = new THREE.BoxGeometry(2.4, 0.1, 0.8);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x059669,
      emissiveIntensity: 0.5
    });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.set(0, 0, 0.2);
    playerGroup.add(wingMesh);

    // Thruster engine glow
    const thrusterGeo = new THREE.CylinderGeometry(0.3, 0.1, 0.5, 12);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(0, 0, 1.2);
    playerGroup.add(thruster);

    scene.add(playerGroup);

    // Store in simRef
    const sim = simRef.current;
    sim.scene = scene;
    sim.camera = camera;
    sim.renderer = renderer;
    sim.player = playerGroup;
    sim.macromoleculeGroup = macromoleculeGroup;

    // Window Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard Input Listeners (with blur safety)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      sim.keysHeld[key] = true;

      // Handle Start on Title
      if (sim.state === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        startGame();
        return;
      }

      // Handle Pause Toggle
      if (e.code === 'Escape') {
        e.preventDefault();
        if (sim.state === 'playing') {
          pauseGame();
        } else if (sim.state === 'paused') {
          resumeGame();
        }
        return;
      }

      // Handle Mute
      if (key === 'm') {
        handleToggleMute();
      }

      // Fire Projectile on Space
      if (sim.state === 'playing' && e.code === 'Space') {
        e.preventDefault();
        fireLigandProjectile();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      sim.keysHeld[e.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      sim.keysHeld = {};
    };

    const handleMouseMove = (e: MouseEvent) => {
      sim.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      sim.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('mousemove', handleMouseMove);

    // ==========================================
    // 60FPS MAIN SIMULATION LOOP (Three.js Engine)
    // ==========================================
    let lastTimestamp = performance.now();

    const spawnEnemy = () => {
      if (sim.enemies.length >= 8 + sim.wave * 2) return;

      const types: ('spike' | 'radical' | 'prion')[] = ['spike', 'radical', 'prion'];
      const chosenType = types[Math.floor(Math.random() * Math.min(types.length, sim.wave))];
      
      const enemyGroup = new THREE.Group();
      let enemyRadius = 1.2;
      let hp = 10;
      let baseColor = 0xf43f5e;

      if (chosenType === 'spike') {
        // SARS-CoV-2 / Viral Spike Capsule with protruding thorns
        const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xe11d48,
          roughness: 0.4,
          metalness: 0.3
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        enemyGroup.add(core);

        // Add 6 spike thorns
        const spikeGeo = new THREE.ConeGeometry(0.3, 1.0, 6);
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xfb7185 });
        for (let i = 0; i < 6; i++) {
          const spike = new THREE.Mesh(spikeGeo, spikeMat);
          const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          ).normalize();
          spike.position.copy(dir.clone().multiplyScalar(1.2));
          spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          enemyGroup.add(spike);
        }
        hp = 15 + sim.wave * 5;
        baseColor = 0xe11d48;
      } else if (chosenType === 'radical') {
        // Pulsing reactive oxygen species
        const radGeo = new THREE.DodecahedronGeometry(0.9, 0);
        const radMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.6,
          roughness: 0.2
        });
        const radMesh = new THREE.Mesh(radGeo, radMat);
        enemyGroup.add(radMesh);
        hp = 10 + sim.wave * 3;
        enemyRadius = 0.9;
        baseColor = 0xf59e0b;
      } else {
        // Misfolded Prion aggregate (irregular cluster)
        const prionGeo = new THREE.TorusKnotGeometry(0.8, 0.35, 32, 8);
        const prionMat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          roughness: 0.5,
          metalness: 0.4
        });
        const prion = new THREE.Mesh(prionGeo, prionMat);
        enemyGroup.add(prion);
        hp = 25 + sim.wave * 8;
        enemyRadius = 1.4;
        baseColor = 0x8b5cf6;
      }

      // Spawn at perimeter distance
      const spawnAngle = Math.random() * Math.PI * 2;
      const spawnDist = 32 + Math.random() * 10;
      enemyGroup.position.set(
        Math.cos(spawnAngle) * spawnDist,
        (Math.random() - 0.5) * 16,
        -15 - Math.random() * 20
      );

      scene.add(enemyGroup);

      sim.enemies.push({
        id: Math.random(),
        type: chosenType,
        mesh: enemyGroup,
        velocity: new THREE.Vector3(),
        health: hp,
        maxHealth: hp,
        radius: enemyRadius,
        telegraphTimer: 0,
        isTelegraphing: false,
        baseColor
      });
    };

    const spawnATPOrb = (pos: THREE.Vector3) => {
      const orbGeo = new THREE.OctahedronGeometry(0.65, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.8,
        wireframe: false
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.copy(pos);
      scene.add(orbMesh);

      sim.atpOrbs.push({
        mesh: orbMesh,
        position: pos.clone(),
        rotationSpeed: 2 + Math.random() * 2
      });
    };

    const spawnParticles = (pos: THREE.Vector3, colorHex: number, count: number = 12) => {
      const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      for (let i = 0; i < count; i++) {
        const pMat = new THREE.MeshBasicMaterial({ color: colorHex });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.copy(pos);
        scene.add(pMesh);

        sim.particles.push({
          mesh: pMesh,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ),
          life: 0.4 + Math.random() * 0.3,
          maxLife: 0.7,
          color: new THREE.Color(colorHex)
        });
      }
    };

    const fireLigandProjectile = () => {
      if (!sim.player) return;
      if (sim.playerEnergy < 5) return; // Need ATP energy

      sim.playerEnergy = Math.max(0, sim.playerEnergy - 5);
      setEnergy(Math.round(sim.playerEnergy));

      const projGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const projMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2
      });
      const projMesh = new THREE.Mesh(projGeo, projMat);
      projMesh.position.copy(sim.player.position);
      projMesh.position.z -= 1.0;
      scene.add(projMesh);

      sim.projectiles.push({
        mesh: projMesh,
        velocity: new THREE.Vector3(0, 0, -42),
        life: 1.8
      });

      soundSynth.playFire();
    };

    // Main 60fps Loop
    const gameLoop = (timestamp: number) => {
      sim.animFrameId = requestAnimationFrame(gameLoop);

      // Clamp Delta Time for 60fps physics stability
      const rawDt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const dt = Math.min(rawDt, 0.05);

      // Hitstop delay for heavy impacts (game feel)
      if (sim.hitStopFrames > 0) {
        sim.hitStopFrames--;
        return;
      }

      // Rotate background macromolecule regardless of state for atmospheric ambiance
      if (sim.macromoleculeGroup) {
        sim.macromoleculeGroup.rotation.y += dt * 0.15;
        sim.macromoleculeGroup.rotation.x += dt * 0.05;
      }

      // STATE 1: TITLE SCREEN CAMERA PAN
      if (sim.state === 'title') {
        const time = timestamp * 0.0006;
        camera.position.x = Math.sin(time) * 14;
        camera.position.y = 8 + Math.cos(time * 0.8) * 3;
        camera.position.z = 24 + Math.sin(time * 0.5) * 4;
        camera.lookAt(0, 0, 0);

        if (sim.player) {
          sim.player.position.set(0, Math.sin(time * 2) * 0.6, 2);
          sim.player.rotation.set(0, time * 0.5, 0);
        }
        renderer.render(scene, camera);
        return;
      }

      // STATE 2: PAUSED
      if (sim.state === 'paused') {
        renderer.render(scene, camera);
        return;
      }

      // STATE 3: ACTIVE PLAYING SIMULATION
      if (sim.state === 'playing') {
        // Passive energy recharge
        if (sim.playerEnergy < 100) {
          sim.playerEnergy = Math.min(100, sim.playerEnergy + dt * 6);
          setEnergy(Math.round(sim.playerEnergy));
        }

        // Periodic enemy spawn
        if (Math.random() < dt * (0.8 + sim.wave * 0.35)) {
          spawnEnemy();
        }

        // Player Movement (WASD / Arrows)
        const moveDir = new THREE.Vector3();
        if (sim.keysHeld['w'] || sim.keysHeld['arrowup']) moveDir.y += 1;
        if (sim.keysHeld['s'] || sim.keysHeld['arrowdown']) moveDir.y -= 1;
        if (sim.keysHeld['a'] || sim.keysHeld['arrowleft']) moveDir.x -= 1;
        if (sim.keysHeld['d'] || sim.keysHeld['arrowright']) moveDir.x += 1;

        if (moveDir.lengthSq() > 0) {
          moveDir.normalize();
          sim.playerVelocity.lerp(moveDir.multiplyScalar(sim.playerSpeed), dt * 10);
        } else {
          sim.playerVelocity.lerp(new THREE.Vector3(), dt * 8);
        }

        if (sim.player) {
          sim.player.position.addScaledVector(sim.playerVelocity, dt);
          // Clamp player within visible boundary
          sim.player.position.x = THREE.MathUtils.clamp(sim.player.position.x, -16, 16);
          sim.player.position.y = THREE.MathUtils.clamp(sim.player.position.y, -9, 9);
          sim.player.position.z = THREE.MathUtils.clamp(sim.player.position.z, -5, 5);

          // Bank / Tilt banking feedback
          sim.player.rotation.z = -sim.playerVelocity.x * 0.04;
          sim.player.rotation.x = sim.playerVelocity.y * 0.03;
        }

        // Camera Follow with smooth dampening & camera shake
        let camTargetX = (sim.player?.position.x || 0) * 0.35;
        let camTargetY = (sim.player?.position.y || 0) * 0.35 + 3.5;
        let camTargetZ = 16;

        if (sim.cameraShake > 0) {
          camTargetX += (Math.random() - 0.5) * sim.cameraShake;
          camTargetY += (Math.random() - 0.5) * sim.cameraShake;
          sim.cameraShake = Math.max(0, sim.cameraShake - dt * 4);
        }

        camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), dt * 6);
        camera.lookAt((sim.player?.position.x || 0) * 0.2, (sim.player?.position.y || 0) * 0.2, -10);

        // Update Projectiles
        for (let p = sim.projectiles.length - 1; p >= 0; p--) {
          const proj = sim.projectiles[p];
          proj.mesh.position.addScaledVector(proj.velocity, dt);
          proj.life -= dt;

          // Check hit against enemies
          let hit = false;
          for (let e = sim.enemies.length - 1; e >= 0; e--) {
            const enemy = sim.enemies[e];
            const dist = proj.mesh.position.distanceTo(enemy.mesh.position);
            if (dist < enemy.radius + 0.6) {
              hit = true;
              enemy.health -= 10;
              spawnParticles(proj.mesh.position, 0x38bdf8, 6);
              soundSynth.playHit(false);

              // Enemy destroyed
              if (enemy.health <= 0) {
                scene.remove(enemy.mesh);
                spawnParticles(enemy.mesh.position, enemy.baseColor, 18);
                spawnATPOrb(enemy.mesh.position);
                sim.enemies.splice(e, 1);
                sim.score += enemy.type === 'spike' ? 150 : enemy.type === 'radical' ? 100 : 250;
                sim.neutralized++;
                setScore(sim.score);
                setNeutralizedCount(sim.neutralized);

                // Wave progression check
                if (sim.neutralized >= sim.wave * 10) {
                  sim.wave++;
                  setWave(sim.wave);
                  soundSynth.playVictory();
                  if (sim.wave > 4) {
                    sim.state = 'victory';
                    setGameState('victory');
                  }
                }
              }
              break;
            }
          }

          if (hit || proj.life <= 0 || proj.mesh.position.z < -60) {
            scene.remove(proj.mesh);
            sim.projectiles.splice(p, 1);
          }
        }

        // Update Enemies
        for (let e = sim.enemies.length - 1; e >= 0; e--) {
          const enemy = sim.enemies[e];
          const toPlayer = new THREE.Vector3().subVectors(sim.player?.position || new THREE.Vector3(), enemy.mesh.position);
          const distToPlayer = toPlayer.length();
          toPlayer.normalize();

          // Encounter design: telegraphing attack windup
          if (enemy.type === 'spike' && distToPlayer < 18) {
            enemy.telegraphTimer += dt;
            if (enemy.telegraphTimer > 1.2) {
              // Lunging attack charge
              enemy.velocity.copy(toPlayer.multiplyScalar(22));
              enemy.telegraphTimer = 0;
            }
          } else {
            enemy.velocity.lerp(toPlayer.multiplyScalar(7 + sim.wave * 1.5), dt * 3);
          }

          enemy.mesh.position.addScaledVector(enemy.velocity, dt);
          enemy.mesh.rotation.y += dt * 2;
          enemy.mesh.rotation.x += dt;

          // Check collision with player
          if (distToPlayer < enemy.radius + 0.8) {
            // Player hit by pathogen!
            sim.playerHealth -= 15;
            setHealth(Math.max(0, Math.round(sim.playerHealth)));
            sim.cameraShake = 1.2;
            sim.hitStopFrames = 3; // 50ms hitstop
            soundSynth.playPlayerDamage();
            triggerScreenFlash('hit');
            spawnParticles(enemy.mesh.position, 0xf43f5e, 14);

            // Knockback
            sim.playerVelocity.addScaledVector(toPlayer.negate(), 15);

            if (sim.playerHealth <= 0) {
              sim.state = 'gameover';
              setGameState('gameover');
              soundSynth.playGameOver();
            }
          }

          // Remove enemies that wander too far past
          if (enemy.mesh.position.z > 15) {
            scene.remove(enemy.mesh);
            sim.enemies.splice(e, 1);
          }
        }

        // Update ATP Orbs
        for (let a = sim.atpOrbs.length - 1; a >= 0; a--) {
          const orb = sim.atpOrbs[a];
          orb.mesh.rotation.y += dt * orb.rotationSpeed;
          orb.mesh.rotation.x += dt * 1.5;

          const dist = orb.mesh.position.distanceTo(sim.player?.position || new THREE.Vector3());
          if (dist < 2.0) {
            // Collect ATP!
            sim.playerEnergy = Math.min(100, sim.playerEnergy + 30);
            sim.playerHealth = Math.min(100, sim.playerHealth + 10);
            setEnergy(Math.round(sim.playerEnergy));
            setHealth(Math.round(sim.playerHealth));
            sim.score += 50;
            setScore(sim.score);
            soundSynth.playPickup();
            triggerScreenFlash('heal');
            spawnParticles(orb.mesh.position, 0x10b981, 10);

            scene.remove(orb.mesh);
            sim.atpOrbs.splice(a, 1);
          }
        }

        // Update Particle Bursts
        for (let pt = sim.particles.length - 1; pt >= 0; pt--) {
          const p = sim.particles[pt];
          p.mesh.position.addScaledVector(p.velocity, dt);
          p.life -= dt;
          const scale = Math.max(0.01, p.life / p.maxLife);
          p.mesh.scale.set(scale, scale, scale);

          if (p.life <= 0) {
            scene.remove(p.mesh);
            sim.particles.splice(pt, 1);
          }
        }
      }

      renderer.render(scene, camera);
    };

    sim.animFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(sim.animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, [startGame, pauseGame, resumeGame, handleToggleMute]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 bg-slate-950 overflow-hidden select-none font-sans text-white"
    >
      {/* Isolated Three.js Canvas Container */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-crosshair"
      />

      {/* Screen Hit Flash Vignette */}
      {screenFlash === 'hit' && (
        <div className="absolute inset-0 pointer-events-none ring-8 ring-inset ring-rose-500/70 bg-rose-500/10 animate-fade-out" />
      )}
      {screenFlash === 'heal' && (
        <div className="absolute inset-0 pointer-events-none ring-8 ring-inset ring-emerald-400/60 bg-emerald-400/10 animate-fade-out" />
      )}

      {/* ========================================================
          TITLE SCREEN (Bespoke SVG Title Lockup over 35% Negative Space)
          ======================================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-12 pointer-events-none z-10">
          {/* Top Bar with Mute & Exit */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>OWLY BIOMEDICAL SIMULATION ENGINE · THREE.JS WebGL</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleMute}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 transition-colors shadow-lg"
                title="Toggle Mute (M)"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <button
                onClick={onExit}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 transition-colors shadow-lg"
                title="Exit Game to Hub"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Title Lockup */}
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>AlphaFold 3D Molecular Defense & Active-Site Docking</span>
            </div>

            {/* Bespoke SVG Title Lockup */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-white leading-none">
                CRISPR-NANO
              </h1>
              <div className="text-lg sm:text-xl font-mono font-bold tracking-widest text-cyan-400 uppercase">
                Active-Site Interceptor
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Pilot an engineered nano-enzyme capsule through cell cytoplasm. Neutralize viral capsids and rogue free radicals with targeted ligand pulses before they compromise host DNA integrity.
            </p>

            <div className="pt-4 pointer-events-auto flex flex-wrap items-center gap-4">
              <button
                onClick={startGame}
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Initialize Mission (Space / Enter)</span>
              </button>

              <button
                onClick={onExit}
                className="px-5 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/60 transition-colors"
              >
                Return to Course Hub
              </button>
            </div>
          </div>

          {/* Flat Single Control Hint Line */}
          <div className="text-xs font-mono text-slate-400 tracking-wider">
            WASD / Arrows Move · Space Fire Ligand · Collect Green ATP Orbs · Esc Pause · M Mute
          </div>
        </div>
      )}

      {/* ========================================================
          LOW-OCCLUSION 60FPS HEADS-UP DISPLAY (Under 15% Screen Coverage)
          ======================================================== */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between z-20">
          {/* Top Perimeter Status Cluster */}
          <div className="flex items-start justify-between">
            {/* Health & Energy Bars */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5 shadow-xl w-64 pointer-events-auto">
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>CELLULAR INTEGRITY</span>
                  </span>
                  <span className="tabular-nums font-mono text-white">{health}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${health}%` }}
                    className={`h-full transition-all duration-150 ${health > 35 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>ATP ENERGY POOL</span>
                  </span>
                  <span className="tabular-nums font-mono text-white">{energy}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${energy}%` }}
                    className="h-full bg-cyan-400 transition-all duration-100"
                  />
                </div>
              </div>
            </div>

            {/* Score & Wave Readouts */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl px-4 py-3 text-right shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">SCORE</span>
                <span className="font-mono text-xl font-black text-cyan-300 tabular-nums">{score}</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl px-4 py-3 text-right shadow-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">WAVE</span>
                <span className="font-mono text-xl font-black text-emerald-400 tabular-nums">0{wave} / 04</span>
              </div>

              <button
                onClick={pauseGame}
                className="p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800/80 shadow-xl transition-colors"
                title="Pause Game (Esc)"
              >
                <Pause className="w-5 h-5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Bottom Perimeter: Neutralized Counter & Controls */}
          <div className="flex items-end justify-between">
            <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Active Sites Neutralized: <strong className="text-white tabular-nums">{neutralizedCount}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 rounded-xl border border-slate-800/60 pointer-events-auto transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PAUSE MODAL
          ======================================================== */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-6 z-30">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
              <Pause className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Mission Suspended</h3>
              <p className="text-xs text-slate-400">Simulation clock paused at Wave {wave}.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={resumeGame}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Simulation (Esc)</span>
              </button>

              <button
                onClick={startGame}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Mission</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Exit to LMS Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          VICTORY MODAL
          ======================================================== */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-6 z-30">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                AlphaFold Target Stabilized
              </span>
              <h3 className="text-2xl font-black text-white">Host Cellular Immunity Secured</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                All 4 viral infection waves successfully neutralized. Structural integrity was preserved at 100% capacity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">FINAL SCORE</span>
                <span className="font-bold text-cyan-300 text-base tabular-nums">{score}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PATHOGENS DOCKED</span>
                <span className="font-bold text-emerald-400 text-base tabular-nums">{neutralizedCount}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={startGame}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Simulation Again</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Return to Course Hub & Review 3D Protein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          GAME OVER MODAL
          ======================================================== */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-6 z-30">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <Shield className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                Membrane Integrity Depleted
              </span>
              <h3 className="text-2xl font-black text-white">Cellular Breach Detected</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Viral spikes overcame nano-capsule defenses during Wave {wave}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">FINAL SCORE</span>
                <span className="font-bold text-cyan-300 text-base tabular-nums">{score}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">PATHOGENS DOCKED</span>
                <span className="font-bold text-slate-300 text-base tabular-nums">{neutralizedCount}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={startGame}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-Deploy Capsule</span>
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Return to Course Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

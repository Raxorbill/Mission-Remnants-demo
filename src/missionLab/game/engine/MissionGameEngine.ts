import * as THREE from 'three';
import { MissionId, MissionTelemetry, RoverChoice } from '../../types/game';
import { MISSIONS_DATA } from '../../data/missionsData';
import { soundEngine } from '../../audio/soundEngine';
import { ThreeContext, createThreeContext } from '../three/threeSetup';
import { MaterialLibrary } from '../three/materials';
import { createAstronaut } from '../three/models/astronaut';
import { createLunarModule } from '../three/models/lunarModule';
import { createLaserReflector, createApolloSeismometerStation } from '../three/models/apolloInstruments';
import { createVikingLander } from '../three/models/vikingLander';
import { createMERRover } from '../three/models/merRover';
import { createIngenuityDrone } from '../three/models/ingenuityDrone';
import { createVoyagerSpacecraft } from '../three/models/voyagerSpacecraft';
import { createLunarEnvironment } from '../three/environments/lunarEnvironment';
import { createMartianEnvironment } from '../three/environments/martianEnvironment';
import { createDeepSpaceEnvironment } from '../three/environments/deepSpaceEnvironment';
import { getLunarTerrainHeight, getMartianTerrainHeight } from '../three/terrainHeight';

export interface EngineCallbacks {
  onObjectiveUpdate: (objectiveId: string, completed: boolean, title?: string) => void;
  onContextActionChange: (actionLabel: string | null, actionHandler: (() => void) | null) => void;
  onTelemetryUpdate: (telemetry: MissionTelemetry) => void;
  onMissionComplete: (missionId: MissionId) => void;
  onSpecialView: (viewType: 'photo' | 'waveform' | 'golden_record' | null, data?: any) => void;
}

interface InteractiveMarker {
  id: string;
  position: THREE.Vector3;
  radius: number;
  label: string;
  onTrigger: () => void;
  active: boolean;
  meshGroup?: THREE.Group;
}

export class MissionGameEngine {
  private container: HTMLDivElement;
  private threeCtx: ThreeContext;
  private materials: MaterialLibrary;
  private callbacks: EngineCallbacks;

  // Loop & timing
  private isRunning: boolean = false;
  private animFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Active mission state
  private missionId: MissionId = 'apollo-reflector';
  private roverChoice: 'spirit' | 'opportunity' = 'spirit';
  private missionStage: number = 0;
  private completedObjectives: Set<string> = new Set();

  // Active contextual action (synchronously stored so clicking HUD button or pressing E always fires!)
  private activeContextAction: { label: string; onTrigger: () => void } | null = null;

  // Actors & Meshes in current scene
  private playerActor: THREE.Group | null = null;
  private interactiveMarkers: InteractiveMarker[] = [];
  private wheelsToRotate: THREE.Mesh[] = [];
  private rotorBlades: { top?: THREE.Group; bottom?: THREE.Group } = {};
  private laserPulseObj: THREE.Line | null = null;
  private flightWaypoints: THREE.Vector3[] = [];
  private currentWaypointIndex: number = 0;

  // Camera Orbit Controls (Free mouse-drag / touch-swipe 360° background rotation)
  private cameraOrbit = {
    azimuth: 0,          // horizontal rotation (radians)
    elevation: 0.32,     // vertical angle (radians)
    distance: 7.2,       // distance from target
    minDistance: 2.2,
    maxDistance: 35.0,
  };
  private isDraggingCamera: boolean = false;
  private lastPointerPos = { x: 0, y: 0 };
  private pointerDownTime: number = 0;
  private cameraLookTarget: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  private voyagerFocusTarget: THREE.Vector3 | null = null;
  private roverHeading: number = 0;

  // Raycasting for direct click interaction
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private pointerVector: THREE.Vector2 = new THREE.Vector2();

  // Controls input state
  private keysHeld: Record<string, boolean> = {};
  public touchJoystick: { x: number; y: number } = { x: 0, y: 0 };
  public touchAltitude: number = 0;

  constructor(container: HTMLDivElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.threeCtx = createThreeContext(container);
    this.materials = new MaterialLibrary();

    // Enable bump on terrain for high surface fidelity
    this.materials.moonGround.bumpMap = this.materials.moonGround.map;
    this.materials.moonGround.bumpScale = 0.16;
    this.materials.marsGround.bumpMap = this.materials.marsGround.map;
    this.materials.marsGround.bumpScale = 0.22;

    this.setupInputListeners();
    this.setupCameraMouseListeners();
  }

  private setupInputListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  private setupCameraMouseListeners() {
    const dom = this.threeCtx.renderer.domElement;
    dom.style.touchAction = 'none';
    dom.style.cursor = 'grab';

    // Pointer down: begin drag & record click start
    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDraggingCamera = true;
      dom.style.cursor = 'grabbing';
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
      this.pointerDownTime = performance.now();
      try {
        dom.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    });

    // Pointer move: rotate background/camera
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDraggingCamera) return;
      const dx = e.clientX - this.lastPointerPos.x;
      const dy = e.clientY - this.lastPointerPos.y;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };

      // Orbit camera around subject
      this.cameraOrbit.azimuth -= dx * 0.007;
      this.cameraOrbit.elevation = Math.max(
        0.05,
        Math.min(Math.PI * 0.48, this.cameraOrbit.elevation - dy * 0.005)
      );
    });

    // Pointer up: end drag, test for quick click to raycast
    const handlePointerEnd = (e: PointerEvent) => {
      if (!this.isDraggingCamera) return;
      this.isDraggingCamera = false;
      dom.style.cursor = 'grab';
      try {
        dom.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      // If quick click (< 250ms and minimal movement), raycast interactable objects
      const clickDuration = performance.now() - this.pointerDownTime;
      const distMoved = Math.hypot(e.clientX - this.lastPointerPos.x, e.clientY - this.lastPointerPos.y);

      if (clickDuration < 250 && distMoved < 10) {
        this.handleCanvasRaycastClick(e);
      }
    };

    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    // Mouse wheel: zoom in and out
    dom.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      this.cameraOrbit.distance = Math.max(
        this.cameraOrbit.minDistance,
        Math.min(this.cameraOrbit.maxDistance, this.cameraOrbit.distance + e.deltaY * 0.012)
      );
    }, { passive: false });
  }

  /** Rotate camera horizontally (azimuth) and vertically (elevation) */
  public rotateCameraOrbit(deltaAzimuth: number, deltaElevation: number = 0) {
    this.cameraOrbit.azimuth += deltaAzimuth;
    this.cameraOrbit.elevation = Math.max(
      0.05,
      Math.min(Math.PI * 0.48, this.cameraOrbit.elevation + deltaElevation)
    );
  }

  /** Zoom camera in (negative) or out (positive) */
  public zoomCamera(delta: number) {
    this.cameraOrbit.distance = Math.max(
      this.cameraOrbit.minDistance,
      Math.min(this.cameraOrbit.maxDistance, this.cameraOrbit.distance + delta)
    );
  }

  /** Reset camera view to default orientation */
  public resetCameraOrbit() {
    this.cameraOrbit.azimuth = 0;
    this.cameraOrbit.elevation = 0.32;
    this.cameraOrbit.distance = this.missionId === 'voyager1' ? 8.5 : 7.0;
  }

  private handleCanvasRaycastClick(e: MouseEvent) {
    const rect = this.threeCtx.renderer.domElement.getBoundingClientRect();
    this.pointerVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerVector, this.threeCtx.camera);
    const intersects = this.raycaster.intersectObjects(this.threeCtx.scene.children, true);

    if (intersects.length > 0) {
      // If user clicked any interactive marker or active actor, fire action
      if (this.activeContextAction) {
        this.triggerCurrentContextAction();
      }
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keysHeld[key] = true;

    if (key === 'e' || key === 'enter') {
      this.triggerCurrentContextAction();
    }
    // Camera quick rotation keys: Q (left) and R (right)
    if (key === 'q') {
      this.rotateCameraOrbit(Math.PI / 10, 0);
    } else if (key === 'r') {
      this.rotateCameraOrbit(-Math.PI / 10, 0);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld[e.key.toLowerCase()] = false;
  };

  private handleBlur = () => {
    this.keysHeld = {};
    this.touchJoystick = { x: 0, y: 0 };
    soundEngine.stopRoverMotor();
  };

  /** Set the currently active contextual action safely in both engine and UI */
  public setContextAction(label: string | null, onTrigger: (() => void) | null) {
    if (label && onTrigger) {
      this.activeContextAction = { label, onTrigger };
      this.callbacks.onContextActionChange(label, onTrigger);
    } else {
      this.activeContextAction = null;
      this.callbacks.onContextActionChange(null, null);
    }
  }

  /** Trigger current contextual action (from HUD button, mobile tap, or key 'E') */
  public triggerCurrentContextAction() {
    if (this.activeContextAction) {
      soundEngine.playClick();
      const action = this.activeContextAction.onTrigger;
      action();
    }
  }

  /** Ensure WebGL canvas matches container dimensions */
  public resize() {
    this.threeCtx.resize();
  }

  /** Start or restart a specific mission */
  public loadMission(missionId: MissionId, roverChoice: 'spirit' | 'opportunity' = 'spirit') {
    this.missionId = missionId;
    this.roverChoice = roverChoice;
    this.missionStage = 0;
    this.completedObjectives.clear();
    this.setContextAction(null, null);
    this.threeCtx.resize();

    // Reset camera orbit
    this.cameraOrbit.azimuth = 0;
    this.cameraOrbit.elevation = 0.35;
    this.cameraOrbit.distance = missionId === 'voyager1' ? 8.5 : 7.0;

    // Clear previous scene objects
    this.clearScene();

    // Build the specific environment and models
    switch (missionId) {
      case 'apollo-reflector':
        this.setupApolloReflectorMission();
        break;
      case 'apollo-seismometer':
        this.setupApolloSeismometerMission();
        break;
      case 'viking':
        this.setupVikingMission();
        break;
      case 'spirit-opportunity':
        this.setupSpiritOpportunityMission();
        break;
      case 'ingenuity':
        this.setupIngenuityMission();
        break;
      case 'voyager1':
        this.setupVoyagerMission();
        break;
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.clock.start();
      this.runLoop();
    }
  }

  private clearScene() {
    const scene = this.threeCtx.scene;
    soundEngine.stopRoverMotor();

    while (scene.children.length > 0) {
      const obj = scene.children[0];
      scene.remove(obj);
    }

    this.playerActor = null;
    this.interactiveMarkers = [];
    this.wheelsToRotate = [];
    this.rotorBlades = {};
    this.laserPulseObj = null;
    this.voyagerFocusTarget = null;
    this.currentWaypointIndex = 0;
    this.flightWaypoints = [];
  }

  /** Get exact analytical terrain elevation at (x, z) for current mission */
  public getTerrainElevation(x: number, z: number): number {
    if (this.missionId === 'apollo-reflector' || this.missionId === 'apollo-seismometer') {
      return getLunarTerrainHeight(x, z);
    }
    if (this.missionId === 'viking' || this.missionId === 'spirit-opportunity' || this.missionId === 'ingenuity') {
      return getMartianTerrainHeight(x, z);
    }
    return 0;
  }

  // -------------------------------------------------------------
  // MISSION 01: APOLLO LASER REFLECTORS
  // -------------------------------------------------------------
  private setupApolloReflectorMission() {
    const { scene } = this.threeCtx;
    createLunarEnvironment(scene, this.materials);

    // Apollo Lunar Module at origin
    const lm = createLunarModule(this.materials);
    lm.position.set(0, 0, 0);
    scene.add(lm);

    // Astronaut begins at LM hatch
    const astronaut = createAstronaut(this.materials);
    astronaut.position.set(0, 2.6, 1.4);
    scene.add(astronaut);
    this.playerActor = astronaut;
    this.cameraLookTarget.set(0, 2, 0);

    // Checkpoint deployment target (~16m away from LM blast zone)
    const deployTargetPos = new THREE.Vector3(14, 0, 11);
    const deployMarker = this.createPlacementBeacon(deployTargetPos, 2.6, 0x00d9f5, 'DEPLOYMENT SITE');
    scene.add(deployMarker);

    // Step 1: Initial Action -> EXIT LANDER
    this.setContextAction('EXIT LANDER', () => {
      soundEngine.playQuindar('intro');
      // Step astronaut down to the surface
      astronaut.position.set(0, 0, 3.6);
      this.missionStage = 1;
      this.setContextAction(null, null);

      // Register Checkpoint Target
      this.interactiveMarkers.push({
        id: 'checkpoint',
        position: deployTargetPos,
        radius: 3.2,
        label: 'INSPECT DEPLOYMENT SITE',
        active: true,
        meshGroup: deployMarker,
        onTrigger: () => {
          soundEngine.playObjectiveComplete();
          this.removeMarker('checkpoint');

          // Objective 1 update: Move back to LM Equipment Bay to get Reflector
          const mesaPos = new THREE.Vector3(0, 0, 2.6);
          const mesaMarker = this.createPlacementBeacon(mesaPos, 2.2, 0xdfa028, 'EQUIPMENT BAY');
          scene.add(mesaMarker);

          this.interactiveMarkers.push({
            id: 'equipment_bay',
            position: mesaPos,
            radius: 2.8,
            label: 'PICK UP REFLECTOR',
            active: true,
            meshGroup: mesaMarker,
            onTrigger: () => {
              // Attach reflector to astronaut carry socket
              const reflectorCarry = createLaserReflector(this.materials);
              reflectorCarry.scale.set(0.65, 0.65, 0.65);
              const socket = astronaut.getObjectByName('carry_socket');
              if (socket) socket.add(reflectorCarry);

              soundEngine.playQuindar('outro');
              this.callbacks.onObjectiveUpdate('reach_deployment', true, 'Reached Deployment Area & Retrieved Reflector');
              this.completedObjectives.add('reach_deployment');
              this.removeMarker('equipment_bay');

              // Re-enable final deployment zone marker
              const finalDeployMarker = this.createPlacementBeacon(deployTargetPos, 2.6, 0x00ff88, 'PLACE REFLECTOR HERE');
              scene.add(finalDeployMarker);

              this.interactiveMarkers.push({
                id: 'place_reflector',
                position: deployTargetPos,
                radius: 3.0,
                label: 'PLACE REFLECTOR',
                active: true,
                meshGroup: finalDeployMarker,
                onTrigger: () => {
                  if (socket) socket.clear();
                  const deployedReflector = createLaserReflector(this.materials);
                  const groundY = this.getTerrainElevation(deployTargetPos.x, deployTargetPos.z);
                  deployedReflector.position.set(deployTargetPos.x, groundY, deployTargetPos.z);
                  scene.add(deployedReflector);

                  soundEngine.playObjectiveComplete();
                  this.callbacks.onObjectiveUpdate('deploy_reflector', true, 'Lunar Laser Retroreflector Array Deployed');
                  this.completedObjectives.add('deploy_reflector');
                  this.removeMarker('place_reflector');

                  // Step 3: Earth Laser Pulse
                  this.setContextAction('SEND LASER PULSE FROM EARTH', () => {
                    this.triggerLaserRangingSequence(deployTargetPos);
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  private triggerLaserRangingSequence(reflectorPos: THREE.Vector3) {
    soundEngine.playLaserPulse();
    this.setContextAction('LASER TRANSMITTING TO MOON...', null);

    // Laser beam line from Earth (-38, 45, -70) to reflector
    const earthPos = new THREE.Vector3(-38, 45, -70);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 3 });
    const laserGeo = new THREE.BufferGeometry().setFromPoints([earthPos, reflectorPos]);
    const laserLine = new THREE.Line(laserGeo, laserMat);
    this.threeCtx.scene.add(laserLine);
    this.laserPulseObj = laserLine;

    let timeElapsed = 0;
    const interval = setInterval(() => {
      timeElapsed += 0.1;
      this.callbacks.onTelemetryUpdate({ lightTravelTime: Number(timeElapsed.toFixed(2)) });
      if (timeElapsed >= 2.56) {
        clearInterval(interval);
        soundEngine.playLaserReturn();
        this.callbacks.onObjectiveUpdate('return_laser', true, 'Round-Trip Light Time Calculated (~2.56 s)');
        this.completedObjectives.add('return_laser');
        this.setContextAction(null, null);

        setTimeout(() => {
          if (this.laserPulseObj) this.threeCtx.scene.remove(this.laserPulseObj);
          soundEngine.playMissionVictory();
          this.callbacks.onMissionComplete('apollo-reflector');
        }, 1200);
      }
    }, 100);
  }

  // -------------------------------------------------------------
  // MISSION 02: APOLLO SEISMOMETERS
  // -------------------------------------------------------------
  private setupApolloSeismometerMission() {
    const { scene } = this.threeCtx;
    createLunarEnvironment(scene, this.materials);

    const lm = createLunarModule(this.materials);
    scene.add(lm);

    const astronaut = createAstronaut(this.materials);
    astronaut.position.set(0, 0, 3.6);
    scene.add(astronaut);
    this.playerActor = astronaut;
    this.cameraLookTarget.set(0, 1.5, 0);

    const stationTargetPos = new THREE.Vector3(15, 0, 9);
    const stationBeacon = this.createPlacementBeacon(stationTargetPos, 2.8, 0x00d9f5, 'ALSEP SEISMIC STATION SITE');
    scene.add(stationBeacon);

    // Step 1: Walk to station site checkpoint
    this.interactiveMarkers.push({
      id: 'seismic_site_checkpoint',
      position: stationTargetPos,
      radius: 3.2,
      label: 'CHECKPOINT (STATION SITE)',
      active: true,
      meshGroup: stationBeacon,
      onTrigger: () => {
        soundEngine.playQuindar('intro');
        this.removeMarker('seismic_site_checkpoint');

        // Return to LM to collect equipment
        const mesaPos = new THREE.Vector3(0, 0, 2.6);
        const mesaBeacon = this.createPlacementBeacon(mesaPos, 2.2, 0xdfa028, 'COLLECT ALSEP HARDWARE');
        scene.add(mesaBeacon);

        this.interactiveMarkers.push({
          id: 'collect_seismic_gear',
          position: mesaPos,
          radius: 2.8,
          label: 'COLLECT EQUIPMENT',
          active: true,
          meshGroup: mesaBeacon,
          onTrigger: () => {
            soundEngine.playQuindar('outro');
            this.removeMarker('collect_seismic_gear');

            // Move back to station site to deploy seismometer
            const deployBeacon = this.createPlacementBeacon(stationTargetPos, 2.8, 0x00ff88, 'DEPLOY SEISMIC SENSOR');
            scene.add(deployBeacon);

            this.interactiveMarkers.push({
              id: 'deploy_seismometer',
              position: stationTargetPos,
              radius: 3.2,
              label: 'DEPLOY SEISMOMETER',
              active: true,
              meshGroup: deployBeacon,
              onTrigger: () => {
                this.removeMarker('deploy_seismometer');
                const alsepStation = createApolloSeismometerStation(this.materials);
                const groundY = this.getTerrainElevation(stationTargetPos.x, stationTargetPos.z);
                alsepStation.position.set(stationTargetPos.x, groundY, stationTargetPos.z);
                scene.add(alsepStation);

                soundEngine.playObjectiveComplete();
                this.callbacks.onObjectiveUpdate('deploy_seismometer', true, 'Apollo 12 Passive Seismometer Deployed');
                this.completedObjectives.add('deploy_seismometer');

                // Step 2: Connect Central Station & Antenna
                this.setContextAction('CONNECT TO CENTRAL STATION', () => {
                  soundEngine.playRoboticServo();

                  this.setContextAction('DEPLOY HELICAL ANTENNA', () => {
                    soundEngine.playQuindar('intro');
                    this.callbacks.onObjectiveUpdate('prepare_station', true, 'Central Station Connected & Antenna Oriented');
                    this.completedObjectives.add('prepare_station');

                    // Step 3: Start Listening to Moonquakes
                    this.setContextAction('START PASSIVE LISTENING', () => {
                      soundEngine.playTelemetryTone();
                      this.setContextAction(null, null);

                      // Open Waveform viewer modal
                      this.callbacks.onSpecialView('waveform', {
                        title: 'APOLLO 12 PSE SEISMOGRAM RECORDING',
                        event: 'DEEP MOONQUAKE DETECTED (~800km depth)',
                        isIllustrative: true,
                        onSignalDetected: () => {
                          this.callbacks.onSpecialView(null);
                          soundEngine.playObjectiveComplete();
                          this.callbacks.onObjectiveUpdate('detect_signal', true, 'Lunar Seismic Vibration Trace Detected');
                          this.completedObjectives.add('detect_signal');

                          setTimeout(() => {
                            soundEngine.playMissionVictory();
                            this.callbacks.onMissionComplete('apollo-seismometer');
                          }, 1000);
                        }
                      });
                    });
                  });
                });
              }
            });
          }
        });
      }
    });
  }

  // -------------------------------------------------------------
  // MISSION 03: VIKING LANDERS (Stationary Lander, No Driving!)
  // -------------------------------------------------------------
  private setupVikingMission() {
    const { scene } = this.threeCtx;
    createMartianEnvironment(scene, this.materials, 'viking');

    const { lander, roboticArm } = createVikingLander(this.materials);
    lander.position.set(0, 0, 0);
    scene.add(lander);
    this.playerActor = lander;
    this.cameraLookTarget.set(0, 1.2, 0);

    // Initial state: Lander Ready
    this.setContextAction('BEGIN EXPERIMENTS', () => {
      soundEngine.playTelemetryTone();

      // Step 1: Take Panorama
      this.setContextAction('TAKE SURFACE PANORAMA', () => {
        soundEngine.playClick();
        this.callbacks.onSpecialView('photo', {
          title: 'VIKING 1 SURFACE PANORAMA — CHRYSE PLANITIA',
          description: 'Humanity’s first clear color view from the surface of Mars, July 1976. Shows fine red dust, dune drifts, and vesicular basalt rocks.',
          truthLabel: 'MISSION FACT',
          onClose: () => {
            this.callbacks.onSpecialView(null);
            this.callbacks.onObjectiveUpdate('photograph_site', true, 'Chryse Planitia 360° Panorama Captured');
            this.completedObjectives.add('photograph_site');

            // Step 2: Choose reachable soil patch
            this.setContextAction('COLLECT SOIL (PATCH ALPHA)', () => {
              this.animateVikingSoilScoop(roboticArm, () => {
                this.callbacks.onObjectiveUpdate('collect_soil', true, 'Robotic Scoop Delivered Soil to Inlet');
                this.completedObjectives.add('collect_soil');

                // Step 3: Run Biological Analysis
                this.setContextAction('START BIOLOGICAL ANALYSIS', () => {
                  soundEngine.playRoboticServo();
                  this.setContextAction('TRANSMITTING TELEMETRY...', null);

                  setTimeout(() => {
                    soundEngine.playTelemetryTone();
                    this.callbacks.onObjectiveUpdate('analyze_sample', true, 'Sample Chemistry Analyzed & Transmitted');
                    this.completedObjectives.add('analyze_sample');

                    setTimeout(() => {
                      soundEngine.playMissionVictory();
                      this.callbacks.onMissionComplete('viking');
                    }, 1000);
                  }, 2200);
                });
              });
            });
          }
        });
      });
    });
  }

  private animateVikingSoilScoop(arm: THREE.Group, onDone: () => void) {
    soundEngine.playRoboticServo();
    this.setContextAction('SCOOPING MARTIAN REGOLITH...', null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      arm.rotation.x = Math.sin(step * 0.2) * 0.38;
      arm.rotation.y = Math.cos(step * 0.15) * 0.22;
      if (step >= 26) {
        clearInterval(interval);
        arm.rotation.set(0, 0, 0);
        soundEngine.playObjectiveComplete();
        onDone();
      }
    }, 75);
  }

  // -------------------------------------------------------------
  // MISSION 04: SPIRIT & OPPORTUNITY
  // -------------------------------------------------------------
  private setupSpiritOpportunityMission() {
    const { scene } = this.threeCtx;
    createMartianEnvironment(scene, this.materials, 'spirit-opportunity');

    const { rover, wheels, iddArm, ratTool } = createMERRover(
      this.materials,
      this.roverChoice === 'spirit' ? 'Spirit' : 'Opportunity'
    );
    const startY = this.getTerrainElevation(0, 0);
    rover.position.set(0, startY, 0);
    scene.add(rover);
    this.playerActor = rover;
    this.wheelsToRotate = wheels;
    this.cameraLookTarget.set(0, startY + 1.0, 0);

    const targetAY = this.getTerrainElevation(14, 15);
    const targetAPos = new THREE.Vector3(14, targetAY, 15);

    const targetBY = this.getTerrainElevation(-16, 22);
    const targetBPos = new THREE.Vector3(-16, targetBY, 22);

    const rockTargetY = this.getTerrainElevation(-18, 25);
    const rockTargetPos = new THREE.Vector3(-18, rockTargetY, 25);

    // Initial guidance in action HUD so player knows immediately where to drive
    this.setContextAction('DRIVE TO TARGET A (SEE BEACON)', null);

    // Target A Beacon
    const targetABeacon = this.createPlacementBeacon(targetAPos, 3.5, 0x00d9f5, 'GEOLOGICAL TARGET A');
    scene.add(targetABeacon);

    this.interactiveMarkers.push({
      id: 'target_a',
      position: targetAPos,
      radius: 5.5,
      label: 'TAKE PHOTO (TARGET A)',
      active: true,
      meshGroup: targetABeacon,
      onTrigger: () => {
        this.removeMarker('target_a');
        this.callbacks.onSpecialView('photo', {
          title: `${this.roverChoice === 'spirit' ? 'GUSEV CRATER' : 'MERIDIANI PLANUM'} — PANCAM MOSAIC`,
          description: this.roverChoice === 'spirit'
            ? 'Pancam stereoscopic panorama capturing layered basalt volcanic rocks and distant Columbia Hills.'
            : 'Pancam view showing outcrop rock layers embedded with hematite-rich spherical concretions ("blueberries").',
          truthLabel: 'MISSION FACT',
          onClose: () => {
            this.callbacks.onSpecialView(null);
            soundEngine.playObjectiveComplete();
            this.callbacks.onObjectiveUpdate('target_a', true, 'Target A Pancam Photograph Captured');
            this.completedObjectives.add('target_a');

            this.setContextAction('DRIVE TO TARGET B (SEE BEACON)', null);

            // Activate Target B Beacon
            const targetBBeacon = this.createPlacementBeacon(targetBPos, 3.5, 0x00d9f5, 'GEOLOGICAL TARGET B');
            scene.add(targetBBeacon);

            this.interactiveMarkers.push({
              id: 'target_b',
              position: targetBPos,
              radius: 5.5,
              label: 'TAKE PHOTO (TARGET B)',
              active: true,
              meshGroup: targetBBeacon,
              onTrigger: () => {
                this.removeMarker('target_b');
                this.callbacks.onSpecialView('photo', {
                  title: 'SECONDARY GEOLOGICAL FORMATION — PANCAM',
                  description: 'Multi-filter multispectral imaging assessing iron mineral oxidation and past fluid interaction.',
                  truthLabel: 'MISSION FACT',
                  onClose: () => {
                    this.callbacks.onSpecialView(null);
                    soundEngine.playObjectiveComplete();
                    this.callbacks.onObjectiveUpdate('target_b', true, 'Target B Pancam Photograph Captured');
                    this.completedObjectives.add('target_b');

                    this.setContextAction('APPROACH WEATHERED ROCK (SEE BEACON)', null);

                    // Approach rock target for RAT grinding
                    const rockBeacon = this.createPlacementBeacon(rockTargetPos, 3.5, 0xdfa028, 'WEATHERED ROCK (RAT TARGET)');
                    scene.add(rockBeacon);

                    // Add prominent weathered rock mesh at target
                    const targetRock = new THREE.Mesh(
                      new THREE.DodecahedronGeometry(1.4, 0),
                      this.materials.rockMaterial
                    );
                    targetRock.position.set(rockTargetPos.x, rockTargetY + 0.65, rockTargetPos.z);
                    scene.add(targetRock);

                    this.interactiveMarkers.push({
                      id: 'inspect_rat',
                      position: rockTargetPos,
                      radius: 5.2,
                      label: 'USE ROCK ABRASION TOOL (RAT)',
                      active: true,
                      meshGroup: rockBeacon,
                      onTrigger: () => {
                        this.removeMarker('inspect_rat');
                        soundEngine.playDrillSound();
                        soundEngine.playRoboticServo();
                        this.setContextAction('GRINDING WEATHERED ROCK SURFACE...', null);

                        let rStep = 0;
                        const rInt = setInterval(() => {
                          rStep++;
                          ratTool.rotation.z += 0.8;
                          if (rStep >= 22) {
                            clearInterval(rInt);
                            this.callbacks.onSpecialView('photo', {
                              title: 'RAT BOREHOLE — FRESH INTERIOR ROCK EXPOSED',
                              description: 'The diamond-impregnated cutting wheels removed 5mm of weathered dust, revealing pristine crystalline rock matrix underneath.',
                              truthLabel: 'MISSION FACT',
                              onClose: () => {
                                this.callbacks.onSpecialView(null);
                                soundEngine.playObjectiveComplete();
                                this.callbacks.onObjectiveUpdate('inspect_rat', true, 'Rock Abrasion Tool Ground Fresh Rock Surface');
                                this.completedObjectives.add('inspect_rat');

                                setTimeout(() => {
                                  soundEngine.playMissionVictory();
                                  this.callbacks.onMissionComplete('spirit-opportunity');
                                }, 1000);
                              }
                            });
                          }
                        }, 75);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  // -------------------------------------------------------------
  // MISSION 05: INGENUITY HELICOPTER (Mars)
  // -------------------------------------------------------------
  private setupIngenuityMission() {
    const { scene } = this.threeCtx;
    createMartianEnvironment(scene, this.materials, 'ingenuity');

    // Landing marker on the ground
    const startPad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0x444b55, roughness: 0.8 })
    );
    startPad.position.set(0, 0.02, 0);
    scene.add(startPad);

    const { drone, topRotor, bottomRotor } = createIngenuityDrone(this.materials);
    drone.position.set(0, 0, 0);
    scene.add(drone);
    this.playerActor = drone;
    this.rotorBlades = { top: topRotor, bottom: bottomRotor };
    this.cameraLookTarget.set(0, 0.6, 0);

    // Step 1: Pre-flight check
    this.setContextAction('RUN PRE-FLIGHT CHECK', () => {
      soundEngine.playTelemetryTone();
      this.callbacks.onTelemetryUpdate({ batteryStatus: 100, rotorRPM: 0, altitude: 0 });
      this.callbacks.onObjectiveUpdate('deploy_ingenuity', true, 'Pre-flight Avionics & Rotor Diagnostics Passed');
      this.completedObjectives.add('deploy_ingenuity');

      // Step 2: Spin Rotors
      this.setContextAction('SPIN ROTORS (2,400+ RPM)', () => {
        soundEngine.playHelicopterRotor(3.5);
        this.missionStage = 10; // Rotors spinning

        // Step 3: Take Off
        this.setContextAction('TAKE OFF TO 5 METERS', () => {
          soundEngine.playHelicopterRotor(5.0);
          this.missionStage = 11; // Airborne flight mode!
          this.playerActor!.position.y = 4.5;

          // Define 3 aerial waypoints
          this.flightWaypoints = [
            new THREE.Vector3(10, 5.0, 12),
            new THREE.Vector3(-12, 5.5, 20),
            new THREE.Vector3(0, 4.5, 28),
          ];
          this.currentWaypointIndex = 0;

          // Spawn visible 3D Waypoint beacon
          const wpBeacon = this.createPlacementBeacon(this.flightWaypoints[0], 2.8, 0x00d9f5, 'AERIAL WAYPOINT 1');
          scene.add(wpBeacon);
          this.interactiveMarkers.push({
            id: 'air_waypoint',
            position: this.flightWaypoints[0],
            radius: 3.5,
            label: 'REACH WAYPOINT',
            active: true,
            meshGroup: wpBeacon,
            onTrigger: () => {
              this.advanceHelicopterWaypoint();
            }
          });
        });
      });
    });
  }

  private advanceHelicopterWaypoint() {
    soundEngine.playObjectiveComplete();
    this.currentWaypointIndex++;
    this.removeMarker('air_waypoint');

    if (this.currentWaypointIndex < this.flightWaypoints.length) {
      const nextWp = this.flightWaypoints[this.currentWaypointIndex];
      const nextBeacon = this.createPlacementBeacon(
        nextWp,
        2.8,
        0x00d9f5,
        `AERIAL WAYPOINT ${this.currentWaypointIndex + 1}`
      );
      this.threeCtx.scene.add(nextBeacon);

      this.interactiveMarkers.push({
        id: 'air_waypoint',
        position: nextWp,
        radius: 3.5,
        label: `REACH WAYPOINT ${this.currentWaypointIndex + 1}`,
        active: true,
        meshGroup: nextBeacon,
        onTrigger: () => {
          this.advanceHelicopterWaypoint();
        }
      });
    } else {
      // All waypoints completed!
      this.callbacks.onObjectiveUpdate('fly_route', true, 'Aerial Navigation Route Completed (3 Waypoints)');
      this.completedObjectives.add('fly_route');

      // Final Step: Capture Aerial Photo and Land
      this.setContextAction('CAPTURE AERIAL SCOUT PHOTO', () => {
        this.callbacks.onSpecialView('photo', {
          title: 'AERIAL RECONNAISSANCE VIEW — INGENUITY NAVCAM',
          description: 'Black-and-white downward navigation camera frame tracking sand ripples and boulder fields across Jezero Crater from 5 meters altitude.',
          truthLabel: 'MISSION FACT',
          onClose: () => {
            this.callbacks.onSpecialView(null);

            // Marked Landing Zone
            const landZone = new THREE.Vector3(0, 0, 30);
            const landBeacon = this.createPlacementBeacon(landZone, 3.0, 0x00ff88, 'DESIGNATED TOUCHDOWN ZONE');
            this.threeCtx.scene.add(landBeacon);

            this.setContextAction('TOUCH DOWN ON LANDING ZONE', () => {
              const landGroundY = this.getTerrainElevation(landZone.x, landZone.z);
              this.playerActor!.position.set(landZone.x, landGroundY, landZone.z);
              this.missionStage = 12;
              soundEngine.playObjectiveComplete();
              this.callbacks.onObjectiveUpdate('capture_and_land', true, 'Precision Touchdown on Mars Completed');
              this.completedObjectives.add('capture_and_land');

              setTimeout(() => {
                soundEngine.playMissionVictory();
                this.callbacks.onMissionComplete('ingenuity');
              }, 1000);
            });
          }
        });
      });
    }
  }

  // -------------------------------------------------------------
  // MISSION 06: VOYAGER 1 (Deep Space & Heliopause)
  // -------------------------------------------------------------
  private setupVoyagerMission() {
    const { scene } = this.threeCtx;
    const { jupiterGroup, saturnGroup, earthDot } = createDeepSpaceEnvironment(scene);

    const { voyager, scanPlatform } = createVoyagerSpacecraft(this.materials);
    voyager.position.set(0, 0, 0);
    scene.add(voyager);
    this.playerActor = voyager;
    this.voyagerFocusTarget = null;
    this.cameraLookTarget.set(0, 0, 0);

    // Stage 1: Unfold Instruments
    this.setContextAction('UNFOLD BOOMS & HIGH-GAIN ANTENNA', () => {
      soundEngine.playRoboticServo();
      soundEngine.playTelemetryTone();

      // Step 2: Jupiter Flyby
      this.setContextAction('AIM CAMERA AT JUPITER & IO', () => {
        soundEngine.playRoboticServo();
        scanPlatform.rotation.y = Math.PI * 0.35;
        this.voyagerFocusTarget = jupiterGroup.position;

        setTimeout(() => {
          this.callbacks.onSpecialView('photo', {
            title: 'JUPITER & IO VOLCANIC PLUME — VOYAGER 1 (1979)',
            description: 'Discovery of active sulfur cryo-volcanoes erupting into space from Io, proving worlds in the outer solar system are geologically alive.',
            truthLabel: 'MISSION FACT',
            onClose: () => {
              this.callbacks.onSpecialView(null);
              soundEngine.playObjectiveComplete();
              this.callbacks.onObjectiveUpdate('flyby_target', true, 'Jupiter & Io Active Volcanic Plume Captured');
              this.completedObjectives.add('flyby_target');

              // Step 3: Gravity Assist to Saturn
              this.setContextAction('EXECUTE GRAVITY ASSIST TO SATURN', () => {
                soundEngine.playTelemetryTone();
                this.voyagerFocusTarget = saturnGroup.position;

                // Step 4: Turn Camera toward Earth ("Pale Blue Dot")
                this.setContextAction('TURN CAMERA TOWARD EARTH', () => {
                  soundEngine.playRoboticServo();
                  scanPlatform.rotation.y = -Math.PI * 0.45;
                  this.voyagerFocusTarget = earthDot.position;

                  this.setContextAction('CAPTURE PALE BLUE DOT (1990)', () => {
                    soundEngine.playClick();
                    this.callbacks.onSpecialView('photo', {
                      title: 'THE PALE BLUE DOT — VOYAGER 1 (FEBRUARY 14, 1990)',
                      description: 'Earth seen from 6 billion kilometers away, a tiny pixel suspended in a beam of scattered sunlight. Carl Sagan wrote: "Look again at that dot. That\'s here. That\'s home. That\'s us."',
                      truthLabel: 'MISSION FACT',
                      onClose: () => {
                        this.callbacks.onSpecialView(null);
                        soundEngine.playObjectiveComplete();
                        this.callbacks.onObjectiveUpdate('pale_blue_dot', true, 'The Pale Blue Dot of Earth Captured');
                        this.completedObjectives.add('pale_blue_dot');

                        // Step 5: Cross Heliopause into Interstellar Space
                        this.setContextAction('LISTEN TO INTERSTELLAR PLASMA WAVES', () => {
                          soundEngine.playTelemetryTone();
                          this.voyagerFocusTarget = null;
                          this.callbacks.onSpecialView('waveform', {
                            title: 'PLASMA WAVE SUBSYSTEM (PWS) — HELIOPAUSE CROSSING',
                            event: 'ELECTRON DENSITY SPIKE (40-fold increase to 0.08 / cm³)',
                            isIllustrative: false,
                            onSignalDetected: () => {
                              this.callbacks.onSpecialView(null);
                              soundEngine.playObjectiveComplete();
                              this.callbacks.onObjectiveUpdate('detect_interstellar', true, 'Crossing into Interstellar Space Confirmed');
                              this.completedObjectives.add('detect_interstellar');

                              // User can click to inspect Golden Record or complete directly
                              this.setContextAction('INSPECT THE GOLDEN RECORD', () => {
                                this.callbacks.onSpecialView('golden_record', {
                                  onClose: () => {
                                    this.callbacks.onSpecialView(null);
                                    soundEngine.playMissionVictory();
                                    this.callbacks.onMissionComplete('voyager1');
                                  }
                                });
                              });
                            }
                          });
                        });
                      }
                    });
                  });
                });
              });
            }
          });
        }, 800);
      });
    });
  }

  // -------------------------------------------------------------
  // SIMULATION TICK LOOP
  // -------------------------------------------------------------
  private runLoop = () => {
    if (!this.isRunning) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);

    this.updateActorMovement(dt);
    this.updateInteractiveMarkers();
    this.updateCameraOrbit(dt);

    const { renderer, scene, camera, isSoftwareGl } = this.threeCtx;
    renderer.render(scene, camera);

    if (isSoftwareGl) {
      setTimeout(() => {
        this.animFrameId = requestAnimationFrame(this.runLoop);
      }, 70);
    } else {
      this.animFrameId = requestAnimationFrame(this.runLoop);
    }
  };

  private updateActorMovement(dt: number) {
    if (!this.playerActor) return;

    // Read keys or mobile touch joystick
    let moveX = 0;
    let moveZ = 0;

    if (this.keysHeld['w'] || this.keysHeld['arrowup']) moveZ -= 1;
    if (this.keysHeld['s'] || this.keysHeld['arrowdown']) moveZ += 1;
    if (this.keysHeld['a'] || this.keysHeld['arrowleft']) moveX -= 1;
    if (this.keysHeld['d'] || this.keysHeld['arrowright']) moveX += 1;

    // Mobile virtual joystick input
    if (Math.abs(this.touchJoystick.x) > 0.05 || Math.abs(this.touchJoystick.y) > 0.05) {
      moveX += this.touchJoystick.x;
      moveZ -= this.touchJoystick.y;
    }

    const isMoving = Math.hypot(moveX, moveZ) > 0.1;

    // Viking is strictly stationary!
    if (this.missionId === 'viking') {
      return;
    }

    // Ingenuity Helicopter
    if (this.missionId === 'ingenuity') {
      if (this.missionStage < 11 || this.missionStage >= 12) {
        this.playerActor.position.y = this.getTerrainElevation(this.playerActor.position.x, this.playerActor.position.z);
      }

      if (this.missionStage >= 10) {
        if (this.rotorBlades.top) this.rotorBlades.top.rotation.y += 36 * dt;
        if (this.rotorBlades.bottom) this.rotorBlades.bottom.rotation.y -= 36 * dt;
      }

      if (this.missionStage >= 11) {
        // Flight movement relative to current camera azimuth
        const cosA = Math.cos(this.cameraOrbit.azimuth);
        const sinA = Math.sin(this.cameraOrbit.azimuth);
        const worldX = moveX * cosA + moveZ * sinA;
        const worldZ = -moveX * sinA + moveZ * cosA;

        const flySpeed = 5.2;
        this.playerActor.position.x += worldX * flySpeed * dt;
        this.playerActor.position.z += worldZ * flySpeed * dt;

        // Altitude control
        if (this.keysHeld[' '] || this.touchAltitude > 0) {
          this.playerActor.position.y = Math.min(8.5, this.playerActor.position.y + 2.8 * dt);
        } else if (this.keysHeld['shift'] || this.touchAltitude < 0) {
          this.playerActor.position.y = Math.max(0.5, this.playerActor.position.y - 2.8 * dt);
        }

        this.callbacks.onTelemetryUpdate({
          altitude: Number(this.playerActor.position.y.toFixed(1)),
          rotorRPM: 2460,
          speed: Number((Math.hypot(worldX, worldZ) * flySpeed).toFixed(1)),
        });
      }
      return;
    }

    // Voyager 1
    if (this.missionId === 'voyager1') {
      this.playerActor.rotation.y += dt * 0.04;
      return;
    }

    // Movement relative to current camera orbit angle so WASD feels completely natural!
    const cosA = Math.cos(this.cameraOrbit.azimuth);
    const sinA = Math.sin(this.cameraOrbit.azimuth);
    const worldX = moveX * cosA + moveZ * sinA;
    const worldZ = -moveX * sinA + moveZ * cosA;

    if (isMoving) {
      const speed = this.playerActor.name === 'astronaut' ? 3.4 : 2.5;
      const headingAngle = Math.atan2(worldX, worldZ);

      let nextX = this.playerActor.position.x + worldX * speed * dt;
      let nextZ = this.playerActor.position.z + worldZ * speed * dt;

      // Obstacle collision boundaries to prevent character/rover from walking inside models
      const obstacles: { x: number; z: number; radius: number }[] = [];
      if (this.missionId === 'apollo-reflector' || this.missionId === 'apollo-seismometer') {
        obstacles.push({ x: 0, z: 0, radius: 3.2 }); // Lunar Module descent stage & legs
        if (this.missionId === 'apollo-seismometer') {
          obstacles.push({ x: 15, z: 9, radius: 1.6 }); // ALSEP station
        }
      } else if (this.missionId === 'spirit-opportunity') {
        obstacles.push({ x: -18, z: 25, radius: 1.8 }); // Weathered Rock target
      }

      for (const obs of obstacles) {
        const dX = nextX - obs.x;
        const dZ = nextZ - obs.z;
        const d = Math.hypot(dX, dZ);
        if (d < obs.radius) {
          const push = obs.radius - d;
          const factor = (push + 0.05) / (d > 0.001 ? d : 1);
          nextX += dX * factor;
          nextZ += dZ * factor;
        }
      }

      this.playerActor.position.x = nextX;
      this.playerActor.position.z = nextZ;

      if (this.missionId === 'spirit-opportunity') {
        this.roverHeading = THREE.MathUtils.damp(this.roverHeading, headingAngle, 8, dt);
      } else {
        this.playerActor.rotation.y = THREE.MathUtils.damp(this.playerActor.rotation.y, headingAngle, 10, dt);
      }

      if (this.wheelsToRotate.length > 0) {
        soundEngine.startRoverMotor();
        this.wheelsToRotate.forEach(w => {
          w.rotation.x += speed * 2.8 * dt;
        });
      }

      this.callbacks.onTelemetryUpdate({
        speed: Number(speed.toFixed(1)),
        heading: Math.round(((headingAngle * 180) / Math.PI + 360) % 360),
      });
    } else {
      if (this.wheelsToRotate.length > 0) {
        soundEngine.stopRoverMotor();
      }
    }

    // Ground Height & All-Terrain Tilt Physics for Apollo Astronauts & MER Rovers
    const groundY = this.getTerrainElevation(this.playerActor.position.x, this.playerActor.position.z);

    if (this.missionId === 'apollo-reflector' || this.missionId === 'apollo-seismometer') {
      // Astronaut: feet stay firmly on terrain surface + realistic low-gravity lunar hop
      let targetY = groundY;
      if (isMoving) {
        targetY += Math.abs(Math.sin(performance.now() * 0.007)) * 0.12;
      }
      this.playerActor.position.y = targetY;
    } else if (this.missionId === 'spirit-opportunity') {
        // MER Rover 6-wheel All-Terrain Rocker-Bogie Suspension Physics
        const heading = this.roverHeading;
        const cosH = Math.sin(heading);
        const sinH = Math.cos(heading);

        // 4-point terrain ground elevation sampling under front, rear, left, right wheels
        const frontX = this.playerActor.position.x + cosH * 0.75;
        const frontZ = this.playerActor.position.z + sinH * 0.75;
        const backX = this.playerActor.position.x - cosH * 0.75;
        const backZ = this.playerActor.position.z - sinH * 0.75;
        const rightX = this.playerActor.position.x + sinH * 0.65;
        const rightZ = this.playerActor.position.z - cosH * 0.65;
        const leftX = this.playerActor.position.x - sinH * 0.65;
        const leftZ = this.playerActor.position.z + cosH * 0.65;

        const hFront = this.getTerrainElevation(frontX, frontZ);
        const hBack = this.getTerrainElevation(backX, backZ);
        const hRight = this.getTerrainElevation(rightX, rightZ);
        const hLeft = this.getTerrainElevation(leftX, leftZ);

        // Chassis elevation sits on wheel radius atop terrain (never sinks below surface)
        const avgWheelsY = (hFront + hBack + hRight + hLeft) / 4;
        this.playerActor.position.y = Math.max(groundY, avgWheelsY);

        // Calculate pitch (nose up/down) and roll (bank left/right) on the slope
        const pitchAngle = Math.atan2(hFront - hBack, 1.5);
        const rollAngle = Math.atan2(hLeft - hRight, 1.3);

        // Quaternion orientation avoids gimbal lock and keeps wheels firmly planted on the ground
        const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), heading);
        const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -pitchAngle);
        const qRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollAngle);
        const targetQuat = qYaw.multiply(qPitch).multiply(qRoll);

        this.playerActor.quaternion.slerp(targetQuat, Math.min(1.0, 12 * dt));
      }
  }

  private updateInteractiveMarkers() {
    if (!this.playerActor) return;
    const actorPos = this.playerActor.position;

    let nearestMarker: InteractiveMarker | null = null;
    let minDistance = Infinity;

    for (const marker of this.interactiveMarkers) {
      if (!marker.active) continue;
      // In 3D flight (Ingenuity), use 3D distance; on ground surfaces, use horizontal X-Z distance so elevation gradients don't prevent triggering
      const isAerial = this.missionId === 'ingenuity' && this.missionStage >= 11;
      const dist = isAerial
        ? actorPos.distanceTo(marker.position)
        : Math.hypot(actorPos.x - marker.position.x, actorPos.z - marker.position.z);

      if (dist < minDistance) {
        minDistance = dist;
      }
      if (dist < marker.radius) {
        nearestMarker = marker;
      }
    }

    // Update distance to objective on telemetry
    if (minDistance < 500) {
      this.callbacks.onTelemetryUpdate({ distanceToTarget: Number(minDistance.toFixed(1)) });
    }

    if (nearestMarker) {
      // Near marker! Set action if not already matching
      if (!this.activeContextAction || this.activeContextAction.label !== nearestMarker.label) {
        this.setContextAction(nearestMarker.label, nearestMarker.onTrigger);
      }
    } else {
      // If player walked away from an interactive proximity marker, clear it
      if (this.activeContextAction && this.interactiveMarkers.some(m => m.label === this.activeContextAction?.label)) {
        this.setContextAction(null, null);
      }
    }
  }

  private updateCameraOrbit(dt: number) {
    if (!this.playerActor) return;
    const { camera } = this.threeCtx;

    const targetPos = this.playerActor.position;

    // Smoothly damp target center
    if (this.missionId === 'voyager1' && this.voyagerFocusTarget) {
      this.cameraLookTarget.x = THREE.MathUtils.damp(this.cameraLookTarget.x, this.voyagerFocusTarget.x, 3.5, dt);
      this.cameraLookTarget.y = THREE.MathUtils.damp(this.cameraLookTarget.y, this.voyagerFocusTarget.y, 3.5, dt);
      this.cameraLookTarget.z = THREE.MathUtils.damp(this.cameraLookTarget.z, this.voyagerFocusTarget.z, 3.5, dt);
    } else {
      this.cameraLookTarget.x = THREE.MathUtils.damp(this.cameraLookTarget.x, targetPos.x, 6, dt);
      this.cameraLookTarget.y = THREE.MathUtils.damp(this.cameraLookTarget.y, targetPos.y + (this.missionId === 'voyager1' ? 0 : 1.1), 6, dt);
      this.cameraLookTarget.z = THREE.MathUtils.damp(this.cameraLookTarget.z, targetPos.z, 6, dt);
    }

    // Compute spherical coordinates around cameraLookTarget
    const cosEl = Math.cos(this.cameraOrbit.elevation);
    const sinEl = Math.sin(this.cameraOrbit.elevation);
    const sinAz = Math.sin(this.cameraOrbit.azimuth);
    const cosAz = Math.cos(this.cameraOrbit.azimuth);

    const desiredCamX = this.cameraLookTarget.x + this.cameraOrbit.distance * cosEl * sinAz;
    let desiredCamY = this.cameraLookTarget.y + this.cameraOrbit.distance * sinEl;
    const desiredCamZ = this.cameraLookTarget.z + this.cameraOrbit.distance * cosEl * cosAz;

    // Clamp camera position so it never dips below the local terrain surface
    if (this.missionId !== 'voyager1') {
      const terrainUnderCam = this.getTerrainElevation(desiredCamX, desiredCamZ);
      desiredCamY = Math.max(desiredCamY, terrainUnderCam + 0.85);
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredCamX, 7, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredCamY, 7, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredCamZ, 7, dt);

    camera.lookAt(this.cameraLookTarget);
  }

  /** Create prominent 3D holographic waypoint beacon with pulsating ring and vertical light beam */
  private createPlacementBeacon(pos: THREE.Vector3, radius: number, colorHex: number, labelText: string): THREE.Group {
    const beacon = new THREE.Group();
    const groundElevation = this.getTerrainElevation(pos.x, pos.z);
    // If aerial waypoint (altitude > 2.0m like Ingenuity flights), use pos.y; otherwise clamp to surface
    beacon.position.set(pos.x, pos.y > 2.0 ? pos.y : groundElevation, pos.z);

    // 1. Concentric Floor Rings
    const ringGeo = new THREE.RingGeometry(radius * 0.8, radius, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.06;
    beacon.add(ring);

    // Inner glowing disk
    const innerDiskGeo = new THREE.CircleGeometry(radius * 0.5, 24);
    innerDiskGeo.rotateX(-Math.PI / 2);
    const innerDiskMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const innerDisk = new THREE.Mesh(innerDiskGeo, innerDiskMat);
    innerDisk.position.y = 0.05;
    beacon.add(innerDisk);

    // 2. Vertical Light Beacon Pillar
    const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.0, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.45,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 2.5;
    beacon.add(beam);

    // 3. Floating Diamond Marker on Top
    const diamondGeo = new THREE.OctahedronGeometry(0.35, 0);
    const diamondMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      wireframe: true,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 5.2;
    beacon.add(diamond);

    return beacon;
  }

  private removeMarker(markerId: string) {
    const idx = this.interactiveMarkers.findIndex(m => m.id === markerId);
    if (idx !== -1) {
      const m = this.interactiveMarkers[idx];
      if (m.meshGroup) this.threeCtx.scene.remove(m.meshGroup);
      this.interactiveMarkers.splice(idx, 1);
    }
  }

  public dispose() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    soundEngine.stopRoverMotor();
    this.clearScene();
    this.materials.dispose();
    this.threeCtx.dispose();
  }
}

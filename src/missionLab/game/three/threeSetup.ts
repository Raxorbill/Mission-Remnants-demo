import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface ThreeContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  isSoftwareGl: boolean;
  pmremGenerator: THREE.PMREMGenerator;
  resize: () => void;
  dispose: () => void;
}

export function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export function createThreeContext(container: HTMLDivElement): ThreeContext {
  const isSoftwareGl = detectSoftwareGl();

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const width = Math.max(container.clientWidth || window.innerWidth, 320);
  const height = Math.max(container.clientHeight || window.innerHeight - 56, 320);
  renderer.setSize(width, height);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1500);
  camera.position.set(0, 5, 12);

  // Setup studio RoomEnvironment reflection for authentic PBR metals
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const roomEnvTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environment = roomEnvTexture;

  const handleResize = () => {
    if (!container || !renderer) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight - 56;
    if (w <= 0 || h <= 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  window.addEventListener('resize', handleResize);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
  }

  const dispose = () => {
    window.removeEventListener('resize', handleResize);
    resizeObserver?.disconnect();
    roomEnvTexture.dispose();
    pmremGenerator.dispose();
    roomEnv.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  };

  return {
    renderer,
    scene,
    camera,
    isSoftwareGl,
    pmremGenerator,
    resize: handleResize,
    dispose,
  };
}

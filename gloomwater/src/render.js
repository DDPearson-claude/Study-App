// render.js — BASELINE (integrator). Minimal working renderer so other modules can
// be tested in isolation. The render author replaces this with the full version
// (post-processing, camera modes, grading) keeping the CONTRACT.md API.
import * as THREE from 'three';

export function create(ctx) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const canvas = renderer.domElement;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x10272b, 0.02);
  scene.background = new THREE.Color(0x10272b);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400);
  camera.position.set(0.9, 2.3, 4.6);
  camera.lookAt(0, 0.6, -8);
  const raycaster = new THREE.Raycaster();
  const v = new THREE.Vector3();

  return {
    renderer, scene, camera, canvas,
    init() {},
    update() {
      if (scene.background && scene.fog) scene.background.copy(scene.fog.color);
    },
    resize(w = innerWidth, h = innerHeight) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < h ? 70 : 55;
      camera.updateProjectionMatrix();
    },
    setQuality() {},
    setGrade() {},
    shake() {},
    flash() {},
    getCameraMode() { return 'fish'; },
    projectToScreen(vec) {
      v.copy(vec).project(camera);
      return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, visible: v.z < 1 && v.z > -1 };
    },
    raycast(ndc, objects, recursive = true) {
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(objects, recursive);
    },
    render() { renderer.render(scene, camera); },
  };
}

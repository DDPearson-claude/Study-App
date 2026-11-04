// render.js — BASELINE (integrator). Minimal renderer + follow camera so other modules
// can be tested. The render author replaces this with the full version.
import * as THREE from 'three';
import { damp } from './core.js';

export function create(ctx) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x10272b, 0.02);
  scene.background = new THREE.Color(0x10272b);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 500);
  const raycaster = new THREE.Raycaster();
  const v = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let mode = 'sail';

  return {
    renderer, scene, camera, canvas,
    init() {},
    update(dt) {
      if (scene.background && scene.fog) scene.background.copy(scene.fog.color);
      const p = ctx.player?.position;
      if (p && !ctx.player.isStub) focus.set(damp(focus.x, p.x, 5, dt), 0, damp(focus.z, p.z, 5, dt));
      const night = ctx.survival?.getPhaseInfo?.()?.isNight;
      mode = ctx.flow === 'title' ? 'title' : night ? 'night' : 'sail';
      const back = mode === 'night' ? 16 : 13, up = mode === 'night' ? 12 : 9;
      camera.position.set(focus.x, up, focus.z + back);
      camera.lookAt(focus.x, 0.5, focus.z - 2);
    },
    resize(w = innerWidth, h = innerHeight) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < h ? 68 : 50;
      camera.updateProjectionMatrix();
    },
    setQuality() {}, setGrade() {}, shake() {}, flash() {},
    getCameraMode() { return mode; },
    getYaw() { return 0; },
    projectToScreen(vec) {
      v.copy(vec).project(camera);
      return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, visible: v.z < 1 && v.z > -1 };
    },
    raycast(ndc, objects, recursive = true) {
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(objects, recursive);
    },
    groundPoint(ndc, y = 0) {
      raycaster.setFromCamera(ndc, camera);
      plane.constant = -y;
      const out = new THREE.Vector3();
      return raycaster.ray.intersectPlane(plane, out) ? out : null;
    },
    render() { renderer.render(scene, camera); },
  };
}

import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { ImprovedNoise } from "jsm/math/ImprovedNoise.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer();
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const texLoader = new THREE.TextureLoader();
const Noise = new ImprovedNoise();

function getPointsObj() {
  const planeGeo = new THREE.PlaneGeometry(11, 11, 48, 48);
  const geo = new THREE.BufferGeometry();
  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    map: texLoader.load("./circle.png"),
    alphaTest: 0.5,
    transparent: true,
  });
  const pointsObj = new THREE.Points(geo, mat);

  const coords = planeGeo.attributes.position;
  let colors = [];
  let col = new THREE.Color();
  const p = new THREE.Vector3();
  const nScale = 0.5;
  const zPosScale = 1.5;
  const lowColor = new THREE.Color(0.0, 0, 0.8);
  const highColor = new THREE.Color(1.5, 1.5, 1.5);
  function update(t) {
    let ns;
    colors = [];
    for (let i = 0; i < coords.count; i += 1) {
      p.fromBufferAttribute(coords, i);
      ns = Noise.noise(p.x * nScale, p.y * nScale, t);
      p.z = ns * zPosScale;
      coords.setXYZ(i, p.x, p.y, p.z);
      col.lerpColors(lowColor, highColor, ns * 1.5);
      let { r, g, b } = col;
      colors.push(r, g, b);
    }
    geo.setAttribute("position", coords);
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    coords.needsUpdate = true;
  }
  pointsObj.userData = { update };
  return pointsObj;
}

const points = getPointsObj();
scene.add(points);

const timeMult = 0.0005;
function animate(t = 0) {
  requestAnimationFrame(animate);
  points.userData.update(t * timeMult);
  controls.update();
  renderer.render(scene, camera);
}
animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);

// TODO 2024:
// use instanced geo instead of points
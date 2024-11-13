import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// initialize points
const gridSize = 32;
const gap = 0.16;
const coords = [];
const colors = [];
const points = [];
let x;
let y;
let z = 0;
let r;
let g;
let b;
let point = {
  position: {},
  rate: 0.0,
};
for (let i = -gridSize; i < gridSize; i += 1) {
  for (let j = -gridSize; j < gridSize; j += 1) {
    x = i * gap;
    y = j * gap;
    r = Math.random();
    g = Math.random();
    b = Math.random();
    point = {
      position: {
        x,
        y,
        z,
      },
      color: new THREE.Color(r, g, b),
    };

    points.push(point);
    coords.push(x, y, z);
    colors.push(r, g, b);
  }
}

// points
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
const mat = new THREE.PointsMaterial({ size: 0.31, vertexColors: true });
const pointsObj = new THREE.Points(geo, mat);
const Noise = new ImprovedNoise();

function updatePoints(t) {
  const coords = [];
  const cols = [];
  let ns;
  const nScale = 0.5;
  const zPosScale = 1.5;
  const lowColor = new THREE.Color(0.0, 0, 0.8);
  const highColor = new THREE.Color(1.5, 1.5, 1.5);
  points.forEach((p, i) => {
    ns = Noise.noise(p.position.x * nScale, p.position.y * nScale, t);
    p.position.z = ns * zPosScale;
    p.color.lerpColors(lowColor, highColor, ns * 1.5);
    let { r, g, b } = p.color;
    cols.push(r, g, b);
    let {x, y, z } = p.position;
    coords.push(x, y, z);
  });
  geo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
}
scene.add(pointsObj);

const timeMult = 0.0005;
function animate(timeStep) {
  requestAnimationFrame(animate);
  updatePoints(timeStep * timeMult);
  renderer.render(scene, camera);
}
// START!
animate(0);

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);

// TODO 2024:
// use instanced geo instead of points
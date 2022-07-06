import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { ImprovedNoise } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 2;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// okabe
const colors = [];
let col;
const planeGeo = new THREE.PlaneGeometry(2, 2, 30, 30);
const planeMat = new THREE.MeshBasicMaterial({
  vertexColors: true
});
const plane = new THREE.Mesh(planeGeo, planeMat);

let positions = planeGeo.attributes.position.array;
let len = positions.length;
for (let i = 0; i < len; i += 1) {
  // randomize the *z* position only
  if (i % 3 === 2) {
    positions[i] += Math.random() * 0.2;
    col = new THREE.Color(
      positions[i] * 4,
      positions[i] * 4,
      positions[i] * 12
    );
    colors.push(col.r, col.g, col.b);
  }
}
scene.add(plane);

const Noise = new ImprovedNoise();
function updatePoints(t) {
  let ns;
  const coords = [];
  const colors = [];
  let col;
  const lowColor = new THREE.Color(0, 0, 0.8);
  const highColor = new THREE.Color(1.5, 1.5, 1.5);

  let positions = planeGeo.attributes.position.array;
  let len = positions.length;
  let noiseMagnitude = 0.5;
  let noiseFrequency = 2;
  for (let i = 0; i < len; i += 1) {
    // randomize the *z* position only
    if (i % 3 === 2) {
      ns = Noise.noise(positions[i - 2] * noiseFrequency, positions[i - 1] * noiseFrequency, t);
      positions[i] = ns * noiseMagnitude;
      col = new THREE.Color().lerpColors(lowColor, highColor, ns);
      coords.push(positions[i - 2], positions[i - 1], positions[i]);
      colors.push(col.r, col.g, col.b);
    }
  }
  planeGeo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
  planeGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
}

const timeMult = 0.001;
function animate(timeStamp) {
  requestAnimationFrame(animate);
  updatePoints(timeStamp * timeMult);
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

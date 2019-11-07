import * as Three from "../node_modules/three/build/three.module.js";

const canvas = document.querySelector("#app");
const renderer = new Three.WebGLRenderer({ canvas });

//Camera
const cameraOption = {
  fov: 70,
  aspect: 2,
  near: 0.1,
  far: 5
};
const { fov, aspect, near, far } = cameraOption;
const camera = new Three.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

//Light
const lightOption = {
  color: 0xffffff,
  intensity: 0.9,
  position: {
    x: -1,
    y: 2,
    z: 4
  }
};

const {
  color,
  intensity,
  position: { x, y, z }
} = lightOption;
const light = new Three.DirectionalLight(color, intensity);
light.position.set(x, y, z);

const boxOptions = {
  width: 1,
  height: 1,
  depth: 1
};
const { width, height, depth } = boxOptions;
const box = new Three.BoxGeometry(width, height, depth);

function makeColoredMesh(geometry, color) {
  const material = new Three.MeshPhongMaterial({ color });
  const mesh = new Three.Mesh(geometry, material);
  return mesh;
}

const cube1 = makeColoredMesh(box, 0xffb72a);
const cube2 = makeColoredMesh(box, 0x61baff);
const cube3 = makeColoredMesh(box, 0x48FF4C);
cube2.position.x = -2
cube3.position.x = 2
//Scene;
const scene = new Three.Scene();
scene.add(light);
scene.add(cube1);
scene.add(cube2);
scene.add(cube3);

renderer.render(scene, camera);

function animate(time) {
  const second = time * 0.001;
  cube1.rotation.x = second;
  cube1.rotation.y = second;
  cube2.rotation.x = second + 100;
  cube2.rotation.y = second + 100;
  cube3.rotation.x = second - 100;
  cube3.rotation.y = second - 100;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

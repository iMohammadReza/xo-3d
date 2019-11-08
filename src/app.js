import * as Three from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";

function init() {
  const canvas = document.querySelector("#app");
  const renderer = new Three.WebGLRenderer({ canvas });
  const scene = new Three.Scene();
  const loader = new Three.TextureLoader();

  return {
    renderer,
    scene,
    loader
  };
}
function createCamera() {
  const fov = 345;
  const aspect = 2;
  const near = 0.1;
  const far = 200;
  const camera = new Three.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, -5, 20);
  camera.lookAt(0, 0, 0);
  return camera;
}

function createLight() {
  const color = 0xffffff;
  const intensity = 2;
  const light = new Three.DirectionalLight(color, intensity);
  light.position.set(1, 1, 1).normalize();
  return light;
}
function makeFollower(follower, followed) {
  return function followe() {
    follower.position.copy(followed.position);
  };
}

function createCubeMaterial(texture) {
  return function() {
    const randColor = Math.random() * 0xffffff;
    const material = new Three.MeshPhongMaterial({
      color: randColor,
      map: texture,
      transparent: true,
      side: Three.DoubleSide,
      alphaTest: 0.1
    });
    return material;
  };
}

function createCube(material) {
  const box = new Three.BoxGeometry(1, 1, 1);
  const mesh = new Three.Mesh(box, material);
  return mesh;
}
function createBigCube(createMaterial) {
  const bigCube = new Three.Object3D();
  bigCube.position.set(0, 0, 0);
  for (let i = 0; i < 3; i++) {
    const row = new Three.Object3D();
    for (let j = 0; j < 9; j++) {
      const tinyCube = createCube(createMaterial());
      const x = (j % 3) - 1;
      const y = 0;
      const z = parseInt(j / 3)-1;
      tinyCube.position.set(x, y, z);
      row.add(tinyCube);
    }
    row.position.set(0, i-1, 0);
    bigCube.add(row);
  }
  return bigCube;
}

function intractivity() {
  const mouse = new Three.Vector2(-1000, -1000);
  let isDragging = false;
  let isMouseDown = false;
  function setMouseCoordinates(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  function onMouseClick(event) {
    if (!isDragging) {
      setMouseCoordinates(event);
      // new vector generated so new intersects show calculate
      shouldCastRay = true;
    }
    // mouse clicked, so mouse button is not down
    // we not dragging anymore because mouse is not down
    isMouseDown = false;
    isDragging = false;
  }
  window.addEventListener("click", onMouseClick);
  window.addEventListener("mousedown", function() {
    isMouseDown = true;
  });

  let debounceId;
  let prevX = 0;
  let prevY = 0;
  function onMouseMove(event) {
    const deltaX = Math.abs(event.x - prevX);
    const deltaY = Math.abs(event.y - prevY);
    if (isMouseDown) {
      prevX = event.x;
      prevY = event.y;
    }
    // deltaX and deltaY used because click may have slightly movement
    if (deltaX < 10 && deltaY < 10 && isMouseDown) {
      isDragging = true;
    }
    //debouncing set isDragging to false prevent seting mouse coordinates on mouse up after drag
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      if (!isMouseDown) {
        isDragging = false;
      }
    }, 0);
  }
  window.addEventListener("mousemove", onMouseMove);
  return mouse;
}
//Scene;

function fitToDisplay(renderer, camera) {
  function resizeRendererToDisplaySize() {
    const appElement = renderer.domElement;
    const width = appElement.clientWidth;
    const height = appElement.clientHeight;
    const needResize =
      appElement.width !== width || appElement.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  function setCameraAspectToDisplayAspect() {
    const appElement = renderer.domElement;
    const width = appElement.clientWidth;
    const height = appElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resizeRendererToDisplaySize();
  setCameraAspectToDisplayAspect();
}

const { renderer, scene, loader } = init();

const camera = createCamera();
const light = createLight();
scene.add(camera);
scene.add(light);
const controls = new OrbitControls(camera, renderer.domElement);
const follow = makeFollower(light, camera);
controls.addEventListener("change", follow);
const texture = loader.load("../public/assets/frame.png");
const bigCube = createBigCube(createCubeMaterial(texture));
const tinyCubes = bigCube.children.reduce((result,row) => {
  return result.concat(row.children)
},[])
scene.add(bigCube);
const mouse = intractivity();

let intersected, shouldCastRay;
function checkIntersects(objects, rayCaster) {
  console.log(objects)
  const intersects = rayCaster.intersectObjects(objects);
  function resetPrevColor() {
    if (intersected) {
      intersected.material.color.setHex(intersected.prevColor);
    }
  }
  function selectIntersectedObject() {
    intersected = intersects[0].object;
    intersected.prevColor = intersected.material.color.getHex();
    intersected.material.color.setHex(0xfffffff);
  }
  const isIntersectedToAnyObjects = intersects.length > 0;
  if (isIntersectedToAnyObjects) {
    const isIntersectToSameObject = intersected === intersects[0].object;
    if (isIntersectToSameObject) return;
    resetPrevColor();
    selectIntersectedObject();
  } else {
    resetPrevColor();
    intersected = undefined;
  }
  shouldCastRay = false;
}

const rayCaster = new Three.Raycaster();
function render() {
  requestAnimationFrame(render);
  fitToDisplay(renderer, camera);
  controls.update();

  if (shouldCastRay) {
    rayCaster.setFromCamera(mouse, camera);

    checkIntersects(tinyCubes, rayCaster);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(render);

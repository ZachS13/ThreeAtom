/**
 * This file creates 2 cubes next to each other, running the same spinning animation. One cube uses the mesh basic
 * material and is set to be a wireframe. Using the same geometry cube shape, the second cube uses the mesh standard
 * material to appear metalic. Since we are making a standard metalic material we are going to need a light source.
 */

// import * as THREE from 'three';
import * as THREE from '../node_modules/three/build/three.module.js';


// Scene - Background is defaultly black.
const scene = new THREE.Scene();

// Change the background to something other than black, here is a light grey background
scene.background = new THREE.Color(0xefefef);

/**
 * Camera - takes in 4 parameters (FOV, Aspect, Near, Far)
 *      FOV     - Number from 1-180, typically 45-90 is used
 *      Aspect  - Width / Height of the screen to ensure no warping
 *      Near    - How close to the camera will things be rendered, use a larger number for distant scenes,
 *                typically 0.1 will be used for most scenes.
 *      Far     - How far from the camera will things be rendered, 1000 is most common can shorten if you know
 *                your scene doesn't contain distant objects.
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Renderer
const renderer = new THREE.WebGLRenderer();
// Set the size of the scene, how big is the rendering going to be.
renderer.setSize(window.innerWidth, window.innerHeight);
// Append the renderer to the DOM.
document.body.appendChild(renderer.domElement);

// MAKING A SIMPLE CUBE
/**
 * Cube - Can take up to 6 parameters
 *      Length, Width, Depth - Measured in units, units are arbitrary and should be set before beginning a project.
 *      L..Segments, W..Segments, D..Segments - How many segments per side, the more the more detail that can be added
 *                                              later.
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);

/**
 * Material - A basic material is something like a color, you can pass in transparency, opacity, color, wireframe, etc.
 *          - A standard material (MeshStandardMaterial) you can pass in an emissive parameter to add a glow to the material.
 *            Roughness and metalness can also be added for more effects.
 *          - A phong material (MeshPhongMaterial) you can add a shininess parameter.
 *          - A lambert material (MeshLambertMaterial) can be used for more simple lighting and making the rendering less computationally
 *            expensive.
 * Texture - You can create a texture material (TextureLoader), something other than a color, add add a bumpMap and bumpScale to
 *           either standard and phong materials.
 */
const material = new THREE.MeshBasicMaterial({ color: 0xADD8E6, wireframe: true });
const cube = new THREE.Mesh(geometry, material);

// Move the cube to the left before making the other cube
cube.position.set(-1, 0, 0);
scene.add(cube);


// MAKING A METALIC CUBE
// Make a new cube to add to the scene.
const metalMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFFF,
    metalness: 0.75,
    roughness: 0.45
});

// Add the new material to a new cube.
const metalCube = new THREE.Mesh(geometry, metalMaterial);

// Move the metalic cube to the right
metalCube.position.set(1, 0, 0);
scene.add(metalCube);

// Using MeshStandardMaterial, a light source is needed.
const directionalLight = new THREE.DirectionalLight(0xFFFFED, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    metalCube.rotation.x += 0.01;
    metalCube.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();

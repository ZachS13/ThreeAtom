// import * as THREE from 'three';
import * as THREE from '../node_modules/three/build/three.module.js';

/**
 * Creates the nucleus of the atom with protons (red) and neutrons (blue).
 * @param {Integer} protons - Number of protons in the nucleus
 * @param {Integer} neutrons - Number of neutrons in the nucleus
 * @returns {THREE.Group} A group containing the nucleus particles
 */
function createNucleus(protons, neutrons) {
    const nucleusGroup        = new THREE.Group(),                                                // Group holding the nucleus.
          numParticles        = protons + neutrons,                                               // Number of spheres we need to make.
          nucleusSphereRadius = 1.75,                                                             // This can change depending on how large we want the atom.
          efficiency          = 0.33,                                                             // Efficiency rating of FCC packing is 0.76 so half that should be efficient enough.
          nucleusSphereVolume = (4 / 3) * Math.PI * Math.pow(nucleusSphereRadius, 3),             // Figure our the radius of the outer sphere.
          usableVolume        = efficiency * nucleusSphereVolume,                                 // How much of the container sphere's volume will be used.
          particleVolume      = usableVolume / numParticles,                                      // What is the volume of a particle.
          particleRadius      = Math.cbrt((3 / (4 * Math.PI)) * particleVolume),                  // Radius of a particle.
          GREEN               = 0x008000,                                                         // Hex code for the color green.
          LIGHT_BLUE          = 0xADD8E6,                                                         // Hex code for the color light blue.
          spacing             = 1.8 * particleRadius;                                             // Distance between each particle.
    let   particlesPlaced     = 0;                                                                // How many have been placed inside the nucleus.

    console.log(particleRadius, particleRadius * numParticles, usableVolume);

    let allPlaced = false;

    // Create and shuffle the color array
    const colors = Array(neutrons).fill(LIGHT_BLUE)
        .concat(Array(protons).fill(GREEN))
        .sort(() => Math.random() - 0.5); // Randomize the order of colors

    // Iterate through 3D grid
    for (let x = -nucleusSphereRadius; x <= nucleusSphereRadius && !allPlaced; x += spacing) {
        for (let y = -nucleusSphereRadius; y <= nucleusSphereRadius && !allPlaced; y += spacing) {
            for (let z = -nucleusSphereRadius; z <= nucleusSphereRadius && !allPlaced; z += spacing) {
                const position = new THREE.Vector3(x, y, z);

                // Check if position is inside the nucleus sphere
                if (position.length() + particleRadius <= nucleusSphereRadius) {
                    const color = colors[particlesPlaced],
                          particleGeometry = new THREE.SphereGeometry(particleRadius, 16, 16),
                          particleMaterial = new THREE.MeshBasicMaterial({ color: color }),
                          particle = new THREE.Mesh(particleGeometry, particleMaterial);
                    particle.position.copy(position);
                    nucleusGroup.add(particle);

                    particlesPlaced++;
                    if (particlesPlaced >= numParticles) {
                        allPlaced = true;
                        break;
                    }
                }
            }
        }
    }

    console.log(particlesPlaced);

    // Add the transparent boundary sphere
    const nucleusGeometry = new THREE.SphereGeometry(nucleusSphereRadius, 32, 32),
        nucleusMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: false,
            opacity: 0.2,
            transparent: true,
        }),
        nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    nucleusGroup.add(nucleus);

    console.log(`There will be ${protons} green spheres in the nucleus and ${neutrons} light blue spheres.`);

    return nucleusGroup;
}

/**
 * Creates orbiting electrons for an atom, each in a unique 3D plane.
 * @param {Integer} electrons - Number of electrons orbiting the nucleus
 * @returns {THREE.Group} A group containing the electrons
 */
function createOrbitingElectrons(electrons) {
    const electronGroup = new THREE.Group();

    function createElectron() {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        return new THREE.Mesh(geometry, material);
    }

    const shells = [2, 8, 18, 32];
    const shellDistances = [2, 3, 5, 7];

    let electronIndex = 0;

    for (let shellIndex = 0; shellIndex < shells.length; shellIndex++) {
        const maxElectronsInShell = shells[shellIndex];
        const shellDistance = shellDistances[shellIndex];

        for (let i = 0; i < maxElectronsInShell && electronIndex < electrons; i++) {
            const angle = (i / maxElectronsInShell) * Math.PI * 2; // Evenly distribute electrons

            const electron = createElectron();

            // Randomly orient the plane of orbit
            const tiltAxis = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize(); // Random tilt axis
            const tiltAngle = Math.random() * Math.PI; // Random tilt angle

            // Store the electron's orbital data for animation
            electron.userData = {
                angle, // Initial angle
                shellDistance, // Orbital distance
                tiltAxis, // Axis of tilt
                tiltAngle // Angle of tilt
            };

            // Position the electron initially (in 3D tilted orbit)
            const x = Math.cos(angle) * shellDistance;
            const y = Math.sin(angle) * shellDistance;
            const z = 0;

            // Apply the tilt
            const tiltedPosition = new THREE.Vector3(x, y, z).applyAxisAngle(
                tiltAxis,
                tiltAngle
            );
            electron.position.copy(tiltedPosition);

            electronGroup.add(electron);
            electronIndex++;
        }

        if (electronIndex >= electrons) break;
    }

    return electronGroup;
}

/**
 * Combines nucleus and orbiting electrons to create a full atom.
 * @param {Integer} protons - Number of protons in the nucleus
 * @param {Integer} neutrons - Number of neutrons in the nucleus
 * @param {Integer} electrons - Number of electrons orbiting the nucleus
 * @returns {THREE.Group} A group containing the full atom
 */
function createAtom(protons, neutrons, electrons) {
    const atomGroup = new THREE.Group();

    const nucleus = createNucleus(protons, neutrons);
    atomGroup.add(nucleus);

    const orbitingElectrons = createOrbitingElectrons(electrons);
    atomGroup.add(orbitingElectrons);

    return atomGroup;
}

// Initialize the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9a9a9);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Create the atom and add it to the scene
const protons = 8; // Oxygen
const neutrons = 8;
const electrons = 8;

const atom = createAtom(protons, neutrons, electrons);
scene.add(atom);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Animate electrons
    const orbitingElectrons = atom.children[1];
    orbitingElectrons.children.forEach(electron => {
        // Update the angle for animation
        const { angle, shellDistance, tiltAxis, tiltAngle } = electron.userData;
        electron.userData.angle += 0.05; // Adjust speed for orbiting

        // Calculate new position
        const x = Math.cos(electron.userData.angle) * shellDistance;
        const y = Math.sin(electron.userData.angle) * shellDistance;
        const z = 0;

        // Apply the tilt to create a 3D orbit
        const tiltedPosition = new THREE.Vector3(x, y, z).applyAxisAngle(
            tiltAxis,
            tiltAngle
        );

        // Update the electron's position
        electron.position.copy(tiltedPosition);
    });

    //animate the nucleus to spin
    const nucleus = atom.children[0];
    nucleus.rotation.x += 0.025;
    nucleus.rotation.y += 0.025;

    renderer.render(scene, camera);
}
animate();

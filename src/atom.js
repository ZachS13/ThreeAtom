// import * as THREE from 'three';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { periodicTable } from './data.js';

/**
 * This is from the periodic-table library, but was not working so we took their data.json and changed it to
 * data.js to return the array, then reduced the table to be able to use the atomic number to find the element.
 */
const ATOMIC_NUMBERS = periodicTable().reduce(function (obj, element) {
    obj[element.atomicNumber] = element;
    return obj;
}, {});

/**
 * This will make the periodic table to select what element to display.
 */
function createPeriodicTable() {
    const periodicTableDiv = document.getElementById(`periodicTable`),
          table = document.createElement(`table`);

    // The layout of the periodic table with each number representing the atomic number of the element. Was there an easier way? Probably.
    const tableLayout = [
        [1 , "", "", "" , "" , "" , "" , "" , "" , "" , "" , "" , "" , "" , "" , "" , "" , 2  ], 
        [3 , 4 , "", "" , "" , "" , "" , "" , "" , "" , "" , "" , 5  , 6  , 7  , 8  , 9  , 10 ],      
        [11, 12, "", "" , "" , "" , "" , "" , "" , "" , "" , "" , 13 , 14 , 15 , 16 , 17 , 18 ], 
        [19, 20, 21, 22 , 23 , 24 , 25 , 26 , 27 , 28 , 29 , 30 , 31 , 32 , 33 , 34 , 35 , 36 ], 
        [37, 38, 39, 40 , 41 , 42 , 43 , 44 , 45 , 46 , 47 , 48 , 49 , 50 , 51 , 52 , 53 , 54 ], 
        [55, 56, "", 72 , 73 , 74 , 75 , 76 , 77 , 78 , 79 , 80 , 81 , 82 , 83 , 84 , 85 , 86 ],
        [87, 88, "", 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
        ["", "", 57, 58 , 59 , 60 , 61 , 62 , 63 , 64 , 65 , 66 , 67 , 68 , 69 , 70 , 71 , "" ],
        ["", "", 89, 90 , 91 , 92 , 93 , 94 , 95 , 96 , 97 , 98 , 99 , 100, 101, 102, 103, "" ]
    ];

    // Make the table of the elements with all of the boxes clickable 
    // Periodic table is 7x18 with a 2x14 missing section (58-71, 90-103)
    tableLayout.forEach( (rowLayout) => {
        const row = document.createElement(`tr`);
        rowLayout.forEach( (atomicNumber) => {
            const cell = document.createElement(`td`);
            if(atomicNumber !== "") {
                const element = ATOMIC_NUMBERS[atomicNumber];
                let information = `<div class='eleInfo'><i>${element.name}</i></br>
                                   <strong>${element.symbol}</strong></br>
                                   <small>${element.atomicNumber}</small></div>`;
                cell.innerHTML = information;
                cell.onclick = () => selectElement( element );
            } else {
                cell.classList.add(`empty`);
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
    periodicTableDiv.appendChild(table);
}

/**
 * This will take the selected element and pass it into the createAtom function to display the selected atom.
 * @param {Object} element - Element holds all of the information about the amount on protons, neutrons, and electrons.
 */
function selectElement(element) {
    const parts = getParticles(element);
    console.log(parts);

    const atom = createAtom(parts.protons, parts.neutrons, parts.electrons);
    makeSceneWithAtom(atom);
    displayElementInformation(element);
}

function displayElementInformation(element) {
    const infoDiv = document.getElementById(`atomInfo`);
    infoDiv.innerHTML = '';

    console.log(element);

    let title = document.createElement(`h2`);
    title.innerHTML = `${element.symbol} - ${element.name}`;

    let description = document.createElement(`p`);
    description.innerHTML = `Standard State: ${element.standardState}<br>Bonding Type: ${element.bondingType}
                        <br>Atomic Mass: ${element.atomicMass}`;

    infoDiv.appendChild(title);
    infoDiv.appendChild(description);   
}

/**
* Will take the element object that was in the periodic-table library and break apart and figure out the
 * number of protons, neutrons, and electrons.
 * Number of protons = atomicNumber. 
 * Number of electrons = atomicNumber (were assuming element is neutral). 
 * @param {Object} element - Selected element you want to get protons, neutrons, and electrons for.
 * @returns Contains values protons, neutrons, electrons with their coresponding number.
 */
function getParticles(element) {
    const massString = element.atomicMass;
    let mass = 0;
    if (typeof massString === 'string') {
        mass = parseFloat(massString.split('(')[0]);
    } else {
        mass = parseFloat(massString);
    }
    const numProtons = parseInt(element.atomicNumber),
          numElectrons = parseInt(element.atomicNumber),
          numNeutrons = Math.round( mass - numProtons );
    const numParts = {
        protons: numProtons,
        neutrons: numNeutrons,
        electrons: numElectrons
    };
    return numParts;
}

const GREEN = 0x008000,           // Hex code for the color green.
      LIGHT_BLUE = 0xADD8E6,      // Hex code for the color light blue.
      RED = 0xFF0000;             // Hex code for the color red.

/**
 * Creates the nucleus of the atom with protons (red) and neutrons (blue).
 * @param {Integer} protons - Number of protons in the nucleus
 * @param {Integer} neutrons - Number of neutrons in the nucleus
 * @returns {THREE.Group} A group containing the nucleus particles
 */
function createNucleus(protons, neutrons) {
    const nucleusGroup = new THREE.Group(),
          numParticles = protons + neutrons,                                            // Total number of particles.
          nucleusSphereRadius = 3,                                                      // Fixed nucleus size.
          packingEfficiency = 0.5,                                                      // Efficiency of HCP
          nucleusVolume = (4 / 3) * Math.PI * Math.pow(nucleusSphereRadius, 3),         // Volume of the nucleus
          usableVolume = nucleusVolume * packingEfficiency,                             // How much of the Volume will be useable.

          particleVolume = usableVolume / Math.max(1, numParticles),                    // How large are the particles
          particleRadius = Math.cbrt((3 / (4 * Math.PI)) * particleVolume),             // Particle radius

          spacing = numParticles <= 13 ? particleRadius * 0.9 : particleRadius * 1.2;  // Spacing between each particle (allowed colliding for better packing)

    // Instead of placing one group of colors then the next we are going to place them
    // in one array and shuffle.
    const colors = Array(neutrons).fill(LIGHT_BLUE)
        .concat(Array(protons).fill(GREEN))
        .sort(() => Math.random() - 0.5);

    let particlesPlaced = 0;

    // Adjust bounds dynamically for low particle counts.
    const boundsFactor = numParticles <= 13 ? 1.75 : 1.2;

    // Particle was not being placed for hydrgen (1 particle in the nucleus)
    if(numParticles === 1) {
        let oneParticleRadius = nucleusSphereRadius;
        const color = GREEN,
              particleGeometry = new THREE.SphereGeometry(oneParticleRadius, 16, 16),
              particleMaterial =  new THREE.MeshStandardMaterial({ color: color }),
              particle = new THREE.Mesh(particleGeometry, particleMaterial);
        nucleusGroup.add(particle);
        particlesPlaced++;
    } else {
        // HCP Placement Logic.
        for (let z = -nucleusSphereRadius * boundsFactor; z <= nucleusSphereRadius * boundsFactor; z += spacing * Math.sqrt(2 / 3)) {
            const isOddLayer = Math.round(z / (spacing * Math.sqrt(2 / 3))) % 2 === 0;

            for (let y = -nucleusSphereRadius * boundsFactor; y <= nucleusSphereRadius * boundsFactor; y += spacing) {
                const rowOffset = isOddLayer ? spacing / 2 : 0;

                for (let x = -nucleusSphereRadius * boundsFactor; x <= nucleusSphereRadius * boundsFactor; x += spacing * Math.sqrt(3)) {
                    const position = new THREE.Vector3(x + rowOffset, y, z);

                    // Check if the particle fits inside the nucleus sphere.
                    if (position.length() + particleRadius <= nucleusSphereRadius) {
                        const color = colors[particlesPlaced],
                              particleGeometry = new THREE.SphereGeometry(particleRadius, 16, 16),
                              particleMaterial = new THREE.MeshStandardMaterial({ color: color }),
                              particle = new THREE.Mesh(particleGeometry, particleMaterial);

                        particle.position.copy(position);
                        nucleusGroup.add(particle);

                        particlesPlaced++;
                        if (particlesPlaced >= numParticles) { break };
                    }
                }
                if (particlesPlaced >= numParticles) { break };
            }
            if (particlesPlaced >= numParticles) { break };
        }
    }

    // Add a transparent boundary sphere for visualization.
    const nucleusBoundaryGeometry = new THREE.SphereGeometry(nucleusSphereRadius, 32, 32),
          nucleusBoundaryMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,        // If viewing the wire frame change this to white
                wireframe: false,       // Change this to true to view the nucleus ball
                opacity: 0.1,
                transparent: true,
    });
    const nucleusBoundary = new THREE.Mesh(nucleusBoundaryGeometry, nucleusBoundaryMaterial);
    nucleusGroup.add(nucleusBoundary);

    console.log(`Nucleus created with ${particlesPlaced} particles out of ${numParticles}`);

    return nucleusGroup;
}

/**
 * Creates orbiting electrons for an atom, each in a unique 3D plane.
 * @param {Integer} electrons - Number of electrons orbiting the nucleus
 * @returns {THREE.Group} A group containing the electrons
 */
function createOrbitingElectrons(electrons) {
    const electronGroup = new THREE.Group();

    const shells = [2, 8, 18, 32];          // How many electrons go in each shell
    const shellDistances = [3, 5, 7, 9];    // Distance from the center / nucleus

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
            ).normalize();                              // Random tilt axis
            const tiltAngle = Math.random() * Math.PI;  // Tilt the electron randomly

            // Store the data for animation.
            electron.userData = {
                angle,          // Initial angle
                shellDistance,  // Orbital distance
                tiltAxis,       // Axis of tilt
                tiltAngle       // Angle of tilt
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
 * Creates electron ball
 * @returns {THREE.Mesh} ThreeJS ball that is returned
 */
function createElectron() {
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: RED });
    const electron = new THREE.Mesh(geometry, material);
    return electron;
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

function makeSceneWithAtom(atom) {
    // Make a new scene and make the background color a dark grey.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0e0e);

    /**
     * Camera - takes in 4 parameters (FOV, Aspect, Near, Far)
     *      FOV     - Number from 1-180, typically 45-90 is used
     *      Aspect  - Width / Height of the screen to ensure no warping
     *      Near    - How close to the camera will things be rendered, use a larger number for distant scenes,
     *                typically 0.1 will be used for most scenes.
     *      Far     - How far from the camera will things be rendered, 1000 is most common can shorten if you know
     *                your scene doesn't contain distant objects.
     */
    const halfWdith = window.innerWidth / 2,
          halfHeight = window.innerHeight / 2,
          camera = new THREE.PerspectiveCamera(75, (halfWdith / halfHeight), 0.1, 1000);
    camera.position.z = 15;

    // Make the renderer and append it to the DOM.
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(halfWdith, halfHeight);
    const renderDiv = document.getElementById(`atomRender`);
    renderDiv.innerHTML = '';
    renderDiv.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight); 

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3 );
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add the atom to the screen
    scene.add(atom);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        //animate the nucleus to spin
        const nucleus = atom.children[0];
        nucleus.rotation.x += 0.025;
        nucleus.rotation.y += 0.025;

        // Animate electrons
        const orbitingElectrons = atom.children[1];
        orbitingElectrons.children.forEach(electron => {
            // Update the angle for animation
            const { angle, shellDistance, tiltAxis, tiltAngle } = electron.userData;
            electron.userData.angle += 0.05; // Adjust speed for orbiting

            // Calculate new position
            const x = Math.cos(electron.userData.angle) * shellDistance,
                  y = Math.sin(electron.userData.angle) * shellDistance,
                  z = 0;

            // Apply the tilt to create a 3D orbit
            const tiltedPosition = new THREE.Vector3(x, y, z).applyAxisAngle(
                tiltAxis,
                tiltAngle
            );

            // Update the electron's position
            electron.position.copy(tiltedPosition);
        });

        renderer.render(scene, camera);
    }
    animate();
}

createPeriodicTable();
/**
 * This file creates a rendering of an atom with orbiting electrons. We will also use the
 * periodic table library to help get the elements from the table. We will make a table containing
 * every element.
 */

// import * as THREE from 'three';
import * as THREE from '../node_modules/three/build/three.module.js';
import * as PT from 'periodic-table';

function buildPeriodicTable() {

}


/**
 * Takes the selected element and with it's atomic number, we're going to display that specific atom.
 * @param { Integer } atomicNumber - Atomic Number of the element.
 * @returns { THREE.Group } - Calls and returns createAtom which returs the THREE.Group.
 */
function selectElement( atomicNumber ) {
    const atom = PT.numbers[atomicNumber],
          parts = numberOfProtonsNeutronsElectrons(atom);
    return createAtom(parts.protons, parts.neutrons, parts.electrons);
}

/**
 * Will take the element object that was in the periodic-table library and break apart and figure out the
 * number of protons, neutrons, and electrons.
 * Number of protons = atomicNumber. 
 * Number of electrons = atomicNumber (were assuming element is neutral). 
 * Number of neutrons = mass - protons. 
 * @param { Object } element - Element you are trying to get the protons, nuetrons, and electrons from. 
 * @returns { Object } Contains values protons, neutrons, electrons with their coresponding number.
 */
function numberOfProtonsNeutronsElectrons( element ) {
    const mass = parseFloat(element.atomicMass.split('(')[0]),
          numProtons = element.atomicNumber,
          numElectrons = element.atomicNumber,
          numNeutrons = Math.round( mass - numProtons );
    const numParts = {
        protons: numProtons,
        neutrons: numNeutrons,
        electrons: numElectrons
    };
    return numParts;
}

/**
 * Will make a three group containing the entire atom that will be displayed for the user.
 * @param { Integer } protons - Number of protons in the nucleus.
 * @param { Integer } neutrons - Number of neutrons in the nucleus.
 * @param { Integer } electrons - Number of electrons orbiting the nucleus.
 * @returns { THREE.Group } A group containing all of the particles in the neuclus and orbiting electrons.
 */
function createAtom( protons, neutrons, electrons ) {
    const atomGroup = new THREE.Group(), 
          nucleusGroup = createNucleus( protons, neutrons ),
          electronGorup = createElectrons( electrons );
    atomGroup.add(nucleusGroup);
    atomGroup.add(electronGorup);
    return atomGroup;
}

/**
 * Will create the nucleus of the atom. Will make red spheres for each proton and 
 * blue spheres for each neutron.
 * @param { Integer } protons - The number of protons in the nucleus
 * @param { Integer } neutrons - The number of neutrons in the nucleus
 * @returns { THREE.Group } A group containing the particles in the nucleus.
 */
function createNucleus( protons, neutrons ) {
    const nucleusGroup = new THREE.Group(),                                                // Group holding the nucleus.
          numParticles = protons + neutrons,                                               // Number of spheres we need to make.
          nucleusSphereRadius = 10,                                                        // This can change depending on how large we want the atom.
          efficiency = 0.74,                                                               // Efficiency rating of FCC packing.
          nucleusSphereVolume = (4 / 3) * Math.PI * Math.pow(nucleusSphereRadius, 3),      // Figure our the radius of the outer sphere.
          usableVolume = efficiency * nucleusSphereVolume,                                 // How much of the container sphere's volume will be used.
          particleVolume = usableVolume / numParticles,                                    // What is the volume of a particle.
          particleRadius = Math.cbrt((3 / (4 * Math.PI)) * particleVolume);                // Radius of a particle.
    
    // Generate random positions within the large sphere
    for (let i = 0; i < numParticles; i++) {
        let position;
        let isValid = false;
        while (!isValid) {
            // Get a random position in the sphere.
            const x = (Math.random() * 2 - 1) * nucleusSphereRadius,
                  y = (Math.random() * 2 - 1) * nucleusSphereRadius,
                  z = (Math.random() * 2 - 1) * nucleusSphereRadius;
            position = new THREE.Vector3(x, y, z);

            // Does the particle fit into the nucleus sphere and does it overlap with any other particle.
            if (position.length() + particleRadius > nucleusSphereRadius) {
                isValid = true;
            }
        }

        // Make a particle to place into the group
        const GREEN = 0x008000,
              LIGHT_BLUE = 0XADD8E6,
              particleGeometry = new THREE.SphereGeometry(particleRadius, 16, 16);
        let color = i < neutrons ? LIGHT_BLUE : GREEN;
        const particleMaterial = new THREE.MeshBasicMaterial({ color: color }),
              particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(position);
        nucleusGroup.add(particle);
    }

    // Add the clear sphere to the group.
    const nucleusGeometry = new THREE.SphereGeometry(nucleusSphereRadius, 32, 32),
          nucleusMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }), // Set the wireframe to true to see the boarder of the nucleus.
          nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    nucleusGroup.add(nucleus);          

    console.log(`There will be ${protons} green spheres in the nucleus and ${neutrons} light blue spheres.`);

    return nucleusGroup;
}

/**
 * Will create the electrons that will orbit around the nucleus of the atom.
 * @param { Integer } electrons - Number of electrons oribiting.
 * @returns { THREE.Group } A group containing the orbiting electrons.
 */
function createElectrons( electrons ) {
    const electronGorup = new THREE.Group(),
          YELLOW = 0xFFFF00,
          radius = 0.25;

    for(let i = 0; i < electrons; i++) {
        const elecGeometry = new THREE.SphereGeometry(radius, 6, 6),
              elecMaterial = new THREE.MeshBasicMaterial({ color: YELLOW }),
              electron = new THREE.Mesh(elecGeometry, elecMaterial);
        electronGorup.add(electron);
    }

    console.log(`There are ${electrons} yellow electrons orbiting the nucleus.`);
    return electronGorup;
}

selectElement( 90 );
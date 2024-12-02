// import { elements } from 'periodic-table';
import { elements } from '../node_modules/periodic-table';

console.log(elements);

// Reference the periodic table container
const periodicTableContainer = document.getElementById('periodicTable');

// Create the periodic table
function renderPeriodicTable() {
    // Create a 2D grid layout (7 rows x 18 columns)
    const grid = Array.from({ length: 7 }, () => Array(18).fill(null));

    // Place each element in its correct position
    elements.forEach((element) => {
        const { atomicNumber, symbol, group, period } = element;
        if (group && period) {
            grid[period - 1][group - 1] = element;
        }
    });

    // Render the grid
    grid.forEach((row) => {
        row.forEach((cell) => {
            const div = document.createElement('div');
            if (cell) {
                div.classList.add('element');
                div.textContent = cell.symbol;
                div.title = `${cell.name} (Atomic Number: ${cell.atomicNumber})`;
                div.onclick = () => selectElement(cell.atomicNumber);
            } else {
                div.classList.add('empty');
            }
            periodicTableContainer.appendChild(div);
        });
    });
}

// Function to handle element selection
function selectElement(atomicNumber) {
    alert(`You selected element with atomic number: ${atomicNumber}`);
}

// Render the table
renderPeriodicTable();

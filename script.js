document.addEventListener('DOMContentLoaded', () => {
    const gardenContainer = document.getElementById('garden-container');
    const flowerSelectionBar = document.getElementById('flower-selection-bar');
    const messageInputModal = document.getElementById('message-input-modal');
    const messageInputArea = document.getElementById('message-input-area');
    const confirmPlantBtn = document.getElementById('confirm-plant-btn');
    const cancelPlantBtn = document.getElementById('cancel-plant-btn');
    const noteModal = document.getElementById('note-modal');
    const noteText = document.getElementById('note-text');
    const closeNoteBtn = document.getElementById('close-note');

    let draggedFlowerData = {
        type: null,
        src: null, // Not strictly needed as we use CSS for stars, but good practice for images
        x: 0,
        y: 0
    };
    let gardenData = [];

    // Map flower types to their CSS properties (if using images, this would be paths)
    const starColorMap = {
        'star-black': 'black',
        'star-white': '#f0f0f0',
        'star-yellow': '#ffd700',
        'star-blue': '#55aaff',
        'star-red': '#ff5555'
    };

    // --- Drag and Drop Events ---

    flowerSelectionBar.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('draggable-star')) {
            draggedFlowerData.type = e.target.dataset.flowerType;
            // For actual image stars, you'd store e.target.src here
            e.dataTransfer.setData('text/plain', draggedFlowerData.type); // Set data for drag operation
            e.target.style.opacity = '0.5'; // Visual feedback during drag
        }
    });

    flowerSelectionBar.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('draggable-star')) {
            e.target.style.opacity = '1'; // Reset opacity
        }
    });

    gardenContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
        // Optional: add visual feedback for drop zone
        gardenContainer.style.outline = '2px dashed #ffd700';
    });

    gardenContainer.addEventListener('dragleave', () => {
        gardenContainer.style.outline = 'none';
    });

    gardenContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        gardenContainer.style.outline = 'none';

        if (e.target === gardenContainer || e.target.parentNode === gardenContainer || e.target === document.getElementById('decorative-circle')) {
            const rect = gardenContainer.getBoundingClientRect();
            // Calculate coordinates relative to the garden container
            draggedFlowerData.x = e.clientX - rect.left - 20; // -20 to center the 40px star
            draggedFlowerData.y = e.clientY - rect.top - 20; // -20 to center the 40px star

            // Check if drop is within the oval bounds (approximate for simplicity)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const radiusX = rect.width / 2;
            const radiusY = rect.height / 2;

            const xNorm = (draggedFlowerData.x + 20 - centerX) / radiusX; // +20 to get center of star
            const yNorm = (draggedFlowerData.y + 20 - centerY) / radiusY;

            if ((xNorm * xNorm + yNorm * yNorm) <= 1) { // Check if point is inside ellipse
                // Show message input modal
                messageInputModal.classList.remove('hidden');
                document.body.classList.add('modal-open'); // For blurring background
                messageInputArea.focus();
            } else {
                alert("Please drop the flower inside the green garden patch!");
                draggedFlowerData = { type: null, src: null, x: 0, y: 0 }; // Reset
            }
        }
    });

    // --- Modal Actions ---

    confirmPlantBtn.addEventListener('click', () => {
        const message = messageInputArea.value.trim();
        if (message === '') {
            alert('Please enter a message for your flower!');
            return;
        }

        const newStar = {
            x: draggedFlowerData.x,
            y: draggedFlowerData.y,
            type: draggedFlowerData.type,
            message: message,
        };

        gardenData.push(newStar);
        renderStar(newStar);
        saveGarden();

        // Hide modal and reset
        messageInputModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        messageInputArea.value = '';
        draggedFlowerData = { type: null, src: null, x: 0, y: 0 }; // Reset
    });

    cancelPlantBtn.addEventListener('click', () => {
        messageInputModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        messageInputArea.value = '';
        draggedFlowerData = { type: null, src: null, x: 0, y: 0 }; // Reset
    });

    closeNoteBtn.addEventListener('click', () => {
        noteModal.classList.add('hidden');
        gardenContainer.classList.remove('blur');
    });

    // --- Core Functions ---

    function renderStar(starObject) {
        const starEl = document.createElement('div'); // Using div for CSS star
        starEl.classList.add('planted-star');
        starEl.dataset.flowerType = starObject.type; // Store type for potential image changes
        starEl.style.left = `${starObject.x}px`;
        starEl.style.top = `${starObject.y}px`;
        starEl.dataset.message = starObject.message; // Store message

        // Set background color based on type
        starEl.style.backgroundColor = starColorMap[starObject.type] || 'black';

        // Show message on click
        starEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents interaction with garden container underneath
            noteText.textContent = starEl.dataset.message;
            noteModal.classList.remove('hidden');
            gardenContainer.classList.add('blur');
        });

        gardenContainer.appendChild(starEl);
    }

    function saveGarden() {
        localStorage.setItem('digitalGardenData', JSON.stringify(gardenData));
    }

    function loadGarden() {
        const savedData = localStorage.getItem('digitalGardenData');
        if (savedData) {
            gardenData = JSON.parse(savedData);
            gardenData.forEach(star => renderStar(star));
        }
    }

    // Initial load of existing stars
    loadGarden();
});
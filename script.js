class WheelOfNames {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.entries = [
            { name: 'Alice', weight: 1, color: '#FF6B6B', image: null },
            { name: 'Bob', weight: 1, color: '#4ECDC4', image: null },
            { name: 'Charlie', weight: 1, color: '#45B7D1', image: null },
            { name: 'David', weight: 1, color: '#FFA07A', image: null },
            { name: 'Emma', weight: 1, color: '#98D8C8', image: null }
        ];
        this.defaultColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.spinStartTime = null;
        this.spinDuration = 4000;

        // Sound effects using free sounds
        this.tickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Tick sound
        this.winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'); // Win sound
        this.tickSound.volume = 0.3;
        this.winSound.volume = 0.5;

        this.setupEventListeners();
        this.drawWheel();
    }

    setupEventListeners() {
        document.getElementById('spinBtn').addEventListener('click', () => this.spin());
        document.getElementById('updateBtn').addEventListener('click', () => this.updateNames());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('wheel').addEventListener('click', () => this.spin());

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;

                // Remove active class from all tabs and contents
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                e.target.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });

        // Slider value updates
        document.getElementById('spinDuration').addEventListener('input', (e) => {
            document.getElementById('spinDurationValue').textContent = e.target.value;
        });

        document.getElementById('maxNames').addEventListener('input', (e) => {
            document.getElementById('maxNamesValue').textContent = e.target.value;
            this.drawWheel();
        });

        // Wheel title
        document.getElementById('wheelTitle').addEventListener('input', () => {
            this.drawWheel();
        });

        // Show borders checkbox
        document.getElementById('showBorders').addEventListener('change', () => {
            this.drawWheel();
        });

        // Dark mode toggle
        document.getElementById('darkMode').addEventListener('change', (e) => {
            document.body.classList.toggle('dark-mode', e.target.checked);
        });

        // Save and load buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.saveWheel());
        document.getElementById('loadFile').addEventListener('change', (e) => this.loadWheel(e));

        // Options toggle
        document.getElementById('optionsToggle').addEventListener('click', () => {
            const content = document.querySelector('.options-content');
            const icon = document.querySelector('.toggle-icon');
            content.classList.toggle('collapsed');
            icon.classList.toggle('collapsed');
        });

        // Advanced settings toggle
        document.getElementById('advancedBtn').addEventListener('click', () => {
            const advancedSettings = document.getElementById('advancedSettings');
            advancedSettings.classList.toggle('show');
            this.updateAdvancedSettings();
        });

        // Load initial names from textarea
        document.getElementById('namesInput').value = this.entries.map(e => e.name).join('\n');
    }

    updateAdvancedSettings() {
        const container = document.getElementById('entryCustomizer');
        container.innerHTML = '';

        this.entries.forEach((entry, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'entry-row';
            itemDiv.innerHTML = `
                <div class="entry-main">
                    <input type="text" class="entry-name-input" value="${entry.name}" data-index="${index}">
                    <div class="entry-actions">
                        <button class="action-btn color-btn" data-index="${index}" style="background: ${entry.color};" title="Change color">
                            <span style="color: white; text-shadow: 0 0 2px black;">●</span>
                        </button>
                        <button class="action-btn image-btn" data-index="${index}" title="Add image">📷</button>
                        <button class="action-btn weight-btn" data-index="${index}" title="Adjust weight">⚖️</button>
                        <button class="action-btn delete-btn" data-index="${index}" title="Delete">✕</button>
                    </div>
                </div>
                <input type="file" accept="image/*" class="hidden-file-input" data-index="${index}" style="display: none;">
                <input type="color" value="${entry.color}" class="hidden-color-input" data-index="${index}" style="display: none;">
            `;
            container.appendChild(itemDiv);
        });

        // Name input changes
        document.querySelectorAll('.entry-name-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.entries[index].name = e.target.value;
                this.drawWheel();
            });
        });

        // Color button clicks
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index || e.currentTarget.dataset.index);
                const colorInput = container.querySelectorAll('.hidden-color-input')[index];
                colorInput.click();
            });
        });

        // Hidden color inputs
        document.querySelectorAll('.hidden-color-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.entries[index].color = e.target.value;
                this.updateAdvancedSettings();
                this.drawWheel();
            });
        });

        // Image button clicks
        document.querySelectorAll('.image-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const fileInput = container.querySelectorAll('.hidden-file-input')[index];
                fileInput.click();
            });
        });

        // Hidden file inputs
        document.querySelectorAll('.hidden-file-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            this.entries[index].image = img;
                            this.drawWheel();
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Weight button clicks - open modal
        document.querySelectorAll('.weight-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.openWeightModal(index);
            });
        });

        // Delete button clicks
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (confirm(`Delete "${this.entries[index].name}"?`)) {
                    this.entries.splice(index, 1);
                    document.getElementById('namesInput').value = this.entries.map(e => e.name).join('\n');
                    this.updateAdvancedSettings();
                    this.drawWheel();
                }
            });
        });
    }

    openWeightModal(index) {
        const entry = this.entries[index];
        const totalWeight = this.entries.reduce((sum, e) => sum + e.weight, 0);
        const percentage = ((entry.weight / totalWeight) * 100).toFixed(1);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'weight-modal';
        modal.innerHTML = `
            <div class="weight-modal-content">
                <h3>Adjust Weight: ${entry.name}</h3>
                <p class="current-percent">${percentage}% of wheel</p>
                <div class="weight-controls">
                    <label>Weight:</label>
                    <input type="range" id="modalWeightSlider" min="0.1" max="100" step="0.1" value="${entry.weight}">
                    <input type="number" id="modalWeightInput" min="0.1" max="100" step="0.1" value="${entry.weight}">
                </div>
                <div class="modal-actions">
                    <button id="cancelWeight" class="modal-btn cancel-btn">Cancel</button>
                    <button id="applyWeight" class="modal-btn apply-btn">Apply</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const slider = modal.querySelector('#modalWeightSlider');
        const input = modal.querySelector('#modalWeightInput');
        const percentDisplay = modal.querySelector('.current-percent');

        // Sync slider and input
        slider.addEventListener('input', () => {
            input.value = slider.value;
            const newTotal = totalWeight - entry.weight + parseFloat(slider.value);
            const newPercent = ((parseFloat(slider.value) / newTotal) * 100).toFixed(1);
            percentDisplay.textContent = `${newPercent}% of wheel`;
        });

        input.addEventListener('input', () => {
            slider.value = input.value;
            const newTotal = totalWeight - entry.weight + parseFloat(input.value);
            const newPercent = ((parseFloat(input.value) / newTotal) * 100).toFixed(1);
            percentDisplay.textContent = `${newPercent}% of wheel`;
        });

        // Cancel button
        modal.querySelector('#cancelWeight').addEventListener('click', () => {
            modal.remove();
        });

        // Apply button
        modal.querySelector('#applyWeight').addEventListener('click', () => {
            this.entries[index].weight = parseFloat(input.value);
            modal.remove();
            this.updateAdvancedSettings();
            this.drawWheel();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updateNames() {
        const input = document.getElementById('namesInput').value;
        const lines = input.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            alert('Please enter at least one name!');
            return;
        }

        // Keep existing entries that match, add new ones
        const newEntries = [];
        lines.forEach((name, index) => {
            const existingEntry = this.entries.find(e => e.name === name);
            if (existingEntry) {
                newEntries.push(existingEntry);
            } else {
                newEntries.push({
                    name,
                    weight: 1,
                    color: this.defaultColors[index % this.defaultColors.length],
                    image: null
                });
            }
        });

        this.entries = newEntries;
        this.drawWheel();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get max names setting
        const maxNames = parseInt(document.getElementById('maxNames').value);
        const displayEntries = this.entries.slice(0, Math.min(this.entries.length, maxNames));
        const showBorders = document.getElementById('showBorders').checked;

        // Calculate total weight
        const totalWeight = displayEntries.reduce((sum, entry) => sum + entry.weight, 0);

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.currentRotation);

        const startOffset = -Math.PI / 2; // Start at top of wheel
        let currentAngle = startOffset;

        // Draw segments with weighted sizes
        for (let i = 0; i < displayEntries.length; i++) {
            const entry = displayEntries[i];
            const segmentAngle = (2 * Math.PI) * (entry.weight / totalWeight);
            const endAngle = currentAngle + segmentAngle;

            // Draw segment
            this.ctx.beginPath();
            this.ctx.fillStyle = entry.color;
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, currentAngle, endAngle);
            this.ctx.lineTo(0, 0);
            this.ctx.fill();

            // Draw border if enabled
            if (showBorders) {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            // Draw image if available, otherwise draw text
            this.ctx.save();
            this.ctx.rotate(currentAngle + segmentAngle / 2);

            if (entry.image) {
                // Draw image
                const imgSize = radius * 0.4;
                const imgRadius = radius * 0.6;
                this.ctx.drawImage(entry.image, imgRadius - imgSize/2, -imgSize/2, imgSize, imgSize);
            } else {
                // Draw text
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 18px Arial';
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                this.ctx.shadowBlur = 3;
                this.ctx.shadowOffsetX = 1;
                this.ctx.shadowOffsetY = 1;

                const textRadius = radius * 0.7;
                this.ctx.fillText(entry.name, textRadius, 0);
            }

            this.ctx.restore();

            currentAngle = endAngle;
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.fillStyle = '#fff';
        this.ctx.arc(0, 0, 30, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.restore();

        // Draw title if enabled
        const showTitle = document.getElementById('showTitle').checked;
        const wheelTitle = document.getElementById('wheelTitle').value;
        if (showTitle && wheelTitle) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(wheelTitle, centerX, 30);
        }
    }

    spin() {
        if (this.isSpinning || this.entries.length === 0) return;

        this.isSpinning = true;
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = true;

        // Get spin duration from input and check for slow spin
        const durationInput = document.getElementById('spinDuration');
        const spinSlowly = document.getElementById('spinSlowly').checked;
        this.spinDuration = parseFloat(durationInput.value) * 1000;

        if (spinSlowly) {
            this.spinDuration *= 2; // Double the duration for slow spin
        }

        // Random final rotation (5-10 full spins plus random position)
        const fullSpins = 5 + Math.random() * 5;
        const randomAngle = Math.random() * 2 * Math.PI;
        const totalRotation = (fullSpins * 2 * Math.PI) + randomAngle;

        const startRotation = this.currentRotation;
        const startTime = Date.now();

        let lastSegment = -1;
        const totalWeight = this.entries.reduce((sum, entry) => sum + entry.weight, 0);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.spinDuration, 1);

            // Easing function for deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);

            this.currentRotation = startRotation + (totalRotation * easeOut);
            this.drawWheel();

            // Play tick sound when crossing segments (only during first 80% of spin)
            if (progress < 0.8) {
                const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

                // Find which segment we're in based on weights
                const startOffset = -Math.PI / 2;
                const relativeAngle = ((normalizedRotation - startOffset) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);
                let accumulatedAngle = 0;
                let currentSegment = 0;

                for (let i = 0; i < this.entries.length; i++) {
                    const segmentAngle = (2 * Math.PI) * (this.entries[i].weight / totalWeight);
                    if (relativeAngle >= accumulatedAngle && relativeAngle < accumulatedAngle + segmentAngle) {
                        currentSegment = i;
                        break;
                    }
                    accumulatedAngle += segmentAngle;
                }

                if (currentSegment !== lastSegment) {
                    lastSegment = currentSegment;
                    // Play tick sound
                    if (this.tickSound) {
                        this.tickSound.currentTime = 0;
                        this.tickSound.play().catch(() => {}); // Ignore errors if autoplay blocked
                    }
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentRotation = this.currentRotation % (2 * Math.PI);
                this.isSpinning = false;
                spinBtn.disabled = false;
                this.showWinner();
            }
        };

        animate();
    }

    showWinner() {
        // Pointer points at top of wheel (straight up, -90 degrees from right/0 degrees)
        const startOffset = -Math.PI / 2; // Where segments start (top of wheel)

        // Normalize the current rotation
        const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

        // Calculate total weight
        const totalWeight = this.entries.reduce((sum, entry) => sum + entry.weight, 0);

        // The pointer is at the top, find which weighted segment is there
        const pointerPosition = -Math.PI / 2; // Top of wheel in absolute terms
        const relativeAngle = ((pointerPosition - normalizedRotation - startOffset) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

        // Find which segment this angle falls into
        let accumulatedAngle = 0;
        let winnerIndex = 0;

        for (let i = 0; i < this.entries.length; i++) {
            const segmentAngle = (2 * Math.PI) * (this.entries[i].weight / totalWeight);
            if (relativeAngle >= accumulatedAngle && relativeAngle < accumulatedAngle + segmentAngle) {
                winnerIndex = i;
                break;
            }
            accumulatedAngle += segmentAngle;
        }

        const winner = this.entries[winnerIndex].name;

        // Play win sound if enabled
        const playSound = document.getElementById('playSound').checked;
        if (playSound && this.winSound) {
            this.winSound.currentTime = 0;
            this.winSound.play().catch(() => {}); // Ignore errors if autoplay blocked
        }

        // Show confetti if enabled
        const showConfetti = document.getElementById('confetti').checked;
        if (showConfetti && typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            // Second burst
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
            }, 250);
            // Third burst
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 400);
        }

        // Show modal
        document.getElementById('winnerName').textContent = winner;
        document.getElementById('winnerModal').classList.add('show');

        // Remove winner if option is checked
        if (document.getElementById('removeWinner').checked) {
            this.entries.splice(winnerIndex, 1);
            document.getElementById('namesInput').value = this.entries.map(e =>
                e.weight > 1 ? `${e.name}:${e.weight}` : e.name
            ).join('\n');

            if (this.entries.length === 0) {
                setTimeout(() => {
                    alert('All names have been selected! Add more names to continue.');
                }, 500);
            } else {
                this.drawWheel();
            }
        }
    }

    closeModal() {
        document.getElementById('winnerModal').classList.remove('show');
    }

    saveWheel() {
        // Gather all settings
        const settings = {
            entries: this.entries,
            displayDuplicates: document.getElementById('displayDuplicates').checked,
            spinSlowly: document.getElementById('spinSlowly').checked,
            showTitle: document.getElementById('showTitle').checked,
            spinDuration: document.getElementById('spinDuration').value,
            maxNames: document.getElementById('maxNames').value,
            removeWinner: document.getElementById('removeWinner').checked,
            playSound: document.getElementById('playSound').checked,
            confetti: document.getElementById('confetti').checked,
            darkMode: document.getElementById('darkMode').checked,
            showBorders: document.getElementById('showBorders').checked,
            wheelTitle: document.getElementById('wheelTitle').value
        };

        // Convert to JSON
        const json = JSON.stringify(settings, null, 2);

        // Create download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wheel.spinnyboi';
        a.click();
        URL.revokeObjectURL(url);
    }

    loadWheel(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);

                // Load entries (with backwards compatibility for old "names" format)
                if (settings.entries) {
                    this.entries = settings.entries;
                } else if (settings.names) {
                    // Convert old format to new format
                    this.entries = settings.names.map(name => ({ name, weight: 1 }));
                }

                document.getElementById('namesInput').value = this.entries.map(e =>
                    e.weight > 1 ? `${e.name}:${e.weight}` : e.name
                ).join('\n');

                // Load settings
                if (settings.displayDuplicates !== undefined) {
                    document.getElementById('displayDuplicates').checked = settings.displayDuplicates;
                }
                if (settings.spinSlowly !== undefined) {
                    document.getElementById('spinSlowly').checked = settings.spinSlowly;
                }
                if (settings.showTitle !== undefined) {
                    document.getElementById('showTitle').checked = settings.showTitle;
                }
                if (settings.spinDuration !== undefined) {
                    document.getElementById('spinDuration').value = settings.spinDuration;
                    document.getElementById('spinDurationValue').textContent = settings.spinDuration;
                }
                if (settings.maxNames !== undefined) {
                    document.getElementById('maxNames').value = settings.maxNames;
                    document.getElementById('maxNamesValue').textContent = settings.maxNames;
                }
                if (settings.removeWinner !== undefined) {
                    document.getElementById('removeWinner').checked = settings.removeWinner;
                }
                if (settings.playSound !== undefined) {
                    document.getElementById('playSound').checked = settings.playSound;
                }
                if (settings.confetti !== undefined) {
                    document.getElementById('confetti').checked = settings.confetti;
                }
                if (settings.darkMode !== undefined) {
                    document.getElementById('darkMode').checked = settings.darkMode;
                    document.body.classList.toggle('dark-mode', settings.darkMode);
                }
                if (settings.showBorders !== undefined) {
                    document.getElementById('showBorders').checked = settings.showBorders;
                }
                if (settings.wheelTitle !== undefined) {
                    document.getElementById('wheelTitle').value = settings.wheelTitle;
                }

                // Redraw wheel with new settings
                this.drawWheel();

                alert('Wheel loaded successfully!');
            } catch (error) {
                alert('Error loading file: ' + error.message);
            }
        };

        reader.readAsText(file);

        // Reset file input so same file can be loaded again
        event.target.value = '';
    }
}

// Initialize the wheel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WheelOfNames();
});

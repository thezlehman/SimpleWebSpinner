class WheelOfNames {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.names = ['Alice', 'Bob', 'Charlie', 'David', 'Emma'];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
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

        // Load initial names from textarea
        document.getElementById('namesInput').value = this.names.join('\n');
    }

    updateNames() {
        const input = document.getElementById('namesInput').value;
        const newNames = input.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (newNames.length === 0) {
            alert('Please enter at least one name!');
            return;
        }

        this.names = newNames;
        this.drawWheel();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Get max names setting
        const maxNames = parseInt(document.getElementById('maxNames').value);
        const displayNames = this.names.slice(0, Math.min(this.names.length, maxNames));
        const showBorders = document.getElementById('showBorders').checked;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.currentRotation);

        const anglePerSegment = (2 * Math.PI) / displayNames.length;
        const startOffset = -Math.PI / 2; // Start at top of wheel

        // Draw segments
        for (let i = 0; i < displayNames.length; i++) {
            const startAngle = startOffset + (i * anglePerSegment);
            const endAngle = startAngle + anglePerSegment;
            const color = this.colors[i % this.colors.length];

            // Draw segment
            this.ctx.beginPath();
            this.ctx.fillStyle = color;
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle, endAngle);
            this.ctx.lineTo(0, 0);
            this.ctx.fill();

            // Draw border if enabled
            if (showBorders) {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            // Draw text
            this.ctx.save();
            this.ctx.rotate(startAngle + anglePerSegment / 2);
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;

            // Position text
            const textRadius = radius * 0.7;
            this.ctx.fillText(displayNames[i], textRadius, 0);

            this.ctx.restore();
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
        if (this.isSpinning || this.names.length === 0) return;

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
        const anglePerSegment = (2 * Math.PI) / this.names.length;

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
                const currentSegment = Math.floor(normalizedRotation / anglePerSegment);

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
        const anglePerSegment = (2 * Math.PI) / this.names.length;
        const startOffset = -Math.PI / 2; // Where segments start (top of wheel)

        // Normalize the current rotation
        const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

        // The pointer is at -PI/2 (top), we need to find which segment is there
        // Account for the wheel's rotation and the start offset
        const pointerPosition = -Math.PI / 2; // Top of wheel in absolute terms
        const relativeAngle = ((pointerPosition - normalizedRotation - startOffset) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI);

        const winnerIndex = Math.floor(relativeAngle / anglePerSegment) % this.names.length;
        const winner = this.names[winnerIndex];

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
            this.names.splice(winnerIndex, 1);
            document.getElementById('namesInput').value = this.names.join('\n');

            if (this.names.length === 0) {
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
            names: this.names,
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

                // Load names
                if (settings.names) {
                    this.names = settings.names;
                    document.getElementById('namesInput').value = this.names.join('\n');
                }

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

/**
 * Happy New Year 2026 - Celebration Animation
 * Created by Sarang
 */

// ============================
// DOM Elements
// ============================
const starsContainer = document.getElementById('starsContainer');
const entryScreen = document.getElementById('entryScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const celebrationScene = document.getElementById('celebrationScene');
const childContainer = document.getElementById('childContainer');
const rocket = document.getElementById('rocket');
const spark = document.getElementById('spark');
const rocketTrail = document.getElementById('rocketTrail');
const fireworksCanvas = document.getElementById('fireworksCanvas');
const messageContainer = document.getElementById('messageContainer');
const nameDisplay = document.getElementById('nameDisplay');
const finalLine = document.getElementById('finalLine');
const confettiContainer = document.getElementById('confettiContainer');
const socialCard = document.getElementById('socialCard');
const controls = document.getElementById('controls');
const soundToggle = document.getElementById('soundToggle');
const replayBtn = document.getElementById('replayBtn');

// Audio Elements
const crackerSound = document.getElementById('crackerSound');
const rocketSound = document.getElementById('rocketSound');
const crowdSound = document.getElementById('crowdSound');
const bgMusic = document.getElementById('bgMusic');

// Canvas Context
const ctx = fireworksCanvas.getContext('2d');

// ============================
// State
// ============================
let userName = '';
let soundEnabled = true;
let animationFrame = null;
let fireworks = [];
let particles = [];

// ============================
// Initialize
// ============================
function init() {
    resizeCanvas();
    createStars();
    checkURLParams();
    setupEventListeners();
}

function resizeCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}

function createStars() {
    starsContainer.innerHTML = '';
    const starCount = Math.min(150, Math.floor(window.innerWidth / 10));

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        star.style.setProperty('--delay', `${Math.random() * 3}s`);
        starsContainer.appendChild(star);
    }
}

function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    if (name && name.trim()) {
        nameInput.value = name.trim();
        // Auto-start after a small delay to allow page to load
        setTimeout(() => {
            startCelebration();
        }, 500);
    }
}

function setupEventListeners() {
    window.addEventListener('resize', () => {
        resizeCanvas();
        createStars();
    });

    startBtn.addEventListener('click', startCelebration);

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startCelebration();
        }
    });

    soundToggle.addEventListener('click', toggleSound);
    replayBtn.addEventListener('click', replayCelebration);
}

// ============================
// Sound Control
// ============================
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('muted', !soundEnabled);

    if (soundEnabled) {
        bgMusic.volume = 0.3;
        if (bgMusic.paused === false) {
            bgMusic.play().catch(() => { });
        }
    } else {
        bgMusic.pause();
        crackerSound.pause();
        rocketSound.pause();
        crowdSound.pause();
    }
}

function playSound(audio, volume = 0.5) {
    if (!soundEnabled) return;

    try {
        audio.currentTime = 0;
        audio.volume = volume;
        audio.play().catch(() => {
            // Audio play failed, ignore
        });
    } catch (e) {
        // Ignore errors
    }
}

// ============================
// Celebration Flow
// ============================
function startCelebration() {
    userName = nameInput.value.trim() || 'Friend';

    // Hide entry screen
    entryScreen.classList.add('hidden');

    // Show celebration scene
    celebrationScene.classList.remove('hidden');
    controls.classList.remove('hidden');

    // Start background music
    bgMusic.volume = 0.2;
    bgMusic.play().catch(() => { });

    // Start animation sequence
    setTimeout(lightFuse, 1500);
}

function lightFuse() {
    spark.classList.add('active');
    playSound(crackerSound, 0.4);

    setTimeout(launchRocket, 1500);
}

function launchRocket() {
    spark.classList.remove('active');
    rocket.classList.add('launching');
    playSound(rocketSound, 0.6);

    // Wait for rocket to reach top, then explode
    setTimeout(explodeRocket, 1800);
}

function explodeRocket() {
    // Hide child and rocket
    childContainer.style.opacity = '0';

    // Start fireworks
    startFireworks();

    // Show name after a short delay
    setTimeout(showName, 500);
}

function showName() {
    messageContainer.classList.remove('hidden');
    nameDisplay.textContent = userName.toUpperCase();

    // Play crowd cheer
    playSound(crowdSound, 0.7);

    // Start confetti
    startConfetti();

    // Continue fireworks for finale
    setTimeout(showFinalLine, 3000);
}

function showFinalLine() {
    finalLine.classList.remove('hidden');

    // Show social card
    setTimeout(() => {
        socialCard.classList.remove('hidden');
    }, 1500);

    // Increase music volume slightly for finale
    if (soundEnabled && bgMusic) {
        bgMusic.volume = 0.4;
    }

    // Continue fireworks for a while, then slow down
    setTimeout(() => {
        // Reduce firework frequency
    }, 5000);
}

function replayCelebration() {
    // Stop current animations
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    // Clear canvas
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Reset fireworks and particles
    fireworks = [];
    particles = [];

    // Clear confetti
    confettiContainer.innerHTML = '';

    // Reset elements
    messageContainer.classList.add('hidden');
    finalLine.classList.add('hidden');
    socialCard.classList.add('hidden');
    childContainer.style.opacity = '';
    rocket.classList.remove('launching');
    spark.classList.remove('active');

    // Reset child animation
    childContainer.style.animation = 'none';
    childContainer.offsetHeight; // Trigger reflow
    childContainer.style.animation = '';

    // Show celebration scene fresh
    celebrationScene.classList.remove('hidden');

    // Restart sequence
    setTimeout(lightFuse, 500);
}

// ============================
// Fireworks System
// ============================
class Firework {
    constructor(sx, sy, tx, ty, color) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.color = color || this.randomColor();

        const angle = Math.atan2(ty - sy, tx - sx);
        const speed = 8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.distanceToTarget = this.distance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        this.trail = [];
        this.trailLength = 5;
        this.exploded = false;
    }

    randomColor() {
        const colors = ['#ffd700', '#ff4757', '#00f5ff', '#ff6b9d', '#7bed9f', '#ff6b6b'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        this.distanceTraveled = this.distance(this.sx, this.sy, this.x, this.y);

        if (this.distanceTraveled >= this.distanceToTarget) {
            this.exploded = true;
            this.createParticles();
        }
    }

    createParticles() {
        const particleCount = 50; // Reduced for mobile performance
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = Math.random() * 6 + 2;
            particles.push(new Particle(
                this.tx,
                this.ty,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.color
            ));
        }

        // Play cracker sound for each explosion
        if (Math.random() > 0.7) {
            playSound(crackerSound, 0.3);
        }
    }

    draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
            ctx.fill();
        }

        // Draw firework
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.gravity = 0.05;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function startFireworks() {
    // Create initial burst of fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            launchFirework();
        }, i * 300);
    }

    // Reduced continuous fireworks for mobile performance
    setInterval(() => {
        // Launch 1-2 fireworks at random intervals
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                launchFirework();
            }, i * 150);
        }
    }, 1200);

    // Start animation loop
    animateFireworks();
}

function launchFirework() {
    const width = fireworksCanvas.width;
    const height = fireworksCanvas.height;

    // Launch from multiple positions across the bottom
    const sx = Math.random() * width;
    const sy = height;
    const tx = Math.random() * width;
    const ty = height * 0.1 + Math.random() * height * 0.4; // Higher explosions

    // Random colors for variety
    const colors = ['#ffd700', '#ff4757', '#00f5ff', '#ff6b9d', '#7bed9f', '#ff6b6b', '#ffffff', '#ffa502', '#ff3838'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    fireworks.push(new Firework(sx, sy, tx, ty, color));
}

function animateFireworks() {
    animationFrame = requestAnimationFrame(animateFireworks);

    // Fade effect
    ctx.fillStyle = 'rgba(10, 10, 26, 0.15)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Update and draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();

        if (fireworks[i].exploded) {
            fireworks.splice(i, 1);
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

// ============================
// Confetti System
// ============================
function startConfetti() {
    const colors = ['#ffd700', '#ff4757', '#00f5ff', '#ff6b9d', '#7bed9f', '#ff6b6b', '#ffffff'];

    // Create initial burst
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            createConfettiPiece(colors);
        }, i * 30);
    }

    // Continue for a while
    const confettiInterval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            createConfettiPiece(colors);
        }
    }, 200);

    // Stop after 7 seconds
    setTimeout(() => {
        clearInterval(confettiInterval);
    }, 7000);
}

function createConfettiPiece(colors) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = Math.random() > 0.5 ? 'circle' : 'square';
    const size = Math.random() * 10 + 5;
    const fallDuration = Math.random() * 3 + 3;

    confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${shape === 'circle' ? '50%' : '2px'};
        --fall-duration: ${fallDuration}s;
    `;

    confettiContainer.appendChild(confetti);

    // Remove after animation
    setTimeout(() => {
        confetti.remove();
    }, fallDuration * 1000);
}

// ============================
// Start the app
// ============================
window.addEventListener('DOMContentLoaded', init);
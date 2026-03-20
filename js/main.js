// ============================================
// 🔥 CEDRIC DUDEL - FEUERWEHR WEBSEITE
// ============================================

(function () {
    'use strict';

    // ---- COUNTDOWN ----
    const TARGET_DATE = new Date('2026-04-16T00:00:00+02:00');
    const isAfterDate = () => new Date() >= TARGET_DATE;

    function updateCountdown() {
        const now = new Date();
        const diff = TARGET_DATE - now;

        const container = document.getElementById('countdown-container');
        const done = document.getElementById('countdown-done');

        if (diff <= 0) {
            container.classList.add('hidden');
            done.classList.remove('hidden');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        animateValue('countdown-days', days);
        animateValue('countdown-hours', hours);
        animateValue('countdown-minutes', minutes);
        animateValue('countdown-seconds', seconds);
    }

    function animateValue(id, value) {
        const el = document.getElementById(id);
        const str = String(value).padStart(2, '0');
        if (el.textContent !== str) {
            el.textContent = str;
            el.classList.add('flip');
            setTimeout(() => el.classList.remove('flip'), 300);
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ---- CONGRATS BEFORE/AFTER TOGGLE ----
    const congratsBefore = document.getElementById('congrats-before');
    const congratsAfter = document.getElementById('congrats-after');

    if (isAfterDate()) {
        congratsBefore.classList.add('hidden');
        congratsAfter.classList.remove('hidden');
    } else {
        congratsBefore.classList.remove('hidden');
        congratsAfter.classList.add('hidden');
    }

    // ---- FIRE PARTICLES (Canvas) ----
    const canvas = document.getElementById('hero-particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 50;
            this.size = Math.random() * 4 + 1;
            this.speedY = -(Math.random() * 2 + 0.5);
            this.speedX = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.7 + 0.3;
            this.life = Math.random() * 120 + 60;
            this.maxLife = this.life;
            const colors = [
                [230, 57, 70],    // red
                [255, 140, 50],   // orange
                [255, 200, 50],   // yellow
                [212, 168, 67],   // gold
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.speedX + Math.sin(this.life * 0.05) * 0.3;
            this.y += this.speedY;
            this.life--;
            this.opacity = (this.life / this.maxLife) * 0.6;
            this.size *= 0.998;
            if (this.life <= 0 || this.y < -10) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.opacity})`;
            ctx.shadowColor = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},0.5)`;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function initParticles() {
        resizeCanvas();
        particles = [];
        const count = Math.min(Math.floor(canvas.width / 8), 120);
        for (let i = 0; i < count; i++) {
            const p = new Particle();
            p.y = Math.random() * canvas.height;
            p.life = Math.random() * p.maxLife;
            particles.push(p);
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animFrameId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    initParticles();
    animateParticles();

    // ---- SCROLL REVEAL (Intersection Observer) ----
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- STAT BARS ANIMATION ----
    const statBars = document.querySelectorAll('.stat-fill');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = Math.min(entry.target.dataset.width, 100);
                entry.target.style.width = width + '%';
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statBars.forEach(bar => statsObserver.observe(bar));

    // ---- FLOATING NAV ACTIVE STATE ----
    const sections = document.querySelectorAll('section');
    const navDots = document.querySelectorAll('.nav-dot');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navDots.forEach(dot => {
                    dot.classList.toggle('active', dot.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(sec => navObserver.observe(sec));

    // ---- SMOOTH SCROLL ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ---- CONFETTI (only after the date) ----
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiPieces = [];
    let confettiTriggered = false;

    function resizeConfetti() {
        const section = document.getElementById('congrats');
        confettiCanvas.width = section.offsetWidth;
        confettiCanvas.height = section.offsetHeight;
    }

    class ConfettiPiece {
        constructor() {
            this.x = Math.random() * confettiCanvas.width;
            this.y = -10 - Math.random() * confettiCanvas.height * 0.5;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
            this.opacity = 1;
            const colors = ['#E63946', '#D4A843', '#FF6B35', '#FFD700', '#FF4444', '#FFFFFF', '#FFA500'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
            this.rotation += this.rotationSpeed;
            if (this.y > confettiCanvas.height + 20) {
                this.opacity -= 0.02;
            }
        }
        draw() {
            if (this.opacity <= 0) return;
            confettiCtx.save();
            confettiCtx.translate(this.x, this.y);
            confettiCtx.rotate((this.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = this.opacity;
            confettiCtx.fillStyle = this.color;
            confettiCtx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            confettiCtx.restore();
        }
    }

    function launchConfetti() {
        resizeConfetti();
        confettiPieces = [];
        for (let i = 0; i < 150; i++) {
            confettiPieces.push(new ConfettiPiece());
        }
        animateConfetti();
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let alive = false;
        confettiPieces.forEach(p => {
            p.update();
            p.draw();
            if (p.opacity > 0) alive = true;
        });
        if (alive) requestAnimationFrame(animateConfetti);
    }

    // Only trigger confetti after the date
    if (isAfterDate()) {
        const congratsSection = document.getElementById('congrats');
        const congratsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !confettiTriggered) {
                    confettiTriggered = true;
                    launchConfetti();
                }
            });
        }, { threshold: 0.3 });

        congratsObserver.observe(congratsSection);
    }
    window.addEventListener('resize', resizeConfetti);

    // ---- SIREN EASTER EGG (only after the date) ----
    const sirenBtn = document.getElementById('siren-btn');
    if (sirenBtn) {
        let sirenPlaying = false;
        let sirenOscillator = null;
        let sirenGain = null;
        let sirenAudioCtx = null;

        sirenBtn.addEventListener('click', () => {
            if (sirenPlaying) {
                stopSiren();
                return;
            }
            playSiren();
        });

        function playSiren() {
            sirenAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            sirenOscillator = sirenAudioCtx.createOscillator();
            sirenGain = sirenAudioCtx.createGain();
            sirenOscillator.type = 'sawtooth';
            sirenOscillator.frequency.setValueAtTime(600, sirenAudioCtx.currentTime);
            sirenGain.gain.setValueAtTime(0.15, sirenAudioCtx.currentTime);

            const duration = 3;
            for (let t = 0; t < duration; t += 0.5) {
                sirenOscillator.frequency.linearRampToValueAtTime(900, sirenAudioCtx.currentTime + t + 0.25);
                sirenOscillator.frequency.linearRampToValueAtTime(600, sirenAudioCtx.currentTime + t + 0.5);
            }
            sirenGain.gain.linearRampToValueAtTime(0, sirenAudioCtx.currentTime + duration);

            sirenOscillator.connect(sirenGain);
            sirenGain.connect(sirenAudioCtx.destination);
            sirenOscillator.start();
            sirenPlaying = true;
            sirenBtn.classList.add('active');

            setTimeout(() => {
                stopSiren();
            }, duration * 1000);
        }

        function stopSiren() {
            if (sirenOscillator) {
                sirenOscillator.stop();
                sirenOscillator.disconnect();
            }
            if (sirenAudioCtx) sirenAudioCtx.close();
            sirenPlaying = false;
            sirenBtn.classList.remove('active');
        }
    }

    // ---- SHARE FUNCTIONS (works for both before & after) ----
    function setupShare(whatsappId, copyId, feedbackId) {
        const waBtn = document.getElementById(whatsappId);
        const copyBtn = document.getElementById(copyId);
        const feedback = document.getElementById(feedbackId);

        if (waBtn) {
            waBtn.addEventListener('click', () => {
                const text = '🔥 Cedric Dudel wird Feuerwehrmann! Schau dir diese Seite an: ';
                const url = window.location.href;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
            });
        }
        if (copyBtn && feedback) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    feedback.classList.remove('hidden');
                    setTimeout(() => feedback.classList.add('hidden'), 2500);
                });
            });
        }
    }

    // Setup for both before and after versions
    setupShare('share-whatsapp-before', 'share-copy-before', 'copy-feedback-before');
    setupShare('share-whatsapp', 'share-copy', 'copy-feedback');

    // ---- HERO ANIMATE-IN ----
    window.addEventListener('load', () => {
        const items = document.querySelectorAll('.animate-in');
        items.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 300 + i * 200);
        });
    });

    // ---- PARALLAX on Quote Section ----
    window.addEventListener('scroll', () => {
        const quoteSection = document.querySelector('.quote-section');
        if (!quoteSection) return;
        const rect = quoteSection.getBoundingClientRect();
        const scrolled = -rect.top * 0.3;
        const parallax = quoteSection.querySelector('.quote-parallax');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled}px)`;
        }

        // Floating nav visibility
        const nav = document.getElementById('floating-nav');
        if (window.scrollY > 300) {
            nav.classList.add('visible');
        } else {
            nav.classList.remove('visible');
        }
    });

})();


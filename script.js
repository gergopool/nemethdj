document.addEventListener('DOMContentLoaded', () => {
    // Target Date: April 11, 2026, 00:00:00
    const targetDate = new Date('2026-04-11T00:00:00').getTime();

    const units = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "<h2>THE TIME IS NOW</h2>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        units.days.innerText = days.toString().padStart(2, '0');
        units.hours.innerText = hours.toString().padStart(2, '0');
        units.minutes.innerText = minutes.toString().padStart(2, '0');
        units.seconds.innerText = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Scroll-triggered fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));

    // Audio Visualizer Setup
    const animationFrames = {};
    let visualizerEnabled = false;

    // Simulated visualizer (fallback when CORS blocks audio analysis)
    function simulateVisualize(trackId) {
        const card = document.getElementById('btn-' + trackId).closest('.music-card');
        const bars = card.querySelectorAll('.visualizer-placeholder .bar');

        // Base heights that will be modified
        const baseHeights = [30, 50, 35, 65, 45, 80, 55, 40, 70, 35, 60, 45];
        let phase = 0;

        function draw() {
            animationFrames[trackId] = requestAnimationFrame(draw);
            phase += 0.15;

            bars.forEach((bar, index) => {
                // Create wave-like motion with randomness
                const wave = Math.sin(phase + index * 0.5) * 30;
                const random = (Math.random() - 0.5) * 20;
                const height = Math.max(10, Math.min(95, baseHeights[index] + wave + random));
                bar.style.height = `${height}%`;
            });
        }

        draw();
    }

    function stopVisualize(trackId) {
        if (animationFrames[trackId]) {
            cancelAnimationFrame(animationFrames[trackId]);
            animationFrames[trackId] = null;
        }

        // Reset bars to static state
        const card = document.getElementById('btn-' + trackId)?.closest('.music-card');
        if (!card) return;

        const bars = card.querySelectorAll('.visualizer-placeholder .bar');
        const staticHeights = [30, 50, 35, 65, 45, 80, 55, 40, 70, 35, 60, 45];

        bars.forEach((bar, index) => {
            bar.style.height = `${staticHeights[index % staticHeights.length]}%`;
        });
    }

    // Audio Logic
    window.toggleAudio = function (trackId) {
        const audio = document.getElementById(trackId);
        const btn = document.getElementById('btn-' + trackId);
        const card = btn.closest('.music-card');

        // Stop all other audios
        document.querySelectorAll('audio').forEach(a => {
            if (a.id !== trackId) {
                a.pause();
                a.currentTime = 0;
                stopVisualize(a.id);
                const b = document.getElementById('btn-' + a.id);
                if (b) {
                    b.innerText = "PLAY";
                    b.classList.remove('playing');
                    b.closest('.music-card').classList.remove('playing');
                }
            }
        });

        if (audio.paused) {
            audio.play().catch(e => console.log("Audio play failed:", e));
            btn.innerText = "PAUSE";
            btn.classList.add('playing');
            card.classList.add('playing');

            // Start simulated visualization
            simulateVisualize(trackId);
        } else {
            audio.pause();
            btn.innerText = "PLAY";
            btn.classList.remove('playing');
            card.classList.remove('playing');

            // Stop visualization
            stopVisualize(trackId);
        }
    };

    // Handle audio ending
    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('ended', () => {
            const trackId = audio.id;
            const btn = document.getElementById('btn-' + trackId);
            const card = btn.closest('.music-card');

            btn.innerText = "PLAY";
            btn.classList.remove('playing');
            card.classList.remove('playing');
            stopVisualize(trackId);
        });
    });

    // Contact form submission handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function() {
            const btn = contactForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = 'SENDING...';

            setTimeout(() => {
                contactForm.reset();
                btn.innerText = 'MESSAGE SENT!';
                btn.style.background = '#4CAF50';

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerText = 'SEND MESSAGE';
                    btn.style.background = '';
                }, 3000);
            }, 500);
        });
    }
});

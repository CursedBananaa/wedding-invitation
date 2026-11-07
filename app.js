/**
 * Karim & Nadine - Wedding Celebration Application
 * Built with React 18 & GSAP (GreenSock Animation Platform) + ScrollTrigger
 * Thursday, December 10, 2026 - Qasr Ras El Teen, Alexandria
 */

(function () {
  const { useState, useEffect, useRef, createElement: h } = window.React;
  const { createRoot } = window.ReactDOM;

  // Register GSAP plugins
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* ==========================================================================
     Live Wedding Guestbook & Attendance Cloud Database
     ========================================================================== */
  const GUESTBOOK_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1b7c104fc5f43';

  /* ==========================================================================
     Gallery Photos Data (6 Celebration Photos)
     ========================================================================== */
  const GALLERY_PHOTOS = [
    { id: 1, url: 'assets/2203105e-a478-4233-a74a-60728a914501.jpg', alt: 'Wedding photo 1' },
    { id: 2, url: 'assets/f7035f6f-09ef-4eea-adf7-b2facce74c14.jpg', alt: 'Wedding photo 2' },
    { id: 3, url: 'assets/f3162e99-21ec-442c-bae9-89a48a77f560.jpg', alt: 'Wedding photo 3' },
    { id: 4, url: 'assets/3154940c-3a69-429b-a6e3-6750443bf052.jpg', alt: 'Wedding photo 4' },
    { id: 5, url: 'assets/9eb3476b-d6e8-4845-aeb9-32adc261e8d4.jpg', alt: 'Wedding photo 5' },
    { id: 6, url: 'assets/f109479f-acb3-4fc0-9141-f8ba7d074c91.jpg', alt: 'Wedding photo 6' }
  ];

  /* ==========================================================================
     Audio Synthesizer (Pachelbel Canon in D Progression)
     ========================================================================== */
  class WeddingAudioPlayer {
    constructor() {
      this.isPlaying = false;
      this.audioCtx = null;
      this.timer = null;
      this.audioElem = document.getElementById('wedding-audio');

      this.melody = [
        ['D', 5, 1.2], ['A', 4, 1.2], ['B', 4, 1.2], ['F#', 4, 1.2],
        ['G', 4, 1.2], ['D', 4, 1.2], ['G', 4, 1.2], ['A', 4, 1.2],
        ['F#', 5, 0.6], ['G', 5, 0.6], ['A', 5, 1.2],
        ['F#', 5, 0.6], ['G', 5, 0.6], ['A', 5, 0.6], ['B', 4, 0.3], ['C#', 5, 0.3],
        ['D', 5, 0.6], ['C#', 5, 0.6], ['B', 4, 0.6], ['A', 4, 0.6],
        ['G', 4, 0.6], ['F#', 4, 0.6], ['G', 4, 0.6], ['E', 4, 1.2]
      ];

      this.freqs = {
        'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C#5': 554.37,
        'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00
      };
    }

    playNote(freq, dur) {
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);
    }

    startSynth() {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      let idx = 0;
      const step = () => {
        if (!this.isPlaying) return;
        const [n, oct, dur] = this.melody[idx];
        const freq = this.freqs[`${n}${oct}`] || 440;
        this.playNote(freq, dur * 1.5);
        if (idx % 4 === 0) this.playNote(freq / 2, dur * 2.2);

        idx = (idx + 1) % this.melody.length;
        this.timer = setTimeout(step, dur * 1000);
      };
      step();
    }

    play() {
      this.isPlaying = true;
      if (this.audioElem && this.audioElem.src && !this.audioElem.src.endsWith('/')) {
        this.audioElem.play().catch(() => this.startSynth());
      } else {
        this.startSynth();
      }
    }

    pause() {
      this.isPlaying = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.audioElem) this.audioElem.pause();
    }

    toggle() {
      if (this.isPlaying) this.pause();
      else this.play();
      return this.isPlaying;
    }
  }

  const audioManager = new WeddingAudioPlayer();

  /* ==========================================================================
     Confetti Burst Helper
     ========================================================================== */
  function triggerConfetti(x, y) {
    const colors = ['#123467', '#1a4080', '#c5a059', '#e8d39e', '#6f8cbf', '#ffffff'];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${6 + Math.random() * 8}px`;
      el.style.height = `${6 + Math.random() * 10}px`;
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.zIndex = '99999';
      el.style.pointerEvents = 'none';

      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 80 + Math.random() * 220;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity + 100;
      const rotation = Math.random() * 720;

      el.animate([
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) rotate(${rotation}deg) scale(0)`, opacity: 0 }
      ], {
        duration: 900 + Math.random() * 700,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
      }).onfinish = () => el.remove();
    }
  }

  /* ==========================================================================
     Main Wedding Component
     ========================================================================== */
  function WeddingApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const startOpened = urlParams.get('open') === '1';

    const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(startOpened);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [isRsvpOpen, setIsRsvpOpen] = useState(false);
    const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
    const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);

    // Countdown state
    const [countdown, setCountdown] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

    // References
    const cardsRef = useRef([]);
    const touchStartRef = useRef(0);
    const palaceWrapRef = useRef(null);

    // 1. Initialize Countdown Timer
    useEffect(() => {
      const targetDate = new Date('2026-12-10T18:00:00+02:00').getTime();
      function updateTimer() {
        const diff = targetDate - new Date().getTime();
        if (diff <= 0) return;
        setCountdown({
          days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
          hours: String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
          mins: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
          secs: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
        });
      }
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, []);

    // 2. Setup GSAP ScrollTrigger for Palace & Clouds Parallax
    useEffect(() => {
      if (!window.gsap || !window.ScrollTrigger) return;
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;

      // Parallax on Palace & Clouds
      const cloud1 = document.querySelector('.palace-cloud.cloud-1');
      const cloud2 = document.querySelector('.palace-cloud.cloud-2');
      const cloud3 = document.querySelector('.palace-cloud.cloud-3');
      const palace = document.querySelector('.palace-home');
      const bgFloral = document.querySelector('.bg-floral-watermark');

      if (cloud1) {
        gsap.to(cloud1, {
          scrollTrigger: {
            trigger: '.palace-container',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          },
          x: 90,
          y: -35,
          ease: 'none'
        });
      }

      if (cloud2) {
        gsap.to(cloud2, {
          scrollTrigger: {
            trigger: '.palace-container',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          },
          x: -80,
          y: -25,
          ease: 'none'
        });
      }

      if (cloud3) {
        gsap.to(cloud3, {
          scrollTrigger: {
            trigger: '.palace-container',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.8
          },
          y: -50,
          scale: 1.08,
          ease: 'none'
        });
      }

      if (palace) {
        gsap.to(palace, {
          scrollTrigger: {
            trigger: '.palace-container',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          },
          y: 35,
          scale: 1.02,
          ease: 'none'
        });
      }

      if (bgFloral) {
        gsap.to(bgFloral, {
          scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2
          },
          y: 200,
          rotation: 15,
          ease: 'none'
        });
      }

      return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }, [isEnvelopeOpen]);

    // 3. Animate 3D Coverflow Cards with GSAP
    useEffect(() => {
      if (!window.gsap) return;
      const gsap = window.gsap;
      const total = GALLERY_PHOTOS.length;

      cardsRef.current.forEach((card, idx) => {
        if (!card) return;
        let offset = idx - activeCardIndex;
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        let x = 0;
        let z = 0;
        let rotY = 0;
        let scale = 1;
        let opacity = 1;
        let zIndex = 100;

        if (offset === 0) {
          x = 0;
          z = 0;
          rotY = 0;
          scale = 1;
          opacity = 1;
          zIndex = 100;
          card.classList.add('active-card');
        } else if (offset === 1) {
          x = 60;
          z = -150;
          rotY = -40;
          scale = 0.85;
          opacity = 0.75;
          zIndex = 90;
          card.classList.remove('active-card');
        } else if (offset === -1) {
          x = -60;
          z = -150;
          rotY = 40;
          scale = 0.85;
          opacity = 0.75;
          zIndex = 90;
          card.classList.remove('active-card');
        } else if (offset === 2) {
          x = 110;
          z = -300;
          rotY = -65;
          scale = 0.7;
          opacity = 0.45;
          zIndex = 80;
          card.classList.remove('active-card');
        } else if (offset === -2) {
          x = -110;
          z = -300;
          rotY = 65;
          scale = 0.7;
          opacity = 0.45;
          zIndex = 80;
          card.classList.remove('active-card');
        } else {
          x = offset > 0 ? 150 : -150;
          z = -450;
          rotY = offset > 0 ? -90 : 90;
          scale = 0.5;
          opacity = 0;
          zIndex = 50;
          card.classList.remove('active-card');
        }

        gsap.to(card, {
          duration: 0.85,
          xPercent: x,
          z: z,
          rotationY: rotY,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex,
          ease: 'power3.out'
        });
      });
    }, [activeCardIndex]);

    // Handle Envelope Open with GSAP
    const handleOpenEnvelope = () => {
      triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.4);
      audioManager.play();
      setIsPlayingMusic(true);

      if (window.gsap) {
        const gsap = window.gsap;
        const tl = gsap.timeline();
        tl.to('#wax-seal', { scale: 1.25, duration: 0.2, ease: 'back.out(2)' })
          .to('#wax-seal', { opacity: 0, scale: 0.5, duration: 0.2 })
          .to('.envelope-card', { rotateX: -10, scale: 1.04, duration: 0.4, ease: 'power2.out' })
          .to('#envelope-container', {
            opacity: 0,
            scale: 1.06,
            duration: 0.6,
            ease: 'power3.inOut',
            onComplete: () => {
              setIsEnvelopeOpen(true);
              document.body.style.overflow = 'auto';
              if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            }
          });
      } else {
        setIsEnvelopeOpen(true);
      }
    };

    // Toggle Music
    const handleToggleMusic = () => {
      const playing = audioManager.toggle();
      setIsPlayingMusic(playing);
    };

    // Gallery Next / Prev
    const handleNextCard = () => {
      setActiveCardIndex(prev => (prev + 1) % GALLERY_PHOTOS.length);
    };

    const handlePrevCard = () => {
      setActiveCardIndex(prev => (prev - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
    };

    // Touch Swipe on Gallery
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const diff = e.changedTouches[0].clientX - touchStartRef.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) handlePrevCard();
        else handleNextCard();
      }
    };

    // Wheel Scroll over Gallery
    const handleWheelScroll = (e) => {
      if (Math.abs(e.deltaX) > 25 || Math.abs(e.deltaY) > 40) {
        if (e.deltaX > 0 || e.deltaY > 0) handleNextCard();
        else handlePrevCard();
      }
    };

    // RSVP Submit Handler
    const handleRsvpSubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.elements['rsvp-name'].value.trim();
      const attending = form.elements['rsvp-attending'].value;
      const guests = form.elements['rsvp-guests'].value;
      const message = form.elements['rsvp-message'].value.trim();

      const rsvp = { name, attending, guests, message, date: new Date().toISOString() };
      
      // 1. Save in local storage (guest browser backup)
      try {
        const stored = JSON.parse(localStorage.getItem('karim_nadine_rsvps') || '[]');
        stored.push(rsvp);
        localStorage.setItem('karim_nadine_rsvps', JSON.stringify(stored));
      } catch (err) {}

      setIsSubmittingRsvp(true);

      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
      const payload = {
        name: name,
        attending: attending,
        guests: guests,
        message: message,
        timestamp: timestamp
      };

      // 2. Save directly to live Cloud Database for the Guestbook website
      const saveToCloud = async () => {
        try {
          const res = await fetch(GUESTBOOK_DB_URL);
          const current = await res.json();
          const list = (current && current.data && Array.isArray(current.data.rsvps)) ? current.data.rsvps : [];
          
          list.push({
            id: 'rsvp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            name: name,
            attending: attending === 'yes' || attending === 'Joyfully Accept',
            guests: parseInt(guests, 10) || 1,
            wish: message || '',
            timestamp: timestamp
          });

          await fetch(GUESTBOOK_DB_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Karim & Nadine Wedding Live RSVPs Master Database',
              data: { rsvps: list }
            })
          });
        } catch (err) {
          console.warn('Live guestbook cloud sync error:', err);
        }
      };

      // Wait with a safety timeout so guests always receive smooth confirmation
      try {
        await Promise.race([
          saveToCloud(),
          new Promise(resolve => setTimeout(resolve, 2500))
        ]);
      } catch (err) {}

      setIsSubmittingRsvp(false);
      triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.5);
      setRsvpSubmitted(true);

      setTimeout(() => {
        setIsRsvpOpen(false);
        setRsvpSubmitted(false);
        form.reset();
      }, 3500);
    };

    return h('div', { className: 'wedding-root' },
      // 1. Envelope Screen
      !isEnvelopeOpen && h('div', { id: 'envelope-container' },
        h('div', { className: 'ambient-petals' },
          Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const duration = 16 + Math.random() * 10;
            const delay = -(Math.random() * duration);
            const size = 11 + Math.random() * 14;
            const colors = ['#6f8cbf', '#cfdcec', '#3a5a8f', '#e6eef7'];
            const color = colors[i % colors.length];
            return h('div', {
              key: i,
              className: 'ambient-petal',
              style: {
                left: `${left}%`,
                fontSize: `${size}px`,
                color: color,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
                '--sway': `${(Math.random() - 0.5) * 40}px`
              }
            }, h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: '1em', height: '1em' },
              h('g', null,
                h('ellipse', { cx: '12', cy: '5', rx: '2.2', ry: '4.5' }),
                h('ellipse', { cx: '12', cy: '5', rx: '2.2', ry: '4.5', transform: 'rotate(60 12 12)' }),
                h('ellipse', { cx: '12', cy: '5', rx: '2.2', ry: '4.5', transform: 'rotate(120 12 12)' }),
                h('ellipse', { cx: '12', cy: '5', rx: '2.2', ry: '4.5', transform: 'rotate(180 12 12)' }),
                h('ellipse', { cx: '12', cy: '5', rx: '2.2', ry: '4.5', transform: 'rotate(240 12 12)' }),
                h('ellipse', { cx: '12', cy: '5', rx: '2.2', ry: '4.5', transform: 'rotate(300 12 12)' })
              ),
              h('circle', { cx: '12', cy: '12', r: '1.8', fillOpacity: '0.45' })
            ));
          })
        ),
        h('div', { className: 'envelope-wrapper' },
          h('div', {
            id: 'wax-seal',
            className: 'wax-seal',
            onClick: handleOpenEnvelope,
            title: 'Tap to open invitation'
          },
            h('svg', { viewBox: '0 0 24 24' },
              h('path', { d: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' })
            )
          ),
          h('div', { className: 'envelope-card' },
            h('img', { src: 'assets/theme/hoa.webp', className: 'envelope-card-bg-left', alt: '', 'aria-hidden': true }),
            h('img', { src: 'assets/theme/hoa.webp', className: 'envelope-card-bg-right', alt: '', 'aria-hidden': true }),
            h('h1', {
              style: { color: '#123467', fontFamily: 'var(--font-viaoda)' },
              className: 'mb-2 flex flex-col items-center leading-tight text-3xl sm:text-4xl'
            },
              h('span', { className: 'block w-full text-center' }, 'Karim'),
              h('span', {
                style: { fontFamily: 'var(--font-alex)' },
                className: 'block w-full text-center text-lg leading-none sm:text-xl my-1'
              }, '&'),
              h('span', { className: 'block w-full text-center' }, 'Nadine')
            ),
            h('div', { className: 'flex items-center justify-center gap-3 mb-2' },
              h('div', { style: { background: 'linear-gradient(to right, transparent, #123467)', width: '40px', height: '1px' } }),
              h('span', { style: { color: '#123467', opacity: 0.7, fontSize: '13px' } }, 'â—†'),
              h('div', { style: { background: 'linear-gradient(to left, transparent, #123467)', width: '40px', height: '1px' } })
            ),
            h('div', {
              style: { color: 'rgba(18, 52, 103, 0.78)', fontFamily: 'var(--font-lora)', fontSize: '18px' },
              className: 'mb-4'
            }, 'December 10, 2026'),
            h('div', {
              style: { color: 'rgba(18, 52, 103, 0.78)', fontFamily: 'var(--font-lora)', fontSize: '18px', fontStyle: 'italic' },
              className: 'mb-6'
            }, 'Cordially Invites'),
            h('button', {
              type: 'button',
              className: 'envelope-open-btn',
              onClick: handleOpenEnvelope
            },
              h('span', null, 'Open'),
              h('div', { className: 'envelope-open-shine' })
            )
          )
        )
      ),

      // 2. Floating Music Toggle Button
      h('button', {
        id: 'music-toggle',
        className: `music-toggle-btn ${isPlayingMusic ? 'playing' : ''}`,
        onClick: handleToggleMusic,
        'aria-label': 'Toggle background music',
        title: isPlayingMusic ? 'Pause music' : 'Play music'
      },
        h('svg', { viewBox: '0 0 24 24' },
          h('path', { d: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' })
        )
      ),

      // 3. Main Invitation Body (Matching ChungDoi Chateau Blue Structure Exactly)
      h('div', {
        className: 'flex w-full justify-center overflow-x-clip bg-white overflow-clip scrollbar-none',
        'data-testid': 'chateau-blue-template'
      },
        h('div', {
          className: 'relative w-full max-w-[480px] md:max-w-[900px] md:mx-auto overflow-hidden md:border md:border-[#12346722] isolate !overflow-visible md:!overflow-hidden',
          style: { backgroundColor: '#FFFFFF', color: '#123467' }
        },
          // Background Floral Watermark (Parallax)
          h('img', {
            src: 'assets/theme/hoa.webp',
            alt: '',
            'aria-hidden': true,
            className: 'bg-floral-watermark pointer-events-none absolute top-[640px] md:top-[760px] -left-[25%] md:-left-[15%] h-[900px] md:h-[1400px] lg:h-[1200px] w-auto max-w-none object-contain opacity-[0.15] -z-10',
            style: { willChange: 'transform' },
            loading: 'eager',
            decoding: 'async'
          }),

          // HERO SECTION
          h('section', { className: 'relative isolate w-full' },
            h('header', { className: 'relative z-20 flex w-full flex-col items-center px-4 sm:px-5 pt-[80px] md:pt-[110px] pb-6 md:pb-10' },
              // Crest Ornament
              h('img', {
                src: 'assets/theme/asset-2.webp',
                alt: '',
                'aria-hidden': true,
                className: 'relative z-30 mb-3 md:mb-4 h-[32px] md:h-[38px] w-auto object-contain opacity-95',
                loading: 'eager',
                decoding: 'async'
              }),
              // Welcome Header
              h('div', { className: 'relative z-30 flex items-center justify-center gap-3 md:gap-4' },
                h('img', { src: 'assets/theme/asset-1.webp', alt: '', 'aria-hidden': true, className: 'h-auto w-[56px] md:w-[80px] object-contain opacity-90' }),
                h('p', {
                  className: 'uppercase text-center text-[15px] md:text-[20px] tracking-[0.02em] whitespace-pre',
                  style: { fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#123467' }
                }, 'Welcome To Our Wedding'),
                h('img', { src: 'assets/theme/asset-1.webp', alt: '', 'aria-hidden': true, className: 'h-auto w-[56px] md:w-[80px] object-contain opacity-90 scale-x-[-1]' })
              ),
              // Couple Names
              h('div', {
                className: 'relative z-30 mt-14 md:mt-20 flex flex-col items-center text-center leading-none',
                style: { fontFamily: 'var(--font-viaoda)', color: '#123467', textTransform: 'uppercase' }
              },
                h('span', { style: { fontSize: 'clamp(38px, 9vw, 70px)', lineHeight: 1.3, paddingTop: '0.18em' } }, 'Karim'),
                h('span', {
                  className: 'my-6 md:my-8',
                  style: { fontFamily: 'var(--font-alex)', fontSize: 'clamp(20px, 4.5vw, 32px)', textTransform: 'none', lineHeight: 1, opacity: 0.95 }
                }, '&'),
                h('span', { style: { fontSize: 'clamp(38px, 9vw, 70px)', lineHeight: 1.3, paddingTop: '0.18em' } }, 'Nadine')
              ),
              // The Grand Palace & Parallax Clouds
              h('div', { ref: palaceWrapRef, className: 'palace-container relative mt-6 md:mt-10 shrink-0' },
                h('img', {
                  src: 'assets/theme/cloud-3.webp',
                  alt: '',
                  'aria-hidden': true,
                  className: 'palace-cloud cloud-3',
                  loading: 'eager',
                  decoding: 'async'
                }),
                h('img', {
                  src: 'assets/theme/cloud-1.webp',
                  alt: '',
                  'aria-hidden': true,
                  className: 'palace-cloud cloud-1',
                  loading: 'eager',
                  decoding: 'async'
                }),
                h('img', {
                  src: 'assets/theme/cloud-2.webp',
                  alt: '',
                  'aria-hidden': true,
                  className: 'palace-cloud cloud-2',
                  loading: 'eager',
                  decoding: 'async'
                }),
                h('img', {
                  src: 'assets/theme/home.webp',
                  alt: 'Chateau illustration',
                  'aria-hidden': true,
                  className: 'palace-home',
                  loading: 'eager',
                  decoding: 'async'
                })
              )
            )
          ),

          // ANNOUNCEMENT SECTION
          h('section', { className: 'relative isolate px-[12px] md:px-[24px] pt-[8px] md:pt-[40px] pb-[56px] md:pb-[80px] z-10' },
            h('div', { className: 'relative z-10 flex flex-col gap-6 md:gap-8' },
              h('div', {
                className: 'relative text-center text-[16px] md:text-[20px] flex flex-col gap-2 mx-auto md:max-w-[560px]',
                style: { whiteSpace: 'pre-line', fontFamily: 'var(--font-baskerville)', color: '#123467' }
              },
                h('span', { dir: 'auto' }, "THE MOMENT WE'VE BEEN WAITING FOR\nTHE WEDDING OF")
              ),
              h('div', { className: 'w-full min-w-0 relative flex flex-col items-center text-center gap-3 md:gap-4' },
                h('h3', {
                  className: 'w-[80%] min-h-[60px] flex items-center justify-center leading-[42px] md:leading-[60px] whitespace-nowrap',
                  style: { fontSize: '40px', fontFamily: 'var(--font-eb)' }
                }, 'Karim'),
                h('div', {
                  className: 'text-[24px] md:text-[32px]',
                  style: { color: '#123467', fontFamily: 'var(--font-alex)' }
                }, '&'),
                h('h3', {
                  className: 'w-[80%] min-h-[60px] flex items-center justify-center leading-[42px] md:leading-[60px] whitespace-nowrap',
                  style: { fontSize: '40px', fontFamily: 'var(--font-eb)' }
                }, 'Nadine')
              ),

              // PHOTO GALLERY SECTION WITH 3D COVERFLOW & GSAP
              h('div', { className: 'relative w-full' },
                h('div', { className: 'relative flex flex-col items-center z-10 pt-[36px] md:pt-[56px]' },
                  h('h2', {
                    className: 'uppercase font-bold text-[20px] md:text-[24px] text-center mb-6',
                    style: { color: '#123467', fontFamily: 'var(--font-cormorant)', fontWeight: 700, letterSpacing: '0.1em' }
                  }, 'Photo Gallery'),
                  h('div', {
                    className: 'mt-6 w-full max-w-[432px] md:max-w-[600px]',
                    onWheel: handleWheelScroll
                  },
                    h('div', {
                      className: 'relative h-[340px] md:h-[520px] touch-pan-y',
                      onTouchStart: handleTouchStart,
                      onTouchEnd: handleTouchEnd
                    },
                      // Nav Arrows
                      h('button', {
                        type: 'button',
                        className: 'gallery-nav-arrow prev hidden md:flex',
                        onClick: handlePrevCard,
                        'aria-label': 'Previous photo'
                      }, 'â®'),
                      h('button', {
                        type: 'button',
                        className: 'gallery-nav-arrow next hidden md:flex',
                        onClick: handleNextCard,
                        'aria-label': 'Next photo'
                      }, 'â¯'),
                      // 3D Card Deck
                      h('div', {
                        className: 'relative w-full h-full flex items-center justify-center',
                        style: { perspective: '1000px' }
                      },
                        GALLERY_PHOTOS.map((photo, idx) =>
                          h('div', {
                            key: photo.id,
                            ref: el => cardsRef.current[idx] = el,
                            className: 'gallery-coverflow-card',
                            onClick: () => {
                              if (idx === activeCardIndex) setLightboxIndex(idx);
                              else setActiveCardIndex(idx);
                            }
                          },
                            h('img', { src: photo.url, alt: photo.alt, loading: 'lazy' })
                          )
                        )
                      )
                    ),
                    // Dot Indicators
                    h('div', { className: 'flex justify-center gap-1.5 mt-3' },
                      GALLERY_PHOTOS.map((_, i) =>
                        h('button', {
                          key: i,
                          type: 'button',
                          className: `gallery-dot-btn ${i === activeCardIndex ? 'active' : 'inactive'}`,
                          onClick: () => setActiveCardIndex(i),
                          'aria-label': `Go to photo ${i + 1}`
                        })
                      )
                    )
                  )
                )
              ),

              // HORIZONTAL FLORAL DIVIDER
              h('div', { className: 'relative flex justify-center mt-6' },
                h('img', {
                  src: 'assets/theme/hoa-ngang.webp',
                  alt: '',
                  'aria-hidden': true,
                  className: 'h-auto w-[380px] md:w-[680px] object-contain',
                  loading: 'lazy',
                  decoding: 'async'
                })
              ),

              // CELEBRATION DETAILS, COUNTDOWN & CALENDAR
              h('div', { className: 'relative w-full flex flex-col items-center mt-6' },
                h('div', {
                  className: 'flex flex-col items-center gap-4 md:gap-5 text-center',
                  style: { fontFamily: 'var(--font-baskerville)', color: '#123467' }
                },
                  h('h3', {
                    className: 'text-[16px] md:text-[20px] uppercase flex flex-col items-center tracking-[0.1em]',
                    style: { fontWeight: 600 }
                  }, 'The celebration will take place at:'),
                  h('div', { className: 'text-[20px] md:text-[30px]' }, '6:00 PM'),
                  h('div', { className: 'flex items-center gap-6' },
                    h('span', { className: 'text-[12px] md:text-[16px] uppercase' }, 'THURSDAY'),
                    h('div', { className: 'w-[2px] h-6 md:h-8', style: { backgroundColor: '#123467' } }),
                    h('span', { className: 'text-[30px] md:text-[40px]', style: { fontWeight: 700 } }, '10'),
                    h('div', { className: 'w-[2px] h-6 md:h-8', style: { backgroundColor: '#123467' } }),
                    h('span', { className: 'text-[12px] md:text-[16px] uppercase' }, 'DECEMBER')
                  ),
                  h('div', { className: 'text-[18px] md:text-[24px]', style: { fontWeight: 600 } }, '2026'),

                  // Countdown
                  h('div', { className: 'flex items-center justify-center flex-col mt-4' },
                    h('h4', {
                      className: 'text-[16px] md:text-[18px] uppercase tracking-[0.1em] mb-3',
                      style: { fontWeight: 600 }
                    }, 'Countdown'),
                    h('div', { className: 'flex gap-2' },
                      h('div', { className: 'countdown-box' },
                        h('div', { className: 'countdown-number' }, countdown.days),
                        h('div', { className: 'countdown-label' }, 'Days')
                      ),
                      h('div', { className: 'countdown-box' },
                        h('div', { className: 'countdown-number' }, countdown.hours),
                        h('div', { className: 'countdown-label' }, 'Hours')
                      ),
                      h('div', { className: 'countdown-box' },
                        h('div', { className: 'countdown-number' }, countdown.mins),
                        h('div', { className: 'countdown-label' }, 'Mins')
                      ),
                      h('div', { className: 'countdown-box' },
                        h('div', { className: 'countdown-number' }, countdown.secs),
                        h('div', { className: 'countdown-label' }, 'Secs')
                      )
                    )
                  )
                ),

                // Framed Calendar (December 2026)
                h('div', { className: 'relative mx-auto mt-8 md:mt-10 w-full max-w-[340px] md:max-w-[420px] aspect-[388/307]' },
                  h('img', {
                    src: 'assets/theme/frame-lich.webp',
                    alt: '',
                    'aria-hidden': true,
                    className: 'pointer-events-none absolute inset-0 h-full w-full object-fill',
                    loading: 'lazy',
                    decoding: 'async'
                  }),
                  h('div', { className: 'relative h-full w-full px-7 md:px-10 py-5 md:py-7 flex items-center justify-center' },
                    h('div', { className: 'w-full max-w-[280px] md:max-w-[310px] mx-auto', style: { color: '#123467' } },
                      h('div', {
                        className: 'text-center py-2.5 text-[13px] md:text-[14px] font-semibold tracking-wide border-b',
                        style: { borderColor: 'rgba(18, 52, 103, 0.25)' }
                      }, 'December 2026'),
                      h('div', {
                        className: 'grid grid-cols-7 border-b-2 py-1.5 text-center text-[10px] md:text-[11px] font-medium opacity-60',
                        style: { borderColor: '#123467' }
                      },
                        h('div', null, 'Mo'), h('div', null, 'Tu'), h('div', null, 'We'),
                        h('div', null, 'Th'), h('div', null, 'Fr'), h('div', null, 'Sa'), h('div', null, 'Su')
                      ),
                      h('div', { className: 'grid grid-cols-7 gap-y-0.5 px-1 py-2 text-center text-[12px] md:text-[13px]' },
                        h('div', { className: 'h-[30px] md:h-[34px] flex items-center justify-center' }),
                        [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d =>
                          h('div', { key: d, className: 'h-[30px] md:h-[34px] flex items-center justify-center' }, d)
                        ),
                        // 10th with Heart Marker
                        h('div', { className: 'h-[30px] md:h-[34px] flex items-center justify-center' },
                          h('div', { className: 'relative w-[26px] h-[24px] md:w-[30px] md:h-[28px] flex items-center justify-center' },
                            h('svg', { viewBox: '0 0 24 22', className: 'absolute inset-0 w-full h-full drop-shadow-sm', fill: '#123467' },
                              h('path', { d: 'M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z' })
                            ),
                            h('span', { className: 'relative z-10 text-[11px] md:text-[12px] font-bold text-white' }, '10')
                          )
                        ),
                        Array.from({ length: 21 }, (_, i) => i + 11).map(d =>
                          h('div', { key: d, className: 'h-[30px] md:h-[34px] flex items-center justify-center' }, d)
                        )
                      )
                    )
                  )
                ),

                // Add to Calendar Link
                h('div', { className: 'mt-3 flex justify-center' },
                  h('a', {
                    href: 'https://www.google.com/calendar/render?action=TEMPLATE&text=Karim%20%26%20Nadine%27s%20Wedding%20Celebration&dates=20261210T160000Z/20261210T220000Z&ctz=Africa/Cairo&details=Join%20us%20to%20celebrate%20the%20marriage%20of%20Karim%20%26%20Nadine%20at%20QASR%20RAS%20ELTEEN&location=QASR%20RAS%20ELTEEN',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'inline-flex items-center justify-center text-sm tracking-wider underline underline-offset-4 decoration-1 hover:opacity-70',
                    style: { color: '#123467', fontFamily: 'var(--font-baskerville)' }
                  }, 'Add to Calendar')
                ),

                // RSVP BUTTON
                h('div', { className: 'relative z-10 flex flex-col items-center justify-center w-full mt-6 md:mt-8' },
                  h('button', {
                    type: 'button',
                    className: 'text-sm md:text-base tracking-wider inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold transition-transform hover:scale-[1.03]',
                    style: {
                      backgroundColor: '#123467',
                      color: '#ffffff',
                      fontFamily: 'var(--font-baskerville)',
                      boxShadow: '0 4px 14px rgba(18, 52, 103, 0.35)'
                    },
                    onClick: () => setIsRsvpOpen(true)
                  },
                    h('span', { className: 'relative z-10 flex min-h-0 items-center justify-center gap-2' },
                      h('span', { dir: 'auto' }, 'CONFIRM ATTENDANCE')
                    )
                  )
                )
              )
            )
          ),

          // VENUE SECTION
          h('section', { className: 'relative flex flex-col gap-6 md:gap-8 px-6 md:px-10 pb-12 md:pb-16' },
            h('div', { className: 'flex justify-center' },
              h('img', {
                src: 'assets/theme/ban-tiec.webp',
                alt: 'Banquet',
                className: 'h-auto w-[450px] md:w-[730px] object-contain',
                loading: 'lazy',
                decoding: 'async'
              })
            ),
            h('div', { className: 'relative text-center' },
              h('h3', {
                className: 'uppercase font-bold text-[20px] md:text-[24px] text-center',
                style: { color: '#123467', fontFamily: "'Times New Roman', serif", letterSpacing: '0.1em' }
              }, 'QASR RAS ELTEEN'),
              h('div', {
                className: 'whitespace-pre-line mx-auto mt-3 max-w-sm md:max-w-[500px] text-center text-sm md:text-base tracking-wide flex flex-col items-center pb-3 border-b border-[#12346720]',
                style: { color: '#123467', fontFamily: 'var(--font-baskerville)' }
              }, 'QASR RAS ELTEEN, Alexandria, Egypt'),
              h('div', { className: 'mt-3' },
                h('a', {
                  href: 'https://www.google.com/maps/search/?api=1&query=QASR+RAS+ELTEEN+Alexandria',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'inline-flex items-center gap-1.5 text-xs text-[#123467] bg-[#12346710] hover:bg-[#12346720] px-4 py-2 rounded-full font-medium transition-colors'
                }, 'ðŸ“ View on Google Maps')
              )
            )
          ),

          // THANK YOU & FOOTER SECTION
          h('div', { className: 'relative flex justify-center pb-6 md:pb-10' },
            h('img', {
              src: 'assets/theme/chim.webp',
              alt: '',
              'aria-hidden': true,
              className: 'h-auto w-[480px] md:w-[680px] object-contain',
              loading: 'lazy',
              decoding: 'async'
            })
          ),
          h('footer', { className: 'relative flex flex-col items-center px-6 md:px-10 pb-16 md:pb-20 text-center z-10' },
            h('p', {
              className: 'whitespace-pre-line flex flex-col items-center gap-1 text-sm md:text-lg mx-auto md:max-w-[560px] italic',
              style: { color: '#123467', fontFamily: 'var(--font-baskerville)', lineHeight: 1.7 }
            }, 'Thank you for being part of our special day. Your presence means more to us than words can say.'),
            h('div', {
              className: 'mt-6 text-3xl md:text-4xl',
              style: { fontFamily: 'var(--font-alex)', color: '#123467' }
            }, 'Karim & Nadine'),
            h('div', { className: 'mt-2 text-xs opacity-50', style: { color: '#123467' } }, 'December 10, 2026')
          )
        )
      ),

      // 4. Fullscreen Lightbox Modal
      lightboxIndex !== null && h('div', {
        className: 'lightbox-dialog open',
        onClick: (e) => {
          if (e.target.classList.contains('lightbox-dialog') || e.target.classList.contains('lightbox-close-btn')) {
            setLightboxIndex(null);
          }
        }
      },
        h('div', { className: 'w-full flex justify-between items-center px-4 py-2 z-10' },
          h('div', { className: 'text-white text-sm bg-black/50 px-3 py-1 rounded-full' },
            `${lightboxIndex + 1} / ${GALLERY_PHOTOS.length}`
          ),
          h('button', {
            className: 'lightbox-close-btn text-white text-2xl font-bold bg-white/20 hover:bg-white/30 rounded-full w-9 h-9 flex items-center justify-center',
            onClick: () => setLightboxIndex(null)
          }, 'Ã—')
        ),
        h('div', { className: 'relative flex-1 w-full max-w-4xl flex items-center justify-center px-4 min-h-0' },
          h('button', {
            className: 'absolute left-2 text-white text-3xl bg-black/40 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center z-20',
            onClick: () => setLightboxIndex((lightboxIndex - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length)
          }, 'â®'),
          h('img', {
            src: GALLERY_PHOTOS[lightboxIndex].url,
            alt: 'Expanded',
            className: 'max-h-full max-w-full rounded-xl object-contain shadow-2xl'
          }),
          h('button', {
            className: 'absolute right-2 text-white text-3xl bg-black/40 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center z-20',
            onClick: () => setLightboxIndex((lightboxIndex + 1) % GALLERY_PHOTOS.length)
          }, 'â¯')
        ),
        // Thumbnails Strip
        h('div', { className: 'flex gap-2 overflow-x-auto p-2 bg-black/40 rounded-lg max-w-[90vw]' },
          GALLERY_PHOTOS.map((p, i) =>
            h('button', {
              key: p.id,
              className: `w-12 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${i === lightboxIndex ? 'border-white scale-105' : 'border-transparent opacity-60'}`,
              onClick: () => setLightboxIndex(i)
            },
              h('img', { src: p.url, className: 'w-full h-full object-cover' })
            )
          )
        )
      ),

      // 5. Interactive RSVP Modal
      isRsvpOpen && h('div', {
        className: 'rsvp-modal-overlay open',
        onClick: (e) => {
          if (e.target.classList.contains('rsvp-modal-overlay')) setIsRsvpOpen(false);
        }
      },
        h('div', { className: 'rsvp-modal-card' },
          h('button', {
            className: 'absolute top-4 right-4 text-2xl text-[#123467] hover:opacity-70 bg-transparent border-0 cursor-pointer',
            onClick: () => setIsRsvpOpen(false)
          }, 'Ã—'),
          h('h3', {
            className: 'text-2xl font-bold text-center mb-1',
            style: { color: '#123467', fontFamily: 'var(--font-cormorant)' }
          }, 'Confirm Attendance'),
          h('p', { className: 'text-xs text-center text-gray-500 mb-6' }, 'Please let Karim & Nadine know if you will celebrate with them.'),

          !rsvpSubmitted ? h('form', { onSubmit: handleRsvpSubmit, className: 'flex flex-col gap-4' },
            h('div', null,
              h('label', { className: 'block text-xs font-semibold text-[#123467] mb-1' }, 'Your Full Name *'),
              h('input', {
                type: 'text',
                name: 'rsvp-name',
                required: true,
                placeholder: 'e.g. Sarah & Michael',
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#123467]'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-xs font-semibold text-[#123467] mb-1' }, 'Will you attend? *'),
              h('div', { className: 'flex gap-3' },
                h('label', { className: 'flex-1 border border-gray-200 rounded-lg p-2.5 text-center text-xs font-semibold cursor-pointer hover:border-[#123467]' },
                  h('input', { type: 'radio', name: 'rsvp-attending', value: 'yes', defaultChecked: true, className: 'mr-1.5' }),
                  'Joyfully Accept'
                ),
                h('label', { className: 'flex-1 border border-gray-200 rounded-lg p-2.5 text-center text-xs font-semibold cursor-pointer hover:border-[#123467]' },
                  h('input', { type: 'radio', name: 'rsvp-attending', value: 'no', className: 'mr-1.5' }),
                  'Regretfully Decline'
                )
              )
            ),
            h('div', null,
              h('label', { className: 'block text-xs font-semibold text-[#123467] mb-1' }, 'Number of Guests'),
              h('select', {
                name: 'rsvp-guests',
                defaultValue: '2',
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#123467]'
              },
                h('option', { value: '1' }, '1 Guest'),
                h('option', { value: '2' }, '2 Guests'),
                h('option', { value: '3' }, '3 Guests'),
                h('option', { value: '4' }, '4 Guests'),
                h('option', { value: '5+' }, '5+ Guests')
              )
            ),
            h('div', null,
              h('label', { className: 'block text-xs font-semibold text-[#123467] mb-1' }, 'Wishes for the Couple'),
              h('textarea', {
                name: 'rsvp-message',
                rows: 3,
                placeholder: 'Leave your heartfelt wishes here...',
                className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#123467]'
              })
            ),
            h('button', {
              type: 'submit',
              disabled: isSubmittingRsvp,
              className: 'w-full py-3 rounded-xl font-semibold text-white bg-[#123467] hover:bg-[#1a4080] transition-colors mt-2 text-sm uppercase tracking-wider disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            },
              isSubmittingRsvp && h('span', {
                style: {
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'music-spin 0.8s linear infinite'
                }
              }),
              isSubmittingRsvp ? 'Confirming Attendance...' : 'Send Confirmation'
            )
          ) : h('div', { className: 'text-center py-6' },
            h('div', { className: 'text-4xl text-green-600 mb-3' }, 'âœ“'),
            h('h4', { className: 'text-xl font-bold text-[#123467] mb-2' }, 'Thank You!'),
            h('p', { className: 'text-sm text-gray-600' }, 'Your RSVP has been confirmed. We look forward to seeing you on December 10, 2026!')
          )
        )
      )
    );
  }

  // Mount React Root
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(h(WeddingApp));
  }
})();

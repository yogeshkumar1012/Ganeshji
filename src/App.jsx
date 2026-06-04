import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './components/Scene';
import { Volume2, VolumeX } from 'lucide-react';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function App() {
  const containerRef = useRef();
  const progressBarRef = useRef();
  
  // Shared ref for 3D element animations inside useFrame
  const animValues = useRef({
    ganeshaY: 1.2,
    ganeshaRotY: 0,
    ganeshaScale: 1,
    ganeshaOpacity: 1,
    rainIntensity: 0,
    plantScale: 0
  });

  // Refs for targeting elements inside the Scene
  const ganeshaRef = useRef();
  const plantRef = useRef();
  const potRef = useRef();

  // Audio system state (using Web Audio API for a self-contained meditative drone synth)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef([]);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      // Stop the meditative synth hum
      if (synthNodesRef.current) {
        synthNodesRef.current.forEach(node => {
          try { node.stop(); } catch(e) {}
          node.disconnect();
        });
        synthNodesRef.current = [];
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAudioPlaying(false);
    } else {
      // Start the meditative synth hum (108Hz sacred frequency drone)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      // Deep spiritual frequencies (108Hz & 162Hz fifth harmony)
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(108, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(162, ctx.currentTime);

      // Warm low-pass filter to sound like a distant singing bowl
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      // Low volume for gentle ambient background drone
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

      // Connect nodes
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      synthNodesRef.current = [osc1, osc2, filter, gainNode];
      setIsAudioPlaying(true);
    }
  };

  // GSAP scroll trigger animation timeline
  useGSAP(() => {
    // 1. Animate HTML text content cards in/out on scroll
    const cards = gsap.utils.toArray('.content-card');
    cards.forEach((card, idx) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'top 40%',
          scrub: 1.2,
          toggleActions: 'play reverse play reverse'
        }
      });
    });

    // 2. Main timeline linking ScrollTrigger to 3D object values (scrub-based)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // Smooth lag effect for scrub
        onUpdate: (self) => {
          // Update top page progress bar
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`;
          }
        }
      }
    });

    // --- TIMELINE PHASES ---

    // Phase 1: Ganesha descends into the pot and rotates
    // Position drops from y=1.2 to y=-1.35 (directly inside the cylinder pot)
    tl.to(animValues.current, {
      ganeshaY: -1.35,
      ganeshaRotY: Math.PI * 4.5,
      ease: 'power1.inOut'
    }, 0);

    // Phase 2: Rain starts vertical dropping (fades in during descent)
    tl.to(animValues.current, {
      rainIntensity: 1.0,
      ease: 'sine.inOut'
    }, 0.15);

    // Phase 3: Ganesha dissolves / melts (opacity -> 0, scale -> 0.04)
    // Starts when Ganesha enters the pot (around 45% scroll)
    tl.to(animValues.current, {
      ganeshaOpacity: 0,
      ganeshaScale: 0.03,
      ease: 'power2.in'
    }, 0.45);

    // Phase 4: Small green plant scales up from the pot soil (starts growing at 65% scroll)
    tl.to(animValues.current, {
      plantScale: 1.1,
      ease: 'back.out(1.8)'
    }, 0.65);

    // Final clean-up: Rain dies down once the plant is fully grown
    tl.to(animValues.current, {
      rainIntensity: 0.1,
      ease: 'sine.out'
    }, 0.85);

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="app-container">
      {/* Background stars, colors and aura */}
      <div className="bg-overlay" />

      {/* Progress bar */}
      <div className="progress-bar" ref={progressBarRef} />

      {/* Fixed 3D Canvas Background scene */}
      <Scene
        animValues={animValues}
        ganeshaRef={ganeshaRef}
        plantRef={plantRef}
        potRef={potRef}
      />

      {/* SECTION 1: HERO */}
      <section className="scroll-section align-center">
        <div className="content-card" style={{ opacity: 1, transform: 'none' }}>
          <span className="section-tag">Eco-Visarjan</span>
          <h1 className="section-title">The Cycle of Life</h1>
          <p className="section-text">
            Welcome to the sacred journey of Lord Ganesha. 
            Scroll down to witness the transition from divine form to fertile clay, and back to nature.
          </p>
        </div>
        <div className="scroll-hint">
          <span>Scroll to begin</span>
          <div className="scroll-hint-mouse">
            <div className="scroll-hint-wheel" />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE RECEIVING POT & RAIN */}
      <section className="scroll-section align-right">
        <div className="content-card">
          <span className="section-tag">Phase 01</span>
          <h1 className="section-title">Nurturing Earth</h1>
          <p className="section-text">
            At the bottom of the scene lies a terracotta clay pot filled with rich, organic soil. 
            As we begin the transition, <span className="highlight-saffron">sacred drops of rain</span> start falling from the heavens, softening the earth to receive the Lord.
          </p>
        </div>
      </section>

      {/* SECTION 3: VISARJAN / DISSOLUTION */}
      <section className="scroll-section align-left">
        <div className="content-card">
          <span className="section-tag">Phase 02</span>
          <h1 className="section-title">Sacred Dissolution</h1>
          <p className="section-text">
            Entering the pot, the water dissolves Ganesha's form. 
            His physical body returns to mud, and His essence merges back with the soil, leaving behind <span className="highlight-saffron">seeds of life</span> embedded inside.
          </p>
        </div>
      </section>

      {/* SECTION 4: PLANT REBIRTH */}
      <section className="scroll-section align-center">
        <div className="content-card">
          <span className="section-tag green">Phase 03</span>
          <h1 className="section-title green">Eternal Rebirth</h1>
          <p className="section-text">
            From the merged soil of Visarjan, a <span className="highlight-green">new green seedling sprouts</span> and grows towards the light. 
            The divine energy is not gone—it has simply transformed, giving birth to a living plant.
          </p>
        </div>
      </section>

      {/* Meditative drone synth audio toggle button */}
      <button className="audio-toggle" onClick={toggleAudio} title="Toggle Meditative Hum">
        {isAudioPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </button>
    </div>
  );
}

export default App;

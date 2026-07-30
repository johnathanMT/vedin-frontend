// sanctuaryParticles.js — tsparticles option factories for the Memory World.
//   day   → sparse, low-opacity petals drifting on a gentle HORIZONTAL breeze.
//   night → warm fireflies floating up, softly glowing & twinkling.
// Fresh objects are returned each call so the engine can cleanly swap configs.

export function getParticlesOptions(night) {
  if (night) {
    // —— NIGHT: fireflies ——
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 36 },
        color: { value: ['#fde68a', '#fcd34d', '#fef3c7', '#fbbf24'] },
        shape: { type: 'circle' },
        opacity: { value: { min: 0.15, max: 0.9 }, animation: { enable: true, speed: 1.4, sync: false } },
        size: { value: { min: 1.5, max: 3.5 } },
        move: { enable: true, direction: 'top', speed: { min: 0.3, max: 1.0 }, straight: false, random: true, outModes: { default: 'out' } },
        shadow: { enable: true, color: '#fde68a', blur: 10 },
        wobble: { enable: true, distance: 16, speed: { min: -4, max: 4 } },
      },
    }
  }

  // —— DAY: gentle, sparse breeze (NOT heavy snow) ——
  //  • far fewer particles  • low opacity  • drifting RIGHT (horizontal)
  //  • slow speeds + wobble → soft, lazy float across the scene.
  return {
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: { value: 14 }, // sparse
      color: { value: ['#f9a8d4', '#f8bbd0', '#fbcfe8', '#fda4af'] },
      shape: { type: 'circle' },
      opacity: { value: { min: 0.1, max: 0.4 } }, // faint
      size: { value: { min: 2, max: 5 } },
      move: {
        enable: true,
        direction: 'right',          // horizontal breeze, not vertical fall
        speed: { min: 0.4, max: 1.2 },
        straight: false,             // slight angle variance
        outModes: { default: 'out' },
      },
      wobble: { enable: true, distance: 12, speed: { min: -2, max: 2 } }, // lazy sway
      rotate: { value: { min: 0, max: 360 }, direction: 'random', animation: { enable: true, speed: 4 } },
    },
  }
}

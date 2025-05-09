import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = (props) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  // Configuration médicale/thème santé
  const options = useMemo(() => ({
    background: {
color: "linear-gradient(to bottom right, #4A90E2, #4ECDC4)" // Dégradé ajouté ici
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push" // Ajoute des particules au clic
        },
        onHover: {
          enable: true,
          mode: "grab",
          parallax: { enable: true, force: 30 } // Effet parallaxe
        }
      },
      modes: {
        grab: { distance: 100 }
      }
    },
    particles: {
      color: {
        value: "#42A5FF" // Bleu médical
      },
      links: {
        color: "#42A5FF", // Bleu pastel
        distance: 100,
        enable: true,
        opacity: 0.4,
        width: 1
      },
      move: {
        direction: "none",
        enable: true,
        outModes: "out",
        speed: 0.5,
        wobble: true // Léger tremblement
      },
      number: {
        value: 80 // Moins de particules pour plus de clarté
      },
      opacity: {
        value: { min: 0.3, max: 0.7 } // Variation de transparence
      },
      shape: {
        type: ["circle", "cross"], // Formes médicales (cercles et croix)
        options: {
          cross: {
            fill: true,
            close: true
          }
        }
      },
      size: {
        value: { min: 2, max: 5 } // Taille plus variable
      }
    },
    emitters: {
      life: { duration: 0.1, count: 10 },
      position: { x: 50, y: 50 },
      rate: { delay: 0.1, quantity: 5 }
    },
    themes: [
      {
        name: "medical",
        default: {
          value: true,
          auto: true,
          mode: "light"
        },
        options: {
          background: {
color: "linear-gradient(to bottom right, #4A90E2, #4ECDC4)" // Dégradé dans le thème            
          },
          particles: {
            color: { value: ["#6DDDCF", "#42A5FF", "#42A5FF"] } // Palette bleue
          }
        }
      }
    ],
    detectRetina: true
  }), []);

  return init ? <Particles id={props.id} init={particlesLoaded} options={options} /> : <></>;
};

export default ParticlesComponent;
"use client";

import { useCallback } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine } from "@tsparticles/engine";

export default function BackgroundEffects() {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Use slim to save bundle size while maintaining core features
    await loadSlim(engine);
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // optional: add logging or logic when loaded
  };

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      {/* Matte black gradient background with soft highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-primary-bg to-primary-bg opacity-70"></div>
      
      {/* Aurora / soft gradient blur layers */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-[150px] mix-blend-screen"></div>
      
      {/* Particles Engine for nodes, neural connections, and data flow */}
      <ParticlesProvider init={particlesInit}>
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: "grab",
                },
              },
              modes: {
                grab: {
                  distance: 200,
                  links: {
                    opacity: 0.3,
                    color: "#ffffff"
                  },
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "out",
                },
                random: true,
                speed: 0.5,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  width: 800,
                  height: 800
                },
                value: 60,
              },
              opacity: {
                value: { min: 0.1, max: 0.4 },
                animation: {
                  enable: true,
                  speed: 1,
                  sync: false,
                },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
              shadow: {
                enable: true,
                color: "#ffffff",
                blur: 10,
              },
            },
            detectRetina: true,
          }}
          className="absolute inset-0"
        />
      </ParticlesProvider>

      {/* Faint moving grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>
    </div>
  );
}

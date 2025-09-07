import React, { useEffect, useState, useRef, useCallback } from 'react';

// The SVG logo component remains the same.
const CampusConnectLogo = () => (
  <div className="logo-container">
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          {/* These colors will be overridden by CSS variables for the theme */}
          <stop offset="0%" style={{stopColor: 'var(--logo-color-1, #A5B4FC)'}} />
          <stop offset="100%" style={{stopColor: 'var(--logo-color-2, #6366F1)'}} />
        </linearGradient>
      </defs>
      
      {/* College Building Structure */}
      <path d="M50 15 L15 40 L85 40 Z" fill="url(#logoGradient)" />
      <rect x="22" y="40" width="12" height="40" fill="url(#logoGradient)" rx="2"/>
      <rect x="44" y="40" width="12" height="40" fill="url(#logoGradient)" rx="2"/>
      <rect x="66" y="40" width="12" height="40" fill="url(#logoGradient)" rx="2"/>
      <rect x="10" y="80" width="80" height="8" fill="url(#logoGradient)" rx="2"/>
    </svg>
  </div>
);

// The particle canvas now accepts a theme to change particle colors.
const ParticleCanvas = ({ theme }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: null, y: null });
    const animationFrameId = useRef(null);

    const particleColor = theme === 'dusk' ? 'rgba(255, 237, 213, 0.7)' : 'rgba(255, 255, 255, 0.5)';
    const lineColor = theme === 'dusk' ? 'rgba(255, 237, 213, 0.5)' : 'rgba(255, 255, 255, 0.5)';


    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        particlesRef.current = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 20000);
        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.random() * 0.4 - 0.2,
                vy: Math.random() * 0.4 - 0.2,
                radius: Math.random() * 1.5 + 0.5
            });
        }
    }, []);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
        });

        for (let i = 0; i < particlesRef.current.length; i++) {
            for (let j = i; j < particlesRef.current.length; j++) {
                const p1 = particlesRef.current[i];
                const p2 = particlesRef.current[j];
                const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${lineColor.slice(5,-1)}, ${1 - dist / 120})`;
                    ctx.stroke();
                }
            }
             if (mouseRef.current.x) {
                const p = particlesRef.current[i];
                const distMouse = Math.sqrt((p.x - mouseRef.current.x) ** 2 + (p.y - mouseRef.current.y) ** 2);
                 if (distMouse < 150) {
                     ctx.beginPath();
                     ctx.moveTo(p.x, p.y);
                     ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                     ctx.strokeStyle = `rgba(${lineColor.slice(5,-1)}, ${0.2 - distMouse/150})`;
                     ctx.stroke();
                 }
             }
        }

        animationFrameId.current = requestAnimationFrame(animate);
    }, [particleColor, lineColor]);

    useEffect(() => {
        const handleMouseMove = (e) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
        const handleResize = () => { cancelAnimationFrame(animationFrameId.current); initCanvas(); animate(); };
        initCanvas();
        animate();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [initCanvas, animate]);

    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />;
};


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

  /* Default Theme (Night) */
  .animation-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(180deg, #0f0c29, #302b63, #24243e);
    overflow: hidden;
    position: relative;
    transition: opacity 0.5s ease-out;
    perspective: 1000px;
  }

  /* Dusk Theme */
  .animation-container.dusk {
    background: linear-gradient(180deg, #2c3e50, #fd746c, #ff8c42);
    --logo-color-1: #FFD3B5;
    --logo-color-2: #FD746C;
  }
  
  .content-wrapper {
    transition: transform 0.1s ease-out;
    will-change: transform;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    transform-style: preserve-3d;
  }
  
  .logo-container {
      opacity: 0;
      animation: logo3DEntrance 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      margin-bottom: -10px;
      z-index: 1;
  }

  .animated-text {
      z-index: 1;
      position: relative; /* Needed for the ::after pseudo-element */
  }

  .animated-text::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    height: 2px;
    width: 0%;
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0));
    animation: drawPath 1.2s ease-out 0.2s forwards;
  }

  .animated-text span {
    opacity: 0;
    transform: scale(0.8);
    animation: letterPopIn 0.4s ease-out forwards;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 4.5rem;
    font-weight: 400;
    color: #e0e0e0;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.15em;
  }

  .animated-text span:last-child {
    animation: letterPopIn 0.4s ease-out forwards, gpsPing 1.5s ease-in-out 1.2s infinite;
  }


  /* --- OUTRO STYLES --- */
  
  .animation-container.outro .content-wrapper {
    /* UPDATED: Changed animation duration from 1s to 0.8s for a faster exit */
    animation: flyAwayOutro 0.8s ease-in forwards;
  }

  @media (max-width: 768px) {
    .animated-text span { font-size: 3rem; }
    .logo-container svg { width: 80px; height: 80px; }
  }

  @media (max-width: 480px) {
    .animated-text span { font-size: 2rem; }
    .logo-container svg { width: 60px; height: 60px; }
  }

  /* --- KEYFRAMES --- */

  @keyframes letterPopIn {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes drawPath {
    to {
      width: 100%;
    }
  }

  @keyframes gpsPing {
    0% {
      transform: scale(1);
      text-shadow: 0 0 5px rgba(255,255,255,0.7), 0 0 10px rgba(255,255,255,0.5);
    }
    50% {
      transform: scale(1.5);
      text-shadow: 0 0 15px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.7);
    }
    100% {
      transform: scale(1);
      text-shadow: 0 0 5px rgba(255,255,255,0.7), 0 0 10px rgba(255,255,255,0.5);
    }
  }
  
  @keyframes logo3DEntrance {
    from {
        opacity: 0;
        transform: scale(0.5) rotateY(-90deg) translateZ(50px);
    }
    to {
        opacity: 1;
        transform: scale(1) rotateY(0deg) translateZ(0);
    }
  }
  
  @keyframes flyAwayOutro {
      from {
        transform: rotateX(0) scale(1) translateY(0);
        opacity: 1;
        filter: blur(0);
      }
      to {
        transform: rotateX(-90deg) scale(0.5) translateY(-150px);
        opacity: 0;
        filter: blur(10px);
      }
  }
`;

const OpeningAnimation = ({ onAnimationComplete }) => {
  const [animationState, setAnimationState] = useState('intro');
  const [theme, setTheme] = useState('night'); // Default theme
  const contentWrapperRef = useRef(null);
  const text = "Campus Connect.";
  const isMounted = useRef(true);

  // Effect to set the theme based on the current time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 18) {
        setTheme('dusk');
    } else {
        setTheme('night');
    }
  }, []);

  const [outroDelays] = useState(() =>
    Array.from({ length: text.length }, () => Math.random() * 0.5)
  );
  
  const handleClose = useCallback(() => {
    if (animationState !== 'intro') return;
    setAnimationState('outro');
    // UPDATED: Adjusted timeout to match the faster animation
    setTimeout(() => {
      if (isMounted.current && typeof onAnimationComplete === 'function') {
        onAnimationComplete();
      }
    }, 1000); 
  }, [animationState, onAnimationComplete]);
  
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Timer to auto-close
  useEffect(() => {
    const closeTimer = setTimeout(handleClose, 4000);
    return () => {
      clearTimeout(closeTimer);
    };
  }, [handleClose]);
  
  // 3D perspective effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!contentWrapperRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (clientY - innerHeight / 2) / (innerHeight / 2);
      contentWrapperRef.current.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Style injection
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className={`animation-container ${animationState} ${theme}`}>
      <ParticleCanvas theme={theme} />
      <div className="content-wrapper" ref={contentWrapperRef}>
        <CampusConnectLogo />
        <h1 className="animated-text">
          {text.split('').map((char, index) => (
            <span
              key={index}
              style={
                animationState === 'intro'
                  ? { animationDelay: `${index * 0.08}s` }
                  : { animationDelay: `${outroDelays[index]}s` }
              }
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
};

export default OpeningAnimation;

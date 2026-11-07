import React, { useEffect, useRef } from 'react';
import { EnvSubTheme, EnvTheme } from '../../shared/journeyConfig';

interface SpaceAtmosphereProps {
  envTheme?: EnvTheme;
  envSubTheme?: EnvSubTheme;
  reducedMotion?: boolean;
}

export const SpaceAtmosphere: React.FC<SpaceAtmosphereProps> = ({
  envTheme = 'moon',
  envSubTheme = 'moon-tranquillitatis',
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const starCount = Math.floor((width * height) / 4200);
    const stars = Array.from({ length: starCount }, (_, i) => ({
      x: ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1,
      y: ((Math.cos(i * 311.7) * 43758.5453) % 1 + 1) % 1,
      radius: (i % 5 === 0 ? 1.35 : 0.75) * (0.6 + ((i * 17) % 10) / 15),
      alpha: 0.35 + ((i * 23) % 65) / 100,
      phase: (i * 0.7) % (Math.PI * 2),
      color:
        i % 7 === 0
          ? '#BAE6FD'
          : i % 11 === 0
          ? '#FDE68A'
          : '#F8FAFC',
    }));

    // Martian airborne dust motes
    const dustMotes = Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0.25 + (i % 7) * 0.08,
      vy: -0.04 + (i % 3) * 0.04,
      size: 0.8 + (i % 4) * 0.6,
      alpha: 0.12 + (i % 5) * 0.05,
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const drawLunarBackdrop = () => {
      // 1. Airless pitch-black lunar sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#010307');
      skyGrad.addColorStop(0.68, '#040812');
      skyGrad.addColorStop(1, '#090F1B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Crisp unblinking stars (no atmospheric scintillation on the Moon)
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const sy = s.y * height * 0.78;
        ctx.beginPath();
        ctx.arc(s.x * width, sy, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha * 0.85;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 3. Distant Earth suspended in the black lunar sky
      const earthX = width * 0.14;
      const earthY = height * 0.22;
      const earthR = Math.max(24, Math.min(44, width * 0.028));

      // Atmospheric blue limb glow
      const haloGrad = ctx.createRadialGradient(
        earthX,
        earthY,
        earthR * 0.8,
        earthX,
        earthY,
        earthR * 2.4
      );
      haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      haloGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Earth sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.clip();

      const oceanGrad = ctx.createRadialGradient(
        earthX - earthR * 0.3,
        earthY - earthR * 0.3,
        earthR * 0.1,
        earthX,
        earthY,
        earthR
      );
      oceanGrad.addColorStop(0, '#38BDF8');
      oceanGrad.addColorStop(0.45, '#0369A1');
      oceanGrad.addColorStop(1, '#020617');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(earthX - earthR, earthY - earthR, earthR * 2, earthR * 2);

      // Subtle continent & cloud patches
      ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
      ctx.beginPath();
      ctx.ellipse(earthX - earthR * 0.15, earthY - earthR * 0.1, earthR * 0.35, earthR * 0.22, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.ellipse(earthX - earthR * 0.1, earthY - earthR * 0.25, earthR * 0.48, earthR * 0.12, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Crescent night shadow on Earth
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
      ctx.beginPath();
      ctx.arc(earthX + earthR * 0.48, earthY + earthR * 0.18, earthR * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Distant Lunar Highlands (Montes Apenninus / Mare Rim)
      const horizonY = height * 0.82;
      ctx.fillStyle = '#111622';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 24) {
        const nx = x / width;
        const ridge =
          Math.sin(nx * 5.5 + (envSubTheme === 'moon-procellarum' ? 1.8 : 0.2)) * 22 +
          Math.cos(nx * 14.0) * 10 +
          Math.sin(nx * 29.0) * 4;
        ctx.lineTo(x, horizonY - 18 + ridge);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 5. Foreground Cratered Grey Basalt Regolith Surface
      const regolithGrad = ctx.createLinearGradient(0, horizonY - 10, 0, height);
      regolithGrad.addColorStop(0, '#1E2533');
      regolithGrad.addColorStop(0.45, '#131822');
      regolithGrad.addColorStop(1, '#080B11');
      ctx.fillStyle = regolithGrad;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 20) {
        const nx = x / width;
        const swell = Math.sin(nx * 8.0 + 1.1) * 10 + Math.cos(nx * 21.0) * 4;
        ctx.lineTo(x, horizonY + 14 + swell);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Subtle rim highlight
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lunar craters on the foreground slope
      const craters = [
        { cx: width * 0.22, cy: height * 0.91, rx: 58, ry: 13 },
        { cx: width * 0.56, cy: height * 0.94, rx: 85, ry: 17 },
        { cx: width * 0.82, cy: height * 0.89, rx: 46, ry: 11 },
      ];
      craters.forEach((c) => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(c.cx, c.cy, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(5, 8, 15, 0.55)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.14)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      });
    };

    const drawMarsBackdrop = () => {
      // 1. Martian Dusty Sky Gradient (deep burnt rust zenith to warm butterscotch horizon)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#140704');
      skyGrad.addColorStop(0.35, '#2A0F08');
      skyGrad.addColorStop(0.68, '#4F1E10');
      skyGrad.addColorStop(0.86, '#7C3219');
      skyGrad.addColorStop(1, '#3D160B');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Faint high-zenith stars visible through thin 1% CO2 atmosphere
      for (let i = 0; i < stars.length; i += 2) {
        const s = stars[i];
        if (s.y > 0.42) continue;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FDE68A';
        ctx.globalAlpha = s.alpha * (0.42 - s.y) * 0.8;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2. Filtered Martian Sun with bluish-peach forward-scattering dust halo
      const sunX = width * 0.82;
      const sunY = height * 0.24;
      const sunHalo = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, 160);
      sunHalo.addColorStop(0, 'rgba(255, 245, 220, 0.42)');
      sunHalo.addColorStop(0.28, 'rgba(186, 230, 253, 0.12)');
      sunHalo.addColorStop(0.65, 'rgba(249, 115, 22, 0.08)');
      sunHalo.addColorStop(1, 'transparent');
      ctx.fillStyle = sunHalo;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
      ctx.fill();

      // 3. Distant Martian Mountains / Crater Rim (tailored by Mars mission)
      const horizonY = height * 0.80;
      ctx.fillStyle = '#38140A';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 20) {
        const nx = x / width;
        let elevation = 0;
        if (envSubTheme === 'mars-viking') {
          // Chryse Planitia rolling boulder plains & low mesas
          elevation = Math.sin(nx * 4.2) * 14 + Math.cos(nx * 13) * 6;
        } else if (envSubTheme === 'mars-rover') {
          // Columbia Hills & Endeavour Crater stratified rim
          elevation = Math.sin(nx * 6.0 + 0.8) * 28 + Math.floor(Math.sin(nx * 15) * 3) * 4;
        } else {
          // Jezero Crater steep ancient delta cliffs ("Valinor Hills")
          elevation = Math.sin(nx * 3.5 + 2.1) * 34 + Math.cos(nx * 9.5) * 14;
        }
        ctx.lineTo(x, horizonY - 16 + elevation);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 4. Foreground Reddish-Orange Iron Oxide Terrain
      const marsGround = ctx.createLinearGradient(0, horizonY, 0, height);
      marsGround.addColorStop(0, '#5A2111');
      marsGround.addColorStop(0.5, '#3A140A');
      marsGround.addColorStop(1, '#1A0804');
      ctx.fillStyle = marsGround;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 18) {
        const nx = x / width;
        const dune = Math.sin(nx * 9.0 + 0.5) * 9 + Math.cos(nx * 22.0) * 3;
        ctx.lineTo(x, horizonY + 18 + dune);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(251, 146, 60, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 5. Drifting Atmospheric Dust Motes
      for (let i = 0; i < dustMotes.length; i++) {
        const d = dustMotes[i];
        if (!reducedMotion) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x > width) d.x = 0;
          if (d.y < 0) d.y = height;
          if (d.y > height) d.y = 0;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FDBA74';
        ctx.globalAlpha = d.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const drawVoidBackdrop = () => {
      // 1. Deepest Interstellar Black & Midnight Blue
      const voidGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.9
      );
      voidGrad.addColorStop(0, '#050A18');
      voidGrad.addColorStop(0.55, '#02050D');
      voidGrad.addColorStop(1, '#010206');
      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Pinpoint Distant Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!reducedMotion) {
          s.phase += 0.004;
        }
        const alpha = Math.max(0.12, Math.min(0.9, s.alpha + Math.sin(s.phase) * 0.12));
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.radius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 3. The "Pale Blue Dot" Caught in a Scattered Sunbeam Ray (1990)
      const dotX = width * 0.82;
      const dotY = height * 0.34;

      ctx.save();
      ctx.translate(dotX, dotY);
      ctx.rotate(-0.42);
      const beamGrad = ctx.createLinearGradient(-18, -height * 0.5, 18, height * 0.5);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(0.45, 'rgba(224, 242, 254, 0.045)');
      beamGrad.addColorStop(0.55, 'rgba(254, 243, 199, 0.055)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-16, -height * 0.45, 32, height * 0.9);
      ctx.restore();

      // Tiny Pale Blue Dot speck
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#7DD3FC';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(125, 211, 252, 0.18)';
      ctx.fill();

      // 4. Subtle Heliopause Boundary Arc (121 AU Solar Wind / Interstellar Medium interface)
      ctx.save();
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 1.45, height * 0.82, Math.PI * 1.18, Math.PI * 1.82);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.10)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      if (envTheme === 'moon') {
        drawLunarBackdrop();
      } else if (envTheme === 'mars') {
        drawMarsBackdrop();
      } else {
        drawVoidBackdrop();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [envTheme, envSubTheme, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
};

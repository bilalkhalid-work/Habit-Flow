import { useTheme } from "../context/ThemeContext";
import { useEffect, useRef } from "react";

function AnimatedBackground() {
  const { themeName } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const configs = {
      galaxy: {
        count: 150,
        init: (p) => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5,
          opacity: Math.random(),
          twinkleSpeed: 0.001 + Math.random() * 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
        }),
        draw: (ctx, p, t) => {
          const opacity = 0.3 + Math.abs(Math.sin(t * p.twinkleSpeed + p.twinkleOffset)) * 0.7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${opacity})`;
          ctx.fill();
          if (p.size > 1.5) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,160,255,${opacity * 0.2})`;
            ctx.fill();
          }
        },
        update: (p) => p,
      },
      sakura: {
        count: 35,
        init: (p) => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 6 + Math.random() * 10,
          speedY: 0.5 + Math.random() * 1.5,
          speedX: (Math.random() - 0.5) * 0.8,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3,
          opacity: 0.4 + Math.random() * 0.6,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.01 + Math.random() * 0.02,
        }),
        draw: (ctx, p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          gradient.addColorStop(0, "rgba(255,182,193,1)");
          gradient.addColorStop(0.5, "rgba(255,105,135,0.8)");
          gradient.addColorStop(1, "rgba(255,20,80,0)");
          for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.ellipse(0, -p.size * 0.6, p.size * 0.4, p.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        },
        update: (p, t) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(t * p.swaySpeed + p.sway) * 0.5;
          p.rotation += p.rotationSpeed;
          if (p.y > canvas.height + 20) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
          return p;
        },
      },
      autumn: {
        count: 25,
        init: (p) => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 8 + Math.random() * 14,
          speedY: 0.4 + Math.random() * 1.2,
          speedX: (Math.random() - 0.5) * 1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          opacity: 0.5 + Math.random() * 0.5,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.008 + Math.random() * 0.015,
          colorIdx: Math.floor(Math.random() * 4),
        }),
draw: (ctx, p) => {
  const colors = [
    ["rgba(255,100,0,1)", "rgba(180,40,0,0.3)"],
    ["rgba(255,160,0,1)", "rgba(180,80,0,0.3)"],
    ["rgba(180,50,0,1)", "rgba(100,20,0,0.3)"],
    ["rgba(220,80,20,1)", "rgba(140,40,0,0.3)"],
  ];
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;

  const s = p.size;
  const gradient = ctx.createLinearGradient(0, -s, 0, s);
  gradient.addColorStop(0, colors[p.colorIdx][0]);
  gradient.addColorStop(1, colors[p.colorIdx][1]);

  // Main leaf shape
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s * 0.9, -s * 0.4, s * 0.9, s * 0.4, 0, s);
  ctx.bezierCurveTo(-s * 0.9, s * 0.4, -s * 0.9, -s * 0.4, 0, -s);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Center vein
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s);
  ctx.strokeStyle = `rgba(120,30,0,0.6)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Side veins
  for (let i = 1; i <= 4; i++) {
    const y = -s + (s * 2 * i) / 5;
    const spread = s * 0.7 * (1 - Math.abs(i - 2.5) / 3);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(spread, y - s * 0.15);
    ctx.strokeStyle = `rgba(120,30,0,0.35)`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(-spread, y - s * 0.15);
    ctx.stroke();
  }

  ctx.restore();
},        update: (p, t) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(t * p.swaySpeed + p.sway) * 0.8;
          p.rotation += p.rotationSpeed;
          if (p.y > canvas.height + 20) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
          return p;
        },
      },
    };

    const config = configs[themeName];
    for (let i = 0; i < config.count; i++) {
      particles.push(config.init({}));
    }

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        config.draw(ctx, p, t);
        particles[i] = config.update(p, t) || p;
      });
      t++;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [themeName]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

export default AnimatedBackground;
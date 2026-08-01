import { useTheme } from "../context/ThemeContext";
import { useEffect, useRef } from "react";
import sakuraBg from "../assets/sakura-bg.png";
import autumnBg from "../assets/autumn-bg.png";

function AnimatedBackground() {
  const { themeName } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];
    let t = 0;
    let bgImage = null;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Preload background image for sakura and autumn
    if (themeName === "sakura" || themeName === "autumn") {
      bgImage = new Image();
      bgImage.src = themeName === "sakura" ? sakuraBg : autumnBg;
    }

    function drawGalaxyScene() {
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#0a0015");
      bg.addColorStop(0.5, "#1a0a35");
      bg.addColorStop(1, "#0f0520");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nebula1 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.4
      );
      nebula1.addColorStop(0, "rgba(120,40,200,0.15)");
      nebula1.addColorStop(0.5, "rgba(80,20,160,0.08)");
      nebula1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.6, 0,
        canvas.width * 0.2, canvas.height * 0.6, canvas.width * 0.35
      );
      nebula2.addColorStop(0, "rgba(40,80,200,0.12)");
      nebula2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawImageScene() {
      if (bgImage && bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        // Subtle overlay to make UI cards more readable
        const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (themeName === "sakura") {
          overlay.addColorStop(0, "rgba(255,220,235,0.15)");
          overlay.addColorStop(1, "rgba(255,200,220,0.1)");
        } else {
          overlay.addColorStop(0, "rgba(20,5,0,0.2)");
          overlay.addColorStop(1, "rgba(10,2,0,0.15)");
        }
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Fallback while image loads
        if (themeName === "sakura") {
          ctx.fillStyle = "#fce4ec";
        } else {
          ctx.fillStyle = "#1a0800";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const particleConfigs = {
      galaxy: {
        count: 150,
        init: () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5,
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
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180,160,255,${opacity * 0.15})`;
            ctx.fill();
          }
        },
        update: (p) => p,
      },
      sakura: {
        count: 25,
        init: () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 4 + Math.random() * 7,
          speedY: 0.4 + Math.random() * 1.2,
          speedX: (Math.random() - 0.5) * 0.6,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2.5,
          opacity: 0.6 + Math.random() * 0.4,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.008 + Math.random() * 0.015,
        }),
        draw: (ctx, p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          g.addColorStop(0, "rgba(255,200,215,1)");
          g.addColorStop(0.5, "rgba(255,150,175,0.8)");
          g.addColorStop(1, "rgba(255,100,140,0)");
          for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 5);
            ctx.beginPath();
            ctx.ellipse(0, -p.size * 0.6, p.size * 0.35, p.size * 0.65, 0, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        },
        update: (p, t) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(t * p.swaySpeed + p.sway) * 0.5;
          p.rotation += p.rotationSpeed;
          if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
          return p;
        },
      },
      autumn: {
        count: 20,
        init: () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 7 + Math.random() * 12,
          speedY: 0.4 + Math.random() * 1,
          speedX: (Math.random() - 0.5) * 0.9,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 3.5,
          opacity: 0.7 + Math.random() * 0.3,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.006 + Math.random() * 0.012,
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
          const g = ctx.createLinearGradient(0, -s, 0, s);
          g.addColorStop(0, colors[p.colorIdx][0]);
          g.addColorStop(1, colors[p.colorIdx][1]);
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.9, -s * 0.4, s * 0.9, s * 0.4, 0, s);
          ctx.bezierCurveTo(-s * 0.9, s * 0.4, -s * 0.9, -s * 0.4, 0, -s);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(0, s);
          ctx.strokeStyle = `rgba(120,30,0,0.6)`;
          ctx.lineWidth = 1;
          ctx.stroke();
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
        },
        update: (p, t) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(t * p.swaySpeed + p.sway) * 0.7;
          p.rotation += p.rotationSpeed;
          if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
          return p;
        },
      },
    };

    const config = particleConfigs[themeName];
    for (let i = 0; i < config.count; i++) {
      particles.push(config.init());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (themeName === "galaxy") {
        drawGalaxyScene();
      } else {
        drawImageScene();
      }

      particles.forEach((p, i) => {
        config.draw(ctx, p, t);
        particles[i] = config.update(p, t) || p;
      });

      t++;
      animationId = requestAnimationFrame(animate);
    }

    animate();

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
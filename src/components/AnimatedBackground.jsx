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
        count: 120,
        color: "255,255,255",
        size: () => Math.random() * 2,
        speed: () => 0.1 + Math.random() * 0.2,
        shape: "circle",
      },
      sakura: {
        count: 40,
        color: "255,182,193",
        size: () => 4 + Math.random() * 6,
        speed: () => 0.5 + Math.random() * 1,
        shape: "petal",
      },
      autumn: {
        count: 35,
        color: "255,120,30",
        size: () => 5 + Math.random() * 8,
        speed: () => 0.4 + Math.random() * 0.8,
        shape: "leaf",
      },
    };

    const config = configs[themeName];

    for (let i = 0; i < config.count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: config.size(),
        speed: config.speed(),
        opacity: Math.random(),
        drift: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = `rgba(${config.color}, ${p.opacity})`;

        if (config.shape === "circle") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        if (themeName === "galaxy") {
          p.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + p.x)) * 0.7;
        } else {
          p.y += p.speed;
          p.x += p.drift;
          p.rotation += p.rotationSpeed;
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
        }
      });

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
import React, { useCallback, useEffect, useRef } from "react";

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  rounded?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  playOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  width = "500px",
  height = "500px",
  background,
  rounded,
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  playOnHover = true, // <- default true
  className = "",
  style = {},
}) => {
  const hex = glareColor.replace("#", "");
  let rgba = glareColor;
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt((hex[0] ?? '0') + (hex[0] ?? '0'), 16);
    const g = parseInt((hex[1] ?? '0') + (hex[1] ?? '0'), 16);
    const b = parseInt((hex[2] ?? '0') + (hex[2] ?? '0'), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const animateIn = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;

    el.style.transition = "none";
    el.style.backgroundPosition = "-100% -100%, 0 0";
    // força reflow pra aplicar o reset antes da transição
    void el.offsetWidth;
    el.style.transition = `${transitionDuration}ms ease`;
    el.style.backgroundPosition = "100% 100%, 0 0";
  }, [transitionDuration]);

  const animateOut = () => {
    const el = overlayRef.current;
    if (!el) return;

    if (playOnce) {
      el.style.transition = "none";
      el.style.backgroundPosition = "-100% -100%, 0 0";
    } else {
      el.style.transition = `${transitionDuration}ms ease`;
      el.style.backgroundPosition = "-100% -100%, 0 0";
    }
  };

  // Se playOnHover = false, dispara a animação automática
  useEffect(() => {
    if (!playOnHover) {
      animateIn();
      if (!playOnce) {
        const interval = setInterval(animateIn, transitionDuration * 2);
        return () => clearInterval(interval);
      }
    }
  }, [animateIn, playOnHover, playOnce, transitionDuration]);

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(${glareAngle}deg,
        hsla(0,0%,0%,0) 60%,
        ${rgba} 70%,
        hsla(0,0%,0%,0) 100%)`,
    backgroundSize: `${glareSize}% ${glareSize}%, 100% 100%`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "-100% -100%, 0 0",
    pointerEvents: "none",
  };

  return (
    <div
      className={`relative grid place-items-center overflow-hidden ${rounded ? `rounded-${rounded}` : ""} ${
        playOnHover ? "cursor-pointer" : ""
      } ${className}`}
      style={{
        width,
        height,
        ...(background !== undefined ? { background } : {}),
        ...style,
      }}
      onMouseEnter={playOnHover ? animateIn : undefined}
      onMouseLeave={playOnHover ? animateOut : undefined}
    >
      <div ref={overlayRef} style={overlayStyle} className="overflow-hidden w-full h-full" />
      {children}
    </div>
  );
};

export default GlareHover;

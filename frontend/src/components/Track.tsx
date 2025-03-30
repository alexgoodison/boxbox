"use client";

import { useEffect, useRef, useState } from "react";
import Imola from "./tracks/Imola";

export default function Track() {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationId, setAnimationId] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // Refs for circles
  const circlesRef = useRef<Array<SVGCircleElement | null>>([null, null, null]);
  const pathLength = pathRef.current ? pathRef.current.getTotalLength() : 0;
  const speeds = [1, 1.1, 1.2]; // Different speeds for each circle

  // Function to start or stop the animation
  const toggleAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(animationId!);
      setIsAnimating(false);
    } else {
      startTimeRef.current = performance.now();
      animate();
      setIsAnimating(true);
    }
  };

  // Function to animate the circle along the path
  const animate = () => {
    if (!pathRef.current || !startTimeRef.current) return;

    const elapsedTime = (performance.now() - startTimeRef.current) / 1000; // in seconds

    circlesRef.current.forEach((circleRef, index) => {
      if (circleRef) {
        // Use the speed factor for each circle (index 0, 1, 2)
        const loopTime = 8;
        const speedFactor = speeds[index];
        const progress = ((elapsedTime * speedFactor) % loopTime) / loopTime; // Normalize time to loop every 4 seconds, adjust speed

        const position = pathRef.current.getPointAtLength(progress * pathLength);
        circleRef.setAttribute("cx", position.x.toString());
        circleRef.setAttribute("cy", position.y.toString());
      }
    });

    const id = window.requestAnimationFrame(animate);
    setAnimationId(id);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);

  // Ensure animation starts only when refs are fully initialized
  useEffect(() => {
    // Check if the refs are initialized
    if (pathRef.current && isAnimating) {
      startTimeRef.current = performance.now();
      animate();
    }
  }, [isAnimating]);

  return (
    <div id="mapContainer" className="w-[800px] rounded-sm h-[500px]">
      <button onClick={toggleAnimation}>
        {isAnimating ? "Stop Animation" : "Start Animation"}
      </button>

      <svg
        viewBox="0 0 1600 900"
        stroke={"white"}
        strokeWidth={7}
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Imola ref={pathRef} />

        <circle
          ref={(el) => {
            circlesRef.current[0] = el;
          }}
          r="20"
          fill="#FF8000"
          stroke="none"
        />
        <circle
          ref={(el) => {
            circlesRef.current[1] = el;
          }}
          r="20"
          fill="#EF1A2D"
          stroke="none"
        />
        <circle
          ref={(el) => {
            circlesRef.current[2] = el;
          }}
          r="20"
          fill="#00A19B"
          stroke="none"
        />
      </svg>
    </div>
  );
}

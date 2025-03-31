"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tracks } from "./tracks";

export default function Track() {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationId, setAnimationId] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  const [trackFile, setTrackFile] = useState<string>("Austin");
  const [TrackComponent, setTrackComponent] =
    useState<React.ForwardRefExoticComponent<any> | null>(null);

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

  // Dynamically import the correct track file when trackFile changes
  useEffect(() => {
    async function loadTrack() {
      try {
        const module = await import(`./tracks/${trackFile}`);
        setTrackComponent(() => module.default);
      } catch (error) {
        console.error("Error loading track:", error);
        setTrackComponent(null);
      }
    }
    loadTrack();
  }, [trackFile]);

  return (
    <div>
      <div id="mapContainer" className="w-[800px] rounded-sm h-[500px]">
        <svg
          viewBox="0 0 1600 900"
          stroke={"white"}
          strokeWidth={7}
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          {TrackComponent && <TrackComponent ref={pathRef} />}

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

      <div className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <button
          onClick={toggleAnimation}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          {isAnimating ? "Stop Animation" : "Start Animation"}
        </button>

        <div className="pl-2 flex items-center gap-2">
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          <Select value={trackFile} onValueChange={(val) => setTrackFile(val)}>
            <SelectTrigger className="text-base border-none pl-1 pr-0 hover:underline hover:underline-offset-4">
              <SelectValue placeholder="Track" />
            </SelectTrigger>
            <SelectContent>
              {tracks.map((t) => (
                <SelectItem key={t.id} value={t.file}>
                  {t.Location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://alexgoodison.com/"
          target="_blank">
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to alexgoodison.com →
        </a>
      </div>
    </div>
  );
}

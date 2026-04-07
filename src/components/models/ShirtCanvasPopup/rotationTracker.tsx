import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";

export const RotationTracker = forwardRef(function RotationTracker(
  {
    isPlaying,
    onFullRotation,
    velocity,
  }: {
    isPlaying: boolean;
    velocity: number;
    onFullRotation: () => void;
  },
  ref
) {
  const controlsRef = useRef<any>(null);
  const [accumulatedRotation, setAccumulatedRotation] = useState(0);
  const [lastAngle, setLastAngle] = useState(0);

  useImperativeHandle(ref, () => ({
    reset: () => {
      controlsRef.current?.reset();
    },
  }));

  useFrame(() => {
    if (!isPlaying || !controlsRef.current) return;

    const currentAngle = controlsRef.current.getAzimuthalAngle();
    let delta = currentAngle - lastAngle;

    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    const newAccumulated = accumulatedRotation + Math.abs(delta);
    setAccumulatedRotation(newAccumulated);
    setLastAngle(currentAngle);

    if (newAccumulated >= 2 * Math.PI) {
      setAccumulatedRotation(0);
      onFullRotation();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={isPlaying}
      autoRotateSpeed={velocity}
      enableZoom={false}
    />
  );
});

"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import EnriqueModel, { EnriqueModelProps } from "./EnriqueModel";

// 🔧 Configurables
const initialRotationZ = Math.PI / 3.2;
const rotationSpeed = 0.001;
const rotationLimit = (60 * Math.PI) / 270;

const AutoRotatingGroup = (props: EnriqueModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [direction, setDirection] = useState(1);

  // movimiento de inclinación en X e Y
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = initialRotationZ;
    }
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // rotación automática Z
    groupRef.current.rotation.z += rotationSpeed * direction;

    const currentZ = groupRef.current.rotation.z;
    const upperLimit = initialRotationZ + rotationLimit;
    const lowerLimit = initialRotationZ - rotationLimit;

    if (currentZ > upperLimit) {
      setDirection(-1);
    } else if (currentZ < lowerLimit) {
      setDirection(1);
    }

    // inclinación controlada por el mouse (ejes X e Y)
    const tiltFactor = 0.2; // cuanto más grande, más se inclina
    groupRef.current.rotation.x = Math.PI / 2 + mouseRef.current.y * tiltFactor;
    groupRef.current.rotation.y = mouseRef.current.x * tiltFactor;
  });

  const handlePointerMove = (e: React.PointerEvent) => {
    const { offsetX, offsetY, currentTarget } = e.nativeEvent;
    const { width, height } = (
      currentTarget as HTMLElement
    ).getBoundingClientRect();

    // normalizar valores a rango [-1, 1]
    mouseRef.current.x = (offsetX / width) * 2 - 1;
    mouseRef.current.y = (offsetY / height) * 2 - 1;
  };

  return (
    <group ref={groupRef} onPointerMove={handlePointerMove} scale={0.038}>
      <EnriqueModel {...props} />
    </group>
  );
};

export default AutoRotatingGroup;

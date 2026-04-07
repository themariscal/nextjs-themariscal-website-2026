"use client";

import * as THREE from "three";
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { GLTF } from "three-stdlib";

export type EnriqueModelProps = {
  enableLightLetterE?: boolean;
  enableLightLetterN?: boolean;
  enableLightLetterR?: boolean;
  enableLightLetterI?: boolean;
  enableLightLetterQ?: boolean;
  enableLightLetterU?: boolean;
  enableLightLetterV?: boolean;
  enableLightInsideCircleBorder?: boolean;
  enableLightInsideCircle?: boolean;
  enableLightTriskelion?: boolean;
  enableLightOutsideCircle?: boolean;
};

type GLTFResult = GLTF & {
  nodes: {
    letter_e: THREE.Mesh;
    letter_n: THREE.Mesh;
    letter_r: THREE.Mesh;
    letter_i: THREE.Mesh;
    letter_q: THREE.Mesh;
    letter_u: THREE.Mesh;
    letter_v: THREE.Mesh;
    inside_circle_border: THREE.Mesh;
    inside_circle: THREE.Mesh;
    triskelion: THREE.Mesh;
    outside_circle: THREE.Mesh;
  };
};

export default function EnriqueModel({
  enableLightLetterE = false,
  enableLightLetterN = false,
  enableLightLetterR = false,
  enableLightLetterI = false,
  enableLightLetterQ = false,
  enableLightLetterU = false,
  enableLightLetterV = false,
  enableLightInsideCircleBorder = false,
  enableLightInsideCircle = false,
  enableLightTriskelion = false,
}: EnriqueModelProps) {
  const { nodes } = useGLTF("/models/enrique.glb") as unknown as GLTFResult;
  const baseColor = "#d8c5e3";

  const IlluminatedMesh = ({
    geometry,
    enabled,
  }: {
    geometry: THREE.BufferGeometry;
    enabled: boolean;
  }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useEffect(() => {
      if (!meshRef.current) return;
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;

      const targetEmissive = enabled ? 10 : 0;
      const targetOpacity = enabled ? 1 : 0.5;
      const targetReflectivity = enabled ? 1 : 0.5;
      const targetEnvMapIntensity = enabled ? 2 : 0.8;

      gsap.to(material, {
        emissiveIntensity: targetEmissive,
        opacity: targetOpacity,
        reflectivity: targetReflectivity,
        envMapIntensity: targetEnvMapIntensity,
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          material.needsUpdate = true;
        },
      });

      if (lightRef.current) {
        gsap.to(lightRef.current, {
          intensity: enabled ? 40 : 0,
          duration: 1,
          ease: "power2.out",
        });
      }
    }, [enabled]);

    return (
      <group>
        <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={baseColor}
            emissive="white"
            emissiveIntensity={0}
            metalness={1}
            roughness={0.1}
            transparent
            opacity={0.5}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            envMapIntensity={2}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          ref={lightRef}
          position={[0, 0, 0]}
          color="white"
          intensity={0}
          distance={3}
          decay={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.005}
        />
      </group>
    );
  };

  return (
    <group castShadow receiveShadow>
      {/* Letras */}
      <IlluminatedMesh
        geometry={nodes.letter_e.geometry}
        enabled={enableLightLetterE}
      />
      <IlluminatedMesh
        geometry={nodes.letter_n.geometry}
        enabled={enableLightLetterN}
      />
      <IlluminatedMesh
        geometry={nodes.letter_r.geometry}
        enabled={enableLightLetterR}
      />
      <IlluminatedMesh
        geometry={nodes.letter_i.geometry}
        enabled={enableLightLetterI}
      />
      <IlluminatedMesh
        geometry={nodes.letter_q.geometry}
        enabled={enableLightLetterQ}
      />
      <IlluminatedMesh
        geometry={nodes.letter_u.geometry}
        enabled={enableLightLetterU}
      />
      <IlluminatedMesh
        geometry={nodes.letter_v.geometry}
        enabled={enableLightLetterV}
      />

      {/* Otros elementos iluminables */}
      <IlluminatedMesh
        geometry={nodes.inside_circle_border.geometry}
        enabled={enableLightInsideCircleBorder}
      />
      <IlluminatedMesh
        geometry={nodes.inside_circle.geometry}
        enabled={enableLightInsideCircle}
      />
      <IlluminatedMesh
        geometry={nodes.triskelion.geometry}
        enabled={enableLightTriskelion}
      />

      {/* Fondo metálico (no animado) */}
      <mesh
        geometry={nodes.outside_circle.geometry}
        castShadow
        receiveShadow
        position={[0, -0.1, 0]}
      >
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0}
          roughness={0.1}
          clearcoat={0.01}
          clearcoatRoughness={0}
          reflectivity={0.05}
          envMapIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/enrique.glb");

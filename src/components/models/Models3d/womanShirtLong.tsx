import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import { useEffect } from "react";
import { Model3DProps } from "@/types/Model3dProps";

function Box(props: Model3DProps) {
  const { model3d, texture, backTexture, loweBackTexture, color, ...rest } =
    props;

  const { nodes, materials } = useGLTF(`/models/${model3d}.glb`);

  const frontMap = useTexture(texture ?? `/static-image.jpg`);
  const backMap = useTexture(backTexture ?? `/static-image.jpg`);
  const lowerBackMap = useTexture(loweBackTexture ?? `/static-image.jpg`);
  const bumpMap = useTexture("/textures/ropa_bump.jpg");

  useEffect(() => {
    nodes.shirt.geometry.computeVertexNormals(); // Suavizado
  }, [nodes]);

  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1, 1);

  const material = materials.Material;
  material.bumpMap = bumpMap;
  material.bumpScale = 1;
  material.needsUpdate = true;

  useFrame((state, delta) => {
    easing.dampC(material.color, `#${color}`, 0.25, delta);
  });

  return (
    <group key={1}>
      <mesh
        position={[0, -0.3, 0]}
        castShadow
        receiveShadow
        geometry={nodes.shirt.geometry}
        material={material}
        material-roughness={1}
        {...rest}
        dispose={null}
      >
        {/* Decal frontal principal */}
        <Decal
          position={[0, 0.35, 0.13]}
          rotation={[0, 0, 0]}
          scale={0.24}
          map={frontMap}
          depthTest
          depthWrite
          polygonOffset
          polygonOffsetFactor={-10}
          side={THREE.FrontSide}
        />

        {/* Decal trasero */}
        <Decal
          position={[0, 0.265, -0.13]}
          rotation={[0, Math.PI, 0]}
          scale={0.22}
          map={backMap}
          depthTest
          depthWrite
          polygonOffset
          polygonOffsetFactor={-10}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

export default Box;

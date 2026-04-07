import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import { Model3DProps } from "@/types/Model3dProps";

function Box(props: Model3DProps) {
  const { model3d, texture, backTexture, loweBackTexture, color, ...rest } =
    props;

  const { nodes, materials } = useGLTF(`/models/${model3d}.glb`);

  const frontMap = useTexture(texture ?? `/static-image.jpg`);
  const backMap = useTexture(backTexture ?? `/static-image.jpg`);
  const lowerBackMap = useTexture(loweBackTexture ?? `/static-image.jpg`);
  const bumpMap = useTexture("/textures/ropa_bump.jpg");

  [bumpMap].forEach((map) => {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 1);
  });

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
        position={[0, -0.35, 0]}
        scale={1.2}
        castShadow
        receiveShadow
        geometry={nodes.shirt.geometry}
        material={material}
        material-roughness={1}
        {...rest}
        dispose={null}
      >
        {/* Decal frontal */}
        <Decal
          position={[0, 0.35, 0.12]}
          rotation={[0, 0, 0]}
          scale={0.18}
          map={frontMap}
          depthTest
          depthWrite
          polygonOffset
          polygonOffsetFactor={-10}
          side={THREE.FrontSide}
        />

        {/* Decal trasero */}
        <Decal
          position={[0, 0.4, -0.12]}
          rotation={[0, Math.PI, 0]}
          scale={0.18}
          map={backMap}
          depthTest
          depthWrite
          polygonOffset
          polygonOffsetFactor={-10}
          side={THREE.FrontSide}
        />

        {/* Decal trasero inferior */}
        <Decal
          position={[0, 0.2, -0.11]}
          rotation={[0, Math.PI, 0]}
          scale={0.12}
          map={lowerBackMap}
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

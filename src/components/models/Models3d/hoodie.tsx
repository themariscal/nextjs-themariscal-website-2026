import { Model3DProps } from "@/types/Model3dProps";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";

function Model(props: Model3DProps) {
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
        position={[0, -0.22, 0]}
        scale={0.7}
        castShadow
        receiveShadow
        geometry={nodes.shirt.geometry}
        material={material}
        material-roughness={1}
        {...rest}
        dispose={null}
      >
        <Decal
          position={[0, 0.3, 0.13]}
          rotation={[0, 0, 0]}
          scale={0.35}
          map={frontMap}
          depthTest
          depthWrite
        />
        <Decal
          position={[0, 0.3, -0.15]}
          rotation={[0, Math.PI, 0]}
          scale={0.34}
          map={backMap}
          depthTest
          depthWrite
        />
        <Decal
          position={[0, -0.04, -0.12]}
          rotation={[0, Math.PI, 0]}
          scale={0.15}
          map={lowerBackMap}
          depthTest
          depthWrite
        />
      </mesh>
    </group>
  );
}

export default Model;

import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import { Model3DProps } from "@/types/Model3dProps";

function Box(props: Model3DProps) {
  const { texture, backTexture, loweBackTexture, color, ...rest } = props;

  // Carga del modelo específico
  const { nodes, materials } = useGLTF(`/models/${props.model3d}.glb`);

  // Texturas de decals y bump
  const frontMap = useTexture(texture ?? `/static-image.jpg`);
  const backMap = useTexture(backTexture ?? `/static-image.jpg`);
  const lowerBackMap = useTexture(loweBackTexture ?? `/static-image.jpg`);
  const bumpMap = useTexture("/textures/ropa_bump.jpg");

  // Configuración de bump
  [bumpMap].forEach((map) => {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1, 1);
  });

  // Aplicación del bump al material
  const material = materials.Material;
  material.bumpMap = bumpMap;
  material.bumpScale = 1;
  material.needsUpdate = true;

  // Animación de color suave
  useFrame((state, delta) => {
    easing.dampC(material.color, `#${color}`, 0.25, delta);
  });

  return (
    <group key={1}>
      <mesh
        position={[0, -0.17, 0]}
        scale={0.9}
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
          position={[0, 0.3, 0.13]}
          rotation={[0, 0, 0]}
          scale={0.29}
          map={frontMap}
          depthTest
          depthWrite
          polygonOffset
          polygonOffsetFactor={-10}
          side={THREE.FrontSide}
        />

        {/* Decal trasero */}
        <Decal
          position={[0, 0.3, -0.15]}
          rotation={[0, Math.PI, 0]}
          scale={0.29}
          map={backMap}
          depthTest
          depthWrite
          polygonOffset
          polygonOffsetFactor={-10}
          side={THREE.FrontSide}
        />

        {/* Decal trasero inferior */}
        <Decal
          position={[0, -0.04, -0.12]}
          rotation={[0, Math.PI, 0]}
          scale={0.15}
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

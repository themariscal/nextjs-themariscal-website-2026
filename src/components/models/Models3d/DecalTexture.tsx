import { Decal, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import * as THREE from 'three'

function DecalTexture(props: any) {
  const texture = props.texture;

  texture.wrapS = THREE.RepeatWrapping;
  // texture.repeat.x = - 1;
  return (
      <Decal
        position={[0, 0.30, -0.12]}
        rotation={[0, 0, 0]}
        scale={0.20}
        map={texture}
      />
  )
}
export default DecalTexture
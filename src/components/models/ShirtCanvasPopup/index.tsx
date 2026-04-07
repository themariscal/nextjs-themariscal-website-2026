"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import WomanShirt from "../Models3d/womanShirt";
import Baby from "../Models3d/baby";
import Bolso from "../Models3d/bolso";
import Hoodie from "../Models3d/hoodie";
import KidShirt from "../Models3d/kidShirt";
import LongSleevesMan from "../Models3d/longSleevesMan";
import Shirt from "../Models3d/shirt";
import TankTop from "../Models3d/tankTop";
import WomanShirt2 from "../Models3d/womanShirt2";
import WomanShirtDress from "../Models3d/womanShirtDress";
import WomanShirtLong from "../Models3d/womanShirtLong";
import WomanTop from "../Models3d/womanTop";
import { useEffect, useRef, useState } from "react";
import { RotationTracker } from "./rotationTracker";

function ShirtCanvasPopup(props: any) {
  const controlsRef = useRef<any>(null);
  const [accumulatedRotation, setAccumulatedRotation] = useState(0);
  const [lastAngle, setLastAngle] = useState(0);
  const { isPlaying, onFullRotation } = props;

  useEffect(() => {
    if (props.reset) {
      controlsRef.current?.reset();
    }
  }, [props.reset]);

  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 18 }}
      shadows
      gl={{ preserveDrawingBuffer: true }}
      eventPrefix="client"
    >
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" />
      <RotationTracker
        velocity={props.velocity}
        ref={controlsRef}
        isPlaying={props.isPlaying}
        onFullRotation={onFullRotation}
      />
      {props.model3d === "baby" && <Baby {...props} />}
      {props.model3d === "bag" && <Bolso {...props} />}
      {props.model3d === "hoodie" && <Hoodie {...props} />}
      {props.model3d === "kid-shirt" && <KidShirt {...props} />}
      {props.model3d === "long-sleeves-man" && <LongSleevesMan {...props} />}
      {props.model3d === "shirt" && <Shirt {...props} />}
      {props.model3d === "tank-top" && <TankTop {...props} />}
      {props.model3d === "woman-shirt" && <WomanShirt {...props} />}
      {props.model3d === "woman-cropped-shirt" && <WomanShirt2 {...props} />}
      {props.model3d === "woman-shirt-dress" && <WomanShirtDress {...props} />}
      {props.model3d === "woman-shirt-long" && <WomanShirtLong {...props} />}
      {props.model3d === "woman-top" && <WomanTop {...props} />}
    </Canvas>
  );
}
export default ShirtCanvasPopup;

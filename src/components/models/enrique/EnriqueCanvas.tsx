"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import AutoRotatingGroup from "./AutoRotatingGroup";
import { useDeviceSize } from "@/hooks/useDeviceSize";

interface EnriqueCanvasProps {
  isDarkMode?: boolean;
  enableLightLetterE?: boolean;
  enableLightLetterN?: boolean;
  enableLightLetterR?: boolean;
  enableLightLetterI?: boolean;
  enableLightLetterQ?: boolean;
  enableLightLetterU?: boolean;
  enableLightLetterV?: boolean;
  enableLightInsideCircle?: boolean;
  enableLightInsideCircleBorder?: boolean;
  enableLightTriskelion?: boolean;
}

const EnriqueCanvas = ({
  isDarkMode = true,
  enableLightLetterE = false,
  enableLightLetterN = false,
  enableLightLetterR = false,
  enableLightLetterI = false,
  enableLightLetterQ = false,
  enableLightLetterU = false,
  enableLightLetterV = false,
  enableLightInsideCircle = false,
  enableLightInsideCircleBorder = false,
  enableLightTriskelion = false,
}: EnriqueCanvasProps) => {
  const device = useDeviceSize();
  const cameraDesktop = { position: [-2, -2, 6], fov: 45, near: 0.1, far: 300 };
  const cameraMobile = {
    position: [-7, -4, 0.4],
    fov: 45,
    near: 0.1,
    far: 300,
  };

  const modelScaleDesktop = 1;
  const modelScaleMobile = 0.85;

  const modelPositionDesktop = [2, -0.3, 0];
  const modelPositionMobile = [2, -0.32, 0];

  const isMobile = device !== "desktop";

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas
        shadows
        camera={
          isMobile
            ? {
                position: cameraMobile.position as [number, number, number],
                fov: cameraMobile.fov,
                near: cameraMobile.near,
                far: cameraMobile.far,
              }
            : {
                position: cameraDesktop.position as [number, number, number],
                fov: cameraDesktop.fov,
                near: cameraDesktop.near,
                far: cameraDesktop.far,
              }
        }
        gl={{ preserveDrawingBuffer: true }}
      >
        <directionalLight
          castShadow
          color="#FFF8E1"
          intensity={3}
          position={[50, 20, 0]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.005}
        />

        <Environment
          near={1}
          far={1000}
          resolution={256}
          preset="forest"
          backgroundBlurriness={0.5}
        />
        <Suspense fallback={null}>
          <group
            position={
              isMobile
                ? (modelPositionMobile as [number, number, number])
                : (modelPositionDesktop as [number, number, number])
            }
            scale={isMobile ? modelScaleMobile : modelScaleDesktop}
          >
            <AutoRotatingGroup
              enableLightLetterE={enableLightLetterE}
              enableLightLetterN={enableLightLetterN}
              enableLightLetterR={enableLightLetterR}
              enableLightLetterI={enableLightLetterI}
              enableLightLetterQ={enableLightLetterQ}
              enableLightLetterU={enableLightLetterU}
              enableLightLetterV={enableLightLetterV}
              enableLightInsideCircle={enableLightInsideCircle}
              enableLightInsideCircleBorder={enableLightInsideCircleBorder}
              enableLightTriskelion={enableLightTriskelion}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default EnriqueCanvas;

/**
 * The one WebGL world, composed from Animus's own scene pieces (sky, lights, island, objects, Wren, post FX).
 * Animus's orbit camera and editing tools are left out; the site drives the camera itself.
 */
import { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import type { OutlineEffect } from 'postprocessing';
import { services } from '@/runtime/services';
import { useSettingsStore } from '@/state/settingsStore';
import { createSceneBridge } from '@/scene/bridge';
import { Lights } from '@/scene/env/Lights';
import { PALETTE } from '@/scene/env/palette';
import { Platform } from '@/scene/env/Platform';
import { PostFX } from '@/scene/env/PostFX';
import { SkyDome } from '@/scene/env/SkyDome';
import { LampLights } from '@/scene/fx/LampLights';
import { qualityProfile } from '@/scene/quality';
import { liveWorld } from '@/scene/runtime/liveWorld';
import { QualityContext } from '@/scene/objects/context';
import { ObjectsLayer } from '@/scene/objects/ObjectsLayer';
import { Character } from '@/character';

function LiveDriver() {
  useFrame(({ camera }, dt) => liveWorld.step(camera, Date.now(), dt), -20);
  return null;
}

function BridgeRegistrar() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  useEffect(() => services.register('scene', createSceneBridge(() => camera, () => gl.domElement)), [camera, gl]);
  return null;
}

function Camera() {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    camera.position.set(0, 2.2, 6.4);
    camera.lookAt(0, 1.1, 0);
  });
  return null;
}

export function Stage() {
  const quality = useSettingsStore((s) => s.settings.graphics.quality);
  const profile = useMemo(() => qualityProfile(quality), [quality]);
  const outlines = useMemo(
    () => ({
      selected: { current: null as OutlineEffect | null },
      hover: { current: null as OutlineEffect | null },
      highlight: { current: null as OutlineEffect | null },
    }),
    [],
  );
  return (
    <div style={{ position: 'fixed', inset: 0, background: PALETTE.skyZenith }}>
      <Canvas
        dpr={[1, 2]}
        flat
        shadows="percentage"
        camera={{ position: [0, 2.2, 6.4], fov: 38, near: 0.1, far: 900 }}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      >
        <QualityContext.Provider value={profile}>
          <color attach="background" args={[PALETTE.skyZenith]} />
          <LiveDriver />
          <BridgeRegistrar />
          <SkyDome detail={profile.skyDetail} />
          <Lights profile={profile} />
          <Platform />
          <ObjectsLayer />
          <LampLights max={profile.maxLampLights} />
          <Suspense fallback={null}>
            <Character />
          </Suspense>
          <Camera />
          <PostFX profile={profile} outlines={outlines} />
        </QualityContext.Provider>
      </Canvas>
    </div>
  );
}

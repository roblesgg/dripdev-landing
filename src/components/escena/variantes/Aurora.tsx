'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LogoParticulas } from '../LogoParticulas'
import { AJUSTES, type PropsVariante } from '../ajustes'
import { RUIDO_GLSL } from '../glsl'
import { Z_INICIO } from '../Camara'
import { progresoScroll, ponerVelo } from '../utiles'

const VERTICE = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAGMENTO = /* glsl */ `
  ${RUIDO_GLSL}
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uRes;
  uniform vec2 uMouse;

  void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    p *= 1.35;
    p.y += uScroll * 2.6;
    float t = uTime * 0.06;

    // Doble deformación del dominio: el campo se pliega sobre sí mismo como seda
    vec2 q = vec2(fbm2(p * 1.2 + t), fbm2(p * 1.2 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm2(p * 1.5 + q * 2.0 + vec2(1.7, 9.2) + t * 1.3),
      fbm2(p * 1.5 + q * 2.0 + vec2(8.3, 2.8) - t)
    );
    float f = fbm2(p * 1.3 + r * 2.2);

    // El cursor levanta la seda a su paso
    vec2 m = uMouse * vec2(uRes.x / uRes.y, 1.0) * 0.5 * 1.35;
    f += smoothstep(0.7, 0.0, length(p - m)) * 0.12;

    // La paleta pasa de violeta y coral a azul y turquesa al bajar
    float ciclo = 0.5 + 0.5 * sin(uScroll * 6.2831853);
    vec3 c1 = mix(vec3(0.16, 0.09, 0.36), vec3(0.10, 0.18, 0.52), ciclo);
    vec3 c2 = mix(vec3(0.90, 0.49, 0.54), vec3(0.12, 0.60, 0.62), ciclo * 0.7);
    vec3 c3 = mix(vec3(0.99, 0.71, 0.36), vec3(0.70, 0.95, 1.00), ciclo * 0.6);
    vec3 c = mix(c1, c2, smoothstep(0.25, 0.65, f));
    c = mix(c, c3, smoothstep(0.62, 0.95, f) * 0.8);

    // Curvas de nivel finas, como un mapa topográfico de luz
    float g = fract(f * 9.0);
    float linea = 1.0 - smoothstep(0.0, 0.06, min(g, 1.0 - g));
    c += linea * 0.16 * vec3(1.0, 0.95, 1.0);

    float vig = smoothstep(1.35, 0.15, length(p * vec2(0.8, 1.0)));
    c *= 0.2 + 0.58 * vig * smoothstep(0.1, 0.9, f + 0.25);
    gl_FragColor = vec4(c, 1.0);
  }
`

export default function Aurora({ calidad, estatico }: PropsVariante) {
  const a = AJUSTES[calidad]
  const material = useRef<THREE.ShaderMaterial>(null)
  const progreso = useRef(0)
  const suave = useMemo(() => new THREE.Vector2(), [])
  const uniformes = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uRes: { value: new THREE.Vector2(1280, 720) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  )

  useFrame((state, dt) => {
    const u = material.current?.uniforms
    if (!u) return
    const dpr = state.gl.getPixelRatio()
    u.uRes.value.set(state.size.width * dpr, state.size.height * dpr)
    state.camera.position.set(0, 0, Z_INICIO)
    state.camera.lookAt(0, 0, 0)
    if (estatico) return

    u.uTime.value = state.clock.elapsedTime
    progreso.current = THREE.MathUtils.damp(progreso.current, progresoScroll(), 3, dt)
    u.uScroll.value = progreso.current
    suave.x = THREE.MathUtils.damp(suave.x, state.pointer.x, 3, dt)
    suave.y = THREE.MathUtils.damp(suave.y, state.pointer.y, 3, dt)
    u.uMouse.value.copy(suave)
    ponerVelo(0.3)
  })

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-20}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={material}
          vertexShader={VERTICE}
          fragmentShader={FRAGMENTO}
          uniforms={uniformes}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <LogoParticulas puntos={a.puntosLogo} estatico={estatico} alturaRelativa={calidad === 'alta' ? 0.15 : 0.27} />
    </>
  )
}

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OrbProps {
  recoveryRate: number; // 0-100, drives color mix + pulse speed
  activeCases: number;
}

function Core({ recoveryRate, activeCases }: OrbProps) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  const amber = useMemo(() => new THREE.Color("#DDAB53"), []);
  const sage = useMemo(() => new THREE.Color("#6FA37F"), []);
  const mixed = useMemo(() => amber.clone().lerp(sage, Math.min(1, recoveryRate / 100)), [recoveryRate, amber, sage]);

  const particles = useMemo(() => {
    const count = Math.min(60, 12 + activeCases);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [activeCases]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.12;
      group.current.rotation.x = Math.sin(t * 0.08) * 0.08;
    }
    if (inner.current) {
      const s = 1 + Math.sin(t * 1.4) * 0.035;
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.15, 2]} />
        <meshStandardMaterial
          color={mixed}
          emissive={mixed}
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.6}
          wireframe
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial color={mixed} emissive={mixed} emissiveIntensity={0.9} roughness={0.15} metalness={0.4} transparent opacity={0.18} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
        <pointsMaterial color={mixed} size={0.035} transparent opacity={0.75} sizeAttenuation />
      </points>
    </group>
  );
}

export default function RevenueOrb({ recoveryRate, activeCases }: OrbProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 4.4], fov: 42 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 2, 4]} intensity={40} color="#EFC77E" />
        <pointLight position={[-3, -2, -3]} intensity={15} color="#6FA37F" />
        <Core recoveryRate={recoveryRate} activeCases={activeCases} />
      </Canvas>
    </div>
  );
}

export interface MarkerData {
  id: number;
  position: [number, number, number];
  label: string;
}

export interface CraterData {
  lat: number;
  lon: number;
  size: number;
  depth: number;
  name: string;
}

export interface MoonProps {
  rotationSpeed: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
  onMark: (marker: MarkerData) => void;
  markers: MarkerData[];
}

export interface OrbitRingProps {
  visible: boolean;
  radius?: number;
  color?: string;
}

export interface SatelliteProps {
  orbitDistance: number;
  orbitSpeed: number;
  size?: number;
  color?: string;
}

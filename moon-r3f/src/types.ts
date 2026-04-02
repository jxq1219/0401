import { Vector3 } from 'three';

// 标记数据接口
export interface MarkerData {
  id: string;
  position: Vector3;
  lat: number;
  lon: number;
}

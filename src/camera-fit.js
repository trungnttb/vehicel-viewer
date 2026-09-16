import { MathUtils, Vector3 } from 'three';

// Fit the bounds in camera space; tall cranes and long trailers need different framing.
export function fittingFov(bounds,camera,minimum=36,padding=1.14) {
  camera.updateMatrixWorld();
  const corner=new Vector3();let tangent=0;
  for(const x of [bounds.min.x,bounds.max.x]) for(const y of [bounds.min.y,bounds.max.y]) for(const z of [bounds.min.z,bounds.max.z]) {
    corner.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);
    const depth=Math.max(.1,-corner.z);
    tangent=Math.max(tangent,Math.abs(corner.y)/depth,Math.abs(corner.x)/(depth*camera.aspect));
  }
  return Math.max(minimum,MathUtils.radToDeg(2*Math.atan(tangent*padding)));
}

import { MathUtils, Vector3, Spherical } from 'three';

// NDC limits for the model: the viewer toolbar overlays the bottom of the stage and the guide button sits top-left.
export const safeFrame={left:-.92,right:.92,bottom:-.78,top:.9};

// Per-mesh box corners follow the real outline far closer than one box around the whole vehicle
// (tall cranes and long trailers especially), and stay valid while parts move apart.
export function outlineSamples(root) {
  const samples=[];
  root.traverse(mesh=>{
    if(!mesh.isMesh) return;
    if(!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const {min,max}=mesh.geometry.boundingBox, corners=[];
    for(const x of [min.x,max.x]) for(const y of [min.y,max.y]) for(const z of [min.z,max.z]) corners.push(new Vector3(x,y,z));
    samples.push({mesh,corners});
  });
  return samples;
}

export function outlinePoints(samples,out=[]) {
  let count=0;
  for(const {mesh,corners} of samples) {
    if(!mesh.visible) continue;
    mesh.updateWorldMatrix(true,false);
    for(const corner of corners) (out[count++]??=new Vector3()).copy(corner).applyMatrix4(mesh.matrixWorld);
  }
  out.length=count;
  return out;
}

const view=new Vector3();
export function outlineFov(points,camera,minimum=0,frame=safeFrame) {
  camera.updateMatrixWorld();
  let tangent=0;
  for(const point of points) {
    view.copy(point).applyMatrix4(camera.matrixWorldInverse);
    const depth=Math.max(.1,-view.z), x=view.x/(depth*camera.aspect), y=view.y/depth;
    tangent=Math.max(tangent,x/(x<0?frame.left:frame.right),y/(y<0?frame.bottom:frame.top));
  }
  return Math.max(minimum,MathUtils.radToDeg(2*Math.atan(tangent)));
}

// Separating may shrink the vehicle on screen by at most this share; the resting lens is widened to leave that room.
export const maxSeparationShrink=.15;

// Resting framing: the orbit target height and the narrowest lens that keeps the assembled vehicle
// inside the safe frame from every side at the reset height (so its size stays steady while the
// child rotates it), widened so the separated parts fit after shrinking by at most maxSeparationShrink.
export function restingFraming(assembled,separated,bounds,camera,offset,frame=safeFrame) {
  const probe=camera.clone(), center=bounds.getCenter(new Vector3()), height=bounds.getSize(new Vector3()).y;
  const orbit=new Spherical().setFromVector3(offset), step=new Spherical(), target=new Vector3();
  let best={targetY:center.y,fov:Infinity};
  for(let shift=-.4;shift<=.401;shift+=.05) {
    target.set(center.x,center.y+shift*height,center.z);
    let fov=0;
    for(let i=0;i<24 && fov<best.fov;i++) {
      step.copy(orbit); step.theta+=i/24*Math.PI*2;
      probe.position.setFromSpherical(step).add(target); probe.lookAt(target);
      const apart=outlineFov(separated,probe,0,frame);
      fov=Math.max(fov,outlineFov(assembled,probe,0,frame),MathUtils.radToDeg(2*Math.atan((1-maxSeparationShrink)*Math.tan(MathUtils.degToRad(apart)/2))));
    }
    if(fov<best.fov) best={targetY:target.y,fov};
  }
  return best;
}

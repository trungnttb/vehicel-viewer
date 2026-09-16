// A pinch, cancelled touch, or drag must never become a part selection on release.
export function createTapTracker() {
  const active = new Set();
  let candidate = null;
  return {
    down(event) {
      active.add(event.pointerId);
      candidate = active.size === 1
        ? { id:event.pointerId, x:event.clientX, y:event.clientY, time:event.timeStamp, tolerance:event.pointerType === 'touch' ? 12 : 7 }
        : null;
    },
    move(event) {
      if (candidate?.id === event.pointerId && Math.hypot(event.clientX-candidate.x,event.clientY-candidate.y)>candidate.tolerance) candidate=null;
    },
    up(event) {
      const tapped = candidate?.id === event.pointerId && active.size === 1 && event.timeStamp-candidate.time < 700
        && Math.hypot(event.clientX-candidate.x,event.clientY-candidate.y)<=candidate.tolerance;
      active.delete(event.pointerId); candidate=null;
      return Boolean(tapped);
    },
    cancel(event) { active.delete(event.pointerId); candidate=null; },
    clear() { active.clear(); candidate=null; },
  };
}

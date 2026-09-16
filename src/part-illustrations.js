// Simple recognizable pictures, not numbers or colors as the only way to choose.
const pictures = {
  body:'<path fill="#f3f5ef" d="M7 32 13 25h10l8-12h19l12 14 8 5v17H7z"/><path fill="#92b0b5" d="m29 25 6-9h12l8 10z"/><circle fill="#465252" cx="21" cy="48" r="8"/><circle fill="#465252" cx="57" cy="48" r="8"/>',
  hood:'<path fill="#cad5d9" d="m10 37 9-18 36-5 13 24-15 12-31 1z"/><path stroke="#fff" stroke-width="4" d="m23 23-4 14m31-15 8 15"/><path d="m10 37 24 6 34-5"/>',
  roof:'<path fill="#c1b6d5" d="m9 37 14-20h32l15 20-8 12H18z"/><path fill="#eef1f2" d="m24 21-8 13h45l-9-13z"/><path d="M18 49v6m44-6v6"/>',
  doors:'<path fill="#c5ded5" d="m15 52 0-25 14-16h29v41z"/><path fill="#8caeb8" d="m21 28 11-12h20v12z"/><path stroke-width="4" d="M44 36h8"/>',
  wheels:'<circle fill="#354449" cx="39" cy="34" r="25"/><circle fill="#e8eeeb" cx="39" cy="34" r="17"/><circle fill="#7f979b" cx="39" cy="34" r="5"/><path stroke-width="4" d="M39 17v12m0 10v12M22 34h12m10 0h12M27 22l9 9m7 7 8 8m0-24-9 9m-7 7-8 8"/>',
  lights:'<path fill="#f7d771" d="M39 14c-20 0-26 12-26 20s6 20 26 20z"/><path d="M46 20h20M46 30h24M46 40h24M46 50h20" stroke="#d5a637" stroke-width="4"/>',
  mirrors:'<path fill="#e7eded" d="M13 18q0-7 10-7h27q13 1 13 17v16H22q-9 0-9-8z"/><path fill="#8dacb7" d="M19 20h29q9 0 9 12v5H19z"/><path stroke-width="7" d="M53 46v10h13"/>',
  trunk:'<path fill="#e6d0d9" d="m9 36 13-9h34l13 9v21H9z"/><path fill="#f1e3e8" d="m17 25 8-17h31l7 17z"/><path d="m22 27-5-2m39 2 7-2"/><rect fill="#c1a480" x="28" y="34" width="25" height="17" rx="3"/><path d="M34 34v-5h12v5"/>',
  engine:'<path fill="#aebdc0" d="M17 24h8v-9h28v9h9v27H17z"/><path fill="#4f6569" d="M25 17h29v12H25z"/><path d="M31 35v10m9-10v10m9-10v10" stroke-width="4"/><path d="M11 28H6v16h11m54-11h6v13h-6"/><circle fill="#e7c65f" cx="56" cy="17" r="5"/>',
  seats:'<rect fill="#caa786" x="23" y="7" width="23" height="11" rx="5"/><path fill="#dcb995" d="M20 25q-1-5 5-5h20q5 0 5 5v17h13v13H20z"/><path d="M26 57v5m29-5v5M27 26l17 16" stroke-width="4"/>',
  steering:'<circle fill="#e8eeeb" cx="39" cy="34" r="25" stroke-width="7"/><path d="m16 29 16 7m30-7-16 7m-7 5v16" stroke-width="7"/><ellipse fill="#9ab9b5" cx="39" cy="35" rx="11" ry="8"/>',
  axles:'<rect fill="#465454" x="8" y="16" width="15" height="37" rx="6"/><rect fill="#465454" x="56" y="16" width="15" height="37" rx="6"/><path d="M23 34h33" stroke="#97a9b2" stroke-width="9"/><ellipse fill="#b9b2ca" cx="39" cy="34" rx="10" ry="9"/>',
};
export function partIllustration(id) {
  return `<svg class="part-picture" viewBox="0 0 78 68" fill="none" stroke="#536b65" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${pictures[id] ?? pictures.body}</svg>`;
}

// Optional macOS asset generator. Runtime clients only need the resulting M4A files.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { allParts } from '../src/vehicle-catalog.js';
import { audioMessages } from '../src/audio-messages.js';

if (process.platform !== 'darwin') throw new Error('This optional generator requires macOS say and afconvert. Existing audio files work on any platform.');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root,'public/audio/vi');
const temporary = mkdtempSync(join(tmpdir(),'little-garage-audio-'));
mkdirSync(output,{recursive:true});
function run(command,args) {
  const result=spawnSync(command,args,{encoding:'utf8'});
  if (result.error || result.status !== 0) throw new Error(`${command}: ${result.error?.message || result.stderr}`);
  return result.stdout;
}
const recordings = [...allParts.map(part=>[part.id,part.name]),...Object.entries(audioMessages)];
for(const [id,text] of recordings) {
  const source=join(temporary,`${id}.aiff`);
  run('say',['-v','Linh (Vietnamese (Vietnam))','-r','150','-o',source,text]);
  const info=run('afinfo',[source]);
  const duration=Number(info.match(/estimated duration:\s*([\d.]+)/)?.[1]);
  if (!(duration > .15)) throw new Error(`Empty recording for ${id}; the local speech service may require permission.`);
  const destination=join(output,`${id}.m4a`);
  run('afconvert',['-f','m4af','-d','aac','-b','64000',source,destination]);
  console.log(`${id}: ${duration.toFixed(2)} s, ${statSync(destination).size} bytes`);
}
console.log(`Generated ${recordings.length} files. Temporary source audio: ${temporary}`);

import {readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
// package-lock.json is a public dependency manifest, never a credential artifact.
const lock=readFileSync('package-lock.json');
const value=gzipSync(lock).toString('base64'),chunks=value.match(/.{1,1000}/g);
console.log('PIXBET_DEPENDENCY_LOCK_BEGIN '+chunks.length+' '+createHash('sha256').update(lock).digest('hex'));
chunks.forEach((chunk,i)=>console.log('PIXBET_DEPENDENCY_LOCK_'+i+' '+chunk));
console.log('PIXBET_DEPENDENCY_LOCK_END');


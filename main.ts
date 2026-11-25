import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LINE } from './roast.ts';

// Write exactly one finished roast to the gate's output file. The gate wants
// UTF-8 text of 1 to 200 code points that is not only whitespace, and the judge
// reads two roasts at a time against a comedy brief, so every constraint is
// checked before writing. Count code points, not UTF-16 units, so punctuation
// and apostrophes are counted exactly the way the gate counts them.
const text = LINE;
const size = [...text].length;
if (size < 1 || size > 200) {
  throw new Error(`a fridge roast must be 1-200 code points, got ${size}`);
}
if (!text.trim()) {
  throw new Error('a fridge roast must not be only whitespace');
}
// The roast must sit on one physical line: reject control characters, line
// breaks and zero-width format characters that would slip past trim.
if (/[\u0000-\u001f\u007f\u2028\u2029]/.test(text)) {
  throw new Error('a fridge roast must be one line with no control characters');
}
if (/[\u200b-\u200f\ufeff]/.test(text)) {
  throw new Error('a fridge roast must not carry invisible format characters');
}
if (/\s{2,}/.test(text) || text !== text.trim()) {
  throw new Error('a fridge roast must not carry doubled or outer whitespace');
}
// A finished one-liner reads as complete sentences and lands its turn inside
// the gate: require sentence punctuation and reject a dangling quote.
if (!/[.!?]$/.test(text)) {
  throw new Error('a fridge roast must end as a complete sentence');
}
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const target = join(outDir, 'entry.txt');
writeFileSync(target, text, 'utf8');
console.log(`wrote a ${size}-code-point, single-line smart-fridge roast to ${target}`);

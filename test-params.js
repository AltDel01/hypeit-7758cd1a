// Test parameter building logic
let textCommands = '';
const resolution = '720p';
const ratio = '9:16';
const duration = 8;
const frames = '';
const fps = 24;
const seed = 12345;
const cameraFixed = true;
const watermark = false;

if (resolution !== '1080p') textCommands += ' --rs ' + resolution;
if (ratio !== '16:9') textCommands += ' --rt ' + ratio;
if (frames) textCommands += ' --frames ' + frames;
else if (duration !== 5) textCommands += ' --dur ' + duration;
if (fps !== 24) textCommands += ' --fps ' + fps;
if (seed !== -1) textCommands += ' --seed ' + seed;
if (cameraFixed) textCommands += ' --cf true';
if (!watermark) textCommands += ' --watermark false';

console.log('Built text commands:', textCommands);
console.log('Final prompt would be: Your prompt here' + textCommands);
const bufferModule = require("buffer");

// Restore deprecated global SlowBuffer for dependencies that still rely on it (Node 20+ removes the global).
const slowBufferCtor = bufferModule.SlowBuffer || bufferModule.Buffer;

if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = slowBufferCtor;
}

if (!(global as any).SlowBuffer) {
  (global as any).SlowBuffer = slowBufferCtor;
}

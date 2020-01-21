export default async function readFile(file: File, onData: (data: Uint8Array) => Promise<boolean> | boolean) {
  if ((file as any).stream) {
    // Blob.stream is supported
    const stream: ReadableStream = (file as any).stream();
    const reader = stream.getReader();
    while (1) {
      const readResult = await reader.read();
      if (readResult.value && readResult.value.length > 0) {
        if (await onData(readResult.value)) break;
      }
      if (readResult.done) break;
    }
  } else {
    // Blob.stream is not supported
    const totalSize = file.size;
    const CHUNK_SIZE = 65536;
    for (let startByte = 0; startByte + CHUNK_SIZE <= totalSize; startByte += CHUNK_SIZE) {
      const blob = file.slice(startByte, startByte + CHUNK_SIZE);
      const response = new Response(blob);
      const reader = response.body.getReader();
      while (1) {
        const readResult = await reader.read();
        if (readResult.value && readResult.value.length > 0) {
          if (await onData(readResult.value)) break;
        }
        if (readResult.done) break;
      }
    }
  }
}

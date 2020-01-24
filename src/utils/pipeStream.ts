export default async function pipeStream(
  readableStream: ReadableStream,
  writableStream: WritableStream,
  abortCallbackReceiver?: { abort?: () => void }
) {
  if (window.WritableStream && readableStream.pipeTo) {
    const abortController = new AbortController();
    if (abortCallbackReceiver) abortCallbackReceiver.abort = abortController.abort.bind(abortController);
    await readableStream.pipeTo(writableStream, abortController);
  } else {
    const writer = writableStream.getWriter();
    if (abortCallbackReceiver) abortCallbackReceiver.abort = writer.abort.bind(writer);
    const reader = readableStream.getReader();
    while (1) {
      const readResult = await reader.read();
      if (readResult.done) {
        writer.close();
        break;
      } else {
        writer.write(readResult.value);
      }
    }
  }
}

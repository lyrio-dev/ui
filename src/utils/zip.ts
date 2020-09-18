import "streamsaver/examples/zip-stream";

interface FileLike {
  name: string;
  stream(): ReadableStream;
  lastModified?: number;
  directory?: boolean;
  comment?: string;
}

export const createZipStream: (underlyingSource: UnderlyingSource<FileLike>) => ReadableStream = (window as any).ZIP;

export async function createZipBlob(underlyingSource: UnderlyingSource<FileLike>): Promise<Blob> {
  return await new Response(createZipStream(underlyingSource)).blob();
}

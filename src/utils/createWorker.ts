// https://github.com/developit/workerize-loader/issues/3#issuecomment-393165124

type WorkerType<T> = T & Pick<Worker, "terminate">;
export function createWorker<T>(workerPath: T): WorkerType<T> {
  return (workerPath as any)();
}
export type createWorker<T> = WorkerType<T>;

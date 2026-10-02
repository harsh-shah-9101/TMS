import { pivotLocally, type PivotRequest, type PivotResult } from './pivotEngine';

export async function runPivot(request: PivotRequest): Promise<PivotResult> {
  if (typeof Worker === 'undefined') return pivotLocally(request);
  try {
    const worker = new Worker(new URL('./pivot.worker.ts', import.meta.url), { type: 'module' });
    return await new Promise((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<PivotResult>) => {
        worker.terminate();
        resolve(event.data);
      };
      worker.onerror = () => {
        worker.terminate();
        reject(new Error('pivot worker failed'));
      };
      worker.postMessage(request);
    });
  } catch {
    return pivotLocally(request);
  }
}

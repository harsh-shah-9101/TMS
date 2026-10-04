import { pivotLocally, type PivotRequest } from './pivotEngine';

self.onmessage = (event: MessageEvent<PivotRequest>) => {
  const result = pivotLocally(event.data);
  self.postMessage(result);
};

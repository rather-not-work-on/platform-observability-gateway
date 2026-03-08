export class ReplayWorker {
  replay(batchId: string): { replayed: boolean; batchId: string } {
    return {
      replayed: true,
      batchId,
    };
  }
}

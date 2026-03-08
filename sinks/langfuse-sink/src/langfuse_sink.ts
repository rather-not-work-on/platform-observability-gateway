export class LangfuseSink {
  deliver(eventName: string): { delivered: boolean; eventName: string } {
    return {
      delivered: true,
      eventName,
    };
  }
}

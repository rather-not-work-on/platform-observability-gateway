export class FileBuffer {
  append(eventName: string): { buffered: boolean; eventName: string } {
    return {
      buffered: true,
      eventName,
    };
  }
}

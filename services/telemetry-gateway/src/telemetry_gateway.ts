export class TelemetryGateway {
  ingest(eventName: string): { accepted: boolean; eventName: string } {
    return {
      accepted: true,
      eventName,
    };
  }
}

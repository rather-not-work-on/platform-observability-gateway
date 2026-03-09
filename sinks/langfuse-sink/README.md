# langfuse-sink

Own the external LangFuse delivery boundary.

- consume the shared telemetry envelope normalization before producing delivery outcomes
- implement the telemetry sink delivery port only
- do not own replay policy
- alternate sinks stay out of this scaffold step

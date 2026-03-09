# telemetry-gateway-composer

Compose the telemetry gateway with repo-local default buffer and sink implementations.

- own default composition only
- keep envelope normalization and dispatch in `telemetry-gateway`
- keep sink and replay implementations in sibling packages

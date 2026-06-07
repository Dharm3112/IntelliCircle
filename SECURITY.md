# Security Policy

## Supported Versions

Currently, only the latest version of IntelliCircle is supported with security updates. 

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of IntelliCircle very seriously. If you discover a security vulnerability within this project, please **do not open a public issue**. 

Instead, please send an email to the project maintainers directly or report it privately through GitHub's vulnerability reporting feature.

Please include the following information in your report:
* A description of the vulnerability.
* Steps to reproduce the issue.
* Potential impact of the vulnerability.
* Any other relevant information or proof of concept (e.g., specific to Fastify, Next.js, or WebSockets).

We will endeavor to respond to your report within 48 hours and will keep you informed of our progress in resolving the issue. We will also coordinate with you on the timeline for public disclosure.

## Security Architecture & Practices

IntelliCircle employs several built-in security measures across its decoupled Client-Server architecture:

* **Authentication**: Enterprise-grade, fully asymmetric JWT authentication (RS256).
* **Data Validation**: Universal payload validation using [Zod](https://zod.dev/) across the entire stack. This strict typing ensures DB schemas, WebSocket payloads, and REST APIs are resistant to injection and malformed data attacks.
* **Rate Limiting & DDoS Prevention**: Strict rate limiting implemented at the infrastructure layer, backed by Redis.
* **CSRF Protection**: Configured by default across state-changing HTTP endpoints.
* **Data Privacy**: Hyper-local tracking and discovery are managed securely via PostgreSQL and PostGIS, ensuring location data is strictly processed based on proximity rules.

### Contributing Secure Code
When contributing to IntelliCircle, please ensure your changes respect the `shared` boundaries. All new input vectors (REST routes, WS channels, database queries) **must** be validated against updated Zod schemas in `packages/shared/src/schema.ts` before being processed by the Next.js client or Fastify server.

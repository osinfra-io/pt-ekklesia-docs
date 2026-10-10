---
sidebar_label: Glossary
description: Terms used across the platform consumer guides.
---

# Glossary

| Term | Meaning |
| --- | --- |
| Auth mode | How a route authenticates callers: `public`, `browser`, or `api-jwt`. |
| `dns_subdomain` | Your team's authoritative DNS subdomain. Route hostnames are always derived from it, never supplied by a team. |
| Gateway cluster | A Pneuma GKE cluster that runs the shared ingress gateway. Member clusters have no public endpoint. |
| Logos spec | Your team's record in the Logos repository: team data, namespaces, routes, and auth policies. Nomos writes it; you never edit it by hand. |
| Member cluster | A team GKE cluster that joins the mesh and is reached through the gateway cluster. |
| Mesh-enabled namespace | A namespace enrolled in the mesh. Routes and auth policies are valid only on these. |
| Nomos Agent | The agent that validates team requests and opens pull requests in the owning repositories. |
| Route | A service, port, and optional path prefix you ask Nomos for to serve traffic at your team's hostname. |
| Route auth policy | The authentication requirement attached to a route, keyed by the route name under `route_auth_policies`. |

# Novera Frontend

The homepage currently renders from local fixtures so visual development remains deterministic. A typed Laravel API boundary is prepared for gradual integration without changing the current experience.

## Configuration

Create local frontend environment configuration from `.env.example`:

```bash
cp .env.example .env.local
```

Defaults:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_USE_REAL_API=false
```

Keep `NEXT_PUBLIC_USE_REAL_API=false` while working from mock discovery data. Set it to `true` only when the Laravel API is running and the relevant UI module is ready to consume its payload.

## API Boundary

- `lib/api/client.ts` provides typed JSON `GET`, `POST`, `PUT`, and `DELETE` requests, with bearer-token support reserved for future authentication work.
- `lib/api/types.ts` mirrors the existing Laravel resource responses for discovery entities.
- `lib/data/discovery.ts` exposes `getHomeDiscovery()` and `getCityDiscovery(citySlug)`. Both use local mock-derived responses by default and call Laravel only when the real API flag is enabled.

No login or registration flow is connected yet. Once authentication is added, pass the issued token through the API client request options.

## Gradual Switch To Laravel

1. Run Laravel locally so the API base URL is reachable.
2. Keep the homepage on mock data while integrating one UI module at a time through `lib/data/discovery.ts`.
3. Add presentation adapters from API resource payloads to the Creative Map and activity view models.
4. Set `NEXT_PUBLIC_USE_REAL_API=true` once the module being tested is wired and its fallback behavior is acceptable.

Laravel currently exposes `/api/discovery/home` directly. The frontend city selector is slug-based, while the backend test suite currently exercises `/api/discovery/city/{city}` using a numeric city ID. Before enabling real city switching, update the Laravel city route binding to accept slugs or add an ID-resolution boundary in the frontend adapter.

The cinematic city photos and videos remain local presentation assets; discovery API integration should not replace them unless product media management is explicitly introduced.

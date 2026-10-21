# Proposed frontend job API contract

This is a **frontend integration proposal**, not a claim that the existing backend implements these endpoints. Reconcile this contract with `backend/app/schemas.py` and the workflow design before writing FastAPI routes. The frontend currently executes it using MSW.

Base URL: `/api`. JSON field names use `snake_case`. Dates are ISO 8601 UTC strings. The MVP is English-only: there is no language field in the form or request contract.

## Endpoints

| Method | Path | Success | Behavior |
| --- | --- | --- | --- |
| POST | `/api/jobs` | 202 Job | Validate settings and queue work |
| GET | `/api/jobs/{id}` | 200 Job | Poll current state/result |
| GET | `/api/jobs?limit=10&offset=0` | 200 JobsPage | List newest jobs first |
| POST | `/api/jobs/{id}/cancel` | 200 Job | Cancel a queued/running job |
| POST | `/api/jobs/{id}/retry` | 202 Job | Create a new attempt from a failed/cancelled job |

Unknown id: 404. Invalid input/pagination: 422. Illegal status transition: 409. Error body for the current client: `{ "detail": "A readable error message." }`. FastAPI's default validation error array is accepted but currently shown as a generic HTTP error; normalize it to a string or extend `api-client.ts` when integrating.

`limit` must be an integer from 1 to 100, `offset` a nonnegative integer. The current UI uses pages of 10.

## JobConfig — POST /jobs body

```json
{
  "chemical": "Water (H₂O)",
  "output_type": "video",
  "aspect_ratio": "16:9",
  "duration_seconds": 60,
  "voice": "female",
  "visual_style": "illustration"
}
```

| Field | Allowed values |
| --- | --- |
| `chemical` | Trimmed, nonempty string, max 70 characters |
| `output_type` | `video`, `slides`, `script` |
| `aspect_ratio` | `16:9`, `9:16`, `1:1` |
| `duration_seconds` | `30`, `60`, `90` |
| `voice` | `female`, `male`; logical aliases to be mapped by the TTS integration |
| `visual_style` | `illustration`, `minimal`, `classroom` |

All fields are currently required. Script output hides the ratio control but keeps its last value in the request; the backend may ignore visual options for script-only output. Duration is a target, not a guarantee of generated media length. Voice and style controls are intentions for the future pipeline, not implemented provider integrations.

## Job

```json
{
  "id": "bfa48dbc-baea-4c49-b146-7044aa4d882c",
  "config": {
    "chemical": "Water (H₂O)",
    "output_type": "video",
    "aspect_ratio": "16:9",
    "duration_seconds": 60,
    "voice": "female",
    "visual_style": "illustration"
  },
  "status": "queued",
  "progress": 0,
  "current_step": null,
  "created_at": "2026-10-16T05:00:00.000Z",
  "updated_at": "2026-10-16T05:00:00.000Z",
  "error": null,
  "result": null
}
```

- Status: `queued`, `running`, `completed`, `failed`, `cancelled`.
- `progress`: number in `[0, 100]`.
- `current_step`: `identify`, `research`, `script`, `review`, `render`, or `null` while queued.
- `error`: readable string for failed work, otherwise `null`.
- `result`: `null` until completion. A real result has `is_demo: false`.
- Cancellation and completion races should be resolved by the backend; terminal transitions must be durable. Retrying a terminal job does not mutate the original; return a new queued job with the same config.
- Submit returns quickly; long work belongs in the worker. Frontend polling runs approximately every 1.2 seconds while a selected job is active, with 3-second reconnect attempts on transient request failures. A request times out after 15 seconds. Polls are aborted when changing the selected id or unmounting the provider.

## Result

```json
{
  "is_demo": true,
  "summary": "Demo outline only. No verified chemistry content or generated media.",
  "script_sections": [
    { "title": "Opening", "body": "Introduce the selected compound." }
  ],
  "sources": [],
  "artifacts": []
}
```

Real sources have `{ "title": "Source title", "url": "https://..." }`.

Real artifacts have `{ "kind": "video", "url": "https://...", "filename": "water.mp4" }`; kind is `video`, `slides`, or `script`. Artifacts must be real, retrievable outputs. No placeholder media URL should be reported as a completed artifact.

The current preview consumes script sections as text, source links, a video artifact, and download links. Later backend content schemas may be richer; keep detailed chemical facts and citations in dedicated typed structures rather than forcing them into this initial UI result shape.

## JobsPage

```json
{
  "items": [],
  "total": 0,
  "limit": 10,
  "offset": 0
}
```

## Deliberately deferred

- Compound disambiguation/confirmation after PubChem resolution. The current input is explicitly unverified; text entry is not chemical identity confirmation. Add an explicit resolve/confirm UI step before enabling the real content pipeline.
- Authentication, user ownership and API authorization.
- Verified chemical source retrieval, content review and safety validation.
- LLM/TTS/renderer integrations, durable jobs, actual artifact downloads.
- A richer script schema, reusable voice ids and additional output formats if required.
- A separate settings/preferences API.
- WebSocket/SSE progress if polling becomes insufficient.
- Localization as an optional extension.

## Browser mock limitation

MSW intercepts frontend browser requests and the Node test process. It does not expose a backend for Postman/curl. To test actual HTTP endpoints later, implement these routes in FastAPI and run the frontend in real mode.

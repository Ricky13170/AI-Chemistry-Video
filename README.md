# AI Chemistry Video

Create short videos introducing a chemical substance based on an English name or formula provided by the user. The system accurately identifies the substance, gathers information from credible sources, writes a script, and produces an illustrative video. Users can choose to read or listen to the script and access the accompanying reference materials.

## How it works

1. The user enters a chemical name or formula.
2. The system searches for matching substances, which the user then confirms.
3. The user selects the language, duration, and voiceover style (if desired).
4. The backend creates a job and delegates the processing to a worker.
5. The worker gathers data from cited sources, drafts a script, and verifies the content.
6. The script is broken down into scenes, with the addition of illustrations, voiceover, and subtitles.
7. The video is reviewed, saved, and displayed alongside the script and source references.

Users can monitor progress via the interface while a job runs in the background. If a substance cannot be identified or data is missing, the system should request additional information rather than drawing its own conclusions.

The mode for entering two substances to look up and interpret reactions is an extended feature planned for after the MVP. Results must be linked to their sources and reaction conditions; there may be multiple possibilities, or there may be insufficient information to reach a definitive conclusion.

## Architecture

The frontend sends requests and retrieves results via an API. The API manages jobs, stores metadata, and places tasks into a queue. A worker picks up a job and executes a workflow to generate a video. Both the API and the worker share the same Python codebase but run as separate processes.

| Component | Responsibility |
|---|---|
| `frontend/` | Input substances, confirm selections, track progress, and view results. Interact exclusively via the API. |
| `backend/app/api/` | Receive a request, validate the input data, and return a response. |
| `backend/app/services/` | Business logic: job creation, status retrieval, and management of job quality and results. |
| `backend/app/worker.py` | Retrieve a job from the queue and invoke a workflow. |
| `backend/app/workflow.py` | Coordinate the processing steps and the branches for reviewing and editing content. |
| `backend/app/integrations/` | Connect data sources, models, text-to-speech services, storage, and video-creation tools. |

The database stores job status, content, and metadata. Video, image, and audio files are kept in file storage, with the database maintaining references to these files. Both the API and the worker access the database through shared code within the backend.

### Why this shape

Video creation involves multiple steps, such as waiting for a model, processing audio, and rendering. A queue allows these tasks to be moved outside the HTTP request lifecycle, enabling the API to remain responsive to the user interface while a worker handles the processing.

The code is maintained within a backend to facilitate development and allow for the shared use of configurations, schemas, and database models. External connections are housed in `integrations/`, enabling providers to be swapped with minimal impact on business logic.

## Repository layout

```text
backend/
  app/
    main.py            Initialize the API application.
    config.py          Environment configuration
    api/               REST endpoints
    services/          Business logic
    integrations/      External service and tool connections
      pubchem.py       Chemical data sources
      llm.py           Model for generating content
      tts.py           Text-to-speech service
      storage.py       Store and retrieve artifacts
      renderer.py      Render illustrations and assemble video
    workflow.py        Processing steps and branches
    worker.py          Configuration and background job handling
    db.py              Database engine and session
    models.py          Database models
    schemas.py         Request, response and structured data
  migrations/          Database migrations
  tests/               Backend tests
  pyproject.toml       Dependencies and tool configuration
  .env.example         Environment configuration example
frontend/
  src/
    app/               Routing, providers, application shell
    components/        Shared UI components
    features/          Feature modules
    lib/               API client and utilities
    styles/            Global styling
plans/                 Design, workflow and implementation notes
evals/                 Data and criteria for evaluating AI content
compose.yaml           Services for local development
README.md
```

This is the target structure for a simple scaffold. Directories should only be separated when a module becomes large enough or when multiple implementation approaches need to be managed independently.

## Getting started

Work within the directory of the component you are developing. The backend commands below use the `backend/app/` layout; the package configuration in `pyproject.toml` must match this layout.

**Local infrastructure** — from the root directory:

```sh
docker compose up -d
```

**Backend** — requires Python 3.11 or later and uv:

```sh
cd backend
cp .env.example .env
uv sync --extra dev
uv run uvicorn app.main:app --reload
```

PowerShell can use `Copy-Item .env.example .env` to create a configuration file.
When the API is connected according to this layout, access `/health` to check the process
and `/docs` to view the available API. Basic health check does not confirm that external services are ready.

The worker and frontend are run separately when their corresponding entry points have been deployed.
Detailed instructions will be updated along with that code.

## Conventions

- Environment configuration and API keys are stored in `.env`; commit only `.env.example`
  with sample values.
- Generated video, audio, and artifact files are kept outside the source code,
  in the location configured for each environment.
- Factual claims in the script must be traceable to their sources.
  Separate illustrations from the data used to verify chemical formulas and structures.
- Save intermediate progress and results to support retries while limiting
  redundant, costly operations.
- Keep code organized according to the structure above. Document design decisions and
  important changes in `plans/`.

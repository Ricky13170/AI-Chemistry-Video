"""Pydantic request/response schemas."""
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    NEEDS_INPUT = "needs_input"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ChemicalCandidate(BaseModel):
    cid: int = Field(gt=0)
    name: str
    formula: str
    smiles: str | None = None


class Source(BaseModel):
    id: str
    title: str
    url: HttpUrl
    retrieved_at: str


class Claim(BaseModel):
    id: str
    text: str
    source_ids: list[str] = Field(min_length=1)


class Scene(BaseModel):
    id: str
    narration: str
    on_screen_text: str
    claim_ids: list[str] = Field(default_factory=list)
    visual_description: str


class VideoRequest(BaseModel):
    chemical_cid: int = Field(gt=0, description="Confirmed compound after entity resolution")
    language: str = "en"
    voice_id: str | None = None
    narration_enabled: bool = True
    target_duration_seconds: int = Field(default=60, ge=15, le=180)


class JobView(BaseModel):
    id: UUID
    status: JobStatus
    stage: str | None = None
    artifact_keys: list[str] = Field(default_factory=list)
    error_code: str | None = None

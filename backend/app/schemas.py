from pygments.token import Name
from enum import Enum
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, HttpUrl

class ChemicalSearchType(str, Enum):
    NAME = "name"
    CID = "cid"
    FORMULA = "formula"

class ChemicalSearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: str = Field(min_length = 1, max_length = 200)
    search_type: ChemicalSearchType = ChemicalSearchType.NAME

    @field_validator("query")
    @classmethod
    def validator_query(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Search query cannot be empty")
        return value

class ChemicalCandidate(BaseModel):
    model_config = ConfigDict(extra = "forbid")

    cid: int = Field(gt=0)
    name: str = Field(min_length=1)
    molecular_formula: str | None = None

class ChemicalResponse(BaseModel):
    model_config = ConfigDict(extra = "forbid")

    cid: int = Field(gt=0)
    name: str = Field(min_length=1)
    iupac_name: str | None = None
    molecular_formula: str | None = None
    molecular_weight: float | None = Field(default=None, gt=0)
    smiles: str | None = None
    source: Literal["pubchem"] = "pubchem"

class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    NEEDS_INPUT = "needs_input"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
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

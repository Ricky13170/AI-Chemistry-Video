from pygments.token import Name
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

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

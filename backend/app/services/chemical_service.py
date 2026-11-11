from pydantic import ValidationError    
from app.integrations.pubchem import PubChemClient
from app.schemas import (ChemicalCandidate, ChemicalResponse, ChemicalSearchRequest)

import logging

logger = logging.getLogger(__name__)

class ChemicalDataError(Exception):
    """Raised when provider data cannot be normalized."""

class ChemicalService:
    def __init__(self, pubchem_client: PubChemClient | None = None):
        self.pubchem_client = pubchem_client or PubChemClient()

    
    def search_chemicals(self, request: ChemicalSearchRequest) -> list[ChemicalCandidate]:
        """Search and normalize valid chemical candidates."""      
        raw_results = self.pubchem_client.search_candidates(
            query=request.query, search_type=request.search_type)

        candidates = []
        invalid_count = 0

        for raw in raw_results:
            try:
                candidate = self._to_candidate(raw)
                candidates.append(candidate)
            except ChemicalDataError as exc:
                invalid_count += 1

                logger.warning(
                    "Skipping invalid chemical candidate: CID=%s, error=%s",
                    raw.get("CID") if isinstance(raw, dict) else None, exc)

        if raw_results and not candidates:
            raise ChemicalDataError("All PubChem candidates failed normalization")

        if invalid_count:
            logger.info("Chemical search completed: valid=%d, invalid=%d", len(candidates), invalid_count)

        return candidates

    
    def get_chemical(self, cid: int) -> ChemicalResponse | None:
        """Retrieve and normalize a chemical by CID."""
        raw = self.pubchem_client.get_compound_data(cid)

        if raw is None:
            return None

        return self._to_response(raw)

    @staticmethod
    def _get_name(raw: dict) -> str:
        """Extract a valid chemical name from PubChem data"""
        for field in ("Title", "IUPACName"):
            value = raw.get(field)

            if isinstance(value, str) and value.strip():
                return value.strip()
            
        raise ChemicalDataError("PubChem response the chemical is invalid")
    
    @classmethod
    def _to_candidate(cls, raw: dict) -> ChemicalCandidate:
        """Map PubChem into ChemicalCandidate"""
        try:
            return ChemicalCandidate(
                cid = raw['CID'],
                name = cls._get_name(raw),
                molecular_formula = raw.get("MolecularFormula")
            )
        except(KeyError, ValidationError) as exc:
            raise ChemicalDataError("Invalid PubChem candidate data") from exc
        
    @classmethod
    def _to_response(cls, raw: dict) -> ChemicalResponse:
        """ Map a PubChem dictionary into ChemicalResonse"""

        try:
            return ChemicalResponse(
                cid=raw["CID"],
                name=cls._get_name(raw),
                iupac_name=raw.get("IUPACName"),
                molecular_formula=raw.get("MolecularFormula"),
                molecular_weight=raw.get("MolecularWeight"),
                smiles=raw.get("SMILES"),
                source="pubchem",
            )
        
        except (KeyError, ValidationError) as exc:
            raise ChemicalDataError(
                "Invalid PubChem compound data"
            ) from exc

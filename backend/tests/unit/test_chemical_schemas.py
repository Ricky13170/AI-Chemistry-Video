import pytest
from pydantic import ValidationError
from app.schemas import (ChemicalSearchRequest, ChemicalResponse)

def test_search_request_normalize_query():
    request = ChemicalSearchRequest(
        query = "  Ethanol   ",
        search_type = "name"
    )

    assert request.query == "Ethanol"

def test_search_request_reject_empty_request():
    with pytest.raises(ValidationError):
        ChemicalSearchRequest(query = "  ")

def test_chemical_response_valid():
    chemical = ChemicalResponse(
        cid=702,
        name="Ethanol",
        molecular_formula="C2H6O",
        molecular_weight=46.07,
        smiles="CCO",
    )

    assert chemical.cid == 702
    assert chemical.source == "pubchem"


def test_chemical_response_rejects_invalid_cid():
    with pytest.raises(ValidationError):
        ChemicalResponse(
            cid=-1,
            name="Ethanol",
        )


def test_chemical_response_allows_missing_properties():
    chemical = ChemicalResponse(
        cid=702,
        name="Ethanol",
    )

    assert chemical.molecular_weight is None
    assert chemical.smiles is None

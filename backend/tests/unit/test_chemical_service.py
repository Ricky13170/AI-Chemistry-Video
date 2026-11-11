from unittest.mock import Mock
import pytest
from app.integrations.pubchem import ChemistryProviderError
from app.schemas import (ChemicalCandidate, ChemicalResponse, ChemicalSearchRequest)
from app.services.chemical_service import (ChemicalDataError, ChemicalService)

@pytest.fixture
def fake_client():
    return Mock()


@pytest.fixture
def service(fake_client):
    return ChemicalService(pubchem_client=fake_client)

def test_search_chemicals(service, fake_client):
    fake_client.search_candidates.return_value = [
        {
            "CID": 702,
            "IUPACName": "ethanol",
            "MolecularFormula": "C2H6O",
        },
        {
            "CID": 8254,
            "IUPACName": "methoxymethane",
            "MolecularFormula": "C2H6O",
        },
    ]

    request = ChemicalSearchRequest(
        query="C2H6O",
        search_type="formula",
    )

    results = service.search_chemicals(request)

    assert len(results) == 2
    assert all(
        isinstance(item, ChemicalCandidate)
        for item in results
    )
    assert results[0].cid == 702
    assert results[1].cid == 8254

    fake_client.search_candidates.assert_called_once_with(
        query="C2H6O",
        search_type=request.search_type,
    )

def test_search_chemical_empty(service, fake_client):
    fake_client.search_candidates.return_value = []

    request = ChemicalSearchRequest(query="UnknownChemical")

    results = service.search_chemicals(request)

    assert results == []

def test_get_chemical(service, fake_client):
    fake_client.get_compound_data.return_value = {
        "CID": 702,
        "IUPACName": "ethanol",
        "MolecularFormula": "C2H6O",
        "MolecularWeight": "46.07",
        "SMILES": "CCO",
    }

    chemical = service.get_chemical(702)

    assert isinstance(chemical, ChemicalResponse)
    assert chemical.cid == 702
    assert chemical.name == "ethanol"
    assert chemical.molecular_weight == 46.07
    assert chemical.smiles == "CCO"
    assert chemical.source == "pubchem"

    fake_client.get_compound_data.assert_called_once_with(702)


def test_get_chemical_not_found(service, fake_client):
    fake_client.get_compound_data.return_value = None

    result = service.get_chemical(999999999)

    assert result is None


def test_missing_cid_raises_data_error(service, fake_client):
    fake_client.get_compound_data.return_value = {
        "IUPACName": "ethanol",
    }

    with pytest.raises(ChemicalDataError):
        service.get_chemical(702)


def test_missing_name_raises_data_error(service, fake_client):
    fake_client.get_compound_data.return_value = {
        "CID": 702,
        "MolecularFormula": "C2H6O",
    }

    with pytest.raises(ChemicalDataError):
        service.get_chemical(702)


def test_provider_error_propagates(service, fake_client):
    fake_client.get_compound_data.side_effect = (
        ChemistryProviderError("PubChem unavailable")
    )

    with pytest.raises(ChemistryProviderError):
        service.get_chemical(702)


def test_search_skips_candidates_without_name(service, fake_client):
    fake_client.search_candidates.return_value = [
        {
            "CID": 947,
            "IUPACName": "molecular nitrogen",
            "MolecularFormula": "N2",
        },
        {
            "CID": 12195976,
            "MolecularFormula": "N2",
        },
        {
            "CID": 71309542,
            "MolecularFormula": "N2",
        },
    ]

    request = ChemicalSearchRequest(query="N2", search_type="formula")
    results = service.search_chemicals(request)

    assert len(results) == 1
    assert results[0].cid == 947
    assert results[0].name == "molecular nitrogen"


def test_search_all_candidates_invalid(service, fake_client):
    fake_client.search_candidates.return_value = [
        {
            "CID": 12195976,
            "MolecularFormula": "N2",
        }
    ]

    request = ChemicalSearchRequest(query="N2", search_type="formula")

    with pytest.raises(ChemicalDataError):
        service.search_chemicals(request)


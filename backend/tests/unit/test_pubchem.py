import pytest
import pubchempy as pcp

from app.integrations.pubchem import (PubChemClient, ChemistryProviderError,)
from app.schemas import ChemicalSearchType

@pytest.fixture
def client():
    return PubChemClient(max_candidate=5)

def test_search_candidates_by_name(monkeypatch, client):
    def fake_get_cids(query, namespace, **kwargs):
        assert query == "Ethanol"
        assert namespace == "name"
        return [702]

    def fake_get_properties(properties, identifier, namespace):
        assert identifier == [702]
        assert namespace == "cid"

        return [{
            "CID": 702,
            "IUPACName": "ethanol",
            "MolecularFormula": "C2H6O",
        }]

    monkeypatch.setattr(pcp, "get_cids", fake_get_cids)
    monkeypatch.setattr(pcp, "get_properties", fake_get_properties)

    result = client.search_candidates(
        "Ethanol",
        ChemicalSearchType.NAME,
    )

    assert len(result) == 1
    assert result[0]["CID"] == 702


def test_search_candidates_by_formula(monkeypatch, client):
    def fake_get_cids(query, namespace, **kwargs):
        assert query == "C2H6O"
        assert namespace == "formula"
        assert kwargs["listkey_count"] == 5
        return [702, 8254]

    def fake_get_properties(properties, identifier, namespace):
        return [
            {"CID": 702, "IUPACName": "ethanol"},
            {"CID": 8254, "IUPACName": "methoxymethane"},
        ]

    monkeypatch.setattr(pcp, "get_cids", fake_get_cids)
    monkeypatch.setattr(pcp, "get_properties", fake_get_properties)

    result = client.search_candidates(
        "C2H6O",
        ChemicalSearchType.FORMULA,
    )

    assert len(result) == 2

def test_get_compound_data(monkeypatch, client):
    def fake_get_properties(properties, identifier, namespace):
        assert identifier == 702

        return [{
            "CID": 702,
            "IUPACName": "ethanol",
            "MolecularFormula": "C2H6O",
            "MolecularWeight": "46.07",
            "SMILES": "CCO",
        }]

    monkeypatch.setattr(pcp, "get_properties", fake_get_properties)

    result = client.get_compound_data(702)

    assert result["CID"] == 702
    assert result["SMILES"] == "CCO"


def test_search_candidates_not_found(monkeypatch, client):
    monkeypatch.setattr(
        pcp,
        "get_cids",
        lambda *args, **kwargs: [],
    )

    result = client.search_candidates("UnknownChemical")

    assert result == []


def test_get_compound_data_not_found(monkeypatch, client):
    monkeypatch.setattr(
        pcp,
        "get_properties",
        lambda *args, **kwargs: [],
    )

    assert client.get_compound_data(999999999) is None


def test_pubchem_provider_error(monkeypatch, client):
    def fake_get_cids(*args, **kwargs):
        raise pcp.PubChemPyError("Provider unavailable")

    monkeypatch.setattr(pcp, "get_cids", fake_get_cids)

    with pytest.raises(ChemistryProviderError):
        client.search_candidates("Ethanol")
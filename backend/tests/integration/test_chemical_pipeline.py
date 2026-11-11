import pytest
import pubchempy as pcp

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.chemicals import (router, get_chemical_service)
from app.integrations.pubchem import PubChemClient
from app.services.chemical_service import ChemicalService

@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router, prefix="/api")

    app.dependency_overrides[get_chemical_service] = (
        lambda: ChemicalService(
            pubchem_client=PubChemClient()
        )
    )

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

def test_search_pipeline_by_name(client, monkeypatch):
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
            "MolecularWeight": "46.07",
            "SMILES": "CCO",
        }]

    monkeypatch.setattr(pcp, "get_cids", fake_get_cids)
    monkeypatch.setattr(pcp, "get_properties", fake_get_properties)

    response = client.post(
        "/api/chemicals/search",
        json={
            "query": "  Ethanol  ",
            "search_type": "name",
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0] == {
        "cid": 702,
        "name": "ethanol",
        "molecular_formula": "C2H6O",
    }

def test_detail_pipeline_by_cid(client, monkeypatch):
    def fake_get_properties(properties, identifier, namespace):
        assert identifier == 702
        assert namespace == "cid"

        return [{
            "CID": 702,
            "IUPACName": "ethanol",
            "MolecularFormula": "C2H6O",
            "MolecularWeight": "46.07",
            "SMILES": "CCO",
        }]

    monkeypatch.setattr(pcp, "get_properties", fake_get_properties)
    response = client.get("/api/chemicals/702")

    assert response.status_code == 200

    data = response.json()

    assert data == {
        "cid": 702,
        "name": "ethanol",
        "iupac_name": "ethanol",
        "molecular_formula": "C2H6O",
        "molecular_weight": 46.07,
        "smiles": "CCO",
        "source": "pubchem",
    }

# SAD PATH
def test_invalid_cid(client, monkeypatch):
    def fail_if_called(*args, **kwargs):
        pytest.fail("PubChem must not be called")

    monkeypatch.setattr(pcp, "get_properties", fail_if_called)
    response = client.get("/api/chemicals/-1")
    assert response.status_code == 422

def test_compound_not_found(client, monkeypatch):
    monkeypatch.setattr(pcp, "get_properties", lambda *args, **kwargs: [])

    response = client.get("/api/chemicals/999999999")

    assert response.status_code == 404


def test_invalid_provider_data(client, monkeypatch):
    def fake_get_properties(*args, **kwargs):
        return [{
            "CID": 702,
            "IUPACName": "ethanol",
            "MolecularWeight": "-10",
        }]

    monkeypatch.setattr(pcp, "get_properties", fake_get_properties)
    response = client.get("/api/chemicals/702")

    assert response.status_code == 502
    assert response.json()["detail"] == (
        "Invalid chemical data received from provider"
    )


def test_search_no_results(client, monkeypatch):
    monkeypatch.setattr(pcp, "get_cids", lambda *args, **kwargs: [])

    response = client.post(
        "/api/chemicals/search",
        json={
            "query": "UnknownChemical",
            "search_type": "name",
        },
    )

    assert response.status_code == 200
    assert response.json() == []

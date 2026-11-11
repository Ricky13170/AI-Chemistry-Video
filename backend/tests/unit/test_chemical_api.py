from unittest.mock import Mock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.chemicals import (router, get_chemical_service)
from app.integrations.pubchem import ChemistryProviderError
from app.schemas import ChemicalCandidate, ChemicalResponse
from app.services.chemical_service import (ChemicalDataError, ChemicalService)

@pytest.fixture
def fake_service():
    return Mock(spec=ChemicalService)


@pytest.fixture
def client(fake_service):
    app = FastAPI()
    app.include_router(router, prefix="/api")

    app.dependency_overrides[get_chemical_service] = (
        lambda: fake_service
    )

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

def test_search_chemicals_success(client, fake_service):
    fake_service.search_chemicals.return_value = [
        ChemicalCandidate(
            cid=702,
            name="ethanol",
            molecular_formula="C2H6O",
        )
    ]

    response = client.post(
        "/api/chemicals/search",
        json={
            "query": "Ethanol",
            "search_type": "name",
        },
    )

    assert response.status_code == 200
    assert response.json()[0]["cid"] == 702
    assert response.json()[0]["name"] == "ethanol"
    fake_service.search_chemicals.assert_called_once()

def test_search_chemicals_empty(client, fake_service):
    fake_service.search_chemicals.return_value = []

    response = client.post(
        "/api/chemicals/search",
        json={"query": "UnknownChemical"},
    )

    assert response.status_code == 200
    assert response.json() == []


def test_search_invalid_request(client, fake_service):
    response = client.post(
        "/api/chemicals/search",
        json={
            "query": "   ",
            "search_type": "name",
        },
    )

    assert response.status_code == 422
    fake_service.search_chemicals.assert_not_called()


def test_get_chemical_success(client, fake_service):
    fake_service.get_chemical.return_value = ChemicalResponse(
        cid=702,
        name="ethanol",
        molecular_formula="C2H6O",
        molecular_weight=46.07,
        smiles="CCO",
    )

    response = client.get("/api/chemicals/702")

    assert response.status_code == 200
    assert response.json()["cid"] == 702
    assert response.json()["source"] == "pubchem"
    fake_service.get_chemical.assert_called_once_with(702)


def test_get_chemical_not_found(client, fake_service):
    fake_service.get_chemical.return_value = None

    response = client.get("/api/chemicals/999999")

    assert response.status_code == 404


def test_get_chemical_invalid_cid(client, fake_service):
    response = client.get("/api/chemicals/abc")

    assert response.status_code == 422
    fake_service.get_chemical.assert_not_called()


def test_get_chemical_provider_error(client, fake_service):
    fake_service.get_chemical.side_effect = ChemistryProviderError(
        "PubChem unavailable"
    )

    response = client.get("/api/chemicals/702")

    assert response.status_code == 503


def test_get_chemical_data_error(client, fake_service):
    fake_service.get_chemical.side_effect = ChemicalDataError(
        "Invalid provider data"
    )

    response = client.get("/api/chemicals/702")

    assert response.status_code == 502

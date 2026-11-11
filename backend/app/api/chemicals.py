from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Path
from app.integrations.pubchem import ChemistryProviderError
from app.schemas import (ChemicalCandidate, ChemicalResponse, ChemicalSearchRequest)
from app.services.chemical_service import (ChemicalDataError, ChemicalService)

router = APIRouter(prefix="/chemicals", tags=["chemicals"])
def get_chemical_service() -> ChemicalService:
    return ChemicalService()

ChemicalServiceDep = Annotated[
    ChemicalService,
    Depends(get_chemical_service),
]

@router.post("/search", response_model=list[ChemicalCandidate], status_code=status.HTTP_200_OK)

def search_chemicals(
    request: ChemicalSearchRequest,
    service: ChemicalServiceDep):

    try:
        return service.search_chemicals(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except ChemistryProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chemical data provider is unavailable",
        ) from exc

    except ChemicalDataError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid chemical data received from provider",
        ) from exc

@router.get("/{cid}", response_model=ChemicalResponse)

def get_chemical(cid: Annotated[int, Path(gt=0)], service: ChemicalServiceDep):
    try:
        chemical = service.get_chemical(cid)

        if chemical is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chemical with CID {cid} not found",
            )

        return chemical

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    except ChemistryProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chemical data provider is unavailable",
        ) from exc

    except ChemicalDataError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Invalid chemical data received from provider",
        ) from exc


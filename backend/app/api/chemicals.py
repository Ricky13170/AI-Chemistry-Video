from fastapi import APIRouter, Query
from app.schemas import ChemicalCandidate
from app.services.chemical_service import ChemicalService

router = APIRouter(prefix="/api/v1/chemicals", tags=["chemicals"])
chemical_service = ChemicalService()


@router.get("/resolve", response_model=list[ChemicalCandidate])
def resolve_chemicals(q: str = Query(..., description="Tên hoặc công thức chất hóa học")) -> list[ChemicalCandidate]:
    """Tìm kiếm các chất hóa học ứng viên từ PubChem để người dùng xác nhận."""
    return chemical_service.resolve_candidates(q)

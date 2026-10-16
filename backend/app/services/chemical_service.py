"""Logic nghiệp vụ xử lý và chuẩn hóa thông tin chất hóa học."""
from app.integrations.pubchem import PubChemClient
from app.schemas import ChemicalCandidate


class ChemicalService:
    def __init__(self, pubchem_client: PubChemClient | None = None):
        self.pubchem = pubchem_client or PubChemClient()

    def resolve_candidates(self, query: str) -> list[ChemicalCandidate]:
        """Tìm kiếm và chuẩn hóa danh sách các chất hóa học ứng viên để người dùng xác nhận."""
        return self.pubchem.search_candidates(query)

    def get_details(self, cid: int) -> dict:
        """Lấy thông tin thuộc tính và nguồn dẫn chứng của chất theo PubChem CID."""
        return self.pubchem.get_compound_data(cid)

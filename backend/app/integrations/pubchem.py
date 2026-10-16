from app.schemas import ChemicalCandidate


class PubChemClient:
    def __init__(self, base_url: str = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"):
        self.base_url = base_url

    def search_candidates(self, query: str) -> list[ChemicalCandidate]:
        # TODO:
        return []

    def get_compound_data(self, cid: int) -> dict:
        # TODO: 
        return {}

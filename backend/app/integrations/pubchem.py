import logging
import pubchempy as pcp 
from app.schemas import ChemicalSearchType

logger = logging.getLogger(__name__)

class ChemistryProviderError(Exception):
    """Raise when PubChem retrieval failed"""

class PubChemClient:
    PROPERTIES = ["IUPACName", "MolecularFormula", "MolecularWeight", "SMILES"]

    def __init__(self, max_candidate: int = 10):
        if max_candidate <1:
            raise ValueError("Max candidate must be a positive number")
        self.max_candidate = max_candidate
    
    def search_candidate(self, query: str, 
            search_type: ChemicalSearchType = ChemicalSearchType.NAME,) -> list[dict]:
        """Search compounds and return candidate properties"""

        query = query.strip()
        search_type = ChemicalSearchType(search_type)

        if not query:
            raise ValueError("Search query cannot be empty")

        try:
            if search_type == ChemicalSearchType.CID:
                cid = int(query)
                if cid <= 0:
                    raise ValueError("The cid must be positive number")
                cid = [cid]

            else: 
                kwargs = {}

                if search_type == ChemicalSearchType.FORMULA:
                    kwargs["listkey_count"] = self.max_candidate

                cids = pcp.get_cids(query, namespace=search_type.value, **kwargs)

                cids = list(dict.fromkeys(cids or []))
                cids = cids[:self.max_candidate]

                if not cids:
                    return []

                result = pcp.get_properties(self.PROPERTIES, cids, namespace="cid")

                return result or []

        except(pcp.PubChemPyError, OSError) as exc:
            logger.exception("PubChem search failed")
            raise ChemistryProviderError("Failed to search compound from PubChem") from exc

    def get_compound_data(self, cid: int) -> dict | None:
        """Retrieval chemical properties for one PubChem CID"""
        if cid <= 0:
            raise ValueError("CID must be positive")
        try:
            result = pcp.get_properties(
                self.PROPERTIES,
                cid,
                namespace="cid",
            )

            if not result:
                return None

            return result[0]

        except (pcp.PubChemPyError, OSError) as exc:
            logger.exception("PubChem retrieval failed: CID=%s", cid)
            raise ChemistryProviderError(
                f"Failed to retrieve compound CID={cid}"
            ) from exc

import sys
import urllib.parse
from pathlib import Path

# Đảm bảo import được package `app` dù chạy file từ bất kỳ thư mục nào
_backend_dir = str(Path(__file__).resolve().parents[2])
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

import httpx  # noqa: E402
from app.schemas import ChemicalCandidate  # noqa: E402


class PubChemClient:
    """Client giao tiếp với PubChem PUG REST API.
    
    Tài liệu tham khảo:
    - PUG REST Specification: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
    - PUG REST Tutorial: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial
    """

    def __init__(
        self,
        base_url: str = "https://pubchem.ncbi.nlm.nih.gov/rest/pug",
        timeout: float = 10.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.headers = {
            "User-Agent": "ChemisAI/1.0 (Educational Chemistry Video Project)"
        }

    def search_candidates(self, query: str) -> list[ChemicalCandidate]:
        """Tìm kiếm các hợp chất hóa học theo tên hoặc công thức từ PubChem.

        Sử dụng PUG REST Property Table Endpoint:
        /compound/name/{query}/property/{proptags}/JSON
        """
        clean_query = query.strip()
        if not clean_query:
            return []

        encoded_query = urllib.parse.quote(clean_query)
        proptags = "Title,IUPACName,MolecularFormula,ConnectivitySMILES,CanonicalSMILES,SMILES"
        url = f"{self.base_url}/compound/name/{encoded_query}/property/{proptags}/JSON"

        try:
            with httpx.Client(timeout=self.timeout, headers=self.headers) as client:
                response = client.get(url)
                if response.status_code == 404:
                    return []
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError:
            return []

        properties = data.get("PropertyTable", {}).get("Properties", [])
        candidates: list[ChemicalCandidate] = []

        for item in properties:
            cid = item.get("CID")
            if not cid:
                continue

            # PubChem có thể trả về SMILES, CanonicalSMILES hoặc ConnectivitySMILES (đặc biệt cho đơn chất như Al)
            smiles = (
                item.get("ConnectivitySMILES")
                or item.get("CanonicalSMILES")
                or item.get("SMILES")
            )
            name = item.get("Title") or item.get("IUPACName") or clean_query
            formula = item.get("MolecularFormula", "")

            candidates.append(
                ChemicalCandidate(
                    cid=cid,
                    name=name,
                    formula=formula,
                    smiles=smiles,
                )
            )

        return candidates

    def get_compound_data(self, cid: int) -> dict:
        """Lấy thông tin thuộc tính chi tiết và mô tả của chất theo PubChem CID.

        Sử dụng PUG REST endpoints:
        - /compound/cid/{cid}/property/{proptags}/JSON
        - /compound/cid/{cid}/description/JSON
        """
        if cid <= 0:
            return {}

        proptags = (
            "Title,IUPACName,MolecularFormula,MolecularWeight,"
            "ConnectivitySMILES,CanonicalSMILES,SMILES,"
            "InChI,InChIKey,ExactMass,Charge"
        )
        url_props = f"{self.base_url}/compound/cid/{cid}/property/{proptags}/JSON"
        url_desc = f"{self.base_url}/compound/cid/{cid}/description/JSON"

        result: dict = {
            "cid": cid,
            "pubchem_url": f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}",
        }

        try:
            with httpx.Client(timeout=self.timeout, headers=self.headers) as client:
                resp_props = client.get(url_props)
                if resp_props.status_code == 200:
                    props_list = resp_props.json().get("PropertyTable", {}).get("Properties", [])
                    if props_list:
                        item = props_list[0]
                        result.update({
                            "title": item.get("Title"),
                            "iupac_name": item.get("IUPACName"),
                            "formula": item.get("MolecularFormula"),
                            "molecular_weight": item.get("MolecularWeight"),
                            "smiles": (
                                item.get("ConnectivitySMILES")
                                or item.get("CanonicalSMILES")
                                or item.get("SMILES")
                            ),
                            "inchi": item.get("InChI"),
                            "inchikey": item.get("InChIKey"),
                            "exact_mass": item.get("ExactMass"),
                            "charge": item.get("Charge"),
                        })

                resp_desc = client.get(url_desc)
                if resp_desc.status_code == 200:
                    desc_info = resp_desc.json().get("InformationList", {}).get("Information", [])
                    descriptions = [
                        info["Description"]
                        for info in desc_info
                        if "Description" in info and isinstance(info["Description"], str)
                    ]
                    result["descriptions"] = descriptions
        except httpx.HTTPError:
            pass

        return result


if __name__ == "__main__":
    import sys

    # Dam bao xuat duoc tieng Viet tren terminal Windows
    if sys.stdout.encoding.lower() != "utf-8":
        sys.stdout.reconfigure(encoding="utf-8")

    client = PubChemClient()

    print("--- 1. Tim kiem chat 'Al' (Nhom) ---")
    candidates = client.search_candidates("AL")
    for c in candidates:
        print(f"CID: {c.cid} | Ten: {c.name} | Cong thuc: {c.formula} | SMILES: {c.smiles}")

    if candidates:
        al_cid = candidates[0].cid
        print(f"\n--- 2. Lay du lieu chi tiet cua CID: {al_cid} ---")
        details = client.get_compound_data(al_cid)
        for key, val in details.items():
            if key == "descriptions":
                print(f"descriptions: {val[:2]}... (Tong cong {len(val)} muc)")
            else:
                print(f"{key}: {val}")

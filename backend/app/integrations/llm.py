class LLMClient:
    def __init__(self, provider: str = "default", model: str | None = None):
        self.provider = provider
        self.model = model

    def generate_script(self, compound_data: dict, target_duration_seconds: int = 60) -> str:
        # TODO:
        return ""

    def verify_claims(self, script: str, source_data: dict) -> dict:
        # TODO:
        return {"passed": True, "revisions": []}

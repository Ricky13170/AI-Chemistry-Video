"""LangGraph: các bước và nhánh xử lý video thế hệ AI hóa học.

Pipeline kiến trúc:
START -> retrieve -> draft_script -> verify_script
  -> [pass] storyboard -> visuals -> narration -> render -> quality_check -> package -> END
  -> [revise] draft_script (bounded number of revisions)
  -> [insufficient evidence] needs_input / fail with an explicit reason
"""
from typing import TypedDict


class VideoState(TypedDict, total=False):
    job_id: str
    chemical_cid: int
    source_keys: list[str]
    claims_key: str
    script_key: str
    storyboard_key: str
    asset_manifest_key: str
    audio_key: str
    final_video_key: str
    revision_count: int


def build_workflow():
    """Khởi tạo và biên dịch LangGraph workflow."""
    # Khi hoàn thiện, graph sẽ được compile cùng Postgres checkpointer
    # và trả về app workflow hoàn chỉnh.
    return None

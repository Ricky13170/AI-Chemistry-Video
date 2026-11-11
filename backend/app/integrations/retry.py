
import random
import time
import pubchempy as pcp

from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")

RETRYABLE_STATUS_CODES = {502, 503, 504}


def call_with_retry(
    operation: Callable[[], T],
    max_attempts: int = 3,
    base_delay: float = 0.5,
) -> T:

    if max_attempts < 1:
        raise ValueError("max_attempts must be positive")

    if base_delay < 0:
        raise ValueError("base_delay cannot be negative")

    for attempt in range(max_attempts):
        try:
            return operation()

        except pcp.PubChemHTTPError as exc:
            if exc.code not in RETRYABLE_STATUS_CODES:
                raise

            if attempt == max_attempts - 1:
                raise

            delay = base_delay * (2 ** attempt)
            delay += random.uniform(0, 0.2)

            time.sleep(delay)

    raise RuntimeError("Unreachable retry state")

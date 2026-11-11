import pytest
import pubchempy as pcp

from unittest.mock import Mock
from app.integrations.retry import call_with_retry


def test_retry_success_on_first_attempt():
    operation = Mock(return_value={"CID": 702})

    result = call_with_retry(operation, max_attempts=3)

    assert result["CID"] == 702
    assert operation.call_count == 1


def test_retry_after_transient_failure(monkeypatch):
    monkeypatch.setattr("app.integrations.retry.time.sleep", lambda seconds: None)

    operation = Mock(
        side_effect=[
            pcp.ServerBusyError(503, "Server busy", []),
            {"CID": 702},
        ]
    )

    result = call_with_retry(operation, max_attempts=3)

    assert result["CID"] == 702
    assert operation.call_count == 2


def test_retry_exhausted(monkeypatch):
    monkeypatch.setattr("app.integrations.retry.time.sleep", lambda seconds: None)

    operation = Mock(
        side_effect=pcp.ServerBusyError(
            503, "Server busy", []
        )
    )

    with pytest.raises(pcp.ServerBusyError):
        call_with_retry(operation, max_attempts=3)

    assert operation.call_count == 3


def test_non_retryable_error():
    operation = Mock(side_effect=ValueError("Invalid input"))

    with pytest.raises(ValueError):
        call_with_retry(operation)

    assert operation.call_count == 1

def test_retry_http_502(monkeypatch):
    monkeypatch.setattr("app.integrations.retry.time.sleep", lambda seconds: None)

    attempts = 0

    def operation():
        nonlocal attempts
        attempts += 1

        if attempts == 1:
            raise pcp.PubChemHTTPError(502, "Bad Gateway",[])

        return {"CID": 702}

    result = call_with_retry(operation,max_attempts=3)

    assert result["CID"] == 702
    assert attempts == 2

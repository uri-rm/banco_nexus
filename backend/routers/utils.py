from datetime import datetime


def serialize_document(doc: dict) -> dict:
    if doc is None:
        return None

    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            continue
        if isinstance(value, datetime):
            serialized[key] = value.isoformat().replace("+00:00", "Z")
        else:
            serialized[key] = value
    return serialized

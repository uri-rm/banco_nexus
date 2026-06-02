import re

def validate_email(email: str) -> bool:
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(pattern, email))

def validate_account_number(account_number: str) -> bool:
    if len(account_number) != 10:
        return False
    if not account_number.startswith("180"):
        return False
    if not account_number.isdigit():
        return False

    base = account_number[:-1]
    check_digit = sum(int(d) for d in base) % 10

    return int(account_number[-1]) == check_digit
# pyrefly: ignore [missing-import]
from slowapi import Limiter
# pyrefly: ignore [missing-import]
from slowapi.util import get_remote_address

# Centralized Limiter instance
limiter = Limiter(key_func=get_remote_address)

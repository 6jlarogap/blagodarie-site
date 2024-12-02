
BACKEND_URL = 'https://api.meetgame.us.to'
BACKEND_TIMEOUT = 300

try:
    from local_settings import *
except ImportError:
    pass

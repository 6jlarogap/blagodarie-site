
BACKEND_URL = 'https://api.blagodarie.org'
BACKEND_TIMEOUT = 300

try:
    from local_settings import *
except ImportError:
    pass

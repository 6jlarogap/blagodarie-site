
BACKEND_URL = 'https://api.doverabot.ru'
BACKEND_TIMEOUT = 300

try:
    from local_settings import *
except ImportError:
    pass

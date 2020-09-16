import urllib.request, urllib.error
from urllib.parse import parse_qs
import json, re

from _plotly_utils.basevalidators import ColorValidator

import settings

def request_json(path, backend=None, method='GET', token=None, data=None):
    """
    Выполнить запрос на сервер. Возвращает код (типа "OK 200")  и данные

    path:       (!) относительный url запроса
    data        при методах, отличных от GET, dict
    token       для авторизации: 'Authorization: Token %s' % token
    method      отработаны методы GET и POST
    """
    error_result = None, None
    online_url = backend if backend else settings.BACKEND_URL
    while online_url.endswith('/'):
        online_url = online_url[:-1]
    while path.startswith('/'):
        path = path[1:]
    req = urllib.request.Request("%s/%s" % (online_url, path, ))
    if method.upper() == 'GET':
        jsondata = None
    else:
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        jsondata = json.dumps(data).encode('utf-8')
        req.add_header('Content-Length', len(jsondata))
    req.get_method = lambda: method
    if token:
        req.add_header('Authorization', 'Token %s' % token)
    try:
        response = urllib.request.urlopen(req, jsondata, timeout=settings.BACKEND_TIMEOUT)
    except urllib.error.URLError:
        return error_result
    raw_data = response.read().decode('utf-8')
    try:
        return response.getcode(), json.loads(raw_data)
    except ValueError:
        return error_result
    return error_result

def got_parm(search, parm, regex=r'.+', regex_flags=re.I):
    """
    Получить GET параметр из строки search, например '?a=1&b=2'

    search - строка search
    parm - параметр (в примере 'a' или 'b')
    regex - регулярное выражение, которому должен соответствовать parm
    regex_flags - возможные флаги реулярного выражения
    """
    result = None
    if search:
        parsed = parse_qs(search.lstrip('?'))
        if parm in parsed:
            for v in parsed[parm]:
                if re.search(regex, v, flags=regex_flags):
                    result = v
                    break
    return result

def make_get_str(search, value):
    """
    Получить строку get запроса для backend
    """
    result = ''
    incognitopublickey = got_parm(search, 'incognitopublickey', r'^[0-9a-f\-]+$')
    if incognitopublickey:
        incognitopublickey = 'public_key=' + incognitopublickey
    selected_ids_str = ''
    if value:
        selected_ids_str = ','.join(value)
        selected_ids_str = 'selected_ids_str=(' + selected_ids_str + ')'
    get_strs = [s for s in (incognitopublickey, selected_ids_str) if s]
    if get_strs:
        result = '&'.join(get_strs)
        result = '?' + result
    return result

def named_colors():
    return sorted(ColorValidator.named_colors)

def cmp_symptoms_count_name(x, y):
    """
    Сравнить симптомы по возрастанию их count и убыванию их name
    """
    if x['count'] > y['count']:
        return 1
    elif x['count'] < y['count']:
        return -1
    else:
        if x['name'] >= y['name']:
            return -1
        else:
            return 1
    return 0

moon_phases = (

    # new moon (black circle)

    '\u25CF', '\u25CF', '\u25CF', '\u25CF', '\u25CF', '\u25CF', '\u25CF',

    # 1-st quarter (circle with left half black)

    '\u25D0', '\u25D0', '\u25D0', '\u25D0', '\u25D0', '\u25D0', '\u25D0', '\u25D0',

    # full moon (white circle)

    '\u25CB', '\u25CB', '\u25CB', '\u25CB', '\u25CB', '\u25CB', '\u25CB',

    # 3-rd quarter (circle with right half black)

    '\u25D1', '\u25D1', '\u25D1', '\u25D1', '\u25D1', '\u25D1', '\u25D1', '\u25D1',
)

//
//  funcs.js
//
// Функции и проч., применяемые на разных страницах сайта

function get_api_url() {

    // Можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    if (typeof API_URL === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return API_URL;
    }
}

function get_root_domain() {

    // Домен для куки.
    // Можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    if (typeof ROOT_DOMAIN === 'undefined') {
        return 'blagoroda.org';
    } else {
        return ROOT_DOMAIN;
    }
}

function get_parm(parm) {

    // Получить get parameter
    // Если не было в строке parm=, возвращаем null
    // если было, то или '', или то что было.

    var result = null;
    const got_parm = document.URL.match(new RegExp("[\\?\\&]" + parm + "\\=([A-Za-z_0-9\\-\\,\\%\\+]+)?", "i"));
    if (got_parm) {
        result = got_parm[1] || '';
        if (result.match(/^\&/)) {
            result = '';
        }
    }    return result;
}


function getCookie(name) {

    // Полагаю, что в куке всегда объект, его и возвращаю, если
    // в строке куки имеется преобразуемый из json объект, или
    // undefined, если кука не найдена или не преобразуется в объект

    var result = undefined;
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    if (matches) {
        var value = decodeURIComponent(matches[1]);
        if (value.match(new RegExp(`^[\"\'\`].+[\"\'\`]$`))) {
            // строка в кавычках типа:
            // "{\"provider\": \"telegram\"\054 \"user_uuid\": \"...\"\054 \"auth_token\": \"...\"}"
            value = eval (value);
        }
        try {
            result = JSON.parse(value);
        } catch (error) {
            console.log(error);
        }
    }
    return result;
}

function check_auth() {

    // Проверяем, есть ли кука авторизации auth_data
    // Если есть кука, то:
    //      -   возвращаем ее объект типа:
    //          {
    //              provider: "telegram",
    //              user_uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    //              auth_token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    //          }
    //  Если нет куки авторизации, то:
    //      -   проверяем, есть ли в URL запроса параметр
    //          [?&]authdata_token=<authdata_token>
    //          -   если есть, вытаскиваем из апи по этому токену
    //              строку куки авторизации, ставим эту куку,
    //              запускаем URL, без [?&]authdata_token=<authdata_token>
    //              в get параметрах
    //          -   если нет параметра [?&]authdata_token=<authdata_token>:
    //              -   в апи получаем token для document.URL, заодно
    //                  имя бота
    //              -   уходим на страницу телеграма для авторизации

    var result = undefined;
    if (result = getCookie('auth_data')) {
        return result;
    }
    const err_mes = 'Ошибка авторизации!'
    const api_url = get_api_url();

    var authdata_token = get_parm('authdata_token');
    if (authdata_token) {
        $.ajax({
            url: api_url  + '/api/token/authdata/?token=' + authdata_token,
            dataType: 'json',
            async: false,
            success: function(data) {
                // поставить куку
                // Вырезать токен из адресной строки
                // Уйти на document.URL без токена
                var url = document.URL;
                url = url.replace(/[\&\?]authdata_token\=[a-z0-9\-]+/i, '');
                var cookie_str  =
                    'auth_data=' + encodeURIComponent(JSON.stringify(data)) + ';' +
                    // 14 дней
                    'max-age=1209600; ' +
                    'path=/; ' +
                    'domain=' + get_root_domain() + '; ' +
                    'samesite=lax';
                document.cookie = cookie_str;
                window.location.assign(url);
            },
            error: function (error) {
                alert(err_mes);
            }
        });
    } else {
        const payload = {
            "url": document.URL
        }
        $.ajax({
            url: api_url + '/api/token/url/',
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            async: false,
            success: function(data) {
                if (data.bot_username) {
                    window.location.assign(
                        'https://t.me/' + data.bot_username + '?start=auth_redirect-' + data.token
                    );
                } else {
                    alert(err_mes);
                }
            },
            error: function (error) {
                alert(err_mes);
            }
        });
    }
    return result;
}

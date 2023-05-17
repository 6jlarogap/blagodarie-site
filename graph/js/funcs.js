//
//  funcs.js
//
// Функции и проч., применяемые на разных страницах сайта

function get_api_url() {
    if (typeof __API_URL__ === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return __API_URL__;
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

    // Проверяем, есть ли кука авторизации.
    //  Если есть, то:
    //      -   возвращаем ее объект типа:
    //          {
    //              provider: "telegram",
    //              user_uuid: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    //              auth_token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    //          }
    //  Если нет, то:
    //      -   в апи получаем token для document.URL, заодно
    //          имя бота
    //      -   уходим на страницу телеграма для авторизации

    var result = undefined;
    if (result = getCookie('auth_data')) {
        return result;
    }
    const api_url = get_api_url();
    const err_mes = 'Ошибка авторизации!'
    const payload = {
        "url": document.URL
    }
    $.ajax({
        url: api_url + '/api/url/token/',
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
    return result;
}

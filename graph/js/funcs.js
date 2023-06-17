//
//  funcs.js
//
// Функции и проч., применяемые на разных страницах сайта

function get_api_url() {

    // API_URL можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    if (typeof API_URL === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return API_URL;
    }
}

function get_root_domain() {

    // Домен для куки.
    // ROOT_DOMAIN можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    // Вместо этого некорректно было бы ставить window.location.host:
    // можем обращаться к page.org.com, а куку надо ставить
    // на org.com

    if (typeof ROOT_DOMAIN === 'undefined') {
        return 'blagoroda.org';
    } else {
        return ROOT_DOMAIN;
    }
}

const DOCUMENT_URL = new URL(window.location.href);
function get_parm(parm) {
        
    // Получить get parameter, уже раскодированный!
    // Если в search- строке (?a=1&b=2...) не было parm=,
    // возвращаем null.

    return DOCUMENT_URL.searchParams.get(parm);
}

function getCookie(name) {

    // Полагаю, что в куке всегда объект, его и возвращаю, если
    // в строке куки имеется преобразуемый из json объект, или
    // undefined, если кука не найдена или не преобразуется в объект

    let result = undefined;
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    if (matches) {
        let value = decodeURIComponent(matches[1]);
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

async function api_request(url, options={}) {

    // Выполнить запрос в апи
    //
    // По умолчанию:
    //
    //  method:                     GET
    //  headers['Content-Type']:    'application/json; charset=utf-8'
    //
    // Возможные options, кроме тех, что в опциях для fetch()
    //      (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch),
    //      (https://learn.javascript.ru/fetch):
    //
    //  params:
    //          для get запроса, но может быть и в post и др.,
    //          например, {token:123, smth: 'abc'}.
    //          Если заданы, то будут добавлены к url.
    //  json:
    //          Заменит options.body на строку того json
    //          Если для get запроса здесь сдуру будет задан, то в fetch не пойдет
    //          (fool proof)
    //  auth_token:
    //          Поставит в headers:
    //              'Authorization': 'Token <auth_token>'
    //
    // Возвращает:
    //      {
    //          ok:
    //                      true или false,
    //          status:
    //              200     ok, если апи не отдало из кэша (тогда другой status), ok == true
    //              400     какая-то ошибка, которую поймала api, ok == false,
    //                      иногда ее надо анализировать.
    //              503     беда с web сервером, ошибка программиста в апи, ok=false
    //          data:
    //                      объект json, но при status >= 500: текст
    //      }
    //

    if (!options.method) options.method = 'GET';
    if (!options.headers) options.headers = {};
    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    if (options.auth_token) {
        options.headers.Authorization = 'Token ' + options.auth_token;
        delete options.auth_token;
    }
    if (options.params) {
        let parm_str = url.indexOf('?') == -1 ? '?' : '&';
        for (param in options.params) {
            parm_str += param + '=' + options.params[param] + '&';
        }
        parm_str = parm_str.substr(0, parm_str.length - 1);
        url = encodeURI(url + parm_str);
        delete options.params;
    };

    if (options.method.toUpperCase() != 'GET' && options.json) {
        options.body = JSON.stringify(options.json);
        delete options.json;
    }
    const response = await fetch(url, options);
    const data = response.status < 500 ? await response.json() : await response.text();
    return {
        ok: response.ok,
        status: response.status,
        data: data
    };
}


function modal_dialog_show(html_text) {

    // Показать диалог с html_text

    $('.d-modal-close').click(function() {
        $('#dialogModal').css("display", "none");
    });
    $('#dialogText').html(html_text);

    const clipboard = new ClipboardJS('#button-copy', {
        text: function(trigger) {
            return trigger.getAttribute('data-clipboard-text');
        }
    });

    $('#dialogModal').css("display", "block");
}


async function check_auth() {

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
    //              -   в апи получаем token для window.location.href, заодно
    //                  имя бота
    //              -   уходим на страницу телеграма для авторизации

    async function api_token_authdata (api_url, authdata_token, err_mes) {
        try {
            return await $.ajax({
                url: api_url  + '/api/token/authdata/?token=' + authdata_token,
                dataType: 'json'
            });
        } catch (error) {
            alert(err_mes);
        }
    }

    let result = undefined;
    let authdata_token = get_parm('authdata_token');

    if (result = getCookie('auth_data')) {
        if (authdata_token) {
            let url = DOCUMENT_URL;
            url.searchParams.delete('authdata_token');
            window.location.assign(url.href);
        }
        return result;
    }

    const err_mes = 'Ошибка авторизации!'
    const api_url = get_api_url();

    if (authdata_token) {
        const response = await api_request(
            api_url + '/api/token/authdata/', {
            params: { token: authdata_token }
        });
        if (reponse.ok) {
            //  - вырезать токен из адресной строки
            //  - поставить куку
            //  - уйти на window.location.href без токена
            const data = response.data;
            let url = DOCUMENT_URL;
            url.searchParams.delete('authdata_token');
            let cookie_str  =
                'auth_data=' + encodeURIComponent(JSON.stringify(data)) + ';' +
                // 14 дней
                'max-age=1209600; ' +
                'path=/; ' +
                'domain=' + get_root_domain() + '; ' +
                'samesite=lax';
            document.cookie = cookie_str;
            window.location.assign(url.href);
        } else {
            alert(err_mes);
        }
    } else {
        const response = await api_request(
            api_url + '/api/token/url/', {
            method: 'POST',
            json: { url: window.location.href }
        });
        if (response.ok && response.data.bot_username) {
            const data = response.data;
            const auth_redirect_url =
                'https://t.me/' +
                data.bot_username +
                '?start=auth_redirect-' + data.token
            ;
            const bot_url = 'https://t.me/' + data.bot_username;
            modal_dialog_show(
                '<p>' +
                    'Для продолжения - нажмите ' +
                    '<a ' +
                        'href="' + auth_redirect_url + '">' +
                        '<button>Перейти</button>' +
                    '</a>' +
                    'или ' +
                    '<button id="button-copy" data-clipboard-text="' + auth_redirect_url + '">Cкопируйте</button> ' +
                    ' и отправьте ссылку: ' +
                    '<a ' +
                        'href="' + bot_url + '">' +
                        bot_url +
                    '</a>' +
                '</p>' +
                '<p style="text-align:center">' +
                '</p>'

            );
            // window.location.assign(auth_redirect_url);
        } else {
            alert(err_mes);
        }
    }
    return result;
}

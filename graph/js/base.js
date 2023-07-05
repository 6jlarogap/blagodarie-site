//
//  base.js
//

// Доступ требует авторизации, см. funcs.js:check_auth()
//
// Возможные параметры (?параметр1&параметр2 ...), по группам параметров,
// в порядке их рассмотрения:
//
//  запрос к сайту BLAGORODA_HOST
//      показать страницу пользователей с их родственными и сязями доверия.
//      Порядок выборки пользователей: начиная с последнего присоединившегося
//      к сообществу.
//      Параметры такой страницы:
//          f           (from). Начало выборки, по умолчанию 0
//          q           (quantity). Сколько выбирать на странице, по умолчанию 25.
//
//  tg_group_chat_id    ид группы/канала в телеграме, показ связей доверия участников группы.
//
//  user_uuid_genesis_tree
//                      uuid
//                      Дерево родства
//                  При этом возможны параметры:
//      depth           глубина поиска по рекурсии родства от user с uuid
//      up              поиск только к предкам,
//                          без вяких ответвлений на дядей, двоюродных бабушек и т.п.
//      down            поиск только к потомкам,
//                          без вяких ответвлений на племянников, внучатых племянниц и т.п.
//
//  user_uuid_genesis_path
//                      uuid1,uuid2
//                      Путь родства между user с uuid1 и user c uuid2
//                  При этом возможен параметр:
//      depth           глубина поиска по рекурсии родства от user с uuid1 до user c uuid2
//
//  user_uuid_trust_path
//                      uuid1,uuid2
//                      Путь доверия между user с uuid1 и user c uuid2
//                  При этом возможен параметр:
//      depth           глубина поиска по рекурсии доверия от user с uuid1 до user c uuid2
//
//  user_uuid_trusts    uuid пользователя
//                      Все его (ее) связи доверия, а также связи доверия тех,
//                      кто ему (ей) доверял или не доверял
//
//  offer_uuid          ид опроса- предложения (offer) в телеграме, показ ответов,
//                      Показ того, кто на что отвечал, связей доверия среди отвечавших
//
//  tg_poll_id          ид опроса телеграма, показ ответов,
//                      Показ того, кто на что отвечал, связей доверия среди отвечавших
//
//  videoid             Ид видео.
//                      Показ того, кто какие лайки ставил на видео
//      Параметр такой страницы:
//  source              Источник видео, по умолчанию 'yt' (Youtube)
//      Возможны еще параметры:
//              f:  с такой секунды видео начинать
//              t:  по какую секунду видео показывать
//
//
//  Если не задан ни один из перечисленных выше параметров, в том числе в url нет параметров,
//  то это соответствует вызову с /?rod=on&dover=&withalone=
//
//  rod, dover, withalone
//      показ всех родственных связей и связей доверия
//          rod         (что-то не пустое)
//                      показ родственных связей, от родителя к потомку
//          dover       (что-то не пустое)
//                      показ связей доверия
//          withalone   (что-то не пустое)
//                      показ людей, у которых нет родственных связей (если задан rod) и/или
//                      нет связей доверия (если задан dover)
//      Параметры такой страницы:
//          f           (from). Начало выборки, по умолчанию 0
//          q           (quantity). Сколько выбирать на странице, по умолчанию всё после f.
//

function get_blagoroda_host() {

    // Можно переопределить в local_settings.js,
    // который стоит раньше других js скриптов в .html

    if (typeof BLAGORODA_HOST === 'undefined') {
        return 'blagoroda.org';
    } else {
        return BLAGORODA_HOST;
    }
}

let parm_f = '';
let parm_q = '';

let parm_tg_group_chat_id = '';

let parm_rod = '';
let parm_dover = '';
let parm_withalone = '';

let parm_tg_poll_id = '';
let parm_offer_uuid = '';
let parm_user_uuid_trusts = '';
let parm_user_uuid_genesis_path = '';
let parm_user_uuid_trust_path = '';

let parm_user_uuid_genesis_tree = '';
let parm_depth = '';
let parm_up = '';
let parm_down = '';

let parm_videoid = '';
let parm_source = '';

let auth_data = undefined;

function link_color(link, format) {
    const color_relation = format == 'rgba' ? 'rgba(0, 51, 204, 0.8)' : '#0033cc';
    const color_poll = color_relation;
    const color_trust = format == 'rgba' ? 'rgba(54, 107, 13, 0.8)' : '#366b0d';
    const color_not_trust = format == 'rgba' ? 'rgba(250, 7, 24, 0.8)' : '#fa0718';
    if (link.is_poll || link.is_offer || link.is_video_vote) {
        return color_poll;
    } else if (link.is_child && (parm_rod || parm_user_uuid_genesis_path || parm_user_uuid_genesis_tree)) {
        return color_relation;
    } else if (link.is_trust) {
        return color_trust;
    } else {
        return color_not_trust;
    }
}

$(document).ready (async function() {

    auth_data = await check_auth();
    if (!auth_data) { return; };

    const is_blagoroda_host = get_blagoroda_host() == window.location.host;
    const is_other_site = !is_blagoroda_host;
    parm_tg_group_chat_id = parseInt(get_parm('tg_group_chat_id'));
    parm_f = parseInt(get_parm('f'));
    parm_q = parseInt(get_parm('q'));

    parm_rod = get_parm('rod') || '';
    parm_dover=get_parm('dover') || '';;
    parm_withalone = get_parm('withalone') || '';

    parm_user_uuid_genesis_tree = get_parm('user_uuid_genesis_tree') || '';
    parm_user_uuid_genesis_path = get_parm('user_uuid_genesis_path') || '';
    parm_user_uuid_trust_path = get_parm('user_uuid_trust_path') || '';
    parm_tg_poll_id = get_parm('tg_poll_id') || '';
    parm_offer_uuid = get_parm('offer_uuid') || '';
    parm_user_uuid_trusts = get_parm('user_uuid_trusts') || '';

    parm_videoid = get_parm('videoid') || '';
    if (parm_videoid) {
        parm_source = get_parm('source') || 'yt';
    }

    if (
        !window.location.href.match(/\?/) ||
        window.location.href.match(/\?$/) ||
        is_blagoroda_host && (isNaN(parm_f) || isNaN(parm_q) || parm_f < 0 || parm_q <= 0) ||
        is_other_site && 
            !parm_tg_group_chat_id &&
            !parm_user_uuid_genesis_tree &&
            !parm_user_uuid_genesis_path &&
            !parm_user_uuid_trust_path &&
            !parm_tg_poll_id &&
            !parm_offer_uuid &&
            !parm_user_uuid_trusts &&
            !parm_videoid &&
            !parm_rod && !parm_dover
       ) {
        window.location.assign(
            window.location.protocol + '//' +
            window.location.host +
            window.location.pathname + (is_blagoroda_host ? '?f=0&q=25' : '?rod=on&dover=&withalone='));
    }

    const r_uuid = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i;
    const r_uuid1_uuid2 = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}\,[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i;

    if (is_other_site) {
        if (parm_user_uuid_genesis_tree) {
            if (r_uuid.test(parm_user_uuid_genesis_tree)) {
                parm_depth = get_parm('depth') || '';
                parm_up = get_parm('up') || '';
                parm_down = get_parm('down') || '';
            } else {
                parm_user_uuid_genesis_tree = '';
            }
        }

        if (parm_user_uuid_genesis_path) {
            if (r_uuid1_uuid2.test(parm_user_uuid_genesis_path)) {
                parm_depth = get_parm('depth') || '';
            } else {
                parm_user_uuid_genesis_path = '';
            }
        }

        if (parm_user_uuid_trust_path) {
            if (r_uuid1_uuid2.test(parm_user_uuid_trust_path)) {
                parm_depth = get_parm('depth') || '';
            } else {
                parm_user_uuid_trust_path = '';
            }
        }
    }

    const api_url = get_api_url();
    let api_get_parms;
    if (is_blagoroda_host) {
        parm_rod = 'on';
        parm_dover = 'on';
        parm_withalone = 'on';
        api_get_parms =
            '/api/profile_genesis/all?fmt=3d-force-graph' +
            '&withalone=' + parm_withalone +
            '&dover=' + parm_dover +
            '&rod=' + parm_rod +
            '&from=' + parm_f +
            '&number=' + parm_q
        ;
    } else if (parm_tg_group_chat_id) {
        api_get_parms =
            '/api/getstats/user_connections_graph?fmt=3d-force-graph' +
            '&number=0' +
            '&tg_group_chat_id=' + parm_tg_group_chat_id;
    } else if (is_other_site && parm_user_uuid_genesis_tree) {
        api_get_parms =
            '/api/profile_genesis?uuid=' + parm_user_uuid_genesis_tree +
            '&fmt=3d-force-graph' +
            '&depth=' + parm_depth +
            '&up=' + parm_up +
            '&down=' + parm_down
        ;
    } else if (is_other_site && parm_user_uuid_genesis_path) {
        document.title = 'Благо Рода: путь родства';
        api_get_parms =
            '/api/profile_genesis?uuid=' + parm_user_uuid_genesis_path + '&fmt=3d-force-graph&depth=' + parm_depth;
    } else if (is_other_site && parm_user_uuid_trust_path) {
        document.title = 'Благо Рода: путь доверий';
        api_get_parms =
            '/api/profile_trust?uuid=' + parm_user_uuid_trust_path + '&fmt=3d-force-graph&depth=' + parm_depth;
    } else if (is_other_site && parm_user_uuid_trusts) {
        api_get_parms =
            '/api/profile_graph?fmt=3d-force-graph&uuid=' + parm_user_uuid_trusts;
    } else if (is_other_site && parm_offer_uuid) {
        api_get_parms =
            '/api/offer/results/?offer_uuid=' + parm_offer_uuid;
    } else if (is_other_site && parm_tg_poll_id) {
        api_get_parms =
            '/api/bot/poll/results/?tg_poll_id=' + parm_tg_poll_id;
    } else if (is_other_site && parm_videoid) {
        api_get_parms =
            '/api/wote/vote/graph/' +
            '?videoid=' + parm_videoid +
            '&source=' + parm_source;
        let parm_from = get_parm('f');
        if (parm_from) {
            api_get_parms += '&from=' + parm_from;
        }
        let parm_to = get_parm('t');
        if (parm_to) {
            api_get_parms += '&to=' + parm_to;
        }
    } else {
        api_get_parms =
            '/api/profile_genesis/all?fmt=3d-force-graph' +
            '&withalone=' + parm_withalone +
            '&dover=' + parm_dover +
            '&rod=' + parm_rod +
            '&from=' + parm_f +
            '&number=' + parm_q;
    }
    const headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    $.ajax({
        url: api_url  + api_get_parms,
        headers: headers,
        dataType: 'json',
        success: function(data) {
            if (parm_tg_group_chat_id && data.tg_group) {
                document.title =
                    'Благо Рода, доверия в ' + (data.tg_group == 'channel' ? 'канале' : 'группе') + ': ' +
                    data.tg_group.title;
            } else if (parm_user_uuid_genesis_tree && data.user_q_name) {
                document.title = 'Благо Рода, родство: ' + data.user_q_name;
            } else if (parm_user_uuid_trusts && data.user_q_name) {
                document.title = 'Благо Рода, ближайшие доверия: ' + data.user_q_name;
            } else if ((parm_tg_poll_id || parm_offer_uuid) && data.question) {
                document.title = 'Благо Рода, опрос: ' + data.question;
            } else if (parm_videoid && data.title) {
                document.title = 'Благо Рода, голоса по видео: ' + data.title;
            }
            const photoTextureMale = new THREE.TextureLoader().load(`./images/no-photo-gender-male.jpg`);
            const photoTextureFemale = new THREE.TextureLoader().load(`./images/no-photo-gender-female.jpg`);
            const photoTextureNone = new THREE.TextureLoader().load(`./images/no-photo-gender-none.jpg`);

            const photoTextureMaleDead = new THREE.TextureLoader().load(`./images/no-photo-gender-male-dead.jpg`);
            const photoTextureFemaleDead = new THREE.TextureLoader().load(`./images/no-photo-gender-female-dead.jpg`);
            const photoTextureNoneDead = new THREE.TextureLoader().load(`./images/no-photo-gender-none-dead.jpg`);

            const Graph = ForceGraph3D()
            (document.getElementById('3d-graph'))
            .nodeThreeObject(({ id, photo, gender, is_dead }) => {
                let photoTexture;
                if (photo) {
                    photoTexture = new THREE.TextureLoader().load(photo);
                } else if (gender == 'm' && !is_dead) {
                    photoTexture = photoTextureMale;
                } else if (gender == 'm' && is_dead) {
                    photoTexture = photoTextureMaleDead;
                } else if (gender == 'f' && !is_dead) {
                    photoTexture = photoTextureFemale;
                } else if (gender == 'f' && is_dead) {
                    photoTexture = photoTextureFemaleDead;
                } else if (is_dead) {
                    photoTexture = photoTextureNoneDead;
                } else {
                    photoTexture = photoTextureNone;
                }
                const material = new THREE.SpriteMaterial({ map: photoTexture });
                const sprite = new THREE.Sprite(material);
                sprite.scale.set(25, 25);
                return sprite;
            })
            .graphData(data)
            // Если есть и родственная связь, и доверие, и если задано
            // искать родственные связи, то показываем стрелку цвета родственной связи
            .linkColor(link => link_color(link, 'rgb'))
            .linkOpacity(0.8)
            .linkCurvature(0.25)
            .backgroundColor("#FFFFFF")
            .nodeLabel(node => `<span style="color: darkred">${node.first_name}</span>`)
            .onNodeClick(function(node){
                document.querySelector(".menu-wrapper").classList.add("menu-wrapper--active")
                document.querySelector(".menu__close-wrap").addEventListener("click", function() {
                    document.querySelector(".menu-wrapper").classList.remove("menu-wrapper--active")
                })
                document.querySelector(".menu__title-span").textContent = node.first_name
                document.querySelector(".btn--4").addEventListener("click", function() {
                    if (node.uuid && data.bot_username) {
                        window.location.href = "https://t.me/" + data.bot_username + '?start=' + node.uuid;
                    }
                })
            })

            .linkDirectionalArrowLength(10)
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalArrowColor(link => link_color(link, 'rgba'))
            ;
            if (!parm_tg_poll_id && !parm_offer_uuid) {
                Graph.d3Force('charge').strength(-320);
            }
            document.querySelector(".btn--3").addEventListener("click", function() {
            })
        }
    });
});
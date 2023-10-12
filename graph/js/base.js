//
//  graph/js/base.js
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
//      collapse        Показывать не всё дерево от user'a к предкам, потомкам
//                      в соответствии с 4 возможнымии комбинациями параметров up, down,
//                      а только user'a с ближайшими связями:
//                          дети, если только не задан лишь up=on,
//                          родители, если только не задан лишь down=on
//                      По щелчку на одного из детей, родителей будут развернуты или
//                      свернуты уже развернутые идущие от него родственные связи.
//                      (TODO) будет диалог с предложением развернуть или свернуть
//                      уже развернутые идущие от него родственные связи
//
//  user_uuid_genesis_path
//                      uuid1,uuid2
//                      Путь родства между user с uuid1 и user c uuid2
//                  При этом возможны параметры:
//      depth           глубина поиска по рекурсии родства от user с uuid1 до user c uuid2
//
//  user_uuid_trust_path
//                      uuid1,uuid2
//                      Путь доверия между user с uuid1 и user c uuid2
//      При этом возможен параметр:
//              depth   глубина поиска по рекурсии доверия от user с uuid1 до user c uuid2
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
//      При этом возможны еще параметры:
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
let parm_collapse = '';

let parm_videoid = '';
let parm_source = '';

let auth_data = undefined;

let api_response = false;
let nodes_by_id = false;
let root_node = false;


const get_pruned_tree = () => {
    const visible_nodes = [];
    const visible_links = [];

    //  При проходе по разворачиваему родственному дереву у узла
    //  может затеряться связь с другим свернутым узлом.
    //
    //  Например:   развернули человека, появились его папа с мамой, оба свернутые.
    //              Разворачиваем папу, в дереве появляется его дети,
    //              все свернутые. Поскольку дети свернутые, то у них
    //              не будет связи с их свернутой мамой!
    //  Но это только если идём по дереву с завихрениями типа я - папа - дед - дядя,
    //  при проходе по прямым потомкам и/или прямым предкам такого быть не должно.
    //  Для этого объекты d_visible_nodes, d_visible_links, чтоб быстрее
    //  искать потерянного родителя по видимым узлам и связям после того как
    //  эти узлы, связи построены.

    const d_visible_links = {};
    const d_visible_nodes = {};
    const link_sep = '~';

    (function traverse_tree(node = nodes_by_id[root_node.id]) {

        visible_nodes.push(node);
        d_visible_nodes[node.id] = true;
        if (node.collapsed) return;

        // tree_links: направление развертывания по дереву от корня к окраинам
        //
        visible_links.push(...node.tree_links);
        node.tree_links.forEach(link => {
            const source = ((typeof link.source) === 'object') ? link.source.id : link.source;
            const target = ((typeof link.target) === 'object') ? link.target.id : link.target;
            d_visible_links[(source).toString() + link_sep + (target).toString()] = true;
        });

        node.tree_links
            .map(link => nodes_by_id[link.t_target])
            .forEach(traverse_tree);
    })();

    for (const node of visible_nodes) {
        if (!node.collapsed) continue;
        for (const parent_id of node.parent_ids) {
            if (!d_visible_nodes[parent_id]) continue;
            if (d_visible_links[(parent_id).toString() + link_sep + (node.id).toString()]) continue;
            visible_links.push({
                source: parent_id,
                target: node.id,
                is_child: true
            });
            // если нашелся один потерянный родитель, то второй точно не терялся
            break;
        }
    }
    return { nodes: visible_nodes, links: visible_links };
};

const graph_data = () => {
    let result = { links: [], nodes: [] };
    if (parm_user_uuid_genesis_tree && parm_collapse && nodes_by_id && root_node) {
        result = get_pruned_tree();
    } else if (api_response && api_response.ok) {
        result = api_response.data;
    }
    return result;
}

function node_label(node) {
    let color = 'darkred';
    if (parm_user_uuid_genesis_tree && parm_collapse) {
        // blue or darkred
        color = node.tree_links.length ? '#336600' : 'darkred';
    }
    return `<span style="color: ` + color + `">${node.first_name}</span>`;
}

function link_color(link, format) {
    let color_relation;
    if (parm_user_uuid_genesis_tree && parm_collapse) {
        // Добавленные связи между свернутыми узлами. У них неоткуда взяться t_target
        let obj_target = link.t_target ? link.t_target : link.target;
        obj_target = ((typeof obj_target) === 'object') ? obj_target : nodes_by_id[obj_target];
        if (obj_target.tree_links.length) {
            // dark green
            color_relation = format == 'rgba' ? 'rgba(51, 102, 0, 0.8)' : '#336600';
        } else {
            // dark red
            color_relation = format == 'rgba' ? 'rgba(139, 0, 0, 0.8)' : '#8B0000';
        }
    } else {
        // blue
        color_relation = format == 'rgba' ? 'rgba(0, 51, 204, 0.8)' : '#0033cc';
    }
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
                parm_collapse = get_parm('collapse') || '';
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
            '&down=' + parm_down +
            '&collapse=' + parm_collapse
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
        if (!isNaN(parm_f)) {
            api_get_parms += '&from=' + parm_f;
        }
        let parm_to = parseInt(get_parm('t'));
        if (!isNaN(parm_to)) {
            api_get_parms += '&to=' + parm_to;
        }
    } else {
        api_get_parms =
            '/api/profile_genesis/all?fmt=3d-force-graph' +
            '&withalone=' + parm_withalone +
            '&dover=' + parm_dover +
            '&rod=' + parm_rod;
        if (!isNaN(parm_f)) {
            api_get_parms += '&from=' + parm_f;
        }
        if (!isNaN(parm_q)) {
            api_get_parms += '&number=' + parm_q;
        }
    }
    api_response = await api_request(api_url + api_get_parms, {auth_token: auth_data.auth_token});
    if (api_response.ok) {
        const data = api_response.data;
        if (parm_tg_group_chat_id && data.tg_group) {
            document.title =
                'Благо Рода, доверия в ' + (data.tg_group == 'channel' ? 'канале' : 'группе') + ': ' +
                data.tg_group.title;
        } else if (parm_user_uuid_genesis_tree && data.root_node) {
            document.title = 'Благо Рода, родство: ' + data.root_node.first_name;
            if (parm_collapse) {

            //  tree_links - это как идем по дереву от t_source к t_target, потом от
            //  (previous t_target = t_source) к следующему t_target.
            //  t_source -> t_target может быть и к родителю.
            //  Направление родитель -> ребенок задает source -> target.

                root_node = data.root_node;
                data.nodes.forEach((node) => {
                    node.collapsed = node.id != root_node.id;
                    node.tree_links = []
                });
                nodes_by_id = Object.fromEntries(data.nodes.map(node => [node.id, node]));
                    data.links.forEach(link => {
                    nodes_by_id[link.t_source].tree_links.push(link);
                });
            }
        } else if (parm_user_uuid_trusts && data.root_node) {
            document.title = 'Благо Рода, ближайшие доверия: ' + data.root_node.first_name;
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

        const graph_container = $('#3d-graph')[0];
        const Graph = ForceGraph3D()(graph_container)
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
        .graphData(graph_data())
        // Если есть и родственная связь, и доверие, и если задано
        // искать родственные связи, то показываем стрелку цвета родственной связи
        .linkColor(link => link_color(link, 'rgb'))
        .linkOpacity(0.8)
        .linkCurvature(0.25)
        .backgroundColor("#FFFFFF")
        .nodeLabel(node => node_label(node))
        .onNodeHover(node => {
            let cursor = 'pointer';
            if (parm_user_uuid_genesis_tree && parm_collapse) {
                cursor =  node && node.tree_links.length ? 'pointer' : null;
            }
            graph_container.style.cursor = cursor;
        })
        .onNodeClick(function(node){
            if (parm_user_uuid_genesis_tree && parm_collapse) {
                if (node.tree_links.length) {
                    node.collapsed = !node.collapsed; // toggle collapse state
                    Graph.graphData(get_pruned_tree());
                }
            }
            else if (node.uuid && data.bot_username) {
                window.location.href = "https://t.me/" + data.bot_username + '?start=' + node.uuid;
            }
        })

        .linkDirectionalArrowLength(10)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowColor(link => link_color(link, 'rgba'))
        ;

        if (!parm_tg_poll_id && !parm_offer_uuid) {
            Graph.d3Force('charge').strength(-320);
        }
    }

});

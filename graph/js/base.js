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
//      depth           начальная глубина глубина поиска по рекурсии родства от user с uuid,
//                      по умолчанию 3, до прадедов, правнуков
//      up              поиск только к предкам,
//                          без вяких ответвлений на дядей, двоюродных бабушек и т.п.
//      down            поиск только к потомкам,
//                          без вяких ответвлений на племянников, внучатых племянниц и т.п.
//                      По щелчку на родственников будут развернуты
//                      считанные по начальной глубине узлы
//                      TODO    или разворачиваться новые узлы вне начальной глубины или
//                              идущие от линии прямого родства боковые связи (мама сына
//                              при движении вниз по прямому родству /down/,
//                              брат при движении вверх /up/.
//                              При показе прямого родства (up и/или down) линия прямого
//                              родства с узлами всегда будет на экране.
//                              При любых up/down линия прямого родтсва и узлы в ней
//                              выделяются другим цветом.
//                      или сворачиваться уже развернутые от узов родственные связи.
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


$(document).ready (async function() {

    function get_blagoroda_host() {

        // Можно переопределить в local_settings.js,
        // который стоит раньше других js скриптов в .html

        if (typeof BLAGORODA_HOST === 'undefined') {
            return 'blagoroda.org';
        } else {
            return BLAGORODA_HOST;
        }
    }

    const c_nfa = ' ';
    const c_collapsed = '+';
    const c_expanded = '-';

    function expand_collapse_sign (node) {
        let result;
        let do_up = parm_up && node.up && 'lateral_links' in node && node.lateral_links.length == 0;
        let do_down = parm_down && node.down && 'lateral_links' in node && node.lateral_links.length == 0;
        if      (do_up || do_down)              result = c_nfa;
        else if (node.tree_links.length == 0)   result = c_nfa;
        else if (node.collapsed)                result = c_collapsed;
        else                                    result = c_expanded;
        return result;
    }

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

    let d_visible_links = {};
    let d_visible_nodes = {};
    const link_sep = '~';

    function get_pruned_tree() {
        const visible_nodes = [];
        const visible_links = [];

        d_visible_links = {};
        d_visible_nodes = {};
        const link_sep = '~';

        (function traverse_tree(node = nodes_by_id[root_node.id]) {

            if (node.id in d_visible_nodes) return;
            visible_nodes.push(node);
            d_visible_nodes[node.id] = true;
            let do_up = parm_up && node.up && 'lateral_links' in node;
            let do_down = parm_down && node.down && 'lateral_links' in node;
            if (node.collapsed && !do_up && !do_down) return;

            // tree_links: направление развертывания по дереву от корня к окраинам

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
            const what = expand_collapse_sign(node);
            node.first_name = node.first_name_orig + (what != c_nfa ? ' (' + what + ')' : '');
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

    function node_text_color(node, format) {
        // dark red
        let color = format == 'rgba' ? 'rgba(139, 0, 0, 0.8)' : '#8B0000';
        if (parm_user_uuid_genesis_tree) {
            // green or darkred or blue if up or down
            color = (node.up || node.down)
                ?   (format == 'rgba' ? 'rgba(0, 51, 204, 0.8)' : '#0033cc')
                :   (
                        node.tree_links.length
                            ? (format == 'rgba' ? 'rgba(51, 102, 0, 0.8)' : '#336600')
                            : (format == 'rgba' ? 'rgba(139, 0, 0, 0.8)' : '#8B0000')
                    );
        }
        return color;
    }

    function link_color(link, format) {
        // blue
        let color_relation = format == 'rgba' ? 'rgba(0, 51, 204, 0.8)' : '#0033cc';
        if (parm_user_uuid_genesis_tree) {
            const source = ((typeof link.source) === 'object') ? link.source : nodes_by_id[link.source];
            const target = ((typeof link.target) === 'object') ? link.target : nodes_by_id[link.target];
            if (!(source.up && target.up || source.down && target.down)) {
                if (source.tree_links.length == 0 || target.tree_links.length == 0) {
                    // dark red
                    color_relation = format == 'rgba' ? 'rgba(139, 0, 0, 0.8)' : '#8B0000';
                } else {
                    // dark green
                    color_relation = format == 'rgba' ? 'rgba(51, 102, 0, 0.8)' : '#336600';
                }
            }
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

    const auth_data = await check_auth();
    if (!auth_data) return;

    let nodes_by_id = false;
    let root_node = false;

    const is_blagoroda_host = get_blagoroda_host() == window.location.host;
    const is_other_site = !is_blagoroda_host;
    const parm_tg_group_chat_id = parseInt(get_parm('tg_group_chat_id'));
    const parm_f = parseInt(get_parm('f'));
    const parm_q = parseInt(get_parm('q'));

    let parm_rod = get_parm('rod') || '';
    let parm_dover=get_parm('dover') || '';;
    let parm_withalone = get_parm('withalone') || '';

    let parm_user_uuid_genesis_tree = get_parm('user_uuid_genesis_tree') || '';
    let parm_user_uuid_genesis_path = get_parm('user_uuid_genesis_path') || '';
    let parm_user_uuid_trust_path = get_parm('user_uuid_trust_path') || '';
    let parm_user_uuid_trusts = get_parm('user_uuid_trusts') || '';

    const parm_tg_poll_id = get_parm('tg_poll_id') || '';
    const parm_offer_uuid = get_parm('offer_uuid') || '';

    const parm_videoid = get_parm('videoid') || '';
    let parm_source = '';
    if (parm_videoid) parm_source = get_parm('source') || 'yt';

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
    let parm_depth = '';
    let parm_up = '';
    let parm_down = '';
    if (is_other_site) {
        if (parm_user_uuid_genesis_tree) {
            if (r_uuid.test(parm_user_uuid_genesis_tree)) {
                parm_depth = get_parm('depth') || 3;
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
            '&down=' + parm_down + '&new=on'
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
    const photoTextureMale = new THREE.TextureLoader().load(`./images/no-photo-gender-male.jpg`);
    const photoTextureFemale = new THREE.TextureLoader().load(`./images/no-photo-gender-female.jpg`);
    const photoTextureNone = new THREE.TextureLoader().load(`./images/no-photo-gender-none.jpg`);

    const photoTextureMaleDead = new THREE.TextureLoader().load(`./images/no-photo-gender-male-dead.jpg`);
    const photoTextureFemaleDead = new THREE.TextureLoader().load(`./images/no-photo-gender-female-dead.jpg`);
    const photoTextureNoneDead = new THREE.TextureLoader().load(`./images/no-photo-gender-none-dead.jpg`);

    function node_draw(node) {
        let photoTexture;
        if (node.photo) {
            photoTexture = new THREE.TextureLoader().load(node.photo);
        } else if (node.gender == 'm' && !node.is_dead) {
            photoTexture = photoTextureMale;
        } else if (node.gender == 'm' && node.is_dead) {
            photoTexture = photoTextureMaleDead;
        } else if (node.gender == 'f' && !node.is_dead) {
            photoTexture = photoTextureFemale;
        } else if (node.gender == 'f' && node.is_dead) {
            photoTexture = photoTextureFemaleDead;
        } else if (node.is_dead) {
            photoTexture = photoTextureNoneDead;
        } else {
            photoTexture = photoTextureNone;
        }
        const material = new THREE.SpriteMaterial({ map: photoTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(25, 25);

        const label = new SpriteText();
        // label.material.depthWrite = false; // make sprite background transparent
        label.text = node.first_name;
        label.textHeight = 0.2;
        label.color = node_text_color(node, 'rgba');
        sprite.add(label)

        sprite.center.set(0.5, -0.1);

        return sprite;
    }

    const graph_container = $('#3d-graph')[0];
    const Graph = ForceGraph3D()
        .nodeThreeObject(node => node_draw(node))

        // Если не дерево родства: если есть и родственная связь, и доверие, и если задано
        // искать родственные связи, то показываем стрелку цвета родственной связи.
        // В дереве родства своя цветовая гамма для оконченых узлов

        .linkColor(link => link_color(link, 'rgb'))
        .linkOpacity(0.8)
        .linkCurvature(0.25)
        .backgroundColor("#FFFFFF")
        .nodeLabel(node => `<span style="color: ${node_text_color(node, 'rgb')}">${node.first_name}</span>`)
        .onNodeHover(node => {
            let cursor = null;
            if (parm_user_uuid_genesis_tree) {
                if (node) {
                    const what = expand_collapse_sign(node);
                    if   (what == c_nfa)                cursor = null;
                    else /* c_collapsed или expanded */ cursor = 'pointer';
                }
            }
            graph_container.style.cursor = cursor;
        })
        .onNodeClick(async function(node){
            if (parm_user_uuid_genesis_tree) {
                if ('lateral_links' in node) {
                    if(node.lateral_links.length > 0) {
                        if (node.collapsed) {
                            node.tree_links = node.lateral_links.concat(node.tree_links);
                        } else {
                            for (let i = 0; i < node.lateral_links.length; i++) node.tree_links.shift();
                        }
                    }
                }
                if (node.tree_links.length) {
                    node.collapsed = !node.collapsed;

                    if (!node.collapsed && !node.complete) {
                        // подчитываем из базы по путям от node.tree_links t_target's
                        // сначала fool proof
                        if ('lateral_links' in node && node.lateral_links.length == 0) {
                            node.complete = true;
                        }
                        if (!('lateral_links' in node) && node.tree_links.length == 0) {
                            node.complete = true;
                        }
                        if (!node.complete) {
                            const from_where = 'lateral_links' in node ? node.lateral_links : node.tree_links;
                            const sources_by_id = {};
                            for (let i = 0; i < from_where.length; i++) {
                                const id = from_where[i].t_target;
                                // Не идет ли от того id к этому ноду связь
                                let found = false;
                                for (let i = 0; i < nodes_by_id[id].tree_links.length; i++) {
                                    if (nodes_by_id[id].tree_links[i].t_target == node.id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found && !nodes_by_id[id].complete) {
                                    sources_by_id[id] = {
                                        up: nodes_by_id[id].up,
                                        down: nodes_by_id[id].down,
                                    };
                                }
                            }
                            if (Object.keys(sources_by_id).length != 0) {
                                graph_container.style.cursor = 'wait';
                                const api_response = await api_request(
                                    api_url + '/api/profile_genesis/', {
                                        method: 'POST',
                                        auth_token: auth_data.auth_token,
                                        json: {
                                            fan_source: {
                                                nodes:  [node.id],
                                                sources_by_id: sources_by_id
                                            }
                                        }
                                    }
                                );
                                if (api_response.ok) {
                                    node.complete = true;
                                    for (const [id, node_] of Object.entries(api_response.data.targets_by_id)) {
                                        if ('id' in node_) {
                                            // Следующие после запрошенных в sources_by_id
                                            if (!(id in nodes_by_id)) {
                                                nodes_by_id[id] = node_;
                                                nodes_by_id[id].first_name_orig = nodes_by_id[id].first_name;
                                            }
                                        } else {
                                            // Запрошенные в sources_by_id. В targets_by_id все их связи,
                                            // включая лишние
                                            if (id in nodes_by_id) {
                                                nodes_by_id[id].parent_ids = node_.parent_ids;
                                                let tree_links = [];
                                                // По каждой связи: нет ли "взаимной", например,
                                                // у сына нешли связь на маму, а у мамы уже есть связь на него
                                                for (let i = 0; i < node_.tree_links.length; i++) {
                                                    let t_source = node_.tree_links[i].t_source;
                                                    let t_target = node_.tree_links[i].t_target;
                                                    let found = false;
                                                    if (t_target in nodes_by_id) {
                                                        for (let j = 0; j < nodes_by_id[t_target].tree_links.length; j++) {
                                                            let link = nodes_by_id[t_target].tree_links[j];
                                                            if (link.t_source == t_target && link.t_target == t_source) {
                                                                found = true;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (!found) tree_links.push(node_.tree_links[i]);
                                                }
                                                nodes_by_id[id].tree_links = tree_links;
                                                nodes_by_id[id].complete = tree_links.length == 0 ? true : false;
                                            }
                                        }
                                    }
                                }
                                graph_container.style.cursor = null;
                            } else { node.complete = true;}
                        }
                    }

                    //  node_draw(node):
                    //      иначе не перерисовывается фио со значком +/-, точнее значок
                    //      особенно при сворачивании узла!
                    //  https://github.com/vasturiano/3d-force-graph/issues/61#issuecomment-901611382
                    //
                    Graph.nodeThreeObject(node => node_draw(node));
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

    let data;
    const api_response = await api_request(api_url + api_get_parms, {auth_token: auth_data.auth_token});
    if (api_response.ok) {
        data = api_response.data;
        if (parm_user_uuid_genesis_tree) {
            root_node = data.root_node;
            nodes_by_id = data.nodes_by_id;
        }
        if (parm_tg_group_chat_id && data.tg_group) {
            document.title =
                'Благо Рода, доверия в ' + (data.tg_group == 'channel' ? 'канале' : 'группе') + ': ' +
                data.tg_group.title;
        } else if (parm_user_uuid_genesis_tree && data.root_node) {
            document.title = 'Благо Рода, родство: ' + data.root_node.first_name;
        } else if (parm_user_uuid_trusts && data.root_node) {
            document.title = 'Благо Рода, ближайшие доверия: ' + data.root_node.first_name;
        } else if ((parm_tg_poll_id || parm_offer_uuid) && data.question) {
            document.title = 'Благо Рода, опрос: ' + data.question;
        } else if (parm_videoid && data.title) {
            document.title = 'Благо Рода, голоса по видео: ' + data.title;
        }
        if (parm_user_uuid_genesis_tree) {
            // if (!parm_up && !parm_down) {
                // nodes_by_id[root_node.id].collapsed = true;
                //  {
                //     node.collapsed = node.id != root_node.id;
                // }
            // }
            for (const [id, node] of Object.entries(nodes_by_id)) {
                node.first_name_orig = node.first_name;
            }
            Graph(graph_container).graphData(get_pruned_tree());
        } else {
            Graph(graph_container).graphData(data);
        }
    }
});

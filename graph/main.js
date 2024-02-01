//
//  graph/main.js
//

// Доступ к странице может быть авторизован, см. funcs.js:check_auth()
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
//                      по умолчанию 2, до дедов, внуков
//      up              поиск только к предкам,
//                          без вяких ответвлений на дядей, двоюродных бабушек и т.п.
//      down            поиск только к потомкам,
//                          без вяких ответвлений на племянников, внучатых племянниц и т.п.
//                      По щелчку на родственников будут разворачиваться новые узлы
//                      вне начальной глубины или идущие от линии прямого родства боковые
//                      связи (мама сына при движении вниз по прямому родству /down/,
//                      брат при движении вверх /up/).
//                      При любых up/down линия прямого родства выделяется другим цветом.
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


import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import ForceGraph3D from '3d-force-graph';

(async function() {
// ----------    
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

    const trust_operations = {
        mistrust: { op: 2, start_prefix: 'n' },
        nullify_trust:  { op: 4, start_prefix: 'f' },
        trust_and_thank: { op: 5, start_prefix: 't' }
    }
    const genesis_operations = {
        set_father: { op:  9},
        set_mother: { op: 10}
    }

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
            for (const moth_or_fath in node.parents) {
                const parent_id = node.parents[moth_or_fath];
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

    // Параметр: требуется ли авторизация
    //
    const auth_data = await check_auth(false);

    let nodes_by_id = false;
    let root_node = false;

    const is_blagoroda_host = get_blagoroda_host() == window.location.host;
    let parm_tg_group_chat_id = parseInt(get_parm('tg_group_chat_id'));
    const parm_f = parseInt(get_parm('f'));
    const parm_q = parseInt(get_parm('q'));

    let parm_rod = get_parm('rod') || '';
    let parm_dover=get_parm('dover') || '';;
    let parm_withalone = get_parm('withalone') || '';

    const parm_user_uuid_genesis_name = 'user_uuid_genesis_tree';
    let parm_user_uuid_genesis_tree = get_parm(parm_user_uuid_genesis_name) || '';
    let parm_user_uuid_genesis_path = get_parm('user_uuid_genesis_path') || '';
    let parm_user_uuid_trust_path = get_parm('user_uuid_trust_path') || '';
    const parm_user_uuid_trusts_name = 'user_uuid_trusts';
    let parm_user_uuid_trusts = get_parm(parm_user_uuid_trusts_name) || '';

    let parm_tg_poll_id = get_parm('tg_poll_id') || '';
    let parm_offer_uuid = get_parm('offer_uuid') || '';

    let parm_videoid = get_parm('videoid') || '';
    let parm_source = '';
    if (parm_videoid) parm_source = get_parm('source') || 'yt';

    if (
        !window.location.href.match(/\?/) ||
        window.location.href.match(/\?$/) ||
        is_blagoroda_host && (isNaN(parm_f) || isNaN(parm_q) || parm_f < 0 || parm_q <= 0) ||
        !is_blagoroda_host &&
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
    if (parm_user_uuid_genesis_tree) {
        if (r_uuid.test(parm_user_uuid_genesis_tree)) {
            parm_depth = get_parm('depth') || 2;
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
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_tg_group_chat_id) {
        api_get_parms =
            '/api/getstats/user_connections_graph?fmt=3d-force-graph' +
            '&number=0' +
            '&tg_group_chat_id=' + parm_tg_group_chat_id;
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_user_uuid_genesis_tree) {
        api_get_parms =
            '/api/profile_genesis?uuid=' + parm_user_uuid_genesis_tree +
            '&fmt=3d-force-graph' +
            '&depth=' + parm_depth +
            '&up=' + parm_up +
            '&down=' + parm_down + '&new=on'
        ;
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_user_uuid_genesis_path) {
        document.title = 'Благо Рода: путь родства';
        api_get_parms =
            '/api/profile_genesis?uuid=' + parm_user_uuid_genesis_path + '&fmt=3d-force-graph&depth=' + parm_depth;
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_user_uuid_trust_path) {
        document.title = 'Благо Рода: путь доверий';
        api_get_parms =
            '/api/profile_trust?uuid=' + parm_user_uuid_trust_path + '&fmt=3d-force-graph&depth=' + parm_depth;
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_user_uuid_trusts) {
        api_get_parms =
            '/api/profile_graph?fmt=3d-force-graph&uuid=' + parm_user_uuid_trusts;
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_offer_uuid) {
        api_get_parms =
            '/api/offer/results/?offer_uuid=' + parm_offer_uuid;
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_tg_poll_id = '';
        parm_videoid = '';
    } else if (parm_tg_poll_id) {
        api_get_parms =
            '/api/bot/poll/results/?tg_poll_id=' + parm_tg_poll_id;
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_videoid = '';
    } else if (parm_videoid) {
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
        parm_tg_group_chat_id = '';
        parm_user_uuid_genesis_tree = '';
        parm_user_uuid_genesis_path = '';
        parm_user_uuid_trust_path = '';
        parm_user_uuid_trusts = '';
        parm_offer_uuid = '';
        parm_tg_poll_id = '';
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

    let data = null;
    let node_current = {};
    let last_click_node_time = 0;
    const menu__title_span = document.querySelector(".menu__title-span");
    const menu_wrapper = document.querySelector(".menu-wrapper");

    function is_double_clicked() {
        /*
            Если при тапе на узел задержал палец или на ПК нечаянно double click,
            а под узлом кнопка, то последующий тап (клик) приведет к срабатыванию
            кнопки, а это надо избежать.
            Функция вызывается в начале каждого обработчика клика на кнопку
        */
        const t = new Date().getTime();
        return t - last_click_node_time < 500;
    }

    function show_popup(node) {
        node_current = node;
        if (node.uuid) {
            menu__title_span.textContent =
                ('first_name_orig' in node) ? node.first_name_orig : node.first_name;
            menu_wrapper.classList.add("menu-wrapper--active");
            if (parm_user_uuid_genesis_tree) {
                const btn_collapse = document.querySelector(".btn--collapse");
                const btn_goto_gen = document.querySelector(".btn--goto-gen");
                const what = expand_collapse_sign(node);
                if (what == c_expanded || what == c_collapsed) {
                    document.querySelector(".btn--collapse--caption").textContent = 
                        node.collapsed ? 'Развернуть' : 'Свернуть';
                    btn_collapse.classList.remove("display--none");
                } else {
                    btn_collapse.classList.add("display--none");
                }
                btn_goto_gen.classList.remove("display--none")
                const add_relatives_br = document.querySelector(".add--relatives-br");
                const btn_parents = document.querySelector(".btn--parents");
                const btn_child = document.querySelector(".btn--child");
                const btn_brosis = document.querySelector(".btn--brosis");
                add_relatives_br.classList.add("display--none");
                btn_parents.classList.add("display--none");
                btn_child.classList.add("display--none");
                btn_brosis.classList.add("display--none");
                if (node.is_my) {
                    let his_her = 'Его (её)';
                    let show_brosis = false;
                    if (node.gender) { his_her = (node.gender == 'm') ? 'Его' : 'Её'; }
                    document.querySelector(".his-her-span").textContent = his_her;
                    add_relatives_br.classList.remove("display--none");
                    if ('parents' in node) {
                        let btn_parents_caption = '';
                        if (!node.parents.father && node.parents.mother) {
                            btn_parents_caption = 'Папа';
                            show_brosis = true;
                        } else if (node.parents.father && !node.parents.mother) {
                            btn_parents_caption = 'Мама';
                            show_brosis = true;
                        } else if (!node.parents.father && !node.parents.mother) {
                            btn_parents_caption = 'Папа/Мама';
                        } else /* if (node.parents.father && node.parents.mother) */ {
                            show_brosis = true;
                        }
                        if (btn_parents_caption) {
                            document.querySelector(".btn--parents--caption").textContent = btn_parents_caption;
                            btn_parents.classList.remove("display--none");
                        }
                        if (show_brosis) {
                            btn_brosis.classList.remove("display--none");
                        }
                    }
                    if (node.gender) {
                        btn_child.classList.remove("display--none");
                    }
                }
            } else if (parm_user_uuid_trusts || is_blagoroda_host) {
                const btn_trust_wrap = document.querySelector(".btn--trust--wrap");
                if (auth_data && auth_data.user_uuid != node.uuid) {
                    btn_trust_wrap.classList.remove("display--none");
                } else {
                    btn_trust_wrap.classList.add("display--none");
                }
                const btn_goto_trust_wrap = document.querySelector(".btn--goto-trust--wrap");
                btn_goto_trust_wrap.classList.remove("display--none");
            }
        }
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
        .onNodeClick(async function(node) {
            last_click_node_time = new Date().getTime();
            node_current = node;
            // if (parm_user_uuid_genesis_tree) {
            //     if (node.is_my) {
            //         show_popup(node);
            //     } else {
            //         await collapse_expand(node);
            //     }
            // } else {
                show_popup(node);
            // }
        })
        .onNodeRightClick(function(node) {
            node_current = node;
            show_popup(node);
        })
        .linkDirectionalArrowLength(10)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowColor(link => link_color(link, 'rgba'))
    ;
    if (!parm_user_uuid_genesis_tree) {
        Graph.d3Force('link').distance(195);
    }

    async function collapse_expand(node) {
        if (!node) return;
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
                                auth_token: auth_data ? auth_data.auth_token : null,
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
                                        nodes_by_id[id].parents = node_.parents;
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

    async function make_trust_operation(operation) {
        menu_wrapper.classList.remove("menu-wrapper--active");
        if (!(operation in trust_operations)) return;
        const d_op = trust_operations[operation];
        if (!auth_data && node_current.uuid && data.bot_username) {
            window.location.href =
                `https://t.me/${data.bot_username}?start=${d_op.start_prefix}-${node_current.uuid}`;
            return;
        }
        if (auth_data && node_current.uuid && auth_data.user_uuid != node_current.uuid) {
            graph_container.style.cursor = 'wait';
            const api_response = await api_request(
                api_url + '/api/addoperation', {
                    method: 'POST',
                    auth_token: auth_data.auth_token,
                    json: {
                        operation_type_id: d_op.op,
                        user_id_from: auth_data.user_uuid,
                        user_id_to: node_current.uuid,
                    }
                }
            );
            if (api_response.ok) {
                // Найти связи, идущие от авторизованного и выполнить необходимое
                let i_found = -1;
                for (let i = 0; i < data.links.length; i++) {
                    const link = data.links[i];
                    const source_id = ((typeof link.source) === 'object') ? link.source.id : link.source;
                    const target_id = ((typeof link.target) === 'object') ? link.target.id : link.target;
                    if (source_id != auth_data.user_id || target_id != node_current.id) continue;
                    if (operation == 'trust_and_thank') {
                        link.thanks_count = api_response.data.currentstate.thanks_count;
                        link.is_trust = true;
                    } else if (operation == 'mistrust') {
                        link.is_trust = false;
                    } else if (operation == 'nullify_trust') {
                        link.is_trust = null;
                    }
                    i_found = i;
                    break;
                }
                if (i_found == -1 && operation != 'nullify_trust') {
                    // не найден link
                    // учет nullify_trust здесь: fool-proof
                    data.links.push({
                        source: auth_data.user_id,
                        target: node_current.id,
                        is_trust: !(operation == 'mistrust'),
                    });
                } else {
                    // найден link. Если забываем, но есть родственная связь,
                    // то не надо удалять связь.
                    if (operation == 'nullify_trust' && !link.is_child) {
                        data.links.splice(i_found, 1);
                    }
                }
                Graph.graphData(data);
                graph_container.style.cursor = null;
            } else {
                graph_container.style.cursor = null;
                alert('Ошибка доступа к системе')
            }
        }
    }

    document.querySelector(".menu__close-wrap").addEventListener("click", function() {
        menu_wrapper.classList.remove("menu-wrapper--active")
    });
    document.querySelector(".btn--profile").addEventListener("click", function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        if (node_current.uuid && data.bot_username) {
            window.location.href = "https://t.me/" + data.bot_username + '?start=' + node_current.uuid;
        }
    });
    document.querySelector(".btn--trust").addEventListener("click", async function() {
        if (is_double_clicked()) return;
        await make_trust_operation('trust_and_thank');
    });
    document.querySelector(".btn--collapse").addEventListener("click", async function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        await collapse_expand(node_current);
    });
    document.querySelector(".btn--goto-trust").addEventListener("click", function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        if (node_current.uuid) {
            window.location.href = `${get_graph_url()}?${parm_user_uuid_trusts_name}=${node_current.uuid}`;
        }
    });
    document.querySelector(".btn--goto-gen").addEventListener("click", function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        if (node_current.uuid) {
            window.location.href =
                `${url_path()}?${parm_user_uuid_genesis_name}=${node_current.uuid}` +
                '&up=on&down=on&depth=2';
        }
    });

    document.querySelector(".btn--parents").addEventListener("click", function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        const node = node_current;
        if (node.parents.father && node.parents.mother) return;
        $('#id_caption_relative_m').html('Папа');
        $('#id_caption_relative_f').html('Мама');
        let whom = 'родитель';
        if (node.parents.father && !node.parents.mother) {
            whom = 'мама';
            $('#id_p_relative_m').css("display", "none");
            $('#id_p_relative_f').css("display", "block");
            $("input:radio[name=parent_gender][value='f']").prop('checked',true);
        } else if (!node.parents.father && node.parents.mother) {
            whom = 'папа';
            $('#id_p_relative_f').css("display", "none");
            $('#id_p_relative_m').css("display", "block");
            $("input:radio[name=parent_gender][value='m']").prop('checked',true);
        } else /* if (!node.parents.father && !node.parents.mother) */{
            $('#id_p_relative_f').css("display", "block");
            $('#id_p_relative_m').css("display", "block");
            $("input:radio[name=parent_gender][value='m']").prop('checked',true);
        }
        $('#id_form_parent_caption').html(
            `Создать <big style="color:red;">новый</big> профиль: ${whom} для <span style="color:blue;">${node.first_name_orig}<span/>`
        );
        $('input[name=parent_name]').val('');
        $('input[name=parent_what]').val('parent');
        $("#id_form_parent_btn_ok").attr('disabled', true);
        $('#id_form_parent_wrap').css("display", "block");
    });

    document.querySelector(".btn--child").addEventListener("click", function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        const node = node_current;
        $('#id_caption_relative_m').html('Сын');
        $('#id_caption_relative_f').html('Дочь');
        $('#id_p_relative_m').css("display", "block");
        $('#id_p_relative_f').css("display", "block");
        $("input:radio[name=parent_gender][value='m']").prop('checked',true);
        $('#id_form_parent_caption').html(
            `Создать <big style="color:red;">новый</big> профиль: сын или дочь для <span style="color:blue;">${node.first_name_orig}<span/>`
        );
        $('input[name=parent_name]').val('');
        $('input[name=parent_what]').val('child');
        $("#id_form_parent_btn_ok").attr('disabled', true);
        $('#id_form_parent_wrap').css("display", "block");
    });

    document.querySelector(".btn--brosis").addEventListener("click", function() {
        if (is_double_clicked()) return;
        menu_wrapper.classList.remove("menu-wrapper--active");
        const node = node_current;
        if (!('parents' in node)) return;
        $('#id_caption_relative_m').html('Брат');
        $('#id_caption_relative_f').html('Сестра');
        if (!node.parents.father && !node.parents.mother) return;
        $('#id_p_relative_f').css("display", "block");
        $('#id_p_relative_m').css("display", "block");
        $("input:radio[name=parent_gender][value='m']").prop('checked',true);
        $('#id_form_parent_caption').html(
            `Создать <big style="color:red;">новый</big> профиль: Брат или сестра для <span style="color:blue;">${node.first_name_orig}<span/>`
        );
        $('input[name=parent_name]').val('');
        $('input[name=parent_what]').val('brosis');
        $("#id_form_parent_btn_ok").attr('disabled', true);
        $('#id_form_parent_wrap').css("display", "block");
    });

    $('.f-modal-close').click(function() {
        $('#id_form_parent_wrap').css("display", "none");
    });

    $('#id_form_parent_btn_cancel').click(function() {
        $('#id_form_parent_wrap').css("display", "none");
    });


    $('#id_form_parent_btn_ok').click(async function() {
        if (!auth_data) return;
        const node = node_current;
        const first_name = $('input[name=parent_name]').val().trim();
        if (first_name.length < 5) return;
        const what =  $('input[name=parent_what]').val();
        const gender =  $('input[name=parent_gender]:checked').val();

        let link_id = node.id;
        let link_relation;
        if  (what == 'parent' && gender == 'm') {
            link_relation = 'new_is_father';
        } else if (what == 'parent' && gender == 'f') {
            link_relation = 'new_is_mother';
        } else if (what == 'child' && !node.gender) {
            alert(`${node.first_name}: Не задан пол!`);
            return;
        } else if (what == 'child' && node.gender == 'm') {
            link_relation = 'link_is_father';
        } else if (what == 'child' && node.gender == 'f') {
            link_relation = 'link_is_mother';
        } else if (what == 'brosis') {
            if (node.parents.father && node.parents.mother) {
                link_id = node.parents.father;
                link_relation = 'link_is_father';
                // маму потОм!
            } else if (!node.parents.father && node.parents.mother) {
                link_id = node.parents.mother;
                link_relation = 'link_is_mother';
            }  else if (node.parents.father && !node.parents.mother) {
                link_id = node.parents.father;
                link_relation = 'link_is_father';
            }
        }
        if (!link_relation) {
            alert("Ошибка! Какой-то вариант родственной связи не учтён. Ивините.");
            return;
        }
        for (const id in nodes_by_id) {
            if (nodes_by_id[id].first_name_orig.toLowerCase() == first_name.toLowerCase()) {
                alert("Есть уже человек с таким ФИО в родственном дереве. Вы наверняка ошиблись!");
                return;
            }
        }
        graph_container.style.cursor = 'wait';
        const url = new URL(api_url + '/api/profile');
        url.searchParams.set('uuid_owner', auth_data.user_uuid);
        url.searchParams.set('name_iexact', first_name);
        let api_response = await api_request(url, {auth_token: auth_data.auth_token});
        if (api_response.ok  && api_response.data.length) {
            graph_container.style.cursor = null;
            alert("Есть уже человек с таким ФИО среди Ваших собственных профилей. Вы наверняка ошиблись!");
            return;
        }
        api_response = await api_request(api_url + '/api/profile/', {
            method: 'POST',
            auth_token: auth_data.auth_token,
            form_data: {
                first_name: first_name,
                link_relation: link_relation,
                link_id: link_id,
                gender: gender,
        }});
        if (api_alert(api_response)) {
            graph_container.style.cursor = null;
            return;
        }
        const new_relative_uuid = api_response.data.uuid;
        if (what == 'brosis' && node.parents.father && node.parents.mother) {
            api_response = await api_request(api_url + '/api/addoperation/', {
                method: 'POST',
                auth_token: auth_data.auth_token,
                json: {
                    operation_type_id: genesis_operations.set_mother.op,
                    user_id_from: new_relative_uuid,
                    user_id_to: node.parents.mother,
            }});
        }
        if (api_alert(api_response, 'Ошибка. Профиль создан, задан его папа, а с мамой возникла проблема')) {
            graph_container.style.cursor = null;
            return;
        }
        graph_container.style.cursor = null;
        $('#id_form_parent_wrap').css("display", "none");

        // Идем на нового родственника. Если это брат, то надо не только прямое дерево
        const up_down = (what == 'brosis') ? '' : 'on'
        window.location.href =
            `${url_path()}?${parm_user_uuid_genesis_name}=${new_relative_uuid}` +
            `&up=${up_down}&down=${up_down}&depth=2`;
    });

    $('#id_parent_name').on('input', function() {
        $("#id_form_parent_btn_ok").attr('disabled', $(this).val().trim().length < 5)
    });

    const api_response = await api_request(
        api_url + api_get_parms,
        {auth_token: auth_data ? auth_data.auth_token : null}
    );
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
            if (
                parm_user_uuid_trusts && auth_data && data.root_node &&
                data.root_node.uuid != auth_data.user_uuid
               ) {
                const node = data.root_node
                /*
                // Попытка фокусировки
                //
                const distance = 40;
                const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

                const newPos = node.x || node.y || node.z
                    ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
                    : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

                Graph.cameraPosition(
                    newPos, // new position
                    node, // lookAt ({ x, y, z })
                    3000  // ms transition duration
                );
                */
                show_popup(node);
            }
        }
    }
// ----------    
})();

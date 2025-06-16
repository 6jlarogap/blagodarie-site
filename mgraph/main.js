//
//  mgraph/main.js
//
//  доверия и т.п. для участников игры знакомств

// Доступ к странице может быть авторизован, см. public/js/funcs.js:check_auth()
//
// Возможные параметры (?параметр1=...&параметр2= ...), в порядке их рассмотрения
// (если задан параметр выше, то идущие ниже вслед за ним игнорируются):
//
//  user_trusts=<short_id>
//                      Все связи доверия от пользователя с <short_id>,
//                      а также связи доверия тех, кто ему (ей) доверял или не доверял
//
//  без параметров
//                      показ всех связей доверия и т.п. между участниками игры
//                  Параметры такой страницы:
//      f               (from). Начало выборки, по умолчанию 0
//      q               (quantity). Сколько выбирать на странице, по умолчанию всё после f.
//
//  Если не задан ни один из перечисленных выше параметров,
//  в том числе если в url нет параметров, то это соответствует вызову с
//      &f=0&q=25
//

import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import ForceGraph3D from '3d-force-graph';

(async function() {
// ----------    

    // Параметр: требуется ли авторизация
    //
    const auth_data = await check_auth(true);
    if (!auth_data) return;

    const trust_operations = {
        trust: { op: 3, start_prefix: 't' },
        thank: { op: 1, start_prefix: 'th' }
    }
    const paginate_users_count = 100;

    let parm_f = parseInt(get_parm('f'));
    let parm_q = parseInt(get_parm('q'));

    const parm_user_trusts_name = 'user_trusts';
    let parm_user_trusts = get_parm(parm_user_trusts_name);

    const api_url = get_api_url();
    let api_get_parms;
    if (parm_user_trusts) {
        api_get_parms =
            '/api/meetgamers/?id=' + parm_user_trusts;
    } else if (!isNaN(parm_f) || !isNaN(parm_q)) {
        api_get_parms = '/api/meetgamers';
        if (!isNaN(parm_f)) {
            if (parm_f < 0) parm_f = Math.abs(parm_f);
        } else {
            parm_f = 0;
        }
        api_get_parms += '?from=' + parm_f;
        if (!isNaN(parm_q)) {
            if (parm_q < 0) parm_q = Math.abs(parm_q);
        } else {
            parm_q = paginate_users_count;
        }
        api_get_parms += '&number=' + parm_q;
    } else {
        window.location.assign(url_path() + '?f=0&q=' + paginate_users_count);
        return;
    }

    let node_current = {};
    let last_click_node_time = 0;

    const graph_container = $('#3d-graph')[0];
    let data = null;

    const api_images = `${api_url}/media/images`;
    const photoTextureMale = new THREE.TextureLoader().load(`${api_images}/no-photo-gender-male.jpg`);
    const photoTextureFemale = new THREE.TextureLoader().load(`${api_images}/no-photo-gender-female.jpg`);
    const photoTextureNone = new THREE.TextureLoader().load(`${api_images}/no-photo-gender-none.jpg`);

    const node_draw = (node) => {
        let photoTexture;
        if (node.photo) {
            photoTexture = new THREE.TextureLoader().load(node.photo);
        // фото должно быть здесь всегда. Но fool-proof:
        } else if (node.gender == 'm') {
            photoTexture = photoTextureMale;
        } else if (node.gender == 'f') {
            photoTexture = photoTextureFemale;
        } else {
            photoTexture = photoTextureNone;
        }
        const material = new THREE.SpriteMaterial({ map: photoTexture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(25, 25);

        const label = new SpriteText();
        label.text = node.first_name;
        label.textHeight = 0.2;
        label.color = 'rgba(139, 0, 0, 0.8)'
        sprite.add(label)
        sprite.center.set(0.5, -0.1);
        return sprite;
    };

    const node_text_color = (node) => {
        return '#8B0000';
    };

    const attitudes = {
        acq: 'a',       // знаком
        trust: 't',     // доверяет
        mistrust: 'mt'  // не доверяет
    };

    const link_color = (link) => {
        // Какой-то результат по умолчанию:
        //
        let result = 'blue';

        const color_acq = '#cca300';
        const color_trust = 'green';
        const color_not_trust = 'red';
        const color_invite_meet = 'blueviolet';
        const color_hide_meet = 'black';
        if (link.attitude) {
            if (link.attitude == attitudes.acq) {
                result = color_acq;
            } else if (link.attitude == attitudes.trust) {
                result = color_trust;
            } else if (link.attitude == attitudes.mistrust) {
                result = color_not_trust;
            }
        } else if (link.is_invite_meet) {
            result = color_invite_meet;
        } else if (link.is_sympa) {
            result = 'darkorange';
        } else if (link.is_hide_meet) {
            result = color_hide_meet;
        }
        return result;
    }

    const link_curvature = (link) => {
        // Какой-то результат по умолчанию:
        //
        let result = 0.1;

        if (link.attitude) {
            result = 0.3;
        } else if (link.is_invite_meet) {
            result = 0.5;
        } else if (link.is_sympa) {
            result = 0.7;
        } else if (link.is_hide_meet) {
            result = 0.9;
        }
        return result;
    };

    let Graph = ForceGraph3D()
        .nodeThreeObject(node => node_draw(node))
        .linkColor(link => link_color(link))
        .linkOpacity(0.8)
        .linkCurvature(link => link_curvature(link))

        .onNodeClick(async function(node) {
            last_click_node_time = new Date().getTime();
            node_current = node;
            await show_popup(node);
        })
        .onNodeRightClick(async function(node) {
            node_current = node;
            await show_popup(node);
        })
        
        .backgroundColor("#FFFFFF")
        .nodeLabel(node => `<span style="color: ${node_text_color(node)}">${node.first_name}</span>`)
        .linkDirectionalArrowLength(10)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowColor('#000000')
        .height(window.innerHeight * 0.7 )
    ;
    Graph.d3Force('link').distance(195);

    const api_response = await api_request(
        api_url + api_get_parms,
        {auth_token: auth_data ? auth_data.auth_token : null}
    );
    if (api_response.ok) {
        data = api_response.data;
        if (parm_user_trusts && data.root_node) {
            document.title = `${data.root_node.first_name}, доверия и знакомства`;
        }
        Graph = Graph(graph_container);
        Graph.graphData(data);
        if (
            parm_user_trusts && data.root_node &&
            (auth_data && data.root_node.uuid != auth_data.user_uuid || !auth_data)
            ) {
            const node = data.root_node
            await show_popup(node);
        }
    }
    $('#graph_legend').show();

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

    async function show_popup(node) {
        const menu__btns = document.querySelector(".menu__btns");
        menu__btns.classList.remove('text-align--center');
        node_current = node;
        if (node.uuid) {
            document.querySelector(".menu__title-span").textContent =
                ('first_name_orig' in node) ? node.first_name_orig : node.first_name;
            document.querySelector(".menu-wrapper").classList.add("menu-wrapper--active");
            menu__btns.classList.add('text-align--center');
            const buttons = [];
            const btn_trust_wrap = document.querySelector(".btn--trust--wrap");
            const btn_trust_caption = document.querySelector(".btn--trust--caption");
            if (!auth_data || auth_data && auth_data.user_uuid != node.uuid) {
                btn_trust_caption.innerHTML = '&nbsp;&nbsp;Доверие&nbsp;&nbsp;';
                $('input[name=trust-or-thank]').val('trust');
                if (auth_data) {
                    // Доверяю или уже благодарю
                    const api_response = await api_request(
                        api_url + '/api/user/relations/', {
                            method: 'GET',
                            auth_token: auth_data.auth_token,
                            params: {
                                user_id_from: auth_data.user_uuid,
                                user_id_to: node.uuid,
                            }
                        }
                    );
                    if (api_response.ok && api_response.data.from_to.attitude == attitudes.trust) {
                        btn_trust_caption.innerHTML = 'Благодарю';
                        $('input[name=trust-or-thank]').val('thank');
                    }
                }
                btn_trust_wrap.classList.remove("display--none");
                buttons.push('#id_btn_trust');
            } else {
                btn_trust_wrap.classList.add("display--none");
            }
            document.querySelector(".btn--goto-trust--wrap").classList.remove("display--none");
            buttons.push('#id_btn_trust_goto');
            // Если это внизу делать, то будет красиво, все кнопки
            // одной ширины. Но раз установив css('width'), как его
            // сбросить, проблема, а после Доверие Благодарить не влезает.
            // Посему &nbsp; в заголоке Доверие и слово Благодарю, а не Благодарить
            //
            let max_width = 0;
            for (const id of buttons) {
                let width = $(id).css('width');
                width = parseFloat(width.replace('px', ''));
                if (isNaN(width)) { max_width = 0; break}
                if (width > max_width) max_width = width;
            }
            if (max_width) {
                for (const id of buttons) $(id).css('width', max_width);
            }
        }
    }

    async function make_trust_operation() {
        document.querySelector(".menu-wrapper").classList.remove("menu-wrapper--active");
        const operation = $('input[name=trust-or-thank]').val();
        if (!(operation in trust_operations)) return;
        const d_op = trust_operations[operation];
        if (!auth_data && node_current.uuid && data.bot_username) {
            window.location.href =
                `https://t.me/${data.bot_username}?start=${d_op.start_prefix}-${node_current.username}`;
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
            if (
                api_response.ok ||
                api_response.status == 400 && api_response.data.code && api_response.data.code == 'already'
            ) {
                // Найти связи, идущие от авторизованного и выполнить необходимое
                let i_found = -1;
                for (let i = 0; i < data.links.length; i++) {
                    const link = data.links[i];
                    const source_id = ((typeof link.source) === 'object') ? link.source.id : link.source;
                    const target_id = ((typeof link.target) === 'object') ? link.target.id : link.target;
                    if (source_id != auth_data.user_id || target_id != node_current.id) continue;
                    if (operation == 'trust') {
                        link.attitude = attitudes.trust;
                    } else if (operation == 'thank') {
                        link.thanks_count = api_response.data.currentstate.thanks_count;
                    }
                    i_found = i;
                    break;
                }
                if (i_found == -1) {
                    // не найден link
                    data.links.push({
                        source: auth_data.user_id,
                        target: node_current.id,
                        // може получить !ok && status == 400 && already только по операции trust
                        attitude: api_response.ok ? api_response.data.currentstate.attitude : attitudes.trust,
                    });
                } else {
                    // найден link. Был знаком, стало доверие?
                    if (operation == 'trust') {
                        data.links[i_found].attitude = attitudes.trust;
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
        document.querySelector(".menu-wrapper").classList.remove("menu-wrapper--active")
    });
    document.querySelector(".btn--trust").addEventListener("click", async function() {
        if (is_double_clicked()) return;
        await make_trust_operation();
    });
    document.querySelector(".btn--goto-trust").addEventListener("click", function() {
        if (is_double_clicked()) return;
        document.querySelector(".menu-wrapper").classList.remove("menu-wrapper--active");
        if (node_current.username) {
            window.location.href = `${url_path()}?${parm_user_trusts_name}=${node_current.username}`;
        }
    });

// ----------    
})();

function get_api_url_() {
    if (typeof __API_URL__ === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return __API_URL__;
    }
}

function get_parm(parm) {

    // Получить get parameter
    // Если не было в строке parm=, возвращаем null
    // если было, то или '', или то что было

    var result = null;
    const got_parm = document.URL.match(new RegExp("[\\?\\&]" + parm + "\\=([A-Za-z_0-9\\-]+)?", "i"));
    if (got_parm) {
        result = got_parm[1] || '';
        if (result.match(/^\&/)) {
            result = '';
        }
    }    return result;
}

var parm_rod = '';
var parm_tg_poll_id = '';

function main_() {

    // Один и тот же код для 2 вариантов имени сайта:
    //      - сайт начинается с 'group.', например, group.org.com,
    //          учитывается параметр tg_group_chat_id.
    //          Если его нет, будет пустота, т.е. в апи отправляется
    //          запрос по заведомо несуществующей группе.
    //          Если в параметре tg_group_chat_id будет чушь,
    //          то апи вернет пустоту
    //      - любые другие имена сайта:
    //          учитываются параметры rod, dover, withalone

    const is_group_site = window.location.host.match(/^group\./);

    if (!document.URL.match(/\?/)) {
        window.location.assign(
            document.URL +
                (is_group_site ? '?tg_group_chat_id=0' : '?rod=on&dover=&withalone=')
        );
    }
    var parm_dover, parm_withalone, parm_tg_group_chat_id;
    if (is_group_site) {
        parm_tg_group_chat_id = get_parm('tg_group_chat_id') || '?tg_group_chat_id=0';
    } else {
        parm_tg_poll_id = get_parm('tg_poll_id') || '';
        if (!parm_tg_poll_id) {
            parm_rod = get_parm('rod') || '';
            parm_dover = get_parm('dover') || '';
            parm_withalone = get_parm('withalone') || '';
        }
    }
    const api_url = get_api_url_();
    var api_get_parms;
    if (parm_tg_poll_id) {
        api_get_parms =
            '/api/bot/poll/results/?tg_poll_id=' + parm_tg_poll_id;
    } else if (is_group_site) {
        api_get_parms =
            '/api/getstats/user_connections_graph?fmt=3d-force-graph' +
            '&number=0' +
            '&tg_group_chat_id=' + parm_tg_group_chat_id;
    } else {
        api_get_parms =
            '/api/profile_genesis/all?fmt=3d-force-graph' +
            '&withalone=' + parm_withalone +
            '&dover=' + parm_dover +
            '&rod=' + parm_rod;
    }
    $.ajax({
        url: api_url  + api_get_parms,
        dataType: 'json',
        success: function(data) {
            if (parm_tg_poll_id && data.question) {
                document.title = 'Опрос: ' + data.question;
            }
            const photoTextureUnknown = new THREE.TextureLoader().load(`./images/star.jpeg`);
            const Graph = ForceGraph3D()
            (document.getElementById('3d-graph'))
            .nodeThreeObject(({ id, photo }) => {
                var photoTexture;
                if (photo == 'poll-answer') {
                    photoTexture = new THREE.TextureLoader().load('./images/poll-answers/poll-answer_' + (Math.abs(id).toString()) + '.png');
                }
                else if (photo) {
                    photoTexture = new THREE.TextureLoader().load(photo);
                } else {
                    photoTexture = photoTextureUnknown;
                }
                const material = new THREE.SpriteMaterial({ map: photoTexture });
                const sprite = new THREE.Sprite(material);
                sprite.scale.set(25, 25);
                return sprite;
            })
            .graphData(data)
            // Если есть и родственная связь, и доверие, и если задано
            // искать родственные связи, то показываем стрелку цвета родственной связи
            .linkColor(link => (link.is_poll || link.is_child && parm_rod) ? '#ffe8e8' : '#366b0d' )
            .linkOpacity(0.8)
            .linkCurvature(0.25)
            .nodeLabel(node => `${node.first_name}`)
            .linkDirectionalArrowLength(10)
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalArrowColor(
                link => (link.is_poll || link.is_child && parm_rod) ? 'rgba(255, 232, 232, 0.8)' : 'rgba(54, 107, 13, 0.8)'
            );
            if (!parm_tg_poll_id) {
                Graph.d3Force('charge').strength(-320);
            }
        }
    });
}

$(function() {
    main_();
});

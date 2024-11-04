//
//  map/js/base.js
//

// Карта участников

// Доступ к странице может быть авторизован, см. funcs.js:check_auth()
//
// Возможные параметры в порядке их рассмотрения:
//
//  chat_id                 Карта участников телеграм чата chat_id
//
//  offer_id                Карта участников, ответивших на опрос типа оффер
//
//  chat_id                 Карта участников телеграм чата chat_id
//
//  uuid_trustees           Карта участников, в которой юзер с uuid=uuid_trustees,
//                          а также кто ему (ей) доверяет или не доверяет
//
//  videoid                 На карте кто какие лайки ставил на видео с videoid
//      При этом возможны еще параметры:
//          source          источник видео, по умолчанию 'yt' (Youtube)
//          f               с такой секунды видео начинать
//          t               по какую секунду видео показывать
//
//  uuid                    Где на карте юзер с uuid=uuid
//      При этом возможны еще параметры:
//          participants=on|(пусто) еще показать других активных участников
//          owned=on|(пусто)        еще показать других неактивных участников
//
//  participants=on|(пусто) Показать активных участников
//
//  owned=on|(пусто)        Показать неактивных участников
//
//  без параметров          переход к странице с параметром ?participants=on

$(document).ready (async () => {

    let chat_id = '';
    let offer_id = '';
    let offer_on = '';
    let uuid = '';
    let uuid_trustees = '';
    let participants = '';
    let owned = '';
    let videoid = '';
    let meet = '';
    let with_offers = '';
    let sel_older_prev, sel_younger_prev;
    let map = null;
    const meet_subtitle = `<a href="${document.URL}"><big>Участники игры знакомств</big></a>`
    let Graph = null;
    const graph_container = $('#3d-graph')[0];

    let auth_data = await check_auth();

    const api_url = get_api_url();
    const api_get_parms = {};
    if (chat_id = get_parm('chat_id')) {
        $('#id_block_form').hide();
        api_get_parms.chat_id = chat_id;
    } else if (meet = get_parm('meet')) {
        $('#id_block_form').hide();
        $('#id_gender,#id_older,#id_younger').each(function() {
            $(this).val('');
        });
        $('#id_with_offers').prop('checked', true);
        sel_older_prev = '';
        sel_younger_prev = '';
        $('#id_meet_filters').show();
        $('#graph_legend').show();
        $('.horz_bar').show();
        api_get_parms.meet = 'on';
        api_get_parms.with_offers = get_parm('with_offers') ? 'on' : ''; 
        if (!api_get_parms.with_offers) {
            api_get_parms.with_offers = $('#id_with_offers').prop('checked') ? 'on' : ''
        }
    } else if (offer_id = get_parm('offer_id')) {
        $('#id_block_form').hide();
        api_get_parms.offer_id = offer_id;
    } else if (offer_on = get_parm('offer')) {
        $('#id_block_form').hide();
        api_get_parms.offer = 'on';
    } else if (uuid_trustees = get_parm('uuid_trustees')) {
        $('#id_block_form').hide();
        api_get_parms.uuid_trustees = uuid_trustees;
    } else if (videoid = get_parm('videoid')) {
        $('#id_block_form').hide();
        let source = get_parm('source') || 'yt';
        api_get_parms.videoid = videoid;
        api_get_parms.source =source;
        let parm_from = get_parm('f');
        if (parm_from) {
            api_get_parms.from = parm_from;
        }
        let parm_to = get_parm('t');
        if (parm_to) {
            api_get_parms.to = parm_to;
        }
    } else {
        $('#id_block_form').show();
        if (uuid = get_parm('uuid')) {
            api_get_parms.uuid = uuid;
            $('input[name=uuid]').val(uuid);
        } else {
            $('input[name=uuid]').remove();
        }
    }
    if (!chat_id && !offer_id & !videoid & !uuid_trustees & !meet & !offer_on) {
        // uuid или без uuid
        if (participants = get_parm('participants')) {
            $('#id_participants').attr('checked', 'checked');
            api_get_parms.participants = 'on';
        }
        if (owned = get_parm('owned')) {
            $('#id_owned').attr('checked', 'checked');
            api_get_parms.owned = 'on';
        }
        if (!document.URL.match(/\?/)) {
            window.location.assign(document.URL + '?participants=on');
        }
    }

    const markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
    const fill_markerList = (points) => {
        const markerList = [];
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            let marker = L.marker(L.latLng(point.latitude, point.longitude), { title: point.title });
            marker.setIcon(L.icon({
                iconUrl: point.icon,
                iconSize: [point.size_icon, point.size_icon],
                iconAnchor: [point.size_icon/2, point.size_icon/2],
                // is_of_found_user: это
                //  или пользователь, которого искали
                //  или владелец опроса
                className: point.is_of_found_user ? '' : 'photo-in-circle'
            }));
            marker.bindPopup(point.popup, {maxHeight: 300});
            markerList.push(marker);
        }
        return markerList;
    }

    const api_response = await api_request(
        api_url + '/api/user/points/', {
            method: 'GET',
            auth_token: auth_data ? auth_data.auth_token : null,
            params: api_get_parms,
        }
    );

    if (api_response.ok) {
        const data = api_response.data;
        let num_men = '';
        let title_base = 'Благорода. Карта';
        if (uuid) {
            if (data.first_name) {
                document.title = title_base + ': ' + data.first_name;
                $('#id_subtitle_').html('<h2><a href="' + document.URL + '">' + data.first_name + '</a></h2>');
                if (data.found_coordinates) {
                    if (data.address) {
                        $('#id_address_').html('<big>' + data.address + '</big><br />');
                    } else {
                        $('#id_address_').html('<h3>на карте</h3>');
                    }
                } else {
                    $('#id_address_').html('<h3>(Не задал(а) местоположение. Показаны другие, если выбраны)</h3>');
                }
            } else {
                $('#id_subtitle_').html('<h2>Пользователь не найден</h2>');
                $('#id_address_').html('<h3>(Показаны другие, если выбраны)</h3>');
            }
            $('#id_showed_also').html(
                '<b>Также другие, их ' +
                (data.points.length - (data.found_coordinates ? 1 : 0)) +
                ':</b>&nbsp;'
            )
        } else if (chat_id) {
            let subtitle = '';
            num_men = '(указавших место: ' + data.points.length +  ')';
            if (data.chat_title) {
                document.title =
                    data.chat_title + ': карта участников ' +
                    (data.chat_type == 'channel' ? 'канала' : 'группы') +
                    ', благо Рода'
                ;
                subtitle =
                    '<h2>Участники телеграм ' +
                    (data.chat_type == 'channel' ? 'канала' : 'группы') +
                        ' ' + num_men +
                    '</h2>' +
                    '<h2><a href="' + document.URL + '">' + data.chat_title + '</a></h2>'
                ;
            } else {
                subtitle = '<h2><big>Телеграм канал или группа не найден(а)</big></h2>';
            }
            $('#id_subtitle_').html(subtitle);
        } else if (offer_id) {
            document.title = title_base + '. Опрос' + (data.offer_question ? ': ' + data.offer_question : '');
            let subtitle = '';
            num_men = '(указавших место: ' + data.points.length +  ')';
            if (data.offer_question) {
                subtitle =
                    '<h2>Участники опроса' +
                        ' ' + num_men +
                    '</h2>' +
                    '<h2>' +
                    '<a href="' + (data.offer_deeplink ? data.offer_deeplink : document.URL) + '">'
                    + data.offer_question + '</a>' +
                    '</h2>';
            } else {
                subtitle = '<h2><big>Опрос не найден</big></h2>';
            }
            $('#id_subtitle_').html(subtitle);

        } else if (videoid) {
            document.title = title_base + '. Голосование по видео';
            let subtitle = data.video_title ? data.video_title : 'Голосовашие по видео';
            $('#id_subtitle_').html('<h2>' + subtitle + '</h2>')

        } else if (uuid_trustees) {
            if (data.first_name) {
                document.title = title_base + '. Доверия к: ' + data.first_name;
                $('#id_subtitle_').html(
                        '<h3>' +
                            '<big>' +
                                '<a href="' + document.URL + '">' + data.first_name + '</a> '+
                            '</big>' +
                            (
                                data.num_attitude_trust || data.num_attitude_mistrust || data.num_attitude_acq
                                ?
                                    ' (' +
                                        '<i>' +
                                            (
                                                data.num_attitude_trust
                                                    ?   'доверяют: ' + data.num_attitude_trust +
                                                        (data.num_attitude_mistrust || data.num_attitude_acq ? ', ' : '')
                                                    : ''
                                            ) +
                                            (
                                                data.num_attitude_mistrust
                                                    ?   'не доверяют: ' + data.num_attitude_mistrust +
                                                        (data.num_attitude_acq ? ', ' : '')
                                                    : ''
                                            ) +
                                            (data.num_attitude_acq ? 'знакомы: ' + data.num_attitude_acq : '') +
                                        '</i>' +
                                    ')'
                                : ''
                            ) +
                        '</h3>'
                );
                if (data.found_coordinates) {
                    if (data.address) {
                        $('#id_address_').html('<big>' + data.address + '</big><br />');
                    } else {
                        $('#id_address_').html('<h3>на карте</h3>');
                    }
                } else {
                    $('#id_address_').html('<h3>(Не задал(а) местоположение)</h3>');
                }
            } else {
                $('#id_subtitle_').html('<h2>Пользователь не найден</h2>');
            }

        } else if (meet) {
            document.title = 'Участники игры знакомств';
            num_men = '(' + data.num_all;
            if (data.num_all != data.points.length) {
                num_men += `, указавших место: ${data.points.length}`
            }
            num_men += ')';
            $('#id_subtitle_').html(`<h3>${meet_subtitle} ${num_men}</h3>`);
        } else if (offer_on) {
            document.title = 'Карта предложений';
            $('#id_subtitle_').html(
                `<h3><a href="${document.URL}"><big>Опросы, предложения</big></a> ` +
                `(с указанным местом: ${data.points.length})` +
                `</h3>`
            );
        } else {
            num_men = '(указавших место среди выбранных: ' + data.points.length +  ')';
            $('#id_subtitle_').html('<h3><a href="' + document.URL + '"><big>Наши участники</big></a>' + ' ' + num_men + '</h3>');
        }
        if (data.legend) {
            $('#id_legend').html(data.legend);
        }

        // start show_map ----------

        // https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png
        //      только по английски
        // https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png
        //      по-немецки, там где не латинское, включая русские города. Вроде бесплатно
        // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
        //      стандарт, бесплатно, но китайские города в китайских иероглифах
        // По-русски бесплатных не нашел

        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 20,
                // Это обязательно!
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
        let zoom = 5;
        if (data.found_coordinates) {
            zoom = 12;
        } else if (data.points.length == 0) {
            zoom = 2;
        }
        map = L.map('map', { center: L.latLng(data.lat_avg, data.lng_avg), zoom: zoom, layers: [tiles] });
        map.addControl(new L.Control.Fullscreen({
            title: {
                'false': 'Полный экран',
                'true': 'Выйти из полного экрана'
            }
        }));

        markers.addLayers(fill_markerList(data.points));
        map.addLayer(markers);
        if (!(data.found_coordinates || (offer_on && data.num_all <= 1) || data.points.length <= 1)) {
            // Параметры center, zoom в L.map тогда не учитывается
            // Показываем всех
            map.fitBounds(markers.getBounds());
        }
        // end  show_map ----------

        if (meet) {
            map.on('zoomend', async (event_) => {
                map_disable();
                await on_change_bounds_filters_sympa(event_);
                map_enable();
            });
            map.on('dragend', async (event_) => {
                map_disable();
                await on_change_bounds_filters_sympa(event_);
                map_enable();
            });

            $('#id_gender,#id_older,#id_younger,#id_with_offers').change(async (event_) => {
                let older = $('#id_older').val();
                let younger = $('#id_younger').val();
                if (!older) older = "0";
                if (!younger) younger = "1000";
                older = parseInt(older);
                younger = parseInt(younger);
                if (older > younger) {
                    alert(`Возраст от (${older} лет) больше возраста до (${younger} лет)`)
                    if (event_.target.id == 'id_older') {
                        $('#id_older').val(sel_older_prev);
                    } else if (event_.target.id == 'id_younger') {
                        $('#id_younger').val(sel_younger_prev);
                    }
                    return;
                }
                sel_older_prev = $('#id_older').val();
                sel_younger_prev = $('#id_younger').val();
                map_disable();
                await on_change_bounds_filters_sympa(event_);
                map_enable();
            });


            $('.sympa').change(async (event_) => {
            await sympa_change(event_);
            });

        }   // if (meet)

        if (data.graph) {
            Graph = ForceGraph3D()
                .nodeThreeObject(node => node_draw(node))
                .linkColor(link => link_color(link))
                .linkOpacity(0.8)
                .linkCurvature(link => link_curvature(link))
                .backgroundColor("#FFFFFF")
                .nodeLabel(node => `<span style="color: ${node_text_color(node)}">${node.first_name}</span>`)
                .linkDirectionalArrowLength(10)
                .linkDirectionalArrowRelPos(1)
                .linkDirectionalArrowColor('#000000')
                .height(graph_container.offsetWidth / 2)
            ;
            Graph.d3Force('link').distance(195);
            Graph = Graph(graph_container);
            Graph.graphData(data.graph);

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
                const color_sympa = 'darkorange';
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
                    result = color_sympa;
                }
                return result;
            }

            const link_curvature = (link) => {
                // Какой-то результат по умолчанию:
                //
                let result = 0.9;

                if (link.attitude) {
                    result = 0.3;
                } else if (link.is_invite_meet) {
                    result = 0.5;
                }
                return result;
            };

        } // if (data.graph)

    }   // if api_response.ok


    const sympa_change = async (event_) => {
        const operationtype_id = event_.target.checked ? 14 : 15;
        if (!auth_data) return;
        const tag = event_.target.id.match(/sympa\-(\d+)$/);
        if (!tag || tag[1] == auth_data.user_id) return;
        map_disable();
        const api_response = await api_request(
            api_url + '/api/addoperation', {
                method: 'POST',
                auth_token: auth_data.auth_token,
                json: {
                    operation_type_id: operationtype_id,
                    user_id_to: tag[1],
                }
            }
        );
        if (api_response.ok) {
            await on_change_bounds_filters_sympa(event_);
        }
        map_enable();
    };

    function updateProgressBar(processed, total, elapsed, layersArray) {
        const progress = document.getElementById('progress');
        const progressBar = document.getElementById('progress-bar');
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            progress.style.display = 'block';
            progressBar.style.width = Math.round(processed/total*100) + '%';
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
            progress.style.display = 'none';
        }
    }


    const on_change_bounds_filters_sympa = async (event_) => {
        const bounds = map.getBounds();
        const api_response = await api_request(
            api_url + '/api/user/points/', {
                method: 'GET',
                auth_token: auth_data ? auth_data.auth_token : null,
                params: {
                    meet: 'on',
                    lat_south: bounds._southWest.lat,
                    lat_north: bounds._northEast.lat,
                    lng_west: bounds._southWest.lng,
                    lng_east: bounds._northEast.lng,
                    gender: $('#id_gender').val(),
                    older: $('#id_older').val(),
                    younger: $('#id_younger').val(),
                    with_offers: $('#id_with_offers').prop('checked') ? 'on' : '',

        }});
        if (api_response.ok) {
            markers.clearLayers();
            markers.addLayers(fill_markerList(api_response.data.points));
            map.addLayer(markers);
            $('#id_legend').html(api_response.data.legend);
            $('#id_subtitle_').html(
                `<h3>${meet_subtitle} (${api_response.data.num_all})</h3>`
            );
            if (Graph && api_response.data.graph) {
                Graph.graphData(api_response.data.graph);
            }
            $('.sympa').change(async (event_) => {
                await sympa_change(event_);
            });
        }
    };

    const map_enable = () => {
        $('#map')[0].style.cursor = null;
        document.body.style.cursor = null;
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.scrollWheelZoom.enable()
        map.keyboard.enable()
        map.zoomControl.enable()
        // TODO Разобраться:
        // Выскакивает uncaught error, когда какой-то маркер вне карты,
        // map.dragging.enable()
        $("input[type=checkbox]").prop("disabled", false);
        $("select").prop("disabled", false);
    };

    const map_disable = () => {
        $("input[type=checkbox]").prop("disabled", true);
        $("select").prop("disabled", true);
        $('#map')[0].style.cursor = 'wait';
        document.body.style.cursor = 'wait';
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.keyboard.disable()
        map.zoomControl.disable()
        // map.dragging.disable()
    };

});

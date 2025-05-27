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

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import 'leaflet.fullscreen/Control.FullScreen.js';
import 'leaflet.fullscreen/Control.FullScreen.css';

import 'leaflet.markercluster';
import 'leaflet.markercluster/example/screen.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import ForceGraph3D from '3d-force-graph';

(async function() {
// ----------    

    const meet = (get_root_domain() == DOCUMENT_URL.host) ? 'on' : (get_parm('meet') || '');
    const auth_data = await check_auth(Boolean(meet));
    if (meet && !auth_data) return;

    const maxZoom = 19;
    let meet_admin = '';
    let user_data = {};
    let chat_id = '';
    let offer_id = '';
    let offer_on = '';
    let uuid = '';
    let uuid_trustees = '';
    let participants = '';
    let owned = '';
    let videoid = '';
    let with_offers = '';
    let sel_older_prev, sel_younger_prev;
    let map = null;
    let Graph = null;
    const graph_container = $('#3d-graph')[0];
    let bot_username = '';
    let set_place_initial = false;
    let starting = true;
    const color_sympa = 'darkorange';

    const api_url = get_api_url();
    const api_get_parms = {};

    if (meet) {

        const response_bot = await api_request(
            api_url + '/api/get_bot_data/', {
            method: 'GET',
        });
        if (response_bot.ok && response_bot.data.username) {
            bot_username = response_bot.data.username;
        }
        const api_profile_response = await api_request(
            api_url + '/api/profile/', {
                method: 'GET',
                // (не авторизованно!) auth_token: auth_data.auth_token,
                params: {uuid: auth_data.user_uuid},
            }
        );

        if (!api_profile_response.ok) return;
        user_data = api_profile_response.data;
        if (!user_data.is_active) {
            $('#map').hide();
            $('#progress-bar').hide();
            if (bot_username) {
                $('#id_subtitle_').html(
                    `<br />` +
                    `Вы удалены из системы (сами себя обезличили ?). ` +
                    `Для участия в игре знакомств - надо сначала ` +
                    `<a href="https://t.me/${bot_username}?start=${api_profile_response.data.username}">восстановить себя</a> ` +
                    `в системе`
                );
            }
            return;
        }
        if (get_parm('admin')) {
            meet_admin = user_data.is_meetgame_admin ? '1' : '';
        }

        if (meet_admin) {
            api_get_parms.admin = meet_admin;
        } else if (!user_data.did_meet ){
            $('#map').hide();
            $('#progress-bar').hide();
            if (bot_username) {
                $('#id_subtitle_').html(
                    `<br />` +
                    `Для участия в игре знакомств - перейдите пожалуйста по ` +
                    `<a href="https://t.me/${bot_username}?start=meet">ссылке</a> - ` +
                    `и там визард заставит заполнить профиль!` +
                    `<br />`
                );
            }
            return;
        } else if (user_data.r_sympa_username) {
            $('#map').hide();
            $('#progress-bar').hide();
            if (bot_username) {
                const api_profile_sympa = await api_request(
                    api_url + '/api/profile/', {
                        method: 'GET',
                        auth_token: auth_data.auth_token,
                        params: {username: user_data.r_sympa_username},
                    }
                );
                if (api_profile_sympa.ok) {
                    const r_sympa_data = api_profile_sympa.data;
                    $('#id_subtitle_').html(
                        `<br />` +
                        `У Вас установлена взаимная симпатия с ` +
                        `<a href="https://t.me/${bot_username}?start=${r_sympa_data.username}">` +
                        `${r_sympa_data.first_name}</a>  - ` +
                        `чтобы вернуться к игре её нужно отменить. ` +
                        `<br /><br />` +
                        `<button class="revoke_sympa"` +
                        `><big>Отменить симпатию</big></button>` +
                        `<br />`
                    );
                    $('.revoke_sympa').click(async function() {
                        await onRevokeSympa(r_sympa_data);
                    });
                }
            }
            return;
        } else if (!user_data.latitude || !user_data.longitude) {
            set_place_initial = true;
            $('#id_subtitle_').html(
                `Чтобы увидеть местоположение других участников - укажите Ваше - дважды нажав на нужное место на карте.` +
                `<br />`
            );
        }
        if (!set_place_initial) {
            $('#id_block_form').hide();
            $('#id_older,#id_younger,#id_status').each(function() {
                $(this).val('');
            });
            $('#id_with_offers').prop('checked', meet_admin);
            sel_older_prev = '';
            sel_younger_prev = '';
            $('#id_meet_filters').show();

            if (meet_admin) {
                $('#id_horz_bar_1').show();
                $('#id_horz_bar_2').show();
                $('#id_gender').val('');
                $('#graph_legend').show();
                $('#id_meet_filters_gender').show();
                $('#id_meet_filters_with_offer').show();
                $('#3d-graph').show();
                api_get_parms.with_offers = get_parm('with_offers') ? 'on' : ''; 
                if (!api_get_parms.with_offers) {
                    api_get_parms.with_offers = $('#id_with_offers').prop('checked') ? 'on' : ''
                }
            } else {
                $('#id_gender').val(user_data.gender == 'f' ? 'm' : 'f');
                api_get_parms.gender = $('#id_gender').val();
                api_get_parms.status = $('#id_status').val();
                $('#id_meet_filters_status').show();
                $('#id_meet_filters_coords').show();
            }
            api_get_parms.meet = 'on';
        }
        document.title = 'Игра знакомств | Доверие';

    // end of id meet

    } else if (chat_id = get_parm('chat_id')) {
        $('#id_block_form').hide();
        api_get_parms.chat_id = chat_id;
    } else if (offer_id = get_parm('offer_id')) {
        $('#id_block_form').hide();
        api_get_parms.offer_id = offer_id;
    } else if (offer_on = get_parm('offer')) {
        $('#id_block_form').hide();
        api_get_parms.offer = 'on';
        document.title = 'Карта предложений';
    } else if (uuid_trustees = get_parm('uuid_trustees')) {
        $('#id_block_form').hide();
        api_get_parms.uuid_trustees = uuid_trustees;
    } else if (videoid = get_parm('videoid')) {
        $('#id_block_form').hide();
        document.title = 'Карта. Голосование по видео';
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
            document.title = 'Карта участников | Доверие';
        }
    }
    if (!chat_id && !offer_id & !videoid & !uuid_trustees & !meet & !offer_on) {
        // uuid или без uuid
        if (participants = get_parm('participants')) {
            $('#id_participants').prop('checked', 'checked');
            api_get_parms.participants = 'on';
        }
        if (owned = get_parm('owned')) {
            $('#id_owned').prop('checked', 'checked');
            api_get_parms.owned = 'on';
        }
        if (!document.URL.match(/\?/)) {
            window.location.assign(document.URL + '?participants=on');
        }
    }
    if (!(meet && !meet_admin)) {
        $('#id_legend').show();
    }

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
                className: (point.is_of_found_user || meet && point.is_offer) ? '' : 'photo-in-circle'
            }));
            marker.bindPopup(point.popup, {maxHeight: 600, maxWidth: 300});
            markerList.push(marker);
        }
        return markerList;
    }

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

    const markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
    const leaflet_attribution = L.control.attribution().setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');

    // https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png
    //      только по английски
    // https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png
    //      по-немецки, там где не латинское, включая русские города. Вроде бесплатно
    // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
    //      стандарт, бесплатно, но китайские города в китайских иероглифах
    // По-русски бесплатных не нашел

    const tile_layer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: maxZoom,
            // Это обязательно, если пользуешься leafletjs
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    );
    // Координаты Москвы
    const lat_avg_default = 55.7522200;
    const lng_avg_default = 37.6155600;
    const map_options = {
        attributionControl: false,
        center: L.latLng(lat_avg_default, lng_avg_default),
        zoom: 5,
    };

    let api_response = null;
    let data = null;

    $('#map')[0].style.cursor = 'auto';
    if (set_place_initial) {
        map = L.map('map', map_options);
        leaflet_attribution.addTo(map);
        tile_layer.addTo(map);
        // markers.addLayers(fill_markerList([]));
        // map.addLayer(markers);
        map.on('dblclick', async (event_) => {
            map_disable();
            await handle_set_place(event_, true);
            map_enable();
        });

    } else {
        api_response = await api_request(
            api_url + '/api/user/points/', {
                method: 'GET',
                auth_token: auth_data ? auth_data.auth_token : null,
                params: api_get_parms,
            }
        );

        if (api_response.ok) {
            data = api_response.data;
            let num_men = '';
            if (uuid) {
                if (data.first_name) {
                    document.title = 'Карта: ' + data.first_name;
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
                document.title = 'Карта. Опрос' + (data.offer_question ? ': ' + data.offer_question : '');
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
                let subtitle = data.video_title ? data.video_title : 'Голосовашие по видео';
                $('#id_subtitle_').html('<h2>' + subtitle + '</h2>')

            } else if (uuid_trustees) {
                if (data.first_name) {
                    document.title = 'Карта . Доверия к: ' + data.first_name;
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
                // Ничего
            } else if (offer_on) {
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

            let zoom = 5;
            if (data.found_coordinates) {
                zoom = 12;
            } else if (data.points.length == 0) {
                zoom = 2;
            }
            map_options.center = L.latLng(data.lat_avg || lat_avg_default, data.lng_avg || lng_avg_default);
            map_options.zoom = zoom;
            map = L.map('map', map_options);
            leaflet_attribution.addTo(map);
            tile_layer.addTo(map);

            if (!meet) {
                L.control
                    .fullscreen({
                        position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
                        title: 'Полный экран', // change the title of the button, default Full Screen
                        titleCancel: 'Выйти из полного экрана', // change the title of the button when fullscreen is on, default Exit Full Screen
                        // content: null, // change the content of the button, can be HTML, default null
                    })
                .addTo(map);
            }

            markers.addLayers(fill_markerList(data.points));
            map.addLayer(markers);
            if (!(data.found_coordinates || (offer_on && data.num_all <= 1) || data.points.length <= 1)) {
                // Параметры center, zoom в L.map тогда не учитывается
                // Показываем всех
                map.fitBounds(markers.getBounds());
            }

        // end  show_map ----------

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
                        result = color_sympa;
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
            }   // if (data.graph)

            if (meet) {
                map.on('zoomend', async (event_) => {
                    if (starting) {
                        starting = false;
                        return;
                    } else {
                        map_disable();
                        await on_change_bounds_filters_sympa(event_);
                        map_enable();
                    }
                });
                map.on('dragend', async (event_) => {
                    map_disable();
                    await on_change_bounds_filters_sympa(event_);
                    map_enable();
                });

                map.on('dblclick', async (event_) => {
                    map_disable();
                    await handle_set_place(event_, false);
                    map_enable();
                });

                $('#id_gender,#id_older,#id_younger,#id_with_offers,#id_status').change(async (event_) => {
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

                if (!meet_admin) {
                    map.on('popupopen', async (event_) => {
                        $('.sympa').click(async function() {
                            await sympa_button_click($(this));
                        });

                        $('.hide_him_her').change(async (event_) => {
                            await hide_change(event_);
                        });
                    });
                }


            }   // if (meet)
        }       // initial api_response.ok
    }           // not set_place_initial

    const SYMPA_HIDE = 17, SYMPA_SHOW = 18;
    const MISTRUST = 2;

    async function sympa_button_click(button) {
        if (!auth_data) return;
        const operationtype_id = 14;
        const tag = button[0].id.match(/sympa\-(\d+)$/);
        if (!tag || tag[1] == auth_data.user_id) return;
        const user_id_to = tag[1];
        if (!user_id_to || user_id_to == auth_data.user_id) {
            return;
        }
        map_disable();
        const api_response = await api_request(
            api_url + '/api/addoperation', {
                method: 'POST',
                auth_token: auth_data.auth_token,
                json: {
                    operation_type_id: operationtype_id,
                    user_id_to: user_id_to,
                }
            }
        );
        if (api_response.ok) {
            await on_change_bounds_filters_sympa(null);
            const profile_to = api_response.data.profile_to;
            const message = api_response.data.desc_sent
                ?   'Информация отправлена. Проверьте сообщения в телеграме'
                :   (
                        `Ошибка отправки к вам описания ${profile_to.first_name}. ` +
                        'Возможно, человек, которым Вы интересуетесь, не имеет описания или заблокировал такую отправку'
                    )
            ;
            alert(message);
        } else if (api_response.status == 400 && api_response.data.message) {
            await on_change_bounds_filters_sympa(null);
            alert("Интерес не установлен:\n" + api_response.data.message);
        }
        map_enable();
    };


    const hide_change = async (event_) => {
        if (!auth_data) return;
        const operationtype_id = event_.target.checked ? SYMPA_HIDE : SYMPA_SHOW;
        const tag = event_.target.id.match(/hide\-(\d+)$/);
        if (!tag || tag[1] == auth_data.user_id) return;
        const user_id_to = tag[1];
        if (!user_id_to || user_id_to == auth_data.user_id) {
            $('#map').show();
            return;
        }
        document.body.style.cursor = 'wait';
        const api_response = await api_request(
            api_url + '/api/addoperation', {
                method: 'POST',
                auth_token: auth_data.auth_token,
                json: {
                    operation_type_id: operationtype_id,
                    user_id_to: user_id_to,
                }
            }
        );
        document.body.style.cursor = 'auto';
        if (api_response.ok) {
            if (operationtype_id == SYMPA_HIDE) {
                const profile_to = api_response.data.profile_to;
                const first_name = new Option(profile_to.first_name).innerHTML;
                $('#map').hide();
                $('input[name=hide_user_id]').val(`${profile_to.user_id}`);
                $('#id_dialog_hide_question').html(
                    `Профиль <b>${first_name}</b> скрыт - вы не увидите друг друга в игре знакомств. ` +
                    `Вы можете отменить скрытие или установить недоверие - ` +
                    `чтобы предупредить участников сообщества от общения c <b>${first_name}</b>:`
                );

                $('#id_dialog_hide_user').css("display", "block");
            } else {
                $('#map').show();
                map_disable();
                await on_change_bounds_filters_sympa(event_);
                map_enable();
            }
        }
    }


    $('.f-modal-close,#id_hide_user_ok').click(async function() {
        $('#id_dialog_hide_user').css("display", "none");
        $('#map').show();
        map_disable();
        await on_change_bounds_filters_sympa(null);
        map_enable();
    });

    $('#id_hide_user_cancel').click(async function() {
        map_disable();
        const api_response = await api_request(
            api_url + '/api/addoperation', {
                method: 'POST',
                auth_token: auth_data.auth_token,
                json: {
                    operation_type_id: SYMPA_SHOW,
                    user_id_to: $('input[name=hide_user_id]').val(),
                }
            }
        );
        if (api_response.ok) {
            alert('Скрытие отменено');
        }
        $('#id_dialog_hide_user').css("display", "none");
        $('#map').show();
        await on_change_bounds_filters_sympa(null);
        map_enable();
    });

    $('#id_hide_user_mistrust').click(async function() {
        document.body.style.cursor = 'wait';
        const api_response = await api_request(
            api_url + '/api/addoperation', {
                method: 'POST',
                auth_token: auth_data.auth_token,
                json: {
                    operation_type_id: MISTRUST,
                    user_id_to: $('input[name=hide_user_id]').val(),
                    hide_deeplink: true,
                }
            }
        );
        document.body.style.cursor = 'auto';
        let msg = '';
        if (api_response.ok) {
            msg = 'Недоверие установлено';
        } else if (api_response.status == 400 && api_response.data.code == 'already') {
            msg ='Недоверие уже было установлено';
        }
        if (msg) {
            alert(msg);
            await on_change_bounds_filters_sympa(null);
        }
        $('#id_dialog_hide_user').css("display", "none");
        $('#map').show();
    });

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
                    status: $('#id_status').val(),
                    admin: meet_admin,

        }});
        if (api_response.ok) {
            data = api_response.data;
            markers.clearLayers();
            markers.addLayers(fill_markerList(data.points));
            map.addLayer(markers);
            $('#id_legend').html(data.legend);
            if (Graph && data.graph) {
                Graph.graphData(data.graph);
            }
        }
    };

    const map_enable = () => {
        $('#map')[0].style.cursor = 'auto';
        document.body.style.cursor = 'auto';
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.scrollWheelZoom.enable()
        map.keyboard.enable()
        map.zoomControl.enable()
        // TODO Разобраться:
        // Выскакивает uncaught error, когда какой-то маркер вне карты,
        // map.dragging.enable()
        $('#id_gender, #id_older, #id_younger, #id_status, #id_with_offers').prop('disabled', false);
    };

    const map_disable = () => {
        $('#id_gender, #id_older, #id_younger, #id_status, #id_with_offers').prop('disabled', true);
        $('#map')[0].style.cursor = 'wait';
        document.body.style.cursor = 'wait';
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.keyboard.disable()
        map.zoomControl.disable()
        // map.dragging.disable()
    };

    const handle_set_place = async (event_, refresh=false) => {
        if (
                auth_data &&
                user_data &&
                event_.latlng &&
                confirm(`Сохранить место как Ваши координаты ?`)
           ) {
            const api_response = await api_request(
                api_url + '/api/profile', {
                    method: 'PUT',
                    auth_token: auth_data.auth_token,
                    form_data: {
                        uuid: user_data.uuid,
                        latitude: event_.latlng.lat,
                        longitude: event_.latlng.lng,
                    }
                }
            );
            if (api_response.ok) {
                if (refresh) {
                    window.location.assign(document.URL);
                } else {
                    await on_change_bounds_filters_sympa(event_);
                }
            } else {
                alert(`Извините, произошла ошибка.`);
            }
        };
    };

    async function onRevokeSympa(r_sympa_data) {
        if (confirm(`Отменить симпатию к ${r_sympa_data.first_name} ?`)) {
            const api_response = await api_request(
                api_url + '/api/addoperation', {
                    method: 'POST',
                    auth_token: auth_data.auth_token,
                    json: {
                        operation_type_id: 16,
                        user_id_to: r_sympa_data.user_id,
                    }
                }
            );
            if (api_response.ok) {
                const message = api_response.data.previousstate.is_sympa_confirmed
                    ? `Симпатия к ${r_sympa_data.first_name} отменена`
                    : 'Симпатия уже была отменена'
                ;
                alert(message);
                // document.URL здесь показывает типа https://meeetgame.us.to/# ???
                // DOCUMENT_URL - это из funcs.js
                window.location.assign(DOCUMENT_URL.href);
            }
        }
    };

// ----------    
})();

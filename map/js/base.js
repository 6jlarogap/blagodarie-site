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

$(document).ready (async function() {

    let chat_id = '';
    let offer_id = '';
    let uuid = '';
    let uuid_trustees = '';
    let participants = '';
    let owned = '';
    let videoid = '';
    let meet = '';
    let map = null;

    let auth_data = await check_auth();

    const api_url = get_api_url();
    const api_get_parms = {};
    if (chat_id = get_parm('chat_id')) {
        $('#id_block_form').hide();
        api_get_parms.chat_id = chat_id;
    } else if (meet = get_parm('meet')) {
        $('#id_block_form').hide();
        api_get_parms.meet = 'on';
    } else if (offer_id = get_parm('offer_id')) {
        $('#id_block_form').hide();
        api_get_parms.offer_id = offer_id;
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
    if (!chat_id && !offer_id & !videoid & !uuid_trustees & !meet) {
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
            document.title = title_base + '. Игра знакомств';
            num_men = '(' + data.num_all;
            if (data.num_all != data.points.length) {
                num_men += `, указавших место: ${data.points.length}`
            }
            num_men += ')';
            $('#id_subtitle_').html('<h3><a href="' + document.URL + '"><big>Участники игры знакомств</big></a>' + ' ' + num_men + '</h3>');
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
        const latlng = L.latLng(data.lat_avg, data.lng_avg);

        let markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
        let markerList = [];

        for (let i = 0; i < data.points.length; i++) {
            let point = data.points[i];
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
            marker.bindPopup(point.popup);
            markerList.push(marker);
        }
        let zoom = 5;
        if (data.found_coordinates) {
            zoom = 12;
        } else if (data.points.length == 0) {
            zoom = 2;
        }
        map = L.map('map', { center: latlng, zoom: zoom, layers: [tiles] });
        map.addControl(new L.Control.Fullscreen({
            title: {
                'false': 'Полный экран',
                'true': 'Выйти из полного экрана'
            }
        }));
        markers.addLayers(markerList);
        map.addLayer(markers);
        if (!(data.found_coordinates || data.points.length <= 1)) {
            // Параметры center, zoom в L.map тогда не учитывается
            // Показываем всех
            map.fitBounds(markers.getBounds());
        }

        if (meet) {
            map.on('zoomend', async function(event_) {
                await on_zoom_or_drag(event_);
            });
            map.on('dragend', async function(event_) {
                await on_zoom_or_drag(event_);
            });
        }
        // end  show_map ----------
    }   // if api_response.ok


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


    async function on_zoom_or_drag(event_) {
        map_disable();
        const bounds = map.getBounds();
        const parms = {
            lat_south: bounds._southWest.lat,
            lat_north: bounds._northEast.lat,
            lng_west: bounds._southWest.lng,
            lng_east: bounds._northEast.lng,
            meet: 'on',
        }
        const api_response = await api_request(
            api_url + '/api/user/points/', {
                method: 'GET',
                auth_token: auth_data ? auth_data.auth_token : null,
                params: parms,
            }
        );
        if (api_response.ok) {
            $('#id_legend').html(api_response.data.legend);
        }
        map_enable();
    }


    function map_enable() {
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
    }

    function map_disable() {
        $('#map')[0].style.cursor = 'wait';
        document.body.style.cursor = 'wait';
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.keyboard.disable()
        map.zoomControl.disable()
        // map.dragging.disable()
    }

});

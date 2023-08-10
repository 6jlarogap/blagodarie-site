let chat_id = '';
let offer_id = '';
let uuid = '';
let uuid_trustees = '';
let participants = '';
let owned = '';
let videoid = '';

$(document).ready (async function() {

    let auth_data = await check_auth();
    if (!auth_data) { return; };

    const api_url = get_api_url();
    let api_get_parms = [];
    uuid = get_parm('uuid');
    if (chat_id = get_parm('chat_id')) {
        $('#id_block_form').hide();
        api_get_parms.push('chat_id=' + chat_id);
    } else if (offer_id = get_parm('offer_id')) {
        $('#id_block_form').hide();
        api_get_parms.push('offer_id=' + offer_id);
    } else if (uuid_trustees = get_parm('uuid_trustees')) {
        $('#id_block_form').hide();
        api_get_parms.push('uuid_trustees=' + uuid_trustees);
    } else if (videoid = get_parm('videoid')) {
        $('#id_block_form').hide();
        let source = get_parm('source') || 'yt';
        api_get_parms.push('videoid=' + videoid);
        api_get_parms.push('source=' + source);
        let parm_from = get_parm('f');
        if (parm_from) {
            api_get_parms.push('from=' + parm_from);
        }
        let parm_to = get_parm('t');
        if (parm_to) {
            api_get_parms.push('to=' + parm_to);
        }
    } else {
        $('#id_block_form').show();
        if (uuid = get_parm('uuid')) {
            api_get_parms.push('uuid=' + uuid);
            $('input[name=uuid]').val(uuid);
        } else {
            $('input[name=uuid]').remove();
        }
    }
    if (!chat_id && !offer_id & !videoid & !uuid_trustees) {
        // uuid или без uuid
        if (participants = get_parm('participants')) {
            $('#id_participants').attr('checked', 'checked');
            api_get_parms.push('participants=on');
        }
        if (owned = get_parm('owned')) {
            $('#id_owned').attr('checked', 'checked');
            api_get_parms.push('owned=on');
        }
        if (!document.URL.match(/\?/)) {
            window.location.assign(document.URL + '?participants=on');
        }
    }

    const api_get_parm = api_get_parms.join('&');
    const headers = auth_data ? { 'Authorization': 'Token ' + auth_data.auth_token } : {};
    $.ajax({
        url: api_url  + '/api/user/points/' + (api_get_parm ? '?' + api_get_parm : ''),
        dataType: 'json',
        headers: headers,
        success: function(data) {
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
                        title_base + '. Телеграм ' +
                        (data.chat_type == 'channel' ? 'канал' : 'группа') +
                        ': ' +
                        data.chat_title
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
                    let him_her = data.gender == 'm' ? 'ему' : (data.gender == 'f' ? 'ей' : '');
                    $('#id_subtitle_').html(
                            '<h3>' +
                                '<big>' +
                                    '<a href="' + document.URL + '">' + data.first_name + '</a> '+
                                '</big>' +
                                ' (<i>и кто ' + him_her + ' доверяет, а кто нет</i>)'+
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

            } else {
                num_men = '(указавших место среди выбранных: ' + data.points.length +  ')';
                $('#id_subtitle_').html('<h3><a href="' + document.URL + '"><big>Наши участники</big></a>' + ' ' + num_men + '</h3>');
            }
            if (data.legend) {
                $('#id_legend').html(data.legend);
            }
            show_map(data);
        }
    });
});

function show_map(data) {

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
    let map = L.map('map', { center: latlng, zoom: zoom, layers: [tiles] });
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

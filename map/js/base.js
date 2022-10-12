function get_api_url_() {
    if (window.location.protocol == 'file:') {
        // Для отладки
        return 'http://127.0.0.1:8000';
    }
    var location_host = window.location.host;
    location_host = location_host.replace(/^www\./, '');
    var re = /^(\w+)\.(\w+)\.(\w+)$/;
    var s = location_host.replace(re, 'api.$2.$3');
    if (s != location_host) {
        return 'https://' + s;
    }
    return 'https://api.' + location_host;
}

var chat_id = '';
var uuid = '';
var participants = false;
var owned_alive = false;
var owned_dead = false;

function main_() {
    var api_url = get_api_url_();
    var api_get_parms = [];
    // Показ всех из группы
    var got_parm = document.URL.match(/chat_id\=([-]*[0-9]+)/i);
    if (got_parm) {
        chat_id = got_parm[1];
        api_get_parms.push('chat_id=' + chat_id);
        $('#id_block_form').hide();
    } else {
        $('#id_block_form').show();
        // Показ только одного юзера по центру
        got_parm = document.URL.match(/uuid\=([0-9a-f\-]+)/i);
        if (got_parm) {
            uuid = got_parm[1];
            api_get_parms.push('uuid=' + uuid);
            $('input[name=uuid]').val(uuid);
        } else {
            $('input[name=uuid]').remove();
        }
    }
    if (!chat_id) {
        // uuid или без uuid
        if (document.URL.match(/participants\=on/i)) {
            $('#id_participants').attr('checked', 'checked');
            participants = true;
            api_get_parms.push('participants=on');
        }
        if (document.URL.match(/owned_alive\=on/i)) {
            $('#id_owned_alive').attr('checked', 'checked');
            owned_alive = true;
            api_get_parms.push('owned_alive=on');
        }
        if (document.URL.match(/owned_dead\=on/i)) {
            owned_dead = true;
            $('#id_owned_dead').attr('checked', 'checked');
            api_get_parms.push('owned_dead=on');
        }
        if (!document.URL.match(/\?/)) {
            window.location.assign(document.URL + '?participants=on&owned_alive=on');
        }
    }

    var api_get_parm = api_get_parms.join('&');
    $.ajax({
        url: api_url  + '/api/user/points/' + (api_get_parm ? '?' + api_get_parm : ''),
        dataType: 'json',
        success: function(data) {
            var num_men = '';
            if (uuid) {
                if (data.first_name) {
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
                var subtitle = '';
                num_men = '(указавших место: ' + data.points.length +  ')';
                if (data.chat_id) {
                    if (data.chat_title) {
                        subtitle =
                            '<h2>Участники телеграм ' +
                            (data.chat_type == 'channel' ? 'канала' : 'группы') +
                             ' ' + num_men +
                            '</h2>' +
                            '<h2><a href="' + document.URL + '">' + data.chat_title + '</a></h2>';
                    } else {
                        subtitle = '<h2><big>Канал или группа не найден(а)</big></h2>';
                    }
                }
                $('#id_subtitle_').html(subtitle);
            } else {
                num_men = '(указавших место среди выбранных: ' + data.points.length +  ')';
                $('#id_subtitle_').html('<h3><big>Наши участники ' + num_men + '</big></h3>');
            }

            show_map(data);
        }
    });
}

function show_map(data) {

    // https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png
    //      только по английски
    // https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png
    //      по-немецки, там где не латинское, включая русские города. Вроде бесплатно
    // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
    //      стандарт, бесплатно, но китайские города в китайских иероглифах
    // По-русски бесплатных не нашел

    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            // Это обязательно!
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
    var latlng = L.latLng(data.lat_avg, data.lng_avg);
    var progress = document.getElementById('progress');
    var progressBar = document.getElementById('progress-bar');

    var markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
    var markerList = [];

    for (var i = 0; i < data.points.length; i++) {
        var point = data.points[i];
        var marker = L.marker(L.latLng(point.latitude, point.longitude), { title: point.title });
        if (point.is_of_found_user) {
            marker.setIcon(L.icon({
                iconUrl:       'images/marker-icon-red.png',
                iconRetinaUrl: 'images/marker-icon-red-2x.png',
                shadowUrl:     'images/marker-shadow.png',
                iconSize:    [27, 41],
                iconAnchor:  [13, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize:  [41, 41]
            }));
        }
        marker.bindPopup(point.popup);
        markerList.push(marker);
    }
    var zoom = 5;
    if (data.found_coordinates) {
        zoom = 10;
    } else if (data.points.length == 0) {
        zoom = 2;
    }
    var map = L.map('map', { center: latlng, zoom: zoom, layers: [tiles] });
    markers.addLayers(markerList);
    map.addLayer(markers);
    if (!(data.found_coordinates || data.points.length <= 1)) {
        // Параметры center, zoom в L.map тогда не учитывается
        // Показываем всех
        map.fitBounds(markers.getBounds());
    }
}

function updateProgressBar(processed, total, elapsed, layersArray) {
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

$(function() {
    main_();
});

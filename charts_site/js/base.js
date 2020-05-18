ID_CHART = "id_chart";
COOKIE_NAME = 'selected_symptoms';

function plotly_draw_(id_chart, counts_all, counts_last, titles, range) {
    var data = [
        {
            type: 'scatterpolar',
            r: counts_all,
            theta: titles,
            fill: 'toself',
            name: 'За 48 часов'
        },
        {
            type: 'scatterpolar',
            r: counts_last,
            theta: titles,
            fill: 'toself',
            name: 'За 24 часа'
        }
    ];

    var layout = {
        polar: {
            radialaxis: {
            visible: true,
            range: [0, range]
            }
        },
        dragmode: false,
        fixedrange: true,
        showlegend: true,
        width: 1050,
        height: 700,
        font: {
            size: 14
        }
    };

    Plotly.plot(id_chart, data, layout, {displayModeBar: false });
}

function get_api_url_() {
    if (window.location.protocol == 'file:') {
        // Для отладки
        return 'http://127.0.0.1:8000';
    }
    var location_host = window.location.host;
    location_host = location_host.replace(/^www\./, '');

    if (location_host == 'develop.blagodarie.org') {
        // Для отладки
        return 'http://api.' + location_host + ':8000';
    }
    return 'https://api.' + location_host;
}

function fill_chart_() {
    var api_url = get_api_url_();
    var selected_ids_str = getCookie_(COOKIE_NAME);
    var get_selected_ids_str = '';
    var selected_ids_list = [];
    if (selected_ids_str) {
        get_selected_ids_str = '?selected_ids_str=' + selected_ids_str;
        var s = selected_ids_str.replace('(', '');
        s = s.replace(')', '');
        selected_ids_list = s.split(',');
    }

    /*
    $('#id_apk_version').html('-');
    $.ajax({
        url: api_url  + '/api/getlatestversion',
        dataType: 'json',
        success: function(data) {
            $('#id_apk_version').html(
                '<big>(' + data.version_name + ')</big>'
            );
        }
    });
    */

    $.ajax({
        url: api_url  + '/api/getstats/symptoms/names',
        dataType: 'json',
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                $('#id_symptom_select').append(
                    '<option value="' + data[i].id + '"' +
                    (! selected_ids_str || (selected_ids_str && selected_ids_list.indexOf(data[i].id) >= 0) ? ' selected' : '') +
                    '>' +
                    data[i].name +
                    '</option>'
                );
            }
        }
    });

    $.ajax({
        url: api_url  + '/api/getstats/users',
        dataType: 'json',
        success: function(data) {
                $('#id_total_users_head').html(
                    'Пользователей: ' +
                    data.users +
                    ' Сообщений: ' +
                    data.symptoms                   
                );
        }
    });

    $.ajax({
        url: api_url  + '/api/getstats/symptoms' + get_selected_ids_str,
        dataType: 'json',
        success: function(data) {
            if (data.counts_all[0]) {
                // Есть пользователи с симптомами, значит будут симптомы
                var range = 0;
                for (var i = 1; i < data.counts_all.length; i++) {
                    range = Math.max(range, data.counts_all[i]);
                }
                var range_new  = Math.floor(range / 10) * 10;
                if (range_new < range) {
                    range_new += 10;
                }
                plotly_draw_(ID_CHART, data.counts_all, data.counts_last, data.titles, range_new);
            } else {
                $('#' + ID_CHART).html(
                    'Данные' +
                    (get_selected_ids_str ? ' по выбранным типам сообщений' : '') +
                    ' не поступали.'
                );
            }
        }
    });

    $.ajax({
        url: api_url  + '/api/getstats/symptoms/hist' + get_selected_ids_str,
        dataType: 'json',
        success: function(data) {
            if (data.hist) {
                $('#id_hist').html(
                    "<img src='data:image/png;base64," + data.hist + "'>"
                );
            } else {
                $('#id_hist').html("<big>За последние 48 часов данные по выбранным типам сообщений не поступали.</big>");
            }
            if (data.hist && data.legend) {
                $('#id_hist_legend').html(
                    "<img style='border:1px solid black;' src='data:image/png;base64," + data.legend + "'>"
                );
            }

            if (data.moon_days_fig) {
                $('#id_moon_days_fig').html(
                    "<img src='data:image/png;base64," + data.moon_days_fig + "'>"
                );
            }

            if (data.moon_hour_fig) {
                $('#id_moon_hour_fig').html(
                    "<img src='data:image/png;base64," + data.moon_hour_fig + "'>"
                );
            }

            // show_map(data);
        }
    });
}

function show_map(data) {
    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 20,
            // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ'
        }),
        latlng = L.latLng(data.lat_avg, data.lng_avg);

    var map = L.map('map', { center: latlng, zoom: 5, layers: [tiles] });
    var progress = document.getElementById('progress');
    var progressBar = document.getElementById('progress-bar');

    var markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
    var markerList = [];

    for (var i = 0; i < data.points.length; i++) {
        var a = data.points[i];
        var title = a[2];
        var marker = L.marker(L.latLng(a[0], a[1]), { title: title });
        marker.bindPopup(title);
        markerList.push(marker);
    }
    markers.addLayers(markerList);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());
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

function getCookie_(name) {
    return (document.cookie.match('(?:^|;) *'+name+'=([^;]*)')||"")[1];
}

$(function() {
    $('.class_reload').click(function() {
        location.reload(true);
    });
    
    $("#id_symptom_select").change(function() {
        var date = new Date(Date.now() + 7 * 86400e3);
        date = date.toUTCString();
        var selected_ids_str = '(' + $(this).val().join(',') + ')';
        var s =
            COOKIE_NAME + '=' + selected_ids_str + ';' +
            'expires=' + date
        ;
        document.cookie = s;
    });

    fill_chart_();
});

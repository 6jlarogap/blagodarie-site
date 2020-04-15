ID_CHART = "id_chart";

function plotly_draw_(id_chart, counts, titles, range) {
    var data = [
        {
            type: 'scatterpolar',
            r: counts,
            theta: titles,
            fill: 'toself'
        }
    ];

    var layout = {
        polar: {
            radialaxis: {
            visible: true,
            range: [0, range]
            }
        },
        showlegend: false
    };

    Plotly.plot(id_chart, data, layout, {displayModeBar: false});
}

function get_api_url_() {
    var result;
    if (window.location.protocol == 'file:') {
        // Для отладки
        result = 'http://127.0.0.1:8000';
    } else {
        var location_host = window.location.host;
        location_host = location_host.replace(/^www\./, '');
        result = 'https://api.' + location_host;
    }
    return result;
}

function fill_chart_() {
    var api_url = get_api_url_();

    $.ajax({
        url: api_url  + '/api/getstats/users',
        dataType: 'json',
        success: function(data) {
            var msg_users = 'пользователей';
            if (data.users > 0) {
                if (data.users == 1) {
                    msg_users = 'пользователя';
                }
                $('#id_count_users_head').html(
                    '<p>' +
                    'Ниже представлены данные о самочувствии ' +
                    '<b><big>' +
                    data.users +
                    '</big></b> ' +
                    msg_users +
                    ' приложения "Благодарие"'
                );
            } else {
                $('#id_count_users_head').html('');
            }
        }
    });

    $.ajax({
        url: api_url  + '/api/getstats/symptoms',
        dataType: 'json',
        success: function(data) {
            if (data.counts[0]) {
                // Есть пользователи с симптомами, значит будут симптомы
                var range = 0;
                for (var i = 1; i < data.counts.length; i++) {
                    range = Math.max(range, data.counts[i]);
                }
                range = Math.floor(range / 10) * 10 + 10;
                plotly_draw_(ID_CHART, data.counts, data.titles, range);
            } else {
                $('#' + ID_CHART).html('За последние 48 часов данные о самочувствии не поступали.');
            }
        }
    });

    $.ajax({
        url: api_url  + '/api/getstats/symptoms/hist',
        dataType: 'json',
        success: function(data) {
            if (data.hist) {
                $('#id_hist').html(
                    "<img src='data:image/png;base64," + data.hist + "'>"
                );
            } else {
                $('#id_hist').html("<big>За последние 48 часов данные о самочувствии не поступали.</big>");
                return;
            }
            if (data.legend) {
                $('#id_hist_legend').html(
                    "<img style='border:1px solid black;' src='data:image/png;base64," + data.legend + "'>"
                );
            }
        }
    });
}

$(function() {
    $('.class_reload').click(function() {
        location.reload(true);
    });

    fill_chart_();
});

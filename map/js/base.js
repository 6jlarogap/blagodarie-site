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

function main_() {
    var api_url = get_api_url_();
    $.ajax({
        url: api_url  + '/api/user/points',
        dataType: 'json',
        success: function(data) {
            show_map(data);
        }
    });
}

function show_map(data) {
    // https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png - только по английски
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
        var point = data.points[i];
        var marker = L.marker(L.latLng(point.latitude, point.longitude), { title: point.title });
        marker.bindPopup(point.popup);
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

$(function() {
    main_();
});

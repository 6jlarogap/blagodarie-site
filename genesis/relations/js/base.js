function get_api_url_() {
    if (typeof __API_URL__ === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return __API_URL__;
    }
}

function get_parm(parm) {
    var result = '';
    const got_parm = document.URL.match(new RegExp("[\\?\\&]" + parm + "\\=(\\w+)", "i"));
    if (got_parm) {
        result = got_parm[1];
    }
    return result;
}

var parm_rod = '';

function main_() {
    if (!document.URL.match(/\?/)) {
        window.location.assign(document.URL + '?rod=on&dover=&withalone=');
    }
    parm_rod = get_parm('rod');
    const parm_dover = get_parm('dover');
    const parm_withalone = get_parm('withalone');
    const api_url = get_api_url_();
    $.ajax({
        url:
            api_url  +
            '/api/profile_genesis/all?fmt=3d-force-graph' +
            '&withalone=' + parm_withalone +
            '&dover=' + parm_dover +
            '&rod=' + parm_rod
        ,
        dataType: 'json',
        success: function(data) {

            const photoTextureUnknown = new THREE.TextureLoader().load(`./images/star.jpeg`);
            const Graph = ForceGraph3D()
            (document.getElementById('3d-graph'))
            .nodeThreeObject(({ id, photo }) => {
                var photoTexture;
                if (photo) {
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
            .linkColor(link => link.is_child && parm_rod ? '#ffe8e8' : '#366b0d' )
            .linkOpacity(0.8)
            .linkCurvature(0.25)
            .nodeLabel(node => `${node.first_name}`)
            .linkDirectionalArrowLength(10)
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalArrowColor(
                link => link.is_child && parm_rod ? 'rgba(255, 232, 232, 0.8)' : 'rgba(54, 107, 13, 0.8)'
            )
            ;
        }
    });
}

$(function() {
    main_();
});

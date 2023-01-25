function get_api_url_() {
    if (typeof __API_URL__ === 'undefined') {
        return 'https://api.blagoroda.org';
    } else {
        return __API_URL__;
    }
}

var parm_withalone = '';
var parm_dover = '';

function main_() {
    const api_url = get_api_url_();
    var got_parm;
    got_parm = document.URL.match(/[\?\&]withalone\=(\w+)/i);
    if (got_parm) {
        parm_withalone = got_parm[1];
    }
    got_parm = document.URL.match(/[\?\&]dover\=(\w+)/i);
    if (got_parm) {
        parm_dover = got_parm[1];
    }
    $.ajax({
        url:
            api_url  +
            '/api/profile_genesis/all?fmt=3d-force-graph' +
            '&withalone=' + parm_withalone +
            '&dover=' + parm_dover
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
            .linkColor(link => link.is_child ? '#ffe8e8' : '#366b0d' )
            .linkOpacity(0.8)
            .linkCurvature(0.25)
            .nodeLabel(node => `${node.first_name}`)
            .linkDirectionalArrowLength(10)
            .linkDirectionalArrowRelPos(1)
            .linkDirectionalArrowColor(link => link.is_child ? 'rgba(255, 232, 232, 0.8)' : 'rgba(54, 107, 13, 0.8)' );
        }
    });
}

$(function() {
    main_();
});

function get_api_url_() {
    if (typeof __DEBUG__ === 'undefined' || !__DEBUG__) {
        // variable is undefined
        return 'https://api.blagoroda.org';
    } else {
        return 'http://127.0.0.1:8000';
    }
}

function main_() {
    const api_url = get_api_url_();
    $.ajax({
        url: api_url  + '/api/profile_genesis/all?fmt=3d-force-graph',
        dataType: 'json',
        success: function(data) {

            const Graph = ForceGraph3D()
            (document.getElementById('3d-graph'))
            .nodeThreeObject(({ id, photo }) => {
                const photoTexture = new THREE.TextureLoader().load(photo ? photo: `./images/quest.png`);
                const material = new THREE.SpriteMaterial({ map: photoTexture });
                const sprite = new THREE.Sprite(material);
                sprite.scale.set(25, 25);
                return sprite;
            })
            .graphData(data)
            .linkDirectionalArrowLength(10)
            .linkDirectionalArrowRelPos(1)
            .linkCurvature(0.25)
            .nodeLabel(node => `${node.first_name}`);
        }
    });
}

$(function() {
    main_();
});

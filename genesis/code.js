const NODE_TYPES = Object.freeze({
	"USER":"user",
	"FRIEND":"friend",
	"WISH_ROOT": "wish_root",
	"WISH":"wish",
	"SHARE": "share_root",
	"TRUST": "trust_btn",
	"MISTRUST" : "mistrust_btn",
	"PROFILE": "profile_root",
	"OPTIONS": "options",
	"HOME": "home",
	"GENESIS": "genesis",
	"FILTER": "filter",
	"FILTERED": "filtered",
	"INVITE": "invite",
	"MAPS": "maps"
	//"PLUS": "plus"
});

const WISHES_ROOT_ID = "WISHES_ROOT";
const ABILITIES_ROOT_ID = "ABILITIES_ROOT";
const SHARE_ID = "SHARE_ROOT";
const OPTIONS_ID = "OPTIONS_ROOT";
const TRUST_ID = "TRUST_ROOT";
const MISTRUST_ID = "MISTRUST_ROOT";
const FILTER_ID = "FILTER_ROOT";
const HOME_ID = "HOME_ROOT";
const GENESIS_ID = "GENESIS_ROOT";
const MAPS_ID = "MAPS_ROOT";
const INVITE_ID = "INVITE_ROOT";
//const PLUS_ID = "PLUS_ROOT";

const PROFILE = {
	id: '',
	nodeType: NODE_TYPES.PROFILE,
	image: '',
        base64Url: '',
	text: '',
	tabil: ' ',
	count: ''
};

var svg = d3.select('#main').attr('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
svg.attr('preserveAspectRatio', 'xMidYMid meet').attr('pointer-events', 'all');
svg.attr('baseProfile', 'full');

var width = +svg.node().getBoundingClientRect().width;
var height = +svg.node().getBoundingClientRect().height;

var link, node;

var nodes = [];
var links = [];

var simulation;

// all dialog elements
var rootDialog = document.getElementById("rootDialog");

//root stuff
var rootList = document.getElementById("rootList");

//filter stuff
var filterInput = document.getElementById("filterInput");

var settings = { api: get_api_url(), url: new URL(window.location.href) };

setTimeout(() => {
	if(false){
    }
}, 2000)

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
}

initDefs();

// load the data

var url = new URL(window.location.href);

// var url = new URL('https://dev.blagodarie.org/?id=c03ce3fd-6fda-4112-b1c5-bd9847afee2e');

var userIdFrom = url.searchParams.get("id");
var chat_id = url.searchParams.get("chat_id") || '';
var all = false;
var withalone = false;
if (!userIdFrom && !chat_id && url.searchParams.get("all")) {
    all = true;
    withalone = url.searchParams.get("withalone") || '';
}

var depth = url.searchParams.get("depth") || 10;
var up = url.searchParams.get("up") || '';
var down = url.searchParams.get("down") || '';
var count_ = url.searchParams.get("q") || 50;

if (userIdFrom || all) {
    document.querySelector('.pagination_block').style.display = 'none';
}

if (userIdFrom) {
    if (depth <= 0 || depth > 100 ) {
        depth = 100;
    }
} else if (chat_id) {
    if (depth <= 0 || depth > 10 ) {
        depth = 10;
    }
    if (count_ <= 0 || count_ > 50 ) {
        count_ = 50;
    }
}

var link = window.location.href;

        if (chat_id) {
            if(!url.searchParams.has('q') && !url.searchParams.has('f')){
                url.searchParams.append('q', 50);
                url.searchParams.append('f', 0);
                url.searchParams.append('depth', 10);
                window.history.pushState(null, null, url.search);
                window.location.href = url.href;
            }
            else{
                let selected_val = +url.searchParams.get('q');
                let head_from = +url.searchParams.get('f');
                if(head_from/selected_val == 0 || head_from/selected_val == Infinity){
                    document.querySelector('#page').innerHTML = 1;
                    let btn_prev_n = document.querySelector('#btn_prev');
                    btn_prev_n.style.background = '#aaa0a0';
                    btn_prev_n.style.cursor = 'context-menu';
                    btn_prev_n.style.pointerEvents = 'none';
                }else{
                document.querySelector('#page').innerHTML = 1 + (head_from / selected_val);
                }
            }
        }

        function nextPage() {
			let item_plus_int = +url.searchParams.get('f');
			let selected_val = +url.searchParams.get('q');
			item_plus_int += selected_val;
			url.searchParams.set('f', item_plus_int);
			url.searchParams.set('depth', depth);
            if (chat_id) {
                url.searchParams.set('q', count_);
            }
			window.location.href = url.href;
        }

        function prevPage() {
			let item_plus_int = +url.searchParams.get('f');
			let selected_val = +url.searchParams.get('q');
			item_plus_int -= selected_val;
			url.searchParams.set('f', item_plus_int);
			url.searchParams.set('depth', depth);
            if (chat_id) {
                url.searchParams.set('q', count_);
            }
			window.location.href = url.href;
        }

		document.querySelector('#btn_prev').style.background = '#6a2300;';
		document.querySelector('#btn_prev').style.cursor = 'pointer;';
		document.querySelector('.pagination_count').innerHTML = (chat_id ? count_ : url.searchParams.get('q'));
			var apiUrl;

            if (chat_id) {
                apiUrl = `${settings.api}/api/profile_genesis/?chat_id=` + chat_id + '&depth=' + depth + '&from=' + url.searchParams.get('f') + '&count=' + count_;
            } else if (userIdFrom) {
                apiUrl = `${settings.api}/api/profile_genesis/?uuid=` + userIdFrom + '&depth=' + depth + '&up=' + up + '&down=' + down;
            } else if (all) {
                apiUrl = `${settings.api}/api/profile_genesis/all/?fmt=d3js&rod=on` + (withalone ? `&withalone=on` : '');
            }

document.addEventListener("popstate",function(e){
    alert('yeees!');
},false);

var isTrust;

let map_latitude;
let map_longitude;
let new_map = document.querySelector('#new_map');

// --- let it authorize  (ES) --
//
function getCookieObject(name) {

    // Полагаю, что в куке всегда объект, его и возвращаю, если
    // в строке куки имеется преобразуемый из json объект, или
    // undefined, если кука не найдена или не преобразуется в объект

    let result = undefined;
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));

    if (matches) {
        let value = decodeURIComponent(matches[1]);
        if (value.match(new RegExp(`^[\"\'\`].+[\"\'\`]$`))) {
            // строка в кавычках типа:
            // "{\"provider\": \"telegram\"\054 \"user_uuid\": \"...\"\054 \"auth_token\": \"...\"}"
            value = eval (value);
        }
        try {
            result = JSON.parse(value);
        } catch (error) {
            console.log(error);
        }
    }

    return result;
}

var auth_data_ = getCookieObject('auth_data');
var auth_token_ = auth_data_ ? auth_data_.auth_token : '';
var d3_json_params = {};

if (auth_token_) {
    d3_json_params = {
        headers: new Headers({
            'Authorization': `Token ${auth_token_}`
        })
    };
}
//
// --- let it authorize --

function nodeType({uuid, is_in_page}) {
    let nodeType = NODE_TYPES.USER;

    if (all || chat_id && !is_in_page) {
        nodeType = NODE_TYPES.FILTERED;
    } else if (uuid !== userIdFrom) {
        nodeType = NODE_TYPES.FRIEND;
    }

    return nodeType;
}

function no_photo({gender, is_dead}) {
    const leftPattern = 'no-photo-gender';

    let sex = 'none';

    switch (gender) {
        case 'm':
            sex = 'male';
            break;
        case 'f':
            sex = 'female';
            break;
    }

    let result = `${leftPattern}-${sex}${is_dead ? '-dead' : ''}.jpg`;
    result = `${settings.api}/media/images/${result}`;

    return result;
}

const image = d => d.photo || no_photo(d);

function cacheBase64Url(afunc) {
    const cache = new Map();

    async function awrapper(url, callback) {
        if (cache.has(url)) {
            const cached = cache.get(url);

            return callback ? callback(cached) : cached;
        }

        const base64Url = await afunc(url, callback);

        cache.set(url, base64Url);

        return base64Url;
    }

    return awrapper;
}

const noPhotoBase64Url = cacheBase64Url(urlAsBase64);

d3.json(apiUrl, d3_json_params)
    .then(async (data) => {
	//добавить пользователей в вершины
        const filterUser = ({uuid}) => !nodes.some(({id}) => id === uuid);
        const updateUrl = node => dataUrl => (node.base64Url = dataUrl);

	data.users.filter(filterUser).forEach(d => {
            const node = {
                id: d.uuid,
                nodeType: nodeType(d),
                image: image(d),
                base64Url: '',
                text: `${d.first_name} `,
                is_dead: d.is_dead
            };

            const base64UrlSetter = d.photo ? urlAsBase64 : noPhotoBase64Url;

            base64UrlSetter(node.image, updateUrl(node));

            nodes.push(node);
	});

	if (!window.location.href.includes('gen')) {
            let selected_val_num = +url.searchParams.get('q');
            let but_next = document.querySelector('#btn_next');

            // Если chat_id, то число юзеров на странице может быть больше,
            // чем заказано участников группы в выпадающем списке.
            // Сколько всего, есть в ответе от апи: data.participants_on_page

            data_users_length = chat_id ? data.participants_on_page : data.users.length;

            if (data_users_length == selected_val_num) {
                but_next.style.background = '#8b0000';
                but_next.style.cursor = 'pointer';
                but_next.style.pointerEvents = 'all';
            }
            else if (data_users_length < selected_val_num){
                but_next.style.background = '#aaa0a0';
                but_next.style.cursor = 'context-menu';
                but_next.style.pointerEvents = 'none';
            }
	}

	data.connections.forEach(d => {
            d.is_trust = true;
            let reverse_is_trust = d.is_trust;

            data.connections.forEach(dd => {
                if (d.source == dd.target && d.target == dd.source && dd.is_trust != null){
                    reverse_is_trust = dd.is_trust;
                }
            });

            links.push({
                source: d.source,
                target: d.target,
                is_trust: d.is_trust,
                reverse_is_trust: reverse_is_trust
            });
	});

	//зафиксировать вершины пользователя, желаний и ключей

	nodes.forEach(function(d) {
		switch(d.id){
		case userIdFrom:
			d.fx = width / 2;
			d.fy = height / 2;
			break;
		case WISHES_ROOT_ID:
			d.fx = width<900 ? width / 2+150 : width / 2 + 400;
			d.fy = width<900 ? height/2+50 : height / 2 + 200;
			break;
		case ABILITIES_ROOT_ID:
			d.fx = width<900 ? width / 2+150 : width / 2 + 400;
			d.fy = width<900 ? height/2-10 : height / 2;
			break;
		case SHARE_ID:
			d.fx = width<900 ? width/2+80 : width / 2 + 300;
			d.fy = height / 2 - 300;
			break;
		case FILTER_ID:
			d.fx = width<900 ? width/2+170 : width / 2 + 400;
			d.fy = height / 2 - 300;
			break;
		case OPTIONS_ID:
			d.fx = width<900 ? 10 : width / 2 - 400;
			d.fy = height / 2 - 300;
			break;
		case INVITE_ID:
				d.fx = width<900 ? width/2-20 : width / 2 - 200;
				d.fy = height / 2 - 300;
				break;
		case HOME_ID:

			d.fx = width<900 ? width/2-81 :width / 2 - 300;
			d.fy = height / 2 - 300;

			break;
		/*case GENESIS_ID:
			if(!window.location.href.includes('gen')){
			d.fx = width<900 ? 20 :width / 2+100;
			d.fy = height / 2 - 250;
			}
			break;*/

		case MAPS_ID:
			d.fx = width<900 ? width/2+30 : width / 2 - 50;
			d.fy = height / 2 - 300;
			break;
		/*case PLUS_ID:
			d.fx = width<900 ? width/2+50 : width/2+80;
			d.fy = height/2;
			break;*/
		case TRUST_ID:
			d.fx = width<900 ? width / 2 + 30 :  width / 2 + 50;
			d.fy = width<900 ? height/2+65 : height / 2 + 120;
			break;
		case MISTRUST_ID:
			d.fx = width<900 ? width / 2 - 30 :  width / 2 - 50;
			d.fy = width<900 ? height/2+65 : height / 2 + 120;
			break;
		case PROFILE.id:
			if (userIdFrom && userIdFrom != PROFILE.id) {
				d.fx = width<900 ? width / 2 - 100 : width / 2 - 200;
				d.fy = height / 2;
			} else {
				d.fx = width / 2;
				d.fy = height / 2;
			}

			break;
		}
	});
/*
	if(width<900){
		simulation = d3.forceSimulation(nodes);
		simulation.force("link", d3.forceLink(links).id(d => d.id).distance(30).links(links)); //distance(150)
		simulation.force("charge", d3.forceManyBody().strength(-400)); //0.5
		//simulation.force("center", d3.forceCenter(width / 2, height / 2))
		simulation.force("collide", d3.forceCollide().strength(0.4).radius(45).iterations(1));//radius 55  strength(0.6)
		simulation.force("x", d3.forceX(width / 2).strength(0.5)); //strength(0.2))
		simulation.force("y", d3.forceY(height / 2).strength(0.5)); // strength(0.2))
	}
	else if(width < 3000) {
		simulation = d3.forceSimulation(nodes);
		simulation.force("link", d3.forceLink(links).id(d => d.id).strength(0.6));
		simulation.force("charge", d3.forceManyBody().strength(-450));
	//	simulation.force("collide", d3.forceCollide().strength(5).radius(20));//.iterations(1));//radius 80  strength(0.6)
		simulation.force("x", d3.forceX(width / 2));
		simulation.force("y", d3.forceY(height / 2));
	}
	else{
		simulation = d3.forceSimulation(nodes);
		simulation.force("x", d3.forceX(width / 2).strength(0.03))
		simulation.force("y", d3.forceY(height / 2).strength(0.03))
		simulation.force("link", d3.forceLink(links).id(d => d.id).iterations(100).distance(500).strength(0.1))
		simulation.force("charge", d3.forceManyBody().strength(-800)) //.distanceMax(500))
		simulation.force("collide", d3.forceCollide().strength(1).radius(300))//.iterations(1))
	}
*/

	simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).strength(0.6));
	simulation.force("charge", d3.forceManyBody().strength(-1450));
	simulation.force("x", d3.forceX(width / 2));
	simulation.force("y", d3.forceY(height / 2));

	initializeDisplay();
	initializeSimulation();
});

function initializeSimulation() {
  simulation.nodes(nodes);
  simulation.alpha(1).restart();
  simulation.on("tick", ticked);
}

const ZOOM_MIN = 0.08;
const ZOOM_MAX = 2;

var zoom = d3.zoom().scaleExtent([ZOOM_MIN, ZOOM_MAX]);
zoom.on('zoom', ({transform: {x, y, k}}) => svg.attr('transform', `translate(${x}, ${y}) scale(${k})`));

function drag(simulation) {
	function dragstarted(e, d) {
		!e.active && simulation.alphaTarget(0.3).restart();
	}
	
	const dragged = ({x, y}, d) => { d.fx = x; d.fy = y; };
	
	var bstop = false
	const dragended = ({}) => { 
		if (bstop) { 
			simulation.alphaTarget(1).restart()
			bstop = false } 
			else { 
				simulation.stop() 
				bstop = true } 
	};

	let behavior = d3.drag();
	behavior.on('start', dragstarted);
	behavior.on('drag', dragged);
	behavior.on('end', dragended);

	return behavior;
}

const EXPORT_ID = 'export';

const EXPORT_FORMATS = Object.freeze({
    PNG: 'png',
});

const selectSvg = (id) => d3.select(`#${id}`);

function serializeSvg(repr) {
    const XMLNS = 'http://www.w3.org/2000/xmlns/';
    const XLINKNS = 'http://www.w3.org/1999/xlink';
    const SVGNS = 'http://www.w3.org/2000/svg';

    const replaceFragments = true;

    function replacingFragments(walker, fragment) {
        while (walker.nextNode())
            for (const attr of walker.currentNode.attributes) {
                if (!attr.value.includes(fragment)) continue;

                attr.value = attr.value.replace(fragment, '#');
            }
    }

    const node = typeof repr === 'string' ? selectSvg(repr).node() : repr.node();

    const fragment = `${window.location.href}#`;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

    replaceFragments && replacingFragments(walker, fragment);

    node.setAttributeNS(XMLNS, 'xmlns', SVGNS);
    node.setAttributeNS(XMLNS, 'xmlns:xlink', XLINKNS);

    return (new XMLSerializer).serializeToString(node);
}

const asBase64 = string => btoa(unescape(encodeURIComponent(string)));

async function blobAsBase64(blob, callback) {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const base64 = btoa(String.fromCharCode(...uint8Array));
    const base64DataUrl = `data:${blob.type};base64,${base64}`;

    return callback ? callback(base64DataUrl) : base64DataUrl;
}

async function urlAsBase64(url, callback) {
    const response = await fetch(url);
    const blob = await response.blob();

    return await blobAsBase64(blob, callback);
}

SVGRect.prototype.toString = function() {
    return `${this.x} ${this.y} ${this.width} ${this.height}`;
};

function prepareSvg(id) {
    // hide context menu
    d3.select('body').node().click();

    const full = d3.select('g').node().getBBox();

    const prepared = selectSvg('main').clone([true])
        .attr('id', EXPORT_ID).attr('display', 'none');

    prepared.attr('viewBox', full.toString());

    const svg_elem = prepared.selectAll('.svg_elem').data(nodes);

    svg_elem.select('image').attr('href', ({base64Url}) => base64Url);

    const userXY = width < 900 ? '-32px' : '-64px';
    const userWH = width < 900 ? '64px' : '128px';

    const friendXY = width < 900 ? '-18px' : '-32px';
    const friendWH = width < 900 ? '35px' : '64px';

    svg_elem.select('.userPortrait')
        .attr('x', userXY).attr('y', userXY)
        .attr('width', userWH).attr('height', userWH);

    svg_elem.selectAll('.friendPortrait')
        .attr('x', friendXY).attr('y', friendXY)
        .attr('width', friendWH).attr('height', friendWH);

    svg_elem.selectAll('text').attr('text-anchor', 'middle');

    return prepared;
}

// https://observablehq.com/@shan/save-high-resolution-png-with-imported-image
const PNG_PRECISION = 4;

const PNG_PRECISION_LIMITS = Object.freeze({
    MIN: 1,
    MAX: 8
});

console.assert(PNG_PRECISION_LIMITS.MIN <= PNG_PRECISION <= PNG_PRECISION_LIMITS.MAX);

function context2d(w, h, dpi) {
    !dpi && (dpi = devicePixelRatio);

    const canvas = document.createElement('canvas');
    canvas.width = w * dpi;
    canvas.height = h * dpi;
    canvas.style.width = `${w}px`;

    const context = canvas.getContext('2d');
    context.scale(dpi, dpi);

    return context;
}

function makePngBlob(precision, callback, saveAspectRatio=true) {
    let pngBlob = {};

    const outWidth = width * precision;
    const outHeight = saveAspectRatio ? outWidth : height * precision;

    const ctx = context2d(outWidth, outHeight);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, outWidth, outHeight);

    const png = new Image();

    function maker() {
        ctx.drawImage(png, 0, 0, outWidth, outHeight);

        ctx.canvas.toBlob(blob => {
            pngBlob = blob;

            return callback && callback(pngBlob);
        });
    }

    const prepared = prepareSvg('main');
    const base64 = asBase64(serializeSvg(prepared));

    png.src = `data:image/svg+xml;base64,${base64}`;

    png.complete ? maker() : png.onload = maker;

    return pngBlob;
}

function download(object, format, callback) {
    object = object instanceof Blob ? URL.createObjectURL(object) : object;

    const link = document.createElement('a');
    link.href = object;
    link.download = `Название.${format.toLowerCase()}`;

    // some browser needs the anchor to be in the doc
    document.body.append(link);

    link.click(); link.remove();

    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(link.href), 7000);

    return callback && callback();
}

const EXPORTS = {
    [EXPORT_FORMATS.PNG]: (cb) => makePngBlob(PNG_PRECISION, cb),
};

function makeBlob(format, callback) {
    if (!EXPORTS.hasOwnProperty(format))
        throw new Error('Unknown format');

    return EXPORTS[format](callback);
}

function exporting(to) {
    const afterDownload = () => selectSvg(EXPORT_ID).remove();

    const callDownload = (blob) => download(blob, to, afterDownload);

    return makeBlob(to, callDownload);
}

const menuItems = [
    {
        title: 'Экспорт в PNG',
        action: () => exporting(EXPORT_FORMATS.PNG)
    },
];

const MENU_LAYOUT = Object.freeze({
    FILL: 'white',
    STROKE: '#00557d',
    BORDERRADIUS: '2px',
    ENTRY: {
        WIDTH: 158,
        HEIGHT: 30,
        OFFSET: {
            RX: 2,
            X: 0,
            Y: 30
        },
        CURSOR: 'pointer'
    },
    TEXT: {
        FILL: '#00557d',
        STROKE: '#00557d',
        FONTSIZE: '20px',
        DX: 11,
        DY: 21,
        OFFSET: {
            X: 0,
            Y: 30
        },
        CURSOR: 'pointer'
    }
});

function menuFactory(svgId, x, y, items) {
    const hide = () => d3.select('#contextMenu').remove();
    const callAction = (d, {action}) => action();

    const offset = (src, value) => (d, i) => src + i * value;

    hide();

    selectSvg(svgId)
        .append('g').attr('id', 'contextMenu')
        .attr('fill', MENU_LAYOUT.FILL)
        .attr('stroke', MENU_LAYOUT.STROKE)
        .attr('border-radius', MENU_LAYOUT.BORDERRADIUS)
        .selectAll('tmp')
        .data(items).enter()
        .append('g').attr('class', 'menuEntry');

    d3.selectAll('.menuEntry')
        .append('rect')
        .attr('x', offset(x, MENU_LAYOUT.ENTRY.OFFSET.X))
        .attr('y', offset(y, MENU_LAYOUT.ENTRY.OFFSET.Y))
        .attr('rx', MENU_LAYOUT.ENTRY.OFFSET.RX)
        .attr('width', MENU_LAYOUT.ENTRY.WIDTH)
        .attr('height', MENU_LAYOUT.ENTRY.HEIGHT)
        .attr('cursor', MENU_LAYOUT.ENTRY.CURSOR)
        .on('click', callAction);

    d3.selectAll('.menuEntry')
        .append('text')
        .text(({title}) => title)
        .attr('x', offset(x, MENU_LAYOUT.TEXT.OFFSET.X))
        .attr('y', offset(y, MENU_LAYOUT.TEXT.OFFSET.Y))
        .attr('dx', MENU_LAYOUT.TEXT.DX)
        .attr('dy', MENU_LAYOUT.TEXT.DY)
        .attr('fill', MENU_LAYOUT.TEXT.FILL)
        .attr('stroke', MENU_LAYOUT.TEXT.STROKE)
        .attr('font-size', MENU_LAYOUT.TEXT.FONTSIZE)
        .attr('cursor', MENU_LAYOUT.TEXT.CURSOR)
        .on('click', callAction);

    d3.select('body').on('click', hide);
}

function createContextMenu(d, svgId, items) {
    d.preventDefault();

    return menuFactory(svgId, d.pageX, d.pageY, items);
}

function initializeDisplay() {
        svg = svg.call(zoom)
                .on('contextmenu', (d) => createContextMenu(d, 'main', menuItems))
                .append('g');

	link = svg.append("g")
		.selectAll("g")
		.data(links)
		.join("g")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);

	link.append("svg:defs")
		.append("linearGradient")
		.attr('id', d => `grad_from_${d.source.id}_to_${d.target.id}`)
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2)
		.selectAll("stop")
		.data(d => [[1, d.reverse_is_trust], [2, d.is_trust]])
		.join("stop")
		.attr('offset', d => d[0] == 1 ? '0%' : '100%')
		.attr('style', d => {
                    const color = d[1] || d[3] ? 'green' : 'red';

                    return `stop-color: ${color}; stop-opacity: 1`;
		});

	link.append("svg:line")
		.attr("class", "link")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2)
		.attr("stroke", d => {
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST || d.target.nodeType == NODE_TYPES.FILTERED){
				if (d.is_trust == d.reverse_is_trust || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST){
					if(d.is_trust || d.source.nodeType == NODE_TYPES.TRUST){
						if(!window.location.href.includes('gen')){
						return "#1c8401";
						}else{
							return "#3548db";
						}
					} else{
						return "#ff0000";
					}
				} else {
					return `url(#grad_from_${d.source.id}_to_${d.target.id})`;
				}
			} else {
				return "#345334";
			}
		})
		.attr("marker-end", d => {
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST || d.target.nodeType == NODE_TYPES.FILTERED){
				if (d.is_trust || d.source.nodeType == NODE_TYPES.TRUST){
					if(!window.location.href.includes('gen')){
					return "url(#arrow-trust)";
					}else{
						return "url(#arrow-gen)";
					}
				} else{
					return "url(#arrow-mistrust)";
				}
			} else {
				return "url(#arrow-to-other)";
			}
		});

	node = svg.append('g')
		.selectAll('g')
		.data(nodes)
		.join('g')
		.attr('onclick', d => `onNodeClick('${d.id}', '${d.nodeType}')`)
	        .attr('class', 'svg_elem')
		.attr('style', 'cursor: pointer')
        	.call(drag(simulation));

	const defs = node.append('defs').attr('id', 'imgdefs');

        initDefClipPaths(defs, node);

	node.append('image').attr('href', ({image}) => image)
		.attr('class', ({nodeType}) => imageClass(nodeType))
		.attr('style', 'z-index: 1; position: relative;')
		.attr('clip-path', ({nodeType, is_dead}) => {
                    let size = '';

                    (nodeType == NODE_TYPES.FILTERED) && (size = 'small');

                    switch (nodeType) {
                        case NODE_TYPES.FRIEND: {
                            size = width < 900 ? 'small' : 'medium';
                            break;
                        }
                        case NODE_TYPES.USER:
                        case NODE_TYPES.PROFILE: {
                            size = width < 900 ? 'medium': 'large';
                            break;
                        }
                    }

                    return is_dead ? '' : `url(#clip-circle-${size})`;
        	});

	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 5 : 10))
		.attr('font-size', width < 900 ? 15 : 20)
		.attr('class', ({nodeType}) => [NODE_TYPES.USER, NODE_TYPES.PROFILE].includes(nodeType) ? 'userName' : 'friendName')
		.text(({tspan}) => tspan);

	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width < 900 || d.nodeType == NODE_TYPES.PROFILE && width < 900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20 : 47))
		.attr('font-size', ({nodeType}) => (width < 900 || nodeType == NODE_TYPES.FILTERED) ? 12 : 20)
		.attr('class', ({nodeType}) => [NODE_TYPES.USER, NODE_TYPES.PROFILE].includes(nodeType) ? 'userNameShadow' : 'friendNameShadow')
		.text(({text}) => text);

	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width < 900 || d.nodeType == NODE_TYPES.PROFILE && width < 900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64: d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20 : 47))
		.attr('font-size', ({nodeType}) => (width < 900 || nodeType == NODE_TYPES.FILTERED) ? 12 : 20)
		.attr('class', ({nodeType}) => [NODE_TYPES.USER, NODE_TYPES.PROFILE].includes(nodeType) ? 'userName' : 'friendName')
		.text(({text}) => text);
}

const isUserOrProfile = (nodeType) => nodeType === NODE_TYPES.USER || nodeType === NODE_TYPES.PROFILE;

const degree = (nodeType) => width < 900 && isUserOrProfile(nodeType) ? 30 : isUserOrProfile(nodeType) ? 64 : nodeType === NODE_TYPES.FILTERED && width < 900 ? 16 : 32;

const length = (lWidth, lHeight) => Math.sqrt(lWidth * lWidth + lHeight * lHeight);

function relativeX({source: {nodeType}, source, target}) {
  const sourceX = source.x, targetX = target.x;
  
  const lWidth = Math.abs(targetX - sourceX);
  const lLength = length(lWidth, Math.abs(target.y - source.y));
  
  if (!lLength) return [sourceX, targetX, 0, 0];
  
  const cosA = lWidth / lLength;
  const relX = cosA * degree(nodeType);
  
  return [sourceX, targetX, lLength, relX];
}

function relativeY({source: {nodeType}, source, target}) {
  const sourceY = source.y, targetY = target.y;
  
  const lHeight = Math.abs(targetY - sourceY);
  const lLength = length(Math.abs(target.x - source.x), lHeight);
  
  if (!lLength) return [sourceY, targetY, 0, 0];
  
  const sinA = lHeight / lLength;
  const relY = sinA * degree(nodeType);
  
  return [sourceY, targetY, lLength, relY];
}

const sign = (left, right) => left > right ? 1 : -1;

function fullTransform() {
  node.attr('transform', ({x, y}) => `translate(${x}, ${y})`);

  const x1 = (d) => {
    const [sourceX, targetX, lLength, relX] = relativeX(d);

    if (!lLength) return 0;

    const x1 = sourceX + sign(targetX, sourceX) * relX;

    return x1;
  };

  const y1 = (d) => {
    const [sourceY, targetY, lLength, relY] = relativeY(d);

    if (!lLength) return 0;

    const y1 = sourceY + sign(targetY, sourceY) * relY;

    return y1;
  };

  const x2 = (d) => {
    const [sourceX, targetX, lLength, relX] = relativeX(d);

    if (!lLength) return 0;

    const x2 = targetX + -sign(targetX, sourceX) * relX;

    return x2;
  };

  const y2 = (d) => {
    const [sourceY, targetY, lLength, relY] = relativeY(d);

    if (!lLength) return 0;

    const y2 = targetY + -sign(targetY, sourceY) * relY;

    return y2;
  };

  let g = link.selectAll('g');
  g.attr('x1', x1);
  g.attr('y1', y1);
  g.attr('x2', x2);
  g.attr('y2', y2);

  let linearGradient = link.selectAll('linearGradient');
  linearGradient.attr('x1', x1);
  linearGradient.attr('y1', y1);
  linearGradient.attr('x2', x2);
  linearGradient.attr('y2', y2);

  let line = link.selectAll('line');
  line.attr('x1', x1);
  line.attr('y1', y1);
  line.attr('x2', x2);
  line.attr('y2', y2);

  let newLink = link.selectAll('line');
  newLink.attr('x1', x1);
  newLink.attr('y1', y1);
  newLink.attr('x2', x2);
  newLink.attr('y2', y2);
}

function boundedNodeTransform({nodeType, x, y}) {
  const newX = Math.min(Math.max(30, x), width - 30);
  const newY = y < 15 && width < 900 ? 15 : y < 0 ? 0 : (y > height - 20 && width < 900 ? height - 20 : y > height - 70 && width > 900 ? height - 70 : y);

  if (isUserOrProfile(nodeType)) {
    simulation.force('x').x(newX);
    simulation.force('y').y(newY);
  }

  return `translate(${newX}, ${newY})`;
}

function boundedTransform() {
  node.attr('transform', boundedNodeTransform);

  let g = link.selectAll('g');
  g.attr('x1', calcX1);
  g.attr('y1', calcY1);
  g.attr('x2', calcX2);
  g.attr('y2', calcY2);

  let linearGradient = link.selectAll('linearGradient');
  linearGradient.attr('x1', calcX1);
  linearGradient.attr('y1', calcY1);
  linearGradient.attr('x2', calcX2);
  linearGradient.attr('y2', calcY2);

  let line = link.selectAll("line");
  line.attr('x1', calcX1);
  line.attr('y1', calcY1);
  line.attr('x2', calcX2);
  line.attr('y2', calcY2);
}

const ticked = fullTransform;

function calcX1(d) {
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
        var lLength = Math.sqrt(lWidth * lWidth + lHeight * lHeight);

        if (!lLength) return 0;

	var cosA = lWidth / lLength;
	var relX = (d.source.nodeType == NODE_TYPES.USER && width<900 || d.source.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.source.nodeType == NODE_TYPES.USER || d.source.nodeType == NODE_TYPES.PROFILE ? 64 : d.source.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 :  32) * cosA;//64
	var x = targetX > sourceX ? sourceX + relX : sourceX - relX;

	return x;
}

function calcY1(d) {
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
        var lLength = Math.sqrt(lWidth * lWidth + lHeight * lHeight);

        if (!lLength) return 0;

	var sinA = lHeight / lLength;
	var relY = (d.source.nodeType == NODE_TYPES.USER && width<900 || d.source.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.source.nodeType == NODE_TYPES.USER || d.source.nodeType == NODE_TYPES.PROFILE  ? 64 : d.source.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 : 32) * sinA;
        var y = targetY > sourceY ? sourceY + relY : sourceY - relY;

	return y;
}

function calcX2(d) {
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt(lWidth * lWidth + lHeight * lHeight);

        if (!lLength) return 0;

	var cosA = lWidth / lLength;
	var relX = (d.target.nodeType == NODE_TYPES.USER && width<900 || d.target.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.PROFILE ? 64 : d.target.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 : 32) * cosA;
        var x = targetX > sourceX ? targetX - relX : targetX + relX;

	return x;
}

function calcY2(d) {
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
        var lLength = Math.sqrt(lWidth * lWidth + lHeight * lHeight);

        if (!lLength) return 0;

	var sinA = lHeight / lLength;
	var relY = (d.target.nodeType == NODE_TYPES.USER && width<900 || d.target.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.PROFILE ? 64 : d.target.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 : 32) * sinA;
	var y = targetY > sourceY ? targetY - relY : targetY + relY;

	return y;
} 

d3.select(window).on('resize', () => {
  width = +svg.node().getBoundingClientRect().width;
  height = +svg.node().getBoundingClientRect().height;
  simulation.alpha(1).restart();
});

function initDefs() {
	const defs = svg.append("defs");

	defs.append("marker")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("id", "arrow-to-other")
		.attr("viewBox", "0 -5 10 20")
		.attr("refX", "10")
		.attr("refY", "0")
		.attr("markerWidth", "20")
		.attr("markerHeight", "20")
		.attr("orient", "auto")
		.append("path")
		.attr("fill", "#345334")
		.attr("d", "M0,-5 L10,0 L0,5");

	defs.append("marker")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("id", "arrow-trust")
		.attr("viewBox", "0 -5 10 20")
		.attr("refX", "10")
		.attr("refY", "0")
		.attr("markerWidth", "20")
		.attr("markerHeight", "20")
		.attr("orient", "auto")
		.append("path")
		.attr("fill", "#1c8401")
		.attr("d", "M0,-5 L10,0 L0,5");

	defs.append("marker")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("id", "arrow-gen")
		.attr("viewBox", "0 -5 10 20")
		.attr("refX", "10")
		.attr("refY", "0")
		.attr("markerWidth", "20")
		.attr("markerHeight", "20")
		.attr("orient", "auto")
		.append("path")
		.attr("fill", "#3b59d6")
		.attr("d", "M0,-5 L10,0 L0,5");

	defs.append("marker")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("id", "arrow-mistrust")
		.attr("viewBox", "0 -5 10 20")
		.attr("refX", "10")
		.attr("refY", "0")
		.attr("markerWidth", "20")
		.attr("markerHeight", "20")
		.attr("orient", "auto")
		.append("path")
		.attr("fill", "#ff0000")
		.attr("d", "M0,-5 L10,0 L0,5");

	defs.append("marker")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("id", "arrow-other")
		.attr("viewBox", "0 -5 10 20")
		.attr("refX", "10")
		.attr("refY", "0")
		.attr("markerWidth", "20")
		.attr("markerHeight", "20")
		.attr("orient", "auto")
		.append("path")
		.attr("fill", "#345334")
		.attr("d", "M0,-5 L10,0 L0,5");

	defs.append("clipPath")
		.attr("id", "friendCircle")
		.append("circle")
		.attr("cx", "0")
		.attr("cy", "0")
		.attr("r", "32")
		.attr("fill", "#ff0000");

	defs.append("clipPath")
		.attr("id", "userCircle")
		.append("circle")
		.attr("cx", "0")
		.attr("cy", "0")
		.attr("r", "64")
		.attr("fill", "#ff0000");

	defs.append("clipPath")
		.attr("id", "filteredCircle")
		.append("circle")
		.attr("cx", "0")
		.attr("cy", "0")
		.attr("r", "16")
		.attr("fill", "#ff0000");
}

function initDefClipPaths(defs, node) {
    const sizes = ['small', 'medium', 'large'];
    let radius = 16;
    const idPattern = 'clip-circle-';

    for (const size of sizes) {
        const id = `${idPattern}${size}`;

        const clipPath = defs.append('clipPath').attr('id', id);
        clipPath.append('circle').attr('r', radius);

        node.append('use').attr('href', `#${id}`);

        radius *= 2;
    }
}

function imageClass(nodeType) {
    const hasFilter = localStorage.getItem('filter');

    let nodeClass = 'friendPortrait';

    switch (nodeType) {
        case NODE_TYPES.USER:
        case NODE_TYPES.PROFILE: {
            nodeClass = 'userPortrait';
            break;
        }
        case NODE_TYPES.FILTERED: {
            nodeClass = 'filtered';
            break;
        }
        case NODE_TYPES.FRIEND: {
            hasFilter && (nodeClass += ' friend');
            break;
        }
        case NODE_TYPES.FILTER: {
            hasFilter && (nodeClass += ' active_filer_icon');
            break;
        }
    }

    return nodeClass;
}

function onNodeClick(uuid, nodeType) {
    const allowed = [NODE_TYPES.PROFILE, NODE_TYPES.FRIEND, NODE_TYPES.FILTERED];
    if (!allowed.includes(nodeType)) return;

    const protocol = settings.url.protocol;
    const host = settings.url.host;
    const pathname = settings.url.pathname;

    const newUrl = new URL(`${protocol}//${host}${pathname}`);

    newUrl.searchParams.append('id', uuid);
    newUrl.searchParams.append('depth', chat_id ? 1 : 2);
    newUrl.searchParams.append('up', up);
    newUrl.searchParams.append('down', down);

    window.location.href = newUrl.href;
}


const NODE_TYPES = Object.freeze({
	"USER":"user",
	"FRIEND":"friend",
	"WISH_ROOT": "wish_root",
	"WISH":"wish",
	"KEY_ROOT":"key_root",
	"KEY":"key",
	"ABILITY_ROOT":"ability_root",
	"ABILITY":"ability",
	"AUTH": "auth_root",
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
const KEYS_ROOT_ID = "KEYS_ROOT";
const ABILITIES_ROOT_ID = "ABILITIES_ROOT";
const ABILITY_ID = "ABILITY";
const AUTH_ID = "AUTH_ROOT";
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
	id: "",
	text: "",
	tabil: " ",
	image: "",
	count: "",
	nodeType: NODE_TYPES.PROFILE
}
let w = window.innerWidth;
let h = window.innerHeight;
var svg = d3.select("#main").attr("viewBox", "0 0 " + w + " " + h )
			.attr("preserveAspectRatio", "xMidYMid meet");
var width = +svg.node().getBoundingClientRect().width;
var height = +svg.node().getBoundingClientRect().height;
var link;
var node;
var nodes = [];
var links = [];
var simulation;



// all dialog elements
var rootDialog = document.getElementById("rootDialog");
var addElementDialog = document.getElementById("addElementDialog");
var filterDialog = document.getElementById("filterDialog");

//root stuff
var rootList = document.getElementById("rootList");
var rootAddElementMenu = document.getElementById("rootAddElementMenu");
var addElement = document.getElementById("addElement");
var elementAddInput = document.getElementById("elementAddInput");

var keyTypesBtns = document.getElementById("keyTypesBtns");


//filter stuff
var filterInput = document.getElementById("filterInput");
var settings;
settingSets.forEach((setting, i) => {
	if (setting.url.substr(0, setting.url.length - 1) == window.location.origin) {
		settings = setting;
	}
});




// register sw
window.addEventListener('load', async () => {
	if ('serviceWorker' in navigator) {
		if (url == settings.url) {
			await navigator.serviceWorker.register('./sw.js')
		}
	}
})


setTimeout(() => {
	if(false){
    }
}, 2000)


// add wish menu button
rootAddElementMenu.addEventListener("click", () => {
	elementAddInput.value = "";
	elementAddInput.id = "elementAddInput";
	addElementDialog.style.display = "flex";
})

// add wish
addElement.addEventListener("click", async () => {
	var fetchSettings
	if (elementAddInput.getAttribute(`category`) == 'keys') {
		fetchSettings = {
			apiurl: "",
			body: {
				value: elementAddInput.value,
				type_id: elementAddInput.getAttribute("keytype")
			}
		}
		if (elementAddInput.getAttribute("operation")) {
			fetchSettings.apiurl = "updatekey"
			fetchSettings.body['id'] = elementAddInput.id
		} else {
			fetchSettings.apiurl = "addkey"
		}
	}
	else if (elementAddInput.getAttribute(`category`) == 'wishes') {
		fetchSettings = {
			apiurl: "addorupdatewish",
			body: {
				"uuid": elementAddInput.id != "elementAddInput" ? elementAddInput.id : uuidv4(),
				"text": elementAddInput.value,
				"last_edit": Math.floor(new Date().getTime()/1000)
			}
		}
	}
	else if (elementAddInput.getAttribute(`category`) == 'abilities') {
		fetchSettings = {
			apiurl: "addorupdateability",
			body: {
				"uuid": elementAddInput.id != "elementAddInput" ? elementAddInput.id : uuidv4(),
				"text": elementAddInput.value,
				"last_edit": Math.floor(new Date().getTime()/1000)
			}
		}
	}

});


//filter
document.getElementById("filterSearch").addEventListener("click", () => {
	if (filterInput.value != "") {
		url.searchParams.set('f', 0);
		url.searchParams.set('q', 5);
		localStorage.setItem("filter", filterInput.value);
		window.location.href = url.href;
	}
});

document.getElementById("filterNullify").addEventListener("click", () => {
	if (localStorage.getItem("filter") != null) {
		localStorage.removeItem("filter")
		window.location.reload()
	}
})

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
var url = new URL(link);

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
                apiUrl = `${settings.api}api/profile_genesis/?&chat_id=` + chat_id + '&depth=' + depth + '&from=' + url.searchParams.get('f') + '&count=' + count_;
            } else if (userIdFrom) {
                // apiUrl = `${settings.api}api/profile_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&uuid=` + userIdFrom;
                apiUrl = `${settings.api}api/profile_genesis/?&uuid=` + userIdFrom + '&depth=' + depth + '&up=' + up + '&down=' + down;
                //console.log(apiUrl);
            } else if (all) {
                // apiUrl = `${settings.api}api/profile_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&uuid=` + userIdFrom;
                apiUrl = `${settings.api}api/profile_genesis/all/?fmt=d3js&rod=on` + (withalone ? `&withalone=on` : '');
                //console.log(apiUrl);
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
var d3_json_parms = {};
if (auth_token_) {
    d3_json_parms = {
        headers: new Headers({
            'Authorization': 'Token ' + auth_token_
        })
    };
}
//
// --- let it authorize --

function no_photo (d) {
    let result = `no-photo-gender-none.jpg`;
    if (!d.is_dead && !d.gender) {
        // result = `no-photo-gender-none.jpg`;
    } else if (!d.is_dead && d.gender == 'm') {
        result = `no-photo-gender-male.jpg`;
    } else if (!d.is_dead && d.gender == 'f') {
        result = `no-photo-gender-female.jpg`;
    } else if (d.is_dead && !d.gender) {
        result = `no-photo-gender-none-dead.jpg`;
    } else if (d.is_dead && d.gender == 'm') {
        result = `no-photo-gender-male-dead.jpg`;
    } else if (d.is_dead && d.gender == 'f') {
        result = `no-photo-gender-female-dead.jpg`;
    }
    result = `${settings.url}images/` + result;
    return result;
}

d3.json(apiUrl, d3_json_parms)
	.then(async function(data) {

		//добавить пользователей в вершины
	data.users.forEach(function(d){
		if (!nodes.some(user => user.id == d.uuid)) {
			
			var str = d.photo;
			var extArray = str.split(".");
			var ext = extArray[extArray.length - 1];
		
			var replacement = "media"; 
			var toReplace = "thumb"; 
			var str1 = str.replace(replacement, toReplace);
			
            var nd = NODE_TYPES.USER;
            if (all || chat_id && !d.is_in_page) {
                nd = NODE_TYPES.FILTERED;
            } else if (d.uuid != userIdFrom) {
                nd = NODE_TYPES.FRIEND;
            }
			nodes.push ({
				id: d.uuid,
				text: (d.first_name + " "),
				image: d.photo == '' ? no_photo(d) : width<900 && d.photo.includes('media') ? str1+"/35x35~crop~12."+ext : width>900 && d.photo.includes('media') ? str1+"/64x64~crop~12."+ext : d.photo,
				nodeType: nd,
			   is_dead: d.is_dead,
			});
			
			
		}
	});
		
	if(!window.location.href.includes('gen')){
	let selected_val_num = +url.searchParams.get('q');
	let but_next = document.querySelector('#btn_next');

    // Если chat_id, то число юзеров на странице может быть больше,
    // чем заказано участников группы в выпадающем списке.
    // Сколько всего, есть в ответе от апи: data.participants_on_page
    //
    data_users_length = chat_id ? data.participants_on_page : data.users.length;

    if(data_users_length == selected_val_num){
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

	

	data.connections.forEach(function(d){
        d.is_trust = true;
        var reverse_is_trust = d.is_trust;
        data.connections.forEach(function(dd){
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
		case KEYS_ROOT_ID:
			d.fx = width<900 ? width / 2+150 : width / 2 + 400;
			d.fy = width<900 ? height/2-70 : height / 2 - 200;
			break;
		case ABILITIES_ROOT_ID:
			d.fx = width<900 ? width / 2+150 : width / 2 + 400;
			d.fy = width<900 ? height/2-10 : height / 2;
			break;
		case ABILITY_ID:
			d.fx = width / 2 + 500;
			d.fy = height / 2;
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
		case AUTH_ID:
			if (!userIdFrom) {
				d.fx = width / 2;
				d.fy = height / 2;
			}
			else {
				d.fx = width / 2 - 200;
				d.fy = height / 2;
			}
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
	
	if(width<900){
		simulation = d3.forceSimulation(nodes);
		simulation.force("link", d3.forceLink(links).id(d => d.id).distance(30).links(links)); //distance(150)
		simulation.force("charge", d3.forceManyBody().strength(-400)); //0.5
		//simulation.force("center", d3.forceCenter(width / 2, height / 2))
		simulation.force("collide", d3.forceCollide().strength(0.4).radius(45).iterations(1));//radius 55  strength(0.6)
		simulation.force("x", d3.forceX(width / 2).strength(0.5)); //strength(0.2))
		simulation.force("y", d3.forceY(height / 2).strength(0.5)); // strength(0.2))
	}	
	else{
		const simulation = d3.forceSimulation(nodes)
		.force("x", d3.forceX(width / 2).strength(0.03))
		.force("y", d3.forceY(height / 2).strength(0.03))
		.force("link", d3.forceLink(links).id(d => d.id).iterations(100).distance(500).strength(0.1))
		.force("charge", d3.forceManyBody().strength(-800)) //.distanceMax(500))
		.force("collide", d3.forceCollide().strength(1).radius(300))//.iterations(1))
		.on("tick", ticked);
		
/*
	simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).strength(0.6));
	simulation.force("charge", d3.forceManyBody().strength(-450));
//	simulation.force("collide", d3.forceCollide().strength(5).radius(20));//.iterations(1));//radius 80  strength(0.6)
	simulation.force("x", d3.forceX(width / 2));
	simulation.force("y", d3.forceY(height / 2));		
 */
	}

	initializeDisplay();
	initializeSimulation();
});


function initializeSimulation() {
	simulation.nodes(nodes);
	simulation.alpha(1).restart();
	simulation.on("tick", ticked);
}

drag = simulation => {
  
	function dragstarted(event, d) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(event, d) {
		d.fx = event.x;
		d.fy = event.y;
	}

	function dragended(event, d) {
		if (!event.active) simulation.alphaTarget(0);
		//d.fx = null;
		//d.fy = null;
		/*if(d.nodeType == NODE_TYPES.PLUS){
			d.fx = width<900 ? width/2+50 : width/2+80;
			d.fy = height/2;
		}*/
		
	}

	return d3.drag()
	  .on("start", dragstarted)
	  .on("drag", dragged)
	  .on("end", dragended);
}

function initializeDisplay() {

	link = svg.append("g")
		.selectAll("g")
		.data(links)
		.join("g")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
		//.attr("id", "lallaal");
		
	link.append("svg:defs")
		.append("linearGradient")
		.attr("id", d => ("grad_from_" + d.source.id + "_to_" + d.target.id))
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2)
		.selectAll("stop")
		.data(d => {
			return [[1,d.reverse_is_trust], [2,d.is_trust]/*, [3, d.fam_link]*/];
		})
		.join("stop")
		.attr("offset", d => (d[0] == 1 ? "0%" : "100%"))
		.attr("style", d => {
			if (d[1]){
				return "stop-color:rgb(0,255,0);stop-opacity:1";
			}
		else if(d[3]){
			return "stop-color:rgb(0,255,0);stop-opacity:1";
		}
		else {
				return "stop-color:rgb(255,0,0);stop-opacity:1";
			}
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
					return "url(#grad_from_" + d.source.id + "_to_" + d.target.id + ")";
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

	node = svg.append("g")
		.selectAll("g")
		.data(nodes)
		.join("g")
		.attr("onclick", d => `onNodeClick("${d.nodeType}", "${d.id}", "${d.text}")`)
		.call(drag(simulation))
		.attr('class', 'svg_elem')
		.attr('style', "cursor:pointer");
	 
	
	var defs = node.append("defs").attr("id", "imgdefs")
	
	
	clipPath = defs.append('clipPath').attr('id', "clip-circle-medium");
			clipPath.append("circle")
    		.attr("r", 32)
	
	clipPath1 = defs.append('clipPath').attr('id', "clip-circle-small");
			clipPath1.append("circle")
    		.attr("r", 16)
	
	clipPath2 = defs.append('clipPath').attr('id', "clip-circle-large");
			clipPath2.append("circle")
    		.attr("r", 64)
	
		node.append("image")
		.attr("xlink:href", d => d.image)
		.attr("class", d => {
			if (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE) {
				return "userPortrait";
			}
			else if (d.nodeType == NODE_TYPES.FILTERED) {
				return "filtered";
			}
			else if(localStorage.getItem('filter') && d.nodeType == NODE_TYPES.FRIEND){
        			return "friendPortrait friend";
    			}
			else if(localStorage.getItem('filter') && d.nodeType == NODE_TYPES.FILTER){
        			return "friendPortrait active_filer_icon";
    			}
    			
			else {
				return "friendPortrait";
			}
		})
		.attr("style", "z-index:1;position:relative")
		.attr("clip-path", d => {
		if(width>900 && d.nodeType == NODE_TYPES.FRIEND){
			return d.is_dead ? "" : "url(#clip-circle-medium)";
		}else if(width<900 && d.nodeType == NODE_TYPES.FRIEND){
			return d.is_dead ? "" : "url(#clip-circle-small)";
		}else if (width>900 && (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE)) {
			return d.is_dead ? "" : "url(#clip-circle-large)";
		}else if (width<900 && (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE)) {
			return d.is_dead ? "" : "url(#clip-circle-medium)";
		}else if (d.nodeType == NODE_TYPES.FILTERED) {
			return d.is_dead ? "" : "url(#clip-circle-small)";
		}
		
	});
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : width<900 ? 5 : 10))
		.attr("font-size", width<900 ? "15" : "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userName" : "friendName"))
		.text(d => (d.tspan));
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20  : 47))
		.attr("font-size", d => (width<900 || d.nodeType == NODE_TYPES.FILTERED ? '12' : "20"))
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	
	  
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64: d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20 : 47))
		.attr("font-size", d => (width<900 || d.nodeType == NODE_TYPES.FILTERED ? '12' : "20"))
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userName" : "friendName"))
		.text(d => (d.text));
	

}

function ticked() {
	node.attr("transform", d => `translate(${d.x},${d.y})`);
	link.selectAll("line")
		.attr("x1", d => d.source.x)
		.attr("y1", d => d.source.y)
		.attr("x2", d => d.target.x)
		.attr("y2", d => d.target.y);
/*
	node.attr("transform", d => {
		var x = (d.x < 30 ? 30 : (d.x > width-30 ? width-30 : d.x));
		var y = (d.y < 15 && width<900 ? 15 : d.y < 0 ? 0 : (d.y > height-20 && width<900 ? height-20 : d.y > height-70 && width>900 ? height-70 : d.y));
		if (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE){
			simulation.force("x").x(x);
			simulation.force("y").y(y);
		}
		return `translate(${x},${y})`;
	});
	
	link.selectAll("g")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
		
	
	link.selectAll("linearGradient")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
		
	link.selectAll("line")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
*/
}

function calcX1(d){
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var cosA = lWidth / lLength;
	var relX = (d.source.nodeType == NODE_TYPES.USER && width<900 || d.source.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.source.nodeType == NODE_TYPES.USER || d.source.nodeType == NODE_TYPES.PROFILE ? 64 : d.source.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 :  32) * cosA;//64
	var x;
	if (targetX > sourceX){
		x = sourceX + relX;
	} else {
		x = sourceX - relX;
	}
	return x;
}

function calcY1(d){
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var sinA = lHeight / lLength;
	var relY = (d.source.nodeType == NODE_TYPES.USER && width<900 || d.source.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.source.nodeType == NODE_TYPES.USER || d.source.nodeType == NODE_TYPES.PROFILE  ? 64 : d.source.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 : 32) * sinA;
	var y;
	if (targetY > sourceY){
		y = sourceY + relY;
	} else {
		y = sourceY - relY;
	}
	return y;

}

function calcX2(d){
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var cosA = lWidth / lLength;
	var relX = (d.target.nodeType == NODE_TYPES.USER && width<900 || d.target.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.PROFILE ? 64 : d.target.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 : 32) * cosA;
	var x;
	if (targetX > sourceX){
		x = targetX - relX;
	} else {
		x = targetX + relX;
	}
	return x;

}

function calcY2(d){
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 ? 0 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width ? width : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 ? 0 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var sinA = lHeight / lLength;
	var relY = (d.target.nodeType == NODE_TYPES.USER && width<900 || d.target.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.PROFILE ? 64 : d.target.nodeType == NODE_TYPES.FILTERED ? 16 : width<900 ? 16 : 32) * sinA;
	var y;
	if (targetY > sourceY){
		y = targetY - relY;
	} else {
		y = targetY + relY;
	}
	
	return y;
}


d3.select(window).on("resize", function(){
	width = +svg.node().getBoundingClientRect().width;
	height = +svg.node().getBoundingClientRect().height;
	simulation.alpha(1).restart();
});

function initDefs(){
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

var tgIframe;
async function onNodeClick(nodeType, uuid, txt){
	if(nodeType == NODE_TYPES.KEY){
		copyToClipboard(txt);
	} else if (nodeType == NODE_TYPES.PROFILE || nodeType == NODE_TYPES.FRIEND || nodeType == NODE_TYPES.FILTERED) {
        url.searchParams.set('f', 0);
        window.location.href = `${settings.url}?id=` + uuid + "&q=" + url.searchParams.get('q') + "&f=" +url.searchParams.get('f') + '&depth=' + (chat_id ? 1 : 3) + '&up=' + up + '&down=' + down;
    }
}

function copyToClipboard(txt){
	navigator.clipboard.writeText(txt)
	.then(() => {
		alert('Скопировано в буффер обмена');
	})
	.catch(err => {
		console.log('Something went wrong', err);
	});
}

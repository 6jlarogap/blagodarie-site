
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

	if (elementAddInput.value != "") {
		const response = await fetch(`${settings.api}api/${fetchSettings.apiurl}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Token ${getCookie("auth_token")}`
			},
			body:  JSON.stringify(fetchSettings.body)
		})
		window.location.reload();
	} else {
		elementAddInput.placeholder = "Введите что-то!"
	}
});

// edit wish buttons
[...document.getElementsByClassName("keytype")].forEach(button => {
	button.addEventListener("click", () => {
		elementAddInput.setAttribute("keytype", button.getAttribute("id"))
	})
})








		



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

// delete profile button
document.getElementById("deleteProfile").addEventListener("click", async () => {
	const result = await fetch(`${settings.api}api/profile`, {
		method: "DELETE",
		headers: {
			"Authorization": `Token ${getCookie("auth_token")}`
		}
	})

	deleteCookie('', 'user_uuid', 'auth_token');

	window.location.href = settings.url;
})

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
}

// get cookie
function getCookie(name) {

    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ))
    return matches ? decodeURIComponent(matches[1]) : false
}

//set cookie
function setAuthCookie(uuid, token) {
	var expires = new Date();
	expires.setMonth(expires.getMonth() + 1);
	var UTSexpires = expires.toUTCString();

	document.cookie = `user_uuid=${uuid}; path=/; expires=${UTSexpires}`;
	document.cookie = `auth_token=${token}; path=/; expires=${UTSexpires}`;
}

// delete cookie
function deleteCookie(subdomain,...Cookies) {
	var domain = new URL(settings.url).origin.substr(8)
	Cookies.forEach(cookie => {
		document.cookie = `${cookie}=''; path=/ ; ${subdomain === '' ? '' : `domain=${subdomain + domain};` }expires=${new Date(0).toUTCString()}`
	})
}
let map_users = [];
let response_smat_map;
async function setProfile() {
	const response = await fetch(`${settings.api}api/profile_graph?uuid=${getCookie("user_uuid")}`/*`${settings.api}api/getprofileinfo?uuid=${getCookie("user_uuid")}`*/, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());
	
	var str = response.users[0].photo;
	var extArray = str.split(".");
	var ext = extArray[extArray.length - 1];
		
	var replacement = "media"; 
	var toReplace = "thumb"; 
	var str1 = str.replace(replacement, toReplace);
	
	PROFILE.text = response.users[0].first_name;
	PROFILE.abil = response.users[0].ability;
	PROFILE.image = response.users[0].photo == '' ? `${settings.url}images/default_avatar.png` : width<900 && response.users[0].photo.includes('media') ? str1+"/64x64~crop~12."+ext : width>900 && response.users[0].photo.includes('media') ?  str1+"/128x128~crop~12."+ext : response.users[0].photo;
	PROFILE.id = getCookie("user_uuid");
	//PROFILE.tabil = response.trust_count;
	console.log(response.users.trust_count);
	console.log(response.users);
	console.log(response.users.ability);
	if(response.users[0].latitude!=null){
		map_users.push({
		user_photo: response.users[0].photo,
		user_name: response.users[0].first_name,
		user_lastname: response.users[0].last_name,
		user_latitude: response.users[0].latitude,
		user_longitude: response.users[0].longitude,
		user_ability: response.users[0].ability,
		user_uuid: response.users[0].uuid
	} );
	}
	
	response_smat_map = map_users;
	console.log(map_users);
}
/*async function setProfilesLinks(){
	const response = await fetch(`${settings.api}api/getstats/user_connections_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());
	response.connections.forEach(function(d){
		if (d.is_trust != null){
			var reverse_is_trust = d.is_trust;
			response.connections.forEach(function(dd){
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
		}
	});
}*/




/*
async function add_gen(){
		const response = await fetch(`${settings.api}api/profile`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Token ${getCookie("auth_token")}`
		},
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "first_name": "123"})
	}).then(data => data.json());
}
if(window.location.href.includes('gen')){
	add_gen();
}
*/


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

let get_position = document.querySelector('#get_position');
let mapid = document.querySelector('#mapid');
let map_container = document.querySelector('.map_container');
let mapid_close = document.querySelector('.mapid_close');
let mapid_send = document.querySelector('.mapid_send');
let mapid_clean = document.querySelector('.mapid_clean');
//let lati = response_smat_map[0].user_latitude;
//let long = response_smat_map[0].user_longtitude;
let new_cur_pos_marker_lat;
let new_cur_pos_marker_lng;
let mapid_alert = document.querySelector('.mapid_alert');
let mapid_whereI = document.querySelector('.mapid_whereI');

//if(response_smat_map[0].user_latitude != null){
//	let lati = +response_smat_map[0].user_latitude;
//	let long = +response_smat_map[0].user_longtitude;

	let lati;
	let long;



if(get_position){
get_position.addEventListener('click', ()=>{
	get_cur_position();
});
}


function get_cur_position(){

navigator.geolocation.getCurrentPosition(
    function(position) {
	    console.log(position.coords);
	   /* if(response_smat_map[0].user_latitude != null){
	    	lati = +response_smat_map[0].user_latitude;
		long = +response_smat_map[0].user_longitude;*/
	   // }else{
	    lati = position.coords.latitude;
	    long = position.coords.longitude;
	    //}
	    show_smart_map(lati, long);
    },
    function(error){
	    if(response_smat_map[0].user_latitude != null){
			lati = +response_smat_map[0].user_latitude;
			long = +response_smat_map[0].user_longitude;
		    show_smart_map(lati, long);
		}
	    show_smart_map(53.89948354993688, 27.557659149169925);
	    mapid_whereI.style.display = 'none';
    }
);

}

function show_smart_map(lati, long){
	
	map_container.style.display = "block";
	if(document.querySelector('#mapid').hasChildNodes()){}
	else{
		/*if(response_smat_map[0].user_latitude != null){
			let lati = +response_smat_map[0].user_latitude;
			let long = +response_smat_map[0].user_longitude;
		}*/
		
	mapid = L.map('mapid').setView([lati, long], 13);
		
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlraXRhbGFzdCIsImEiOiJja3UwYmtnbjYwOWo0MnZvMTJ3ZTRiY3ZhIn0.5YnAsUvxjkv-oyTUmD-Kxw', {
    		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    		maxZoom: 18,
    		id: 'mapbox/streets-v11',
    		tileSize: 512,
    		zoomOffset: -1,
    		accessToken: 'pk.eyJ1IjoibmlraXRhbGFzdCIsImEiOiJja3UwYmtnbjYwOWo0MnZvMTJ3ZTRiY3ZhIn0.5YnAsUvxjkv-oyTUmD-Kxw'
	}).addTo(mapid);
	var marker = L.marker([lati, long]).addTo(mapid);
	let new_cur_pos_marker;
	function onMapClick(e) {
    		marker.setLatLng(e.latlng)
        	new_cur_pos_marker = marker.getLatLng();
		new_cur_pos_marker_lat = new_cur_pos_marker.lat;
		new_cur_pos_marker_lng = new_cur_pos_marker.lng;
        		
		
		
		
		mapid_whereI.addEventListener('click', ()=> {
		navigator.geolocation.getCurrentPosition(
    			function(position) {
	    			lati = position.coords.latitude;
	    			long = position.coords.longitude;
				marker.setLatLng([lati, long]);
				new_cur_pos_marker = marker.getLatLng();
				new_cur_pos_marker_lat = new_cur_pos_marker.lat;
				new_cur_pos_marker_lng = new_cur_pos_marker.lng;
	    		},
    			function(error){
	    			show_smart_map(53.89948354993688, 27.557659149169925);
				mapid_whereI.style.display = 'none';
    			}
			);
		});
		
		
		
	}
	}
	console.log('before ' + lati, long);
	
	
	
	
	
	mapid.on('click', onMapClick);
	mapid_close.addEventListener('click', ()=> {
		map_container.style.display = "none";
	});
	
}


document.querySelector(".mapid_send").addEventListener("click", async () => {
			const response = await fetch(`${settings.api}api/profile`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Token ${getCookie("auth_token")}`
		},
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "latitude": new_cur_pos_marker_lat ? new_cur_pos_marker_lat : lati ? lati : null , "longitude": new_cur_pos_marker_lng ? new_cur_pos_marker_lng : long ? long : null })
	}).then(data => data.json());
	mapid_alert.style.display = "block";
	setTimeout(function(){
		mapid_alert.style.transition = "1s";
		mapid_alert.style.opacity = "1";
	}, 200);
	setTimeout(function(){
		mapid_alert.style.transition = "1s";
		mapid_alert.style.opacity = "0";
	}, 2500);
	setTimeout(function(){
		//mapid_alert.style.display = "none";
		window.location.reload()
	}, 3500)
});



document.querySelector(".mapid_clean").addEventListener("click", async () => {
			const response = await fetch(`${settings.api}api/profile`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Token ${getCookie("auth_token")}`
		},
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "latitude": null , "longitude": null })
	}).then(data => data.json());
	//map_container.style.display = "none";
	lati = null;
	long = null;
	new_cur_pos_marker_lat = null;
	new_cur_pos_marker_lng = null;
	window.location.reload()
});

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
                apiUrl = `${settings.api}api/profile_genesis?&chat_id=` + chat_id + '&depth=' + depth + '&from=' + url.searchParams.get('f') + '&count=' + count_;
            } else if (userIdFrom) {
                // apiUrl = `${settings.api}api/profile_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&uuid=` + userIdFrom;
                apiUrl = `${settings.api}api/profile_genesis?&uuid=` + userIdFrom + '&depth=' + depth + '&up=' + up + '&down=' + down;
                //console.log(apiUrl);
            } else if (all) {
                // apiUrl = `${settings.api}api/profile_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&uuid=` + userIdFrom;
                apiUrl = `${settings.api}api/profile_genesis/all/?fmt=d3js&rod=on` + (withalone ? `&withalone=on` : '');
                //console.log(apiUrl);
            }



document.addEventListener("popstate",function(e){
    alert('yeees!');
},false);




var isConnection;
var isTrust;




let map_latitude;
let map_longitude;
let new_map = document.querySelector('#new_map');
d3.json(apiUrl)
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
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : width<900 && d.photo.includes('media') ? str1+"/35x35~crop~12."+ext : width>900 && d.photo.includes('media') ? str1+"/64x64~crop~12."+ext : d.photo,
				nodeType: nd
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

	simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).strength(0.6));
	simulation.force("charge", d3.forceManyBody().strength(-450));
//	simulation.force("collide", d3.forceCollide().strength(5).radius(20));//.iterations(1));//radius 80  strength(0.6)
	simulation.force("x", d3.forceX(width / 2));
	simulation.force("y", d3.forceY(height / 2));		
		
		
/*
	simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).strength(0.6));
	simulation.force("charge", d3.forceManyBody().strength(-450));
	simulation.force("x", d3.forceX(width / 2));
	simulation.force("y", d3.forceY(height / 2));	

simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(150).links(links)); //distance(150)
	simulation.force("charge", d3.forceManyBody().strength(0.5));
	simulation.force("center", d3.forceCenter(width / 2, height / 2));
	simulation.force("collide", d3.forceCollide().strength(0.4).radius(80).iterations(1));//radius 80  strength(0.6)
	simulation.force("x", d3.forceX(width / 2).strength(0.5)); //strength(0.2))
	simulation.force("y", d3.forceY(height / 2).strength(0.5)); // strength(0.2))
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
			return "url(#clip-circle-medium)";
		}else if(width<900 && d.nodeType == NODE_TYPES.FRIEND){
			return "url(#clip-circle-small)";
		}else if (width>900 && (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE)) {
			return "url(#clip-circle-large)";
		}else if (width<900 && (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE)) {
			return "url(#clip-circle-medium)";
		}else if (d.nodeType == NODE_TYPES.FILTERED) {
			return "url(#clip-circle-small)";
		}
		
	});
	
	node.append("image")
		.attr("xlink:href", d => {
		if(d.nodeType == NODE_TYPES.HOME){
			return `${window.location.origin}`
		}else if(d.nodeType == NODE_TYPES.INVITE){
			return `${window.location.origin}/gen/?id=${getCookie('user_uuid')}&d=5`
		}else if(d.nodeType == NODE_TYPES.MAPS){
			return `${window.location.href}&map_visible`
		}
		
		else{
			return `${window.location.origin}?id=${d.id}`
		}
		})
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
		.attr("style", "opacity:0;z-index:1000;position:relative");
	
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

async function rootFunctions(category) {
	var categoryObj;
	if (category == 'wishes') {
		categoryObj = {
			apiurl: 'getuserwishes',
			delete: 'deletewish?uuid=',
			id: 'uuid',
			value: 'text',
			empty: 'желаний'
		};
		elementAddInput.setAttribute("placeholder", "Потребность...");
		elementAddInput.setAttribute("category", category);
	}
	else if (category == 'keys') {
		categoryObj = {
			apiurl: 'getuserkeys',
			delete: 'deletekey?id=',
			id: 'id',
			value: 'value',
			type: 'type_id',
			empty: 'ключей'
		};
		elementAddInput.setAttribute("placeholder", "Контакт...");
		elementAddInput.setAttribute("category", category);
	}
	else {
		categoryObj = {
			apiurl: 'getuserabilities',
			delete: 'deleteability?uuid=',
			id: 'uuid',
			value: 'text',
			empty: 'возможностей'
		};
		elementAddInput.setAttribute("placeholder", "Возможность...");
		elementAddInput.setAttribute("category", category);
	}


	var root = await getElements(categoryObj.apiurl)
	root = root[category]
		if (root.length == 0) {
			rootList.innerHTML = `<li> У вас пока что нет ${categoryObj.empty} </li>`
		} else {
			rootList.innerHTML = ""
			root.forEach(wish => {
				rootList.innerHTML += `<li id="${wish[categoryObj.id]}" value="${wish[categoryObj.value]}" typekey="${categoryObj.type ? wish[categoryObj.type] : 0}">${wish[categoryObj.value]}<button class="editElement btn btn-success">Ред.</button> <button class="deleteWish btn btn-danger">Уд.</button> </li>`
			})
		};

		[...document.getElementsByClassName("editElement")].forEach(button => {
			button.addEventListener("click", () => {
				elementAddInput.id = button.parentElement.id;
				elementAddInput.setAttribute("keytype", button.parentElement.getAttribute("typekey"));
				elementAddInput.setAttribute("operation", "edit");
				elementAddInput.setAttribute("category", category);
				elementAddInput.value = button.parentElement.getAttribute("value");

				addElementDialog.style.display = "flex";
			})
		});

		[...document.getElementsByClassName("deleteWish")].forEach(button => {
			button.addEventListener("click", async () => {
				await deleteElement(button.parentElement.id, categoryObj.delete);
				window.location.reload();
			})
		});

		categoryObj.type ? keyTypesBtns.style.display = "flex" : keyTypesBtns.style.display = "none";
		rootDialog.style.display = "flex";
}

async function deleteElement(uuid, apiurl) {
	const response = await fetch(`${settings.api}api/${apiurl}${uuid}`, {
		method: "GET",
		headers: {
			"Authorization": "Token " + getCookie("auth_token")
		}
	}).then(data => data.json())
}

async function getElements(apiurl) {
	const response = await fetch(`${settings.api}api/${apiurl}?uuid=${getCookie("user_uuid")}`, {
		method: "GET"
	}).then(data => data.json())
	return response
}

async function updateTrust(operationId, referal = null) {
	// if (links.some(link => link.source.id == getCookie("user_uuid") && link.target.id == userIdFrom)) {
	// 	operationId = 4;
	// }

	const response = await fetch(`${settings.api}api/addoperation`, {
		method: "POST",
		headers: {
			"Authorization": "Token " + getCookie("auth_token"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "user_id_to": referal ? referal : userIdFrom, "operation_type_id": operationId}),
	}).then(data => data.json())
	console.log(operationId);
}






/*
async function getProfileInfo(uuid) {
	const response = await fetch(`${settings.api}api/getprofileinfo?uuid=${uuid}`, {
		method: 'GET',
	})
	
	return response
}
*/
async function getReferalToken() {
	const response = await fetch(`${settings.api}api/invite/gettoken`, {
		method: 'POST',
		headers: {
			"Authorization": "Token " + getCookie("auth_token"),
			"content-Type": "application/json"
		}
	}).then(data => data.json())

	return response.token
}

async function useReferalToken() {
	const response = await fetch(`${settings.api}api/invite/usetoken`, {
		method: 'POST',
		headers: {
			"Authorization": "Token " + getCookie("auth_token"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			token: getCookie("invite_token")
		})
	}).then(body => body.json())
}

function setReferal() {
	new Promise(async (resolve, reject) => {
		const res = await useReferalToken(getCookie('invite_token'))
		if (res.ok) {
			resolve(res)
		}
		else {
			reject(res)
		}
	})
	deleteCookie('', 'invite_token')
}

// function setReferal() {
// 	if (getCookie("ref_uuid")) {
// 		var referal = getCookie("ref_uuid");
	
// 		var profileInfo = new Promise(async (resolve, reject) => {
// 			const res = await getProfileInfo(referal);
// 			if (res.ok) {
// 				resolve(true);
// 			}
// 			else {
// 				reject(false);
// 			}
// 		}).then(async res => {
// 			if (res) {
// 				await updateTrust(3, referal);
// 			}
// 			deleteCookie('', 'ref_uuid');
// 		})	
// 	}
// }

function setTrustAfterButton() {
	new Promise(async resolve => {
		if (getCookie("set_trust")) {
			await updateTrust(3);
			deleteCookie("","set_trust");
		}
		else if(getCookie("set_mistrust")) {
			await updateTrust(2);
			deleteCookie("","set_mistrust");
		}
	})
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
// change buttons
setInterval(function(){
	if(document.querySelector('#addElementDialog').style.display == 'flex'){
		let buttons_cont = document.querySelector('#addElementDialog #keyTypesBtns');
		if (buttons_cont.hasChildNodes()) {
  			var children = buttons_cont.childNodes;
		
  			for (var i = 0; i < children.length; ++i) {
						
    				let d = document.querySelector('#addElementDialog .form-control').attributes.keytype.nodeValue;
				if (children[i].id != d){
							children[i].style = 'background: #6c757d';
						}
				else {
					children[i].style = 'background: #6c757d;box-shadow: 0 0 0 0.25rem rgb(130 138 145 / 50%);'
				}
  				}
			}
		}
	else {
		
	}

}, 1000);




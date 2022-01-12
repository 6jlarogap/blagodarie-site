
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



// qrcode generator elements
var qr = document.getElementById('qrcode');
var qrcode = new QRCode(qr);

// all dialog elements
var cardToCard = document.getElementById("cardToCard");
var optionsDialog = document.getElementById("optionsDialog");
var qrDialog = document.getElementById("qrDialog");
var mailDialog = document.getElementById("mailDialog");
var smsDialog = document.getElementById("smsDialog");
var authDialog = document.getElementById("authDialog");
var rootDialog = document.getElementById("rootDialog");
var addElementDialog = document.getElementById("addElementDialog");
var filterDialog = document.getElementById("filterDialog");

//share and invite
var shareDialog = document.getElementById("shareDialog");
var shareGroup = document.getElementById("shareGroup");
var share = Ya.share2(shareGroup);
var shareLink;

//auth buttons

/* comment auth

var vkAuth = document.getElementById("vkAuth");
var yandexAuth = document.getElementById("yandexAuth");
var okAuth = document.getElementById("okAuth");
*/

//agreement stuff
var agreementLink = document.getElementById("agreementLink");
var agreementCheck = document.getElementById("agreementCheck");

//root stuff
var rootList = document.getElementById("rootList");
var rootAddElementMenu = document.getElementById("rootAddElementMenu");
var addElement = document.getElementById("addElement");
var elementAddInput = document.getElementById("elementAddInput");

var keyTypesBtns = document.getElementById("keyTypesBtns");


/*window.onload = (function(){

    document.addEventListener("mouseup", function(evt){
        console.log(evt)
        evt.preventDefault();
        evt.stopPropagation();
    });
    document.addEventListener("contextmenu", function(evt){
      console.log(evt);
      evt.preventDefault();
      evt.stopPropagation();
  });

})();*/




//filter stuff
var filterInput = document.getElementById("filterInput");
var settings;
//settings
 //var settings = settingSets[0];
//var settings;
/*settingSets.forEach((setting, i) => {
	console.log(setting.url.substr(0, setting.url.length - 1));
	console.log(new URL(window.location.href).origin);
	console.log(setting.url.substr(0, setting.url.length - 1) == new URL(window.location.href).origin);
	if (setting.url.substr(0, setting.url.length - 1) == new URL(window.location.href).origin) {
		settings = setting;
		console.log(settings);
	}
})*/
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

//--------------------------------------------------------------------
let deferredPrompt; // Allows to show the install prompt
const installButton = document.getElementById("install_button");

window.addEventListener("beforeinstallprompt", e => {
  console.log("beforeinstallprompt fired");
  // Prevent Chrome 76 and earlier from automatically showing a prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Show the install button
  installButton.hidden = false;
  installButton.addEventListener("click", installApp);
});

function installApp() {
  // Show the prompt
  deferredPrompt.prompt();
  installButton.disabled = true;

  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then(choiceResult => {
    if (choiceResult.outcome === "accepted") {
      console.log("PWA setup accepted");
      installButton.hidden = true;
    } else {
      console.log("PWA setup rejected");
    }
    installButton.disabled = false;
    deferredPrompt = null;
  });
}

window.addEventListener("appinstalled", evt => {
  console.log("appinstalled fired", evt);
});

//--------------------------------------------------------------------

var telegramAuth = document.createElement('script')
telegramAuth.src = "https://telegram.org/js/telegram-widget.js?14"
telegramAuth.setAttribute('data-telegram-login', settings.bot)
telegramAuth.setAttribute('data-size', "large")
telegramAuth.setAttribute('data-onauth', "onTelegramAuth(user)")
telegramAuth.setAttribute('data-request-access', "write")

authDialog.insertBefore(telegramAuth, authDialog.lastElementChild);


setTimeout(() => {
	if(document.getElementById("telegram-login-BlagodarieAuthBot")){
	var tgIframe;
	tgIframe = document.getElementById("telegram-login-BlagodarieAuthBot");
	tgIframe.style.marginTop = '80px';
	tgIframe.style.marginBottom = '0px';
}
}, 2000)

if (getCookie("auth_data")) {
	var auth_data = getCookie("auth_data");
	var user_uuid;
	var auth_token;

	auth_data = auth_data.replace(/\\/g, '');
	auth_data = auth_data.substr(1, auth_data.length - 2);
	auth_data = auth_data.split("\"");

	auth_data.forEach((item, i) => {
		item == "user_uuid" ? user_uuid = auth_data[i + 2] : null
		item == "auth_token" ? auth_token = auth_data[i + 2] : null
	})
	
	setAuthCookie(user_uuid, auth_token);
	deleteCookie('.', 'auth_data');

	// setReferal();
	setTrustAfterButton();
	if (getCookie('invite_token')) {
		setReferal();
	}

	window.location.href = `${settings.url}profile/?id=${getCookie("user_uuid")}`;
}



//auth status
var isAuth = getCookie("auth_token") ? true : false;
deleteCookie("","set_trust", "set_mistrust");


// add event to buttons
//-----------------------------------------------------------------------------------------------
// close buttons
[...document.getElementsByClassName("close")].forEach(button => {
	button.addEventListener("click", () => {
		button.parentElement.style.display = "none";
	});
});

// share buttons
[...document.getElementsByClassName("share")].forEach( share => {
	if (share.id == "qrcode-button") {
		share.addEventListener("click", () => {
			qrDialog.style.display = "flex";
			qrcode.makeCode(shareLink);
		})
	}
	else if (share.id == "mail-button") {
		share.addEventListener("click", () => mailDialog.style.display = "flex");
	}
	else if (share.id == "sms-button") {
		share.addEventListener("click", () => smsDialog.style.display = "flex");
	}
});
//copy



function copyTextf(){
  event.preventDefault();
	var copier = document.querySelector('#copier');
copier.value = window.location.href;
 copier.select();
  document.execCommand("copy");
  copied_alert = document.querySelector('.copied_alert');
  copied_alert.classList.add('active');
  setTimeout(function(){
  	copied_alert.classList.remove('active');
  }, 3000);
}










// share form buttons
[...document.getElementsByClassName("submit-form")].forEach( button => {
	button.addEventListener("click", (event) => {
		event.preventDefault();
		if (button.id == "confrim-mail") {
			var link = document.getElementById("mailLink");
			var message = shareLink;
			message = message.replace('?', '%3F');
			link.href = `mailto:${document.getElementById("mailInput").value}?body=${message}`;
			link.click();
		} else if (button.id == "confrim-sms") {
			var link = document.getElementById("smsLink");
			link.href = `sms:${document.getElementById("smsInput").value}?body=${shareLink}`;
			link.click();
		}
		button.parentElement.parentElement.style.display = "none";
	})
})

// agreement check
agreementCheck.addEventListener("click", () => {
	if (agreementCheck.checked) {
		/*vkAuth.disabled = false;
		yandexAuth.disabled = false;
		okAuth.disabled = false;*/
		tgIframe.style.pointerEvents = '';
		tgIframe.style.opacity = '1';
	}
	else {
		/*vkAuth.disabled = true;
		yandexAuth.disabled = true;
		okAuth.disabled = true;*/
		tgIframe.style.pointerEvents = 'none';
		tgIframe.style.opacity = '0.3';
	}
})

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
				"last_edit": new Date().getTime()
			}
		}
	}
	else if (elementAddInput.getAttribute(`category`) == 'abilities') {
		fetchSettings = {
			apiurl: "addorupdateability",
			body: {
				"uuid": elementAddInput.id != "elementAddInput" ? elementAddInput.id : uuidv4(),
				"text": elementAddInput.value,
				"last_edit": new Date().getTime()
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
		if(!window.location.href.includes('gen')){
		url.searchParams.set('f', 0);
		url.searchParams.set('q', 25);
		}
		localStorage.setItem("filter", filterInput.value);
		window.location.href = url.href;
		
	}
	

	
	
})

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

// exit button
document.getElementById("logOut").addEventListener("click", () => {
	deleteCookie('', 'user_uuid', 'auth_token');
	window.location.href = settings.url;
})

//vk auth
/*
vkAuth.addEventListener("click", () => {
	window.location.href = `https://oauth.vk.com/authorize?client_id=${settings.vk.client_id}&response_type=code&redirect_uri=${settings.vk.redirect_uri}`
})
*/
//yandex auth
/*
yandexAuth.addEventListener("click", () => {
	window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${settings.yandex.client_id}`
})
*/
//ok auth
/*
okAuth.addEventListener("click", () => {
	window.location.href = `http://ok.ru/oauth/authorize?client_id=${settings.ok.client_id}&response_type=code&redirect_uri=${settings.ok.redirect_uri}`
})
*/
document.getElementById("keys").addEventListener("click", async () => {
	await rootFunctions('keys')
})

document.getElementById("abilities").addEventListener("click", async () => {
	await rootFunctions('abilities')
})

document.getElementById("wishes").addEventListener("click", async () => {
	await rootFunctions('wishes')
})

// document.getElementById("invite").addEventListener("click", () => {
// 	copyToClipboard(`${settings.url}?ref_uuid=${PROFILE.id}`)
// })
//-----------------------------------------------------------------------------------------------


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
	
	PROFILE.text = response.users[0].first_name + " " + response.users[0].last_name;
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



//telegram auth
async function onTelegramAuth(user) {
	const response = await fetch(`${settings.api}api/auth/telegram`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(user)
	}).then(data => data.json());
	

	setAuthCookie(response.user_uuid, response.auth_token);

	setReferal();
	setTrustAfterButton();
	if (getCookie('invite_token')) {
		setReferal();
	}

	window.location.href = `${settings.url}profile/?id=${getCookie("user_uuid")}`;
}



initDefs();


if(document.querySelector('.close_auth_dialog')){
	let close_auth_dialog = document.querySelector('.close_auth_dialog');
	close_auth_dialog.addEventListener('click', function(){
		let authDialog = document.querySelector('#authDialog');
		authDialog.style.display = "none";
	})
}



// load the data

var url = new URL(window.location.href);

// var url = new URL('https://dev.blagodarie.org/profile/?id=c03ce3fd-6fda-4112-b1c5-bd9847afee2e');

var referal = url.searchParams.get("ref_uuid");
if (referal && !isAuth) {
	var expires = new Date();
	expires.setMinutes(expires.getMinutes() + 10);
	var UTCSexpires = expires.toUTCString();

	document.cookie = `ref_uuid=${referal}; path=/; expires=${UTCSexpires}`;
}

var invite = url.searchParams.get("invite_token");
if (invite && !isAuth) {
	var expires = new Date();
	expires.setMonth(expires.getMonth() + 1);
	var UTCSexpires = expires.toUTCString();

	document.cookie =`invite_token=${invite}; path=/; expires=${UTCSexpires}`;
}

var userIdFrom = url.searchParams.get("id");
var userIdTo = url.searchParams.get("userIdTo");
var fromApp = url.searchParams.get("from_app");
let my_family_profiles = document.querySelector('#my_family_profiles');
my_family_profiles.addEventListener('click', function(){
	window.location.href = url.origin + '/profiles?id=' + getCookie('user_uuid');
})





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

if(!window.location.href.includes('gen')){
var link = window.location.href;
var url = new URL(link);

       if(!url.searchParams.has('q') && !url.searchParams.has('f')){
		   	url.searchParams.append('q', 25);
			url.searchParams.append('f', 0);
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
	
        function nextPage() {
			let item_plus_int = +url.searchParams.get('f');
			let selected_val = +url.searchParams.get('q');
			item_plus_int += selected_val;
			url.searchParams.set('f', item_plus_int);
			window.location.href = url.href;
        }

        function prevPage() {
			let item_plus_int = +url.searchParams.get('f');
			let selected_val = +url.searchParams.get('q');
			item_plus_int -= selected_val;
			url.searchParams.set('f', item_plus_int);
			window.location.href = url.href;
        }


		document.querySelector('#btn_prev').style.background = '#6a2300;';
		document.querySelector('#btn_prev').style.cursor = 'pointer;';
		document.querySelector('.pagination_count').innerHTML = url.searchParams.get('q');
            var apiUrl = `${settings.api}api/getstats/user_connections_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}`;
		
            if (userIdFrom != null && userIdTo != null && localStorage.getItem('filter') === null) {
                apiUrl = `${settings.api}api/profile_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&uuid=` + userIdFrom + "&uuid_to=" + userIdTo;
                //console.log(apiUrl);
            } else if (userIdFrom != null && localStorage.getItem('filter') === null) {
                apiUrl = `${settings.api}api/profile_graph?from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&uuid=` + userIdFrom;
                //console.log(apiUrl);
				//
            }else if (localStorage.getItem('filter') != null && isAuth && userIdFrom==null){
				apiUrl = `${settings.api}api/profile_graph?uuid=${getCookie('user_uuid')}&from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&query=` + localStorage.getItem('filter');
			}
			else if (localStorage.getItem('filter') != null && isAuth) {
                apiUrl = `${settings.api}api/profile_graph?uuid=${userIdFrom}&from=${url.searchParams.get('f')}&number=${url.searchParams.get('q')}&query=` + localStorage.getItem('filter');
				
                //console.log(apiUrl);
            }
		console.log(apiUrl);
}else{
	 var apiUrl = `${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}`;
}


//контекстное меню




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

	if (isAuth) {
		await setProfile();
		nodes.push(PROFILE);
	}
	
	
	
	
		//добавить пользователей в вершины
	
	data.users.forEach(function(d){
		if (!nodes.some(user => user.id == d.uuid)) {
			
			var str = d.photo;
			var extArray = str.split(".");
			var ext = extArray[extArray.length - 1];
		
			var replacement = "media"; 
			var toReplace = "thumb"; 
			var str1 = str.replace(replacement, toReplace);
			
			if(d.ability === null){
			nodes.push ({
				id: d.uuid,
				text: (d.first_name + " " + d.last_name + " " + " "),
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : width<900 && d.photo.includes('media') ? str1+"/35x35~crop~12."+ext : width>900 && d.photo.includes('media') ? str1+"/64x64~crop~12."+ext : d.photo,
				nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : localStorage.getItem("filter") != null && !(d.first_name + " " + d.last_name).toLowerCase().includes(localStorage.getItem("filter").toLowerCase()) ? NODE_TYPES.FILTERED : NODE_TYPES.FRIEND)
			});
			}else{
				nodes.push ({
				id: d.uuid,
				text: (d.first_name + " " + d.last_name),
				tabil: (d.ability),
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : width<900 && d.photo.includes('media') ? str1+"/35x35~crop~12."+ext : width>900 && d.photo.includes('media') ? str1+"/64x64~crop~12."+ext : d.photo,
				nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : localStorage.getItem("filter") != null && !(d.first_name + " " + d.last_name).toLowerCase().includes(localStorage.getItem("filter").toLowerCase()) ? NODE_TYPES.FILTERED : NODE_TYPES.FRIEND)
			});
			}
			
			
		}
	});
		
	if(!window.location.href.includes('gen')){
	let selected_val_num = +url.searchParams.get('q');
	let but_next = document.querySelector('#btn_next');
	if(data.users.length == selected_val_num){
		but_next.style.background = '#8b0000';
		but_next.style.cursor = 'pointer';
		but_next.style.pointerEvents = 'all';
	}
	else if (data.users.length < selected_val_num){
		but_next.style.background = '#aaa0a0';
		but_next.style.cursor = 'context-menu';
		but_next.style.pointerEvents = 'none';
	}
	}

	/*maps*/
	
	data.users.forEach(function(d){
	if(d.latitude){	
			map_users.push({
				user_photo: d.photo,
				user_name: d.first_name,
				user_lastname: d.last_name,
				user_latitude: d.latitude,
				user_longitude: d.longitude,
				user_ability: d.ability,
				user_uuid: d.uuid
				} );
			
	}	
	});
	
	console.log(data);
	console.log(map_users);
	
	if (data.wishes != null){
		//добавить вершину желаний
		nodes.push({
			id: WISHES_ROOT_ID,
			text: "Потребности",
			image: `${settings.url}images/sleep.png`,
			nodeType: NODE_TYPES.WISH_ROOT
		});
		
		//добавить желания в вершины
		data.wishes.forEach(function(d){
			nodes.push({
				id: `wish_${d.uuid}`,
				text: d.text,
			image: `${settings.url}images/chat-sleep.png`,
			nodeType: NODE_TYPES.WISH
			});
		});
	}

	if (data.abilities != null) {
		// добавить вершину возможностей
		nodes.push({
			id: ABILITIES_ROOT_ID,
			text: "Возможности",
			image: `${settings.url}images/abilities_root.png`,
			nodeType: NODE_TYPES.ABILITY_ROOT
		});

		// добавить возможности в вершины
		data.abilities.forEach(function(d) {
			nodes.push({
				id: `ability_${d.uuid}`,
				text: d.text,
				image: `${settings.url}images/ability.png`,
				nodeType: NODE_TYPES.ABILITY
			});
		});
	}

	if (userIdFrom && !(userIdFrom == PROFILE.id)) {
		isConnection = data.connections.some(link => link.source == PROFILE.id && link.target == userIdFrom);
		
		//data.connections.some(link => PROFILE.count=link.thanks_count && link.source == PROFILE.id && link.target == userIdFrom);
		console.log(data);
		var activeTrust = `${settings.url}images/trust_active.png`;
		var activeMistrust = `${settings.url}images/mistrust_active.png`;
		var inactiveTrust = `${settings.url}images/trust_inactive.png`;
		var inactiveMistrust = `${settings.url}images/mistrust_inactive.png`;

		isConnection ? isTrust = data.connections.some(link => link.source == PROFILE.id && link.target == userIdFrom && link.is_trust) : null;
		
		async function count_plus() {
		const response = await fetch(`${settings.api}api/profile_graph?uuid=` + userIdFrom, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
		}).then(data => data.json());

	if(isAuth){
	let ans = response.connections;
	let ans1 = ans.find(data => {
  
        return data.source === PROFILE.id && data.target === userIdFrom;
    });
	
	if(ans1){
		thank_count_trust = ans1.thanks_count;
	}else{
		thank_count_trust = 0;
	}
	
	if(thank_count_trust >= 1){
		 resp = thank_count_trust;
		
	}
	else{
		 resp = '';
		
	}
	}
	var resp_empty = ""
		
		//добавить вершину доверие/недоверие
		nodes.push({
			id: TRUST_ID,
			text: "Доверие",
			image: !isConnection ? inactiveTrust : isTrust ? activeTrust : inactiveTrust,
			tspan: !isConnection ? resp_empty : isTrust ? resp : resp_empty,
			nodeType: NODE_TYPES.TRUST
		});
		}
		await count_plus()
		nodes.push({
			id: MISTRUST_ID,
			text: "Недоверие",
			image: !isConnection ? inactiveMistrust : isTrust ? inactiveMistrust : activeMistrust,
			nodeType: NODE_TYPES.MISTRUST
		});
	}
	
	
	if (isAuth) {
		// добавить вершину options
		nodes.push({
			id: OPTIONS_ID,
			text: "Опции",
			image: `${settings.url}images/menu.png`,
			nodeType: NODE_TYPES.OPTIONS
		})
	
		//Добавить вершину invite
		nodes.push({
			id: INVITE_ID,
			text: "Род",
			image: `${settings.url}images/genesis.png`,
			nodeType: NODE_TYPES.INVITE
		})
	
	}
	//добавить вершину share
	nodes.push({
		id: SHARE_ID,
		text: "Поделиться",
		image: `${settings.url}images/shareee.png`,
		nodeType: NODE_TYPES.SHARE
	});

	//Добавить вершину home
	if(!window.location.href.includes('gen')){
	nodes.push({
		id: HOME_ID,
		text: "Домой",
		image: `${settings.url}images/home.png`,
		nodeType: NODE_TYPES.HOME
	});
	/*nodes.push({
		id: GENESIS_ID,
		text: "Род",
		image: `${settings.url}images/genesis.png`,
		nodeType: NODE_TYPES.GENESIS
	});*/
	
	}else{
		nodes.push({
		id: HOME_ID,
		text: "Граф",
		image: `${settings.url}images/home.png`,
		nodeType: NODE_TYPES.HOME
	});
	}
	//Добавляем вершину карт
	nodes.push({
		id: MAPS_ID,
		text: "Карта",
		image: `${settings.url}images/map_button.png`,
		nodeType: NODE_TYPES.MAPS
	});
	/*if(!url.searchParams.has('id') || userIdFrom == getCookie('user_uuid')){
	nodes.push({
		id: PLUS_ID,
		plus_text: "+",
		image: `${settings.url}images/plused_icon.png`,
		nodeType: NODE_TYPES.PLUS
	});
	}*/
	//добавить вершину filter
	nodes.push({
		id: FILTER_ID,
		text: "Фильтр",
		image: localStorage.getItem('filter') ? `${settings.url}images/filter_act.png` : `${settings.url}images/filter.png`,
		nodeType: NODE_TYPES.FILTER
	});

	if(data.keys != null){
		//добавить вершину ключей
		nodes.push({
			id: KEYS_ROOT_ID,
			text: "Контакты",
			image: `${settings.url}images/folder-key.png`,
			nodeType: NODE_TYPES.KEY_ROOT
		});
		
		//добавить ключи в вершины
		data.keys.forEach(function(d){
			var image;
			switch (d.type_id) {
			case 1:
				image = `${settings.url}images/phone.png`;
				break;
			case 2:
				image = `${settings.url}images/at.png`;
				break;
			case 4:
				image = `${settings.url}images/credit-card.png`;
				break;
			case 5:
				image = `${settings.url}images/link.png`;
				break;
			}
			nodes.push({
				id: `key_${d.id}`,
				text: `${d.value}`,
				image: image,
				nodeType: NODE_TYPES.KEY
			});
		});
	}
	
	//добавить элемент авторизации
	if (!isAuth) {
		nodes.push({
			id: AUTH_ID,
			text: "",
			image: `${settings.url}images/enter.png`,
			nodeType: NODE_TYPES.AUTH
		});
	}
	if(isAuth && !window.location.href.includes('id') && !window.location.href.includes('gen')){
		async function setProfilesLinks(){
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
		}
		await setProfilesLinks();
	}else{
	data.connections.forEach(function(d){
		if (d.is_trust != null){
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
		}
		/*else if(window.location.href.includes('gen')){
			var fam_link = d.is_trust;
			data.connections.forEach(function(dd){
				if (d.source == dd.target && d.target == dd.source && dd.is_trust != null){
					fam_link = dd.is_trust;
				}
			});
			links.push({
				source: d.source,
				target: d.target,
				is_trust: d.is_trust,
				fam_link: fam_link
			});
			console.log(links);
		}*/
	});
	}
	
	
	if (data.wishes != null){
		//добавить связь пользователя с вершиной желаний
		// links.push({
		// 	source: userIdFrom,
		// 	target: WISHES_ROOT_ID
		// });
		
		//добавить связь вершины желаний с желаниями
		if (data.wishes != null){
			data.wishes.forEach(function(d) {
				links.push({
					source: WISHES_ROOT_ID,
					target: `wish_${d.uuid}`
				});
			});
		}
	}
	
	if (data.wishes != null) {
		// links.push({
		// 	source: userIdFrom,
		// 	target: ABILITIES_ROOT_ID
		// })

		data.abilities.forEach(function(d) {
			links.push({
				source: ABILITIES_ROOT_ID,
				target: `ability_${d.uuid}`
			})
		})
	}

	if (data.keys != null){
		//добавить связь пользователя с вершиной ключей
		// links.push({
		// 	source: userIdFrom,
		// 	target: KEYS_ROOT_ID
		// });
		
		//добавить связь вершины ключей с ключами
		data.keys.forEach(function(d) {
			links.push({
				source: KEYS_ROOT_ID,
				target: `key_${d.id}`
			});
		});
	}
	
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
	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(150).links(links)); //distance(150)
	simulation.force("charge", d3.forceManyBody().strength(0.5));
	//simulation.force("center", d3.forceCenter(width / 2, height / 2))
	simulation.force("collide", d3.forceCollide().strength(0.4).radius(80).iterations(1));//radius 80  strength(0.6)
	simulation.force("x", d3.forceX(width / 2).strength(0.5)); //strength(0.2))
	simulation.force("y", d3.forceY(height / 2).strength(0.5)); // strength(0.2))
	}

	initializeDisplay();
	initializeSimulation();
});









var latlngs = [];
var myIcon;

function show_map_style(){
	for(let i = 0; i<map_users.length; i++){
		if(map_users.length > 0 && map_users[i].user_latitude != null){
			map_latitude = map_users[i].user_latitude;
			map_longitude = map_users[i].user_longitude;
			break;
		}else{
			map_latitude = 49.019638199999996;
			map_longitude = 35.226296399999995;
		}
	}
	
	if(document.querySelector('#new_map').hasChildNodes()){}
	else{
	new_map = L.map('new_map').setView([map_latitude, map_longitude], 13);
	
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmlraXRhbGFzdCIsImEiOiJja3UwYmtnbjYwOWo0MnZvMTJ3ZTRiY3ZhIn0.5YnAsUvxjkv-oyTUmD-Kxw', {
    		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    		maxZoom: 18,
    		id: 'mapbox/streets-v11',
    		tileSize: 512,
    		zoomOffset: -1,
    		accessToken: 'pk.eyJ1IjoibmlraXRhbGFzdCIsImEiOiJja3UwYmtnbjYwOWo0MnZvMTJ3ZTRiY3ZhIn0.5YnAsUvxjkv-oyTUmD-Kxw'
	}).addTo(new_map);
	}
	for(let i = 0; i<map_users.length; i++){
		if(map_users.length > 0 && map_users[i].user_latitude != null){
			setPoints();
			break;
		}else{
			console.log('Нет пользователей с указаным местоположением');
		}
	}
	function setPoints(){
	//if(map_users.length > 0 && map_users[0].user_latitude != null){
		for(let i = 0; i < map_users.length; i++){
			
			myIcon = L.icon({
    				iconUrl: map_users[i].user_photo != '' ? map_users[i].user_photo : `${settings.url}images/default_avatar.png`,
    				iconSize: [38, 38],
    				iconAnchor: [map_users[i].user_latitude, map_users[i].user_longitude],
					className: "myIcon"
			});
			console.log(myIcon);
			var textLatLng = [map_users[i].user_latitude, map_users[i].user_longitude]; 

        		var myTextLabel = L.marker(textLatLng, {icon: L.divIcon({className: 'text-labels', html: `${map_users[i].user_name} ${map_users[i].user_lastname ? map_users[i].user_lastname : ''} </br> ${map_users[i].user_ability ? map_users[i].user_ability : ''}`}),zIndexOffset: 1000})
			.addTo(new_map)
			console.log(myTextLabel);
			
			
			var new_marker = new L.marker([map_users[i].user_latitude, map_users[i].user_longitude], {icon: myIcon, className: 'new_marker'})
			.addTo(new_map);
			//Добавляем юзеров на карту для центровки
			latlngs.push([map_users[i].user_latitude, map_users[i].user_longitude]);
			
			new_marker.addEventListener('click', ()=>{
				window.open(window.location.origin + '/profile/?id=' + map_users[i].user_uuid);
			})
			
			
			
		}
		var polyline = L.polyline(latlngs, {color: 'inherit'}).addTo(new_map);
		new_map.fitBounds(polyline.getBounds());
		
	}
	if(document.querySelector('.new_map_close')){
	let new_map_close = document.querySelector('.new_map_close');
		
	new_map_close.addEventListener('click', ()=>{
		let new_map_container = document.querySelector('.new_map_container');
		url.searchParams.delete('map_visible');
		window.history.pushState(null, null, url.search);
		new_map_container.classList.remove('active');
	})
	}
	}

let new_map_container = document.querySelector('.new_map_container');
if(window.location.href.includes('map_visible')){
	window.onload = function(){
	setTimeout(function(){
		new_map_container.classList.add('active');
		show_map_style();
	},300);
	}
	
}



function newFF(){
	return this.__data__
}







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
		.attr("style", "z-index:1;position:relative");
	
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
		.attr("font-size", width<900 ? '12' : "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	
	/*node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.PLUS ? 0 : 0))
		.attr("font-size", width<900 ? '15' : "23")
		.attr("class", d => (d.nodeType == NODE_TYPES.PLUS ? "friendName" : "friendName"))
		.attr('dominant-baseline', "central")
		.attr("font-weight", 900)
		.attr("fill", "#fff")
		.text(d => (d.plus_text));*/
	  
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64: d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20 : 47))
		.attr("font-size", width<900 ? '12' : "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userName" : "friendName"))
		.text(d => (d.text));
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 45 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  80 : d.nodeType == NODE_TYPES.FILTERED ? 70 : width<900 ? 35 : 70))
		.attr("font-size", width<900 ? "15" : "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "friendName" : "friendName"))
		.text(d => (d.tabil));
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 45 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  90 : d.nodeType == NODE_TYPES.FILTERED ? 90 : 90))
		.attr("font-size", width<900 ? "15" : "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "friendName" : "friendName"))
		.text(d => (d.abil));

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
	} else if (nodeType == NODE_TYPES.FRIEND) {
		if(!window.location.href.includes('gen')){
			url.searchParams.set('f', 0);
			window.location.href = `${settings.url}profile?id=` + uuid + "&q=" + url.searchParams.get('q') + "&f=" +url.searchParams.get('f');
		}else{
			window.location.href = `${settings.url}gen?id=` + uuid;
		}
		
	} else if (nodeType == NODE_TYPES.PROFILE) {
		if(!window.location.href.includes('gen')){
		window.location.href = `${settings.url}profile?id=` + uuid + "&q=" + url.searchParams.get('q') + "&f=" +url.searchParams.get('f');
		}else{
			window.location.href = `${settings.url}gen?id=` + uuid;
		}
	} else if (nodeType == NODE_TYPES.AUTH) {
		authDialog.style.display = "flex";
	
	tgIframe = document.getElementById("telegram-login-BlagodarieAuthBot");
	tgIframe.style.marginTop = '80px';
	tgIframe.style.marginBottom = '0px';
	

	}
	else if (nodeType == NODE_TYPES.FILTERED) {
		if(!window.location.href.includes('gen')){
		window.location.href = `${settings.url}profile?id=` + uuid + "&q=" + url.searchParams.get('q') + "&f=" +url.searchParams.get('f');
		}else{
			window.location.href = `${settings.url}gen?id=` + uuid;
		}
	}
	else if(nodeType == NODE_TYPES.FILTER) {
		
		if (localStorage.getItem("filter")) {
			filterInput.value = localStorage.getItem("filter");
		}
		filterDialog.style.display = "flex";
		
	}
	else if (nodeType == NODE_TYPES.SHARE) {
		share.updateContent({
			url: window.location.href
		});
		shareLink = window.location.href + '/?gay=123';
		shareDialog.style.display = "flex";
	}
	else if(nodeType == NODE_TYPES.INVITE) {
		/*shareLink = settings.url + `?invite_token=${await getReferalToken()}`;
		share.updateContent({
			title: document.querySelector(".userName").textContent + ' предлагает Вам своё доверие в системе Благодари.РФ',
			url: shareLink
			
		});
		shareDialog.style.display = "flex";*/
		window.location.href = url.origin + '/gen/?id=' + getCookie("user_uuid");
	}
	else if (nodeType == NODE_TYPES.OPTIONS) {
		optionsDialog.style.display = "flex";
	}
	else if(nodeType == NODE_TYPES.HOME) {
		window.location.href = settings.url
	}
	/*else if(nodeType == NODE_TYPES.GENESIS) {
		window.location.href = url.origin + '/gen';
	}*/
	else if(nodeType == NODE_TYPES.MAPS){
		
		url.searchParams.append('map_visible', 'true');
		window.history.pushState(null, null, url.search);
		window.location.href = url.href;
		
	}/*else if(nodeType == NODE_TYPES.PLUS){
		let trust_plus_dialog = document.querySelector('#trust_plus');
		trust_plus_dialog.style.display = "flex";
		modalTrustPlus();
	}*/
	else if (nodeType == NODE_TYPES.TRUST) {
		if (isAuth) {
			if (isConnection) {
				if (isTrust) {
					await updateTrust(5);
					
					
				}
				else {
					
					await updateTrust(4);
					await updateTrust(5);
				}
			}
			else {
				
				await updateTrust(5);
				
			}
			
			
			window.location.reload();
		}
		else {
			deleteCookie("","set_mistrust");
			document.cookie = `set_trust=${userIdFrom}; path=/;`;
			authDialog.style.display = "flex";
		}
	}
	else if (nodeType == NODE_TYPES.MISTRUST) {
		if (isAuth) {
			if (isConnection) {
				if (!isTrust) {
					await updateTrust(4);
					
				}
				else {
					await updateTrust(4);
					await updateTrust(2);
					
				}
			}
			else {
				await updateTrust(2);
				
			}
			
			window.location.reload();
		}
		else {
			deleteCookie("","set_trust");
			document.cookie = `set_mistrust=${userIdFrom}; path=/;`;
			authDialog.style.display = "flex";
		}
	}
	else if (nodeType == NODE_TYPES.ABILITY_ROOT && getCookie("user_uuid") == userIdFrom) {
		await rootFunctions('abilities')
	}
	else if (nodeType == NODE_TYPES.WISH_ROOT && getCookie("user_uuid") == userIdFrom) {
		await rootFunctions('wishes');
	}
	else if (nodeType == NODE_TYPES.KEY_ROOT && getCookie("user_uuid") == userIdFrom) {
		await rootFunctions('keys');
	}
}
//Открытие профиля в новой вкладке

/*window.onload = function(){
	setTimeout(function(){

	let svg_elem_click = document.querySelectorAll('.svg_elem');
	
	for(let i = 0; i<svg_elem_click.length; i++){
		if(svg_elem_click[i].__data__.nodeType == 'profile_root' || svg_elem_click[i].__data__.nodeType == 'friend'){
		svg_elem_click[i].addEventListener('contextmenu', function(e){
			
			console.log(e)
			e.preventDefault();
			console.log(this.querySelector('image'))
			let friendID = svg_elem_click[i].__data__.id;
			if(url.searchParams.has('id')){
				url.searchParams.set('id', friendID);
				window.open(url.href, '_blank');
			}else{
				url.searchParams.append('id', friendID);
				window.open(url.href, '_blank');
			}
		})
		}
	}
	
	let svg_elem_img = document.querySelectorAll('.svg_elem image');
	
	for(let i = 0; i<svg_elem_img.length; i++){
		if(svg_elem_img[i].__data__.nodeType == 'profile_root' || svg_elem_img[i].__data__.nodeType == 'friend'){
		svg_elem_img[i].addEventListener('contextmenu', function(e){
			console.log(e)
			e.preventDefault();
			let friendID = svg_elem_img[i].__data__.id;
			if(url.searchParams.has('id')){
				url.searchParams.set('id', friendID);
				window.open(url.href, '_blank');
			}else{
				url.searchParams.append('id', friendID);
				window.open(url.href, '_blank');
			}
		})
		}
	}
	
}, 500);
}*/
	/* function modalTrustPlus(){
		let plus_trust_but = document.querySelector('#plus_trust_but');
		
		plus_trust_but.addEventListener('click', ()=>{
			upd_plus_trust();
		})
		
	}*/
async function upd_plus_trust(){
	let plus_trust_inp = document.querySelector('#plus_trust_inp');
	let plus_trust_error_message = document.querySelector('#plus_trust_error_message');
	if(plus_trust_inp.value==''){
				plus_trust_error_message.innerHTML = 'Введите id пользователя или ссылку';
			}else{
				if (isAuth) {
			if (isConnection) {
				if (isTrust) {
					await updateTrust(5, plus_trust_inp.value);
					
					
				}
				else {
					
					await updateTrust(4, plus_trust_inp.value);
					await updateTrust(5, plus_trust_inp.value);
				}
			}
			else {
				
				await updateTrust(5, plus_trust_inp.value);
				
			}
			
			
			window.location.reload();
		}
		else {
			deleteCookie("","set_mistrust");
			document.cookie = `set_trust=${userIdFrom}; path=/;`;
			authDialog.style.display = "flex";
		}
			}
}

//
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




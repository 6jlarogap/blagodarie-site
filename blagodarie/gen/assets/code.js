
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
var links_parent = [];
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




//preloader in start load
let loaders = document.querySelector("#loaders");
window.onload = function(){
	loaders.style.transition = "0.8s";
	loaders.style.opacity = "0";
	setTimeout(function(){
		loaders.style.display = "none";
	},900);
}

function startLoad(){
	loaders.style.display = "block";
	setTimeout(function(){
		loaders.style.transition = "0.8s";
		loaders.style.opacity = "1";
	},10);
}

function endLoad(){
	loaders.style.transition = "0.8s";
	loaders.style.opacity = "0";
	setTimeout(function(){
		loaders.style.display = "none";
	},900);
}


//end preload container

//filter stuff
var filterInput = document.getElementById("filterInput");

//settings
// var settings = settingSets[1];
var setting;
settingSets.forEach((setting, i) => {
	if (setting.url.substr(0, setting.url.length - 1) == new URL(window.location.href).origin) {
		settings = setting;
	}
})


// register sw
window.addEventListener('load', async () => {
	if ('serviceWorker' in navigator) {
		if (url == settings.url) {
			await navigator.serviceWorker.register('/sw.js')
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

	window.location.href = `${settings.url}gen/?id=${getCookie("user_uuid")}`;
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
				user_uuid: dynamic_id,
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
				"user_uuid": dynamic_id,
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
				"user_uuid": dynamic_id,
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
		console.log(fetchSettings);
		//window.location.reload();
		rootDialog.style.display = 'none';
		addElementDialog.style.display = "none";
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

document.getElementById("keys1").addEventListener("click", async () => {
	await rootFunctions('keys')
})

document.getElementById("abilities1").addEventListener("click", async () => {
	await rootFunctions('abilities')
})

document.getElementById("wishes1").addEventListener("click", async () => {
	await rootFunctions('wishes')
})


// document.getElementById("invite").addEventListener("click", () => {
// 	copyToClipboard(`${settings.url}?ref_uuid=${PROFILE.id}`)
// })
//-----------------------------------------------------------------------------------------------

//new settings
let new_settapi = settings.api;
let new_setturl = settings.url;

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
	if(response.users == undefined){
		let error_response = JSON.stringify(response);
		//alert(error_response);
		if(getCookie("user_uuid")){
			deleteCookie("", "user_uuid");
		}
		if(getCookie("auth_token")){
			deleteCookie("", "auth_token");
		}
		window.location.reload();
		
	}
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
	map_users.push({
		user_photo: response.users[0].photo,
		user_name: response.users[0].first_name,
		user_lastname: response.users[0].last_name,
		user_latitude: response.users[0].latitude,
		user_longitude: response.users[0].longitude,
		user_ability: response.users[0].ability,
		user_uuid: response.users[0].uuid
	} );
	response_smat_map = map_users;
	console.log(map_users);
	return response_smat_map

	
	
	
	
	
}

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
  
	window.location.href = `${settings.url}gen/?id=${getCookie("user_uuid")}`;
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
//let get_position1 = document.querySelector('#get_position1');
let mapid = document.querySelector('#mapid');
let map_container = document.querySelector('.map_container');
let mapid_close = document.querySelector('.mapid_close');
let mapid_send = document.querySelector('.mapid_send');
let mapid_clean = document.querySelector('.mapid_clean');
let new_cur_pos_marker_lat;
let new_cur_pos_marker_lng;
let mapid_alert = document.querySelector('.mapid_alert');
let mapid_whereI = document.querySelector('.mapid_whereI');
let lati;
let long;


get_position.addEventListener('click', ()=>{
	get_cur_position();
});

/*get_position1.addEventListener('click', ClickOnGetPosition);

function ClickOnGetPosition(){
	get_cur_position();
}*/

function get_cur_position(){
  navigator.geolocation.getCurrentPosition(
    function(position) {
      if (response_smat_map.some(e => e.user_uuid === userIdFrom)) {
        console.log(response_smat_map);
      for(let i=0;i<response_smat_map.length;i++){
        if(response_smat_map[i].user_uuid == userIdFrom){
          lati = +response_smat_map[i].user_latitude;
          long = +response_smat_map[i].user_longitude;
          console.log(lati, long);
          show_smart_map(lati, long)
        }
      }
      }else{
        lati = position.coords.latitude;
          long = position.coords.longitude;
        show_smart_map(lati, long)
      }
    },
    function(error){
      for(let i=0;i<response_smat_map.length;i++){
        if(response_smat_map[i].user_uuid == userIdFrom){
          let lati = +response_smat_map[i].user_latitude;
          let long = +response_smat_map[i].user_longitude;
          console.log(lati, long);
          show_smart_map(lati, long)
        }
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
		if(response_smat_map[0].user_latitude != null){
			for(let i=0;i<response_smat_map.length;i++){
			if(response_smat_map[i].user_uuid == userIdFrom){
				let lati = +response_smat_map[i].user_latitude;
				let long = +response_smat_map[i].user_longitude;
				console.log(lati, long);
			}
		}
	}
			
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
      marker.setLatLng(e.latlng);
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
//	console.log('before ' + lati, long);
    mapid.on('click', onMapClick);
    mapid_close.addEventListener('click', ()=> {
		map_container.style.display = "none";
	});	
}

document.querySelector(".mapid_send").addEventListener("click", function(){
	var form = new FormData();
    form.append("uuid", `${userIdFrom ? userIdFrom : getCookie("auth_token")}`);
    form.append("latitude", `${new_cur_pos_marker_lat ? new_cur_pos_marker_lat : lati ? lati : null}`);	
    form.append("longitude", `${new_cur_pos_marker_lng ? new_cur_pos_marker_lng : long ? long : null}`);
	var settings = {
    "url": `${new_settapi}api/profile`,
    "method": "PUT",
    "timeout": 0,
    "headers": {
      "Authorization": `Token ${getCookie("auth_token")}`
    },
    "processData": false,
    "mimeType": "multipart/form-data",
    "contentType": false,
    "data": form
	};

	$.ajax(settings).done(function (response) {
  		console.log(response);
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
			map_container.style.display = "none";
			document.querySelector('#mapid').remove();
		}, 3500)
	});
});

// Показать глубину рекурсии
if(!url.searchParams.has('d')){
	url.searchParams.append('d', 5);
	window.location.href = url.href;
}

let recur_select = document.querySelector('.recur_select');
let recur_select_value = document.querySelector('.recur_select_value');
recur_select.onchange = async function(){
	 url.searchParams.set('d', this.value);
	recur_select_value.innerHTML = url.searchParams.get('d');
	await startLoad();
	data = [];
	nodes = [];
	links = [];
	links_parent = [];
	await getApiUrl();
	svg.remove();
			
		svg = d3.select("body").append("svg")
                .attr("id", "main")
                .attr("viewBox", "0 0 " + w + " " + h )
                .attr("preserveAspectRatio", "xMidYMid meet");
	history.pushState(null, null, url.href);
	initDefs();
		initializeDisplay();
		initializeSimulation();
		endLoad();
	//window.location.href = url.href;
}

document.querySelector(".mapid_clean").addEventListener("click", function(){
	var form = new FormData();
	form.append("uuid", `${userIdFrom ? userIdFrom : getCookie("auth_token")}`);
	form.append("latitude", "");	
	form.append("longitude", "");
	var settings = {
  		"url": `${new_settapi}api/profile`,
  		"method": "PUT",
  		"timeout": 0,
  		"headers": {
  		  "Authorization": `Token ${getCookie("auth_token")}`
  		},
  		"processData": false,
  		"mimeType": "multipart/form-data",
  		"contentType": false,
  		"data": form
	};

	$.ajax(settings).done(function (response) {
  		console.log(response);
		lati = null;
		long = null;
		new_cur_pos_marker_lat = null;
		new_cur_pos_marker_lng = null;
		map_container.style.display = "none";
		document.querySelector('#mapid').remove();
	});
});
var apiUrl;
async function getApiUrl(){
	if((getCookie("auth_token")=="" || getCookie("auth_token")==false) && !window.location.href.includes("id")){
				window.location.href = window.location.origin;
	}else if((getCookie("auth_token")=="" || getCookie("auth_token")==false) && window.location.href.includes("id")){
		if(url.searchParams.has('sl')){
			apiUrl = `${settings.api}api/profile_genesis?uuid=${url.searchParams.get('id')}`;
			//try{
				await d3view();
			/*}catch(err){
				alert('803 ' + err + "Стэк: " + err.stack + "Ссылка: " + window.location.href + " URL: " + url + " Куки: " + getCookie('user_uuid'));
			}*/
		}else{
			if(url.searchParams.has('d')){
			 apiUrl = `${settings.api}api/profile_genesis?uuid=${url.searchParams.get('id')}&depth=${url.searchParams.get('d')}`;
			}else{
				apiUrl = `${settings.api}api/profile_genesis?uuid=${url.searchParams.get('id')}`;
			}
			///try{
				await d3view();
			/*}catch(err){
				alert('803 ' + err + "Стэк: " + err.stack + "Ссылка: " + window.location.href + " URL: " + url + " Куки: " + getCookie('user_uuid'));
			}*/
		}
	}
	else if(!window.location.href.includes('id') || url.searchParams.get('id') == getCookie('user_uuid')){
		apiUrl = `${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}&depth=${url.searchParams.get('d')}`;
		console.log(apiUrl)
		//try{
			await d3view();
		/*}catch(err){
			alert('805 ' + err + "Стэк: " + err.stack + "Ссылка: " + window.location.href + " URL: " + url + " Куки: " + getCookie('user_uuid'));
		}*/
	}else if(url.searchParams.has('sl')){
			apiUrl = `${settings.api}api/profile_genesis?uuid=${url.searchParams.get('id')}`;
			console.log(apiUrl)
		//try{
			await d3view();
		/*}catch(err){
			alert('815' + err + "Стэк: " + err.stack + "Ссылка: " + window.location.href + " URL: " + url + " Куки: " + getCookie('user_uuid') + " SetProfile: " + `${settings.api}api/profile_graph?uuid=${getCookie("user_uuid")}` + "auth_token: " + getCookie('auth_token'));
		}*/
	}else{
		apiUrl = `${settings.api}api/profile_genesis?uuid=${url.searchParams.get('id')}&depth=${url.searchParams.get('d')}`;
		//try{
			await d3view();
		/*}catch(err){
			alert('823' + err + "Стэк: " + err.stack + "Ссылка: " + window.location.href + " URL: " + url + " Куки: " + getCookie('user_uuid'));
		}*/
		
	}
}

	getApiUrl();

	//getApiUrl();
var isConnection;
var isTrust;

let user_connections;
let map_latitude;
let map_longitude;
let new_map = document.querySelector('#new_map');
let dataResponse;
async function d3view(){
//d3.json(apiUrl)
let response;
if((getCookie("auth_token")=="" || getCookie("auth_token")==false || !getCookie("auth_token")) && (getCookie("user_uuid")=="" || getCookie("user_uuid")==false || !getCookie("user_uuid"))){
	response = await fetch(`${apiUrl}`, {
		method: "GET"
	}).then(data => data.json());
}else{
	response = await fetch(`${apiUrl}`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());
}
	dataResponse = response;
	data = response;
	console.log(data);
	user_connections = data;
	if (isAuth && getCookie("user_uuid")) {
		await setProfile();
		nodes.push(PROFILE);
	}else if (getCookie("auth_token")){
		deleteCookie("", "auth_token");
		window.location.href = window.location.origin;
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
	
//	console.log(data);
//	console.log(map_users);
	
	if (data.wishes != null){
		//добавить вершину желаний
		nodes.push({
			id: WISHES_ROOT_ID,
			text: "Потребности",
			image: `${settings.url}images/sleep.png`,
			nodeType: NODE_TYPES.WISH_ROOT
		});
		
		//добавить желания в вершину
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

		// добавить возможности в вершину
		data.abilities.forEach(function(d) {
			nodes.push({
				id: `ability_${d.uuid}`,
				text: d.text,
				image: `${settings.url}images/ability.png`,
				nodeType: NODE_TYPES.ABILITY
			});
		});
	}

	if (userIdFrom && !(userIdFrom == PROFILE.id) && !window.location.href.includes('%2C') && !window.location.href.includes(',')) {
		isConnection = data.trust_connections.some(link => link.source == PROFILE.id && link.target == userIdFrom);
//		console.log(isConnection)
//		console.log(data);
		var activeTrust = `${settings.url}images/trust_active.png`;
		var activeMistrust = `${settings.url}images/mistrust_active.png`;
		var inactiveTrust = `${settings.url}images/trust_inactive.png`;
		var inactiveMistrust = `${settings.url}images/mistrust_inactive.png`;

		isConnection ? isTrust = data.trust_connections.some(link => link.source == PROFILE.id && link.target == userIdFrom && link.is_trust) : null;
//		console.log(isTrust)
		async function count_plus() {
		let response;
		if(getCookie("auth_token")=="" || getCookie("auth_token")==false){
			response = await fetch(`${settings.api}api/profile_graph?uuid=` + userIdFrom, {
			method: "GET"
			}).then(data => data.json());
		}else{
			response = await fetch(`${settings.api}api/profile_graph?uuid=` + userIdFrom, {
			method: "GET",
			headers: {
				"Authorization": 'Token ' + getCookie("auth_token")
			}
			}).then(data => data.json());
		}
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
		/*nodes.push({
			id: TRUST_ID,
			text: "Доверие",
			image: !isConnection ? inactiveTrust : isTrust ? activeTrust : inactiveTrust,
			tspan: !isConnection ? resp_empty : isTrust ? resp : resp_empty,
			nodeType: NODE_TYPES.TRUST
		});*/
		}
		await count_plus()
		/*nodes.push({
			id: MISTRUST_ID,
			text: "Недоверие",
			image: !isConnection ? inactiveMistrust : isTrust ? inactiveMistrust : activeMistrust,
			nodeType: NODE_TYPES.MISTRUST
		});*/
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
			text: "Профили",
			image: `${settings.url}images/profile_im.png`,
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
		nodes.push({
		id: HOME_ID,
		text: "Домой",
		image: `${settings.url}images/hands.png`,
		nodeType: NODE_TYPES.HOME
	});
	
	//Добавляем вершину карт
	nodes.push({
		id: MAPS_ID,
		text: "Карта",
		image: `${settings.url}images/map_button.png`,
		nodeType: NODE_TYPES.MAPS
	});

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
//	console.log(data);
	data.trust_connections.forEach(function(d){
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
//			console.log(links);
		}
		
	});
	// родственные линки 
	data.connections.forEach(function(d){
		if (d.is_father == true){
			var reverse_is_parent = d.is_father;
			data.connections.forEach(function(dd){
				if (d.source == dd.target && d.target == dd.source && dd.is_father == true){
					reverse_is_parent = dd.is_father;				
				}
			});
			links_parent.push({
				source: d.source,
				target: d.target,
				is_father: d.is_father,
				reverse_is_parent: reverse_is_parent
			});
//			console.log(links_parent);
		}
		if (d.is_mother == true){
			var reverse_is_parent = d.is_mother;
			data.connections.forEach(function(dd){
				if (d.source == dd.target && d.target == dd.source && dd.is_mother == true){
					reverse_is_parent = dd.is_mother;				
				}
			});
			links_parent.push({
				source: d.source,
				target: d.target,
				is_mother: d.is_mother,
				reverse_is_parent: reverse_is_parent
			});
//			console.log(links_parent);
		}	
	});
	
	if (data.wishes != null){	
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
			console.log("widthhead", width);
			console.log("heighhead", height);	
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
			d.fy = 20;
			break;
		case FILTER_ID:
			d.fx = width<900 ? width/2+170 : width / 2 + 400;
			d.fy = 20;
			break;
		case OPTIONS_ID:
			d.fx = width<900 ? 10 : width / 2 - 400;
			d.fy = 20;
			break;
		case INVITE_ID:
			d.fx = width<900 ? width/2-20 : width / 2 - 200;
			d.fy = 20;	
			break;
		case HOME_ID:
			d.fx = width<900 ? width/2-91 :width / 2 - 300;
			d.fy = 20;
			break;
		case MAPS_ID:
			d.fx = width<900 ? width/2+30 : width / 2 - 50;
			d.fy = 20;
			break;
		/*case TRUST_ID:
			d.fx = width<900 ? width / 2 + 30 :  width / 2 + 50;
			d.fy = width<900 ? height/2+65 : height / 2 + 120;
			break;
		case MISTRUST_ID:
			d.fx = width<900 ? width / 2 - 30 :  width / 2 - 50;
			d.fy = width<900 ? height/2+65 : height / 2 + 120;
			break;*/
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
/*  		  d.fx = width<900 ? width / 2 - 100 : width / 2 - 200;
				d.fy = height / 2;
*/
			} else {
				d.fx = width / 2;
				d.fy = height / 2;
			}
			break;
		}
	});
	
	simulation = d3.forceSimulation(nodes);
	if(width<900){
	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(20).strength(1))
      .force("link", d3.forceLink(links_parent).id(d => d.id).distance(20).strength(1))
      .force("charge", d3.forceManyBody().strength(120))
	  .force("collide", d3.forceCollide().radius(30))
	  .force("center", d3.forceCenter(width / 2, height / 2));
		
		
		
		
    
	/*Не удалять
	
	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(20).links(links)); //distance(150)
		simulation.force("link", d3.forceLink(links_parent).id(d => d.id).distance(25).links(links_parent)); //distance(150)
	    	simulation.force("charge", d3.forceManyBody().strength(-30)) //0.5
//		simulation.force("collide", d3.forceCollide().strength(0.4).radius(45).iterations(1));//radius 55  strength(0.6)
<<<<<<< HEAD
	  	simulation.force("center", d3.forceCenter((+width + 60) / 2, (+height + 40) / 2))
	}		
	else{
=======
	  	simulation.force("center", d3.forceCenter(width / 2, height / 2))
	}	*/	
	}else{

      simulation.force("link", d3.forceLink(links).id(d => d.id).distance(30).strength(1))
      .force("link", d3.forceLink(links_parent).id(d => d.id).distance(20).strength(1))
      .force("charge", d3.forceManyBody().strength(120))
	  .force("collide", d3.forceCollide().radius(50))
		.force("center", d3.forceCenter(width / 2, height / 2));
      
		
		
		
		
		/*
		Не удалять
		
		
>>>>>>> 1e556db52ee70e6c5cb8018b60e43f4d49044368
		simulation.force("link", d3.forceLink(links).id(d => d.id).links(links).distance(30));
		simulation.force("link", d3.forceLink(links_parent).id(d => d.id).links(links_parent).distance(30));
		simulation.force("charge", d3.forceManyBody().strength(-50));
		simulation.force("center", d3.forceCenter(width / 2, height / 2));
		simulation.force("collide", d3.forceCollide().radius(30));
		

		
		
		*/
		
/*		
	БЫЛО



	//	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(150).links(links)); //distance(150)
	//	simulation.force("link", d3.forceLink(links_parent).id(d => d.id).distance(150).links(links_parent)); //distance(150)
	//	simulation.force("charge", d3.forceManyBody().strength(-400))
	//	simulation.force("center", d3.forceCenter(width / 2, height / 2))
	//	simulation.force("collide", d3.forceCollide().strength(0.4).radius(80).iterations(1));//radius 80  strength(0.6)
		simulation.force("x", d3.forceX(width / 2).strength(0.5)); //strength(0.2))
		simulation.force("y", d3.forceY(height / 2).strength(0.5)); // strength(0.2))
	//	simulation.force("center", d3.forceCenter(width / 2, height / 2))
		simulation.force("x", d3.forceX(width / 2).strength(0.1))
		simulation.force("y", d3.forceY(height / 2).strength(0.1));
*/	}
	
	initializeDisplay();
	initializeSimulation();
	
}

	
	
	
var latlngs = [];
var myIcon;

function show_map_style(){	
	if(map_users.length > 0 && map_users[0].user_latitude != null ){
		map_latitude = map_users[0].user_latitude;
		map_longitude = map_users[0].user_longitude;
	}else{
		map_latitude = 49.019638199999996;
		map_longitude = 35.226296399999995;
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
	if(map_users.length > 0 && map_users[0].user_latitude != null){
		for(let i = 0; i < map_users.length; i++){
			
			myIcon = L.icon({
    				iconUrl: map_users[i].user_photo != '' ? map_users[i].user_photo : `${settings.url}images/default_avatar.png`,
    				iconSize: [38, 38],
    				iconAnchor: [map_users[i].user_latitude, map_users[i].user_longitude],
					className: "myIcon"
			});
//			console.log(myIcon);
			var textLatLng = [map_users[i].user_latitude, map_users[i].user_longitude]; 

        		var myTextLabel = L.marker(textLatLng, {icon: L.divIcon({className: 'text-labels', html: `${map_users[i].user_name} ${map_users[i].user_lastname ? map_users[i].user_lastname : ''} </br> ${map_users[i].user_ability ? map_users[i].user_ability : ''}`}),zIndexOffset: 1000})
			.addTo(new_map)
//			console.log(myTextLabel);
					
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
	}

	return d3.drag()
	  .on("start", dragstarted)
	  .on("drag", dragged)
	  .on("end", dragended);
}

var counter_id = 0;

function initializeDisplay() {
	
	
	
	link = svg.append("g")
		.selectAll("g")
		.data(links)
		.join("g")
		//.attr("d", linkArc);
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
		
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
		.attr("stroke-width", 1.5)
		.attr("stroke", d => {
			console.log(d);
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST || d.target.nodeType == NODE_TYPES.FILTERED){
				if (d.is_trust == d.reverse_is_trust || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST){
					if(d.is_trust || d.source.nodeType == NODE_TYPES.TRUST){
							return "#02b11d";
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
						return "url(#arrow-trust)";
				} else{
					return "url(#arrow-mistrust)";
				}
			} else {
				return "url(#arrow-to-other)";
			}
		});
	
	link2 = svg.append("g")
		.selectAll("g")
		.data(links_parent)
		.join("g")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
		//.attr("id", "lallaal");
		
	link2.append("svg:defs")
		.append("linearGradient")
		.attr("id", d => ("grad_from_" + d.source.id + "_to_" + d.target.id))
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2)
		.selectAll("stop")
		.data(d => {
			return [[1,d.reverse_is_parent], [2,d.is_father], [3, d.is_mother]/*, [3, d.fam_link]*/];
		})
		.join("stop")
		.attr("offset", d => (d[0] == 1 ? "0%" : "100%"))
		.attr("style", d => {
			if (d[1]){
				return "stop-color:rgb(0, 39, 255);stop-opacity:1";
			}
		else if(d[2]){
			return "stop-color:rgb(0, 39, 255);stop-opacity:1";
		}
		else {
				return "stop-color:rgb(0, 39, 255);stop-opacity:1";
			}
		});
		
	link2.append("svg:line")
		.attr("class", "link2")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2)
		.attr("stroke", d => {
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE ||  d.target.nodeType == NODE_TYPES.FILTERED){
				if (d.is_father == d.reverse_is_parent || d.is_mother == d.reverse_is_parent){
					if(d.is_father || d.is_mother){
							return "#003afc";
					} else{
						return "#000aff";
					}
				} else {
					return "url(#grad_from_" + d.source.id + "_to_" + d.target.id + ")";
				}
			} else {
				return "#000aff";
			}
		})
		.attr("marker-end", d => {
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.PROFILE || d.target.nodeType == NODE_TYPES.FILTERED){
				if (d.is_father || d.is_mother){
						return "url(#arrow-gen)";
				} else{
					return "url(#arrow-gen)";
				}
			} else {
				return "url(#arrow-gen)";
			}
		});
	
	/*node = svg.append("g")
		.selectAll("g")
		.data(nodes)
		.join("g")
		.attr("onclick", d => `onNodeClick("${d.nodeType}", "${d.id}", "${d.text}")`)
		.call(drag(simulation))
		.attr('class', 'svg_elem');
	*/
	
	
	
	/*node = svg.append("g")
		.selectAll("g")
		.data(nodes)
		.join("g")
		.attr("onclick", d => d.nodeType==NODE_TYPES.FRIEND||d.nodeType==NODE_TYPES.PROFILE||d.nodeType==NODE_TYPES.USER ? `OnfriendClickFunc("${d.id}", "${d.nodeType}")` : `onNodeClick("${d.nodeType}", "${d.id}", "${d.text}")`)
		.call(drag(simulation))
		.attr('class', 'svg_elem');*/
	
	node = svg.append("g")
		.selectAll("g")
		.data(nodes)
		.join("g")
		.attr("onclick", d => d.nodeType==NODE_TYPES.FRIEND||d.nodeType==NODE_TYPES.PROFILE||d.nodeType==NODE_TYPES.USER ? `OnfriendClickFunc("${d.id}", "${d.nodeType}")` : `onNodeClick("${d.nodeType}", "${d.id}", "${d.text}")`)
		.call(drag(simulation))
		.attr('class', 'svg_elem');
	
	
	
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
			return `${window.location.origin}/profiles/?id=${getCookie('user_uuid')}`
		}else if(d.nodeType == NODE_TYPES.MAPS){
			return `${window.location.href}&map_visible`
		}else if(d.nodeType == NODE_TYPES.FRIEND || d.nodeType == NODE_TYPES.PROFILE || d.nodeType == NODE_TYPES.USER){
			if(url.searchParams.has('id')){
				return `${window.location.origin}${window.location.pathname}${window.location.search}`
			}else if(!url.searchParams.has('id') || url.searchParams.get('id')!=getCookie('user_uuid')){
				return `${window.location.origin}${window.location.pathname}?id=${d.id}&d=${url.searchParams.get('d')}`
			}
			
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
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20  : 65))
		.attr("font-size", width<900 ? '12' : "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER && width<900 || d.nodeType == NODE_TYPES.PROFILE && width<900 ? 30 : d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64: d.nodeType == NODE_TYPES.FILTERED ? 32 : width < 900 ? 20 : 65))
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
		
		
		
		/*
		Стало
		var x = (d.x < 30 && width<900 ? 30 : d.x < 0 && width<900 ? 0 : d.x < 30 && width>900 ? 30 : (d.x > width-30 && width<900 ? width-30 : d.x > width-30 && width>900 ? width-30 : d.x));
		var y = (d.y < 15 && width<900 ? 15 : d.y < 0 ? 0 : (d.y > height-20 && width<900 ? height-20 : d.y > height-70 && width>900 ? height-70 : d.y));
		if (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE){
//			simulation.force("x").x(x);
//			simulation.force("y").y(y);
		}*/
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
	link2.selectAll("g")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
	link2.selectAll("linearGradient")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
	link2.selectAll("line")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
}




function calcX1(d){
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 && width<900 ? 0 : d.source.x < 30 && width>900 ? 30 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width-30 && width>900 ? width-30 : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 && width<900 ? 0 : d.target.x < 30 && width>900 ? 30 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width-30 && width>900 ? width-30 : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height-70 && width>900 ? height-70 : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height-70 && width>900 ? height-70 : d.target.y));
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
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 && width<900 ? 0 : d.source.x < 30 && width>900 ? 30 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width-30 && width>900 ? width-30 : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 && width<900 ? 0 : d.target.x < 30 && width>900 ? 30 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width-30 && width>900 ? width-30 : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height-70 && width>900 ? height-70 : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height-70 && width>900 ? height-70 : d.target.y));
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
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 && width<900 ? 0 : d.source.x < 30 && width>900 ? 30 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width-30 && width>900 ? width-30 : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 && width<900 ? 0 : d.target.x < 30 && width>900 ? 30 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width-30 && width>900 ? width-30 : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height-70 && width>900 ? height-70 : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height-70 && width>900 ? height-70 : d.target.y));
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
	const sourceX = (d.source.x < 30 && width<900 ? 30 : d.source.x < 0 && width<900 ? 0 : d.source.x < 30 && width>900 ? 30 : (d.source.x > width-30 && width<900 ? width-30 : d.source.x > width-30 && width>900 ? width-30 : d.source.x)); //везде нули
	const targetX = (d.target.x < 30 && width<900 ? 30 : d.target.x < 0 && width<900 ? 0 : d.target.x < 30 && width>900 ? 30 : (d.target.x > width-30 && width<900 ? width-30 : d.target.x > width-30 && width>900 ? width-30 : d.target.x));
	const sourceY = (d.source.y < 15 && width<900 ? 15 : d.source.y < 0 ? 0 : (d.source.y > height-20 && width<900 ? height-20 : d.source.y > height-70 && width>900 ? height-70 : d.source.y));
	const targetY = (d.target.y < 15 && width<900 ? 15 : d.target.y < 0 ? 0 : (d.target.y > height-20 && width<900 ? height-20 : d.target.y > height-70 && width>900 ? height-70 : d.target.y));
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
	} /*else if (nodeType == NODE_TYPES.FRIEND) {
			OnfriendClickFunc(uuid, nodeType);
	} else if (nodeType == NODE_TYPES.PROFILE) {
			OnfriendClickFunc(uuid, nodeType);
	}else if (nodeType == NODE_TYPES.USER){
		OnfriendClickFunc(uuid, nodeType);
	}*/
	else if (nodeType == NODE_TYPES.AUTH) {
		authDialog.style.display = "flex";
    tgIframe = document.getElementById("telegram-login-BlagodarieAuthBot");
    tgIframe.style.marginTop = '80px';
    tgIframe.style.marginBottom = '0px';
	}
	else if (nodeType == NODE_TYPES.FILTERED) {
			window.location.href = `${settings.url}gen?id=` + uuid;		
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
		window.location.href = url.origin + '/profiles?id=' + getCookie('user_uuid');
	}
	else if (nodeType == NODE_TYPES.OPTIONS) {
		optionsDialog.style.display = "flex";
	}
	else if(nodeType == NODE_TYPES.HOME) {
		window.location.href = settings.url + '?q=25&f=0';
	}
	else if(nodeType == NODE_TYPES.GENESIS) {
		window.location.href = url.origin + '/gen';
	}
	else if(nodeType == NODE_TYPES.MAPS){
		url.searchParams.append('map_visible', 'true');
		window.history.pushState(null, null, url.search);
		window.location.href = url.href;
	}
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
let resp_owned_users;
async function myProfilesinfo() {
	let response;
	if((userIdFrom.includes('%2C') || userIdFrom.includes(',')) && getCookie("auth_token")=="" || (userIdFrom.includes('%2C') || userIdFrom.includes(',')) && getCookie("auth_token")==false){
		let shorterUuidstr = userIdFrom.split(',')[0];
		response = await fetch(`${new_settapi}api/profile?uuid=${shorterUuidstr}&number=2000`, {
		method: "GET"
		}).then(data => data.json());
		resp_owned_users = response;
		console.log(`${new_settapi}api/profile?uuid=${shorterUuidstr}&number=2000`);
	}
	else if((!userIdFrom.includes('%2C') || !userIdFrom.includes(',')) && getCookie("auth_token")=="" || (!userIdFrom.includes('%2C') || !userIdFrom.includes(',')) && getCookie("auth_token")==false){
		response = await fetch(`${new_settapi}api/profile?uuid=${userIdFrom}&number=2000`, {
		method: "GET"
		}).then(data => data.json());
	resp_owned_users = response;
		console.log(`${new_settapi}api/profile?uuid=${userIdFrom}&number=2000`);
	}/*else if(userIdFrom && (!userIdFrom.includes('%2C') && !userIdFrom.includes(','))){
		response = await fetch(`${new_settapi}api/profile?uuid=${userIdFrom}&number=2000`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
		}).then(data => data.json());
		resp_owned_users = response;
		console.log(`${new_settapi}api/profile?uuid=${userIdFrom}&number=2000`);
	}*/else{
		response = await fetch(`${new_settapi}api/profile?number=2000`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
		}).then(data => data.json());
		resp_owned_users = response;
		console.log(`${new_settapi}api/profile?number=2000`);
	}
};
myProfilesinfo();
let OwnerSettings;
let clickOnUser;
let us_uid;


function UserResponseForEdit(user){
		for(let i=0; i<resp_owned_users.length; i++){
			if(us_uid == resp_owned_users[i].uuid){
				user = resp_owned_users[i];
				break;
			}
		}
		clickOnUser.style.display = "none";
		user_changed_info(user.uuid, user.last_name, user.first_name, user.middle_name, user.photo, user.dob, user.dod, user.gender, user.latitude, user.longitude);
}

//контекстное добавление родителей

function add_context_mother(uid){
	uid=us_uid
	let addpupils_form = document.querySelector('#addpupils');
	addpupils_form.style.display = 'block';
	checker(uid, 'mother');
}

function add_context_father(uid){
	uid=us_uid
	let addpupils_form = document.querySelector('#addpupils');
	addpupils_form.style.display = 'block';
	checker(uid, 'father');
}

function add_context_child(uid){
	uid=us_uid
	let addpupils_form = document.querySelector('#addpupils');
	addpupils_form.style.display = 'block';
	checker(uid, 'child');
}

function checker(uid, type_of_user){
	let pagination_but_add_new_pup = document.querySelector('.pagination_but_add_new_pup'),
		add_new_pup = document.querySelector('#add_new_pup'),
		add_reserved_pup = document.querySelector('#add_reserved_pup'),
		addpupils_form = document.querySelector('#addpupils'),
		context_menu_add_profiles = document.querySelector('.context_menu_add_profiles');
	
context_menu_add_profiles.addEventListener('click', closePupContextMenu);
	
	add_new_pup.checked = false;
	add_reserved_pup.checked = false;
	
//функция закрытия и удаления обработчиков 
function closePupContextMenu(){
	addpupils_form.style.display = "none";
	context_menu_add_profiles.removeEventListener('click', closePupContextMenu);
	pagination_but_add_new_pup.removeEventListener('click', checkerButton);
}
	
	
pagination_but_add_new_pup.addEventListener('click', checkerButton);
function checkerButton (){
		//event.preventDefault();
		if(add_new_pup.checked){
			pagination_but_add_new_pup.removeEventListener('click', checkerButton);
			closePupContextMenu();
			add_context_new_parents(uid, type_of_user);
		}else{
			console.log(type_of_user);
			pagination_but_add_new_pup.removeEventListener('click', checkerButton);
			closePupContextMenu();
			add_context_reserved_parents(uid, type_of_user);
		}
	}
	
}






//функция добавления нового пользователя в родители
function add_context_new_parents(us_id_from, type_of_user){
	let add_user_profile_container_prew = document.querySelector('.add_user_profile_container_prew'),
		errorInNewContextProfile = document.querySelector('.errorInNewContextProfile'),
		add_user_profile_close_popup_new = document.querySelector('.add_user_profile_close_popup_new'),
		user_profile_surname_inp_new = document.querySelector('.user_profile_surname_inp.new'),
		user_profile_middlename_inp_new = document.querySelector('.user_profile_middlename_inp.new'),
		user_profile_name_inp_new = document.querySelector('.user_profile_name_inp.new'),
		male_checked_new_pup = document.querySelector('.male_checked_new_pup'),
		female_checked_new_pup = document.querySelector('.female_checked_new_pup'),
		add_user_profile_overbottom_new_new_user = document.querySelector('.add_user_profile_overbottom.new.new_user'),
		female_cont = document.querySelector('.female_cont'),
		male_cont = document.querySelector('.male_cont'),
		db_new_user = document.querySelector('.db_new_user'),
		dd_new_user = document.querySelector('.dd_new_user');
		
	
	add_user_profile_container_prew.style.display = "block";
	female_cont.style.display = "block";
	male_cont.style.display = "block";
	user_profile_surname_inp_new.value = "";
	user_profile_middlename_inp_new.value = "";
	user_profile_name_inp_new.value = "";
	errorInNewContextProfile.innerHTML = "";
	db_new_user.value = "";
	dd_new_user.value = "";
	
	if(type_of_user == "father"){
		male_checked_new_pup.checked = true;
		female_cont.style.display = "none";
		male_cont.style.display = "block";
	}else if(type_of_user == "mother"){
		female_checked_new_pup.checked = true;
		female_cont.style.display = "block";
		male_cont.style.display = "none";
	}else{
		female_checked_new_pup.checked = false;
		male_checked_new_pup.checked = false;
		female_cont.style.display = "block";
		male_cont.style.display = "block";
	}
	
	//закрытие формы
	add_user_profile_close_popup_new.addEventListener('click', close_new_user_popup);
	
	function close_new_user_popup(){
		add_user_profile_container_prew.style.display = "none";
		add_user_profile_close_popup_new.removeEventListener('click', close_new_user_popup);
		add_user_profile_overbottom_new_new_user.removeEventListener('click', addNewUserContextProfile);
	}
	
	//Кнопка отправить
	
	add_user_profile_overbottom_new_new_user.addEventListener('click', addNewUserContextProfile);
	
	function addNewUserContextProfile(){
		
		let gender_value;
		if(male_checked_new_pup.checked == true){
			gender_value = 'm';
		}else if(female_checked_new_pup.checked == true){
			gender_value = 'f';
		}
		
		var form = new FormData();
	if(user_profile_name_inp_new.value != ''){
		form.append("first_name", user_profile_name_inp_new.value);
	}
	if(user_profile_surname_inp_new.value != ''){
		form.append("last_name", user_profile_surname_inp_new.value);
	}
	if(user_profile_middlename_inp_new.value != ''){
		form.append("middle_name", user_profile_middlename_inp_new.value);
	}
	if(gender_value!=undefined){
		form.append("gender", gender_value);
	}if(db_new_user.value!=null){
		form.append("dob", db_new_user.value);
	}if(dd_new_user.value!=null){
		form.append("dod", dd_new_user.value);
	}
	if(type_of_user == "child"){
		form.append("link_uuid", us_id_from);
		for(let i=0; i<dataResponse.users.length; i++){
			if(dataResponse.users[i].uuid == us_id_from && dataResponse.users[i].gender == 'm'){
				form.append("link_relation", 'link_is_father');
				break;
			}else if(dataResponse.users[i].uuid == us_id_from && dataResponse.users[i].gender == 'f'){
				form.append("link_relation", 'link_is_mother');
				break;
			}else if(dataResponse.users[i].uuid == us_id_from && dataResponse.users[i].gender == null){
				form.append("link_relation", 'link_is_mother');
				break;
			}
		}
	}
	if(type_of_user == "father"){
		form.append("link_uuid", us_id_from);
		form.append("link_relation", 'new_is_father');
	}
	if(type_of_user == "mother"){
		form.append("link_uuid", us_id_from);
		form.append("link_relation", 'new_is_mother');
	}
	if(gender_value==undefined){
		errorInNewContextProfile.innerHTML = "Выберите пол";
	}
	if(gender_value!=undefined){
	
				var settings = {
  					"url": `${new_settapi}api/profile`,
  					"method": "POST",
  					"timeout": 0,
  					"headers": {
  					  "Authorization": `Token ${getCookie("auth_token")}`
  					},
  					"processData": false,
  					"mimeType": "multipart/form-data",
  					"contentType": false,
  					"data": form,
					success: async function(response){
						
						let new_added_user = JSON.parse(response)
						await close_new_user_popup();
						startLoad();
						await addDynamicUsers(new_added_user, type_of_user, us_id_from);
						//window.location.reload();
						
					},
					error: function(response){
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						errorInNewContextProfile.innerHTML = pars1.message;
					}
					};

					$.ajax(settings).done(function (response) {
						console.log(response);
					});
		}
		
	
	}
	
	
	async function addDynamicUsers(new_added_user, type_of_user, us_id_from){
		data.users.push(new_added_user);
		resp_owned_users.push(new_added_user);
		
		let new_dyn_id;
		console.log(new_added_user, type_of_user, us_id_from)
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
			new_dyn_id = d.uuid
			}else{
				nodes.push ({
				id: d.uuid,
				text: (d.first_name + " " + d.last_name),
				tabil: (d.ability),
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : width<900 && d.photo.includes('media') ? str1+"/35x35~crop~12."+ext : width>900 && d.photo.includes('media') ? str1+"/64x64~crop~12."+ext : d.photo,
				nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : localStorage.getItem("filter") != null && !(d.first_name + " " + d.last_name).toLowerCase().includes(localStorage.getItem("filter").toLowerCase()) ? NODE_TYPES.FILTERED : NODE_TYPES.FRIEND)
			});
			new_dyn_id = d.uuid;
			}			
		}
		});
		
	switch(type_of_user){
		case "mother":
			links_parent.push({
				source: us_id_from,
				target: new_added_user.uuid,
				is_mother: true,
				reverse_is_parent: true
			});
			data.connections.push({
				source: us_id_from,
				target: new_added_user.uuid,
				is_mother: true,
				is_father: false,
				is_trust: null
			});
			break;
		case "father":
			links_parent.push({
				source: us_id_from,
				target: new_added_user.uuid,
				is_father: true,
				reverse_is_parent: true
			});
			data.connections.push({
				source: us_id_from,
				target: new_added_user.uuid,
				is_mother: false,
				is_father: true,
				is_trust: null
			});
			break;
		case "child":
			if(new_added_user.gender == "m"){
				links_parent.push({
					source: new_added_user.uuid,
					target: us_id_from,
					is_father: true,
					reverse_is_parent: true
				});
				data.connections.push({
					source: new_added_user.uuid,
					target: us_id_from,
					is_mother: false,
					is_father: true,
					is_trust: null
				});
			}else{
				links_parent.push({
					source: new_added_user.uuid,
					target: us_id_from,
					is_mother: true,
					reverse_is_parent: true
				});
				data.connections.push({
					source: new_added_user.uuid,
					target: us_id_from,
					is_mother: true,
					is_father: false,
					is_trust: null
				});
			}
			break;
	}
		
		svg.remove();
			
		svg = d3.select("body").append("svg")
                .attr("id", "main")
                .attr("viewBox", "0 0 " + w + " " + h )
                .attr("preserveAspectRatio", "xMidYMid meet");
		
		initDefs();
		initializeDisplay();
		initializeSimulation();
		endLoad();
	}
	
	
	
	
}


//функция добавления существующего пользователя в родители

function add_context_reserved_parents(us_id_from, type_of_user){
	let add_new_user_form = document.querySelector('#add_new_user_form'),
		context_menu_add_profiles2 = document.querySelector('.context_menu_add_profiles2'),
		reserved_user_form_error = document.querySelector('.reserved_user_form_error'),
		add_new_user_form_but = document.querySelector('.add_new_user_form_but'),
		add_new_user_form_inp = document.querySelector('.add_new_user_form_inp');
	add_new_user_form.style.display = "block";
	add_new_user_form_inp.value = '';
	reserved_user_form_error.innerHTML = "";
	
	//кнопка закрыть
	context_menu_add_profiles2.addEventListener('click', close_reserved_user_form);
	function close_reserved_user_form(){
		context_menu_add_profiles2.removeEventListener('click', close_reserved_user_form);
		add_new_user_form_but.removeEventListener('click', checkAndAddReservedPeople);
		add_new_user_form.style.display = "none";
	}
	
	//кнопка добавить
	add_new_user_form_but.addEventListener('click', checkAndAddReservedPeople);
	
	function checkAndAddReservedPeople(){
		
		
		//Проверка на ссылку или юид
		let clean_uid;
		
		if(add_new_user_form_inp.value.includes('id')){
			let url3 = new URL(add_new_user_form_inp.value);
			clean_uid = url3.searchParams.get('id');
		}else{
			clean_uid = add_new_user_form_inp.value;
		}
		
		//Проверка на пустоту поля
		if(add_new_user_form_inp.value == ""){
			reserved_user_form_error.innerHTML = "Поле не может быть пустым";
		}else{
			reserved_user_form_error.innerHTML = "";
			add_reservedAndChecked_user();
		}
		
		//Добавление связей
		
		async function add_reservedAndChecked_user(){
		if(type_of_user == "father"){
			for(let i=0; i<dataResponse.connections.length; i++){
				if(dataResponse.connections[i].source == us_id_from && dataResponse.connections[i].target == clean_uid && dataResponse.connections[i].is_father == true){
					await add_user_parents(7, us_id_from, clean_uid);
					await add_user_parents(6, us_id_from, clean_uid);
				}else if(dataResponse.connections[i].source == us_id_from && dataResponse.connections[i].target == clean_uid && dataResponse.connections[i].is_father == false){
					await add_user_parents(6, us_id_from, clean_uid);
				}else{
					await add_user_parents(6, us_id_from, clean_uid);
					break;
				}
			}
		}else if(type_of_user == "mother"){
			for(let i=0; i<dataResponse.connections.length; i++){
				if(dataResponse.connections[i].source == us_id_from && dataResponse.connections[i].target == clean_uid && dataResponse.connections[i].is_mother == true){
					await add_user_parents(7, us_id_from, clean_uid);
					await add_user_parents(8, us_id_from, clean_uid);
				}else if(dataResponse.connections[i].source == us_id_from && dataResponse.connections[i].target == clean_uid && dataResponse.connections[i].is_mother == false){
					await add_user_parents(8, us_id_from, clean_uid);
				}else{
					await add_user_parents(8, us_id_from, clean_uid);
					break;
				}
			}
		}else if(type_of_user == "child"){
			for(let i=0; i<dataResponse.users.length; i++){
				if(dataResponse.users[i].uuid == us_id_from && dataResponse.users[i].gender == 'm'){
					await add_user_parents(6, clean_uid, us_id_from);
				}else if(dataResponse.users[i].uuid == us_id_from && dataResponse.users[i].gender == 'f'){
					await add_user_parents(8, clean_uid, us_id_from);
				}else if(dataResponse.users[i].uuid == us_id_from && dataResponse.users[i].gender == null){
					await add_user_parents(8, clean_uid, us_id_from);
				}
			}
		}
		}
		
		
		
		
	}
	
	
	
	
	async function add_user_parents(operation_type_id, us_id_from, clean_uid){
	
				var settings = {
  					"url": `${new_settapi}api/addoperation`,
  					"method": "POST",
  					"timeout": 0,
  					"headers": {
    					"Authorization": `Token ${getCookie("auth_token")}`,
    					"Content-Type": "application/json"
  					},
  					"data": JSON.stringify({
    					"user_id_from": us_id_from,
    					"user_id_to": clean_uid,
    					"operation_type_id": operation_type_id
  					}),
					success: function(response){
						console.log(response);
						close_reserved_user_form();
					},
					error: function(response){
						console.log(response);
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						reserved_user_form_error.innerHTML = pars1.message;
					}
					
					
					};

					$.ajax(settings).done(function (response) {
  					console.log(response);
					});
			
		
		}
	
	
	
	
}

async function OnfriendClickFunc(uid, nodeType){
	us_uid = uid;
	clickOnUser = document.querySelector('#clickOnUser');
	let href_onUser = document.querySelector('#href_onUser'); 
	let copyUserLink = document.querySelector('#copyUserLink');
	OwnerSettings = document.querySelector('#OwnerSettings');
	let add_mother = document.querySelector('#add_mother');
	let add_father = document.querySelector('#add_father');
	let add_child = document.querySelector('#add_child');
	let UserTrust = document.querySelector('#UserTrust');
	let UserMistrust = document.querySelector('#UserMistrust');
	let ShortRoad = document.querySelector('#ShortRoad');
	let context_menu_close = document.querySelector('.context_menu_close');
	let context_menu_user_name = document.querySelector('.context_menu_user_name');
	let isConn;
	let isDataTrust;
	let isDataMistrust;
	if(uid != getCookie('user_uuid')){
	isConn = dataResponse.trust_connections.some(link => link.source == getCookie('user_uuid') && link.target == uid);
	isConn ? isDataTrust = dataResponse.trust_connections.some(link => link.source == getCookie('user_uuid') && link.target == uid && link.is_trust==true) : null;
	isConn ? isDataMistrust = dataResponse.trust_connections.some(link => link.source == getCookie('user_uuid') && link.target == uid && link.is_trust==false) : null;
	}
	async function RenderSettings(){
		//let resp_owned_users = myProfilesinfo;
	console.log(resp_owned_users);
	for(let i=0; i<resp_owned_users.length; i++){
		if(uid == resp_owned_users[i].uuid){
			OwnerSettings.style.display = "block";
			OwnerSettings.addEventListener("click", UserResponseForEdit);

			break;
		}else{
			OwnerSettings.style.display = "none";
		}
	}
	add_father.style.display = 'block';
	add_mother.style.display = 'block';
	add_child.style.display = 'block';
	
	for(let i=0; i<data.connections.length; i++){
		if(data.connections[i].source==uid && data.connections[i].is_father == true){
			add_father.style.display = 'none';
		}
		if(data.connections[i].source==uid && data.connections[i].is_mother == true){
			add_mother.style.display = 'none';
		}
	}
		
	for(let i = 0; i<data.users.length; i++){
		if(data.users[i].uuid == uid){
			context_menu_user_name.innerHTML = `${data.users[i].last_name} ${data.users[i].first_name} ${data.users[i].middle_name}`;
			break;
		}else{
			context_menu_user_name.innerHTML = "";
		}
	}
		
	add_mother.addEventListener('click', add_context_mother);
	add_mother.addEventListener('click', closer);
	
	add_father.addEventListener('click', add_context_father);
	add_father.addEventListener('click', closer);
		
	add_child.addEventListener('click', add_context_child);
	add_child.addEventListener('click', closer);
		
		
	href_onUser.addEventListener("click", link_to_user);
	href_onUser.addEventListener("click", closer);
	
	async function link_to_user(){
	 	/*url.searchParams.set('id', uid);
		history.pushState(null, null, url.href);
		startLoad();
		data = [];
		nodes = [];
		links = [];
		links_parent = [];
		svg.remove();
		svg = d3.select("body").append("svg")
    	        .attr("id", "main")
    	        .attr("viewBox", "0 0 " + w + " " + h )
    	        .attr("preserveAspectRatio", "xMidYMid meet");
		getApiUrl();
		initDefs();
		initializeDisplay();
		initializeSimulation();
		endLoad();*/
		
		url.searchParams.set('id', uid);
	startLoad();
	data = [];
	nodes = [];
	links = [];
	links_parent = [];
	
	svg.remove();
			
		svg = d3.select("body").append("svg")
                .attr("id", "main")
                .attr("viewBox", "0 0 " + w + " " + h )
                .attr("preserveAspectRatio", "xMidYMid meet");
	history.pushState(null, null, url.href);
	/*initDefs();
		initializeDisplay();
		initializeSimulation();*/
		await getApiUrl();
		endLoad();
	
	}
		
		
	/*function UserResponseForEdit(user){
		for(let i=0; i<resp_owned_users.length; i++){
			if(uid == resp_owned_users[i].uuid){
				user = resp_owned_users[i];
				break;
			}
		}
		clickOnUser.style.display = "none";
		user_changed_info(uid, user.last_name, user.first_name, user.middle_name, user.photo, user.dob, user.dod, user.gender, user.latitude, user.longitude);
	}*/
		
	copyUserLink.addEventListener("click", UserLink);
	function UserLink(){
		let txt = `${settings.url}gen?id=` + uid;
		navigator.clipboard.writeText(txt)
			.then(() => {
				alert('Скопировано в буффер обмена');
			})
			.catch(err => {
				console.log('Something went wrong', err);
			});
		
	}
	
		
	async function UserTrustClick(){
		if (isAuth) {
			if (isConn) {
				if (isDataTrust) {
					await updateTrust(5, uid);
					alert('Благодарность установлена');
					UserTrust.removeEventListener("click", UserTrustClick);
					clickOnUser.style.display = "none";
				}
				else {
					await updateTrust(4, uid);
					await updateTrust(5, uid);
					alert('Доверие установлено');
					UserTrust.removeEventListener("click", UserTrustClick);
					clickOnUser.style.display = "none";
				}
			}
			else {
				await updateTrust(5, uid);
				alert('Доверие установлено');
				UserTrust.removeEventListener("click", UserTrustClick);
				clickOnUser.style.display = "none";
			}
			//window.location.reload();
		}
		else {
			deleteCookie("","set_mistrust");
			document.cookie = `set_trust=${userIdFrom}; path=/;`;
			authDialog.style.display = "flex";
		}
	}
	async function UserMistrustClick(){
		if (isAuth) {
			if (isConn) {
				if (!isDataTrust) {
					await updateTrust(4, uid);		
					alert('Недоверие установлено');
					UserMistrust.removeEventListener("click", UserMistrustClick);
					clickOnUser.style.display = "none";
				}
				else {
					await updateTrust(4, uid);
					await updateTrust(2, uid);
					alert('Недоверие установлено');
					UserMistrust.removeEventListener("click", UserMistrustClick);
					clickOnUser.style.display = "none";
				}
			}
			else {
				await updateTrust(2, uid);
				alert('Недоверие установлено');
				UserMistrust.removeEventListener("click", UserMistrustClick);
				clickOnUser.style.display = "none";
			}
			//window.location.reload();
		}
		else {
			deleteCookie("","set_trust");
			document.cookie = `set_mistrust=${userIdFrom}; path=/;`;
			authDialog.style.display = "flex";
		}
	}
	
		
	
	if(nodeType == NODE_TYPES.USER || nodeType == NODE_TYPES.FRIEND){
	UserTrust.style.display = "block";
	UserMistrust.style.display = "block";
	ShortRoad.style.display = "block";
	if (isAuth) {
			if (isConn) {
				if (isDataTrust) {
					UserTrust.style.display = "block";
					UserTrust.innerHTML = "Благодарить";
					UserMistrust.style.display = "block";
					UserMistrust.innerHTML = "Недоверие";
				}else if(isDataMistrust){
					UserTrust.style.display = "block";
					UserTrust.innerHTML = "Доверие";
					UserMistrust.style.display = "none";
				}
				else {
					UserTrust.style.display = "block";
					UserTrust.innerHTML = "Доверие";
					UserMistrust.style.display = "block";
					UserMistrust.innerHTML = "Недоверие";
				}
			}
			else {
				UserTrust.style.display = "block";
					UserTrust.innerHTML = "Доверие";
					UserMistrust.style.display = "block";
					UserMistrust.innerHTML = "Недоверие";
			}
		}	
	UserTrust.addEventListener("click", UserTrustClick);
	UserMistrust.addEventListener("click", UserMistrustClick);
	
		
	
		
	ShortRoad.addEventListener('click', function(){
		if(userIdFrom.includes(',') || userIdFrom.includes('%2C')){
			let newstrFrom = userIdFrom.split(',')[0];
			if(getCookie('user_uuid') && (getCookie('user_uuid')==newstrFrom)){
				window.location.href = `${window.location.origin}${window.location.pathname}?id=${getCookie('user_uuid') + ',' + uid}&sl=true`;
			}else if(newstrFrom==uid){
				if(getCookie('user_uuid')){
					window.location.href = `${window.location.origin}${window.location.pathname}?id=${getCookie('user_uuid') + ',' + uid}&sl=true`;
				}else{
					window.location.href = `${window.location.origin}${window.location.pathname}?id=${uid}`;
				}
			}else{
				window.location.href = `${window.location.origin}${window.location.pathname}?id=${newstrFrom + ',' + uid}&sl=true`;
			}
		}else{
			if(getCookie('user_uuid') && (getCookie('user_uuid')==userIdFrom)){
				window.location.href = `${window.location.origin}${window.location.pathname}?id=${getCookie('user_uuid') + ',' + uid}&sl=true`;
			}else if(userIdFrom==uid){
				if(getCookie('user_uuid')){
					window.location.href = `${window.location.origin}${window.location.pathname}?id=${getCookie('user_uuid') + ',' + uid}&sl=true`;
				}else{
					window.location.href = `${window.location.origin}${window.location.pathname}?id=${uid}`;
				}
			}else{
				window.location.href = `${window.location.origin}${window.location.pathname}?id=${userIdFrom + ',' + uid}&sl=true`;
			}
		}

	});
		
}else{
	UserTrust.style.display = "none";
	UserMistrust.style.display = "none";
	ShortRoad.style.display = "none";
}

	context_menu_close.addEventListener("click", function(){
		copyUserLink.removeEventListener('click', UserLink);
		UserTrust.removeEventListener("click", UserTrustClick);
		UserMistrust.removeEventListener("click", UserMistrustClick);
		OwnerSettings.removeEventListener("click", UserResponseForEdit);
		add_mother.removeEventListener('click', add_context_mother);
		add_father.removeEventListener('click', add_context_father);
		add_child.removeEventListener('click', add_context_child);
		href_onUser.addEventListener("click", link_to_user);
		href_onUser.addEventListener("click", closer);
		add_child.removeEventListener('click', closer);
		add_mother.removeEventListener('click', closer);
		add_father.removeEventListener('click', closer);
		clickOnUser.style.display = "none";
	});
		
		function closer(){
			copyUserLink.removeEventListener('click', UserLink);
			UserTrust.removeEventListener("click", UserTrustClick);
			UserMistrust.removeEventListener("click", UserMistrustClick);
			OwnerSettings.removeEventListener("click", UserResponseForEdit);
			add_mother.removeEventListener('click', add_context_mother);
			add_father.removeEventListener('click', add_context_father);
			add_child.removeEventListener('click', add_context_child);
			href_onUser.addEventListener("click", link_to_user);
			href_onUser.addEventListener("click", closer);
			add_child.removeEventListener('click', closer);
			add_mother.removeEventListener('click', closer);
			add_father.removeEventListener('click', closer);
			clickOnUser.style.display = "none";
		}

	}
	
	await RenderSettings();
	clickOnUser.style.display = "flex";
	return false
	
}


/*function copyLink(uid){
		let txt = `${settings.url}gen?id=` + uid;
		navigator.clipboard.writeText(txt)
			.then(() => {
				alert('Скопировано в буффер обмена');
			})
			.catch(err => {
				console.log('Something went wrong', err);
			});

		//copyUserLink.removeEventListener('click', copyLink());
}*/


let value_gender;
function setGenders(item){
	value_gender = item.value;
}

let dynamic_id;

let add_user_profile_container = document.querySelector('.add_user_profile_cont_fixed');
//редактировать профиль
function user_changed_info(id, last_name, first_name, middle_name, usr_photo, dob, dod, gender_val, us_latitude, us_longtitude){
	
	let add_user_profile_close_popup = document.querySelector('.add_user_profile_close_popup');
	let user_profile_surname_inp = document.querySelector('.user_profile_surname_inp_edit');
	let user_profile_name_inp = document.querySelector('.user_profile_name_inp_edit');
	let user_profile_middlename_inp = document.querySelector('.user_profile_middlename_inp_edit');
	let add_user_profile_photo = document.querySelector('.add_user_profile_photo');
	let add_user_profile_overbottom = document.querySelector('.add_user_profile_overbottom_edit');
	let add_user_profile_bd = document.querySelector('.add_user_profile_bd');
	let add_user_profile_dd = document.querySelector('.add_user_profile_dd');
	//let add_user_profile_mother_input = document.querySelector('.add_user_profile_mother_input');
	//let add_user_profile_father_input = document.querySelector('.add_user_profile_father_input');
	let profile_mother_input = document.querySelector('#profile_mother_input');
	let profile_father_input = document.querySelector('#profile_father_input');
	let moth_inp = document.querySelector('.moth_inp');
	let fath_inp = document.querySelector('.fath_inp');
	let get_position1 = document.querySelector('#get_position1');
	
	
	
	let nophoto_but = document.querySelector('.nophoto_but');
	let cheked_gend = document.getElementsByName('gender');
	
	let warning1 = document.querySelector('.warning1');
	
	
	
	user_profile_surname_inp.value = "";
	user_profile_name_inp.value = "";
	user_profile_middlename_inp.value = "";
	add_user_profile_bd.value = "";
	add_user_profile_dd.value = "";
	
	
	
	window.history.pushState(null, null, url.search);
	addEventListener("popstate",function(e){
    	window.location.reload();
	},false);
	
	warning1.innerHTML = "";
	dynamic_id = id;
	
	userIdFrom = id;
	if(isAuth && getCookie("user_uuid")){
		setProfile();
	}
	
	get_position1.addEventListener('click', ClickOnGetPosition);

	async function ClickOnGetPosition(){
			
	async function getUserPos() {
	const response = await fetch(`${settings.api}api/profile_graph?uuid=${userIdFrom}`/*`${settings.api}api/getprofileinfo?uuid=${getCookie("user_uuid")}`*/, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());
	response_smat_map = [{
		user_photo: response.users[0].photo,
		user_name: response.users[0].first_name,
		user_lastname: response.users[0].last_name,
		user_latitude: response.users[0].latitude,
		user_longitude: response.users[0].longitude,
		user_ability: response.users[0].ability,
		user_uuid: response.users[0].uuid
	}];
	return response_smat_map	
}
		
		response_smat_map = await getUserPos();
		console.log(response_smat_map);
		let map = document.createElement('div');
		map.setAttribute('id', 'mapid');
		map_container.appendChild(map);
		get_cur_position1();
	}
	
	function get_cur_position1(){
  navigator.geolocation.getCurrentPosition(
    function(position) {
      if (response_smat_map.some(e => e.user_uuid === userIdFrom)) {
        console.log(response_smat_map);
      for(let i=0;i<response_smat_map.length;i++){
        if(response_smat_map[i].user_uuid == userIdFrom){
          lati = +response_smat_map[i].user_latitude;
          long = +response_smat_map[i].user_longitude;
          console.log(lati, long);
          show_smart_map(lati, long);
		break;
        }
      }
      }else{
        lati = position.coords.latitude;
          long = position.coords.longitude;
        show_smart_map(lati, long)
      }
    },
    function(error){
      for(let i=0;i<response_smat_map.length;i++){
        if(response_smat_map[i].user_uuid == userIdFrom){
          let lati = +response_smat_map[i].user_latitude;
          let long = +response_smat_map[i].user_longitude;
          console.log(lati, long);
          show_smart_map(lati, long);
		break;
        }
      }
	    show_smart_map(53.89948354993688, 27.557659149169925);
	    mapid_whereI.style.display = 'none';
    }
);
}
	
	/*user_profile_surname_inp.value = '';
	user_profile_name_inp.value = '';
	user_profile_middlename_inp.value = '';*/
	//add_user_profile_mother_input.value = '';
	//add_user_profile_father_input.value = '';
	
	//открываем окно для родителей
	let rootDialog1 = document.querySelector('.rootDialog1');
	let rootDialog2 = document.querySelector('.rootDialog2');
	function motherOpenFunc(){
		rootDialog1.style.display = "flex";
		getUsparent();
		get_info_about_parents();
	}
	function fatherOpenFunc(){
		rootDialog2.style.display = "flex";
		getUsparent();
		get_info_about_parents();
	}
	/*profile_mother_input.addEventListener('click', ()=>{
		rootDialog1.style.display = "flex";
		getUsparent();
		get_info_about_parents();
	});
	profile_father_input.addEventListener('click', ()=>{
		rootDialog2.style.display = "flex";
		getUsparent();
		get_info_about_parents();
	})*/
	profile_mother_input.addEventListener('click', motherOpenFunc);
	profile_father_input.addEventListener('click', fatherOpenFunc);
	
	
	
	if(gender_val!=null || gender_val!=undefined){
		cheked_gend.forEach( item => {
      		if( item.value == gender_val){
        		item.checked = true;
      		} else{
        		item.checked = false;
      		}
		});
	}else{

	}
	
	
		user_profile_name_inp.addEventListener("input", function() {
  			this.value = this.value[0].toUpperCase() + this.value.slice(1);
		});
		user_profile_surname_inp.addEventListener("input", function() {
			this.value = this.value[0].toUpperCase() + this.value.slice(1);
		});
		user_profile_middlename_inp.addEventListener("input", function() {
  			this.value = this.value[0].toUpperCase() + this.value.slice(1);
		});
	
	//Проверка на установленое местоположение
	
	
	if(us_latitude!=null && us_longtitude!=null){
				get_position1.style.backgroundColor = '#6be86b';
				get_position1.style.color = '#fff';
				get_position1.style.borderColor = '#6be86b';
				get_position1.style.boxShadow = '0px 0px 10px 9px rgba(142, 198, 60, 0.4)';
	}else{
		get_position1.style.backgroundColor = '#0d6efd';
		get_position1.style.color = '#fff';
		get_position1.style.borderColor = '#0d6efd';
		get_position1.style.boxShadow = 'none';
	}
	
	//обрезка файлов

	var bs_modal = $('#modal');
    var image = document.getElementById('image');
    var cropper,reader,file;
	var cropBoxData;
    var canvasData;

    $("body").on("change", ".image", function(e) {
        var files = e.target.files;
        var done = function(url) {
            image.src = url;
            bs_modal.modal('show');
        };
		

        if (files && files.length > 0) {
            file = files[0];

            if (URL) {
                done(URL.createObjectURL(file));
            } else if (FileReader) {
                reader = new FileReader();
                reader.onload = function(e) {
                    done(reader.result);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    bs_modal.on('shown.bs.modal', function() {
        cropper = new Cropper(image, {
            aspectRatio: 1,
            /*viewMode: 3,
            preview: '.preview'*/
			autoCropArea: 0.5,
          	ready: function () {
            //Should set crop box data first here
            cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
          }
        });
    }).on('hidden.bs.modal', function() {
       /* cropper.destroy();
        cropper = null;*/
		 cropBoxData = cropper.getCropBoxData();
        canvasData = cropper.getCanvasData();
        cropper.destroy();
    });

    $("#crop").click(function() {
        canvas = cropper.getCroppedCanvas({
            width: 160,
            height: 160,
        });//.toDataURL("image/png");
		
		console.log(canvas);
        canvas.toBlob(function(blob) {
            url = URL.createObjectURL(blob);
			console.log(url);
            var reader = new FileReader();
			console.log(reader);
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
                var base64data = reader.result;
				//var new_ing = new Image();
				//new_ing.src = base64data;
				
				//start
				
				
				
				let str1 = base64data;
					//Обрезаем конец:
				var from1 = str1.search('base64') + 7; 
				var to1 = str1.length;
				let newstr1 = str1.substr(from1,to1);
				
				var form1 = new FormData();
				form1.append("uuid", id);
				form1.append("photo", newstr1);
				console.log(newstr1);

				var settings = {
  					"url": `${new_settapi}api/profile`,
  					"method": "PUT",
  					"timeout": 0,
  					"headers": {
  					  "Authorization": `Token ${getCookie("auth_token")}`
  					},
  					"processData": false,
  					"mimeType": "multipart/form-data",
  					"contentType": false,
  					"data": form1,
					success: function(){
						setTimeout(function(){
							window.location.reload();
						},1000)
					},
					error: function(){
						console.log('ошибка');
					}
					};

					$.ajax(settings).done(function (response) {
						
  						console.log(response);
					});
				
				
				
				
				
            };
        });
    });

	
	//обезличивание 
	
	
	function deleteacc(){
		var form12 = new FormData();
		form12.append("uuid", id);

		var settings = {
  		"url": `${new_settapi}api/profile`,
  		"method": "DELETE",
  		"timeout": 0,
  		"headers": {
    		"Authorization": `Token ${getCookie("auth_token")}`
  		},
  		"processData": false,
  		"mimeType": "multipart/form-data",
  		"contentType": false,
  		"data": form12,
		success: function(){
			warning1.innerHTML = '';
			/*setTimeout(function(){
				window.location.reload();
			},1000)*/
			if(id==getCookie("user_uuid")){
				deleteCookie("", "auth_token");
				window.location.href = window.location.origin + "/?q=25&f=0"
			}else{
				CloseUserPopup();
			}
		},
			error: function(response){
				let first_resp = response.responseText;
				let pars1 = JSON.parse(first_resp);
				warning1.innerHTML = pars1.message;
			}
		};

		$.ajax(settings).done(function (response) {
  		console.log(response);
		});		
	}
	
	
	
	function deleteAccount(){
		let confirm_do = confirm('Обезличивание приведёт к полной очистке данных профиля. Вы уверены?');
		if(confirm_do == true){
			deleteacc();	
		}else{
			console.log('Не обезличивать');
		}
	}
	nophoto_but.addEventListener('click', deleteAccount);
	
	
	
	//конец
	
	
	console.log(dod, add_user_profile_dd.value);
	console.log(dob, add_user_profile_bd.value);
	/*add_user_profile_bd.value = dob;
	add_user_profile_dd.value = dod;*/
	add_user_profile_photo.setAttribute('src', `${usr_photo == '' ? settings.url+'images/default_avatar.png' : usr_photo}`);
	
	
	add_user_profile_container.style.display = "block";
	console.log(id);
	console.log(last_name);
	console.log(first_name);
	console.log(middle_name);
	
	user_profile_surname_inp.value = last_name;
	user_profile_name_inp.value = first_name;
	user_profile_middlename_inp.value = middle_name;
	add_user_profile_bd.value = dob=='null'?'':dob;
	add_user_profile_dd.value = dod=='null'?'':dod;
	
	async function getUsparent() {
		const response = await fetch(`${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}&depth=100`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());
		for(let i = 0; i<response.connections.length; i++){
			console.log(response)
			console.log(id)
				if(response.connections[i].source == id && response.connections[i].is_mother == true){
					//add_user_profile_mother_input.value = response.connections[i].target;
					moth_inp.value = response.connections[i].target;
					console.log(response.connections[i].target);
				}
				else if(response.connections[i].source == id && response.connections[i].is_father == true){
					//add_user_profile_father_input.value = response.connections[i].target;
					fath_inp.value = response.connections[i].target;
		}
	}
		
	}
	//getUsparent();
	/*let mother_fio = document.querySelector('.mother_fio');
	let father_fio = document.querySelector('.father_fio');
	mother_fio.innerHTML='';
	father_fio.innerHTML='';*/
	let moth_text = document.querySelector('.moth_text');
	let moth_text2 = document.querySelector('.moth_text2');
	let fath_text = document.querySelector('.fath_text');
	let fath_text2 = document.querySelector('.fath_text2');
	let fath_text2_response;
	let moth_text2_response;
	async function get_info_about_parents() {
		const response = await fetch(`${new_settapi}api/profile?uuid=${id}&number=2000`, {
		method: "GET",
		headers: {
			/*"Authorization": 'Token ' + getCookie("auth_token")*/
		}
		}).then(data => data.json());
		if(response.mother != null){
			moth_text.innerHTML = `${response.mother.last_name} ${response.mother.first_name} ${response.mother.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.mother.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			moth_text2_response = `${response.mother.last_name} ${response.mother.first_name} ${response.mother.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.mother.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			moth_text2.innerHTML = moth_text2_response;
		}else{
			moth_text.innerHTML = 'Не задана мама';
			moth_text2_response = 'Не задана мама';
			moth_text2.innerHTML = moth_text2_response;
		}
		if(response.father != null){
			fath_text.innerHTML = `${response.father.last_name} ${response.father.first_name} ${response.father.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.father.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			fath_text2_response = `${response.father.last_name} ${response.father.first_name} ${response.father.middle_name} <a class="user_changed_link" href="${window.location.origin}/gen/?id=${response.father.uuid}&d=5"><i class="fa fa-link" aria-hidden="true"></i></a>`;
			fath_text2.innerHTML = fath_text2_response;
		}else{
			fath_text.innerHTML = 'Не задан папа';
			fath_text2_response = 'Не задан папа';
			fath_text2.innerHTML = fath_text2_response;
		}
		
	}
	
	
	
	
	get_info_about_parents();
	
	
	
	
	
	async function add_user_parents(operation_type_id, add_user_profile_mother_input){
	
				var settings = {
  					"url": `${new_settapi}api/addoperation`,
  					"method": "POST",
  					"timeout": 0,
  					"headers": {
    					"Authorization": `Token ${getCookie("auth_token")}`,
    					"Content-Type": "application/json"
  					},
  					"data": JSON.stringify({
    					"user_id_from": id,
    					"user_id_to": add_user_profile_mother_input,
    					"operation_type_id": operation_type_id
  					}),
					success: function(response){
						//warning1.innerHTML = '';
						rootDialog1.style.display = 'none';
						rootDialog2.style.display = 'none';
						get_info_about_parents();
						fath_text2.innerHTML = fath_text2_response;
						moth_text2.innerHTML = moth_text2_response;
					},
					error: function(response){
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						//warning1.innerHTML = pars1.message;
						if(rootDialog1.style.display == 'flex'){
							moth_text.innerHTML = pars1.message;
						}else if(rootDialog2.style.display == 'flex'){
							fath_text.innerHTML = pars1.message;
						}
					}
					};

					$.ajax(settings).done(function (response) {
  					console.log(response);
					});
			
		
		}
		
		
		
		
		
		async function myProfilesinfo1() {
		const response = await fetch(`${settings.api}api/profile_genesis?uuid=${getCookie('user_uuid')}&depth=100`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
}).then(data => data.json());		
			if(moth_inp.value.includes('id')){
				url.href = moth_inp.value;
				let newstr = url.searchParams.get('id');
				moth_inp.value = newstr;
				console.log(newstr);
			}
			if(fath_inp.value.includes('id')){
				url.href = fath_inp.value;
				let newstr3 = url.searchParams.get('id');
				fath_inp.value = newstr3;
				console.log(newstr3);
			}
			console.log(response);
			let users_resp = [];
			for(let i = 0; i<response.connections.length; i++){
				if(response.connections[i].source == id){
					if(response.connections[i].target == moth_inp.value && response.connections[i].source == id && response.connections[i].target == fath_inp.value && response.connections[i].source == id){
					   console.log('То же что и было');
					}else{
						if(moth_inp.value!= '' && response.connections[i].is_mother == true){
						add_user_parents(7, response.connections[i].target);
						add_user_parents(8, moth_inp.value);
						}
						if(moth_inp.value!= '' && response.connections[i].is_mother == false){
							add_user_parents(8, moth_inp.value);
						}
						if(moth_inp.value == '' && response.connections[i].is_mother == true){
							add_user_parents(7, response.connections[i].target);
						}
						//father
						if(fath_inp.value!= '' && response.connections[i].is_father == true){
						add_user_parents(7, response.connections[i].target);
						add_user_parents(6, fath_inp.value);
						}
						if(fath_inp.value!= '' && response.connections[i].is_father == false){
							add_user_parents(6, fath_inp.value);
						}
						if(fath_inp.value == '' && response.connections[i].is_father == true){
							add_user_parents(7, response.connections[i].target);
						}
						
						
					}
				}
				else{
					
					users_resp.push('none');
				}
				
				
				
			}
			
			if(response.connections.length == users_resp.length){
				if(fath_inp.value!= ''){
					add_user_parents(6, fath_inp.value)
				}
				if(moth_inp.value!= ''){
					add_user_parents(8, moth_inp.value)
				}
				console.log(users_resp);
				//add_user_parents(8, add_user_profile_mother_input.value)
			}
		}
let dialog_mother_save = document.querySelector('.rootDialog1 #rootAddElementMenu');
let dialog_father_save = document.querySelector('.rootDialog2 #rootAddElementMenu');
dialog_mother_save.addEventListener('click', ()=>{
		myProfilesinfo1();
});
dialog_father_save.addEventListener('click', ()=>{
		myProfilesinfo1();
});
	
	//Кнопка Сохранить
	add_user_profile_overbottom.addEventListener('click', SaveUserInfo);
	
	async function SaveUserInfo(){
		if(value_gender==undefined && gender_val==null){
			warning1.innerHTML = "Выберите пол";
		}
			
		var formdata = new FormData();
		formdata.append("uuid", id);
		formdata.append("first_name", user_profile_name_inp.value);
		formdata.append("last_name", user_profile_surname_inp.value);
		formdata.append("middle_name", user_profile_middlename_inp.value);
		formdata.append("dob", add_user_profile_bd.value);
		formdata.append("dod", add_user_profile_dd.value);
		formdata.append("gender", value_gender? value_gender : gender_val ? gender_val : '');
		
	async function add_gen(){	
		var settings = {
  					"url": `${new_settapi}api/profile`,
  					"method": "PUT",
  					"timeout": 0,
  					"headers": {
  					  "Authorization": `Token ${getCookie("auth_token")}`
  					},
  					"processData": false,
  					"mimeType": "multipart/form-data",
  					"contentType": false,
  					"data": formdata,
					success: function(response){
						console.log(response);
						warning1.innerHTML = '';
					},
					error: function(response){
						let first_resp = response.responseText;
						let pars1 = JSON.parse(first_resp);
						warning1.innerHTML = pars1.message;
					}
					};

					$.ajax(settings).done(function (response) {
						//url.searchParams.append('add_new_user', )
						
					});
		
		
		
		
	}
		
		await add_gen();
		
		
		setTimeout(function(){
			if(warning1.innerHTML == ''){
				//window.location.reload();
				OwnerSettings.removeEventListener("click", UserResponseForEdit);
				add_user_profile_overbottom.removeEventListener('click', SaveUserInfo);
				get_position1.removeEventListener('click', ClickOnGetPosition);
				nophoto_but.removeEventListener('click', deleteAccount);
				profile_mother_input.removeEventListener('click', motherOpenFunc);
				profile_father_input.removeEventListener('click', fatherOpenFunc);
				alert("Данные сохранены");
				document.querySelector('#mapid').remove();
				add_user_profile_container.style.display = "none";
			}
		}, 3500)
	}
	
	
	
	
	//закрыть попап
	
	add_user_profile_close_popup.addEventListener('click', CloseUserPopup);
	function CloseUserPopup(){
		if(user_profile_surname_inp.value == last_name && user_profile_name_inp.value == first_name && user_profile_middlename_inp.value == middle_name){
			add_user_profile_container.style.display = "none";
			add_user_profile_close_popup.removeEventListener('click', CloseUserPopup);
			OwnerSettings.removeEventListener("click", UserResponseForEdit);
			add_user_profile_overbottom.removeEventListener('click', SaveUserInfo);
			get_position1.removeEventListener('click', ClickOnGetPosition);
			nophoto_but.removeEventListener('click', deleteAccount);
			profile_mother_input.removeEventListener('click', motherOpenFunc);
			profile_father_input.removeEventListener('click', fatherOpenFunc);
			document.querySelector('#mapid').remove();
		}else{
			let user_profile_not_save = confirm('Есть несохранённые данные. Всё равно закрыть?');
			if(user_profile_not_save == true){
				add_user_profile_container.style.display = "none";
				add_user_profile_close_popup.removeEventListener('click', CloseUserPopup);
				OwnerSettings.removeEventListener("click", UserResponseForEdit);
				add_user_profile_overbottom.removeEventListener('click', SaveUserInfo);
				get_position1.removeEventListener('click', ClickOnGetPosition);
				nophoto_but.removeEventListener('click', deleteAccount);
				profile_mother_input.removeEventListener('click', motherOpenFunc);
				profile_father_input.removeEventListener('click', fatherOpenFunc);
				document.querySelector('#mapid').remove();
			}
		}
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
				//window.location.reload();
				rootDialog.style.display = 'none';
				addElementDialog.style.display = "none";
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
	const response = await fetch(`${settings.api}api/${apiurl}?uuid=${add_user_profile_container.style.display == "block" ? dynamic_id : getCookie("user_uuid")/*getCookie("user_uuid")*/}`, {
		method: "GET"
	}).then(data => data.json())
	return response
}

async function updateTrust(operationId, referal = null) {
	const response = await fetch(`${settings.api}api/addoperation`, {
		method: "POST",
		headers: {
			"Authorization": "Token " + getCookie("auth_token"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "user_id_to": referal ? referal : userIdFrom, "operation_type_id": operationId})
	}).then(data => data.json())
	console.log('add');
}

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


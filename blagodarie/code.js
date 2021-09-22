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
	"FILTER": "filter",
	"FILTERED": "filtered",
	"INVITE": "invite"
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
const INVITE_ID = "INVITE_ROOT";
const PROFILE = {
	id: "",
	text: "",
	tabil: " ",
	image: "",
	nodeType: NODE_TYPES.PROFILE
}

var svg = d3.select("#main");
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
	var tgIframe;
	tgIframe = document.getElementById("telegram-login-BlagodarieAuthBot");
	tgIframe.style.marginTop = '80px';
	tgIframe.style.marginBottom = '45px';
	
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
		vkAuth.disabled = false;
		yandexAuth.disabled = false;
		okAuth.disabled = false;
		tgIframe.style.pointerEvents = '';
	}
	else {
		vkAuth.disabled = true;
		yandexAuth.disabled = true;
		okAuth.disabled = true;
		tgIframe.style.pointerEvents = 'none';
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
		localStorage.setItem("filter", filterInput.value);
		window.location.reload()
		
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
	const result = await fetch(`${settings.api}api/updateprofileinfo`, {
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

async function setProfile() {
	const response = await fetch(`${settings.api}api/getprofileinfo?uuid=${getCookie("user_uuid")}`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());

	PROFILE.text = response.first_name + " " + response.last_name;
	PROFILE.abil = response.ability;
	PROFILE.image = response.photo == '' ? `${settings.url}images/default_avatar.png` : response.photo;
	PROFILE.id = getCookie("user_uuid");
	console.log(response.trust_count);
	console.log(response);
	console.log(response.ability);
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

	window.location.href = `${settings.url}profile/?id=${getCookie("user_uuid")}`;
}



initDefs();


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

var apiUrl = `${settings.api}api/getstats/user_connections_graph`;

if (userIdFrom != null && userIdTo != null && localStorage.getItem('filter') === null){
	apiUrl = `${settings.api}api/profile_graph?uuid=` + userIdFrom + "&uuid_to=" + userIdTo;
	console.log('example1');
} else if(userIdFrom != null && localStorage.getItem('filter') === null){
	apiUrl = `${settings.api}api/profile_graph?uuid=` + userIdFrom;
	console.log('example2');
} else if(localStorage.getItem('filter') != null){
	apiUrl = `${settings.api}api/getstats/user_connections_graph?query=`+localStorage.getItem('filter');
	console.log('example3');
}


var isConnection;
var isTrust;

d3.json(apiUrl)
	.then(async function(data) {


	if (isAuth) {
		await setProfile();
		nodes.push(PROFILE);
	}


	
	
	/*async function filter_head(query_inp) {
	const responseee = await fetch(`${settings.api}/api/getstats/user_connections_graph?query=${query_inp}`, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
	}).then(data => data.json());
		console.log(responseee)*/
		
		
		
	//добавить пользователей в вершины
	data.users.forEach(function(d){
		if (!nodes.some(user => user.id == d.uuid)) {
			if(d.ability === null){
			nodes.push ({
				id: d.uuid,
				text: (d.first_name + " " + d.last_name + " " + " "),
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : d.photo,
				nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : localStorage.getItem("filter") != null && !(d.first_name + " " + d.last_name).toLowerCase().includes(localStorage.getItem("filter").toLowerCase()) ? NODE_TYPES.FILTERED : NODE_TYPES.FRIEND)
			});
			}else{
				nodes.push ({
				id: d.uuid,
				text: (d.first_name + " " + d.last_name),
				tabil: (d.ability),
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : d.photo,
				nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : localStorage.getItem("filter") != null && !(d.first_name + " " + d.last_name).toLowerCase().includes(localStorage.getItem("filter").toLowerCase()) ? NODE_TYPES.FILTERED : NODE_TYPES.FRIEND)
			});
			}
			
			
		}
	});
				
				
				

	
	
	
	
	if (data.wishes != null){
		//добавить вершину желаний
		nodes.push({
			id: WISHES_ROOT_ID,
			text: "Желания",
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

		var activeTrust = `${settings.url}images/trust_active.png`;
		var activeMistrust = `${settings.url}images/mistrust_active.png`;
		var inactiveTrust = `${settings.url}images/trust_inactive.png`;
		var inactiveMistrust = `${settings.url}images/mistrust_inactive.png`;

		isConnection ? isTrust = data.connections.some(link => link.source == PROFILE.id && link.target == userIdFrom && link.is_trust) : null;
		
		async function count_plus() {
		const response = await fetch(`${settings.api}api/getprofileinfo?uuid=` + userIdFrom, {
		method: "GET",
		headers: {
			"Authorization": 'Token ' + getCookie("auth_token")
		}
		}).then(data => data.json());

	//console.log(response.thanks_count);
	//console.log(response);
	
	if(response.thanks_count >= 1){
		 resp = response.thanks_count
		
	}
	else{
		 resp = '';
		
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
			text: "Пригласить",
			image: `${settings.url}images/add.png`,
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
		image: `${settings.url}images/home.png`,
		nodeType: NODE_TYPES.HOME
	})

	//добавить вершину filter
	nodes.push({
		id: FILTER_ID,
		text: "Фильтр",
		image: `${settings.url}images/filter.png`,
		nodeType: NODE_TYPES.FILTER
	});

	if(data.keys != null){
		//добавить вершину ключей
		nodes.push({
			id: KEYS_ROOT_ID,
			text: "Ключи",
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

	//добавить связи пользователей в связи
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
	});
	
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
			d.fx = width / 2 + 400;
			d.fy = height / 2 + 200;
			break;
		case KEYS_ROOT_ID:
			d.fx = width / 2 + 400;
			d.fy = height / 2 - 200;
			break;
		case ABILITIES_ROOT_ID:
			d.fx = width / 2 + 400;
			d.fy = height / 2;
			break;
		case ABILITY_ID:
			d.fx = width / 2 + 500;
			d.fy = height / 2;
			break;
		case SHARE_ID:
			d.fx = width / 2 + 300;
			d.fy = height / 2 - 300;
			break;
		case FILTER_ID:
			d.fx = width / 2 + 400;
			d.fy = height / 2 - 300;
			break;
		case OPTIONS_ID:
			d.fx = width / 2 - 400;
			d.fy = height / 2 - 300;	
			break;
		case INVITE_ID:
				d.fx = width / 2 - 200;
				d.fy = height / 2 - 300;	
				break;
		case HOME_ID:
			d.fx = width / 2 - 300;
			d.fy = height / 2 - 300;
			break;
		case TRUST_ID:
			d.fx = width / 2 + 50;
			d.fy = height / 2 + 100;
			break;
		case MISTRUST_ID:
			d.fx = width / 2 - 50;
			d.fy = height / 2 + 100;
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
				d.fx = width / 2 - 200;
				d.fy = height / 2;
			} else {
				d.fx = width / 2;
				d.fy = height / 2;
			}
			
			break;
		}
	});
	
	simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(150).links(links));
	simulation.force("charge", d3.forceManyBody().strength(0.5));
	//simulation.force("center", d3.forceCenter(width / 2, height / 2))
	simulation.force("collide", d3.forceCollide().strength(0.6).radius(80).iterations(1));
	simulation.force("x", d3.forceX(width / 2).strength(0.2));
	simulation.force("y", d3.forceY(height / 2).strength(0.2));
	

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
			return [[1,d.reverse_is_trust], [2,d.is_trust]];
		})
		.join("stop")
		.attr("offset", d => (d[0] == 1 ? "0%" : "100%"))
		.attr("style", d => {
			if (d[1]){
				return "stop-color:rgb(0,255,0);stop-opacity:1";
			} else {
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
						return "#1c8401";
					} else {
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
				} else {
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
		.call(drag(simulation));
	
	node.append("image")
		.attr("xlink:href", d => d.image)
		.attr("class", d => {
			if (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE) {
				return "userPortrait";
			}
			else if (d.nodeType == NODE_TYPES.FILTERED) {
				return "filtered";
			}
			else {
				return "friendPortrait";
			}
		});
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : 10))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userName" : "friendName"))
		.text(d => (d.tspan));
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  64 : d.nodeType == NODE_TYPES.FILTERED ? 32 : 48))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	  
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64: d.nodeType == NODE_TYPES.FILTERED ? 32 : 48))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userName" : "friendName"))
		.text(d => (d.text));
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  70 : d.nodeType == NODE_TYPES.FILTERED ? 70 : 70))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "friendName" : "friendName"))
		.text(d => (d.tabil));
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  90 : d.nodeType == NODE_TYPES.FILTERED ? 90 : 90))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "friendName" : "friendName"))
		.text(d => (d.abil));
}

function ticked() {
	node.attr("transform", d => {
		var x = (d.x < 0 ? 0 : (d.x > width ? width : d.x));
		var y = (d.y < 0 ? 0 : (d.y > height ? height: d.y));
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
		.attr("y2", calcY2)
		
	link.selectAll("line")
		.attr("x1", calcX1)
		.attr("y1", calcY1)
		.attr("x2", calcX2)
		.attr("y2", calcY2);
}

function calcX1(d){
	const sourceX = (d.source.x < 0 ? 0 : (d.source.x > width ? width : d.source.x));
	const targetX = (d.target.x < 0 ? 0 : (d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 0 ? 0 : (d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 0 ? 0 : (d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var cosA = lWidth / lLength;
	var relX = (d.source.nodeType == NODE_TYPES.USER || d.source.nodeType == NODE_TYPES.PROFILE ? 64 : d.source.nodeType == NODE_TYPES.FILTERED ? 16 : 32) * cosA;
	var x;
	if (targetX > sourceX){
		x = sourceX + relX;
	} else {
		x = sourceX - relX;
	}
	return x;
}

function calcY1(d){
	const sourceX = (d.source.x < 0 ? 0 : (d.source.x > width ? width : d.source.x));
	const targetX = (d.target.x < 0 ? 0 : (d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 0 ? 0 : (d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 0 ? 0 : (d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var sinA = lHeight / lLength;
	var relY = (d.source.nodeType == NODE_TYPES.USER || d.source.nodeType == NODE_TYPES.PROFILE  ? 64 : d.source.nodeType == NODE_TYPES.FILTERED ? 16 : 32) * sinA;
	var y;
	if (targetY > sourceY){
		y = sourceY + relY;
	} else {
		y = sourceY - relY;
	}
	return y;
}

function calcX2(d){
	const sourceX = (d.source.x < 0 ? 0 : (d.source.x > width ? width : d.source.x));
	const targetX = (d.target.x < 0 ? 0 : (d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 0 ? 0 : (d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 0 ? 0 : (d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var cosA = lWidth / lLength;
	var relX = (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.PROFILE ? 64 : d.target.nodeType == NODE_TYPES.FILTERED ? 16 : 32) * cosA;
	var x;
	if (targetX > sourceX){
		x = targetX - relX;
	} else {
		x = targetX + relX;
	}
	return x;
}

function calcY2(d){
	const sourceX = (d.source.x < 0 ? 0 : (d.source.x > width ? width : d.source.x));
	const targetX = (d.target.x < 0 ? 0 : (d.target.x > width ? width : d.target.x));
	const sourceY = (d.source.y < 0 ? 0 : (d.source.y > height ? height : d.source.y));
	const targetY = (d.target.y < 0 ? 0 : (d.target.y > height ? height : d.target.y));
	var lWidth = Math.abs(targetX - sourceX);
	var lHeight = Math.abs(targetY - sourceY);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var sinA = lHeight / lLength;
	var relY = (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.PROFILE ? 64 : d.target.nodeType == NODE_TYPES.FILTERED ? 16 : 32) * sinA;
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


async function onNodeClick(nodeType, uuid, txt){
	if(nodeType == NODE_TYPES.KEY){
		copyToClipboard(txt);
	} else if (nodeType == NODE_TYPES.FRIEND) {

		window.location.href = `${settings.url}profile?id=` + uuid;
	} else if (nodeType == NODE_TYPES.PROFILE) {
		
		window.location.href = `${settings.url}profile?id=` + uuid;
	} else if (nodeType == NODE_TYPES.AUTH) {
		authDialog.style.display = "flex"
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
		shareLink = settings.url + `?invite_token=${await getReferalToken()}`;
		share.updateContent({
			title: document.querySelector(".userName").textContent + ' предлагает Вам своё доверие в системе Благодари.РФ',
			url: shareLink
			
		});
		shareDialog.style.display = "flex";
	}
	else if (nodeType == NODE_TYPES.OPTIONS) {
		optionsDialog.style.display = "flex";
	}
	else if(nodeType == NODE_TYPES.HOME) {
		window.location.href = settings.url
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
		elementAddInput.setAttribute("placeholder", "Желание...");
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
		elementAddInput.setAttribute("placeholder", "Ключ...");
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
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "user_id_to": referal ? referal : userIdFrom, "operation_type_id": operationId})
	}).then(data => data.json())
}







async function getProfileInfo(uuid) {
	const response = await fetch(`${settings.api}api/getprofileinfo?uuid=${uuid}`, {
		method: 'GET',
	})

	return response
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
	


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
	"FILTER": "filter"
});
const WISHES_ROOT_ID = "WISHES_ROOT";
const KEYS_ROOT_ID = "KEYS_ROOT";
const ABILITIES_ROOT_ID = "ABILITIES_ROOT"
const AUTH_ID = "AUTH_ROOT";
const SHARE_ID = "SHARE_ROOT";
const OPTIONS_ID = "OPTIONS_ROOT";
const TRUST_ID = "TRUST_ROOT";
const MISTRUST_ID = "MISTRUST_ROOT";
const FILTER_ID = "FILTER_ROOT";
const PROFILE = {
	id: "",
	text: "",
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
var shareDialog = document.getElementById("shareDialog");
var qrDialog = document.getElementById("qrDialog");
var mailDialog = document.getElementById("mailDialog");
var smsDialog = document.getElementById("smsDialog");
var authDialog = document.getElementById("authDialog");
var rootDialog = document.getElementById("rootDialog");
var addElementDialog = document.getElementById("addElementDialog");
var filterDialog = document.getElementById("filterDialog");

//auth buttons
var vkAuth = document.getElementById("vkAuth");
var yandexAuth = document.getElementById("yandexAuth");
var okAuth = document.getElementById("okAuth");

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


// register sw
window.addEventListener('load', async () => {
	if ('serviceWorker' in navigator) {
		if (url == settings.url) {
			await navigator.serviceWorker.register('./sw.js')
		}
	}
})

//settings
var settings;
settingSets.forEach((setting, i) => {
	if (setting.url.includes(window.location.href) || i == (settingSets.length - 1)) {
		settings = setting
	}
})

console.log(settings);

var telegramAuth = document.createElement('script')
telegramAuth.src = "https://telegram.org/js/telegram-widget.js?14"
telegramAuth.setAttribute('data-telegram-login', settings.bot)
telegramAuth.setAttribute('data-size', "large")
telegramAuth.setAttribute('data-onauth', "onTelegramAuth(user)")
telegramAuth.setAttribute('data-request-access', "write")

authDialog.insertBefore(telegramAuth, authDialog.lastElementChild);
var tgIframe = document.getElementById("telegram-login-BlagodarieAuthBot");
tgIframe.style.marginTop = '3px';


if (getCookie("auth_data")) {
	var auth_data = getCookie("auth_data");
	var user_uuid;
	var auth_token;

	auth_data = auth_data.replace(/\\/g, '');
	auth_data = auth_data.substr(1, auth_data.length - 2);
	auth_data = auth_data.split("\"")

	auth_data.forEach((item, i) => {
		item == "user_uuid" ? user_uuid = auth_data[i + 2] : null
		item == "auth_token" ? auth_token = auth_data[i + 2] : null
	})
	
	setAuthCookie(user_uuid, auth_token);
	deleteCookie('.', 'auth_data');

	window.location.href = `${settings.url}profile/?id=${getCookie("user_uuid")}`;
}

//auth status
var isAuth = getCookie("auth_token") ? true : false;



// add event to buttons
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
			qrcode.makeCode(window.location.href);
		})
	}
	else if (share.id == "mail-button") {
		share.addEventListener("click", () => mailDialog.style.display = "flex");
	}
	else if (share.id == "sms-button") {
		share.addEventListener("click", () => smsDialog.style.display = "flex");
	}
});

// share form buttons
[...document.getElementsByClassName("submit-form")].forEach( button => {
	button.addEventListener("click", (event) => {
		event.preventDefault();
		if (button.id == "confrim-mail") {
			button.parentElement.action = `mailto:${document.getElementById("mailInput").value}?data=${window.location.href}`;
		} else if (button.id == "confrim-sms") {
			button.parentElement.action = `sms:${document.getElementById("smsInput").value}?body=${window.location.href}`;
		}
		button.parentElement.submit();
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
		localStorage.setItem("filter", filterInput.value)
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
		document.cookie = `${cookie}=''; path=/ ; domain=${subdomain + domain} ;expires=${new Date(0).toUTCString()}`
	})
	// document.cookie = `user_uuid=''; path=/ ;expires=${new Date(0).toUTCString()}`
	// document.cookie = `auth_token=''; path=/ ;expires=${new Date(0).toUTCString()}`
}

async function setProfile() {
	const response = await fetch(`${settings.api}api/getprofileinfo?uuid=${getCookie("user_uuid")}`, {
		method: "GET",
		headers: {
			"Authorization": getCookie("auth_token")
		}
	}).then(data => data.json());

	PROFILE.text = response.first_name + " " + response.last_name;
	PROFILE.image = response.photo == '' ? `${settings.url}images/default_avatar.png` : response.photo;
	PROFILE.id = getCookie("user_uuid");
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

	window.location.href = `${settings.url}profile/?id=${getCookie("user_uuid")}`;
}

//vk auth
vkAuth.addEventListener("click", () => {
	window.location.href = `https://oauth.vk.com/authorize?client_id=${settings.vk.client_id}&response_type=code&redirect_uri=${settings.vk.redirect_uri}`
})

//yandex auth
yandexAuth.addEventListener("click", () => {
	window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${settings.yandex.client_id}`
})

//ok auth
okAuth.addEventListener("click", () => {
	window.location.href = `http://ok.ru/oauth/authorize?client_id=${settings.ok.client_id}&response_type=code&redirect_uri=${settings.ok.redirect_uri}`
})

initDefs();


// load the data

var url = new URL(window.location.href);


var userIdFrom = url.searchParams.get("id");
var userIdTo = url.searchParams.get("userIdTo");
var fromApp = url.searchParams.get("from_app");

var apiUrl = `${settings.api}api/getstats/user_connections_graph`;

if (userIdFrom != null && userIdTo != null){
	apiUrl = `${settings.api}api/profile_graph?uuid=` + userIdFrom + "&uuid_to=" + userIdTo;
} else if(userIdFrom != null){
	apiUrl = `${settings.api}api/profile_graph?uuid=` + userIdFrom;
}

d3.json(apiUrl)
	.then(async function(data) {
	//добавить элемент авторизации
	if (!isAuth) {
		nodes.push({
			id: AUTH_ID,
			text: "",
			image: `${settings.url}images/enter.png`,
			nodeType: NODE_TYPES.AUTH
		});
	} else if (isAuth) {
		await setProfile();
		nodes.push(PROFILE);
	}

	//добавить пользователей в вершины
	data.users.forEach(function(d){
		if (!nodes.some(user => user.id == d.uuid)) {
			nodes.push ({
				id: d.uuid,
				text: (d.first_name + " " + d.last_name),
				image: d.photo == '' ? `${settings.url}images/default_avatar.png` : d.photo,
				nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : NODE_TYPES.FRIEND)
			});
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

	if (isAuth && userIdFrom && !(userIdFrom == PROFILE.id)) {
		//добавить вершину доверие/недоверие
		nodes.push({
			id: TRUST_ID,
			text: "Доверие",
			image: data.connections.some(data => data.source == getCookie('user_uuid') && data.target == userIdFrom && data.is_trust) ? `${settings.url}images/trust_active.png` : `${settings.url}images/trust_inactive.png`,
			nodeType: NODE_TYPES.TRUST
		});

		nodes.push({
			id: MISTRUST_ID,
			text: "Недоверие",
			image: data.connections.some(data => data.source == getCookie('user_uuid') && data.target == userIdFrom && data.is_trust) ? `${settings.url}images/mistrust_inactive.png` : `${settings.url}images/mistrust_active.png`,
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
	}

	//добавить вершину share
	nodes.push({
		id: SHARE_ID,
		text: "Поделиться",
		image: `${settings.url}images/shareee.png`,
		nodeType: NODE_TYPES.SHARE
	});

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
		links.push({
			source: userIdFrom,
			target: WISHES_ROOT_ID
		});
		
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
		links.push({
			source: userIdFrom,
			target: ABILITIES_ROOT_ID
		})

		data.abilities.forEach(function(d) {
			links.push({
				source: ABILITIES_ROOT_ID,
				target: `ability_${d.uuid}`
			})
		})
	}

	if (isAuth && userIdFrom && !(userIdFrom == PROFILE.id)) {
		// добавить связь пользователя с вершиной Доверие
		links.push({
			source: TRUST_ID,
			target: userIdFrom
		});

		// Добавить связь пользователя с вершиной Недоверие
		links.push({
			source: MISTRUST_ID,
			target: userIdFrom
		});

		// добавить связь авторизированного пользователя с вершиной Доверие
		links.push({
			source: TRUST_ID,
			target: getCookie('user_uuid')
		});

		// Ддобавить связь авторизированного пользователя с вершиной Недоверие
		links.push({
			source: MISTRUST_ID,
			target: getCookie('user_uuid')
		});
	}

	if (data.keys != null){
		//добавить связь пользователя с вершиной ключей
		links.push({
			source: userIdFrom,
			target: KEYS_ROOT_ID
		});
		
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
			if (isAuth) {
				d.fx = width / 2 + 150;
				d.fy = height / 2;
			} else {
				d.fx = width / 2 + 150;
				d.fy = height / 2;
			}
			break;
		case WISHES_ROOT_ID:
			d.fx = width / 2 + 400;
			d.fy = height / 2 + 300;
			break;
		case KEYS_ROOT_ID:
			d.fx = width / 2 + 400;
			d.fy = height / 2 - 300;
			break;
		case ABILITIES_ROOT_ID:
			d.fx = width / 2 + 400;
			d.fy = height / 2;
			break;
		case SHARE_ID:
			d.fx = width / 2 + 200;
			d.fy = height / 2 - 300;
			break;
		case FILTER_ID:
			d.fx = width / 2 + 300;
			d.fy = height / 2 - 300;
			break;
		case OPTIONS_ID:
			d.fx = width / 2 + 100;
			d.fy = height / 2 - 300;	
			break;
		case TRUST_ID:
			d.fx = width / 2;
			d.fy = height / 2 + 100;
			break;
		case MISTRUST_ID:
			d.fx = width / 2;
			d.fy = height / 2 - 100;
			break;
		case AUTH_ID:
			d.fx = width / 2;
			d.fy = height / 2;
			break;
		case PROFILE.id:
			if (userIdFrom) {
				d.fx = width / 2 - 150;
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
	simulation.force("collide", d3.forceCollide().strength(0.2).radius(80).iterations(1));
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
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST){
				if (d.is_trust == d.reverse_is_trust || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST){
					if(d.is_trust || d.source.nodeType == NODE_TYPES.TRUST){
						return "#00ff00";
					} else {
						return "#ff0000";
					}
				} else {
					return "url(#grad_from_" + d.source.id + "_to_" + d.target.id + ")";
				}
			} else {
				return "#00ffff";
			}
		})
		.attr("marker-end", d => {
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND || d.target.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.PROFILE || d.source.nodeType == NODE_TYPES.TRUST || d.source.nodeType == NODE_TYPES.MISTRUST){
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
			else if (d.nodeType == NODE_TYPES.FRIEND && localStorage.getItem("filter") != null && d.text.toLowerCase().includes(localStorage.getItem("filter").toLowerCase())) {
				return "filtered";
			}
			else {
				return "friendPortrait";
			}
		});
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ?  64 : 32))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	  
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.PROFILE ? 64 : 32))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER || d.nodeType == NODE_TYPES.AUTH || d.nodeType == NODE_TYPES.PROFILE ? "userName" : "friendName"))
		.text(d => (d.text));
}

function ticked() {
	node.attr("transform", d => {
		var x = (d.x < 0 ? 0 : (d.x > width ? width : d.x));
		var y = (d.y < 0 ? 0 : (d.y > height ? height: d.y));
		if (d.nodeType == NODE_TYPES.USER){
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
	var relX = (d.source.nodeType == NODE_TYPES.USER ? 64 : 16) * cosA;
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
	var relY = (d.source.nodeType == NODE_TYPES.USER ? 64 : 16) * sinA;
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
	var relX = (d.target.nodeType == NODE_TYPES.USER ? 64 : 16) * cosA;
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
	var relY = (d.target.nodeType == NODE_TYPES.USER ? 64 : 16) * sinA;
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
		.attr("fill", "#00ffff")
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
		.attr("fill", "#00ff00")
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
		.attr("fill", "#00ffff")
		.attr("d", "M0,-5 L10,0 L0,5");
		
	defs.append("clipPath")
		.attr("id", "friendCircle")
		.append("circle")
		.attr("cx", "0")
		.attr("cy", "0")
		.attr("r", "16")
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
		.attr("r", "32")
		.attr("fill", "#ff0000");
}

async function onNodeClick(nodeType, uuid, txt){
	if(nodeType == NODE_TYPES.KEY){
		copyToClipboard(txt);
		window.open('https://www.tinkoff.ru/cardtocard/', '_blank');
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
		shareDialog.style.display = "flex";
	}
	else if (nodeType == NODE_TYPES.OPTIONS) {
		optionsDialog.style.display = "flex";
	}
	else if (nodeType == NODE_TYPES.TRUST) {
		await updateTrust(3);
	}
	else if (nodeType == NODE_TYPES.MISTRUST) {
		await updateTrust(2);
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

async function updateTrust(operationId) {
	if (links.some(link => link.source.id == getCookie("user_uuid") && link.target.id == userIdFrom)) {
		operationId = 4;
	}

	const response = await fetch(`${settings.api}api/addoperation`, {
		method: "POST",
		headers: {
			"Authorization": "Token " + getCookie("auth_token"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify({"user_id_from":getCookie("auth_token"), "user_id_to":userIdFrom, "operation_type_id": operationId})
	}).then(data => data.json())

	window.location.reload();
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

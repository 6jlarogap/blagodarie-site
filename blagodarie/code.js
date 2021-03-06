const NODE_TYPES = Object.freeze({"USER":"user", "FRIEND":"friend", "WISH_ROOT": "wish_root", "WISH":"wish", "KEY_ROOT":"key_root", "KEY":"key"});
const WISHES_ROOT_ID = "WISHES_ROOT";
const KEYS_ROOT_ID = "KEYS_ROOT";

var svg = d3.select("#main");
var width = +svg.node().getBoundingClientRect().width;
var height = +svg.node().getBoundingClientRect().height;
var link;
var node;
var nodes = [];
var links = [];
var simulation;

initDefs();

// load the data
var url = new URL(window.location.href);
var userIdFrom = url.searchParams.get("id");
var userIdTo = url.searchParams.get("userIdTo");
var fromApp = url.searchParams.get("from_app");

redrawMarketLinks();

var apiUrl = "https://api.blagodarie.org/api/getstats/user_connections_graph";

if (userIdFrom != null && userIdTo != null){
	apiUrl = "https://api.blagodarie.org/api/profile_graph?uuid=" + userIdFrom + "&uuid_to=" + userIdTo;
} else if(userIdFrom != null){
	apiUrl = "https://api.blagodarie.org/api/profile_graph?uuid=" + userIdFrom;
}

d3.json(apiUrl)
	.then(function(data) {

	//добавить пользователей в вершины
	data.users.forEach(function(d){
		nodes.push ({
			id: d.uuid,
			text: (d.first_name + " " + d.last_name),
			image: d.photo,
			nodeType: (d.uuid == userIdFrom ? NODE_TYPES.USER : NODE_TYPES.FRIEND)
		});
	});
	
	if (data.wishes != null){
		//добавить вершину желаний
		nodes.push({
			id: WISHES_ROOT_ID,
			text: "Желания",
			image: "https://blagodarie.org/images/sleep.png",
			nodeType: NODE_TYPES.WISH_ROOT
		});
		
		//добавить желания в вершины
		data.wishes.forEach(function(d){
			nodes.push({
				id: `wish_${d.uuid}`,
				text: d.text,
			image: "https://blagodarie.org/images/chat-sleep.png",
			nodeType: NODE_TYPES.WISH
			});
		});
	}
	
	if(data.keys != null){
		//добавить вершину ключей
		nodes.push({
			id: KEYS_ROOT_ID,
			text: "Ключи",
			image: "https://blagodarie.org/images/folder-key.png",
			nodeType: NODE_TYPES.KEY_ROOT
		});
		
		//добавить ключи в вершины
		data.keys.forEach(function(d){
			var image;
			switch (d.type_id) {
			case 1:
				image = "https://blagodarie.org/images/phone.png";
				break;
			case 2:
				image = "https://blagodarie.org/images/at.png";
				break;
			case 4:
				image = "https://blagodarie.org/images/credit-card.png";
				break;
			case 5:
				image = "https://blagodarie.org/images/link.png";
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
	
	///////////////TEST
	/*nodes.push({
			id: "ШМЫГА",
			text: "ШМЫГА",
			image: "http://bik-axiom.wdfiles.com/local--files/gollum/13.jpg",
			nodeType: NODE_TYPES.FRIEND
		});
	links.push({
			source: userIdFrom,
			target: "ШМЫГА",
			is_trust: true,
			reverse_is_trust: false
		});
	links.push({
			source: "ШМЫГА",
			target: userIdFrom,
			is_trust: false,
			reverse_is_trust: true
		});
		
	nodes.push({
			id: "ШМЫГА2",
			text: "ШМЫГА2",
			image: "http://bik-axiom.wdfiles.com/local--files/gollum/13.jpg",
			nodeType: NODE_TYPES.FRIEND
		});
	links.push({
			source: userIdFrom,
			target: "ШМЫГА2",
			is_trust: false,
			reverse_is_trust: true
		});
	links.push({
			source: "ШМЫГА2",
			target: userIdFrom,
			is_trust: true,
			reverse_is_trust: false
		});*/
	///////////////////
		
	//зафиксировать вершины пользователя, желаний и ключей
	nodes.forEach(function(d) {
		switch(d.id){
		case userIdFrom:
			d.fx = width / 2;
			d.fy = height / 2;
			break;
		case WISHES_ROOT_ID:
			d.fx = width / 2 + 200;
			d.fy = height / 2 - 200;
			break;
		case KEYS_ROOT_ID:
			d.fx = width / 2 + 200;
			d.fy = height / 2 - 300;
			break;
		}
	});
	
	console.log(data);
	console.log(nodes);
	console.log(links);
	
	simulation = d3.forceSimulation(nodes);
	simulation.force("link", d3.forceLink(links).id(d => d.id).distance(150).links(links));
	simulation.force("charge", d3.forceManyBody().strength(0.5));
	//simulation.force("center", d3.forceCenter(width / 2, height / 2))
	simulation.force("collide", d3.forceCollide().strength(0.5).radius(70).iterations(1));
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
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND){
				if (d.is_trust == d.reverse_is_trust){
					if(d.is_trust){
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
			if (d.target.nodeType == NODE_TYPES.USER || d.target.nodeType == NODE_TYPES.FRIEND){
				if (d.is_trust){
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
		.attr("class", d => (d.nodeType == NODE_TYPES.USER ? "userPortrait" : "friendPortrait"));
	
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER ? 64 : 32))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	  
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER ? 64 : 32))
		.attr("font-size", "20")
		.attr("class", d => (d.nodeType == NODE_TYPES.USER ? "userName" : "friendName"))
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
	redrawMarketLinks();
	simulation.alpha(1).restart();
});

function redrawMarketLinks(){
	if (fromApp == null){
		var marketLinks = d3.select("#marketLinks");
		if (marketLinks.node() == null){
			marketLinks = svg.append("g");
			marketLinks.attr("id", "marketLinks");
			marketLinks.append("a")
				.attr("href", "https://blagodarie.org/ios.html")
				.append("image")
				.attr("xlink:href", "https://blagodarie.org/images/apple.png");
			marketLinks.append("a")
//				.attr("href", "https://play.google.com/store/apps/details?id=blagodarie.rating")
				.attr("href", "https://github.com/6jlarogap/blagodari/blob/ff18915bfffd53a3779290f386a36d34bd66cf04/app/release/rating-0.0.36-release.apk?raw=true")
				.append("image")
				.attr("xlink:href", "https://blagodarie.org/images/android.png")
				.attr("x", 128);
		}
		var marketLinksWidth = 256;//marketLinks.node().getBoundingClientRect().width;
		var marketLinksHeight = 128;//marketLinks.node().getBoundingClientRect().height;
		var x = (width / 2) - (marketLinksWidth / 2);
		var y = height - marketLinksHeight;
		marketLinks.attr("transform", `translate(${x}, ${y})`);
	}
}

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
}

function onNodeClick(nodeType, uuid, txt){
	if(nodeType == NODE_TYPES.KEY){
		copyToClipboard(txt)
	} else if (nodeType == NODE_TYPES.FRIEND) {
		window.location.href = "https://blagodarie.org/profile?id=" + uuid;
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

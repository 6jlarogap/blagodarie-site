const NODE_TYPES = Object.freeze({"USER":"user", "FRIEND":"friend", "OTHER":"other"});
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

var xxx = svg.append("g");
xxx.attr("id", "xxx");
d3.select("#xxx")
	.append("a")
	.attr("href", "https://play.google.com/store/apps/details?id=blagodarie.rating")
	.append("image")
	.attr("xlink:href", "apple.png")
	.attr("x", ((width / 2) - 128))
	.attr("y", (height - 128));
d3.select("#xxx")
	.append("a")
	.attr("href", "https://play.google.com/store/apps/details?id=blagodarie.rating")
	.append("image")
	.attr("xlink:href", "android.png")
	.attr("x", (width / 2))
	.attr("y", (height - 128));

// load the data
var url = new URL(window.location.href);
var userId = url.searchParams.get("id");

d3.json("https://api.blagodarie.org/api/profile_graph?uuid=" + userId)
	.then(function(data) {

	//добавить пользователей в вершины
	data.users.forEach(function(d){
		nodes.push ({
			id: d.uuid,
			text: (d.first_name + " " + d.last_name),
			image: d.photo,
			nodeType: (d.uuid == userId ? NODE_TYPES.USER : NODE_TYPES.FRIEND)
		});
	});
	
	//добавить вершину желаний
	nodes.push({
		id: WISHES_ROOT_ID,
		text: "Желания",
		image: "sleep.png",
		nodeType: NODE_TYPES.OTHER
	});
	
	//добавить желания в вершины
	data.wishes.forEach(function(d){
		nodes.push({
			id: `wish_${d.uuid}`,
			text: d.text,
		image: "chat-sleep.png",
		nodeType: NODE_TYPES.OTHER
		});
	});
	
	//добавить вершину ключей
	nodes.push({
		id: KEYS_ROOT_ID,
		text: "Ключи",
		image: "folder-key.png",
		nodeType: NODE_TYPES.OTHER
	});
	
	//добавить ключи в вершины
	data.keys.forEach(function(d){
		var image;
		switch (d.type_id) {
		case 1:
			image = "phone.png";
			break;
		case 2:
			image = "at.png";
			break;
		case 4:
			image = "credit-card.png";
			break;
		case 5:
			image = "link.png";
			break;
		}
		nodes.push({
			id: `key_${d.id}`,
			text: `${d.value}`,
			image: image,
			nodeType: NODE_TYPES.OTHER
		});
	});
	
	//добавить связи пользователей в связи
	data.connections.forEach(function(d){
		var reverse_is_trust = d.is_trust;
		data.connections.forEach(function(dd){
			if (d.source == dd.target && d.target == dd.source){
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
	
	//добавить связь пользователя с вершиной желаний
	links.push({
		source: userId,
		target: WISHES_ROOT_ID
	});
	
	//добавить связь вершины желаний с желаниями
	data.wishes.forEach(function(d) {
		links.push({
			source: WISHES_ROOT_ID,
			target: `wish_${d.uuid}`
		});
	});
	
	//добавить связь пользователя с вершиной ключей
	links.push({
		source: userId,
		target: KEYS_ROOT_ID
	});
	
	//добавить связь вершины ключей с ключами
	data.keys.forEach(function(d) {
		links.push({
			source: KEYS_ROOT_ID,
			target: `key_${d.id}`
		});
	});
		
	//зафиксировать вершины пользователя, желаний и ключей
	nodes.forEach(function(d) {
		switch(d.id){
		case userId:
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
	//simulation.force("x", d3.forceX(width / 2).strength(0.02));
	//simulation.force("y", d3.forceY(height / 2).strength(0.02));
	

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
			console.log(d);
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
			if (d.target.nodeType == NODE_TYPES.OTHER){
				return "#00ffff";
			} else{
				if (d.is_trust == d.reverse_is_trust){
					if(d.is_trust){
						return "#00ff00";
					} else {
						return "#ff0000";
					}
				} else {
					return "url(#grad_from_" + d.source.id + "_to_" + d.target.id + ")";
				}
			}
		})
		.attr("marker-end", d => {
			if (d.target.nodeType == NODE_TYPES.OTHER){
				return "url(#arrow-to-other)";
			} else {
				if (d.is_trust){
					if (d.target.nodeType == NODE_TYPES.USER){
						return "url(#arrow-trust-to-profile)";
					} else {
						return "url(#arrow-trust-to-friend)";
					}
				} else {
					if (d.target.nodeType == NODE_TYPES.USER){
						return "url(#arrow-mistrust-to-profile)";
					} else {
						return "url(#arrow-mistrust-to-friend)";
					}
				}
			}
		});

	node = svg.append("g")
		.selectAll("g")
		.data(nodes)
		.join("g")
		.call(drag(simulation));
	  
	node.append("a")
		.attr("href", d => ("https://blagodarie.org/prof?id=" + d.id))
		.append("image")
		.attr("xlink:href", d => d.image)
		.attr("class", d => (d.nodeType == NODE_TYPES.USER ? "userPortrait" : "friendPortrait"));

	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER ? 64 : 32))
		.attr("class", d => (d.nodeType == NODE_TYPES.USER ? "userNameShadow" : "friendNameShadow"))
		.text(d => (d.text));
	  
	node.append("text")
		.attr("y", d => (d.nodeType == NODE_TYPES.USER ? 64 : 32))
		.attr("class", d => (d.nodeType == NODE_TYPES.USER ? "userName" : "friendName"))
		.text(d => (d.text));
}

function ticked() {

	node.attr("transform", d => `translate(${d.x},${d.y})`);
	
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
	var lWidth = Math.abs(d.target.x - d.source.x);
	var lHeight = Math.abs(d.target.y - d.source.y);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var cosA = lWidth / lLength;
	var relX = (d.source.id == userId ? 64 : 16) * cosA;
	var x;
	if (d.target.x > d.source.x){
		x = d.source.x + relX;
	} else {
		x = d.source.x - relX;
	}
	return x;
}

function calcY1(d){
	var lWidth = Math.abs(d.target.x - d.source.x);
	var lHeight = Math.abs(d.target.y - d.source.y);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var sinA = lHeight / lLength;
	var relY = (d.source.id == userId ? 64 : 16) * sinA;
	var y;
	if (d.target.y > d.source.y){
		y = d.source.y + relY;
	} else {
		y = d.source.y - relY;
	}
	return y;
}

function calcX2(d){
	var lWidth = Math.abs(d.target.x - d.source.x);
	var lHeight = Math.abs(d.target.y - d.source.y);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var cosA = lWidth / lLength;
	var relX = (d.target.id == userId ? 64 : 16) * cosA;
	var x;
	if (d.target.x > d.source.x){
		x = d.target.x - relX;
	} else {
		x = d.target.x + relX;
	}
	return x;
}

function calcY2(d){
	var lWidth = Math.abs(d.target.x - d.source.x);
	var lHeight = Math.abs(d.target.y - d.source.y);
	var lLength = Math.sqrt((lWidth * lWidth) + (lHeight * lHeight));
	var sinA = lHeight / lLength;
	var relY = (d.target.id == userId ? 64 : 16) * sinA;
	var y;
	if (d.target.y > d.source.y){
		y = d.target.y - relY;
	} else {
		y = d.target.y + relY;
	}
	return y;
}

//////////// UI EVENTS ////////////
d3.select(window).on("resize", function(){
	width = +svg.node().getBoundingClientRect().width;
	height = +svg.node().getBoundingClientRect().height;
	simulation.alpha(1).restart();
});

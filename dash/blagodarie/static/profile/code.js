
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
			console.log(userId);

			d3.json("https://api.blagodarie.org/api/profile_graph?uuid=" + userId)
				.then(function(data) {
				/*
				data.wishes = [
					{
						id:1,
						text: "хочу то…"
					},{
						id:2,
						text: "хочу это…"
					}]
				;
				
				data.keys = [
					{
						id:1,
						value: "+465432132156465"
					},{
						id:2,
						value: "asfaew@fkj.com"
					}]
				;*/
				
				//добавить пользователей в вершины
				data.users.forEach(function(d){
					nodes.push ({
						id: d.uuid,
						text: (d.first_name + " " + d.last_name),
						image: d.photo
					});
				});
				
				//добавить вершину желаний
				nodes.push({
					id: "wishes",
					text: "Желания",
					image: "sleep.png"
				});
				
				//добавить желания в вершины
				data.wishes.forEach(function(d){
					nodes.push({
						id: `wish_${d.uuid}`,
						text: d.text,
					image: "chat-sleep.png"
					});
				});
				
				//добавить вершину ключей
				nodes.push({
					id: "keys",
					text: "Ключи",
					image: "folder-key.png"
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
						image: image
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
					target: "wishes"
				});
				
				//добавить связь вершины желаний с желаниями
				data.wishes.forEach(function(d) {
					links.push({
						source: "wishes",
						target: `wish_${d.uuid}`
					});
				});
				
				//добавить связь пользователя с вершиной ключей
				links.push({
					source: userId,
					target: "keys"
				});
				
				//добавить связь вершины ключей с ключами
				data.keys.forEach(function(d) {
					links.push({
						source: "keys",
						target: `key_${d.id}`
					});
				});
				
				///////////////TEST
				/*nodes.push({
						id: "ШМЫГА",
						text: "ШМЫГА",
						image: "http://bik-axiom.wdfiles.com/local--files/gollum/13.jpg"
					});
				links.push({
						source: userId,
						target: "ШМЫГА",
						is_trust: true,
						reverse_is_trust: false
					});
				links.push({
						source: "ШМЫГА",
						target: userId,
						is_trust: false,
						reverse_is_trust: true
					});
					
				nodes.push({
						id: "ШМЫГА2",
						text: "ШМЫГА2",
						image: "http://bik-axiom.wdfiles.com/local--files/gollum/13.jpg"
					});
				links.push({
						source: userId,
						target: "ШМЫГА2",
						is_trust: false,
						reverse_is_trust: true
					});
				links.push({
						source: "ШМЫГА2",
						target: userId,
						is_trust: true,
						reverse_is_trust: false
					});*/
				///////////////////
				
				//зафиксировать вершины пользователя, желаний и ключей
				nodes.forEach(function(d) {
					if (d.id == userId){
						d.fx = width / 2;
						d.fy = height / 2;
					} else if (d.id == "wishes"){
						d.fx = width / 2 + 200;
						d.fy = height / 2 - 200;
					} else if (d.id == "keys"){
						d.fx = width / 2 + 200;
						d.fy = height / 2 - 300;
					}
				});
				
				console.log(data);
				console.log(nodes);
				console.log(links);
				
				simulation = d3.forceSimulation(nodes);
				simulation.force("link", d3.forceLink(links).id(d => d.id));
				simulation.force("charge", d3.forceManyBody().strength(0.5));
				//simulation.force("center", d3.forceCenter(width / 2, height / 2))
				simulation.force("collide", d3.forceCollide());
				//simulation.force("x", d3.forceX(width / 2).strength(0.02));
				//simulation.force("y", d3.forceY(height / 2).strength(0.02));
				

				initializeDisplay();
				initializeSimulation();
			});


			//////////// FORCE SIMULATION //////////// 

			// set up the simulation and event to update locations after each tick
			function initializeSimulation() {
			  simulation.nodes(nodes);
			  initializeForces();
			  simulation.on("tick", ticked);
			  /*simulation.on("tick", () => {
				link.attr("d", linkArc);
				node.attr("transform", d => `translate(${d.x},${d.y})`);
			  });*/
			}

			// values for all forces
			forceProperties = {
				center: {
					x: 0.5,
					y: 0.5
				},
				charge: {
					enabled: true,
					strength: -30,
					distanceMin: 1,
					distanceMax: 2000
				},
				collide: {
					enabled: true,
					strength: .7,
					iterations: 1,
					radius: 5
				},
				forceX: {
					enabled: false,
					strength: .1,
					x: .5
				},
				forceY: {
					enabled: false,
					strength: .1,
					y: .5
				},
				link: {
					enabled: true,
					distance: 30,
					iterations: 1
				}
			}

			// add forces to the simulation
			function initializeForces() {
				// add forces and associate each with a name
				// apply properties to each of the forces
				updateForces();
			}

			// apply new force properties
			function updateForces() {
				// get each force by name and update the properties
				/*simulation.force("center")
					.x(width / 2)
					.y(height / 2);
				/*simulation.force("charge")
					.strength(forceProperties.charge.strength * forceProperties.charge.enabled)
					.distanceMin(forceProperties.charge.distanceMin)
					.distanceMax(forceProperties.charge.distanceMax);*/
				
				simulation.force("collide")
					.strength(0.5)
					.radius(70)
					.iterations(1);
				/*simulation.force("x")
					.strength(0.02)
					.x(0.5);
				simulation.force("y")
					.strength(0.02)
					.y(0.5);*/
				simulation.force("link")
					.id(function(d) {return d.id;})
					.distance(150)
					.links(links);

				// updates ignored until this is run
				// restarts the simulation (important if simulation has already slowed down)
				simulation.alpha(1).restart();
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


			//////////// DISPLAY ////////////
			// generate the svg objects and force simulation
			function initializeDisplay() {
			  // set the data and properties of link lines

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
					}/*
					(d == 1 ? 
											(d.reverse_is_trust ? 
												"stop-color:rgb(0,255,0);stop-opacity:1" :
												"stop-color:rgb(255,0,0);stop-opacity:1") :
											(d.is_trust ? 
												"stop-color:rgb(0,255,0);stop-opacity:1" :
												"stop-color:rgb(255,0,0);stop-opacity:1")
										)*/
						);
					
				link.append("svg:line")
					.attr("class", "link")
					.attr("x1", calcX1)
					.attr("y1", calcY1)
					.attr("x2", calcX2)
					.attr("y2", calcY2)
					.attr("stroke", d => {
						console.log(d.is_trust == d.reverse_is_trust);
						if (d.is_trust == d.reverse_is_trust){
							if(d.is_trust){
								return "#00ff00"
							} else {
								return "#ff0000"
							}
						} else {
							return "url(#grad_from_" + d.source.id + "_to_" + d.target.id + ")"
						}
					})
					//.attr("stroke", "#aaaaaa")
					.attr("marker-end", d => (d.is_trust ? (d.target.id == userId ? "url(#arrow-trust-to-profile)" : "url(#arrow-trust-to-friend)") : (d.target == userId ? "url(#arrow-mistrust-to-profile)" : "url(#arrow-mistrust-to-friend)")));


			  // set the data and properties of node circles

				node = svg.append("g")
					.selectAll("g")
					.data(nodes)
					.join("g")
					.call(drag(simulation));
				  
				node
					.append("a")
					.attr("href", d => ("https://blagodarie.org/prof?id=" + d.id))
					.append("image")
					.attr("xlink:href", d => d.image)
					.attr("class", d => (d.id == userId ? "userPortrait" : "friendPortrait"));

				node.append("text")
					.attr("y", d => (d.id == userId ? 64 : 32))
					.attr("class", d => (d.id == userId ? "userNameShadow" : "friendNameShadow"))
					.text(d => (d.text));
				  
				node.append("text")
					.attr("y", d => (d.id == userId ? 64 : 32))
					.attr("class", d => (d.id == userId ? "userName" : "friendName"))
					.text(d => (d.text));
				  
			  // visualize the graph
			  updateDisplay();
			}

			function linkArc(d) {
			  const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
			  return `
				M${d.source.x},${d.source.y}
				A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
			  `;
			}

			// update the display based on the forces (but not positions)
			function updateDisplay() {
			}

			// update the display positions after each simulation tick
			function ticked() {

				//link.attr("d", linkArc);
				node.attr("transform", d => `translate(${d.x},${d.y})`);
				
				link
					.selectAll("g")
					.attr("x1", calcX1)
					.attr("y1", calcY1)
					.attr("x2", calcX2)
					.attr("y2", calcY2);
					
				link
					.selectAll("linearGradient")
					.attr("x1", calcX1)
					.attr("y1", calcY1)
					.attr("x2", calcX2)
					.attr("y2", calcY2)
					
				link
					.selectAll("line")
					.attr("x1", calcX1)
					.attr("y1", calcY1)
					.attr("x2", calcX2)
					.attr("y2", calcY2);
/*
				node
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
				d3.select('#alpha_value').style('flex-basis', (simulation.alpha()*100) + '%');*/
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

			// update size-related forces
			d3.select(window).on("resize", function(){
				width = +svg.node().getBoundingClientRect().width;
				height = +svg.node().getBoundingClientRect().height;
				updateForces();
			});

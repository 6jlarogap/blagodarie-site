
var svg = d3.select("svg"),
    width = +svg.node().getBoundingClientRect().width,
    height = +svg.node().getBoundingClientRect().height;
	
  console.log(svg);
	// Per-type markers, as they don't inherit styles.
	/*
svg.append("defs").selectAll("marker")
    .data([0])
    .join("marker")
      .attr("id", "asdf")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("fill", "#ffaa33")
      .attr("d", "M0,-5L10,0L0,5");*/

// svg objects
var link, node;
// the data - an object with nodes and links
var graph;

// load the data

//d3.json("https://gist.githubusercontent.com/abkunal/98d35b9b235312e90f3e43c9f7b6932b/raw/d5589ddd53731ae8eec7abd091320df91cdcf5cd/miserables.json")
d3.json("https://api.blagodarie.org/api/getstats/user_connections_graph")
	.then(function(data) {
	
	graph = data;
	console.log(data);
	console.log(graph);
	
    simulation = d3.forceSimulation(graph.users)
      .force("link", d3.forceLink(graph.connections).id(d => d.uuid))
      .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter())
        .force("collide", d3.forceCollide())
      .force("x", d3.forceX())
      .force("y", d3.forceY());
    

	initializeDisplay();
	initializeSimulation();
});


//////////// FORCE SIMULATION //////////// 

// force simulator
var simulation;

// set up the simulation and event to update locations after each tick
function initializeSimulation() {
  simulation.nodes(graph.users);
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
    simulation.force("center")
        .x(width / 2)
        .y(height / 2);
    /*simulation.force("charge")
        .strength(forceProperties.charge.strength * forceProperties.charge.enabled)
        .distanceMin(forceProperties.charge.distanceMin)
        .distanceMax(forceProperties.charge.distanceMax);*/
    
	simulation.force("collide")
        .strength(0.2)
        .radius(30)
        .iterations(1);
    simulation.force("x")
        .strength(0.02)
        .x(0.5);
    simulation.force("y")
        .strength(0.02)
        .y(0.5);/*
    simulation.force("forceY")
        .strength(forceProperties.forceY.strength * forceProperties.forceY.enabled)
        .y(height * forceProperties.forceY.y);
		*/
    simulation.force("link")
        .id(function(d) {return d.uuid;})
        .distance(150)
        .links(graph.connections);

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
    d.fx = null;
    d.fy = null;
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
  /*link = svg.append("g")
        .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line");*/
	
	link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(graph.connections)
    .join("path")
      .attr("stroke", d => (d.is_trust ? "#00ff00" : "#ff0000"))
      .attr("marker-end", d => (d.is_trust ? "url(#arrow-trust)" : "url(#arrow-mistrust)"));


  // set the data and properties of node circles
  /*node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(graph.nodes)
    .join("g");*/
		
			
	node = svg.append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
    .selectAll("g")
    .data(graph.users)
    .join("g")
      .call(drag(simulation));
/*
  node.append("circle")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("r", 4);*/
	  
	  node
	  .append("a")
      .attr("href", d => ("https://blagodarie.org/profile?id=" + d.uuid))
	  .append("image")
      .attr("xlink:href", d => d.photo)
      .attr("clip-path", "url(#myCircle)")
      .attr("x", -16)
      .attr("y", -16)
      .attr("width", 32)
     .attr("height", 32);

  node.append("text")
      .attr("x", 18)
      .attr("y", "0.31em")
      .text(d => (d.first_name + " " + d.last_name))
    .clone(true).lower()
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 3);
		

  // node tooltip
  /*node.append("title")
      .text(function(d) { return d.id; });*/
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

    link.attr("d", linkArc);
    node.attr("transform", d => `translate(${d.x},${d.y})`);
	/*
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    d3.select('#alpha_value').style('flex-basis', (simulation.alpha()*100) + '%');*/
}



//////////// UI EVENTS ////////////
/*
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0.0001);
  d.fx = null;
  d.fy = null;
}*/

// update size-related forces
d3.select(window).on("resize", function(){
    width = +svg.node().getBoundingClientRect().width;
    height = +svg.node().getBoundingClientRect().height;
    updateForces();
});

importScripts('https://d3js.org/d3.v7.min.js');

const Message = (type, data) => ({ type: type, ...data });

const Start = data => Message('start', data);
const Tick = data => Message('tick', data);
const End = data => Message('end', data);

function round(num, decimalPlaces=0) {
    num = Math.round(`${num}e${decimalPlaces}`);

    return Number(`${num}e${-decimalPlaces}`);
}

onmessage = function({ data }) {
    const { nodes, links, nTicks } = data;

    postMessage(Start());

    const simulation = d3.forceSimulation(nodes);
    simulation.force('link', d3.forceLink(links).id(({id}) => id));
    simulation.nodes(nodes);

    simulation.stop();

    let progress = 0;

    for (let tick = 0; tick < nTicks; ++tick) {
        simulation.tick();

        progress = Math.floor(round(tick / nTicks, 2) * 100);

        postMessage(Tick({ progress: progress }));
    }

    postMessage(End({ nodes: nodes, links: links }));
};

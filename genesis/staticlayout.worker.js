const Message = (type, data) => ({ type: type, ...data });

var simulation;

function onmessage({ data }) {
    const { nodes, links } = data;

    simulation.stop();

    const alphaMinLog = Math.log(simulation.alphaMin());
    const alphaDecayLog = Math.log(1 - simulation.alphaDecay());

    const nTicks = Math.ceil(alphaMinLog / alphaDecayLog);

    for (let tick = 0; tick < nTicks; ++tick) {
        postMessage(Message('tick'));
        simulation.tick();
    }

    postMessage(Message('end', { nodes: nodes, links: links }));
}

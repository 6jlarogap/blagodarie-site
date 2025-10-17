const PORTRAIT_CONFIG = Object.freeze({
    user: {  
        size: 128,
        offset: -64,
        clipRadius: 64,  // 50% от 128
        textOffset: 88   // половина размера + отступ (64 + 10)
    },
    profile: {  
        size: 96,
        offset: -48,
        clipRadius: 48,  // 50% от 64
        textOffset: 58   // половина размера + отступ (32 + 10)
    }
});

const TEXT_CONFIG = Object.freeze({
    fontSize: 35,
    fontWeight: 400,     // normal weight (400 = normal, 700 = bold)
    lineHeight: 1.2      // в em единицах
});

const NODE_TYPES = Object.freeze({
    "USER": "user",
    "PROFILE": "profile"
});

const CLIP_PATH_IDS = Object.freeze({
    USER: 'clip-user',
    PROFILE: 'clip-profile'
});

const ZOOM_MIN = 0.01;
const ZOOM_MAX = 1.5;

const EXPORT_FORMATS = Object.freeze({
    SVG: 'svg'
});

const SIMULATION_CONFIG = Object.freeze({
    // Начальные параметры
    INITIAL: {
        CHARGE_STRENGTH: -7000,
        COLLIDE_RADIUS: 200,
        LINK_STRENGTH: 0.1,
        X_STRENGTH: 0.006,
        Y_STRENGTH: 0.012,
        VELOCITY_DECAY: 0.01,
        ALPHA_DECAY: 0.01
    },
    // Шаги изменения
    STEPS: {
        CHARGE_STRENGTH: 500,
        COLLIDE_RADIUS: 10,
        LINK_STRENGTH: 0.05,
        X_STRENGTH: 0.003,
        Y_STRENGTH: 0.003,
        VELOCITY_DECAY: 0.01,
        ALPHA_DECAY: 0.001
    },
    // Минимальные и максимальные значения
    LIMITS: {
        CHARGE_STRENGTH: { MIN: -10000, MAX: -1000 },
        COLLIDE_RADIUS: { MIN: 50, MAX: 300 },
        LINK_STRENGTH: { MIN: 0.01, MAX: 0.5 },
        X_STRENGTH: { MIN: 0.001, MAX: 0.1 },
        Y_STRENGTH: { MIN: 0.001, MAX: 0.1 },
        VELOCITY_DECAY: { MIN: 0.01, MAX: 1 },
        ALPHA_DECAY: { MIN: 0.001, MAX: 0.1 }
    }
});

var svg = d3.select('#main').attr('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
svg.attr('preserveAspectRatio', 'xMidYMid meet').attr('pointer-events', 'all');
svg.attr('baseProfile', 'full');

var width = +svg.node().getBoundingClientRect().width;
var height = +svg.node().getBoundingClientRect().height;

let link, node;

var nodes = [];
var links = [];

var simulation;

var settings = { api: get_api_url(), url: new URL(window.location.href) };

// Текущие значения параметров
let currentParams = {
    chargeStrength: SIMULATION_CONFIG.INITIAL.CHARGE_STRENGTH,
    collideRadius: SIMULATION_CONFIG.INITIAL.COLLIDE_RADIUS,
    linkStrength: SIMULATION_CONFIG.INITIAL.LINK_STRENGTH,
    xStrength: SIMULATION_CONFIG.INITIAL.X_STRENGTH,
    yStrength: SIMULATION_CONFIG.INITIAL.Y_STRENGTH,
    velocityDecay: SIMULATION_CONFIG.INITIAL.VELOCITY_DECAY,
    alphaDecay: SIMULATION_CONFIG.INITIAL.ALPHA_DECAY
};

window.onerror = (msg, file, line, col, error) => {
    console.error('Error:', msg, 'at', file + ':' + line + ':' + col, error);
};

// Функция для обновления отображаемых значений
function updateDisplayValues() {
    document.getElementById('charge-strength-value').textContent = currentParams.chargeStrength;
    document.getElementById('collide-radius-value').textContent = currentParams.collideRadius;
    document.getElementById('link-strength-value').textContent = currentParams.linkStrength.toFixed(3);
    document.getElementById('x-strength-value').textContent = currentParams.xStrength.toFixed(3);
    document.getElementById('y-strength-value').textContent = currentParams.yStrength.toFixed(3);
    document.getElementById('velocity-decay-value').textContent = currentParams.velocityDecay.toFixed(3);
    document.getElementById('alpha-decay-value').textContent = currentParams.alphaDecay.toFixed(3);
}

// Функции изменения параметров
function changeChargeStrength(delta) {
    const newValue = currentParams.chargeStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.CHARGE_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.CHARGE_STRENGTH.MAX) {
        currentParams.chargeStrength = newValue;
        if (simulation) {
            simulation.force('charge', d3.forceManyBody().strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeCollideRadius(delta) {
    const newValue = currentParams.collideRadius + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.COLLIDE_RADIUS.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.COLLIDE_RADIUS.MAX) {
        currentParams.collideRadius = newValue;
        if (simulation) {
            simulation.force("collide", d3.forceCollide().radius(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeLinkStrength(delta) {
    const newValue = currentParams.linkStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.LINK_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.LINK_STRENGTH.MAX) {
        currentParams.linkStrength = newValue;
        if (simulation) {
            simulation.force('link', d3.forceLink(links).id(({ id }) => id).strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeXStrength(delta) {
    const newValue = currentParams.xStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.X_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.X_STRENGTH.MAX) {
        currentParams.xStrength = newValue;
        if (simulation) {
            simulation.force('x', d3.forceX(width / 2).strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeYStrength(delta) {
    const newValue = currentParams.yStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.Y_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.Y_STRENGTH.MAX) {
        currentParams.yStrength = newValue;
        if (simulation) {
            simulation.force('y', d3.forceY(height / 2).strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeVelocityDecay(delta) {
    const newValue = currentParams.velocityDecay + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.VELOCITY_DECAY.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.VELOCITY_DECAY.MAX) {
        currentParams.velocityDecay = newValue;
        if (simulation) {
            simulation.velocityDecay(newValue);
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeAlphaDecay(delta) {
    const newValue = currentParams.alphaDecay + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.ALPHA_DECAY.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.ALPHA_DECAY.MAX) {
        currentParams.alphaDecay = newValue;
        if (simulation) {
            simulation.alphaDecay(newValue);
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

// load the data
var url = new URL(window.location.href);

var userIdFrom = url.searchParams.get("id");
var depth = url.searchParams.get("depth") || 10;
var up = url.searchParams.get("up") || '';
var down = url.searchParams.get("down") || '';

if (depth <= 0 || depth > 100) {
    depth = 100;
}

var apiUrl = `${settings.api}/api/profile_genesis/?id=` + userIdFrom + '&depth=' + depth + '&up=' + up + '&down=' + down;

var d3_json_params = {};

function nodeType(d) {
    return d.username == userIdFrom ? NODE_TYPES.USER : NODE_TYPES.PROFILE;
}

function no_photo({ gender, is_dead }) {
    const leftPattern = 'no-photo-gender';

    let sex = 'none';

    switch (gender) {
        case 'm':
            sex = 'male';
            break;
        case 'f':
            sex = 'female';
            break;
    }

    let result = `${leftPattern}-${sex}${is_dead ? '-dead' : ''}.jpg`;
    result = `${settings.api}/media/images/${result}`;

    return result;
}

const image = d => d.photo || no_photo(d);

function cacheBase64Url(afunc) {
    const cache = new Map();

    async function awrapper(url, callback) {
        if (cache.has(url)) {
            const cached = cache.get(url);

            return callback ? callback(cached) : cached;
        }

        const base64Url = await afunc(url, callback);

        cache.set(url, base64Url);

        return base64Url;
    }

    return awrapper;
}

const noPhotoBase64Url = cacheBase64Url(urlAsBase64);

d3.json(apiUrl, d3_json_params)
    .then(async data => {
        //добавить пользователей в вершины
        const updateUrl = node => dataUrl => (node.base64Url = dataUrl);
        data.users.forEach(d => {
            const node = {
                id: d.uuid,
                shortid: d.username,
                nodeType: nodeType(d),
                image: image(d),
                base64Url: '',
                text: `${d.first_name} ${d.last_name || ''}`.trim(),
                firstName: d.first_name,
                lastName: d.last_name || '',
                is_dead: d.is_dead
            };

            const base64UrlSetter = d.photo ? urlAsBase64 : noPhotoBase64Url;
            base64UrlSetter(node.image, updateUrl(node));
            nodes.push(node);
        });

        data.connections.forEach(d => {
            links.push({
                source: d.source,
                target: d.target
            });
        });

        simulation = d3.forceSimulation(nodes);
        simulation.force('link', d3.forceLink(links).id(({ id }) => id).strength(currentParams.linkStrength));
        simulation.force('charge', d3.forceManyBody().strength(currentParams.chargeStrength));
        simulation.force("collide", d3.forceCollide().radius(currentParams.collideRadius));
        simulation.force('x', d3.forceX(width / 2).strength(currentParams.xStrength));
        simulation.force('y', d3.forceY(height / 2).strength(currentParams.yStrength));
        simulation.alpha(1).alphaTarget(1).alphaMin(0.001).alphaDecay(currentParams.alphaDecay).velocityDecay(currentParams.velocityDecay).restart();

        simulation.on('end', updateGraphInfo);
        simulation.on('tick', ticked);

        initializeDisplay();
        updateGraphInfo();
        updateDisplayValues(); // Обновляем отображение значений после загрузки данных
    });

var zoom = d3.zoom().scaleExtent([ZOOM_MIN, ZOOM_MAX]);
zoom.on('zoom', ({ transform: { x, y, k } }) => svg.attr('transform', `translate(${x}, ${y}) scale(${k})`));

function drag(simulation) {
    function dragstarted(e, d) {
    }

    const dragged = ({ x, y }, d) => { d.fx = x; d.fy = y; };

    const dragended = (e, d) => {
        d.fx = null;
        d.fy = null;
    };

    let behavior = d3.drag();
    behavior.on('start', dragstarted);
    behavior.on('drag', dragged);
    behavior.on('end', dragended);

    return behavior;
}

const selectSvg = (id) => d3.select(`#${id}`);

const asBase64 = (string, { unescape = true } = {}) => {
    let encoded = encodeURIComponent(string);

    unescape && (encoded = window.unescape(encoded));

    return btoa(encoded);
};

async function blobAsBase64(blob, callback) {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const base64 = btoa(String.fromCharCode(...uint8Array));
    const base64DataUrl = `data:${blob.type};base64,${base64}`;

    return callback ? callback(base64DataUrl) : base64DataUrl;
}

async function urlAsBase64(url, callback) {
    const response = await fetch(url);
    const blob = await response.blob();

    return await blobAsBase64(blob, callback);
}

function encodeSvg(svgXML, toHex) {
    const hexer = char => `%${char.charCodeAt(0).toString(16)}`;

    Array.isArray(toHex) && (toHex = toHex.join(''));

    svgXML = svgXML.replaceAll(new RegExp(`[${toHex}]`, 'g'), hexer);
    svgXML = svgXML.replaceAll(/\s+/g, ' ');

    return svgXML;
}

function serializeSvg(repr, { encode = true, toBase64 = false } = {}) {
    const VERSION = 1.1;
    const XMLNS = 'http://www.w3.org/2000/xmlns/';
    const SVGNS = 'http://www.w3.org/2000/svg';
    const XLINKNS = 'http://www.w3.org/1999/xlink';
    const EVNS = 'http://www.w3.org/2001/xml-events';

    const FRAGMENT = `${window.location.href}#`;

    const TO_HEX = [/* '<', '>', '"', */ '%', '{', '}'];

    const replaceFragments = true;

    function replacingFragments(walker, fragment) {
        while (walker.nextNode())
            for (const attr of walker.currentNode.attributes) {
                if (!attr.value.includes(fragment)) continue;

                attr.value = attr.value.replace(fragment, '#');
            }
    }

    const isSvgId = typeof repr === 'string';
    const isXmlDoc = repr instanceof XMLDocument;

    const node = isSvgId ? selectSvg(repr).node() : isXmlDoc ? repr.rootElement : repr.node();

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

    replaceFragments && replacingFragments(walker, FRAGMENT);

    node.setAttribute('version', VERSION);
    node.setAttributeNS(XMLNS, 'xmlns', SVGNS);
    node.setAttributeNS(XMLNS, 'xmlns:xlink', XLINKNS);
    node.setAttributeNS(XMLNS, 'xmlns:ev', EVNS);

    let serialized = new XMLSerializer().serializeToString(node);

    serialized = serialized.replace(' display="none" ', ' ').replaceAll(' href', ' xlink:href');

    encode && (serialized = encodeSvg(serialized, toBase64 ? TO_HEX : [...TO_HEX, '#']));

    toBase64 && (serialized = asBase64(serialized));

    return serialized;
}

SVGRect.prototype.toString = function () {
    return `${this.x} ${this.y} ${this.width} ${this.height}`;
};

function prepareSvg(id) {
    d3.select('body').node().click();

    const full = svg.node().getBBox();

    const prepared = selectSvg(id).clone([true])
        .attr('id', 'export-svg').attr('display', 'none');

    prepared.attr('viewBox', String(full));
    prepared.select('g').attr('transform', '');

    prepared.attr('width', full.width);
    prepared.attr('height', full.height);

    // Добавляем clipPath'ы в экспортируемый SVG
    const defs = prepared.select('defs');
    
    // ClipPath для user узлов
    defs.append('clipPath')
        .attr('id', CLIP_PATH_IDS.USER)
        .append('circle')
        .attr('r', PORTRAIT_CONFIG.user.clipRadius);

    // ClipPath для profile узлов
    defs.append('clipPath')
        .attr('id', CLIP_PATH_IDS.PROFILE)
        .append('circle')
        .attr('r', PORTRAIT_CONFIG.profile.clipRadius);

    const svg_elem = prepared.selectAll('.svg_elem').data(nodes);

    svg_elem.select('image').attr('href', ({ base64Url }) => base64Url);

    // Устанавливаем размеры из единой конфигурации
    svg_elem.select('image.userPortrait')
        .attr('width', PORTRAIT_CONFIG.user.size)
        .attr('height', PORTRAIT_CONFIG.user.size)
        .attr('x', PORTRAIT_CONFIG.user.offset)
        .attr('y', PORTRAIT_CONFIG.user.offset);

    svg_elem.select('image.profilePortrait')
        .attr('width', PORTRAIT_CONFIG.profile.size)
        .attr('height', PORTRAIT_CONFIG.profile.size)
        .attr('x', PORTRAIT_CONFIG.profile.offset)
        .attr('y', PORTRAIT_CONFIG.profile.offset);

    svg_elem.selectAll('text').attr('text-anchor', 'middle');

    return prepared;
}

const isFunc = param => typeof param === 'function';

function makeSvgBlob(callback, options = {}) {
    const XMLHEADER = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>';

    const {
        toBase64,
        monitor
    } = options;

    const prepared = prepareSvg('main');
    
    // Проверяем, что подготовленный SVG не пустой
    if (!prepared.node() || !prepared.node().childNodes.length) {
        console.error('Prepared SVG is empty');
        if (callback) callback(null);
        return null;
    }

    const serialized = serializeSvg(prepared, { encode: false });
    const content = `${XMLHEADER}${serialized}`;

    const svgBlob = new Blob([content], { type: 'image/svg+xml' });

    monitor && monitor(svgBlob);

    callback && callback(svgBlob);

    return svgBlob;
}

function suggestFilename(extension) {
    const project = 'blagoroda';
    
    // Получаем ID из URL
    const url = new URL(document.location);
    const userId = url.searchParams.get('id');
    
    // Пытаемся найти имя центрального узла
    let userName = '';
    const userNode = nodes.find(node => node.nodeType === NODE_TYPES.USER);
    
    if (userNode) {
        // Используем firstName и lastName для формирования имени
        userName = `${userNode.firstName || ''} ${userNode.lastName || ''}`.trim();
        
        // Если имя пустое, используем текст
        if (!userName) {
            userName = userNode.text.trim();
        }
        
        // Очищаем имя от недопустимых символов и заменяем пробелы на подчеркивания
        userName = userName.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, '').replace(/\s+/g, '_');
        
        // Если все еще нет имени, используем shortid
        if (!userName) {
            userName = `user_${userNode.shortid}`;
        }
        
        // Формируем имя файла с именем пользователя и ID
        return `${project}-${userName}-${userId}.${extension}`;
    } else {
        // Если центральный узел не найден, используем только ID
        return `${project}-${userId}.${extension}`;
    }
}

function download(object, format, callback, suggestedName = suggestFilename) {
    if (!object) {
        console.error('Cannot download: object is null or undefined');
        return;
    }

    const extension = format.toLowerCase();

    const link = document.createElement('a');
    link.href = object instanceof Blob ? URL.createObjectURL(object) : object;
    
    // Вызываем suggestFilename для получения имени файла
    const filename = isFunc(suggestedName) ? suggestedName(extension) : suggestedName;
    link.download = filename;
    
    link.target = '_blank';

    document.body.append(link);

    link.click();

    setTimeout(() => { 
        if (object instanceof Blob) {
            URL.revokeObjectURL(link.href); 
        }
        link.remove(); 
    }, 7000);

    return callback && callback(object);
}

function makeSvg(cb) {
    const blobIsNull = () => console.error('The SVG image is empty');

    const monitor = blob => {
        if (!blob) {
            blobIsNull();
            return false;
        }
        return true;
    };

    const options = {
        monitor: monitor
    };

    return makeSvgBlob(cb, options);
}

const EXPORTS = {
    [EXPORT_FORMATS.SVG]: makeSvg
};

function makeBlob(format, callback) {
    if (!EXPORTS.hasOwnProperty(format))
        throw new Error('Unknown format');

    return EXPORTS[format](callback);
}

function exporting(to) {
    const logger = (func) => (...args) => console.log(func(...args));

    let exportStarted = () => "SVG export started";
    let downloading = () => "SVG download"; 
    let exportComplete = () => "SVG export complete";

    exportStarted = logger(exportStarted);
    downloading = logger(downloading);
    exportComplete = logger(exportComplete);

    const afterDownload = () => {
        const exportSvg = selectSvg('export-svg');
        if (exportSvg.node()) {
            exportSvg.remove();
        }
        exportComplete();
        console.log('Проверьте папку загрузок');
    }

    exportStarted();

    // Убираем дублирование вызова download
    const blob = makeBlob(to);
    
    if (blob) {
        download(blob, to, afterDownload);
    } else {
        console.error('The Blob is empty');
        console.error('Ошибка загрузки');
    }
}

const export2svg = () => exporting(EXPORT_FORMATS.SVG);

const stopsim = () => {
    if (simulation) {
        simulation.stop();
        updateGraphInfo();
    }
}

const startsim = () => { 
    if (simulation) {
        simulation.alpha(1).alphaTarget(1).alphaMin(0.001).restart();
    }
}

function initializeDisplay() {
    svg = svg.call(zoom)
        .append('g');

    link = svg.append("g")
        .selectAll("g")
        .data(links)
        .join("g");

    link.append("svg:line")
        .attr("class", "link")
        .attr("stroke-width", "1.5px")
        .attr("stroke", "#3548db")
        .attr("marker-end", "url(#arrow-gen)");

    node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('onclick', d => `onNodeClick('${d.shortid}', '${d.nodeType}')`)
        .attr('class', 'svg_elem')
        .attr('style', 'cursor: pointer')
        .call(drag(simulation));

    node.append('image')
        .attr('href', ({ image }) => image)
        .attr('class', ({ nodeType }) => imageClass(nodeType))
        .attr('width', ({ nodeType }) => PORTRAIT_CONFIG[nodeType].size)
        .attr('height', ({ nodeType }) => PORTRAIT_CONFIG[nodeType].size)
        .attr('x', ({ nodeType }) => PORTRAIT_CONFIG[nodeType].offset)
        .attr('y', ({ nodeType }) => PORTRAIT_CONFIG[nodeType].offset)
        .attr('style', 'z-index: 1; position: relative;')
        // Все узлы обрезаются кругом 50%
        .attr('clip-path', ({ nodeType }) => {
            const clipId = nodeType === NODE_TYPES.USER ? CLIP_PATH_IDS.USER : CLIP_PATH_IDS.PROFILE;
            return `url(#${clipId})`;
        });

    // Логика добавления текста
    node.each(function (d) {
        const parts = d.text.trim().split(/\s+/);
        const last = parts.length > 1 ? parts.pop() : "";
        const first = parts.join(" ") || last;

        const textEl = d3.select(this)
            .append("text")
            .attr("y", PORTRAIT_CONFIG[d.nodeType].textOffset)  // Используем расчетное смещение из конфигурации
            .attr("font-size", TEXT_CONFIG.fontSize)
            .attr("font-weight", TEXT_CONFIG.fontWeight)
            .attr("class", d.nodeType === NODE_TYPES.USER ? "userName" : "profileName")
            .attr("text-anchor", "middle");

        textEl.append("tspan")
            .attr("x", 0)
            .attr("dy", "0em")
            .text(first);

        if (last) {
            textEl.append("tspan")
                .attr("x", 0)
                .attr("dy", TEXT_CONFIG.lineHeight + "em")  // Используем настройку межстрочного интервала
                .text(last);
        }
    });
}

const length = (lWidth, lHeight) => Math.sqrt(lWidth * lWidth + lHeight * lHeight);

function calculateLinkPosition(d, isSource = true) {
    const source = d.source;
    const target = d.target;
    const node = isSource ? source : target;
    
    const sourceX = source.x, targetX = target.x;
    const sourceY = source.y, targetY = target.y;
    
    const lWidth = targetX - sourceX;
    const lHeight = targetY - sourceY;
    const lLength = Math.sqrt(lWidth * lWidth + lHeight * lHeight);
    
    if (!lLength) return { x: 0, y: 0 };
    
    // Используем clipRadius из конфигурации
    const radius = PORTRAIT_CONFIG[node.nodeType].clipRadius;
    const ratio = radius / lLength;
    
    const x = isSource ? sourceX + lWidth * ratio : targetX - lWidth * ratio;
    const y = isSource ? sourceY + lHeight * ratio : targetY - lHeight * ratio;
    
    return { x, y };
}

function calcX1(d) { return calculateLinkPosition(d, true).x; }
function calcY1(d) { return calculateLinkPosition(d, true).y; }
function calcX2(d) { return calculateLinkPosition(d, false).x; }
function calcY2(d) { return calculateLinkPosition(d, false).y; }

function fullTransform() {
    node.attr('transform', ({ x, y }) => `translate(${x}, ${y})`);

    const line = link.selectAll('line');
    line.attr('x1', calcX1);
    line.attr('y1', calcY1);
    line.attr('x2', calcX2);
    line.attr('y2', calcY2);
}

const ticked = fullTransform;

function updateGraphInfo() {
    const nodeCount = nodes.length;
    const bbox = svg.node().getBBox();

    const widthPx = bbox.width;
    const heightPx = bbox.height;

    const mmPerInch = 25.4;
    const widthMm96 = (widthPx / 96) * mmPerInch;
    const heightMm96 = (heightPx / 96) * mmPerInch;
    const widthMm300 = (widthPx / 300) * mmPerInch;
    const heightMm300 = (heightPx / 300) * mmPerInch;

    document.getElementById('node-count').textContent = nodeCount;
    document.getElementById('graph-size-px').textContent =
        `${widthPx.toFixed(1)} x ${heightPx.toFixed(1)} px`;
    document.getElementById('graph-size-mm-96').textContent =
        `${widthMm96.toFixed(1)} x ${heightMm96.toFixed(1)} mm`;
    document.getElementById('graph-size-mm-300').textContent =
        `${widthMm300.toFixed(1)} x ${heightMm300.toFixed(1)} mm`;
}

function initDefs() {
    const defs = svg.append("defs");

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

    // ClipPath для user узлов
    defs.append('clipPath')
        .attr('id', CLIP_PATH_IDS.USER)
        .append('circle')
        .attr('r', PORTRAIT_CONFIG.user.clipRadius);

    // ClipPath для profile узлов
    defs.append('clipPath')
        .attr('id', CLIP_PATH_IDS.PROFILE)
        .append('circle')
        .attr('r', PORTRAIT_CONFIG.profile.clipRadius);
}

function imageClass(nodeType) {
    return nodeType === 'user' ? 'userPortrait' : 'profilePortrait';
}

function onNodeClick(shortid, nodeType) {
    const allowed = [NODE_TYPES.PROFILE];
    if (!allowed.includes(nodeType)) return;

    const protocol = settings.url.protocol;
    const host = settings.url.host;
    const pathname = settings.url.pathname;

    const newUrl = new URL(`${protocol}//${host}${pathname}`);

    newUrl.searchParams.append('id', shortid);
    newUrl.searchParams.append('depth', depth);
    newUrl.searchParams.append('up', up);
    newUrl.searchParams.append('down', down);

    window.location.href = newUrl.href;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initDefs();
});
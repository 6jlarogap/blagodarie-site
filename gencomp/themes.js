// Константы для тем
const THEMES = {
    DEFAULT: 'default',
    STAR: 'star'
};

// Конфигурация звезд
const STAR_CONFIG = {
    MALE: {
        points: 5,
        outerRadius: 64,
        innerRadius: 25,
        fill: '#3548db',
        stroke: '#2a3aaf'
    },
    FEMALE: {
        points: 6,
        outerRadius: 64,
        innerRadius: 30,
        fill: '#e75480',
        stroke: '#c4456d'
    },
    NONE: {
        points: 4,
        outerRadius: 64,
        innerRadius: 20,
        fill: '#aaaaaa',
        stroke: '#888888'
    }
};

// Текущая тема
let currentTheme = THEMES.DEFAULT;

// Ссылка на группу фона
let backgroundGroup;

// Функция для создания точек звезды
function createStarPoints(points, innerRadius, outerRadius) {
    const coordinates = [];
    const angle = Math.PI / points;
    
    for (let i = 0; i < 2 * points; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle * i) * radius;
        const y = Math.sin(angle * i) * radius;
        coordinates.push([x, y]);
    }
    
    return coordinates.map(coord => coord.join(',')).join(' ');
}

// Функция для получения конфигурации звезды по полу
function getStarConfig(gender) {
    switch (gender) {
        case 'm': return STAR_CONFIG.MALE;
        case 'f': return STAR_CONFIG.FEMALE;
        default: return STAR_CONFIG.NONE;
    }
}

// Функция инициализации группы фона
function initializeBackgroundGroup() {
    const svgElement = d3.select('svg#main');
    
    // Создаем отдельную группу для фона ВНЕ основной группы с графом
    // Вставляем ее перед основной группой
    backgroundGroup = svgElement.insert('g', ':first-child')
        .attr('class', 'theme-background')
        .attr('id', 'background-group');
    
    // Изначально применяем тему по умолчанию
    applyDefaultThemeToBackground();
}

// Функция применения темы
function applyTheme(theme) {
    currentTheme = theme;
    
    const svgElement = d3.select('svg#main');
    
    // Убеждаемся, что группа фона существует
    if (!backgroundGroup) {
        initializeBackgroundGroup();
    }
    
    if (theme === THEMES.STAR) {
        applyStarTheme(svgElement);
    } else {
        applyDefaultTheme(svgElement);
    }
    
    // Обновляем отображение узлов
    updateNodesForTheme();
}

// Функция применения звездной темы
function applyStarTheme(svgElement) {
    // Очищаем группу фона
    backgroundGroup.selectAll('*').remove();
    
    // Сплошной темный фон
    backgroundGroup.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', '#0a0a2a');
    
    // Добавляем звезды на фон
    const starPattern = backgroundGroup.append('pattern')
        .attr('id', 'star-pattern')
        .attr('width', 100)
        .attr('height', 100)
        .attr('patternUnits', 'userSpaceOnUse');
    
    // Создаем несколько случайных звезд для паттерна
    for (let i = 0; i < 20; i++) {
        starPattern.append('circle')
            .attr('cx', Math.random() * 100)
            .attr('cy', Math.random() * 100)
            .attr('r', Math.random() * 1.5 + 0.5)
            .attr('fill', '#ffffff')
            .attr('opacity', Math.random() * 0.8 + 0.2);
    }
    
    backgroundGroup.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#star-pattern)')
        .attr('opacity', 0.3);
    
    // Удаляем звездные overlay и placeholder'ы из предыдущей темы
    svgElement.selectAll('.star-overlay').remove();
    svgElement.selectAll('.star-placeholder').remove();
    
    // Обновляем стили линий для лучшей видимости
    svgElement.selectAll('.link')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '2px')
        .attr('opacity', 0.7);
    
    // Обновляем стили текста для лучшей видимости
    svgElement.selectAll('text')
        .attr('fill', '#ffffff')
        .attr('stroke', '#0a0a2a')
        .attr('stroke-width', '2px')
        .attr('paint-order', 'stroke');
}

// Функция применения темы по умолчанию
function applyDefaultTheme(svgElement) {
    // Очищаем группу фона
    backgroundGroup.selectAll('*').remove();
    
    // Добавляем прозрачный фон для темы по умолчанию
    backgroundGroup.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', '#ffffff')
        .attr('opacity', 0);
    
    // Удаляем звездные элементы
    svgElement.selectAll('.star-overlay').remove();
    svgElement.selectAll('.star-placeholder').remove();
    
    // Восстанавливаем стандартные стили
    svgElement.selectAll('.link')
        .attr('stroke', '#3548db')
        .attr('stroke-width', '1.5px')
        .attr('opacity', 1);
    
    svgElement.selectAll('text')
        .attr('fill', '#000000')
        .attr('stroke', 'none')
        .attr('stroke-width', '0px');
}

// Функция применения темы по умолчанию к фону (вспомогательная)
function applyDefaultThemeToBackground() {
    // Очищаем группу фона
    backgroundGroup.selectAll('*').remove();
    
    // Добавляем прозрачный фон для темы по умолчанию
    backgroundGroup.append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', '#ffffff')
        .attr('opacity', 0);
}

// Функция обновления узлов для текущей темы
function updateNodesForTheme() {
    const nodes = d3.selectAll('.svg_elem');
    
    if (currentTheme === THEMES.STAR) {
        // Для звездной темы добавляем звездные overlay и placeholder'ы
        nodes.each(function(d) {
            const node = d3.select(this);
            const nodeType = d.nodeType;
            const hasPhoto = d.image && !d.image.includes('no-photo-gender');
            
            // Удаляем предыдущие звездные элементы
            node.selectAll('.star-overlay').remove();
            node.selectAll('.star-placeholder').remove();
            
            if (hasPhoto) {
                // Для узлов с фото добавляем звездную подложку
                const config = getStarConfig(d.gender);
                const starPoints = createStarPoints(config.points, config.innerRadius, config.outerRadius);
                
                node.insert('polygon', 'image')
                    .attr('class', 'star-overlay')
                    .attr('points', starPoints)
                    .attr('fill', config.fill)
                    .attr('stroke', config.stroke)
                    .attr('stroke-width', '3px')
                    .attr('opacity', 0.8);
            } else {
                // Для узлов без фото заменяем на звезды
                const config = getStarConfig(d.gender);
                const starPoints = createStarPoints(config.points, config.innerRadius, config.outerRadius);
                
                // Скрываем оригинальное изображение
                node.select('image').style('display', 'none');
                
                // Добавляем звезду
                node.append('polygon')
                    .attr('class', 'star-placeholder')
                    .attr('points', starPoints)
                    .attr('fill', config.fill)
                    .attr('stroke', config.stroke)
                    .attr('stroke-width', '3px');
            }
        });
    } else {
        // Для темы по умолчанию восстанавливаем стандартное отображение
        nodes.each(function(d) {
            const node = d3.select(this);
            
            // Показываем оригинальное изображение
            node.select('image').style('display', null);
            
            // Удаляем звездные элементы
            node.selectAll('.star-overlay').remove();
            node.selectAll('.star-placeholder').remove();
        });
    }
}

// Функция создания селектора тем (перемещена в группу тем)
function createThemeSelector() {
    const themeControls = document.getElementById('theme-controls');
    
    const themeControl = document.createElement('div');
    themeControl.className = 'control-group';
    themeControl.innerHTML = `
        <label>Тема визуализации:</label>
        <select id="theme-select">
            <option value="${THEMES.DEFAULT}">Текущая</option>
            <option value="${THEMES.STAR}">Звёздная</option>
        </select>
    `;
    
    themeControls.appendChild(themeControl);
    
    // Обработчик изменения темы
    document.getElementById('theme-select').addEventListener('change', function(e) {
        applyTheme(e.target.value);
    });
}

// Инициализация темы при загрузке
document.addEventListener('DOMContentLoaded', function() {
    createThemeSelector();
    initializeBackgroundGroup(); // Инициализируем группу фона
    applyTheme(THEMES.DEFAULT);
});

// Экспортируем функции для использования в других модулях
window.ThemeManager = {
    applyTheme,
    getCurrentTheme: () => currentTheme,
    THEMES
};
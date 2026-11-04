const container = document.getElementById('canvas-container');
const wrapper = document.getElementById('canvas-wrapper');
const canvas = document.getElementById('planCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 2000;
canvas.height = 2000;

let scale = 1, panX = 0, panY = 0;
let drawnElements = [];
let drawingElement = null;
let history = [];
let activeGuides = [];
let currentSystemLayer = 'OS';
let pixelsPerMeter = 50;
let currentProjectId = null;
let pendingElement = null;
let wasPanning = false;
let appMode = 'draw';
let currentTool = 'wall';
let elementAngle = 0;

const systemNamesRu = { 'OS': 'ОС', 'PS': 'ПС', 'SVN': 'СВН' };

const elementNames = {
    'wall': 'Стена капитальная', 'door': 'Дверь', 'window': 'Окно', 'opening_empty': 'Проем',
    'cable_kspv8': 'Кабель КСПВ 8х0.5', 'cable_kspv4': 'Кабель КСПВ 4х0.5', 'cable_shvvp': 'Кабель ШВВП 2x0.75',
    'cable_frls2x05': 'Кабель огнестойкий FRLS 2x0.5', 'cable_frls2x075': 'Кабель огнестойкий FRLS 2x0.75', 'cable_frls4x075': 'Кабель огнестойкий FRLS 4x0.75',
    'cable_frhf2x05': 'Кабель безгалогенный FRHF 2x0.5', 'cable_frhf2x075': 'Кабель безгалогенный FRHF 2x0.75', 'cable_frhf4x075': 'Кабель безгалогенный FRHF 4x0.75',
    'cable_vvg3x25': 'Кабель силовой ВВГнг 3х2.5', 'cable_utp5e': 'Кабель UTP cat.5e',
    'os_astra512': 'Извещатель охранный Астра 512', 'os_astra621': 'Извещатель охранный Астра 621', 'os_astra8': 'Извещатель охранный Астра 8',
    'os_smk': 'Извещатель магнитоконтактный (СМК)', 'os_shtora': 'Извещатель охранный "Штора"', 'os_shoroh': 'Извещатель вибрационный "Шорох"', 'os_astras': 'Извещатель звуковой "Астра С"',
    'os_kts_astra321': 'Кнопка тревожная Астра 321', 'os_kts_astrar': 'Кнопка радиоканальная Астра Р', 'os_kts_nvpb16': 'Кнопка тревожная NV PB 16', 'os_kts_gsn': 'Кнопка тревожная GSN',
    'os_nord_m': 'ППК Nord М', 'os_nord_p': 'ППК Nord П', 'os_nord_pro': 'ППК Nord Pro',
    'os_tm': 'Считыватель Touch Memory', 'os_mayak': 'Оповещатель светозвуковой "Маяк"',
    'power_panel': 'Щит распределительный 220В', 'power_socket': 'Розетка 220В',
    'camera': 'Видеокамера', 'text': 'Пояснительная надпись',
    
    'ps_ip212': 'ИП-212-142', 'ps_ipr513': 'ИПР-513-11', 
    'ps_molniya12': 'Молния-12', 'ps_m24_3': 'М-24-3', 'ps_mayak24': 'Маяк-24',
    'ps_granit_3': 'Гранит-3', 'ps_granit_5': 'Гранит-5', 'ps_granit_8': 'Гранит-8', 'ps_granit_16': 'Гранит-16', 'ps_granit_24': 'Гранит-24',
    'ps_signal_20m': 'Сигнал-20М', 'ps_signal_20p': 'Сигнал-20П', 'ps_signal_10': 'Сигнал-10',
    'ps_rokot_2': 'Рокот-2', 'ps_rokot_3': 'Рокот-3', 'ps_rokot_4': 'Рокот-4'
};

const lineStyles = {
    'wall': {c: '#222222', w: 8, d: []}, 'cable_kspv8': {c: '#1976D2', w: 6, d: []},
    'cable_kspv4': {c: '#03A9F4', w: 4, d: []}, 'cable_shvvp': {c: '#FF5722', w: 4, d: [12, 10]},
    'cable_frls2x05': {c: '#E53935', w: 4, d: []}, 'cable_frls2x075': {c: '#E53935', w: 6, d: []},
    'cable_frls4x075': {c: '#E53935', w: 8, d: []}, 'cable_frhf2x05': {c: '#FBC02D', w: 4, d: [12, 8]},
    'cable_frhf2x075': {c: '#FBC02D', w: 6, d: [12, 8]}, 'cable_frhf4x075': {c: '#FBC02D', w: 8, d: [12, 8]},
    'cable_vvg3x25': {c: '#424242', w: 8, d: []}, 'cable_utp5e': {c: '#43A047', w: 5, d: []}
};

const rotatableTools = ['os_astra512', 'os_astra621', 'os_astra8', 'os_shtora', 'os_shoroh', 'os_astras', 'os_kts_astra321', 'os_kts_astrar', 'os_kts_nvpb16', 'os_kts_gsn', 'ps_ip212', 'ps_ipr513', 'ps_molniya12', 'ps_m24_3', 'ps_mayak24'];

function getElementSystem(category) {
    if (category === 'wall' || category === 'opening' || category === 'ruler') return 'BASE';
    return currentSystemLayer; 
}

function isVisible(el) {
    let sys = el.system;
    if (!sys) { sys = (el.category === 'wall' || el.category === 'opening' || el.category === 'ruler') ? 'BASE' : 'OS'; el.system = sys; }
    return sys === 'BASE' || sys === currentSystemLayer;
}

function updateTransform() { 
    wrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; 
}

function getCategory(tool) {
    if (!tool) return '';
    if (tool === 'wall') return 'wall';
    if (tool.startsWith('ruler')) return 'ruler';
    if (['door', 'window', 'opening_empty'].includes(tool)) return 'opening';
    if (tool.startsWith('cable_')) return 'cable';
    if (tool.startsWith('os_')) return 'os';
    if (tool.startsWith('ps_')) return 'ps'; 
    if (tool.startsWith('power_')) return 'power';
    if (tool === 'camera') return 'camera';
    if (tool === 'text') return 'text';
    return '';
}

function getExpectedSystem(tool) {
    if (!tool) return null;
    if (tool.startsWith('ps_') || ['cable_frls2x05', 'cable_frls2x075', 'cable_frls4x075', 'cable_frhf2x05', 'cable_frhf2x075', 'cable_frhf4x075', 'cable_vvg3x25'].includes(tool)) return 'PS';
    if (['camera', 'cable_utp5e'].includes(tool)) return 'SVN';
    if (tool.startsWith('os_') || ['cable_kspv8', 'cable_kspv4', 'cable_shvvp'].includes(tool)) return 'OS';
    return null; 
}

// ИСПРАВЛЕНИЕ: Логика сохранения (защита от дублей и лимит ровно на 5 шагов отмены)
function saveState() { 
    const dataStr = JSON.stringify(drawnElements);
    if (history.length > 0 && history[history.length - 1] === dataStr) return; // Не сохраняем, если ничего не изменилось
    
    history.push(dataStr); 
    if (history.length > 6) history.shift(); // 6 записей = 5 шагов отмены назад
    
    if(currentProjectId) {
        localStorage.setItem('ops_data_' + currentProjectId, dataStr);
        let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
        let proj = projects.find(p => p.id === currentProjectId);
        if(proj) {
            proj.updated = Date.now();
            localStorage.setItem('ops_projects', JSON.stringify(projects));
        }
    }
}

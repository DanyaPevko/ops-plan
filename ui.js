window.onload = () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
            setTimeout(() => { 
                splash.style.display = 'none'; 
                loadDashboard(); 
            }, 500);
        } else {
            loadDashboard();
        }
    }, 1500); 
};

const dashTourSteps = [
    { el: '#createNewProjectBtn', title: 'Создание проекта', text: 'Нажмите на кнопку «+», чтобы создать новый план объекта ОПС или СКУД.' },
    { el: '#dashTabsRow', title: 'Папки проектов', text: 'Распределяйте объекты по статусам: «В работе», «Сдано» или убирайте в «Архив».' },
    { el: '#dashSearchRow', title: 'Поиск и сортировка', text: 'Быстро находите нужный объект по названию или сортируйте список по дате и алфавиту.' },
    { el: '#dashControlRow', title: 'Управление и Бэкап', text: 'Здесь находятся настройки масштаба ⚙️, сохранение резервной копии базы в файл 💾, загрузка 📂 и справочник ❓. Удерживайте палец на любой иконке для подсказки!' }
];

const workTourSteps = [
    { el: '#top-toolbar', title: 'Инструменты черчения', text: 'Выбирайте стены, проемы, кабели и датчики. При выборе оборудования нужный слой (ОС, ПС, СВН) включится автоматически.' },
    { el: '#filterToggleBtn', title: 'Слои систем', text: 'Кнопка фильтра открывает переключение видимости слоев: Охранная 🛡️, Пожарная 🔥 и Видеонаблюдение 📷.' },
    { el: '#floating-modes', title: 'Рисование и Ластик', text: 'Переключайтесь между режимом установки элементов ✏️ и ластиком 🧽. Ластик стирает только элементы активной категории!' },
    { el: '#bottom-toolbar-main', title: 'Навигация и Отмена', text: 'Возврат в главное меню, стрелка дополнительных функций 🔼 и отмена последних 5 действий ↩.' },
    { el: '#bottom-toolbar-extra', title: 'Смета и Выгрузка', text: 'В дополнительном меню можно открыть автоматическую смету 📊, выгрузить готовые чертежи в PNG или открыть справку ❓.', prepare: () => {
        const extra = document.getElementById('bottom-toolbar-extra');
        if (!extra.classList.contains('expanded')) document.getElementById('bottom-toggle-btn').click();
    }}
];

let activeTourSteps = [];
let currentTourIndex = 0;
let currentTourType = '';

function startTour(type) {
    currentTourType = type;
    activeTourSteps = type === 'dash' ? dashTourSteps : workTourSteps;
    currentTourIndex = 0;
    document.getElementById('tourOverlay').style.display = 'block';
    showTourStep();
}
function showTourStep() {
    const step = activeTourSteps[currentTourIndex];
    if (step.prepare) step.prepare();

    setTimeout(() => {
        const target = document.querySelector(step.el);
        const highlight = document.getElementById('tourHighlight');
        const card = document.getElementById('tourCard');

        document.getElementById('tourStepCounter').innerText = `Шаг ${currentTourIndex + 1} из ${activeTourSteps.length}`;
        document.getElementById('tourTitle').innerText = step.title;
        document.getElementById('tourText').innerText = step.text;
        document.getElementById('tourNextBtn').innerText = (currentTourIndex === activeTourSteps.length - 1) ? 'Готово ✔' : 'Далее ➔';

        if (target) {
            const rect = target.getBoundingClientRect();
            highlight.style.top = (rect.top - 6) + 'px';
            highlight.style.left = (rect.left - 6) + 'px';
            highlight.style.width = (rect.width + 12) + 'px';
            highlight.style.height = (rect.height + 12) + 'px';
            if (rect.top > window.innerHeight / 2) {
                card.style.top = 'auto';
                card.style.bottom = (window.innerHeight - rect.top + 20) + 'px';
            } else {
                card.style.bottom = 'auto';
                card.style.top = Math.min(window.innerHeight - 220, rect.bottom + 20) + 'px';
            }
        }
    }, 150);
}

function endTour() {
    document.getElementById('tourOverlay').style.display = 'none';
    if (currentTourType === 'dash') localStorage.setItem('ops_tour_dash_done', 'true');
    if (currentTourType === 'work') localStorage.setItem('ops_tour_work_done', 'true');
}

document.getElementById('tourNextBtn').addEventListener('click', () => {
    currentTourIndex++;
    if (currentTourIndex >= activeTourSteps.length) endTour();
    else showTourStep();
});
document.getElementById('tourSkipBtn').addEventListener('click', endTour);

const helpModal = document.getElementById('helpModal');
document.getElementById('helpDashBtn').addEventListener('click', () => { helpModal.classList.add('show'); });
document.getElementById('helpWorkBtn').addEventListener('click', () => { helpModal.classList.add('show'); });
document.getElementById('closeHelpModalBtn').addEventListener('click', () => { helpModal.classList.remove('show'); });
document.getElementById('startTourFromHelpBtn').addEventListener('click', () => {
    helpModal.classList.remove('show');
    const isWorkspaceVisible = document.getElementById('workspace').style.display !== 'none';
    startTour(isWorkspaceVisible ? 'work' : 'dash');
});
let tooltipTimer;
const tooltipEl = document.getElementById('mobileTooltip');

document.addEventListener('touchstart', (e) => {
    let target = e.target.closest('.has-tooltip');
    if(!target) return;
    tooltipTimer = setTimeout(() => {
        tooltipEl.innerText = target.dataset.tooltip;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left = e.touches[0].clientX + 'px';
        tooltipEl.style.top = (e.touches[0].clientY - 40) + 'px';
    }, 500); 
});
document.addEventListener('touchend', hideTooltip);
document.addEventListener('touchmove', hideTooltip);

function hideTooltip() { clearTimeout(tooltipTimer); tooltipEl.style.display = 'none'; }

let currentDashboardTab = 'active'; 
const dashTabs = document.querySelectorAll('.dash-tab');

dashTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dashTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentDashboardTab = tab.dataset.tab;
        loadDashboard();
    });
});

let appSettings = JSON.parse(localStorage.getItem('ops_settings') || '{"defaultScale": 50}');
document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsScaleInput').value = appSettings.defaultScale;
    document.getElementById('settingsModal').classList.add('show');
});
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    let newScale = parseFloat(document.getElementById('settingsScaleInput').value);
    if (!isNaN(newScale) && newScale > 10) {
        appSettings.defaultScale = newScale;
        localStorage.setItem('ops_settings', JSON.stringify(appSettings));
    }
    document.getElementById('settingsModal').classList.remove('show');
});
document.getElementById('closeSettingsBtn').addEventListener('click', () => { document.getElementById('settingsModal').classList.remove('show'); });

const searchInput = document.getElementById('searchProjectInput');
const sortSelect = document.getElementById('sortProjectSelect');

searchInput.addEventListener('input', loadDashboard);
sortSelect.addEventListener('change', loadDashboard);

function loadDashboard() {
    document.getElementById('workspace').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    const projectListDiv = document.getElementById('projectList');
    projectListDiv.innerHTML = '';
    
    let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
    projects = projects.filter(p => { let pStatus = p.status || 'active'; return pStatus === currentDashboardTab; });
    
    let query = searchInput.value.trim().toLowerCase();
    if (query) { projects = projects.filter(p => p.name.toLowerCase().includes(query)); }
    
    if(projects.length === 0) { 
        projectListDiv.innerHTML = '<p style="text-align:center; color:#888; margin-top:30px;">В этой папке пока пусто</p>'; 
    } else {
        let sortType = sortSelect.value;
        if (sortType === 'new') projects.sort((a,b) => b.updated - a.updated);
        else if (sortType === 'old') projects.sort((a,b) => a.updated - b.updated);
        else if (sortType === 'az') projects.sort((a,b) => a.name.localeCompare(b.name));
        else if (sortType === 'za') projects.sort((a,b) => b.name.localeCompare(a.name));

        projects.forEach(p => {
            const dateObj = new Date(p.updated);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const card = document.createElement('div'); card.className = 'project-card';
            card.innerHTML = `
                <div class="project-info" onclick="openProject('${p.id}')" style="flex: 1; cursor: pointer;">
                    <div class="project-title">${p.name}</div>
                    <div class="project-date">Изменен: ${dateStr}</div>
                </div>
                <div class="project-actions">
                    <button class="p-btn has-tooltip" data-tooltip="Переместить в папку" onclick="openStatusModal('${p.id}', event)">📁</button>
                    <button class="p-btn has-tooltip" data-tooltip="Переименовать" onclick="renameProject('${p.id}', event)">✏️</button>
                    <button class="p-btn has-tooltip" data-tooltip="Дублировать" onclick="duplicateProject('${p.id}', event)">📋</button>
                    <button class="p-btn has-tooltip" data-tooltip="Удалить" style="color: #ff5252 !important;" onclick="deleteProject('${p.id}', event)">🗑️</button>
                </div>
            `;
            projectListDiv.appendChild(card);
        });
    }

    if (!localStorage.getItem('ops_tour_dash_done')) {
        setTimeout(() => startTour('dash'), 400);
    }
}

let projectToChangeStatus = null;
function openStatusModal(id, event) {
    event.stopPropagation();
    projectToChangeStatus = id;
    document.getElementById('statusModal').classList.add('show');
}
function confirmStatusChange(newStatus) {
    if(projectToChangeStatus) {
        let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
        let proj = projects.find(p => p.id === projectToChangeStatus);
        if (proj) { proj.status = newStatus; proj.updated = Date.now(); localStorage.setItem('ops_projects', JSON.stringify(projects)); }
    }
    document.getElementById('statusModal').classList.remove('show');
    loadDashboard();
}
document.getElementById('closeStatusModalBtn').addEventListener('click', () => { document.getElementById('statusModal').classList.remove('show'); });

function createProject(name) {
    const newId = 'proj_' + Date.now(); let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
    projects.push({ id: newId, name: name, updated: Date.now(), status: 'active' });
    localStorage.setItem('ops_projects', JSON.stringify(projects));
    localStorage.setItem('ops_data_' + newId, JSON.stringify([])); 
    openProject(newId);
}

function renameProject(id, event) {
    event.stopPropagation(); let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
    let proj = projects.find(p => p.id === id);
    if(proj) {
        document.getElementById('textModalTitle').innerText = 'Переименовать проект';
        document.getElementById('textInputParams').value = proj.name;
        pendingElement = { action: 'rename_project', id: id };
        document.getElementById('textModal').classList.add('show');
    }
}

function duplicateProject(id, event) {
    event.stopPropagation();
    let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
    let originalProj = projects.find(p => p.id === id);
    if(!originalProj) return;
    
    const newId = 'proj_' + Date.now();
    let newName = originalProj.name + ' (Копия)';
    projects.push({ id: newId, name: newName, updated: Date.now(), status: originalProj.status || 'active' });
    
    let originalData = localStorage.getItem('ops_data_' + id) || '[]';
    localStorage.setItem('ops_projects', JSON.stringify(projects));
    localStorage.setItem('ops_data_' + newId, originalData);
    loadDashboard();
}

function openProject(id) {
    currentProjectId = id;
    let dataStr = localStorage.getItem('ops_data_' + id);
    drawnElements = dataStr ? JSON.parse(dataStr) : [];
    history = [JSON.stringify(drawnElements)];
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('workspace').style.display = 'flex';
    pixelsPerMeter = appSettings.defaultScale || 50; 
    scale = (container.clientWidth / canvas.width) * 0.95; 
    panX = (container.clientWidth - canvas.width * scale) / 2;
    panY = (container.clientHeight - canvas.height * scale) / 2;
    updateTransform(); renderAll();

    if (!localStorage.getItem('ops_tour_work_done')) {
        setTimeout(() => startTour('work'), 500);
    }
}

function deleteProject(id, event) {
    event.stopPropagation();
    if(confirm("Точно удалить проект? Восстановить будет невозможно.")) {
        let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem('ops_projects', JSON.stringify(projects));
        localStorage.removeItem('ops_data_' + id);
        loadDashboard();
    }
}
document.getElementById('exportDbBtn').addEventListener('click', () => {
    let allData = { ops_projects: localStorage.getItem('ops_projects') || '[]' };
    let projects = JSON.parse(allData.ops_projects);
    projects.forEach(p => { allData['ops_data_' + p.id] = localStorage.getItem('ops_data_' + p.id) || '[]'; });
    
    let blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ops_backup_" + new Date().toISOString().slice(0,10) + ".json";
    link.click();
});

document.getElementById('importDbBtn').addEventListener('click', () => { document.getElementById('importDbInput').click(); });
document.getElementById('importDbInput').addEventListener('change', (e) => {
    let file = e.target.files[0]; if (!file) return;
    let reader = new FileReader();
    reader.onload = function(evt) {
        try {
            let data = JSON.parse(evt.target.result);
            if (data.ops_projects) {
                if(confirm("Внимание! Это объединит загруженные проекты с текущими. Продолжить?")) {
                    let currentProjects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
                    let importedProjects = JSON.parse(data.ops_projects);
                    importedProjects.forEach(ip => {
                        const existing = currentProjects.find(cp => cp.id === ip.id);
                        if (!existing) {
                            currentProjects.push(ip);
                            if (data['ops_data_' + ip.id]) localStorage.setItem('ops_data_' + ip.id, data['ops_data_' + ip.id]);
                        } else if (confirm('Проект "' + ip.name + '" уже есть. Заменить его данными из бэкапа?')) {
                            existing.name = ip.name;
                            existing.updated = ip.updated;
                            existing.status = ip.status;
                            if (data['ops_data_' + ip.id]) localStorage.setItem('ops_data_' + ip.id, data['ops_data_' + ip.id]);
                        }
                    });
                    localStorage.setItem('ops_projects', JSON.stringify(currentProjects));
                    loadDashboard(); alert("База успешно восстановлена!");
                }
            } else { alert("Неверный формат файла."); }
        } catch (err) { alert("Ошибка чтения файла."); }
    };
    reader.readAsText(file); e.target.value = ""; 
});

document.getElementById('createNewProjectBtn').addEventListener('click', () => {
    document.getElementById('textModalTitle').innerText = 'Название проекта';
    document.getElementById('textInputParams').value = '';
    document.getElementById('textInputParams').placeholder = 'Например: ТЦ Галерея...';
    pendingElement = { action: 'new_project' };
    document.getElementById('textModal').classList.add('show');
});

document.getElementById('homeBtn').addEventListener('click', () => { currentProjectId = null; loadDashboard(); });

document.getElementById('undoBtn').addEventListener('click', () => { 
    if (history.length > 1) { 
        history.pop(); drawnElements = JSON.parse(history[history.length - 1]); renderAll(); 
        if(currentProjectId) {
            localStorage.setItem('ops_data_' + currentProjectId, history[history.length - 1]);
            let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]');
            let proj = projects.find(p => p.id === currentProjectId);
            if(proj) { proj.updated = Date.now(); localStorage.setItem('ops_projects', JSON.stringify(projects)); }
        }
    } 
});

document.getElementById('clearBtn').addEventListener('click', () => { if(confirm("Очистить чертеж?")) { drawnElements = []; renderAll(); saveState(); } });

const bottomToggleBtn = document.getElementById('bottom-toggle-btn');
const bottomExtra = document.getElementById('bottom-toolbar-extra');
const floatingModes = document.getElementById('floating-modes');
floatingModes.style.position = 'fixed'; floatingModes.style.left = '10px'; floatingModes.style.zIndex = '100';
floatingModes.style.transition = 'bottom 0.3s ease'; floatingModes.style.bottom = '80px'; 

bottomToggleBtn.addEventListener('click', () => {
    bottomExtra.classList.toggle('expanded');
    if (bottomExtra.classList.contains('expanded')) { bottomToggleBtn.innerText = '🔽'; floatingModes.style.bottom = '140px'; } 
    else { bottomToggleBtn.innerText = '🔼'; floatingModes.style.bottom = '80px'; }
});
function autoSwitchLayer(tool) { let expectedSys = getExpectedSystem(tool); if (expectedSys && expectedSys !== currentSystemLayer) { currentSystemLayer = expectedSys; updateLayerUI(); } }
function updateRotationUI() { const rotPanel = document.getElementById('rotation-controls'); if (rotatableTools.includes(currentTool)) { rotPanel.style.display = 'flex'; updatePreview(); } else { rotPanel.style.display = 'none'; } }

const filterToggleBtn = document.getElementById('filterToggleBtn'); const filterOptions = document.getElementById('filterOptions');
const layerOsBtn = document.getElementById('layerOsBtn'); const layerPsBtn = document.getElementById('layerPsBtn'); const layerSvnBtn = document.getElementById('layerSvnBtn');

filterToggleBtn.addEventListener('click', () => { 
    filterOptions.classList.toggle('show-filters'); 
    filterToggleBtn.classList.toggle('active');
});

function updateLayerUI() { [layerOsBtn, layerPsBtn, layerSvnBtn].forEach(btn => { btn.classList.remove('active'); }); let activeBtn = currentSystemLayer === 'OS' ? layerOsBtn : currentSystemLayer === 'PS' ? layerPsBtn : layerSvnBtn; activeBtn.classList.add('active'); renderAll(); }

layerOsBtn.addEventListener('click', () => { currentSystemLayer = 'OS'; updateLayerUI(); });
layerPsBtn.addEventListener('click', () => { currentSystemLayer = 'PS'; updateLayerUI(); });
layerSvnBtn.addEventListener('click', () => { currentSystemLayer = 'SVN'; updateLayerUI(); });

const modeDrawBtn = document.getElementById('modeDrawBtn'); const modeEraseBtn = document.getElementById('modeEraseBtn');
modeDrawBtn.addEventListener('click', () => { appMode = 'draw'; modeDrawBtn.classList.add('active'); modeEraseBtn.classList.remove('active'); });
modeEraseBtn.addEventListener('click', () => { appMode = 'erase'; modeEraseBtn.classList.add('active'); modeDrawBtn.classList.remove('active'); });

document.getElementById('rotLeftBtn').addEventListener('click', () => { elementAngle -= 45; if(elementAngle <= -360) elementAngle += 360; updatePreview(); if (typeof updateCoachHint === 'function') updateCoachHint(); });
document.getElementById('rotRightBtn').addEventListener('click', () => { elementAngle += 45; if(elementAngle >= 360) elementAngle -= 360; updatePreview(); if (typeof updateCoachHint === 'function') updateCoachHint(); });

const rulerModes = document.getElementById('ruler-modes'); const rulerWallBtn = document.getElementById('rulerWallBtn'); const rulerSegmentBtn = document.getElementById('rulerSegmentBtn');
rulerWallBtn.addEventListener('click', () => { rulerWallBtn.classList.add('active'); rulerSegmentBtn.classList.remove('active'); currentTool = 'ruler_wall'; });
rulerSegmentBtn.addEventListener('click', () => { rulerSegmentBtn.classList.add('active'); rulerWallBtn.classList.remove('active'); currentTool = 'ruler_segment'; });
const mainBtns = document.querySelectorAll('.main-tool'); const subBtns = document.querySelectorAll('.sub-btn[data-tool]'); const allSubmenus = document.querySelectorAll('.submenu');

mainBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        mainBtns.forEach(b => b.classList.remove('active')); allSubmenus.forEach(menu => menu.classList.remove('show')); e.currentTarget.classList.add('active'); 
        if (e.currentTarget.dataset.group) {
            const groupName = e.currentTarget.dataset.group; 
            if (groupName === 'ruler') { rulerModes.classList.add('show'); currentTool = rulerWallBtn.classList.contains('active') ? 'ruler_wall' : 'ruler_segment';
            } else { rulerModes.classList.remove('show'); document.getElementById('sub-' + groupName).classList.add('show'); if (groupName === 'os' || groupName === 'ps' || groupName === 'cable' || groupName === 'power') { currentTool = ''; } else { currentTool = document.querySelector('#sub-' + groupName + ' .sub-btn.active').dataset.tool; autoSwitchLayer(currentTool); } }
        } else { rulerModes.classList.remove('show'); currentTool = e.currentTarget.dataset.tool; autoSwitchLayer(currentTool); }
        updateRotationUI();
        if (typeof updateCoachHint === 'function') updateCoachHint();
    });
});

subBtns.forEach(btn => { btn.addEventListener('click', (e) => { if(!e.target.dataset.tool) return; e.target.parentElement.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); currentTool = e.target.dataset.tool; autoSwitchLayer(currentTool); updateRotationUI(); if (typeof updateCoachHint === 'function') updateCoachHint(); }); });
['os', 'ps', 'svn'].forEach(sys => { document.getElementById(`cable-menu-${sys}`).addEventListener('click', () => { document.getElementById('sub-cable').classList.remove('show'); document.getElementById(`sub-cable-${sys}`).classList.add('show'); currentTool = document.querySelector(`#sub-cable-${sys} .sub-btn.active`).dataset.tool; autoSwitchLayer(currentTool); updateRotationUI(); if (typeof updateCoachHint === 'function') updateCoachHint(); }); document.getElementById(`cable-back-${sys}`).addEventListener('click', () => { document.getElementById(`sub-cable-${sys}`).classList.remove('show'); document.getElementById('sub-cable').classList.add('show'); currentTool = ''; if (typeof updateCoachHint === 'function') updateCoachHint(); }); });
['sensors', 'kts', 'devices'].forEach(sub => { document.getElementById(`os-menu-${sub}`).addEventListener('click', () => { document.getElementById('sub-os').classList.remove('show'); document.getElementById(`sub-os-${sub}`).classList.add('show'); currentTool = document.querySelector(`#sub-os-${sub} .sub-btn.active`) ? document.querySelector(`#sub-os-${sub} .sub-btn.active`).dataset.tool : 'os_nord_m'; autoSwitchLayer(currentTool); updateRotationUI(); if (typeof updateCoachHint === 'function') updateCoachHint(); }); document.getElementById(`os-back-${sub}`).addEventListener('click', () => { document.getElementById(`sub-os-${sub}`).classList.remove('show'); document.getElementById('sub-os').classList.add('show'); document.getElementById('rotation-controls').style.display = 'none'; currentTool = ''; if (typeof updateCoachHint === 'function') updateCoachHint(); }); });
['sensors', 'alerts', 'devices'].forEach(sub => { document.getElementById(`ps-menu-${sub}`).addEventListener('click', () => { document.getElementById('sub-ps').classList.remove('show'); document.getElementById(`sub-ps-${sub}`).classList.add('show'); currentTool = document.querySelector(`#sub-ps-${sub} .sub-btn.active`) ? document.querySelector(`#sub-ps-${sub} .sub-btn.active`).dataset.tool : ''; autoSwitchLayer(currentTool); updateRotationUI(); if (typeof updateCoachHint === 'function') updateCoachHint(); }); document.getElementById(`ps-back-${sub}`).addEventListener('click', () => { document.getElementById(`sub-ps-${sub}`).classList.remove('show'); document.getElementById('sub-ps').classList.add('show'); document.getElementById('rotation-controls').style.display = 'none'; currentTool = ''; if (typeof updateCoachHint === 'function') updateCoachHint(); }); });
['granit', 'signal', 'rokot'].forEach(sub => { document.getElementById(`ps-menu-dev-${sub}`).addEventListener('click', () => { document.getElementById('sub-ps-devices').classList.remove('show'); document.getElementById(`sub-ps-dev-${sub}`).classList.add('show'); currentTool = document.querySelector(`#sub-ps-dev-${sub} .sub-btn.active`).dataset.tool; autoSwitchLayer(currentTool); updateRotationUI(); if (typeof updateCoachHint === 'function') updateCoachHint(); }); document.getElementById(`ps-back-dev-${sub}`).addEventListener('click', () => { document.getElementById(`sub-ps-dev-${sub}`).classList.remove('show'); document.getElementById('sub-ps-devices').classList.add('show'); document.getElementById('rotation-controls').style.display = 'none'; currentTool = ''; if (typeof updateCoachHint === 'function') updateCoachHint(); }); });

const saveModal = document.getElementById('saveModal'); const calcChannelInput = document.getElementById('calcChannel');
document.getElementById('saveBtn').addEventListener('click', () => { saveModal.classList.add('show'); }); 
document.getElementById('closeSaveModalBtn').addEventListener('click', () => { saveModal.classList.remove('show'); });

const sysToggleBtns = document.querySelectorAll('.toggle-sys');
sysToggleBtns.forEach(btn => { btn.addEventListener('click', () => { btn.classList.toggle('active-sys'); }); });

document.getElementById('confirmSaveBtn').addEventListener('click', () => {
    let selectedSystems = []; sysToggleBtns.forEach(btn => { if(btn.classList.contains('active-sys')) selectedSystems.push(btn.dataset.sys); });
    if(selectedSystems.length === 0) { alert("Пожалуйста, отметьте хотя бы одну систему для выгрузки."); return; }
    selectedSystems.forEach((sys, index) => { setTimeout(() => { generateAndDownload(sys, `obekt_${sys}.png`); }, index * 400); }); saveModal.classList.remove('show');
});
function generateAndDownload(systemToSave, filename) {
    const originalLayer = currentSystemLayer; currentSystemLayer = systemToSave;
    const visibleElements = drawnElements.filter(el => isVisible(el) && el.type !== 'text'); 
    const uniqueTypes = [...new Set(visibleElements.map(el => el.type))];
    let cables = {}; let devices = {}; let totalDevices = 0;
    visibleElements.forEach(el => {
        if (el.isLine && el.type.startsWith('cable_')) { let lenPx = Math.hypot(el.x2 - el.x1, el.y2 - el.y1); cables[el.type] = (cables[el.type] || 0) + lenPx; 
        } else if (!el.isLine && el.type !== 'wall' && el.category !== 'opening' && el.category !== 'ruler') { let count = el.isDouble ? 2 : 1; devices[el.type] = (devices[el.type] || 0) + count; totalDevices += count; }
    });

    const columns = 3; const itemHeight = 60; const itemsPerCol = Math.ceil(uniqueTypes.length / columns); const legendHeight = uniqueTypes.length > 0 ? 100 + (itemsPerCol * itemHeight) : 0;
    const calcChannel = parseFloat(calcChannelInput.value) || 0; let estimateLines = Object.keys(cables).length + Object.keys(devices).length + (totalDevices > 0 ? 3 : 0) + (calcChannel > 0 ? 2 : 0) + 4; const estimateHeight = 100 + (estimateLines * 40);

    const headerHeight = 80; const tempCanvas = document.createElement('canvas'); tempCanvas.width = canvas.width; tempCanvas.height = headerHeight + canvas.height + legendHeight + estimateHeight; const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#ffffff'; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); 
    
    let projectName = "Без названия"; if (currentProjectId) { let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]'); let proj = projects.find(p => p.id === currentProjectId); if (proj) projectName = proj.name; }
    tempCtx.fillStyle = '#000000'; tempCtx.font = 'bold 48px sans-serif'; tempCtx.textAlign = 'center'; tempCtx.textBaseline = 'middle'; tempCtx.fillText(projectName, tempCanvas.width / 2, 40);
    tempCtx.translate(0, headerHeight); drawnElements.forEach(el => { if (isVisible(el)) renderElement(el, tempCtx); });
    
    let currentY = canvas.height + 40; const sysNameRu = systemNamesRu[systemToSave] || systemToSave;
    if (uniqueTypes.length > 0) {
        tempCtx.fillStyle = '#000000'; tempCtx.font = 'bold 36px sans-serif'; tempCtx.textAlign = 'left'; tempCtx.textBaseline = 'middle'; tempCtx.fillText(`Условные обозначения (${sysNameRu}):`, 50, currentY); let colWidth = canvas.width / columns;
        uniqueTypes.forEach((type, index) => {
            const col = Math.floor(index / itemsPerCol); const row = index % itemsPerCol; const itemX = 50 + col * colWidth; const itemY = currentY + 60 + row * itemHeight;
            if (isLineTool(type)) { renderElement({isLine: true, type: type, x1: itemX, y1: itemY, x2: itemX + 80, y2: itemY}, tempCtx); } else { drawShape(tempCtx, itemX + 40, itemY, type, 0); }
            tempCtx.fillStyle = '#000000'; tempCtx.font = '28px sans-serif'; tempCtx.textAlign = 'left'; tempCtx.textBaseline = 'middle'; tempCtx.fillText(elementNames[type] || type, itemX + 100, itemY);
        }); currentY += legendHeight;
    }

    tempCtx.fillStyle = '#000000'; tempCtx.font = 'bold 36px sans-serif'; tempCtx.textAlign = 'left'; tempCtx.textBaseline = 'middle'; tempCtx.fillText(`Смета (${sysNameRu}):`, 50, currentY); currentY += 50; tempCtx.font = '28px sans-serif';
    
    if (Object.keys(cables).length === 0 && totalDevices === 0) { tempCtx.fillText('Нет оборудования и кабелей на этом слое.', 50, currentY); 
    } else {
        if (totalDevices > 0) { tempCtx.font = 'bold 28px sans-serif'; tempCtx.fillText('Оборудование:', 50, currentY); currentY += 40; tempCtx.font = '28px sans-serif'; for (let type in devices) { tempCtx.fillText(`• ${elementNames[type] || type}: ${devices[type]} шт`, 50, currentY); currentY += 40; } currentY += 20; }
        tempCtx.font = 'bold 28px sans-serif'; tempCtx.fillText('Кабельные трассы:', 50, currentY); currentY += 40; tempCtx.font = '28px sans-serif';
        if (Object.keys(cables).length > 0) { for (let type in cables) { let totalWithMargin = Math.ceil((cables[type] / pixelsPerMeter) * 1.1); tempCtx.fillText(`• ${elementNames[type] || type} (с учетом 10% запаса): ${totalWithMargin} м`, 50, currentY); currentY += 40; } } else { tempCtx.fillText('• Нет нарисованных трасс.', 50, currentY); currentY += 40; }
        if (totalDevices > 0) { tempCtx.fillText(`• Кабель на вертикальные опуски (${totalDevices} точек по 2м): ${totalDevices * 2} м`, 50, currentY); currentY += 40; }
        if (calcChannel > 0) { currentY += 20; tempCtx.font = 'bold 28px sans-serif'; tempCtx.fillText('Дополнительно:', 50, currentY); currentY += 40; tempCtx.font = '28px sans-serif'; tempCtx.fillText(`• Кабель-канал / Гофра (введено вручную): ${calcChannel} м`, 50, currentY); currentY += 40; }
    }
    const link = document.createElement('a'); link.download = filename; link.href = tempCanvas.toDataURL('image/png'); link.click(); currentSystemLayer = originalLayer; 
}

const estimateModal = document.getElementById('estimateModal');
function generateEstimateHTML() {
    let cables = {}; let devices = {}; let totalDevices = 0;
    drawnElements.forEach(el => {
        if (el.isLine && el.type.startsWith('cable_')) { let lenPx = Math.hypot(el.x2 - el.x1, el.y2 - el.y1); cables[el.type] = (cables[el.type] || 0) + lenPx; 
        } else if (!el.isLine && el.type !== 'text' && el.type !== 'wall' && el.category !== 'opening' && el.category !== 'ruler') { let count = el.isDouble ? 2 : 1; devices[el.type] = (devices[el.type] || 0) + count; totalDevices += count; }
    });
    
    let summaryHTML = '';
    if (totalDevices > 0) { summaryHTML += '<b>Оборудование:</b><br>'; for (let type in devices) { let name = elementNames[type] || type; summaryHTML += `• ${name}: <b>${devices[type]} шт</b><br>`; } summaryHTML += '<br>'; }
    summaryHTML += '<b>Кабельные трассы:</b><br>';
    if (Object.keys(cables).length === 0) { summaryHTML += '<i>Нет нарисованных трасс.</i><br>'; } else { for (let type in cables) { let meters = cables[type] / pixelsPerMeter; let totalWithMargin = Math.ceil(meters * 1.1); let name = elementNames[type] || type; summaryHTML += `• ${name}: <b>${totalWithMargin} м</b> <i style="color:#aaa; font-size:12px;">(с учетом 10% запаса)</i><br>`; } }
    if (totalDevices > 0) { summaryHTML += `<br><b>Вертикальные опуски к оборудованию:</b><br>• Рекомендуемый кабель на опуски (${totalDevices} точек по 2м): <b>${totalDevices * 2} м</b><br>`; } 
    let manualChannel = parseFloat(calcChannelInput.value) || 0; if (manualChannel > 0) { summaryHTML += `<br><b>Кабель-канал (гофра / короб):</b><br>• Введено с дальномера: <b>${manualChannel} м</b><br>`; }
    document.getElementById('estimateContent').innerHTML = summaryHTML || '<i>План пуст.</i>';
}
document.getElementById('estimateBtn').addEventListener('click', () => { generateEstimateHTML(); estimateModal.classList.add('show'); }); calcChannelInput.addEventListener('input', generateEstimateHTML); document.getElementById('closeEstimateBtn').addEventListener('click', () => { estimateModal.classList.remove('show'); });

const smkModal = document.getElementById('smkModal');
document.getElementById('smkSingleBtn').addEventListener('click', () => { if (pendingElement) { pendingElement.isDouble = false; drawnElements.push(pendingElement); renderAll(); saveState(); } pendingElement = null; smkModal.classList.remove('show'); }); 
document.getElementById('smkDoubleBtn').addEventListener('click', () => { if (pendingElement) { pendingElement.isDouble = true; drawnElements.push(pendingElement); renderAll(); saveState(); } pendingElement = null; smkModal.classList.remove('show'); }); 
document.getElementById('closeSmkModalBtn').addEventListener('click', () => { pendingElement = null; smkModal.classList.remove('show'); });

const textModal = document.getElementById('textModal');
document.getElementById('textSaveBtn').addEventListener('click', () => {
    const txt = document.getElementById('textInputParams').value.trim();
    if (pendingElement && txt) { 
        if (pendingElement.action === 'new_project') { createProject(txt); } 
        else if (pendingElement.action === 'rename_project') { let projects = JSON.parse(localStorage.getItem('ops_projects') || '[]'); let proj = projects.find(p => p.id === pendingElement.id); if (proj) { proj.name = txt; proj.updated = Date.now(); localStorage.setItem('ops_projects', JSON.stringify(projects)); loadDashboard(); } }
        else if (pendingElement.category === 'ruler') { let meters = parseFloat(txt.replace(',', '.')); if (!isNaN(meters) && meters > 0) { pixelsPerMeter = pendingElement.lenPx / meters; document.getElementById('scaleDisplay').innerText = Math.round(pixelsPerMeter); if (pendingElement.x !== undefined) { pendingElement.text = meters + 'м'; } else { drawnElements.push({isLine: false, type: 'text', category: 'ruler', system: 'BASE', text: meters + 'м', x: pendingElement.midX, y: pendingElement.midY, wX1: pendingElement.wX1, wY1: pendingElement.wY1, wX2: pendingElement.wX2, wY2: pendingElement.wY2, highlight: true, lenPx: pendingElement.lenPx }); } } else { alert("Введите корректное число в метрах!"); return; } } else { pendingElement.text = txt; drawnElements.push(pendingElement); }
        if (pendingElement.action !== 'new_project' && pendingElement.action !== 'rename_project') { renderAll(); saveState(); }
    } pendingElement = null; textModal.classList.remove('show');
}); 
document.getElementById('closeTextModalBtn').addEventListener('click', () => { pendingElement = null; textModal.classList.remove('show'); });
// --- РЕЖИМ НОВИЧКА (ПОШАГОВЫЕ ПОДСКАЗКИ) ---
function getCoachStep() {
    if (!currentProjectId) return null;
    if (localStorage.getItem('ops_coach_skip_' + currentProjectId)) return null;
    if (localStorage.getItem('ops_coach_done_' + currentProjectId)) return null;
    
    let hasWall = false, hasOpening = false, hasDevice = false, hasCable = false;
    let rotateConfirmed = localStorage.getItem('ops_coach_rotate_' + currentProjectId);
    
    drawnElements.forEach(el => {
        if (el.type === 'wall') hasWall = true;
        if (el.category === 'opening') hasOpening = true;
        if (el.isLine && el.type.startsWith('cable_')) hasCable = true;
        if (!el.isLine && el.category && el.category !== 'wall' && el.category !== 'opening' && el.category !== 'ruler' && el.category !== 'text') hasDevice = true;
    });
    
    if (!hasWall) return { text: '🧱 Шаг 1: Нарисуйте стену', tool: 'wall' };
    if (!hasOpening) return { text: '🚪 Шаг 2: Нажмите «Проем» и выберите «Дверь»', tool: 'opening' };
    
    if (!hasDevice) {
        if (currentTool === 'os_astra512') return { text: '🛡️ Шаг 3: Нажмите на стену, чтобы поставить датчик', tool: 'os_astra512' };
        return { text: '🛡️ Шаг 3: Нажмите «ОС», затем «Датчики» и выберите «Астра 512»', tool: 'os_astra512' };
    }
    
    if (!rotateConfirmed) {
        if (currentTool === 'os_astra512') return { text: '🔄 Шаг 4: Покрутите датчик (Влево/Вправо) и нажмите «Понятно»', tool: 'rotate' };
        return { text: '🔄 Шаг 4: Выберите датчик, чтобы настроить направление', tool: 'os_astra512' };
    }
    
    if (!hasCable) return { text: '⚡ Шаг 5: Нажмите «Кабель», выберите тип и проведите линию', tool: 'cable_kspv8' };
    
    // ФИНАЛ: Показываем кнопку "Всё понятно"
    return { text: '🎉 Обучение завершено! Нажмите, чтобы открыть справочник.', tool: 'finish' };
}

function updateCoachHint() {
    const hintEl = document.getElementById('coachHint');
    const textEl = document.getElementById('coachHintText');
    if (!hintEl || !textEl) return;
    
    const step = getCoachStep();
    
    // Сбрасываем всё в исходное (разблокировано, ярко)
    document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; });
    
    if (!step) { 
        hintEl.style.display = 'none'; 
        return; 
    }
    
    hintEl.style.display = 'flex';
    textEl.innerText = step.text;
    
    // Настраиваем текст кнопки в зависимости от шага
    if (step.tool === 'rotate') {
        document.getElementById('coachHintSkip').innerText = 'Понятно';
    } else if (step.tool === 'finish') {
        document.getElementById('coachHintSkip').innerText = 'Всё понятно';
    } else {
        document.getElementById('coachHintSkip').innerText = 'Пропустить';
    }
    
    // Все тускло и без кликов
    document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '0.2'; btn.style.pointerEvents = 'none'; });
    
    function activate(el) { if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; } }
    
    if (step.tool === 'wall') {
        activate(document.querySelector('.main-tool[data-tool="wall"]'));
    } 
    else if (step.tool === 'opening') {
        activate(document.querySelector('.main-tool[data-group="opening"]'));
        if (document.getElementById('sub-opening').classList.contains('show')) {
            activate(document.querySelector('#sub-opening .sub-btn[data-tool="door"]'));
        }
    }
// --- РЕЖИМ НОВИЧКА (ПОШАГОВЫЕ ПОДСКАЗКИ) ---
function getCoachStep() {
    if (!currentProjectId) return null;
    if (localStorage.getItem('ops_coach_skip_' + currentProjectId)) return null;
    if (localStorage.getItem('ops_coach_done_' + currentProjectId)) return null;
    
    let hasWall = false, hasOpening = false, hasDevice = false, hasCable = false;
    let rotateConfirmed = localStorage.getItem('ops_coach_rotate_' + currentProjectId);
    
    drawnElements.forEach(el => {
        if (el.type === 'wall') hasWall = true;
        if (el.category === 'opening') hasOpening = true;
        if (el.isLine && el.type.startsWith('cable_')) hasCable = true;
        if (!el.isLine && el.category && el.category !== 'wall' && el.category !== 'opening' && el.category !== 'ruler' && el.category !== 'text') hasDevice = true;
    });
    
    if (!hasWall) return { text: '🧱 Шаг 1: Нарисуйте стену', tool: 'wall' };
    if (!hasOpening) return { text: '🚪 Шаг 2: Нажмите «Проем» и выберите «Дверь»', tool: 'opening' };
    
    if (!hasDevice) {
        if (currentTool === 'os_astra512') return { text: '🛡️ Шаг 3: Нажмите на стену, чтобы поставить датчик', tool: 'os_astra512' };
        return { text: '🛡️ Шаг 3: Нажмите «ОС», затем «Датчики» и выберите «Астра 512»', tool: 'os_astra512' };
    }
    
    if (!rotateConfirmed) {
        if (currentTool === 'os_astra512') return { text: '🔄 Шаг 4: Покрутите датчик (Влево/Вправо) и нажмите «Понятно»', tool: 'rotate' };
        return { text: '🔄 Шаг 4: Выберите датчик, чтобы настроить направление', tool: 'os_astra512' };
    }
    
    if (!hasCable) return { text: '⚡ Шаг 5: Нажмите «Кабель», выберите тип и проведите линию', tool: 'cable_kspv8' };
    
    return { text: '🎉 Обучение завершено! Нажмите «Всё понятно», чтобы открыть справочник.', tool: 'finish' };
}

function updateCoachHint() {
    const hintEl = document.getElementById('coachHint');
    const textEl = document.getElementById('coachHintText');
    if (!hintEl || !textEl) return;
    
    const step = getCoachStep();
    
    document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; });
    
    if (!step) { hintEl.style.display = 'none'; return; }
    
    hintEl.style.display = 'flex';
    textEl.innerText = step.text;
    document.getElementById('coachHintSkip').innerText = (step.tool === 'rotate') ? 'Понятно' : (step.tool === 'finish') ? 'Всё понятно' : 'Пропустить';
    
    document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '0.2'; btn.style.pointerEvents = 'none'; });
    
    function activate(el) { if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; } }
    
    if (step.tool === 'wall') {
        activate(document.querySelector('.main-tool[data-tool="wall"]'));
    } else if (step.tool === 'opening') {
        activate(document.querySelector('.main-tool[data-group="opening"]'));
        if (document.getElementById('sub-opening').classList.contains('show')) activate(document.querySelector('#sub-opening .sub-btn[data-tool="door"]'));
    } else if (step.tool === 'os_astra512') {
        activate(document.querySelector('.main-tool[data-group="os"]'));
        if (document.getElementById('sub-os').classList.contains('show')) {
            activate(document.getElementById('os-menu-sensors'));
            if (document.getElementById('sub-os-sensors').classList.contains('show')) activate(document.querySelector('#sub-os-sensors .sub-btn[data-tool="os_astra512"]'));
        }
    } else if (step.tool === 'cable_kspv8') {
        activate(document.querySelector('.main-tool[data-group="cable"]'));
        if (document.getElementById('sub-cable').classList.contains('show')) {
            activate(document.getElementById('cable-menu-os'));
            if (document.getElementById('sub-cable-os').classList.contains('show')) activate(document.querySelector('#sub-cable-os .sub-btn[data-tool="cable_kspv8"]'));
        }
    } else if (step.tool === 'rotate') {
        document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; });
        const rotPanel = document.getElementById('rotation-controls');
        if (rotPanel) { rotPanel.style.display = 'flex'; rotPanel.style.boxShadow = '0 0 20px #ff6600'; if (typeof updatePreview === 'function') updatePreview(); }
    } else if (step.tool === 'finish') {
        document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; });
    }
}

document.getElementById('coachHintSkip').addEventListener('click', () => {
    if (!currentProjectId) return;
    const step = getCoachStep();
    
    if (step && step.tool === 'rotate') {
        localStorage.setItem('ops_coach_rotate_' + currentProjectId, 'true');
        updateCoachHint();
    } else if (step && step.tool === 'finish') {
        localStorage.setItem('ops_coach_done_' + currentProjectId, 'true');
        document.getElementById('coachHint').style.display = 'none';
        
        // Меняем заголовок справки перед открытием
        const helpTitle = document.querySelector('#helpModal h3');
        if (helpTitle) helpTitle.innerText = '📖 Справочник';
        
        // Открываем окно справки
        document.getElementById('helpModal').classList.add('show');
    } else {
        localStorage.setItem('ops_coach_skip_' + currentProjectId, 'true');
        document.querySelectorAll('.main-tool, .sub-btn').forEach(btn => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; });
        document.getElementById('coachHint').style.display = 'none';
    }
});

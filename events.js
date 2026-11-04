function getDrawCoordinates(clientX, clientY) { const rect = canvas.getBoundingClientRect(); return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) }; }
function isLineTool(tool) { return tool === 'wall' || tool.startsWith('cable_'); }
function closestPointOnSegment(px, py, x1, y1, x2, y2) { const l2 = (x2 - x1)**2 + (y2 - y1)**2; if (l2 === 0) return {x: x1, y: y1}; let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2; t = Math.max(0, Math.min(1, t)); return {x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1)}; }
function distToSegment(px, py, x1, y1, x2, y2) { let pt = closestPointOnSegment(px, py, x1, y1, x2, y2); return Math.hypot(px - pt.x, py - pt.y); }

function eraseAt(x, y) { 
    const activeCategory = getCategory(currentTool); 
    if (!activeCategory) return;
    for (let i = drawnElements.length - 1; i >= 0; i--) { 
        let el = drawnElements[i]; 
        if (el.category === activeCategory && isVisible(el)) { 
            let hit = false; 
            if (el.isLine) { if (distToSegment(x, y, el.x1, el.y1, el.x2, el.y2) < 15) hit = true; } 
            else if (el.category === 'ruler') { if (Math.abs(x - el.x) < 50 && Math.abs(y - el.y) < 30) hit = true; } 
            else { if (Math.hypot(x - el.x, y - el.y) < 25) hit = true; } 
            if (hit) { drawnElements.splice(i, 1); renderAll(); break; } 
        } 
    } 
}

function getSegmentBounds(w, cx, cy) {
    let pts = [ {x: w.x1, y: w.y1, t: 0}, {x: w.x2, y: w.y2, t: 1} ]; 
    let len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1); 
    if (len === 0) return {x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2};
    drawnElements.forEach(el => { 
        if (el !== w && el.type === 'wall' && isVisible(el)) { 
            [{x: el.x1, y: el.y1}, {x: el.x2, y: el.y2}].forEach(p => {
                let pt = closestPointOnSegment(p.x, p.y, w.x1, w.y1, w.x2, w.y2);
                if (Math.hypot(p.x - pt.x, p.y - pt.y) < 10) { pts.push({x: pt.x, y: pt.y, t: Math.hypot(pt.x - w.x1, pt.y - w.y1) / len}); }
            });
        } 
    });
    pts.sort((a,b) => a.t - b.t); 
    let pt = closestPointOnSegment(cx, cy, w.x1, w.y1, w.x2, w.y2); let clickT = Math.hypot(pt.x - w.x1, pt.y - w.y1) / len;
    for (let i = 0; i < pts.length - 1; i++) { if (clickT >= pts[i].t && clickT <= pts[i+1].t) { return {x1: pts[i].x, y1: pts[i].y, x2: pts[i+1].x, y2: pts[i+1].y}; } } 
    return {x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2};
}

function snapToGrid(x, y, skipX = null, skipY = null) {
    const SNAP_NODE = 40; const SNAP_LINE = 20; let snappedX = x, snappedY = y; let minDistNode = SNAP_NODE, minDistLine = SNAP_LINE; let foundNode = false;
    drawnElements.forEach(el => {
        if (!isVisible(el)) return;
        if (el.isLine && (el.type === currentTool || el.type === 'wall')) { 
            let d1 = Math.hypot(x - el.x1, y - el.y1); if (d1 < minDistNode && (el.x1 !== skipX || el.y1 !== skipY)) { minDistNode = d1; snappedX = el.x1; snappedY = el.y1; foundNode = true; } 
            let d2 = Math.hypot(x - el.x2, y - el.y2); if (d2 < minDistNode && (el.x2 !== skipX || el.y2 !== skipY)) { minDistNode = d2; snappedX = el.x2; snappedY = el.y2; foundNode = true; } 
        }
        if (!el.isLine && el.category !== 'text' && el.category !== 'ruler' && el.category !== 'opening' && currentTool.startsWith('cable_')) { 
            let d = Math.hypot(x - el.x, y - el.y); if (d < minDistNode && (el.x !== skipX || el.y !== skipY)) { minDistNode = d; snappedX = el.x; snappedY = el.y; foundNode = true; } 
        }
    });
    if (!foundNode) { 
        drawnElements.forEach(el => { 
            if (!isVisible(el)) return; 
            if (el.isLine && (el.type === currentTool || el.type === 'wall')) { 
                let pt = closestPointOnSegment(x, y, el.x1, el.y1, el.x2, el.y2); let d = Math.hypot(x - pt.x, y - pt.y); if (d < minDistLine) { minDistLine = d; snappedX = pt.x; snappedY = pt.y; } 
            } 
        }); 
    }
    return { x: snappedX, y: snappedY };
}

function getSmartPoint(startX, startY, rawX, rawY) {
    activeGuides = []; const ANGLE_TOL = 6; const GUIDE_TOL = 15; 
    let dx = rawX - startX; let dy = rawY - startY; let angle = Math.atan2(dy, dx) * 180 / Math.PI; let length = Math.hypot(dx, dy); let snappedAngle = Math.round(angle / 45) * 45; let isAngleSnapped = Math.abs(angle - snappedAngle) <= ANGLE_TOL; let targetX = rawX; let targetY = rawY;
    
    if (isAngleSnapped) { let rad = snappedAngle * Math.PI / 180; targetX = startX + length * Math.cos(rad); targetY = startY + length * Math.sin(rad); }
    
    drawnElements.forEach(el => {
        if (!isVisible(el)) return;
        if (el.isLine && el.type === 'wall') {
            const points = [{x: el.x1, y: el.y1}, {x: el.x2, y: el.y2}];
            points.forEach(pt => {
                if (Math.hypot(pt.x - startX, pt.y - startY) < 1) return; 
                if (isAngleSnapped) { 
                    if (snappedAngle % 180 === 0 && Math.abs(targetX - pt.x) < GUIDE_TOL) { targetX = pt.x; activeGuides.push({x1: pt.x, y1: pt.y, x2: targetX, y2: targetY}); } 
                    else if (snappedAngle % 90 === 0 && Math.abs(targetY - pt.y) < GUIDE_TOL) { targetY = pt.y; activeGuides.push({x1: pt.x, y1: pt.y, x2: targetX, y2: targetY}); } 
                } else { 
                    if (Math.abs(targetX - pt.x) < GUIDE_TOL) { targetX = pt.x; activeGuides.push({x1: pt.x, y1: pt.y, x2: targetX, y2: targetY}); } 
                    if (Math.abs(targetY - pt.y) < GUIDE_TOL) { targetY = pt.y; activeGuides.push({x1: pt.x, y1: pt.y, x2: targetX, y2: targetY}); } 
                }
            });
        }
    });
    
    let nodeSnap = snapToGrid(targetX, targetY, startX, startY); if (nodeSnap.x !== targetX || nodeSnap.y !== targetY) { targetX = nodeSnap.x; targetY = nodeSnap.y; activeGuides = []; } return {x: targetX, y: targetY};
}function placePointElement(rawX, rawY) {
    if (!currentTool) return;
    if (currentTool.startsWith('ruler')) {
        let snappedWall = null; let minDist = 30;
        drawnElements.forEach(el => { if (el.type === 'wall' && isVisible(el)) { let pt = closestPointOnSegment(rawX, rawY, el.x1, el.y1, el.x2, el.y2); let d = Math.hypot(rawX - pt.x, rawY - pt.y); if (d < minDist) { minDist = d; snappedWall = el; } } });
        if (snappedWall) {
            drawnElements.forEach(e => { if (e.category === 'ruler') e.highlight = false; });
            let bounds = (currentTool === 'ruler_segment') ? getSegmentBounds(snappedWall, rawX, rawY) : {x1: snappedWall.x1, y1: snappedWall.y1, x2: snappedWall.x2, y2: snappedWall.y2};
            let lenPx = Math.hypot(bounds.x2 - bounds.x1, bounds.y2 - bounds.y1); let dx = bounds.x2 - bounds.x1; let dy = bounds.y2 - bounds.y1; let nx = -dy/lenPx; let ny = dx/lenPx; 
            let midX = (bounds.x1 + bounds.x2) / 2 + nx * 40; let midY = (bounds.y1 + bounds.y2) / 2 + ny * 40;
            pendingElement = { category: 'ruler', lenPx: lenPx, midX: midX, midY: midY, wX1: bounds.x1, wY1: bounds.y1, wX2: bounds.x2, wY2: bounds.y2, highlight: true };
            document.getElementById('textModalTitle').innerText = currentTool === 'ruler_segment' ? 'Длина комнаты' : 'Длина всей стены'; document.getElementById('textInputParams').value = ''; document.getElementById('textInputParams').placeholder = 'Метров (напр. 4.5)'; document.getElementById('textModal').classList.add('show'); document.getElementById('textInputParams').focus();
        } return;
    }
    
    if (currentTool === 'text') { pendingElement = {isLine: false, type: 'text', category: 'text', system: getElementSystem('text'), text: '', x: rawX, y: rawY}; document.getElementById('textModalTitle').innerText = 'Ввод текста'; document.getElementById('textInputParams').value = ''; document.getElementById('textInputParams').placeholder = 'Пояснительная надпись...'; document.getElementById('textModal').classList.add('show'); document.getElementById('textInputParams').focus(); return; }
    
    let finalX = rawX; let finalY = rawY; let finalAngle = elementAngle; let snappedToOpening = false;
    let isWallSnap = ['door', 'window', 'opening_empty', 'power_panel', 'power_socket', 'os_mayak', 'os_nord_m', 'os_nord_p', 'os_nord_pro', 'ps_molniya12', 'ps_m24_3', 'ps_mayak24', 'ps_granit_3', 'ps_granit_5', 'ps_granit_8', 'ps_granit_16', 'ps_granit_24', 'ps_signal_20m', 'ps_signal_20p', 'ps_signal_10', 'ps_rokot_2', 'ps_rokot_3', 'ps_rokot_4'];
    
    if (isWallSnap.includes(currentTool)) {
        let minDist = 40; let snappedWall = null;
        drawnElements.forEach(el => { if (el.type === 'wall' && isVisible(el)) { let pt = closestPointOnSegment(rawX, rawY, el.x1, el.y1, el.x2, el.y2); let d = Math.hypot(rawX - pt.x, rawY - pt.y); if (d < minDist) { minDist = d; finalX = pt.x; finalY = pt.y; snappedWall = el; } } });
        if (snappedWall) { 
            let dx = snappedWall.x2 - snappedWall.x1; let dy = snappedWall.y2 - snappedWall.y1; finalAngle = Math.atan2(dy, dx) * 180 / Math.PI; let len = Math.hypot(dx, dy); let nx = -dy / len; let ny = dx / len; 
            if (currentTool === 'os_mayak' || currentTool === 'ps_mayak24' || currentTool === 'ps_molniya12' || currentTool === 'ps_m24_3') { finalX += nx * 16; finalY += ny * 16; } else if (currentTool.startsWith('os_nord') || currentTool.startsWith('ps_granit') || currentTool.startsWith('ps_signal') || currentTool.startsWith('ps_rokot')) { finalX -= nx * 20; finalY -= ny * 20; } 
        }
    }
    
    if (currentTool === 'os_smk') { 
        let minDist = 40; 
        drawnElements.forEach(el => { if ((el.type === 'door' || el.type === 'window' || el.type === 'opening_empty') && isVisible(el)) { let d = Math.hypot(rawX - el.x, rawY - el.y); if (d < minDist) { minDist = d; finalX = el.x; finalY = el.y; finalAngle = el.angle; snappedToOpening = true;} } }); 
    }

    const newEl = {isLine: false, type: currentTool, category: getCategory(currentTool), system: getElementSystem(getCategory(currentTool)), x: finalX, y: finalY, angle: finalAngle, isDouble: false};
    if (currentTool === 'os_smk' && snappedToOpening) { pendingElement = newEl; document.getElementById('smkModal').classList.add('show'); return; }
    
    drawnElements.push(newEl); renderAll(); saveState();
}

function getDistance(touches) { return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY); } 
function getCenter(touches) { return { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 }; }

let lastLabelClickTime = 0; let lastLabelClicked = null; let interactedWithLabel = false;
function checkLabelClick(clientX, clientY, isEraseMode) {
    let pos = getDrawCoordinates(clientX, clientY); let hitElement = null;
    for (let i = drawnElements.length - 1; i >= 0; i--) { let el = drawnElements[i]; if (el.category === 'ruler') { if (Math.abs(pos.x - el.x) < 40 && Math.abs(pos.y - el.y) < 30) { hitElement = el; break; } } }
    if (isEraseMode) return false; 
    
    let changed = false; let now = Date.now(); let isDoubleTap = hitElement && (hitElement === lastLabelClicked) && (now - lastLabelClickTime < 400);

    drawnElements.forEach(el => { if(el.category === 'ruler') { let shouldBeHighlighted = (el === hitElement); if (el.highlight !== shouldBeHighlighted) { el.highlight = shouldBeHighlighted; changed = true; } } });
    if (changed) { renderAll(); saveState(); } 
    
    if (hitElement) {
        if (isDoubleTap) {
            pendingElement = hitElement; document.getElementById('textModalTitle').innerText = 'Изменить размер'; document.getElementById('textInputParams').value = hitElement.text.replace('м', ''); document.getElementById('textInputParams').placeholder = 'Метров (напр. 4.5)'; document.getElementById('textModal').classList.add('show'); document.getElementById('textInputParams').focus();
            lastLabelClickTime = 0; lastLabelClicked = null;
        } else { lastLabelClickTime = now; lastLabelClicked = hitElement; }
        return true;
    } else { lastLabelClickTime = 0; lastLabelClicked = null; return false; }
}container.addEventListener('touchstart', (e) => {
    if (e.target.closest('.modal-overlay') || e.target.closest('#side-filters') || e.target.closest('#floating-modes') || e.target.closest('#ruler-modes')) return;
    interactedWithLabel = false;
    if (e.touches.length === 1) { interactedWithLabel = checkLabelClick(e.touches[0].clientX, e.touches[0].clientY, appMode === 'erase'); if (interactedWithLabel) { e.preventDefault(); return; } }
    
    if(!currentTool && e.touches.length === 1) return; e.preventDefault();
    if (e.touches.length === 2) { isPanning = true; wasPanning = true; drawingElement = null; activeGuides = []; let initialDistance = getDistance(e.touches); let initialCenter = getCenter(e.touches); window.initialScale = scale; window.initialPanX = panX; window.initialPanY = panY; window.initDist = initialDistance; window.initCenter = initialCenter; } 
    else if (e.touches.length === 1) { window.touchMoved = false; window.tapRaw = { x: e.touches[0].clientX, y: e.touches[0].clientY }; let rawPos = getDrawCoordinates(window.tapRaw.x, window.tapRaw.y); if (appMode === 'erase') { eraseAt(rawPos.x, rawPos.y); } else if (appMode === 'draw' && isLineTool(currentTool)) { window.tapPos = snapToGrid(rawPos.x, rawPos.y); drawingElement = { isLine: true, type: currentTool, category: getCategory(currentTool), system: getElementSystem(getCategory(currentTool)), x1: window.tapPos.x, y1: window.tapPos.y, x2: window.tapPos.x, y2: window.tapPos.y }; } else { window.tapPos = rawPos; } }
}, {passive: false});

container.addEventListener('touchmove', (e) => {
    if (e.target.closest('.modal-overlay') || e.target.closest('#side-filters') || e.target.closest('#floating-modes') || e.target.closest('#ruler-modes')) return; e.preventDefault();
    if (e.touches.length === 2 && isPanning) { 
        const currentDistance = getDistance(e.touches); const currentCenter = getCenter(e.touches); const clampedScale = Math.max(0.1, Math.min(window.initialScale * (currentDistance / window.initDist), 5)); 
        const contRect = container.getBoundingClientRect(); const relX = (window.initCenter.x - contRect.left - window.initialPanX) / window.initialScale; const relY = (window.initCenter.y - contRect.top - window.initialPanY) / window.initialScale; 
        panX = currentCenter.x - contRect.left - relX * clampedScale; panY = currentCenter.y - contRect.top - relY * clampedScale; scale = clampedScale; updateTransform();
    } else if (e.touches.length === 1) { 
        if (Math.hypot(e.touches[0].clientX - window.tapRaw.x, e.touches[0].clientY - window.tapRaw.y) > 10) window.touchMoved = true; 
        let pos = getDrawCoordinates(e.touches[0].clientX, e.touches[0].clientY); 
        if (appMode === 'erase') { eraseAt(pos.x, pos.y); } 
        else if (appMode === 'draw' && drawingElement) { if (drawingElement.type === 'wall') { let finalPos = getSmartPoint(drawingElement.x1, drawingElement.y1, pos.x, pos.y); drawingElement.x2 = finalPos.x; drawingElement.y2 = finalPos.y; } else { let snap = snapToGrid(pos.x, pos.y, drawingElement.x1, drawingElement.y1); drawingElement.x2 = snap.x; drawingElement.y2 = snap.y; } renderAll(); } 
    }
}, {passive: false});

container.addEventListener('touchend', (e) => {
    if (e.target.closest('.modal-overlay') || e.target.closest('#side-filters') || e.target.closest('#floating-modes') || e.target.closest('#ruler-modes')) return; e.preventDefault(); 
    if (interactedWithLabel) { if (e.touches.length === 0) interactedWithLabel = false; wasPanning = false; return; }
    if (e.touches.length < 2) isPanning = false;
    if (e.touches.length === 0) { 
        if (appMode === 'draw') { 
            if (drawingElement) { if(drawingElement.x1 !== drawingElement.x2 || drawingElement.y1 !== drawingElement.y2) { drawnElements.push(drawingElement); saveState(); } drawingElement = null; activeGuides = []; renderAll(); } 
            else if (!isLineTool(currentTool) && !window.touchMoved && currentTool && !wasPanning) { placePointElement(window.tapPos.x, window.tapPos.y); } 
        } 
        if (appMode === 'erase') saveState();
        wasPanning = false; 
    }
});

container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.modal-overlay') || e.target.closest('#side-filters') || e.target.closest('#floating-modes') || e.target.closest('#ruler-modes')) return; 
    if (e.button !== 0) return;
    interactedWithLabel = checkLabelClick(e.clientX, e.clientY, appMode === 'erase'); 
    if (interactedWithLabel) return;
    if (!currentTool) return; 
    let pos = getDrawCoordinates(e.clientX, e.clientY);
    if (appMode === 'erase') eraseAt(pos.x, pos.y); 
    else if (isLineTool(currentTool)) { let startPos = snapToGrid(pos.x, pos.y); drawingElement = {isLine: true, type: currentTool, category: getCategory(currentTool), system: getElementSystem(getCategory(currentTool)), x1: startPos.x, y1: startPos.y, x2: startPos.x, y2: startPos.y}; }
});

container.addEventListener('mousemove', (e) => {
    if (e.target.closest('.modal-overlay') || e.target.closest('#side-filters') || e.target.closest('#floating-modes') || e.target.closest('#ruler-modes')) return; let pos = getDrawCoordinates(e.clientX, e.clientY);
    if(e.buttons === 1) { if(appMode === 'erase') eraseAt(pos.x, pos.y); else if (drawingElement) { if (drawingElement.type === 'wall') { let finalPos = getSmartPoint(drawingElement.x1, drawingElement.y1, pos.x, pos.y); drawingElement.x2 = finalPos.x; drawingElement.y2 = finalPos.y; } else { let snap = snapToGrid(pos.x, pos.y, drawingElement.x1, drawingElement.y1); drawingElement.x2 = snap.x; drawingElement.y2 = snap.y; } renderAll(); } }
});

container.addEventListener('mouseup', (e) => {
    if (e.target.closest('.modal-overlay') || e.target.closest('#side-filters') || e.target.closest('#floating-modes') || e.target.closest('#ruler-modes')) return;
    if (interactedWithLabel) { interactedWithLabel = false; wasPanning = false; return; }
    if (appMode === 'draw') { if (drawingElement) { if(drawingElement.x1 !== drawingElement.x2 || drawingElement.y1 !== drawingElement.y2) { drawnElements.push(drawingElement); saveState(); } drawingElement = null; activeGuides = []; renderAll(); } else if (!isLineTool(currentTool) && currentTool && !wasPanning) { let pos = getDrawCoordinates(e.clientX, e.clientY); placePointElement(pos.x, pos.y); } } 
    if (appMode === 'erase') saveState();
    wasPanning = false;
});

container.addEventListener('wheel', (e) => { e.preventDefault(); const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9; const newScale = Math.max(0.1, Math.min(scale * zoomFactor, 5)); const contRect = container.getBoundingClientRect(); const mouseX = e.clientX - contRect.left; const mouseY = e.clientY - contRect.top; panX = mouseX - ((mouseX - panX) / scale) * newScale; panY = mouseY - ((mouseY - panY) / scale) * newScale; scale = newScale; updateTransform(); }, {passive: false});
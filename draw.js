function drawLightning(tCtx) { tCtx.fillStyle = '#000000'; tCtx.beginPath(); tCtx.moveTo(2, -8); tCtx.lineTo(-4, 2); tCtx.lineTo(1, 2); tCtx.lineTo(-2, 10); tCtx.lineTo(4, -1); tCtx.lineTo(-1, -1); tCtx.closePath(); tCtx.fill(); }

function drawShape(tCtx, x, y, type, angle, isDouble = false) {
    tCtx.save(); tCtx.translate(x, y); if (angle) tCtx.rotate(angle * Math.PI / 180); tCtx.setLineDash([]); const R = 16; tCtx.lineWidth = 3;
    
    if (['os_astra512', 'os_shtora', 'os_astra621', 'os_shoroh', 'os_astras'].includes(type)) {
        tCtx.strokeStyle = '#1976D2'; tCtx.fillStyle = '#1976D2'; tCtx.strokeRect(-R, -R, 2 * R, 2 * R);
        if (type === 'os_astra512' || type === 'os_shtora') { tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(R, -R); tCtx.lineTo(R, R); tCtx.closePath(); tCtx.fill(); }
        if (type === 'os_astra621') { tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(R, -R); tCtx.lineTo(R, R); tCtx.closePath(); tCtx.fill(); tCtx.beginPath(); tCtx.moveTo(-R, 0); tCtx.lineTo(0, 0); tCtx.stroke(); }
        if (type === 'os_shoroh') { tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(-R, -R); tCtx.lineTo(R, -R); tCtx.closePath(); tCtx.fill(); tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(-R, R); tCtx.lineTo(R, R); tCtx.closePath(); tCtx.fill(); }
        if (type === 'os_astras') { tCtx.beginPath(); tCtx.moveTo(-R, R); tCtx.lineTo(R, -R); tCtx.lineTo(R, R); tCtx.closePath(); tCtx.fill(); }
    } else if (type === 'os_astra8') { tCtx.strokeStyle = '#1976D2'; tCtx.fillStyle = '#1976D2'; tCtx.beginPath(); tCtx.arc(0, 0, R, 0, Math.PI * 2); tCtx.stroke(); tCtx.save(); tCtx.beginPath(); tCtx.arc(0, 0, R, 0, Math.PI * 2); tCtx.clip(); tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(R, -R); tCtx.lineTo(R, R); tCtx.closePath(); tCtx.fill(); tCtx.restore(); tCtx.beginPath(); tCtx.moveTo(-R, 0); tCtx.lineTo(0, 0); tCtx.stroke(); 
    } else if (type === 'os_smk') { tCtx.strokeStyle = '#1976D2'; tCtx.fillStyle = '#1976D2'; if (isDouble) { tCtx.strokeRect(-26, -6, 22, 12); tCtx.fillRect(-26, 0, 22, 6); tCtx.strokeRect(4, -6, 22, 12); tCtx.fillRect(4, 0, 22, 6); } else { tCtx.strokeRect(-20, -7.5, 40, 15); tCtx.fillRect(-20, 0, 40, 7.5); } 
    } else if (type === 'os_tm') { tCtx.strokeStyle = '#1976D2'; tCtx.fillStyle = '#1976D2'; tCtx.beginPath(); tCtx.arc(0, 0, 8, 0, Math.PI * 2); tCtx.stroke(); tCtx.beginPath(); tCtx.arc(0, 0, 2, 0, Math.PI * 2); tCtx.fill(); 
    } else if (type === 'os_mayak') { tCtx.strokeStyle = '#1976D2'; tCtx.strokeRect(-R, -R, 2 * R, 2 * R); tCtx.beginPath(); tCtx.arc(0, 0, R, 0, Math.PI * 2); tCtx.stroke(); const cOff = R * 0.707; tCtx.beginPath(); tCtx.moveTo(-cOff, -cOff); tCtx.lineTo(cOff, cOff); tCtx.stroke(); tCtx.beginPath(); tCtx.moveTo(cOff, -cOff); tCtx.lineTo(-cOff, cOff); tCtx.stroke(); 
    } else if (type.startsWith('os_kts_')) { tCtx.strokeStyle = '#1976D2'; tCtx.fillStyle = '#1976D2'; tCtx.strokeRect(-R, -R, 2 * R, 2 * R); tCtx.beginPath(); tCtx.arc(0, 0, R * 0.7, 0, Math.PI * 2); tCtx.fill(); 
    } else if (type === 'os_nord_m' || type === 'os_nord_p' || type === 'os_nord_pro') { tCtx.fillStyle = '#EEEEEE'; tCtx.strokeStyle = '#1976D2'; tCtx.lineWidth = 4; tCtx.fillRect(-30, -20, 60, 40); tCtx.strokeRect(-30, -20, 60, 40); tCtx.fillStyle = '#222222'; tCtx.font = "bold 16px sans-serif"; tCtx.textAlign = "center"; tCtx.textBaseline = "middle"; let text = type === 'os_nord_m' ? "Nord М" : type === 'os_nord_p' ? "Nord П" : "Nord Pro"; tCtx.fillText(text, 0, 0); 
    } 
    else if (type === 'power_panel' || type === 'power_socket') { tCtx.strokeStyle = '#000000'; tCtx.fillStyle = '#FFF59D'; let w = type==='power_panel'?50:24; let h = type==='power_panel'?30:24; tCtx.fillRect(-w/2, -h/2, w, h); tCtx.strokeRect(-w/2, -h/2, w, h); drawLightning(tCtx);
    } else if (type === 'camera') { tCtx.strokeStyle = '#000000'; tCtx.fillStyle = '#FF9800'; tCtx.fillRect(-R, -R, 32, 32); tCtx.strokeRect(-R, -R, 32, 32); 
    } else if (type === 'door') { tCtx.strokeStyle = '#000000'; tCtx.fillStyle = '#FFE0B2'; tCtx.fillRect(-30, -10, 60, 20); tCtx.strokeRect(-30, -10, 60, 20); 
    } else if (type === 'window') { tCtx.strokeStyle = '#000000'; tCtx.fillStyle = '#E1F5FE'; tCtx.fillRect(-30, -10, 60, 20); tCtx.strokeRect(-30, -10, 60, 20); tCtx.beginPath(); tCtx.moveTo(-30, 0); tCtx.lineTo(30, 0); tCtx.stroke(); 
    } else if (type === 'opening_empty') { tCtx.strokeStyle = '#000000'; tCtx.fillStyle = '#FFFFFF'; tCtx.setLineDash([5, 5]); tCtx.fillRect(-30, -10, 60, 20); tCtx.strokeRect(-30, -10, 60, 20); tCtx.setLineDash([]); 
    } 
    else if (type === 'ps_ip212') { 
        tCtx.strokeStyle = '#F44336'; tCtx.strokeRect(-R, -R, 2 * R, 2 * R);
        tCtx.beginPath(); tCtx.moveTo(R*0.3, -R*0.5); tCtx.lineTo(-R*0.3, -R*0.1); tCtx.lineTo(R*0.3, R*0.1); tCtx.lineTo(-R*0.3, R*0.5); tCtx.stroke();
    } 
    else if (type === 'ps_ipr513') {
        tCtx.strokeStyle = '#F44336'; tCtx.strokeRect(-R, -R, 2 * R, 2 * R);
        tCtx.beginPath(); tCtx.moveTo(0, R*0.5); tCtx.lineTo(0, 0); tCtx.lineTo(-R*0.5, -R*0.5); tCtx.moveTo(0, 0); tCtx.lineTo(R*0.5, -R*0.5); tCtx.stroke();
    }
    else if (type === 'ps_molniya12' || type === 'ps_m24_3') {
        tCtx.strokeStyle = '#00BCD4'; tCtx.beginPath(); tCtx.arc(0, 0, R, 0, Math.PI * 2); tCtx.stroke();
        const off = R * 0.707; tCtx.beginPath(); tCtx.moveTo(-off, -off); tCtx.lineTo(off, off); tCtx.moveTo(off, -off); tCtx.lineTo(-off, off); tCtx.stroke();
    }
    else if (type === 'ps_mayak24') {
        tCtx.strokeStyle = '#00BCD4'; tCtx.beginPath(); tCtx.moveTo(-R*0.6, -R*0.3); tCtx.lineTo(-R*0.2, -R*0.3); tCtx.lineTo(R*0.4, -R*0.6); tCtx.lineTo(R*0.4, R*0.6); tCtx.lineTo(-R*0.2, R*0.3); tCtx.lineTo(-R*0.6, R*0.3); tCtx.closePath(); tCtx.stroke();
        tCtx.beginPath(); tCtx.moveTo(-R*0.2, -R*0.3); tCtx.lineTo(-R*0.2, R*0.3); tCtx.stroke();
    }
    else if (type.startsWith('ps_granit') || type.startsWith('ps_signal') || type.startsWith('ps_rokot')) {
        tCtx.fillStyle = '#FFFFFF'; tCtx.strokeStyle = '#F44336'; tCtx.lineWidth = 4; 
        tCtx.fillRect(-30, -20, 60, 40); tCtx.strokeRect(-30, -20, 60, 40);
        tCtx.strokeRect(-30, -20, 30, 20); 
        tCtx.fillStyle = '#222222'; tCtx.font = "bold 14px sans-serif"; tCtx.textAlign = "center"; tCtx.textBaseline = "middle"; 
        tCtx.fillText(elementNames[type], 0, 0); 
    }
    
    tCtx.restore(); 
}

function renderElement(el, targetCtx = ctx) {
    if (el.isLine) {
        targetCtx.beginPath(); targetCtx.moveTo(el.x1, el.y1); targetCtx.lineTo(el.x2, el.y2); targetCtx.lineCap = 'round'; targetCtx.lineJoin = 'round';
        let style = lineStyles[el.type] || {c: '#000', w: 2, d: []};
        targetCtx.strokeStyle = style.c; targetCtx.lineWidth = style.w; targetCtx.setLineDash(style.d); 
        targetCtx.stroke(); targetCtx.setLineDash([]);
    } else if (el.category === 'ruler') {
        if (el.highlight) { targetCtx.strokeStyle = 'rgba(255, 105, 180, 0.7)'; targetCtx.lineWidth = 15; targetCtx.beginPath(); targetCtx.moveTo(el.wX1, el.wY1); targetCtx.lineTo(el.wX2, el.wY2); targetCtx.stroke(); }
        targetCtx.font = "bold 24px sans-serif"; let tw = targetCtx.measureText(el.text).width; targetCtx.fillStyle = '#FFF9C4'; targetCtx.strokeStyle = el.highlight ? '#E91E63' : '#FBC02D'; targetCtx.lineWidth = 2;
        targetCtx.fillRect(el.x - tw/2 - 15, el.y - 20, tw + 30, 40); targetCtx.strokeRect(el.x - tw/2 - 15, el.y - 20, tw + 30, 40);
        targetCtx.fillStyle = "#333"; targetCtx.textAlign = 'center'; targetCtx.textBaseline = 'middle'; targetCtx.fillText(el.text, el.x, el.y);
    } else if (el.type === 'text') { 
        targetCtx.font = "bold 32px sans-serif"; targetCtx.fillStyle = "#000000"; targetCtx.fillText(el.text, el.x, el.y);
    } else { 
        drawShape(targetCtx, el.x, el.y, el.type, el.angle, el.isDouble); 
    }
}

function renderAll() {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawnElements.forEach(el => { if (isVisible(el)) renderElement(el, ctx); });
    
    if (drawingElement && isVisible(drawingElement)) {
        renderElement(drawingElement, ctx);
        activeGuides.forEach(guide => { ctx.beginPath(); ctx.moveTo(guide.x1, guide.y1); ctx.lineTo(guide.x2, guide.y2); ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 1; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]); });
    }
    
    if (typeof updateCoachHint === 'function') updateCoachHint();
}

function updatePreview() {
    const prevCanvas = document.getElementById('previewCanvas');
    const pCtx = prevCanvas.getContext('2d');
    pCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
    if (rotatableTools.includes(currentTool)) { pCtx.save(); pCtx.translate(prevCanvas.width / 2, prevCanvas.height / 2); pCtx.scale(0.8, 0.8); drawShape(pCtx, 0, 0, currentTool, elementAngle); pCtx.restore(); }
}
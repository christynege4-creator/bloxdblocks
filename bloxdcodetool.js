// --- GLOBALS ---
    let currentZoom = 1.0;
    let panX = 0, panY = 0;
    let isPanning = false, panStartX = 0, panStartY = 0;

    let dragGroup = null, draggedBlocks = [], ghost = null;
    let offX = 0, offY = 0;
    let startMouseX = 0, startMouseY = 0;
    let zIndexCounter = 1000; 
    let codeMode = 'javascript';
    const userVariables = new Map();
    const userFunctions = new Map();
    const userTypes = new Map();

    // --- TRANSFORM SYSTEM ---
    function updateTransform() {
        const canvas = document.getElementById('block-canvas');
        const workspace = document.getElementById('workspace');
        if (canvas && workspace) {
            canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
            workspace.style.backgroundPosition = `${panX}px ${panY}px`;
            workspace.style.backgroundSize = `${40 * currentZoom}px ${40 * currentZoom}px`;
        }
    }

    function changeZoom(delta) {
        currentZoom += delta;
        if (currentZoom < 0.5) currentZoom = 0.5;
        if (currentZoom > 2.0) currentZoom = 2.0;
        updateTransform();
    }
    function resetZoom() { currentZoom = 1.0; panX=0; panY=0; updateTransform(); }

    function setBlockPos(block, x, y) {
        block.style.position = 'absolute';
        block.style.left = x + 'px';
        block.style.top = y + 'px';
    }

    // --- NEON API & BLOCK REGISTRY ---
    const NeonAPI = {
        blocks: {},
        register(config) {
            this.blocks[config.id] = config;
            
            const params = config.type === 'EVENT' || config.type === 'FUNCTION'
                ? (config.params || [config.varName, config.varName2].filter(Boolean))
                : [];

            if (config.type === 'EVENT' || config.type === 'FUNCTION') {
                params.forEach((param, index) => {
                    const varId = index === 0 ? `var_${config.id}` : `var${index + 1}_${config.id}`;
                    if (!this.blocks[varId]) {
                        this.blocks[varId] = { id: varId, type: 'REPORTER', label: param, isVar: true, desc: "Variable from this event" };
                    }
                });
            }

            const toolbox = document.getElementById('toolbox');
            const categoryName = config.category || getBlockCategory(config);
            const category = ensureToolboxCategory(categoryName);
            const existingBlock = Array.from(toolbox.querySelectorAll('.draggable'))
                .find(block => block.dataset.id === config.id);
            if (existingBlock) existingBlock.remove();
            let html = '';

            const createInputs = (inputs) => {
                if (!inputs) return '';
                return inputs.map(inp => {
                    if (typeof inp === 'string') return `<div class="input-socket"><input type="text" value="${inp}"></div>`;
                    if (inp.label) {
                        const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                        const socketClass = inp.shape === 'reporter' ? 'input-socket reporter-value-socket' : 'input-socket';
                        return `<span style="opacity:0.8; font-size:10px;" title="${escapeHtml(inp.type || '')}">${escapeHtml(inp.label)}</span><div class="${socketClass}" ${inp.expression ? 'data-expression="true"' : ''}><input type="text" value="${escapeHtml(inp.def || '')}" placeholder="${escapeHtml(inp.placeholder || '')}"></div>`;
                    }
                    return '';
                }).join('');
            };

            // HTML GENERATION
            if (config.type === 'EVENT' || config.type === 'FUNCTION') {
                const varsHtml = params.map((param, index) => {
                    const varId = index === 0 ? `var_${config.id}` : `var${index + 1}_${config.id}`;
                    return `<div class="block-reporter draggable local-var" data-id="${varId}" data-type="reporter" data-scope="${config.id}">${param}</div>`;
                }).join('');

                let returnHtml = '';
                if (config.hasReturn) {
                    let returnClass = '';
                    let readonly = '';
                    let extraClass = '';
                    
                    if (config.returnType === 'boolean') { returnClass = 'boolean'; extraClass = 'toggle-bool'; readonly = 'readonly'; }
                    if (config.returnType === 'vec3') { returnClass = 'vec3'; readonly = 'readonly'; }
                    const expressionReturn = config.returnType === 'expression';

                    returnHtml = `<div class="return-row" style="background:var(--block-bg); border-left:2px solid var(--neon-green); border-right:2px solid var(--neon-green); padding:4px 12px; display:flex; align-items:center; gap:8px; margin-top:-1px;">
                                    <span style="font-size:11px; color:var(--neon-green); font-weight:bold;">Return:</span>
                                    <div class="input-socket return-socket ${returnClass} ${extraClass}" data-expression="${expressionReturn}"><input type="text" value="${config.defReturn || ''}" ${expressionReturn ? 'placeholder="JavaScript expression (optional)"' : ''} ${readonly}></div>
                                  </div>`;
                }

                const blockType = config.type === 'FUNCTION' ? 'function' : 'event';
                html = `<div class="block-start draggable" data-id="${config.id}" data-type="${blockType}" ${config.hasReturn ? 'data-hasreturn="true"' : ''}>
                            <div class="start-top"><span>${config.label}</span>${varsHtml}</div>
                            <div class="middle-part"><div class="c-line-top"></div><div class="spine"></div><div class="inner-slot"></div><div class="c-line-bottom"></div></div>
                            ${returnHtml}
                            <div class="start-bottom"></div>
                        </div>`;
            } 
            else if (config.type === 'TYPEDEF') {
                html = `<div class="block-action draggable" data-id="${config.id}" data-type="type_definition"><span>type ${config.typeName} =</span><div class="input-socket" data-expression="true"><input type="text" value="${config.typeValue || 'unknown'}"></div></div>`;
            }
            else if (config.type === 'CONTROL') {
                if (config.id === 'ifelse') html = `<div class="block-control draggable" data-id="ifelse" data-type="control"><div class="control-top"><span>if</span><div class="input-socket"></div><span>then</span></div><div class="middle-part"><div class="c-line-top"></div><div class="spine"></div><div class="inner-slot"></div><div class="c-line-top" style="top:auto; bottom:0;"></div></div><div class="else-label">else</div><div class="middle-part"><div class="c-line-top"></div><div class="spine"></div><div class="inner-slot"></div><div class="c-line-bottom"></div></div><div class="control-bottom"></div></div>`;
                else if (config.id === 'repeat') html = `<div class="block-control draggable" data-id="repeat" data-type="control"><div class="control-top"><span>repeat</span><div class="input-socket"><input type="text" value="10"></div><span>times</span></div><div class="middle-part"><div class="c-line-top"></div><div class="spine"></div><div class="inner-slot"></div><div class="c-line-bottom"></div></div><div class="control-bottom"></div></div>`;
                else if (config.id === 'if') html = `<div class="block-control draggable" data-id="if" data-type="control"><div class="control-top"><span>if</span><div class="input-socket"></div><span>then</span></div><div class="middle-part"><div class="c-line-top"></div><div class="spine"></div><div class="inner-slot"></div><div class="c-line-bottom"></div></div><div class="control-bottom"></div></div>`;
            } 
            else if (config.type === 'ITEM_MAP') {
                 html = `<div class="block-item-map draggable" data-id="${config.id}" data-type="item_map"><div class="item-map-header"><span>${config.label}</span></div><div class="inner-slot item-map-slot"></div></div>`;
            }
            else if (config.type === 'CUSTOM_ATTR_GROUP') {
                 html = `<div class="block-custom-group draggable" data-id="${config.id}" data-type="custom_attr_group"><div class="custom-group-header"><span>${config.label}</span></div><div class="inner-slot custom-group-slot"></div></div>`;
            }
            else if (config.type === 'ATTR_FIELD') {
                html = `<div class="block-attr-field draggable" data-id="${config.id}" data-type="attr_field"><span>${config.label}:</span><div class="input-socket"><input type="text" value=""></div></div>`;
            }
            else if (config.type === 'ATTR_KV') {
                html = `<div class="block-attr-kv draggable" data-id="${config.id}" data-type="attr_kv"><span>Key:</span><div class="input-socket" style="min-width:30px;"><input type="text" value="lol" style="width:50px; color:#fff;"></div><span>Value:</span><div class="input-socket"><input type="text" value="stuff"></div></div>`;
            }
            else if (config.type === 'SQUARE_LIST') {
                 html = `<div class="block-square draggable" data-id="${config.id}" data-type="square_list"><div class="square-header"><span>${config.label}</span></div><div class="inner-slot square-list-slot"></div></div>`;
            }
            else if (config.type === 'TICKET') {
                const inputsHtml = createInputs(config.inputs);
                html = `<div class="block-ticket draggable" data-id="${config.id}" data-type="ticket">${inputsHtml}</div>`;
            }
            else if (config.type === 'VEC3') {
                const inputs = `
                    <span style="font-size:9px; opacity:0.7">X</span><div class="input-socket"><input type="text" value="${config.defX||0}"></div>
                    <span style="font-size:9px; opacity:0.7">Y</span><div class="input-socket"><input type="text" value="${config.defY||0}"></div>
                    <span style="font-size:9px; opacity:0.7">Z</span><div class="input-socket"><input type="text" value="${config.defZ||0}"></div>
                `;
                html = `<div class="block-vec3 draggable" data-id="${config.id}" data-type="vec3"><div class="vec3-inner">${inputs}</div></div>`;
            }
            else if (['BOOLEAN','REPORTER','STRING'].includes(config.type)) {
                let inner = config.label;
                if (config.inputs) { inner = `<span>${config.label}</span>` + createInputs(config.inputs); }
                else if(config.isOp) { inner = `<div class="input-socket"><input type="text" value=""></div><span>${config.label}</span><div class="input-socket"><input type="text" value=""></div>`; }
                
                if (config.type === 'BOOLEAN') html = `<div class="block-boolean draggable" data-id="${config.id}" data-type="boolean"><div class="boolean-inner">${inner}</div></div>`;
                else if (config.type === 'STRING') html = `<div class="block-string draggable" data-id="${config.id}" data-type="reporter">${inner}</div>`;
                else html = `<div class="block-reporter draggable" data-id="${config.id}" data-type="reporter">${inner}</div>`;
            } 
            else if (config.type === 'ACTION') {
                const inputsHtml = createInputs(config.inputs);
                html = `<div class="block-action draggable" data-id="${config.id}" data-type="action"><span>${config.label}</span>${inputsHtml}</div>`;
            }

            if (!config.id.startsWith('var_')) {
                const div = document.createElement('div'); div.innerHTML = html.trim();
                div.firstElementChild?.addEventListener('mouseenter', () => showBlockInfo(config)); // TOOLTIP
                div.firstElementChild.addEventListener('mouseleave', () => hideBlockInfo());
                if (div.firstElementChild) category.querySelector('.toolbox-category-blocks').appendChild(div.firstElementChild);
            }
        }
    };

    function getBlockCategory(config) {
        if (config.category) return config.category;
        if (config.type === 'EVENT') return 'Event';
        if (config.apiMethod || config.type === 'ACTION') return 'Game API';
        if (config.type === 'CONTROL') return 'Logic';
        if (config.type === 'ITEM_MAP' || config.type === 'ATTR_FIELD' || config.type === 'CUSTOM_ATTR_GROUP' || config.type === 'ATTR_KV') return 'Item Operator';
        if (config.id.startsWith('styled') || config.id === 'textField' || config.id === 'customStyledText') return 'Custom Styled Text';
        return 'Operator';
    }

    function getCategoryOrder(name) {
        const order = ['Event', 'Game API', 'Custom Styled Text', 'Logic', 'Operator', 'Item Operator', 'Variable', 'Function', 'Type'];
        return order.indexOf(name) === -1 ? order.length : order.indexOf(name);
    }

    function ensureToolboxCategory(name) {
        const toolbox = document.getElementById('toolbox');
        const categoryPanels = document.getElementById('toolbox-category-panels');
        const categoryNav = document.getElementById('toolbox-categories');
        let category = Array.from(categoryPanels.querySelectorAll('.toolbox-category')).find(item => item.dataset.category === name);
        if (category) return category;
        category = document.createElement('section');
        category.className = 'toolbox-category';
        category.dataset.category = name;
        category.style.order = String(getCategoryOrder(name));
        const title = document.createElement('button');
        title.type = 'button';
        title.className = 'toolbox-category-title';
        title.setAttribute('aria-selected', 'false');
        title.dataset.category = name;
        title.textContent = name;
        const blocks = document.createElement('div');
        blocks.className = 'toolbox-category-blocks';
        title.addEventListener('click', () => setActiveToolboxCategory(name));
        category.appendChild(blocks);
        categoryNav.appendChild(title);
        categoryPanels.appendChild(category);
        if (!categoryNav.querySelector('[aria-selected="true"]')) setActiveToolboxCategory(name);
        return category;
    }

    function setActiveToolboxCategory(name) {
        document.querySelectorAll('#toolbox-categories .toolbox-category-title').forEach(button => {
            const active = button.dataset.category === name;
            button.setAttribute('aria-selected', String(active));
        });
        document.querySelectorAll('#toolbox-category-panels .toolbox-category').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.category === name);
        });
    }

    const reservedIdentifiers = new Set([
        'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
        'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
        'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
        'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try',
        'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static',
        'implements', 'interface', 'package', 'private', 'protected', 'public'
    ]);

    function isValidIdentifier(name) {
        return /^[A-Za-z_$][\w$]*$/.test(name) && !reservedIdentifiers.has(name);
    }

    function addCategoryForm(categoryName, fields, buttonLabel, onSubmit) {
        const category = ensureToolboxCategory(categoryName);
        const controls = document.createElement('form');
        controls.className = 'toolbox-category-controls';
        fields.forEach(field => {
            const input = document.createElement('input');
            input.name = field.name;
            input.placeholder = field.placeholder;
            input.setAttribute('aria-label', field.placeholder);
            if (field.defaultValue) input.value = field.defaultValue;
            controls.appendChild(input);
        });
        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = buttonLabel;
        controls.appendChild(button);
        controls.addEventListener('pointerdown', event => event.stopPropagation());
        controls.addEventListener('submit', event => {
            event.preventDefault();
            onSubmit(Object.fromEntries(new FormData(controls).entries()));
        });
        category.insertBefore(controls, category.querySelector('.toolbox-category-blocks'));
    }

    function registerVariable(name, typeName) {
        name = name.trim();
        typeName = typeName.trim() || 'any';
        if (!isValidIdentifier(name)) {
            alert('Enter a valid JavaScript variable name.');
            return;
        }
        if (userVariables.has(name)) {
            alert(`Variable "${name}" already exists.`);
            return;
        }
        userVariables.set(name, typeName);
        NeonAPI.register({ id: `user_var_${name}`, type: 'REPORTER', label: name, isVar: true, isUserVariable: true, category: 'Variable', desc: `Variable: ${name}. Right-click to delete.` });
        NeonAPI.register({
            id: `set_var_${name}`, type: 'ACTION', label: `set ${name} =`,
            inputs: [{ label: 'value', def: '0', expression: true, shape: 'reporter' }],
            variableName: name, variableAction: 'set', isUserVariable: true, category: 'Variable'
        });
        const isString = typeName === 'string';
        NeonAPI.register({
            id: `change_var_${name}`, type: 'ACTION',
            label: isString ? `change ${name} =` : `change ${name} by`,
            inputs: [{ label: 'value', def: isString ? '""' : '1', expression: true, shape: 'reporter' }],
            variableName: name, variableAction: isString ? 'assign' : 'change', isUserVariable: true, category: 'Variable'
        });
        updateCodeView();
    }

    function deleteVariable(name) {
        if (!userVariables.delete(name)) return;
        const ids = new Set([`user_var_${name}`, `set_var_${name}`, `change_var_${name}`]);
        ids.forEach(id => delete NeonAPI.blocks[id]);
        document.querySelectorAll('#toolbox-category-panels .toolbox-category-blocks > .draggable').forEach(block => {
            if (ids.has(block.dataset.id)) block.remove();
        });
        document.querySelectorAll('#block-canvas .draggable').forEach(block => {
            if (ids.has(block.dataset.id)) block.remove();
        });
        updateCodeView();
    }

    function registerFunction(name, params) {
        name = name.trim();
        params = params.split(',').map(param => param.trim()).filter(Boolean);
        if (!isValidIdentifier(name) || params.some(param => !isValidIdentifier(param))) {
            alert('Enter a valid function name and comma-separated parameter names.');
            return;
        }
        if (new Set(params).size !== params.length) {
            alert('Function parameter names must be unique.');
            return;
        }
        if (userFunctions.has(name)) {
            alert(`Function "${name}" already exists.`);
            return;
        }
        userFunctions.set(name, params);
        const id = `custom_fn_${name}`;
        NeonAPI.register({
            id, type: 'FUNCTION', label: `function ${name}`, params,
            functionName: name, category: 'Function',
            desc: `Define function ${name}(${params.join(', ')}).`
        });
        NeonAPI.register({
            id: `call_fn_${name}`, type: 'ACTION', label: name,
            inputs: params.map(param => ({ label: param, def: param, expression: true })),
            customFunctionName: name, category: 'Function',
            desc: `Call function ${name}(${params.join(', ')}).`
        });
        updateCodeView();
    }

    function registerType(name, value) {
        name = name.trim();
        value = value.trim() || 'unknown';
        if (!isValidIdentifier(name)) {
            alert('Enter a valid TypeScript type name.');
            return;
        }
        if (userTypes.has(name)) {
            alert(`Type "${name}" already exists.`);
            return;
        }
        userTypes.set(name, value);
        NeonAPI.register({
            id: `type_alias_${name}`, type: 'TYPEDEF', label: `type ${name} =`,
            typeName: name, typeValue: value, category: 'Type',
            desc: `TypeScript type alias: type ${name} = ${value}`
        });
        NeonAPI.register({
            id: `type_ref_${name}`, type: 'REPORTER', label: name,
            isType: true, category: 'Type', desc: `Type reference: ${name}`
        });
        updateCodeView();
    }

    function isVariableValueSocket(socket) {
        const owner = socket?.closest('.draggable');
        const config = owner && NeonAPI.blocks[owner.dataset.id];
        return socket?.dataset.expression === 'true' && Boolean(config?.variableAction);
    }

    // --- TOOLTIP SYSTEM ---
    function showBlockInfo(config) {
        const consoleEl = document.getElementById('console-output');
        consoleEl.style.color = '#fff';
        consoleEl.innerHTML = `<span style="color:var(--neon-green)">[INFO]</span> <b>${config.label}</b><br>${config.desc || "No description available."}`;
    }
    function hideBlockInfo() {
        const consoleEl = document.getElementById('console-output');
        consoleEl.style.color = '#888';
        consoleEl.innerHTML = "/* OUTPUT CONSOLE<br>// Hover over blocks to see what they do. */";
    }

    // --- CLICK HANDLER FOR BOOLEAN TOGGLE ---
    document.addEventListener('click', e => {
        if (e.target.closest('.toggle-bool')) {
            const socket = e.target.closest('.toggle-bool');
            const input = socket.querySelector('input');
            if (input.value === 'true') input.value = 'false';
            else input.value = 'true';
            updateCodeView();
        }
    });

    // --- DRAG & DROP SYSTEM ---
    document.addEventListener('contextmenu', event => {
        const block = event.target.closest('#toolbox-category-panels [data-id]');
        const config = block && NeonAPI.blocks[block.dataset.id];
        if (!config || !config.isUserVariable) return;
        event.preventDefault();
        deleteVariable(config.variableName || config.label);
    });

    document.addEventListener('pointerdown', e => {
        if (dragGroup) { dragGroup.remove(); dragGroup = null; }

        if (e.target.id === 'workspace' || e.target.id === 'block-canvas') {
            isPanning = true; panStartX = e.clientX - panX; panStartY = e.clientY - panY; document.body.style.cursor = 'grabbing'; return;
        }

        const target = e.target.closest('.draggable');
        if (!target || e.target.tagName === 'INPUT') return;
        
        if (target.parentElement && target.parentElement.classList.contains('toggle-bool')) return;

        e.preventDefault();

        if (target.closest('#workspace')) { zIndexCounter++; target.style.zIndex = zIndexCounter; }

        const isLocalVar = target.classList.contains('local-var');
        const startScale = target.closest('#block-canvas') ? currentZoom : 1.0;

        startMouseX = e.clientX; startMouseY = e.clientY;
        const targetRect = target.getBoundingClientRect();
        offX = (e.clientX - targetRect.left) / startScale; offY = (e.clientY - targetRect.top) / startScale;
        
        const parentSocket = target.parentElement;
        if (parentSocket && parentSocket.classList.contains('input-socket')) {
            const wasBool = parentSocket.classList.contains('toggle-bool');
            const isReturn = parentSocket.classList.contains('return-socket');
            
            setTimeout(() => {
                if (parentSocket.children.length === 0) {
                     if (wasBool && isReturn) { parentSocket.innerHTML = '<input type="text" value="false" readonly>'; } 
                     else if (parentSocket.classList.contains('vec3') && isReturn) { parentSocket.innerHTML = '<input type="text" value="" readonly>'; }
                     else { parentSocket.innerHTML = '<input type="text" value="">'; }
                     parentSocket.style.border = ''; parentSocket.style.background = '';
                }
            }, 0);
        }

        draggedBlocks = [];
        if (isLocalVar) { const c = target.cloneNode(true); c.classList.remove('local-var'); draggedBlocks.push(c); }
        else if (target.closest('#toolbox')) draggedBlocks.push(target.cloneNode(true));
        else {
            let current = target;
            const isInWorkspace = (target.parentElement.id === 'workspace' || target.closest('#block-canvas'));
            
            while(current && current.classList.contains('draggable')) {
                const next = current.nextElementSibling;
                if (isInWorkspace && next && next.classList.contains('draggable')) {
                   const r1 = current.getBoundingClientRect(); const r2 = next.getBoundingClientRect();
                   if (Math.abs(r2.top - r1.bottom) < 15 && Math.abs(r2.left - r1.left) < 15) { draggedBlocks.push(current); }
                   else { draggedBlocks.push(current); break; }
                } else {
                    draggedBlocks.push(current);
                    if (!next || !next.classList.contains('draggable')) break;
                }
                current = next;
            }
        }

        dragGroup = document.createElement('div'); dragGroup.className = 'drag-group';
        const activeScale = currentZoom;
        dragGroup.style.transform = `translate(${e.clientX - offX*activeScale}px, ${e.clientY - offY*activeScale}px) scale(${activeScale})`;
        
        draggedBlocks.forEach(b => { 
            b.classList.add('dragging'); b.style.position = 'static'; b.style.transform = 'none'; b.style.margin = '0'; 
            dragGroup.appendChild(b); 
        });
        document.body.appendChild(dragGroup);
        dragGroup.setPointerCapture(e.pointerId);
        e.stopPropagation();
    });

    document.addEventListener('pointermove', e => {
        if (isPanning) { panX = e.clientX - panStartX; panY = e.clientY - panStartY; updateTransform(); return; }
        if (!dragGroup) return;

        const activeScale = currentZoom;
        dragGroup.style.transform = `translate(${e.clientX - offX*activeScale}px, ${e.clientY - offY*activeScale}px) scale(${activeScale})`;

        const targets = document.elementsFromPoint(e.clientX, e.clientY);
        
        const slot = targets.find(t => (t.classList.contains('inner-slot') || t.classList.contains('square-list-slot') || t.classList.contains('item-map-slot') || t.classList.contains('custom-group-slot')) && t.closest('#workspace'));
        const socket = targets.find(t => t.classList.contains('input-socket') && t.closest('#workspace'));

        const type = draggedBlocks[0].dataset.type;

        if (slot) {
            const isSquareSlot = slot.classList.contains('square-list-slot');
            const isItemMapSlot = slot.classList.contains('item-map-slot');
            const isCustomGroupSlot = slot.classList.contains('custom-group-slot');
            const isNormalSlot = !isSquareSlot && !isItemMapSlot && !isCustomGroupSlot;

            let valid = false;
            if (isNormalSlot && (type === 'action' || type === 'control')) valid = true;
            if (isSquareSlot && type === 'ticket') valid = true;
            
            if (isItemMapSlot) {
                if (type === 'attr_field') {
                    const draggedId = draggedBlocks[0].dataset.id;
                    const existing = Array.from(slot.children).find(c => c.classList.contains('draggable') && !c.classList.contains('dragging') && c.dataset.id === draggedId);
                    if (!existing) valid = true;
                }
                if (type === 'custom_attr_group') {
                    const existing = Array.from(slot.children).find(c => c.classList.contains('draggable') && !c.classList.contains('dragging') && c.dataset.type === 'custom_attr_group');
                    if (!existing) valid = true;
                }
            }
            if (isCustomGroupSlot && type === 'attr_kv') valid = true;

            if (valid) {
                if (!ghost) { 
                    ghost = document.createElement('div'); 
                    if (isSquareSlot) ghost.className = 'placeholder square-pl';
                    else if (isItemMapSlot) ghost.className = 'placeholder item-map-pl';
                    else if (isCustomGroupSlot) ghost.className = 'placeholder custom-group-pl';
                    else ghost.className = 'placeholder'; 
                }
                const children = Array.from(slot.children).filter(c => !c.classList.contains('dragging') && c !== ghost);
                let reference = null;
                for (let child of children) {
                    const box = child.getBoundingClientRect();
                    if (e.clientY < box.top + box.height / 2) { reference = child; break; }
                }
                slot.insertBefore(ghost, reference);
            } else if (ghost) { ghost.remove(); ghost = null; }
        } else if (ghost) { ghost.remove(); ghost = null; }

        document.querySelectorAll('.input-socket').forEach(s => { s.style.border = ''; s.style.borderRadius = ''; });
        
        if (socket && draggedBlocks.length === 1) {
            let canShowHover = true;
            if (socket.classList.contains('return-socket')) {
                const root = socket.closest('.block-start');
                if (root) {
                    const evtId = root.dataset.id;
                    const config = NeonAPI.blocks[evtId];
                    if (config && config.returnType) {
                        if (config.returnType === 'boolean' && type !== 'boolean') canShowHover = false;
                        if (config.returnType === 'vec3' && type !== 'vec3') canShowHover = false;
                    } else {
                        if (!['boolean','reporter'].includes(type)) canShowHover = false;
                    }
                }
            }

            if (canShowHover && (
                ['reporter','boolean','string','vec3','square_list','item_map'].includes(type) ||
                (isVariableValueSocket(socket) && ['action','control'].includes(type))
            )) {
                let color = 'var(--neon-yellow)';
                if (type === 'boolean') color = 'var(--neon-purple)';
                if (type === 'string') color = 'var(--neon-pink)';
                if (type === 'vec3') color = 'var(--neon-red)';
                if (type === 'square_list') color = 'var(--neon-blue)';
                if (type === 'item_map') color = 'var(--neon-teal)';
                socket.style.border = `2px solid ${color}`; socket.style.borderRadius = '10px';
            }
        }
    });

    function cleanInvalidVars(blockElement) {
        if (!blockElement) return;
        const root = blockElement.closest('.block-start');
        const currentScope = root ? root.dataset.id : null;
        const varsToCheck = [];
        if (blockElement.classList.contains('local-var')) varsToCheck.push(blockElement);
        varsToCheck.push(...blockElement.querySelectorAll('.local-var'));
        varsToCheck.forEach(v => { const requiredScope = v.dataset.scope; if (!currentScope || currentScope !== requiredScope) v.remove(); });
    }

    const handlePointerUp = (e) => {
        if (isPanning) { isPanning = false; document.body.style.cursor = ''; return; }
        if (!dragGroup) return;
        
        dragGroup.releasePointerCapture(e.pointerId);
        const lead = draggedBlocks[0];
        if(!lead) { dragGroup.remove(); dragGroup=null; return; }

        if (e.clientX < 300 && Math.hypot(e.clientX - startMouseX, e.clientY - startMouseY) > 5) {
            draggedBlocks.forEach(b => b.remove()); if (ghost) ghost.remove(); dragGroup.remove(); dragGroup = null; 
            setTimeout(() => { updateCodeView(); }, 50); return;
        }

        draggedBlocks.forEach(b => b.classList.remove('dragging'));
        const targets = document.elementsFromPoint(e.clientX, e.clientY);
        const socket = targets.find(t => t.classList.contains('input-socket') && t.closest('#workspace'));
        
        let allowedToDrop = true;
        if (lead.dataset.scope) { allowedToDrop = false; if (socket && socket.closest('.block-start')?.dataset.id === lead.dataset.scope) allowedToDrop = true; }
        
        if (socket) { 
            const isStackBlock = ['action', 'control'].includes(lead.dataset.type);
            if (isStackBlock ? !isVariableValueSocket(socket) : ['event','ticket','attr_field','custom_attr_group','attr_kv'].includes(lead.dataset.type)) allowedToDrop = false;
            if (socket.classList.contains('return-socket')) {
                const root = socket.closest('.block-start');
                if (root) {
                    const evtId = root.dataset.id;
                    const config = NeonAPI.blocks[evtId];
                    if (config && config.returnType) {
                        if (config.returnType === 'boolean' && lead.dataset.type !== 'boolean') allowedToDrop = false;
                        if (config.returnType === 'vec3' && lead.dataset.type !== 'vec3') allowedToDrop = false;
                    } else { if (!['boolean', 'reporter'].includes(lead.dataset.type)) allowedToDrop = false; }
                }
            }
        }
        
        if (socket && draggedBlocks.length === 1 && allowedToDrop) {
            socket.innerHTML = ''; socket.style.border = ''; socket.style.borderRadius = ''; socket.style.background = 'transparent';
            lead.style.position = 'static'; lead.style.left = ''; lead.style.top = ''; lead.style.transform = 'none'; lead.style.margin = '0';
            socket.appendChild(lead); cleanInvalidVars(lead);
        } else if (ghost) {
            ghost.parentElement.insertBefore(lead, ghost.nextSibling); ghost.remove(); ghost = null;
            for(let i=1; i<draggedBlocks.length; i++) lead.after(draggedBlocks[i]);
            draggedBlocks.forEach(b => cleanInvalidVars(b));
        } else if (e.clientX > 300 && !lead.dataset.scope) { 
            const canvas = document.getElementById('block-canvas'); const cr = canvas.getBoundingClientRect();
            let closestBlock = null; let minDistance = Infinity;
            const isStackable = ['action','control','type_definition'].includes(lead.dataset.type);
            const isTicket = lead.dataset.type === 'ticket'; const isAttr = lead.dataset.type === 'attr_field';

            Array.from(document.querySelectorAll('#block-canvas .draggable')).forEach(block => {
                if (block === lead || draggedBlocks.includes(block) || block.parentElement.classList.contains('input-socket')) return;
                const bType = block.dataset.type;
                if (isStackable && !['action','control','event'].includes(bType)) return;
                if (isTicket && bType !== 'ticket') return; if (isAttr && bType !== 'attr_field') return;
                if (!isStackable && !isTicket && !isAttr) return; 
                const tr = block.getBoundingClientRect(); const leadRect = lead.getBoundingClientRect();
                const dY = Math.abs(leadRect.bottom - tr.bottom); const dX = Math.abs(leadRect.left - tr.left);
                if (dY < 30 && dX < 30 && (dY+dX) < minDistance) { minDistance = dY+dX; closestBlock = block; }
            });

            if (closestBlock) {
                canvas.appendChild(lead); const tr = closestBlock.getBoundingClientRect();
                const newLeft = (tr.left - cr.left) / currentZoom; const newTop = (tr.bottom - cr.top) / currentZoom;
                setBlockPos(lead, newLeft, newTop); let currentY = newTop + lead.offsetHeight + 2;
                for(let i=1; i<draggedBlocks.length; i++) { const b = draggedBlocks[i]; canvas.appendChild(b); setBlockPos(b, newLeft, currentY); currentY += b.offsetHeight + 2; }
            } else {
                const leadRect = lead.getBoundingClientRect();
                let curY = (leadRect.top - cr.top) / currentZoom; let curX = (leadRect.left - cr.left) / currentZoom;
                draggedBlocks.forEach(b => { canvas.appendChild(b); setBlockPos(b, curX, curY); curY += b.offsetHeight + 2; });
            }
            draggedBlocks.forEach(b => cleanInvalidVars(b));
        } else { draggedBlocks.forEach(b => b.remove()); }
        dragGroup.remove(); dragGroup = null; setTimeout(() => { updateCodeView(); }, 50);
    };

    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    // --- SAVE & LOAD ---
    function serializeBlock(block) {
        if (!block || !block.classList.contains('draggable') || block.classList.contains('dragging')) return null;
        const data = { id: block.dataset.id, left: block.style.left, top: block.style.top, inputs: [], children: [], returnVal: null };
        const returnInput = block.querySelector('.return-row input'); if (returnInput) data.returnVal = returnInput.value;
        const allSockets = Array.from(block.querySelectorAll('.input-socket')).filter(s => !s.classList.contains('return-socket'));
        const directSockets = allSockets.filter(s => s.closest('.draggable') === block);
        directSockets.forEach(socket => {
            const nestedBlock = socket.querySelector('.draggable');
            if (nestedBlock) data.inputs.push({ type: 'block', value: serializeBlock(nestedBlock) });
            else { const input = socket.querySelector('input'); data.inputs.push({ type: 'value', value: input ? input.value : '' }); }
        });
        const slots = Array.from(block.querySelectorAll(':scope > .middle-part > .inner-slot, :scope > .inner-slot, :scope > .square-list-slot, :scope > .item-map-slot, :scope > .custom-group-slot'));
        slots.forEach(slot => {
            const slotChildren = []; Array.from(slot.children).forEach(c => { if (c.classList.contains('draggable')) slotChildren.push(serializeBlock(c)); });
            data.children.push(slotChildren);
        });
        return data;
    }

    function reconstructBlock(data) {
        const template = document.querySelector(`#toolbox .draggable[data-id="${data.id}"]`); if (!template) return null;
        const block = template.cloneNode(true);
        if (data.left && data.left !== "auto") { block.style.position = 'absolute'; block.style.left = data.left; block.style.top = data.top; }
        else { block.style.position = 'static'; block.style.left = ''; block.style.top = ''; }
        if (data.returnVal !== undefined && data.returnVal !== null) { const retInp = block.querySelector('.return-row input'); if (retInp) retInp.value = data.returnVal; }
        const allSockets = Array.from(block.querySelectorAll('.input-socket')).filter(s => !s.classList.contains('return-socket'));
        const directSockets = allSockets.filter(s => s.closest('.draggable') === block);
        if (data.inputs) {
            data.inputs.forEach((inputData, index) => {
                if (index >= directSockets.length) return; const socket = directSockets[index]; socket.innerHTML = ''; 
                if (inputData.type === 'value') { const input = document.createElement('input'); input.type = 'text'; input.value = inputData.value; socket.appendChild(input); }
                else if (inputData.type === 'block') {
                    const childBlock = reconstructBlock(inputData.value);
                    if (childBlock) {
                        socket.appendChild(childBlock);
                        const type = childBlock.dataset.type;
                        if(['reporter','boolean','string','vec3','square_list','item_map'].includes(type)) {
                            let color = 'var(--neon-yellow)';
                            if (type === 'boolean') color = 'var(--neon-purple)';
                            if (type === 'string') color = 'var(--neon-pink)';
                            if (type === 'vec3') color = 'var(--neon-red)';
                            if (type === 'square_list') color = 'var(--neon-blue)';
                            if (type === 'item_map') color = 'var(--neon-teal)';
                            socket.style.border = `2px solid ${color}`; socket.style.borderRadius = '10px';
                        }
                    }
                }
            });
        }
        if (data.children && data.children.length > 0) {
            const slots = Array.from(block.querySelectorAll(':scope > .middle-part > .inner-slot, :scope > .inner-slot, :scope > .square-list-slot, :scope > .item-map-slot, :scope > .custom-group-slot'));
            data.children.forEach((childList, index) => {
                if (slots[index]) { childList.forEach(childData => { const childBlock = reconstructBlock(childData); if (childBlock) slots[index].appendChild(childBlock); }); }
            });
        }
        return block;
    }

    const workspaceFileFormat = 'bloxd-block';
    const workspaceFileVersion = 1;

    function createWorkspaceFileData() {
        const canvas = document.getElementById('block-canvas');
        const rootBlocks = Array.from(canvas.children).filter(el => el.classList.contains('draggable'));
        return {
            format: workspaceFileFormat,
            version: workspaceFileVersion,
            blocks: rootBlocks.map(b => serializeBlock(b)),
            view: { x: panX, y: panY, zoom: currentZoom },
            variables: Array.from(userVariables.entries()),
            functions: Array.from(userFunctions.entries()),
            types: Array.from(userTypes.entries()),
            mode: codeMode
        };
    }

    function validateWorkspaceFileData(data) {
        const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
        const fail = message => { throw new Error(message); };
        if (!isRecord(data) || data.format !== workspaceFileFormat || data.version !== workspaceFileVersion) {
            fail('This is not a supported Bloxd Block (.bb) file.');
        }
        if (!Array.isArray(data.blocks) || !Array.isArray(data.variables) ||
            !Array.isArray(data.functions) || !Array.isArray(data.types) ||
            !isRecord(data.view) || !Number.isFinite(data.view.x) ||
            !Number.isFinite(data.view.y) || !Number.isFinite(data.view.zoom) ||
            data.view.zoom < 0.5 || data.view.zoom > 2) {
            fail('The workspace file is incomplete or invalid.');
        }

        const variableNames = new Set();
        const functionNames = new Set();
        const typeNames = new Set();
        const blockIds = new Set(
            Object.entries(NeonAPI.blocks)
                .filter(([id, config]) =>
                    !config.isUserVariable && !config.variableAction && !config.functionName &&
                    !config.customFunctionName && !config.isType && !config.typeName &&
                    !/^var\d*_custom_fn_/.test(id)
                )
                .map(([id]) => id)
        );
        const validateDefinitions = (entries, seen, description, validateEntry) => {
            entries.forEach(entry => {
                if (!Array.isArray(entry) || !validateEntry(entry)) fail(`The ${description} list is invalid.`);
                const name = entry[0];
                if (!isValidIdentifier(name) || seen.has(name)) fail(`The ${description} name "${name}" is invalid or duplicated.`);
                seen.add(name);
            });
        };
        validateDefinitions(data.variables, variableNames, 'variable', entry => typeof entry[0] === 'string' && typeof entry[1] === 'string');
        validateDefinitions(data.functions, functionNames, 'function', entry =>
            typeof entry[0] === 'string' && Array.isArray(entry[1]) &&
            entry[1].every(param => typeof param === 'string' && isValidIdentifier(param)) &&
            new Set(entry[1]).size === entry[1].length
        );
        validateDefinitions(data.types, typeNames, 'type', entry => typeof entry[0] === 'string' && typeof entry[1] === 'string');

        data.variables.forEach(([name]) => {
            blockIds.add(`user_var_${name}`);
            blockIds.add(`set_var_${name}`);
            blockIds.add(`change_var_${name}`);
        });
        data.functions.forEach(([name, params]) => {
            const id = `custom_fn_${name}`;
            blockIds.add(id);
            blockIds.add(`call_fn_${name}`);
            params.forEach((_, index) => blockIds.add(index === 0 ? `var_${id}` : `var${index + 1}_${id}`));
        });
        data.types.forEach(([name]) => {
            blockIds.add(`type_alias_${name}`);
            blockIds.add(`type_ref_${name}`);
        });

        const validateBlock = block => {
            if (!isRecord(block) || typeof block.id !== 'string' || !blockIds.has(block.id) ||
                typeof block.left !== 'string' || typeof block.top !== 'string' ||
                !Array.isArray(block.inputs) || !Array.isArray(block.children) ||
                (block.returnVal !== null && typeof block.returnVal !== 'string')) {
                fail('A block in the workspace file is invalid or unknown.');
            }
            block.inputs.forEach(input => {
                if (!isRecord(input)) fail('A block input in the workspace file is invalid.');
                if (input.type === 'value') {
                    if (typeof input.value !== 'string') fail('A block input value is invalid.');
                } else if (input.type === 'block') {
                    validateBlock(input.value);
                } else {
                    fail('A block input type is not supported.');
                }
            });
            block.children.forEach(children => {
                if (!Array.isArray(children)) fail('A block connection in the workspace file is invalid.');
                children.forEach(validateBlock);
            });
        };
        data.blocks.forEach(validateBlock);
    }

    function clearUserDefinitions() {
        const userBlockIds = new Set();
        userVariables.forEach((_, name) => {
            userBlockIds.add(`user_var_${name}`);
            userBlockIds.add(`set_var_${name}`);
            userBlockIds.add(`change_var_${name}`);
        });
        userFunctions.forEach((params, name) => {
            const id = `custom_fn_${name}`;
            userBlockIds.add(id);
            userBlockIds.add(`call_fn_${name}`);
            params.forEach((_, index) => userBlockIds.add(index === 0 ? `var_${id}` : `var${index + 1}_${id}`));
        });
        userTypes.forEach((_, name) => {
            userBlockIds.add(`type_alias_${name}`);
            userBlockIds.add(`type_ref_${name}`);
        });
        userBlockIds.forEach(id => delete NeonAPI.blocks[id]);
        document.querySelectorAll('#toolbox-category-panels .draggable').forEach(block => {
            if (userBlockIds.has(block.dataset.id)) block.remove();
        });
        userVariables.clear();
        userFunctions.clear();
        userTypes.clear();
    }

    window.saveWorkspace = function() {
        try {
            const fileData = createWorkspaceFileData();
            const blob = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'bloxd-workspace.bb';
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            const button = document.querySelector('button[onclick="saveWorkspace()"]');
            if (button) {
                const originalText = button.textContent;
                button.textContent = '✅ SAVED';
                setTimeout(() => { button.textContent = originalText; }, 1200);
            }
        } catch (error) {
            alert(`Could not save the Bloxd Block file: ${error.message}`);
        }
    };

    async function loadWorkspaceFile(file) {
        if (!file) return;
        try {
            if (!file.name.toLowerCase().endsWith('.bb')) throw new Error('Choose a Bloxd Block (.bb) file.');
            const data = JSON.parse(await file.text());
            validateWorkspaceFileData(data);

            const canvas = document.getElementById('block-canvas');
            canvas.replaceChildren();
            clearUserDefinitions();
            data.variables.forEach(([name, type]) => registerVariable(name, type));
            data.functions.forEach(([name, params]) => registerFunction(name, params.join(', ')));
            data.types.forEach(([name, value]) => registerType(name, value));
            panX = data.view.x;
            panY = data.view.y;
            currentZoom = data.view.zoom;
            updateTransform();
            data.blocks.forEach(blockData => {
                const block = reconstructBlock(blockData);
                if (!block) throw new Error(`Could not restore block "${blockData.id}".`);
                canvas.appendChild(block);
            });
            updateCodeView();
        } catch (error) {
            alert(`Could not load the Bloxd Block file: ${error.message}`);
        }
    }

    window.loadWorkspace = function() {
        const input = document.getElementById('workspace-file-input');
        if (!input) {
            alert('Workspace file picker is unavailable.');
            return;
        }
        input.click();
    };

    document.getElementById('workspace-file-input').addEventListener('change', event => {
        const [file] = event.target.files;
        loadWorkspaceFile(file).finally(() => { event.target.value = ''; });
    });

    // --- BLOXD COMPILER ---
    function getJSValue(socket) {
        if (!socket) return "0";
        const innerBlock = Array.from(socket.children).find(child => child.classList.contains('draggable'));
        if (innerBlock) {
            if (['action', 'control'].includes(innerBlock.dataset.type)) {
                return `(() => {\n${blockToJS(innerBlock)}})()`;
            }
            return blockToJS(innerBlock);
        }
        const input = socket.querySelector('input');
        if (input) {
            const val = input.value;
            if (socket.dataset.expression === 'true') return val.trim() || 'undefined';
            if(val === '') return '';
            if (!isNaN(val) && val.trim() !== '') return val;
            if (val === 'true' || val === 'false') return val;
            const escaped = val.replace(/"/g, '\\"');
            return `"${escaped}"`;
        }
        return "0";
    }

    function blockToJS(block, indentLevel = 1) {
        if (!block) return "";
        const id = block.dataset.id; const type = block.dataset.type; const indent = "  ".repeat(indentLevel);
        const sockets = Array.from(block.querySelectorAll('.input-socket')).filter(s => !s.classList.contains('return-socket') && s.closest('.draggable') === block);
        const getV = (i) => getJSValue(sockets[i]);
        
        if (type === 'item_map') {
            const slot = block.querySelector('.inner-slot'); const props = [];
            if (slot) {
                Array.from(slot.children).forEach(child => {
                    if (child.classList.contains('draggable') && !child.classList.contains('dragging')) {
                        if (child.dataset.type === 'attr_field') {
                            const val = getJSValue(child.querySelector('.input-socket'));
                            if (child.dataset.id === 'attr_name') props.push(`customDisplayName: ${val}`);
                            if (child.dataset.id === 'attr_desc') props.push(`description: ${val}`);
                        }
                        if (child.dataset.type === 'custom_attr_group') { props.push(blockToJS(child, indentLevel)); }
                    }
                });
            }
            return `{ ${props.join(', ')} }`;
        }
        if (type === 'custom_attr_group') {
            const slot = block.querySelector('.inner-slot'); const kvs = [];
            if (slot) {
                Array.from(slot.children).forEach(child => {
                    if (child.classList.contains('draggable') && !child.classList.contains('dragging')) {
                        if (child.dataset.type === 'attr_kv') { kvs.push(blockToJS(child, indentLevel)); }
                    }
                });
            }
            return `customAttributes: { ${kvs.join(', ')} }`;
        }
        if (type === 'attr_kv') {
            const keyVal = sockets[0].querySelector('input').value; const valCode = getV(1); 
            return `"${keyVal}": ${valCode}`;
        }
        if (type === 'ticket') {
            if (id === 'styledString') return getV(0);
            if (id === 'styledTranslatedText') {
                const params = getV(1);
                return `{ translationKey: ${getV(0)}${params && params !== 'undefined' ? `, params: ${params}` : ''} }`;
            }
            if (id === 'styledIcon') {
                return `{ icon: ${getV(0)}, style: { color: ${getV(1)} } }`;
            }
            if (id === 'styledProgressBar' || id === 'styledKeyBinding') return getV(0);
            const txt = getV(0); const col = getV(1); const fw = getV(2);
            return `{ str: ${txt}, style: { color: ${col}, fontWeight: ${fw} } }`;
        }
        if (type === 'square_list') {
            const slot = block.querySelector('.inner-slot'); const items = [];
            if (slot) {
                Array.from(slot.children).forEach(child => {
                    if (child.classList.contains('draggable') && !child.classList.contains('dragging')) {
                        const js = blockToJS(child, indentLevel); if (js) items.push(js);
                    }
                });
            }
            return `[${items.join(', ')}]`;
        }
        if (type === 'vec3') {
            const safeVal = (i) => { let v = getV(i); if (v === '' || v === '""') return '0'; return v; };
            return `[${safeVal(0)}, ${safeVal(1)}, ${safeVal(2)}]`;
        }
        if (type === 'reporter' || type === 'boolean' || type === 'string') {
            if (NeonAPI.blocks[id] && NeonAPI.blocks[id].isVar) return block.innerText;
            if (NeonAPI.blocks[id] && NeonAPI.blocks[id].isType) return block.innerText;
            if (NeonAPI.blocks[id] && NeonAPI.blocks[id].apiMethod) {
                return `api.${NeonAPI.blocks[id].apiMethod}(${sockets.map((_, i) => getV(i)).join(', ')})`;
            }
            const opMap = { 'add': '+', 'sub': '-', 'mul': '*', 'div': '/', 'mod': '%', 'eq': '==', 'less': '<', 'greater': '>', 'and': '&&', 'or': '||' };
            if (opMap[id]) return `(${getV(0)} ${opMap[id]} ${getV(1)})`;
            if (id === 'not') return `!(${getV(0)})`;
            if (id === 'random') {
                const min = getV(0);
                const max = getV(1);
                return `Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min}`;
            }
            if (id === 'x' || id === 'y' || id === 'z') {
                const index = { x: 0, y: 1, z: 2 }[id];
                return `(${getV(0)})[${index}]`;
            }
            if (id === 'getHealth') return `api.getHealth(${getV(0)})`;
            if (id === 'getPos') return `api.getPosition(${getV(0)})`;
            if (id === 'isCrouching') return `api.isPlayerCrouching(${getV(0)})`;
            if (id === 'isAlive') return `api.isAlive(${getV(0)})`;
            return `"${block.innerText}"`;
        }

        let code = "";
        if (type === 'type_definition') {
            const typeName = NeonAPI.blocks[id].typeName;
            code = `${indent}type ${typeName} = ${getV(0)};\n`;
        }
        else if (NeonAPI.blocks[id] && NeonAPI.blocks[id].variableAction === 'set') {
            const name = NeonAPI.blocks[id].variableName;
            code = `${indent}${name} = ${getV(0)};\n`;
        }
        else if (NeonAPI.blocks[id] && NeonAPI.blocks[id].variableAction === 'change') {
            code = `${indent}${NeonAPI.blocks[id].variableName} += ${getV(0)};\n`;
        }
        else if (NeonAPI.blocks[id] && NeonAPI.blocks[id].variableAction === 'assign') {
            code = `${indent}${NeonAPI.blocks[id].variableName} = ${getV(0)};\n`;
        }
        else if (NeonAPI.blocks[id] && NeonAPI.blocks[id].customFunctionName) {
            code = `${indent}${NeonAPI.blocks[id].customFunctionName}(${sockets.map((_, i) => getV(i)).join(', ')});\n`;
        }
        else if (NeonAPI.blocks[id] && NeonAPI.blocks[id].apiMethod) {
            code = `${indent}api.${NeonAPI.blocks[id].apiMethod}(${sockets.map((_, i) => getV(i)).join(', ')});\n`;
        }
        else if (id === 'api_setpos') code = `${indent}api.setPosition(${getV(0)}, ${getV(1)}, ${getV(2)}, ${getV(3)});\n`;
        else if (id === 'api_setvel') code = `${indent}api.setVelocity(${getV(0)}, ${getV(1)}, ${getV(2)}, ${getV(3)});\n`;
        else if (id === 'api_impulse') code = `${indent}api.applyImpulse(${getV(0)}, ${getV(1)}, ${getV(2)}, ${getV(3)});\n`;
        else if (id === 'api_sethealth') code = `${indent}api.setHealth(${getV(0)}, ${getV(1)});\n`;
        else if (id === 'api_msg') code = `${indent}api.sendMessage(${getV(0)}, ${getV(1)});\n`;
        else if (id === 'api_broadcast') code = `${indent}api.broadcastMessage(${getV(0)});\n`;
        else if (id === 'api_kill') code = `${indent}api.killLifeform(${getV(0)});\n`;
        else if (id === 'api_log') code = `${indent}console.log(${getV(0)});\n`;
        else if (id === 'api_kick') code = `${indent}api.kickPlayer(${getV(0)}, ${getV(1)});\n`;
        else if (id === 'api_show_styled') code = `${indent}api.sendMessage(${getV(0)}, ${getV(1)});\n`;
        else if (id === 'giveItem') code = `${indent}api.giveItem(${getV(0)}, ${getV(1)}, ${getV(2)}, ${getV(3)});\n`;
        
        else if (id === 'if') {
            const innerCode = parseSequence(block.querySelector('.inner-slot'), indentLevel + 1);
            code = `${indent}if (${getV(0)}) {\n${innerCode}${indent}}\n`;
        }
        else if (id === 'ifelse') {
            const slots = block.querySelectorAll('.inner-slot');
            code = `${indent}if (${getV(0)}) {\n${parseSequence(slots[0], indentLevel+1)}${indent}} else {\n${parseSequence(slots[1], indentLevel+1)}${indent}}\n`;
        }
        else if (id === 'repeat') {
            const loopVar = "i_" + indentLevel;
            code = `${indent}for (let ${loopVar} = 0; ${loopVar} < ${getV(0)}; ${loopVar}++) {\n${parseSequence(block.querySelector('.inner-slot'), indentLevel+1)}${indent}}\n`;
        }
        return code;
    }

    function parseSequence(container, indentLevel = 1) {
        if (!container) return "";
        let seqCode = "";
        const children = Array.from(container.children);
        children.forEach(child => {
            if (child.classList.contains('draggable') && !child.classList.contains('dragging')) {
                if (['action', 'control'].includes(child.dataset.type)) {
                    seqCode += blockToJS(child, indentLevel);
                }
            }
        });
        return seqCode;
    }

    function updateCodeView() {
        let fullCode = `// Bloxd.io World Code Generator V7.0.0 (${codeMode === 'typescript' ? 'TypeScript' : 'JavaScript'})\n\n`;
        const canvas = document.getElementById('block-canvas');
        const getVariableInitializer = name => {
            const setter = Array.from(canvas.querySelectorAll('.draggable')).find(block => {
                const config = NeonAPI.blocks[block.dataset.id];
                return config && config.variableAction === 'set' && config.variableName === name;
            });
            if (!setter) return null;
            const socket = Array.from(setter.querySelectorAll('.input-socket'))
                .find(item => item.closest('.draggable') === setter);
            return socket ? getJSValue(socket) : null;
        };
        if (codeMode === 'typescript') {
            Array.from(canvas.children).filter(block => block.dataset.type === 'type_definition')
                .forEach(block => { fullCode += blockToJS(block, 0); });
            userVariables.forEach((type, name) => {
                const value = getVariableInitializer(name);
                fullCode += `var ${name}: ${type}${value === null ? '' : ` = ${value}`};\n`;
            });
            if (userVariables.size) fullCode += '\n';
        } else {
            userVariables.forEach((_, name) => {
                const value = getVariableInitializer(name);
                fullCode += `var ${name}${value === null ? '' : ` = ${value}`};\n`;
            });
            if (userVariables.size) fullCode += '\n';
        }
        const events = document.querySelectorAll('#block-canvas .block-start[data-type="event"]');
        events.forEach(evt => {
            const id = evt.dataset.id;
            const args = Array.from(evt.querySelectorAll('.start-top .local-var'))
                .map(param => param.textContent.trim())
                .join(', ');
            const outputArgs = args;
            const slot = evt.querySelector('.inner-slot');
            const body = parseSequence(slot, 1);
            let returnCode = '';
            const returnSocket = evt.querySelector('.return-socket');
            if (returnSocket) {
                const returnInput = returnSocket.querySelector('input');
                let val = returnSocket.dataset.expression === 'true' && returnInput && returnInput.value.trim()
                    ? returnInput.value.trim()
                    : getJSValue(returnSocket);
                if (returnSocket.classList.contains('vec3') && (val === '' || val === '""')) { val = '[0, 0, 0]'; }
                if (val !== '') { returnCode = `  return ${val};\n`; } else { returnCode = `  return;\n`; }
            }
            fullCode += `${id} = (${outputArgs}) => {\n${body}${returnCode}};\n\n`;
        });
        const functionBlocks = document.querySelectorAll('#block-canvas .block-start[data-type="function"]');
        const definedFunctions = new Set();
        functionBlocks.forEach(block => {
            const config = NeonAPI.blocks[block.dataset.id];
            const name = config.functionName;
            definedFunctions.add(name);
            const args = Array.from(block.querySelectorAll('.start-top .local-var'))
                .map(param => param.textContent.trim());
            const outputArgs = codeMode === 'typescript' ? args.map(arg => `${arg}: any`) : args;
            const signature = codeMode === 'typescript'
                ? `function ${name}(${outputArgs.join(', ')}): void`
                : `function ${name}(${outputArgs.join(', ')})`;
            fullCode += `${signature} {\n`;
            fullCode += parseSequence(block.querySelector('.inner-slot'), 1);
            fullCode += '}\n\n';
        });
        const calledFunctions = new Set(
            Array.from(canvas.querySelectorAll('.draggable'))
                .map(block => NeonAPI.blocks[block.dataset.id])
                .filter(config => config && config.customFunctionName)
                .map(config => config.customFunctionName)
        );
        calledFunctions.forEach(name => {
            if (definedFunctions.has(name)) return;
            const params = userFunctions.get(name) || [];
            const args = codeMode === 'typescript' ? params.map(param => `${param}: any`) : params;
            const signature = codeMode === 'typescript'
                ? `function ${name}(${args.join(', ')}): void`
                : `function ${name}(${args.join(', ')})`;
            fullCode += `${signature} {\n}\n\n`;
        });
        if (events.length === 0 && functionBlocks.length === 0) fullCode += "// Drag an Event Block (e.g. Player Join) to the workspace!";
        if (typeof editor !== 'undefined') { const cur = editor.getCursor(); editor.setValue(fullCode); editor.setCursor(cur); }
    }

    // --- TUTORIAL & EXAMPLES SYSTEM ---
    const examples = {
        'welcome': [
            {id:'onPlayerJoin', left:'50px', top:'50px', inputs:[], children:[
                [{id:'api_msg', inputs:[{type:'block', value:{id:'var_onPlayerJoin'}}, {type:'value', value:'Welcome to my server!'}]}]
            ]}
        ],
        'lava': [
            {id:'tick', left:'50px', top:'50px', inputs:[], children:[
                [{id:'if', inputs:[{type:'block', value:{id:'less', inputs:[
                    {type:'block', value:{id:'var_tick'}}, {type:'value', value:'0'}
                ]}}], children:[
                    [{id:'api_kill', inputs:[{type:'value', value:'0'}]}]
                ]}]
            ]}
        ],
        'jump': [
            {id:'onPlayerJump', left:'50px', top:'50px', inputs:[], children:[
                [{id:'api_impulse', inputs:[
                    {type:'block', value:{id:'var_onPlayerJump'}}, 
                    {type:'value', value:'0'}, {type:'value', value:'15'}, {type:'value', value:'0'}
                ]}]
            ]}
        ]
    };

    function loadExample(key) {
        if(examples[key]) {
            const canvas = document.getElementById('block-canvas'); canvas.innerHTML = '';
            examples[key].forEach(blockData => { const block = reconstructBlock(blockData); if (block) canvas.appendChild(block); });
            updateCodeView();
            document.getElementById('examples-modal').style.display = 'none';
        }
    }
    function showExamples() { document.getElementById('examples-modal').style.display = 'flex'; }

    // TUTORIAL WIZARD
    let tutStep = 0;
    const tutData = [
        { el: '#toolbox', title: "1. The Toolbox", text: "Here you find all blocks. Green blocks are EVENTS (Start). Blue are ACTIONS. Drag 'Player Join' to the workspace!" },
        { el: '#workspace', title: "2. The Workspace", text: "This is where you build. Snap blocks together. Try connecting 'Send Message' inside 'Player Join'." },
        { el: '#right-panel', title: "3. The Code", text: "Neon Scratch writes JavaScript for you here. Copy this code and paste it into your Bloxd.io world settings!" }
    ];

    function startTutorial() {
        tutStep = 0;
        document.getElementById('tutorial-modal').style.display = 'flex';
        updateTutorialUI();
    }
    function closeTutorial() {
        document.getElementById('tutorial-modal').style.display = 'none';
        document.getElementById('highlight-box').style.display = 'none';
        localStorage.setItem('neon_tut_complete', 'true');
    }
    function nextTutorialStep() {
        tutStep++;
        if(tutStep >= tutData.length) { closeTutorial(); return; }
        updateTutorialUI();
    }
    function updateTutorialUI() {
        const step = tutData[tutStep];
        document.getElementById('tut-title').innerText = step.title;
        document.getElementById('tut-body').innerText = step.text;
        
        const target = document.querySelector(step.el);
        const rect = target.getBoundingClientRect();
        const hl = document.getElementById('highlight-box');
        hl.style.display = 'block';
        hl.style.left = rect.left + 'px'; hl.style.top = rect.top + 'px';
        hl.style.width = rect.width + 'px'; hl.style.height = rect.height + 'px';
        
        document.getElementById('tut-next-btn').innerText = (tutStep === tutData.length - 1) ? "Finish" : "Next";
    }

    // REGISTRATIONS
    function formatBlockLabel(name, prefix = '') {
        const label = name
            .replace(prefix, '')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        return label.charAt(0).toUpperCase() + label.slice(1);
    }

    const callbackDefinitions = [
        { id: 'tick', params: ['ms'] },
        { id: 'onClose', params: ['serverIsShuttingDown'] },
        { id: 'onPlayerJoin', params: ['playerId'] },
        { id: 'onPlayerLeave', params: ['playerId'] },
        { id: 'onPlayerJump', params: ['playerId'] },
        { id: 'onRespawnRequest', params: ['playerId'] },
        { id: 'playerCommand', params: ['playerId', 'command'] },
        { id: 'onPlayerChat', params: ['playerId', 'message'] },
        { id: 'onPlayerAttemptChangeBlock', params: ['playerId', 'x', 'y', 'z', 'fromBlock', 'toBlock', 'droppedItem', 'fromBlockInfo', 'toBlockInfo'] },
        { id: 'onPlayerChangeBlock', params: ['playerId', 'x', 'y', 'z', 'fromBlock', 'toBlock', 'droppedItem', 'fromBlockInfo', 'toBlockInfo', 'dropsPrevented'] },
        { id: 'onPlayerDropItem', params: ['playerId', 'x', 'y', 'z', 'itemName', 'itemAmount', 'fromIdx'] },
        { id: 'onPlayerPickedUpItem', params: ['playerId', 'itemName', 'itemAmount', 'itemEntityId'] },
        { id: 'onPlayerSelectInventorySlot', params: ['playerId', 'slotIndex'] },
        { id: 'onBlockStand', params: ['playerId', 'x', 'y', 'z', 'blockName'] },
        { id: 'onBlockStandStart', params: ['playerId', 'x', 'y', 'z', 'blockName'] },
        { id: 'onBlockStandStop', params: ['playerId', 'x', 'y', 'z', 'blockName'] },
        { id: 'onPlayerAttemptCraft', params: ['playerId', 'itemName', 'craftingIdx', 'craftTimes'] },
        { id: 'onPlayerCraft', params: ['playerId', 'itemName', 'craftingIdx', 'recipe', 'craftTimes'] },
        { id: 'onPlayerAttemptOpenChest', params: ['playerId', 'x', 'y', 'z', 'isMoonstoneChest', 'isIronChest'] },
        { id: 'onPlayerOpenedChest', params: ['playerId', 'x', 'y', 'z', 'isMoonstoneChest', 'isIronChest'] },
        { id: 'onPlayerMoveItemOutOfInventory', params: ['playerId', 'itemName', 'itemAmount', 'fromIdx', 'movementType'] },
        { id: 'onPlayerMoveInvenItem', params: ['playerId', 'fromIdx', 'toStartIdx', 'toEndIdx', 'amt'] },
        { id: 'onPlayerMoveItemIntoIdxs', params: ['playerId', 'start', 'end', 'moveIdx', 'itemAmount'] },
        { id: 'onPlayerSwapInvenSlots', params: ['playerId', 'i', 'j'] },
        { id: 'onPlayerMoveInvenItemWithAmt', params: ['playerId', 'i', 'j', 'amt'] },
        { id: 'onPlayerAttemptAltAction', params: ['playerId', 'x', 'y', 'z', 'block', 'targetEId'] },
        { id: 'onPlayerAltAction', params: ['playerId', 'x', 'y', 'z', 'block', 'targetEId'] },
        { id: 'onPlayerClick', params: ['playerId', 'wasAltClick', 'x', 'y', 'z', 'block', 'targetEId'] },
        { id: 'onPlayerClickUp', params: ['playerId', 'wasAltClick', 'x', 'y', 'z', 'block', 'targetEId'] },
        { id: 'onClientOptionUpdated', params: ['playerId', 'option', 'value'] },
        { id: 'onMobSettingUpdated', params: ['mobId', 'setting', 'value'] },
        { id: 'onInventoryUpdated', params: ['playerId'] },
        { id: 'onChestUpdated', params: ['initiatorEId', 'isMoonstoneChest', 'x', 'y', 'z'] },
        { id: 'onWorldAttemptChangeBlock', params: ['x', 'y', 'z', 'fromBlock', 'toBlock', 'initiatorDbId', 'extraInfo'] },
        { id: 'onWorldChangeBlock', params: ['x', 'y', 'z', 'fromBlock', 'toBlock', 'initiatorDbId', 'extraInfo', 'dropsPrevented'] },
        { id: 'onCreateBloxdMeshEntity', params: ['eId', 'type', 'initiatorId'] },
        { id: 'onEntityCollision', params: ['eId', 'otherEId'] },
        { id: 'onPlayerAttemptSpawnMob', params: ['playerId', 'mobType', 'x', 'y', 'z'] },
        { id: 'onWorldAttemptSpawnMob', params: ['mobType', 'x', 'y', 'z'] },
        { id: 'onPlayerSpawnMob', params: ['playerId', 'mobId', 'mobType', 'x', 'y', 'z', 'mobHerdId', 'playSoundOnSpawn'] },
        { id: 'onWorldSpawnMob', params: ['mobId', 'mobType', 'x', 'y', 'z', 'mobHerdId', 'playSoundOnSpawn'] },
        { id: 'onWorldAttemptDespawnMob', params: ['mobId'] },
        { id: 'onMobDespawned', params: ['mobId'] },
        { id: 'onPlayerAttemptSpawnVehicle', params: ['playerId', 'vehicleType', 'x', 'y', 'z'] },
        { id: 'onWorldAttemptSpawnVehicle', params: ['vehicleType', 'x', 'y', 'z'] },
        { id: 'onPlayerSpawnVehicle', params: ['playerId', 'vehicleEId', 'vehicleType', 'x', 'y', 'z'] },
        { id: 'onWorldSpawnVehicle', params: ['vehicleEId', 'vehicleType', 'x', 'y', 'z'] },
        { id: 'onVehicleDespawned', params: ['vehicleEId', 'vehicleType'] },
        { id: 'onEntityDeleted', params: ['eId', 'entityType'] },
        { id: 'onPlayerAttack', params: ['playerId'] },
        { id: 'onPlayerDamagingOtherPlayer', params: ['attackingPlayer', 'damagedPlayer', 'damageDealt', 'withItem', 'bodyPartHit', 'damagerDbId', 'damageInfo'] },
        { id: 'onPlayerDamagingMob', params: ['playerId', 'mobId', 'damageDealt', 'withItem', 'damagerDbId', 'damageInfo'] },
        { id: 'onMobDamagingPlayer', params: ['attackingMob', 'damagedPlayer', 'damageDealt', 'withItem', 'damageInfo'] },
        { id: 'onMobDamagingOtherMob', params: ['attackingMob', 'damagedMob', 'damageDealt', 'withItem', 'damageInfo'] },
        { id: 'onAttemptKillPlayer', params: ['killedPlayer', 'attackingLifeform'] },
        { id: 'onPlayerKilledOtherPlayer', params: ['attackingPlayer', 'killedPlayer', 'damageDealt', 'withItem'] },
        { id: 'onMobKilledPlayer', params: ['attackingMob', 'killedPlayer', 'damageDealt', 'withItem'] },
        { id: 'onPlayerKilledMob', params: ['playerId', 'mobId', 'damageDealt', 'withItem'] },
        { id: 'onMobKilledOtherMob', params: ['attackingMob', 'killedMob', 'damageDealt', 'withItem'] },
        { id: 'onPlayerPotionEffect', params: ['initiatorId', 'targetId', 'effectName'] },
        { id: 'onPlayerDamagingMeshEntity', params: ['playerId', 'damagedId', 'damageDealt', 'withItem'] },
        { id: 'onPlayerBreakMeshEntity', params: ['playerId', 'entityId'] },
        { id: 'onPlayerUsedThrowable', params: ['playerId', 'throwableName', 'thrownEntityId'] },
        { id: 'onPlayerThrowableHitTerrain', params: ['playerId', 'throwableName', 'thrownEntityId'] },
        { id: 'onTouchscreenActionButton', params: ['playerId', 'touchDown'] },
        { id: 'onTaskClaimed', params: ['playerId', 'taskId', 'isPromoTask', 'claimedRewards'] },
        { id: 'onChunkLoaded', params: ['chunkId', 'chunk', 'wasPersistedChunk'] },
        { id: 'onPlayerRequestChunk', params: ['playerId', 'chunkX', 'chunkY', 'chunkZ', 'chunkId'] },
        { id: 'onItemDropCreated', params: ['itemEId', 'itemName', 'itemAmount', 'x', 'y', 'z'] },
        { id: 'onPlayerStartChargingItem', params: ['playerId', 'itemName'] },
        { id: 'onPlayerFinishChargingItem', params: ['playerId', 'used', 'itemName', 'duration'] },
        { id: 'onPlayerAttemptFish', params: ['playerId', 'rodName', 'x', 'y', 'z'] },
        { id: 'onPlayerSucceededFishCatch', params: ['playerId', 'rodName', 'x', 'y', 'z', 'caughtItemName'] },
        { id: 'onPlayerFailedFishCatch', params: ['playerId', 'rodName', 'x', 'y', 'z', 'caughtItemName'] },
        { id: 'onPlayerFinishQTE', params: ['playerId', 'qteId', 'result'] },
        { id: 'onPlayerToggledShopMenu', params: ['playerId'] },
        { id: 'onPlayerPlayedEmote', params: ['playerId', 'emoteId'] },
        { id: 'onPlayerEnteredVehicle', params: ['playerId', 'vehicleType', 'vehicleEId'] },
        { id: 'onPlayerExitedVehicle', params: ['playerId', 'vehicleType', 'vehicleEId'] },
        { id: 'onPlayerBoughtShopItem', params: ['playerId', 'categoryKey', 'itemKey', 'item', 'userInput'] },
        { id: 'onPlayerPressedButton', params: ['playerId', 'buttonId'] },
        { id: 'onPlayerReleasedButton', params: ['playerId', 'buttonId'] },
        { id: 'onUiRequestResponded', params: ['playerId', 'id', 'response'] },
        { id: 'doPeriodicSave', params: [] }
    ];
    const callbacksWithReturn = new Set([
        'onAttemptKillPlayer', 'onPlayerAttemptChangeBlock', 'onPlayerChangeBlock',
        'onPlayerAttemptCraft', 'onPlayerAttemptFish', 'onPlayerAttemptOpenChest',
        'onPlayerAttemptSpawnMob', 'onWorldAttemptSpawnMob', 'onWorldAttemptDespawnMob',
        'onPlayerAttemptSpawnVehicle', 'onWorldAttemptSpawnVehicle', 'onPlayerAttemptAltAction',
        'onPlayerChat', 'onPlayerDamagingMob', 'onPlayerDamagingOtherPlayer',
        'onMobDamagingPlayer', 'onMobDamagingOtherMob', 'onMobKilledOtherMob',
        'onMobKilledPlayer', 'onPlayerKilledOtherPlayer', 'onPlayerKilledMob',
        'onPlayerDropItem', 'onPlayerMoveInvenItem', 'onPlayerMoveInvenItemWithAmt',
        'onPlayerMoveItemIntoIdxs', 'onPlayerMoveItemOutOfInventory', 'onPlayerSwapInvenSlots',
        'onPlayerPotionEffect', 'onPlayerStartChargingItem', 'onPlayerSucceededFishCatch',
        'onWorldAttemptChangeBlock', 'onWorldChangeBlock', 'onRespawnRequest',
        'onTaskClaimed', 'playerCommand'
    ]);
    callbackDefinitions.forEach(callback => {
        const hasReturn = callbacksWithReturn.has(callback.id);
        NeonAPI.register({
            id: callback.id,
            type: 'EVENT',
            label: formatBlockLabel(callback.id, 'on'),
            params: callback.params,
            hasReturn,
            returnType: callback.id === 'playerCommand' ? 'boolean' : 'expression',
            defReturn: callback.id === 'playerCommand' ? 'false' : '',
            desc: `${callback.id}(${callback.params.join(', ')})${hasReturn ? '. Enter a JavaScript expression to return a value.' : ''}`
        });
    });

    NeonAPI.register({ id: 'api_setpos', type: 'ACTION', label: 'Set Pos', inputs: [{label:'ID',def:'playerId'}, {label:'X',def:'0'}, {label:'Y',def:'0'}, {label:'Z',def:'0'}], desc: "Teleports entity to x,y,z." });
    NeonAPI.register({ id: 'api_setvel', type: 'ACTION', label: 'Set Velocity', inputs: [{label:'ID',def:'playerId'}, {label:'X',def:'0'}, {label:'Y',def:'0'}, {label:'Z',def:'0'}], desc: "Sets movement speed/direction." });
    NeonAPI.register({ id: 'api_impulse', type: 'ACTION', label: 'Apply Impulse', inputs: [{label:'ID',def:'playerId'}, {label:'X',def:'0'}, {label:'Y',def:'10'}, {label:'Z',def:'0'}], desc: "Pushes the entity (Knockback)." });
    NeonAPI.register({ id: 'api_sethealth', type: 'ACTION', label: 'Set Health', inputs: [{label:'ID',def:'playerId'}, {label:'HP',def:'100'}], desc: "Sets HP (0-100)." });
    NeonAPI.register({ id: 'api_msg', type: 'ACTION', label: 'Send Message', inputs: [{label:'ID',def:'playerId'}, {label:'Text',def:'Hello'}], desc: "Sends chat message to one player." });
    NeonAPI.register({ id: 'api_broadcast', type: 'ACTION', label: 'Broadcast', inputs: [{label:'Text',def:'Welcome'}], desc: "Sends chat message to EVERYONE." });
    NeonAPI.register({ id: 'api_kill', type: 'ACTION', label: 'Kill', inputs: [{label:'ID',def:'playerId'}], desc: "Instantly kills the entity." });
    NeonAPI.register({ id: 'api_kick', type: 'ACTION', label: 'Kick', inputs: [{label:'ID',def:'playerId'}, {label:'Reason',def:'Bye'}], desc: "Removes player from server." });
    NeonAPI.register({ id: 'api_log', type: 'ACTION', label: 'Log', inputs: ['Info'], desc: "Prints to browser console (F12)." });

    NeonAPI.register({ id: 'giveItem', type: 'ACTION', label: 'Give Item', inputs: [{label:'ID',def:'playerId'}, {label:'Item',def:'wood'}, {label:'Amount',def:'1'}, {label:'Attr',def:''}], desc: "Gives item stack to player." });

    const apiMethodCatalog = `
addCustomKillfeedMessage|killer,victim,withItem|0
addFollowingEntityToPlayer|playerId,eId,offset,followsPlayerRotation|0
addQTE|playerId,qteParameters|1
addUiRequest|playerId,parameters,timeoutAfterMs|1
addUiRequestPopup|playerId,requestText|1
animateEntity|entityId,animation,initialTimeFraction,animationSpeed|0
applyAuraChange|playerId,auraDiff|1
applyEffect|lifeformId,effectName,duration,customEffectInfo|0
applyHealthChange|lifeformId,changeAmount,whoDidDamage,broadcastLifeformHurt|1
applyImpulse|eId,xImpulse,yImpulse,zImpulse|0
applyMeleeHit|hittingEId,hitEId,dirFacing,bodyPartHit,overrides|1
attemptApplyDamage|options|1
attemptCreateAudioEntity|x,y,z,soundName,volume,options|1
attemptCreateMeshEntity|type,opts,name,physicsOptions,initiatorId|1
attemptCreateThrowable|throwerEId,itemName,position,direction,velocityMult,damageMult,gravityMult,attributes|1
attemptSpawnMob|mobType,x,y,z,opts|1
attemptSpawnVehicle|vehicleType,x,y,z,opts|1
attemptWorldChangeBlock|initiatorDbId,x,y,z,blockName,extraInfo|1
blockCoordToChunkId|pos|1
blockIdToBlockName|blockId|1
blockNameToBlockId|blockName,allowInvalidBlock|1
broadcastMessage|message,style|0
broadcastSound|soundName,volume,rate,posSettings,exceptPlayerId|0
calcExplosionForce|eId,explosionType,knockbackFactor,explosionRadius,explosionPos,ignoreProjectiles|1
canOpenStandardChest|playerId,chestX,chestY,chestZ|1
changePlayerIntoSkin|playerId,cosmeticType,cosmeticName|0
checkValid|entityId|1
chunkIdToBotLeftCoord|chunkId|1
clearDirectionArrow|playerId,id|0
clearInventory|playerId|0
clearKillstreak|playerId|0
closeChestForPlayer|playerId|0
configureShopCategory|categoryKey,config|0
configureShopCategoryForPlayer|playerId,categoryKey,config|0
copyChunk|fromPos,toPos|0
createEnchantmentAttributesForItem|itemName,enchantmentLevel|1
createItemDrop|x,y,z,itemName,amount,mergeItems,attributes,timeTillDespawn,dropperId,options|1
createMobHerd||1
createShopItem|categoryKey,itemKey,item|0
createShopItemForPlayer|playerId,categoryKey,itemKey,item|0
deleteAllItems||0
deleteAllLobbyDbValues||0
deleteAllPlayerDbValues|playerId|0
deleteAudioEntity|eId|0
deleteCurrency|playerId,currencyId|0
deleteEntity|eId|1
deleteItemDrop|itemId|0
deleteLobbyDbValue|key|0
deleteMeshEntity|eId|1
deletePlayerDbValue|playerId,key|0
deleteQTE|playerId,id|0
deleteShopItem|categoryKey,itemKey|0
deleteThrowable|eId|1
deleteUiRequest|playerId,id|0
despawnMob|mobId|0
despawnVehicle|vehicleId|0
editItemCraftingRecipes|playerId,itemName,recipesForItem|0
exitPlayerVehicle|playerId|0
findItem|playerId,itemName|1
findStandardChestItem|chestPos,itemName|1
forceRespawn|playerId,respawnPos|0
getAuraInfo|playerId|1
getBlock|x,y,z|1
getBlockCoordinatesPlayerStandingOn|playerId|1
getBlockData|x,y,z|1
getBlockId|x,y,z|1
getBlockSolidity|x,y,z|1
getBlockTypesPlayerStandingOn|playerId|1
getClientOption|playerId,option|1
getCraftingRecipesForPlayer|playerId|1
getCurrencyAmount|playerId,currencyId|1
getCurrentKillstreak|playerId|1
getDefaultMobSetting|mobType,setting|1
getEffectLevel|lifeformId,name|1
getEffects|lifeformId|1
getEmptyChunk||1
getEntitiesInRect|minCoords,maxCoords|1
getEntityHeading|entityId|1
getEntityName|entityId|1
getEntityRotation|entityId|1
getEntityType|entityId|1
getHealth|entityId|1
getHeldItem|playerId|1
getInitialItemMetadata|itemName|1
getInventoryFreeSlotCount|playerId|1
getInventoryItemAmount|playerId,itemName|1
getItemAmount|itemId|1
getItemDropName|itemEId|1
getItemIDsOverlappingWithPlayer|playerId|1
getItemSlot|playerId,itemSlotIndex|1
getItemStat|lifeformId,itemName,stat|1
getLifeformScale|lifeformId|1
getLobbyDbValue|key|1
getLobbyName||1
getLobbyType||1
getMetaInfo|blockName|1
getMobAiState|mobId|1
getMobDbId|mobId|1
getMobIds||1
getMobSetting|mobId,setting,returnDefaultIfNotOverridden|1
getMoonstoneChestItems|playerId|1
getMoonstoneChestItemSlot|playerId,idx|1
getNumMobs||1
getNumPlayers||1
getOtherEntitySetting|relevantPlayerId,targetedEntityId,settingName|1
getPlayerCosmetic|playerId,cosmeticType|1
getPlayerDbId|playerId|1
getPlayerDbValue|playerId,key|1
getPlayerFacingInfo|playerId|1
getPlayerGamemode|playerId|1
getPlayerId|playerName|1
getPlayerIdFromDbId|dbId|1
getPlayerIds||1
getPlayerPartyWhenJoined|playerId|1
getPlayerPhysicsState|playerId|1
getPlayerTargetInfo|playerId|1
getPosition|entityId|1
getQueuedStatus|id|1
getSchematicDimensions|schematicPath|1
getSelectedInventorySlotI|playerId|1
getShieldAmount|entityId|1
getStandardChestFreeSlotCount|chestPos|1
getStandardChestItemAmount|chestPos,itemName|1
getStandardChestItems|chestPos|1
getStandardChestItemSlot|chestPos,idx|1
getUnitCoordinatesLifeformWithin|lifeformId|1
getVariation||1
getVehicleSeats|vehicleEId|1
getVehicleSetting|vehicleEId,setting,returnDefaultIfNotOverridden|1
getVelocity|eId|1
giveCurrencyAmount|playerId,currencyId,amount|0
giveItem|playerId,itemName,itemAmount,attributes|1
giveStandardChestItem|chestPos,itemName,itemAmount,playerId,attributes|1
hasActiveQTE|playerId|1
hasEffect|lifeformId,name,atOrAboveLevel|1
hasItem|playerId,itemName|1
initiateMiddleScreenBar|playerId,duration,chargeExpiresAutomatically,horizontalBarRemOffset|0
inventoryIsFull|playerId|1
isAlive|lifeformId|1
isBlockInLoadedChunk|x,y,z|1
isInsideRect|coordsToCheck,pos1,pos2,addOneToMax|1
isMobile|playerId|1
isNearInterrupt||1
isPlayerCrouching|playerId|1
isPublicLobby||1
isUsingCustomGameTexturePack|playerId|1
kickPlayer|playerId,reason|0
killLifeform|lifeformId,whoKilled|0
matchmakePlayer|playerId,game,lobbyName|0
matchmakeToVariation|playerId,varname|0
now||1
openChestForPlayer|playerId,x,y,z|0
openShop|playerId,toggle,forceCategoryKey,onlyIfNonEmpty|0
passifyHostility|mobId,targetLifeformId|0
playClientPredictedSound|soundName,volume,rate,posSettings,predictedBy|0
playerIsInGame|playerId|1
playerIsLoggedIn|playerId|1
playParticleEffect|opts,clientPredictedBy|0
playSound|playerId,soundName,volume,rate,posSettings|0
preventFallDamageNextGrounding|playerId|0
progressBarUpdate|playerId,toFraction,toDuration|0
queueCrosshairText|playerId,text,duration|1
queueMiddleTextLower|playerId,text,duration|1
queueMiddleTextUpper|playerId,text,duration|1
raycastForBlock|fromPos,dirVec|1
registerAnalyticsEvent|playerId,eventType,eventValue,gameCategoryId,gameStartTimeMs,position,numericValue|0
registerAnalyticsPlayerPosition|playerId,gameCategoryId,gameStartTimeMs,position|0
removeAppliedSkin|playerId|0
removeEffect|lifeformId,name|0
removeFollowingEntityFromPlayer|playerId,entityEId|0
removeFromQueue|id|0
removeItemCraftingRecipes|playerId,itemName|0
removeItemName|playerId,itemName,amount|0
removeItemNameFromStandardChest|chestPos,itemName,amount,playerId|0
removeMiddleScreenBar|playerId|0
resetCanChangeBlock|playerId,x,y,z|0
resetCanChangeBlockRect|playerId,pos1,pos2|0
resetCanChangeBlockType|playerId,blockName|0
resetCanPickUpItem|playerId,itemId|0
resetItemCraftingRecipes|playerId,itemName|0
resetShopItemForPlayer|playerId,categoryKey,itemKey|0
scalePlayerMeshNodes|playerId,nodeScales|0
sendFlyingMiddleMessage|playerId,message,distanceFromAction,lifetimeMs|0
sendHitmarker|playerId,isCrit,directionVector|0
sendMessage|playerId,message,style|0
sendOverShopInfo|playerId,info|0
sendTopRightHelper|playerId,icon,text,opts|0
setAuraLevel|playerId,level|0
setBlock|x,y,z,blockName|0
setBlockData|x,y,z,data|0
setBlockRect|pos1,pos2,blockName|0
setBlockWalls|pos1,pos2,blockName,hasFloor,hasCeiling|0
setCallbackValueFallback|cbName,value|0
setCameraDirection|playerId,direction|0
setCameraZoom|playerId,zoom|0
setCanChangeBlock|playerId,x,y,z|0
setCanChangeBlockRect|playerId,pos1,pos2|0
setCanChangeBlockType|playerId,blockName|0
setCantChangeBlock|playerId,x,y,z|0
setCantChangeBlockRect|playerId,pos1,pos2|0
setCantChangeBlockType|playerId,blockName|0
setCantPickUpItem|playerId,itemId|0
setChunkAsSchematic|schematicPath,srcCoords,destCoords|0
setClientOption|playerId,option,value|0
setClientOptions|playerId,optionsObj|0
setClientOptionToDefault|playerId,option|0
setCurrency|playerId,currencyId,info|0
setCurrencyAmount|playerId,currencyId,amount,subtext|0
setDefaultMobSetting|mobType,setting,value|0
setDirectionArrow|playerId,id,position,text,showDistance,style|0
setEntityHeading|entityId,newHeading|0
setEntityRotation|entityId,xRotation,yRotation,zRotation|0
setEveryoneSettingForPlayer|playerId,settingName,settingValue,includeNewJoiners|0
setHealth|entityId,newHealth,whoDidDamage,increaseMaxHealthIfNeeded|1
setItemAmount|itemId,newAmount|0
setItemSlot|playerId,itemSlotIndex,itemName,itemAmount,attributes,tellClient|0
setItemStat|playerId,itemName,stat,value|0
setLifeformScale|lifeformId,scale|0
setLobbyDbValue|key,value|0
setMaxPlayers|softMaxPlayers,maxPlayers|0
setMobAiState|mobId,state,params,opts|0
setMobSetting|mobId,setting,value|0
setMoonstoneChestItemSlot|playerId,idx,itemName,itemAmount,metadata|0
setOtherEntitySetting|relevantPlayerId,targetedEntityId,settingName,settingValue|0
setOtherEntitySettings|relevantPlayerId,targetedEntityId,settingsObject|0
setOtherEntitySettingToDefault|relevantPlayerId,targetedEntityId,settingName|0
setPlayerDbValue|playerId,key,value|0
setPlayerGamemode|playerId,gamemode|0
setPlayerOpacity|playerId,opacity|0
setPlayerOpacityForOnePlayer|playerIdWhoViewsOpacityPlayer,playerIdOfOpacityPlayer,opacity|0
setPlayerPhysicsState|playerId,physicsState,positionOffset|0
setPlayerPose|playerId,pose,poseOffset|0
setPlayerVehicle|playerId,vehicleEId,seatIndex|0
setPosition|entityId,x,y,z|0
setSelectedInventorySlotI|playerId,newI|0
setShieldAmount|lifeformId,newShieldAmount|0
setStandardChestItemSlot|chestPos,idx,itemName,itemAmount,playerId,attributes|0
setTargetedPlayerSettingForEveryone|targetedPlayerId,settingName,settingValue,includeNewJoiners|0
setTotalAura|playerId,totalAura|0
setVehicleSetting|vehicleEId,setting,value|0
setVelocity|eId,x,y,z|0
setWalkThroughRect|playerId,pos1,pos2,updateType|0
setWalkThroughType|playerId,blockName,disable|0
shakePlayerCamera|playerId,intensity,durationMs|0
showShopTutorial|playerId|0
updateAudioEntity|eId,opts|0
updateEntityNodeMeshAttachment|eId,node,type,opts,offset,rotation|0
updateMeshEntity|eId,type,opts|0
updateMeshParticleSystems|updates|0
updateShopItem|categoryKey,itemKey,changes|0
updateShopItemForPlayer|playerId,categoryKey,itemKey,changes|0
`;
    const apiMethods = apiMethodCatalog.trim().split('\n').map(line => {
        const [name, params, hasReturn] = line.split('|');
        return { name, params: params ? params.split(',') : [], hasReturn: hasReturn === '1' };
    });
    apiMethods.forEach(method => {
        const id = `api_method_${method.name}`;
        NeonAPI.register({
            id,
            type: method.hasReturn ? 'REPORTER' : 'ACTION',
            label: formatBlockLabel(method.name),
            apiMethod: method.name,
            inputs: method.params.map(param => ({
                label: param,
                expression: true,
                placeholder: 'JavaScript expression'
            })),
            desc: `Bloxd API method: api.${method.name}(${method.params.join(', ')}). Enter JavaScript expressions for arguments. <a href="https://bloxd.io/docs/api-reference#${method.name}" target="_blank" rel="noopener noreferrer">Official method docs</a>.`
        });
    });
    
    NeonAPI.register({ id: 'item_attributes', type: 'ITEM_MAP', label: 'Item Attributes Map', desc: "Container for item properties." });
    NeonAPI.register({ id: 'attr_name', type: 'ATTR_FIELD', label: 'Custom Display Name', desc: "Renames the item." });
    NeonAPI.register({ id: 'attr_desc', type: 'ATTR_FIELD', label: 'Custom Description', desc: "Sets lore/description text." });

    NeonAPI.register({ id: 'custom_attr_group', type: 'CUSTOM_ATTR_GROUP', label: 'Custom Attributes { }', desc: "Advanced JSON attributes." });
    NeonAPI.register({ id: 'attr_kv', type: 'ATTR_KV', label: 'Key: Value', desc: "Key-Value pair for custom attributes." });

    NeonAPI.register({ id: 'customStyledText', type: 'SQUARE_LIST', label: 'Custom Styled Text', desc: "Build a CustomTextStyling array." });
    NeonAPI.register({ id: 'styledString', type: 'TICKET', label: 'Text', inputs: [{label:'Text', def:'"Text"', expression:true}], desc: "A plain string item in CustomTextStyling." });
    NeonAPI.register({ id: 'styledTranslatedText', type: 'TICKET', label: 'Translated Text', inputs: [{label:'Translation Key', def:'"translation.key"', expression:true}, {label:'Params', def:'{}', expression:true}], desc: "CustomTextStyling TranslatedText: { translationKey, params? }." });
    NeonAPI.register({ id: 'styledIcon', type: 'TICKET', label: 'Icon', inputs: [{label:'Icon', def:'', expression:true}, {label:'Color', def:'', expression:true}], desc: "CustomTextStyling StyledIcon with an icon and color." });
    NeonAPI.register({ id: 'styledProgressBar', type: 'TICKET', label: 'ProgressBar', inputs: [{label:'ProgressBar', def:'{}', expression:true}], desc: "CustomTextStyling ProgressBar value. Enter its supported object expression." });
    NeonAPI.register({ id: 'styledKeyBinding', type: 'TICKET', label: 'StyledKeyBinding', inputs: [{label:'StyledKeyBinding', def:'{}', expression:true}], desc: "CustomTextStyling StyledKeyBinding value. Enter its supported object expression." });
    NeonAPI.register({ id: 'textField', type: 'TICKET', label: 'Text', inputs: [{label:'Text',def:'Hallo'}, {label:'Color',def:'red'}, {label:'Weight',def:'bold'}], desc: "A styled text item with text, color, and weight." });
    NeonAPI.register({ id: 'api_show_styled', type: 'ACTION', label: 'Send Styled Text', inputs: [{label:'ID',def:'playerId'}, {label:'Array',def:'[]'}], desc: "Sends complex formatted text." });

    NeonAPI.register({ id: 'if', type: 'CONTROL', label: 'if', desc: "Runs blocks inside only if condition is true." });
    NeonAPI.register({ id: 'ifelse', type: 'CONTROL', label: 'if / else', desc: "Runs first part if true, otherwise second part." });
    NeonAPI.register({ id: 'repeat', type: 'CONTROL', label: 'repeat', desc: "Runs blocks inside X times." });

    NeonAPI.register({ id: 'eq', type: 'BOOLEAN', label: '=', isOp: true, desc: "Equals" });
    NeonAPI.register({ id: 'less', type: 'BOOLEAN', label: '<', isOp: true, desc: "Less than" });
    NeonAPI.register({ id: 'and', type: 'BOOLEAN', label: 'and', isOp: true, desc: "Both must be true" });
    NeonAPI.register({ id: 'or', type: 'BOOLEAN', label: 'or', isOp: true, desc: "At least one must be true" });
    NeonAPI.register({ id: 'not', type: 'BOOLEAN', label: 'not', inputs:['Val'], desc: "Inverts value (True->False)" });
    NeonAPI.register({ id: 'add', type: 'REPORTER', label: '+', isOp: true, desc: "Addition" });
    NeonAPI.register({ id: 'sub', type: 'REPORTER', label: '-', isOp: true, desc: "Subtraction" });
    NeonAPI.register({ id: 'mul', type: 'REPORTER', label: '*', isOp: true, desc: "Multiplication" });
    NeonAPI.register({ id: 'div', type: 'REPORTER', label: '/', isOp: true, desc: "Division" });
    NeonAPI.register({ id: 'greater', type: 'BOOLEAN', label: '>', isOp: true, desc: "Greater than" });
    NeonAPI.register({ id: 'random', type: 'REPORTER', label: 'Random', inputs: [{label:'from',def:'1'}, {label:'to',def:'10'}], desc: "Random integer between the minimum and maximum, inclusive." });
    
    NeonAPI.register({ id: 'vec3', type: 'VEC3', label: 'VEC3', desc: "Coordinate [x, y, z]" });
    NeonAPI.register({ id: 'x', type: 'REPORTER', label: 'x', inputs: [{label:'Vector',def:'[0, 0, 0]',expression:true}], desc: "Returns the x component of a vector." });
    NeonAPI.register({ id: 'y', type: 'REPORTER', label: 'y', inputs: [{label:'Vector',def:'[0, 0, 0]',expression:true}], desc: "Returns the y component of a vector." });
    NeonAPI.register({ id: 'z', type: 'REPORTER', label: 'z', inputs: [{label:'Vector',def:'[0, 0, 0]',expression:true}], desc: "Returns the z component of a vector." });

    NeonAPI.register({ id: 'getHealth', type: 'REPORTER', label: 'Get Health', inputs: ['playerId'], desc: "Returns current HP." });
    NeonAPI.register({ id: 'isCrouching', type: 'BOOLEAN', label: 'Is Crouching?', inputs: ['playerId'], desc: "True if player holds Shift." });
    NeonAPI.register({ id: 'isAlive', type: 'BOOLEAN', label: 'Is Alive?', inputs: ['playerId'], desc: "True if HP > 0." });

    addCategoryForm('Variable', [
        { name: 'name', placeholder: 'Variable name' },
        { name: 'type', placeholder: 'Variable type (optional)', defaultValue: 'any' }
    ], 'Add Variable', values => registerVariable(values.name, values.type));
    addCategoryForm('Function', [
        { name: 'name', placeholder: 'Function name' },
        { name: 'params', placeholder: 'Parameters (comma-separated)' }
    ], 'Create Function', values => registerFunction(values.name, values.params));
    addCategoryForm('Type', [
        { name: 'name', placeholder: 'Type name' },
        { name: 'value', placeholder: 'Type value (e.g. string | number)' }
    ], 'Create Type', values => registerType(values.name, values.value));

    // --- INIT ---
    document.getElementById('workspace').addEventListener('wheel', (e) => { e.preventDefault(); changeZoom(e.deltaY>0?-0.1:0.1); }, { passive: false });
    document.getElementById('toolbox-search').addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        const matches = [];
        document.querySelectorAll('#toolbox-category-panels .toolbox-category').forEach(category => {
            let hasMatch = false;
            category.querySelectorAll('.toolbox-category-blocks > .draggable').forEach(block => {
            const config = NeonAPI.blocks[block.dataset.id];
            const searchable = `${block.textContent} ${config ? config.desc : ''}`.toLowerCase();
                block.hidden = query !== '' && !searchable.includes(query);
                if (!block.hidden) hasMatch = true;
            });
            const button = document.querySelector(`#toolbox-categories .toolbox-category-title[data-category="${CSS.escape(category.dataset.category)}"]`);
            if (button) button.hidden = query !== '' && !hasMatch;
            if (hasMatch) matches.push(category.dataset.category);
        });
        if (query && matches.length) setActiveToolboxCategory(matches[0]);
        else if (!query) {
            const selected = document.querySelector('#toolbox-categories .toolbox-category-title[aria-selected="true"]');
            if (!selected || selected.hidden) {
                const firstVisible = document.querySelector('#toolbox-categories .toolbox-category-title:not([hidden])');
                if (firstVisible) setActiveToolboxCategory(firstVisible.dataset.category);
            }
        }
    });
    function setCodeMode(mode) {
        codeMode = 'javascript';
        document.body.dataset.codeMode = codeMode;
        if (typeof editor !== 'undefined') {
            editor.setOption('mode', 'javascript');
        }
        localStorage.setItem('bloxd_code_mode', codeMode);
        const editorLabel = document.getElementById('editor-label');
        if (editorLabel) editorLabel.textContent = 'JS SOURCE (BLOXD API)';
        updateCodeView();
    }
    
    let typeTimeout;
    document.body.addEventListener('input', function(e) {
        if(e.target.tagName === 'INPUT') {
            clearTimeout(typeTimeout);
            typeTimeout = setTimeout(updateCodeView, 100);
        }
    });

    if(typeof CodeMirror !== 'undefined') {
        window.editor = CodeMirror.fromTextArea(document.getElementById("js-code"), { mode: "javascript", theme: "vscode-dark", lineNumbers: true, scrollbarStyle: "native" });
        setCodeMode('javascript');
    }

    // AUTO START TUTORIAL
    if (!localStorage.getItem('neon_tut_complete')) {
        setTimeout(startTutorial, 500);
    }
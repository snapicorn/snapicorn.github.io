// Gallery owns persistence UI and its resources, independently of the live booth session.
const Gallery = (() => {
    const pageSize = 8;
    let thumbnailQueue = Promise.resolve();
    // Weak keys let reset/replacement release old canvases and PNGs immediately.
    const savedOutputs = new WeakMap();
    const saveErrors = new WeakMap();
    const store = GalleryStore.create({ changed: storageChanged });
    const state = { active: false, load: 0, page: 0, items: [], urls: [], preview: null,
        save: null, channel: null, deleting: null, sharing: false };
    const element = id => document.getElementById(id);
    function status(message, isError = false) {
        element('gallery-status').textContent = message;
        element('gallery-status').setAttribute('data-error', String(isError));
    }
    const previewStatus = message => { element('gallery-preview-status').textContent = message; };

    function errorMessage(error) {
        const code = error?.code || error?.name;
        if (code === 'blocked') return 'Gallery upgrade is blocked by another tab. Close other Snapicorn tabs, then retry.';
        if (code === 'VersionError' || code === 'schema') return 'This Gallery uses a different database version. Reload the latest app; existing images have not been changed.';
        if (code === 'QuotaExceededError' || code === 'capacity') return 'Gallery is full. Download a separate copy, or deliberately delete a saved image before retrying. Nothing was removed.';
        if (code === 'image-limit') return 'This PNG exceeds the Gallery image limit. Download PNG is still available.';
        if (code === 'missing') return 'That image is no longer in this Gallery. It may have changed in another tab.';
        if (code === 'canceled') return 'Deletion canceled. The saved image has been preserved.';
        if (code === 'malformed' || code === 'changed') return 'That saved record cannot be read safely or has changed. It has not been modified.';
        return 'Local Gallery storage is unavailable or the transaction failed. Retry, or download a separate copy. Your current strip is safe.';
    }

    function connect() {
        if (!state.channel && typeof BroadcastChannel === 'function') {
            try {
                state.channel = new BroadcastChannel('snapicorn-finished-gallery-changes');
                state.channel.onmessage = () => storageChanged('remote');
            } catch { /* Focus/navigation refresh is also available without BroadcastChannel. */ }
        }
    }

    function storageChanged(reason) {
        if (reason === 'write') {
            try { state.channel?.postMessage('changed'); } catch { /* Focus/navigation refresh remains available. */ }
        }
        if (reason === 'versionchange' || reason === 'closed') {
            if (state.active) {
                releasePage();
                closePreview();
                element('gallery-empty').hidden = true;
                element('gallery-grid').setAttribute('aria-busy', 'false');
                element('gallery-retry').hidden = false;
                status('Gallery changed in another tab. Reload the latest app or Retry. Existing images have not been changed.', true);
            }
            return;
        }
        if (state.active) refresh();
        if (reason === 'remote' && state.preview) verifyPreview();
        const output = session.output;
        const saved = savedOutputs.get(output);
        if (saved) {
            store.get(saved).catch(() => {
                if (savedOutputs.get(output) === saved) { savedOutputs.delete(output); renderSave(); }
            });
        }
    }

    function currentSave(request) {
        return request.output === session.output && request.sessionId === session.id &&
            request.revision === session.revision && isCompositionCurrent();
    }

    function renderSave() {
        const saved = isCompositionCurrent() && savedOutputs.has(session.output);
        element('save-gallery').disabled = !!state.save || !!saved || operations.busy || !isCompositionCurrent();
        element('save-gallery').textContent = state.save && currentSave(state.save) ? 'Saving…'
            : saved ? 'Saved to Gallery' : 'Save to Gallery';
        element('gallery-save-status').textContent = saved ? 'Saved in this browser’s Gallery. Download for a separate copy.'
            : state.save && currentSave(state.save) ? 'Saving your finished PNG…'
                : saveErrors.get(session.output) || '';
    }

    async function saveExport() {
        if (ui.destination !== 'booth' || ui.phase !== 'export' || state.save ||
            operations.busy || !isCompositionCurrent() || savedOutputs.has(session.output)) return;
        connect();
        const output = session.output;
        const request = { output, sessionId: session.id, revision: session.revision,
            width: output.canvas.width, height: output.canvas.height };
        const isCurrent = exportIdentity(output);
        state.save = request;
        saveErrors.delete(output);
        renderSave();
        try {
            const blob = await preparePNG(output, isCurrent);
            if (!isCurrent()) return;
            // Once requested, this immutable PNG write may finish after navigation/restart.
            const record = await store.save(blob, request);
            if (currentSave(request)) savedOutputs.set(output, record.id);
        } catch (error) {
            if (currentSave(request)) saveErrors.set(output, errorMessage(error));
        } finally {
            if (state.save === request) { state.save = null; renderSave(); }
        }
    }

    function releasePage() {
        state.load++;
        for (const url of state.urls) URL.revokeObjectURL(url);
        state.urls = [];
        element('gallery-grid').innerHTML = '';
        element('gallery-pagination').hidden = true;
    }

    async function thumbnail(record) {
        const scale = Math.min(320 / record.metadata.width, 620 / record.metadata.height, 1);
        const width = Math.max(1, Math.round(record.metadata.width * scale));
        const height = Math.max(1, Math.round(record.metadata.height * scale));
        let image, sourceURL;
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        try {
            if (typeof createImageBitmap === 'function') {
                image = await createImageBitmap(record.blob, { resizeWidth: width, resizeHeight: height });
            } else {
                sourceURL = URL.createObjectURL(record.blob);
                image = new Image();
                await new Promise((resolve, reject) => {
                    const timer = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('decode')); }, 8000);
                    image.onload = () => { clearTimeout(timer); resolve(); };
                    image.onerror = () => { clearTimeout(timer); reject(new Error('decode')); };
                    image.src = sourceURL;
                });
            }
            const context = canvas.getContext('2d');
            if (!context) throw new Error('canvas');
            context.drawImage(image, 0, 0, width, height);
            return await encodePNG(canvas);
        } finally {
            image?.close?.();
            if (sourceURL) { image.removeAttribute('src'); URL.revokeObjectURL(sourceURL); }
            canvas.width = canvas.height = 0;
        }
    }

    async function refresh() {
        if (!state.active) return;
        releasePage();
        const token = state.load;
        element('gallery-empty').hidden = true;
        element('gallery-retry').hidden = true;
        element('gallery-grid').setAttribute('aria-busy', 'true');
        status('Opening your collection…');
        try {
            const { items, malformed } = await store.list();
            if (!state.active || token !== state.load) return;
            state.items = items;
            state.page = Math.min(state.page, Math.max(0, Math.ceil(items.length / pageSize) - 1));
            const visible = items.slice(state.page * pageSize, (state.page + 1) * pageSize);
            element('gallery-empty').hidden = !!items.length || !!malformed;
            status(malformed ? `${malformed} saved record(s) could not be read. They have been preserved.`
                : items.length ? `${items.length} saved ${items.length === 1 ? 'strip' : 'strips'} · newest first` : '', !!malformed);
            element('gallery-pagination').hidden = items.length <= pageSize;
            element('gallery-page-number').textContent = `Page ${state.page + 1} of ${Math.max(1, Math.ceil(items.length / pageSize))}`;
            element('gallery-previous').disabled = state.page === 0;
            element('gallery-next').disabled = (state.page + 1) * pageSize >= items.length;
            const cards = visible.map(item => {
                const button = document.createElement('button');
                button.className = 'gallery-card';
                const date = new Date(item.savedAt).toLocaleString();
                button.setAttribute('aria-label', `Preview strip saved ${date}`);
                const image = document.createElement('img');
                image.alt = 'Saved four-photo strip';
                image.loading = 'lazy'; image.decoding = 'async';
                const label = document.createElement('span');
                label.textContent = date;
                button.appendChild(image); button.appendChild(label);
                button.addEventListener('click', () => openPreview(item.id, button));
                element('gallery-grid').appendChild(button);
                return { item, image };
            });
            element('gallery-grid').setAttribute('aria-busy', 'false');
            // One transient decode at a time; only this page's small thumbnails stay alive.
            for (const { item, image } of cards) {
                if (!state.active || token !== state.load) break;
                try {
                    const work = thumbnailQueue.then(async () => {
                        if (!state.active || token !== state.load) return null;
                        const record = await store.get(item.id);
                        if (!state.active || token !== state.load) return null;
                        return thumbnail(record);
                    });
                    thumbnailQueue = work.catch(() => {});
                    const blob = await work;
                    if (!state.active || token !== state.load) break;
                    if (!blob) break;
                    const url = URL.createObjectURL(blob);
                    state.urls.push(url); image.src = url;
                } catch {
                    if (state.active && token === state.load) {
                        image.alt = 'Preview unavailable';
                        status('Some saved images could not be previewed. Their records have been preserved. Retry to refresh.', true);
                        element('gallery-retry').hidden = false;
                    }
                }
            }
        } catch (error) {
            if (!state.active || token !== state.load) return;
            element('gallery-grid').setAttribute('aria-busy', 'false');
            element('gallery-retry').hidden = false;
            status(errorMessage(error), true);
        }
    }

    async function openPreview(id, invoker) {
        closePreview(false);
        const selection = { id, invoker, record: null, url: null, download: null };
        state.preview = selection;
        element('gallery-preview-image').hidden = true;
        element('gallery-download').disabled = element('gallery-share').disabled = element('gallery-delete').disabled = true;
        element('gallery-preview-dialog').showModal();
        element('gallery-preview-close').focus();
        previewStatus('Opening saved image…');
        try {
            const record = await store.get(id);
            if (state.preview !== selection) return;
            const url = URL.createObjectURL(record.blob);
            selection.record = record; selection.url = url;
            const image = element('gallery-preview-image');
            image.onerror = () => {
                if (state.preview === selection) {
                    element('gallery-download').disabled = element('gallery-share').disabled = element('gallery-delete').disabled = true;
                    previewStatus('This PNG cannot be previewed. Its saved record has not been changed.');
                }
            };
            image.src = url; image.hidden = false;
            element('gallery-download').disabled = element('gallery-delete').disabled = false;
            element('gallery-share').disabled = state.sharing;
            previewStatus('');
        } catch (error) {
            if (state.preview === selection) previewStatus(errorMessage(error));
        }
    }

    function closePreview(restoreFocus = true) {
        cancelDelete(false);
        const selection = state.preview;
        state.preview = null;
        element('gallery-preview-dialog').close();
        const image = element('gallery-preview-image');
        image.onerror = null; image.removeAttribute('src');
        if (selection?.url) URL.revokeObjectURL(selection.url);
        if (selection?.download) { clearTimeout(selection.download.timer); URL.revokeObjectURL(selection.download.url); }
        if (restoreFocus && selection?.invoker?.isConnected) selection.invoker.focus();
        else if (restoreFocus && state.active) element('gallery-heading').focus();
    }

    async function verifyPreview() {
        const selection = state.preview;
        if (!selection?.record) return;
        try { await store.get(selection.id); }
        catch (error) {
            if (state.preview !== selection) return;
            closePreview();
            status(errorMessage(error), true);
        }
    }

    function downloadPreview() {
        const selection = state.preview;
        if (!selection?.record || element('gallery-download').disabled) return;
        try {
            if (!selection.download) selection.download = { url: URL.createObjectURL(selection.record.blob) };
            clearTimeout(selection.download.timer);
            const resource = selection.download;
            resource.timer = setTimeout(() => {
                if (selection.download !== resource) return;
                URL.revokeObjectURL(resource.url); selection.download = null;
            }, 60000);
            const anchor = document.createElement('a');
            anchor.href = resource.url; anchor.download = 'snapicorn.png';
            document.body.appendChild(anchor);
            try { anchor.click(); } finally { anchor.remove(); }
            previewStatus('PNG download requested. Check your browser’s downloads for the separate copy.');
        } catch { previewStatus('Could not request the download. The saved image is still here. Retry Download PNG.'); }
    }

    async function sharePreview() {
        const selection = state.preview;
        if (!selection?.record || state.sharing || element('gallery-share').disabled) return;
        state.sharing = true;
        element('gallery-share').disabled = true;
        await sharePreparedPNG(selection.record.blob, message => {
            if (state.preview === selection) previewStatus(message);
        });
        state.sharing = false;
        if (state.preview?.record) element('gallery-share').disabled = false;
    }

    function confirmDelete() {
        if (!state.preview?.record || state.deleting) return;
        element('gallery-delete-confirmation').hidden = false;
        element('gallery-delete').hidden = true;
        element('gallery-keep').focus();
    }

    function cancelDelete(restoreFocus = true) {
        state.deleting?.controller.abort();
        element('gallery-delete-confirmation').hidden = true;
        element('gallery-delete').hidden = false;
        if (restoreFocus) element('gallery-delete').focus();
    }

    async function deleteSelected() {
        const selection = state.preview;
        if (!selection?.record || state.deleting || element('gallery-delete-confirmation').hidden) return;
        const request = { selection, controller: new AbortController() };
        state.deleting = request;
        element('gallery-confirm-delete').disabled = true;
        previewStatus('Deleting this saved image…');
        try {
            // Re-read and verify id/time/metadata in the same write transaction as deletion.
            await store.remove(selection.record, request.controller.signal);
            if (savedOutputs.get(session.output) === selection.id) { savedOutputs.delete(session.output); renderSave(); }
            if (state.preview === selection) closePreview();
            if (state.active) { await refresh(); status('Image deleted from this Gallery. Downloaded copies are unaffected.'); }
        } catch (error) {
            if (state.preview === selection) { cancelDelete(); previewStatus(errorMessage(error)); }
        } finally {
            if (state.deleting === request) { state.deleting = null; element('gallery-confirm-delete').disabled = false; }
        }
    }

    function enter() { state.active = true; state.page = 0; connect(); storageChanged('navigation'); }
    function leave() { state.active = false; releasePage(); closePreview(false); state.items = []; }
    function dispose() { leave(); store.close(); state.channel?.close(); state.channel = null; }

    function initialize() {
        element('save-gallery').addEventListener('click', saveExport);
        element('gallery-start').addEventListener('click', startPhotobooth);
        element('gallery-retry').addEventListener('click', refresh);
        for (const [id, delta] of [['gallery-previous', -1], ['gallery-next', 1]]) {
            element(id).addEventListener('click', () => { state.page += delta; refresh(); element('gallery-heading').focus(); });
        }
        element('gallery-preview-close').addEventListener('click', () => closePreview());
        element('gallery-download').addEventListener('click', downloadPreview);
        element('gallery-share').addEventListener('click', sharePreview);
        element('gallery-delete').addEventListener('click', confirmDelete);
        element('gallery-keep').addEventListener('click', () => cancelDelete());
        element('gallery-confirm-delete').addEventListener('click', deleteSelected);
        const dialog = element('gallery-preview-dialog');
        dialog.addEventListener('cancel', event => { event.preventDefault(); closePreview(); });
        dialog.addEventListener('close', () => { if (!dialog.open && state.preview) closePreview(); });
        dialog.addEventListener('keydown', event => {
            if (event.key !== 'Tab') return;
            const buttons = [...dialog.querySelectorAll('button')].filter(button =>
                !button.disabled && !button.hidden && !button.closest('[hidden]'));
            const first = buttons[0];
            const last = buttons.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
        let backdrop = false;
        const outside = event => {
            const rect = dialog.getBoundingClientRect();
            return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        };
        dialog.addEventListener('pointerdown', event => { backdrop = event.target === dialog && outside(event); });
        dialog.addEventListener('click', event => {
            if (backdrop && event.target === dialog && outside(event)) closePreview();
            backdrop = false;
        });
        window.addEventListener('focus', () => { storageChanged('focus'); verifyPreview(); });
        document.addEventListener?.('visibilitychange', () => {
            if (document.visibilityState === 'visible') { storageChanged('visibility'); verifyPreview(); }
        });
        window.addEventListener('pagehide', dispose);
    }
    return { initialize, enter, leave, renderSave, saveExport };
})();

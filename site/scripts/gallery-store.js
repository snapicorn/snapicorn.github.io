// Finished PNG persistence only. No session, source photo or editor state enters this store.
const GalleryStore = (() => {
    const databaseName = 'snapicorn-finished-gallery';
    const version = 1;
    const storeName = 'finished-pngs';
    const limits = Object.freeze({ count: 100, imageBytes: 12 * 1024 * 1024,
        totalBytes: 128 * 1024 * 1024, pixels: 8000000 });

    function failure(code) {
        return Object.assign(new Error(code), { code });
    }

    function validRecord(record) {
        const meta = record?.metadata;
        return typeof record?.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(record.id) &&
            Number.isSafeInteger(record.savedAt) && record.savedAt > 0 && record.savedAt <= 8640000000000000 &&
            record.blob instanceof Blob && record.blob.type === 'image/png' &&
            record.blob.size > 0 && record.blob.size <= limits.imageBytes &&
            meta?.type === 'image/png' && meta.bytes === record.blob.size &&
            Number.isSafeInteger(meta.width) && Number.isSafeInteger(meta.height) &&
            meta.width > 0 && meta.height > 0 && meta.width * meta.height <= limits.pixels;
    }

    async function validatePNG(blob, metadata) {
        if (!(blob instanceof Blob) || blob.type !== 'image/png' || !blob.size || blob.size > limits.imageBytes) {
            throw failure('image-limit');
        }
        const bytes = new Uint8Array(await blob.slice(0, 24).arrayBuffer());
        const signature = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82];
        if (bytes.length !== 24 || signature.some((value, index) => bytes[index] !== value)) throw failure('malformed');
        const view = new DataView(bytes.buffer);
        const width = view.getUint32(16), height = view.getUint32(20);
        if (width !== metadata?.width || height !== metadata?.height || !width || !height || width * height > limits.pixels) {
            throw failure('image-limit');
        }
        return { width, height, bytes: blob.size, type: 'image/png' };
    }

    function sameRecord(a, b) {
        return validRecord(a) && a.id === b?.id && a.savedAt === b.savedAt &&
            a.metadata.bytes === b.metadata?.bytes && a.metadata.width === b.metadata.width &&
            a.metadata.height === b.metadata.height;
    }

    function create(options = {}) {
        const name = options.name || databaseName;
        // Explicit injection is for isolated QA only; never point tests at another database.
        if (name !== databaseName && !/^snapicorn-gallery-test-[a-zA-Z0-9-]+$/.test(name)) throw failure('test-name');
        let connection = null, opening = null, generation = 0;
        const changed = options.changed || (() => {});
        const getFactory = () => options.factory || globalThis.indexedDB;
        function notify(reason) {
            // A failed UI/cross-tab notification cannot turn a committed write into a failed save.
            try { changed(reason); } catch { /* Focus/navigation can re-read storage. */ }
        }

        function close() {
            generation++;
            connection?.close();
            connection = null;
            opening = null;
        }

        function open() {
            if (connection) return Promise.resolve(connection);
            if (opening) return opening;
            const expectedGeneration = generation;
            const pending = new Promise((resolve, reject) => {
                let request, settled = false;
                const fail = error => { settled = true; reject(error || failure('unavailable')); };
                try {
                    if (!getFactory()) throw failure('unavailable');
                    request = getFactory().open(name, version);
                } catch (error) { fail(error); return; }
                request.onblocked = () => fail(failure('blocked'));
                request.onerror = () => fail(request.error);
                request.onupgradeneeded = event => {
                    // Only create a new database. Unknown existing schemas require a separate decision.
                    if (settled || generation !== expectedGeneration || event.oldVersion !== 0) { request.transaction.abort(); return; }
                    request.result.createObjectStore(storeName, { keyPath: 'id' });
                };
                request.onsuccess = () => {
                    const db = request.result;
                    if (settled || generation !== expectedGeneration) { db.close(); fail(failure('closed')); return; }
                    if (!db.objectStoreNames.contains(storeName)) { db.close(); fail(failure('schema')); return; }
                    connection = db;
                    db.onversionchange = () => { close(); notify('versionchange'); };
                    db.onclose = () => {
                        if (connection === db) { connection = null; notify('closed'); }
                    };
                    resolve(db);
                };
            });
            opening = pending;
            pending.then(() => { if (opening === pending) opening = null; },
                () => { if (opening === pending) opening = null; });
            return pending;
        }

        async function transact(mode, action, signal) {
            const db = await open();
            return new Promise((resolve, reject) => {
                let tx, result, reason;
                const cancel = () => { reason = failure('canceled'); tx.abort(); };
                const cleanup = () => signal?.removeEventListener('abort', cancel);
                try {
                    if (signal?.aborted) { reject(failure('canceled')); return; }
                    tx = db.transaction(storeName, mode);
                    tx.oncomplete = () => { cleanup(); resolve(result); };
                    tx.onabort = () => { cleanup(); reject(reason || tx.error || failure('aborted')); };
                    tx.onerror = () => { reason ||= tx.error; };
                    signal?.addEventListener('abort', cancel, { once: true });
                    action(tx.objectStore(storeName), value => { result = value; }, error => {
                        reason = error;
                        tx.abort();
                    });
                } catch (error) {
                    if (tx) { reason = error; tx.abort(); }
                    else { close(); reject(error); }
                }
            });
        }

        async function save(blob, dimensions) {
            const metadata = await validatePNG(blob, dimensions);
            const record = { id: crypto.randomUUID(), savedAt: Date.now(), blob, metadata };
            await transact('readwrite', (store, done, abort) => {
                let count = 0, bytes = 0;
                const cursor = store.openCursor();
                cursor.onsuccess = () => {
                    const item = cursor.result;
                    if (item) {
                        count++;
                        // Unknown records are preserved and count toward capacity; never repaired or evicted.
                        bytes += item.value?.blob instanceof Blob ? item.value.blob.size : limits.imageBytes;
                        item.continue();
                    } else if (count >= limits.count || bytes + blob.size > limits.totalBytes) abort(failure('capacity'));
                    else {
                        try { store.add(record); done(record.id); }
                        catch (error) { abort(error); }
                    }
                };
            });
            notify('write');
            return record;
        }

        function list() {
            return transact('readonly', (store, done) => {
                const items = [];
                let malformed = 0;
                const request = store.openCursor();
                request.onsuccess = () => {
                    const cursor = request.result;
                    if (cursor) {
                        const record = cursor.value;
                        if (validRecord(record) && cursor.primaryKey === record.id) {
                            items.push({ id: record.id, savedAt: record.savedAt, metadata: record.metadata });
                        } else malformed++;
                        cursor.continue();
                    } else {
                        items.sort((a, b) => b.savedAt - a.savedAt || b.id.localeCompare(a.id));
                        done({ items, malformed });
                    }
                };
            });
        }

        async function get(id) {
            const record = await transact('readonly', (store, done) => {
                const request = store.get(id);
                request.onsuccess = () => done(request.result);
            });
            if (!record) throw failure('missing');
            if (!validRecord(record) || record.id !== id) throw failure('malformed');
            await validatePNG(record.blob, record.metadata);
            return record;
        }

        async function remove(expected, signal) {
            await transact('readwrite', (store, done, abort) => {
                const request = store.get(expected.id);
                request.onsuccess = () => {
                    if (!request.result) { abort(failure('missing')); return; }
                    if (!sameRecord(request.result, expected)) { abort(failure('changed')); return; }
                    try { store.delete(expected.id); done(true); }
                    catch (error) { abort(error); }
                };
            }, signal);
            notify('write');
        }
        return { open, close, save, list, get, remove };
    }
    return { create, limits, databaseName, version };
})();

// In-memory disposable IndexedDB double. Real engine behavior is checked separately in browser QA.
export function disposableIDB() {
  const records = new Map();
  const faults = {};
  const connections = [];
  let opens = 0, currentVersion = 0, completeCount = 0;
  const factory = { open() {
    opens++;
    if (faults.throwOpen) throw faults.throwOpen;
    const request = {};
    queueMicrotask(() => {
      if (faults.blocked) { request.onblocked?.(); return; }
      if (faults.openError) { request.error = faults.openError; request.onerror?.(); return; }
      const db = {
        objectStoreNames: { contains: () => !faults.schema },
        createObjectStore() {}, close() { this.closed = true; },
        transaction(name, mode) {
          if (db.closed) throw new Error('closed');
          let pending = 0, scheduled = false, aborted = false;
          const draft = new Map(records);
          const tx = {
            abort() {
              if (aborted) return;
              aborted = true;
              queueMicrotask(() => tx.onabort?.());
            },
            objectStore() { return store; },
          };
          function complete() {
            if (scheduled) return;
            scheduled = true;
            queueMicrotask(() => {
              scheduled = false;
              if (pending || aborted) return;
              const commit = () => {
                if (aborted) return;
                if (faults.abort) { tx.error = faults.abort; tx.abort(); return; }
                if (mode === 'readwrite') { records.clear(); for (const [key,value] of draft) records.set(key,value); }
                completeCount++;
                tx.oncomplete?.();
              };
              if (faults.holdCommit) faults.commit = commit;
              else commit();
            });
          }
          function operation(action) {
            const result = {}; pending++;
            queueMicrotask(() => {
              if (aborted) return;
              try { result.result = action(); result.onsuccess?.(); }
              catch (error) { result.error = error; tx.error = error; tx.onerror?.(); tx.abort(); }
              pending--; complete();
            });
            return result;
          }
          const store = {
            get: id => operation(() => draft.get(id)),
            add: record => {
              if (faults.addError) throw faults.addError;
              return operation(() => {
                if (draft.has(record.id)) throw new Error('ConstraintError');
                draft.set(record.id,record); return record.id;
              });
            },
            delete: id => operation(() => { draft.delete(id); }),
            openCursor() {
              const request = {}; const entries = [...draft.entries()]; let offset = 0;
              pending++;
              const next = () => queueMicrotask(() => {
                if (aborted) return;
                const entry = entries[offset++];
                if (entry) request.result = { primaryKey: entry[0], value: entry[1], continue: next };
                else { request.result = null; pending--; }
                request.onsuccess?.();
                if (!entry) complete();
              });
              next(); return request;
            },
          };
          complete(); return tx;
        },
      };
      request.result = db; connections.push(db);
      if (!currentVersion) {
        request.transaction = { abort() { request.error = new Error('upgrade aborted'); db.closed = true; } };
        request.onupgradeneeded?.({oldVersion:0}); currentVersion = 1;
      }
      if (request.error) request.onerror?.(); else request.onsuccess?.();
    });
    return request;
  } };
  return { factory, records, faults, connections, get opens() { return opens; }, get completeCount() { return completeCount; } };
}

export function png(width=700, height=2090) {
  const bytes = new Uint8Array(32);
  bytes.set([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]);
  const view=new DataView(bytes.buffer); view.setUint32(16,width); view.setUint32(20,height);
  return new Blob([bytes],{type:'image/png'});
}

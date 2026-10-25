import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {disposableIDB,png} from './idb-fixture.js';

function setup(fake=disposableIDB(), changed=()=>{}) {
  const context=vm.createContext({Blob,crypto:webcrypto,Uint8Array,DataView,Date,console});
  vm.runInContext(readFileSync(new URL('../scripts/gallery-store.js',import.meta.url),'utf8'),context);
  const api=vm.runInContext('GalleryStore',context);
  return {fake,api,store:api.create({factory:fake.factory,name:'snapicorn-gallery-test-unit',changed})};
}
const dimensions={width:700,height:2090};
const settle=async()=>{for(let i=0;i<40;i++) await Promise.resolve();};

test('dedicated production name/version and isolated test names protect prototype',()=>{
  const {api}=setup();
  assert.equal(api.databaseName,'snapicorn-finished-gallery'); assert.equal(api.version,1);
  assert.throws(()=>api.create({name:'snapicorn-design-prototype'}),/test-name/);
});

test('exact PNG Blob persists after transaction completion and reopening',async()=>{
  const {store,fake,api}=setup(); const blob=png();
  const saved=await store.save(blob,dimensions);
  assert.equal(fake.completeCount,1); assert.equal(fake.records.get(saved.id).blob,blob);
  store.close(); const reopened=api.create({factory:fake.factory,name:'snapicorn-gallery-test-unit'});
  const record=await reopened.get(saved.id);
  assert.deepEqual(await record.blob.arrayBuffer(),await blob.arrayBuffer());
  assert.equal(record.metadata.bytes,blob.size); assert.equal(record.metadata.type,'image/png');
  assert.deepEqual(Object.keys(record).sort(),['blob','id','metadata','savedAt']);
});

test('request success is not save success before commit',async()=>{
  const {fake,store}=setup(); fake.faults.holdCommit=true; let saved=false;
  const pending=store.save(png(),dimensions).then(()=>{saved=true;}); await settle();
  assert.equal(saved,false); assert.equal(fake.records.size,0);
  fake.faults.commit(); await pending; assert.equal(fake.records.size,1);
});

for(const name of ['QuotaExceededError','AbortError']) test(name+' abort preserves prior records and allows retry',async()=>{
  const {fake,store}=setup(); const original=await store.save(png(),dimensions);
  fake.faults.abort=Object.assign(new Error(name),{name});
  await assert.rejects(store.save(png(),dimensions),{name});
  assert.equal(fake.records.size,1); assert.ok(fake.records.has(original.id));
  delete fake.faults.abort; await store.save(png(),dimensions); assert.equal(fake.records.size,2);
});

for(const mode of ['throwOpen','openError','blocked']) test(mode+' open failure is retryable',async()=>{
  const {fake,store}=setup(); fake.faults[mode]=mode==='blocked'?true:Object.assign(new Error('denied'),{name:'SecurityError'});
  await assert.rejects(store.list()); delete fake.faults[mode];
  assert.equal((await store.list()).items.length,0); assert.equal(fake.opens,2);
});

test('missing storage is an error, never a successful empty collection',async()=>{
  const {api}=setup(); await assert.rejects(api.create().list(),/unavailable/);
});

test('version change closes connection and notifies before reopening',async()=>{
  const changes=[]; const {store,fake}=setup(undefined,reason=>changes.push(reason));
  await store.open(); fake.connections[0].onversionchange();
  assert.equal(fake.connections[0].closed,true); assert.deepEqual(changes,['versionchange']);
  await store.list(); assert.equal(fake.opens,2);
});

test('close during opening cannot leak a late connection',async()=>{
  const {store,fake}=setup(); const pending=store.open(); store.close();
  await assert.rejects(pending); assert.equal(fake.connections[0].closed,true);
  await store.open(); assert.equal(fake.opens,2);
});

test('unknown schema is preserved and reported',async()=>{
  const {store,fake}=setup(); fake.faults.schema=true;
  await assert.rejects(store.list(),/schema/); assert.equal(fake.connections[0].closed,true);
});

test('invalid PNG and excessive dimensions are rejected without writing',async()=>{
  const {store,fake}=setup();
  for(const blob of [new Blob(['raw photo']), new Blob(['not png'],{type:'image/png'}),png(700,20000)]) {
    await assert.rejects(store.save(blob,dimensions));
  }
  await assert.rejects(store.save(png(),{width:701,height:2090}));
  assert.equal(fake.records.size,0);
});

test('count limit never silently evicts or overwrites records',async()=>{
  const {store,fake,api}=setup(); const seed=await store.save(png(),dimensions);
  for(let i=1;i<api.limits.count;i++) fake.records.set('seed-'+i,{...seed,id:'seed-'+i});
  await assert.rejects(store.save(png(),dimensions),/capacity/);
  assert.equal(fake.records.size,100); assert.equal(fake.records.get(seed.id),seed);
});

test('aggregate byte and per-image limits preserve all existing records',async()=>{
  const {store,fake,api}=setup(); const blob=new Blob([png(),new Uint8Array(api.limits.imageBytes)],{type:'image/png'});
  await assert.rejects(store.save(blob,dimensions),/image-limit/);
  const seed=await store.save(png(),dimensions);
  const large=new Blob([new Uint8Array(12*1024*1024)],{type:'image/png'});
  for(let i=0;i<11;i++) fake.records.set('large-'+i,{...seed,id:'large-'+i,blob:large});
  await assert.rejects(store.save(png(),dimensions),/capacity/); assert.equal(fake.records.size,12);
});

test('newest-first metadata list excludes malformed records without retaining blobs',async()=>{
  const {store,fake}=setup(); const seed=await store.save(png(),dimensions);
  fake.records.set('newer',{...seed,id:'newer',savedAt:seed.savedAt+100});
  fake.records.set('corrupt',{id:'corrupt',blob:'bad'});
  fake.records.set('wrong-key',{...seed,id:'another-key'});
  const result=await store.list();
  assert.deepEqual(Array.from(result.items,item=>item.id),['newer',seed.id]);
  assert.equal(result.malformed,2); assert.ok(result.items.every(item=>!('blob' in item)));
  assert.equal(fake.records.size,4);
  await assert.rejects(store.get('missing'),/missing/); await assert.rejects(store.get('corrupt'),/malformed/);
});

test('PNG header mismatch in an otherwise plausible saved record is reported',async()=>{
  const {store,fake}=setup(); const seed=await store.save(png(),dimensions);
  fake.records.set(seed.id,{...seed,blob:png(800,2090)});
  await assert.rejects(store.get(seed.id),/image-limit/); assert.equal(fake.records.size,1);
});

test('delete rechecks identity and deletes exactly the selected record only on commit',async()=>{
  const {store,fake}=setup(); const first=await store.save(png(),dimensions); const second=await store.save(png(),dimensions);
  await assert.rejects(store.remove({...first,savedAt:first.savedAt+1}),/changed/);
  assert.equal(fake.records.size,2);
  await store.remove(first); assert.equal(fake.records.size,1); assert.ok(fake.records.has(second.id));
  await assert.rejects(store.remove(first),/missing/);
});

test('failed delete transaction retains selected and other records',async()=>{
  const {store,fake}=setup(); const selected=await store.save(png(),dimensions);
  fake.faults.abort=Object.assign(new Error('abort'),{name:'AbortError'});
  await assert.rejects(store.remove(selected),{name:'AbortError'});
  assert.equal(fake.records.get(selected.id),selected);
});

test('a notification failure cannot misreport a completed save', async () => {
  const {store,fake} = setup(undefined, () => { throw new Error('notification failed'); });
  const record = await store.save(png(), dimensions);
  assert.ok(fake.records.has(record.id));
});

test('synchronous add quota failure aborts cleanly without losing existing records', async () => {
  const {store,fake} = setup();
  const existing = await store.save(png(), dimensions);
  fake.faults.addError = Object.assign(new Error('quota'), {name:'QuotaExceededError'});
  await assert.rejects(store.save(png(), dimensions), {name:'QuotaExceededError'});
  assert.equal(fake.records.size, 1);
  assert.ok(fake.records.has(existing.id));
});

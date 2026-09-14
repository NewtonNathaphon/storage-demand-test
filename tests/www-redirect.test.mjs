import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {onRequest} from '../functions/_middleware.js';

const root=new URL('..',import.meta.url);
const routes=JSON.parse(readFileSync(new URL('_routes.json',root),'utf8'));

test('Pages middleware redirects the www root permanently',async()=>{
  let nextCalls=0;
  const response=await onRequest({
    request:new Request('https://www.storagebuddyth.com/'),
    next(){nextCalls+=1;}
  });
  assert.equal(nextCalls,0);
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),'https://storagebuddyth.com/');
});

test('Pages middleware preserves the www pathname and query string',async()=>{
  let nextCalls=0;
  const response=await onRequest({
    request:new Request('https://www.storagebuddyth.com/en/storage%20tips/?item=box%2Fcrate&item=สอง#ignored'),
    next(){nextCalls+=1;}
  });
  assert.equal(nextCalls,0);
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),'https://storagebuddyth.com/en/storage%20tips/?item=box%2Fcrate&item=%E0%B8%AA%E0%B8%AD%E0%B8%87');
});

test('Pages middleware passes apex requests through exactly once',async()=>{
  const downstream=new Response('api response',{status:202});
  let nextCalls=0;
  const response=await onRequest({
    request:new Request('https://storagebuddyth.com/api/estimate'),
    next(){
      nextCalls+=1;
      return downstream;
    }
  });
  assert.equal(nextCalls,1);
  assert.equal(response,downstream);
});

test('Pages middleware does not redirect lookalike hostnames',async()=>{
  const downstream=new Response('unchanged');
  let nextCalls=0;
  const response=await onRequest({
    request:new Request('https://www.storagebuddyth.com.example.com/path'),
    next(){
      nextCalls+=1;
      return downstream;
    }
  });
  assert.equal(nextCalls,1);
  assert.equal(response,downstream);
});

test('Pages routes invoke middleware for content and APIs while assets bypass it',()=>{
  assert.equal(routes.version,1);
  assert.deepEqual(routes.include,['/*']);
  assert.deepEqual(routes.exclude,['/assets/*']);
  for(const path of ['/','/en/','/api/estimate','/googlec5a82ac63469f274.html','/sitemap.xml']){
    assert.ok(routes.include.includes('/*'),`${path} must pass through middleware`);
    assert.equal(path.startsWith('/assets/'),false);
  }
});

import {getStore} from '@netlify/blobs';
import {timingSafeEqual} from 'node:crypto';
import project from '../../project.json' with {type:'json'};
import {commentAPI} from '../../server/comments.mjs';
const allowed=new Set(['https://erichuang777777.github.io','http://127.0.0.1:3025']);
export default async request=>{
 const origin=request.headers.get('origin'),url=new URL(request.url);
 const headers={'content-type':'application/json','cache-control':'no-store','vary':'Origin'};
 if(allowed.has(origin))Object.assign(headers,{'access-control-allow-origin':origin,'access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'Content-Type'});
 const reply=(d,status=200)=>new Response(JSON.stringify(d),{status,headers});
 if(request.method==='OPTIONS')return reply({},allowed.has(origin)?200:403);
 const db=getStore({name:'hope-movie-feedback-v1',consistency:'strong'});
 const store={get:(shot,id)=>db.get(`comments/${shot}/${id}`,{type:'json'}),put:r=>db.setJSON(`comments/${r.shotId}/${r.id}`,r),list:async()=>{let rows=[];for await(const page of db.list({prefix:'comments/',paginate:true})){rows.push(...(await Promise.all(page.blobs.map(b=>db.get(b.key,{type:'json'})))).filter(Boolean));}return rows}};
 try{
 if(url.searchParams.has('sync')){
  const expected=process.env.REVIEW_SYNC_SECRET||'',given=request.headers.get('authorization')||'';const a=Buffer.from('Bearer '+expected),b=Buffer.from(given);
  if(!expected||a.length!==b.length||!timingSafeEqual(a,b))return reply({error:'Unauthorized'},401);
  if(request.method==='GET')return reply({comments:await store.list()});
  if(request.method==='POST'){const d=await request.json();if(!/^[0-9a-f-]{36}$/i.test(d.id)||!project.shots.some(s=>s.id===d.shotId)||!/^https:\/\/github\.com\/erichuang777777\/2026_NTUCC_breastcacner_movie\/issues\/\d+$/.test(d.issueUrl))return reply({error:'Invalid acknowledgement'},400);const r=await store.get(d.shotId,d.id);if(!r)return reply({error:'Not found'},404);await store.put({...r,issueUrl:d.issueUrl});return reply({ok:true})}
  return reply({error:'Method not allowed'},405);
 }
 if(request.method==='POST'){
  if(!allowed.has(origin))return reply({error:'請從審片網站送出。'},403);
  const text=await request.text();if(text.length>20000)return reply({error:'內容太長。'},413);
  let data;try{data=JSON.parse(text)}catch{return reply({error:'格式錯誤'},400)}
  if(data.website)return reply({error:'無法送出，請重新整理。'},400);
  // Coarse server-side rate limit; drafts remain available on rejection.
  const ip=request.headers.get('x-nf-client-connection-ip')||'unknown';const {createHash}=await import('node:crypto');const key='rate/'+createHash('sha256').update(ip).digest('hex')+'/'+Math.floor(Date.now()/60000);const count=await db.get(key,{type:'json'})||0;if(count>=6)return reply({error:'留言過於頻繁，請稍等一分鐘。'},429);await db.setJSON(key,count+1);
  const internal=new Request(request.url,{method:'POST',headers:{'content-type':'application/json'},body:text});const result=await commentAPI({store,project})(internal);return new Response(await result.text(),{status:result.status,headers});
 }
 if(request.method==='GET'){const rows=await store.list();return reply({comments:rows.map(({promptSnapshot,promptZhSnapshot,...r})=>r)})}
 return reply({error:'Method not allowed'},405);
 }catch(e){console.error(e.message);return reply({error:'尚未儲存，請保留草稿後重試。'},503)}
};
export const config={path:'/api/comments'};

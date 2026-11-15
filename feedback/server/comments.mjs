import { authorized } from './auth.mjs';
export function commentAPI({store,project,password=''}){
 const shots=new Map(project.shots.map(x=>[x.id,x]));
 return async request=>{
  const headers={'cache-control':'no-store','content-type':'application/json; charset=utf-8'};
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(!await authorized(request,password))return reply({error:'請先輸入團隊密碼。'},401);
  try{
   if(request.method==='GET'){
    const shot=new URL(request.url).searchParams.get('shot');if(shot&&!shots.has(shot))return reply({error:'找不到此鏡號。'},400);
    const all=await store.list(shot);all.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));return reply({comments:all});
   }
   if(request.method!=='POST')return reply({error:'不支援此操作。'},405);
   const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'來源不符，請從審片頁提交。'},403);
   if(Number(request.headers.get('content-length'))>20000)return reply({error:'內容太長。'},413);
   const raw=await request.text();if(raw.length>20000)return reply({error:'內容太長。'},413);
   let d;try{d=JSON.parse(raw)}catch{return reply({error:'留言格式不正確。'},400)}
   const s=shots.get(d.shotId);if(!s)return reply({error:'找不到此鏡號，請重新整理頁面。'},400);
   if(d.projectVersion!==project.version)return reply({error:'剪輯版本已更新，請先保存草稿再重新整理時間碼。'},409);
   if(d.promptVersion!==s.promptVersion)return reply({error:'提示詞已更新。請先複製草稿，再重新整理並對照新版。'},409);
   if(typeof d.id!=='string'||! /^[0-9a-f-]{36}$/i.test(d.id))return reply({error:'留言識別碼無效。'},400);
   if(typeof d.author!=='string'||!d.author.trim()||d.author.trim().length>80)return reply({error:'請填寫姓名或暱稱（最多80字）。'},400);
   if(typeof d.text!=='string'||!d.text.trim()||d.text.trim().length>4000)return reply({error:'請填寫意見（最多4000字）。'},400);
   const max=project.videos.find(v=>v.id===s.video).duration;
   if(d.time!==null&&(!Number.isFinite(d.time)||d.time<0||d.time>max))return reply({error:'影片時間超出範圍。'},400);
   const existing=await store.get(d.shotId,d.id);if(existing)return reply({comment:existing,duplicate:true});
   const row={id:d.id,shotId:s.id,shotTitle:s.title,video:s.video,time:d.time,author:d.author.trim(),text:d.text.trim(),promptVersion:s.promptVersion,promptKind:s.promptKind,promptZhSnapshot:s.promptZh||null,promptZhVersion:s.promptZhVersion||null,promptSnapshot:s.prompt+(s.motionPrompt?'\n\nVideo motion prompt:\n'+s.motionPrompt:''),projectVersion:project.version,createdAt:new Date().toISOString()};
   await store.put(row);return reply({comment:row},201);
  }catch(error){console.error('comments store error',error.message);return reply({error:'意見尚未儲存到團隊資料庫，請保留草稿並重試。'},503)}
 };
}

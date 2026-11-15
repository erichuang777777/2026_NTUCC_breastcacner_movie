const enc = new TextEncoder();
export async function signature(text, secret) {
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function authorized(request,secret){
 if(!secret)return true;
 const value=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('hope_session='))?.slice(13);
 if(!value)return false;
 const [expiry,sig]=value.split('.');if(!/^\d+$/.test(expiry)||Number(expiry)<Date.now()||Number(expiry)>Date.now()+8*86400000)return false;
 return sig===await signature(expiry,secret);
}
export async function session(request,secret){
 if(request.method==='GET')return Response.json({authenticated:await authorized(request,secret),protected:!!secret});
 if(request.method==='DELETE')return new Response(null,{status:204,headers:{'set-cookie':'hope_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'}});
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 let data;try{data=await request.json()}catch{return Response.json({error:'請輸入團隊密碼。'},{status:400})}
 if(secret&&data.password!==secret)return Response.json({error:'密碼不正確，請向專案負責人確認。'},{status:401});
 const expiry=String(Date.now()+7*86400000);const cookie=`hope_session=${expiry}.${await signature(expiry,secret||'link-mode')}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${new URL(request.url).protocol==='https:'?'; Secure':''}`;
 return Response.json({ok:true},{headers:{'set-cookie':cookie,'cache-control':'no-store'}});
}

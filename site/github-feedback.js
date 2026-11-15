export const REPO='erichuang777777/2026_NTUCC_breastcacner_movie';
export function issueURL({shot,project,author,text,time,site}){
 const meta={shotId:shot.id,promptVersion:shot.promptVersion,projectVersion:project.version,time,video:shot.video};
 const body=`## 觀察與修改建議\n${text.trim()}\n\n## 分鏡資料\n- 鏡號：${shot.id}\n- 標題：${shot.title}\n- 提供者：${author}\n- 影片時間：${time===null?'未指定':time+' 秒'}\n- 提示詞版本：${shot.promptVersion}\n- 剪輯版本：${project.version}\n- [返回分鏡](${site}#shot-${shot.id})\n\n<!-- hope-review:${JSON.stringify(meta)} -->`;
 const url=`https://github.com/${REPO}/issues/new?`+new URLSearchParams({title:`[審片][${shot.id}] ${shot.title}`,body});
 if(url.length>8000)throw Error('意見較長，請縮短後開啟 Issue，再在 GitHub 補上完整內容。');return url;
}
export function parseIssue(i){
 if(i.pull_request)return null;const m=i.body?.match(/<!-- hope-review:(.*?) -->/s);if(!m)return null;
 try{const d=JSON.parse(m[1]);if(typeof d.shotId!=='string'||!/^https:\/\/github\.com\//.test(i.html_url))return null;return {...d,id:String(i.id),author:i.user?.login||'GitHub 使用者',text:i.body.split('## 分鏡資料')[0].replace(/^## 觀察與修改建議\s*/,''),createdAt:i.created_at,url:i.html_url,state:i.state,number:i.number};}catch{return null}
}
export async function fetchIssues(){let rows=[];for(let page=1;page<=20;page++){const r=await fetch(`https://api.github.com/repos/${REPO}/issues?state=all&per_page=100&page=${page}`,{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw Error(r.status===403||r.status===429?'GitHub 讀取額度暫時用完，請直接至 Issues 查看。':'無法讀取 GitHub Issues，草稿仍保留。');const batch=await r.json();rows.push(...batch.map(parseIssue).filter(Boolean));if(batch.length<100)return rows;}throw Error('意見超過單次讀取範圍，請至 GitHub Issues 查看全部。')}

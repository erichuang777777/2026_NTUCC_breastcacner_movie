# 希望之島｜微電影團隊審片室

網站：https://erichuang777777.github.io/2026_NTUCC_breastcacner_movie/

`site/` 是公開網站，含 720p HLS 影片、分鏡腳本、提示詞、角色設定與素材下載。推送 main 後由 GitHub Actions 部署 Pages。

## 團隊意見

成員直接在分鏡填姓名或暱稱及意見，無需 GitHub 帳號。送出後先保存到 Netlify，GitHub Actions 以排程轉為 Issue。網頁顯示保存與同步狀態，Issue 包含鏡號、時間碼及提交時的提示詞快照。有 GitHub 帳號者可到 Issue 回覆；其餘成員可繼續在網頁補充留言。

網頁與意見皆公開；姓名是填寫者自行提供，未經帳號驗證。

## 影片版本

首頁為已存在的整合主片；全片影音生成頁為部署時的進度快照，GB10 完成後需要同步素材並再次部署，並非遠端即時監控。

## 免 GitHub 帳號留言（現行流程）

成員直接在網站填姓名與意見，後端 `feedback/` 部署至 Netlify，只負責儲存留言，不持有 GitHub 個人權杖。GitHub Actions `feedback.yml` 每約 10 分鐘讀取待同步留言，以儲存庫內建 GITHUB_TOKEN 建立 Issue，並回寫連結。排程可能延遲；頁面明確顯示等待同步。重試會依留言 ID 尋找既有 Issue，避免重複建立。GitHub 回覆在 Issue 閱讀。

GitHub 與 Netlify 需配置同一個 REVIEW_SYNC_SECRET，僅供後端同步，禁止放進 site/。公開 POST 限定網站來源並限制每 IP 每分鐘 6 則，姓名為自行填寫未驗證。正式網頁：https://erichuang777777.github.io/2026_NTUCC_breastcacner_movie/

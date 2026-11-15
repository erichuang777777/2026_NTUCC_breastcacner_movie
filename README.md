# 希望之島｜微電影團隊審片室

網站：https://erichuang777777.github.io/2026_NTUCC_breastcacner_movie/

`site/` 是公開網站，含 720p HLS 影片、分鏡腳本、提示詞、角色設定與素材下載。推送 main 後由 GitHub Actions 部署 Pages。

## 團隊意見

在分鏡填寫意見，開啟預填 GitHub Issue，登入後按 Create 送出。每則帶有鏡號、提示詞版本、剪輯版本與影片時間；網頁透過 GitHub 公開 API 讀回 Issue（含已結案），回覆在 GitHub 查看。未送出草稿只留在自己的瀏覽器；不會因開啟 Issue 視窗就顯示提交成功。不需要在前端配置權杖。

網頁和 Issue 均為公開內容。API 額度用完時可直接到 Issues 閱讀。

## 影片版本

首頁為已存在的整合主片；全片影音生成頁為部署時的進度快照，GB10 完成後需要同步素材並再次部署，並非遠端即時監控。

## 免 GitHub 帳號留言（現行流程）

成員直接在網站填姓名與意見，後端 `feedback/` 部署至 Netlify，只負責儲存留言，不持有 GitHub 個人權杖。GitHub Actions `feedback.yml` 每約 10 分鐘讀取待同步留言，以儲存庫內建 GITHUB_TOKEN 建立 Issue，並回寫連結。排程可能延遲；頁面明確顯示等待同步。重試會依留言 ID 尋找既有 Issue，避免重複建立。GitHub 回覆在 Issue 閱讀。

GitHub 與 Netlify 需配置同一個 REVIEW_SYNC_SECRET，僅供後端同步，禁止放進 site/。公開 POST 限定網站來源並限制每 IP 每分鐘 6 則，姓名為自行填寫未驗證。正式網頁：https://erichuang777777.github.io/2026_NTUCC_breastcacner_movie/

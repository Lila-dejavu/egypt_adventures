# bump_version.ps1
# 作用：自動將 index.html 中的 Version x.y.z 裡的 patch 值 +1，
# 同時把 main.js?v=... 的 query 參數更新為當前時間戳記，避免快取問題。
# 使用方式（在專案根目錄執行）：
#   powershell -ExecutionPolicy Bypass -File .\bump_version.ps1

param(
    [string]$IndexPath = "index.html"
)

if (-not (Test-Path $IndexPath)) {
    Write-Error "找不到 $IndexPath。請在專案根目錄執行此腳本。"
    exit 1
}

$content = Get-Content $IndexPath -Raw -ErrorAction Stop

# 1) 將 Version x.y.z 的 patch +1
$versionRegex = [regex]"Version\s+(\d+)\.(\d+)\.(\d+)"
if ($versionRegex.IsMatch($content)) {
    $newContent = [regex]::Replace($content, $versionRegex, [System.Text.RegularExpressions.MatchEvaluator]{ param($m)
        $major = [int]$m.Groups[1].Value
        $minor = [int]$m.Groups[2].Value
        $patch = [int]$m.Groups[3].Value + 1
        return "Version $major.$minor.$patch"
    })
} else {
    Write-Warning "index.html 中未找到 Version x.y.z 格式，未更新版本號。"
    $newContent = $content
}

# 2) 更新 main.js?v= query 參數為當前時間戳記（格式 yyyyMMdd-HHmmss）
$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$newContent = [regex]::Replace($newContent, 'main\.js\?v=[^"\'\s>]+', "main.js?v=$timestamp")

# 寫回檔案
Set-Content -Path $IndexPath -Value $newContent -Encoding UTF8

Write-Host "已更新 $IndexPath："
if ($versionRegex.IsMatch($content)) {
    $oldVer = ($versionRegex.Match($content)).Value
    $newVer = ($versionRegex.Match($newContent)).Value
    Write-Host "  版本： $oldVer -> $newVer"
}
Write-Host "  main.js query -> v=$timestamp"

# 額外提示
Write-Host "提示：請在提交前檢查變更，並在 commit 訊息中寫上新版號。"
<#
  D Solar Satis - otomatik guncelleyici (Windows Server, PowerShell 5.1, SYSTEM olarak 15 dakikada bir calisir)
  1) GitHub'daki surumler/manifest.json dosyasini okur.
  2) Yeni surum varsa paketi indirir; SHA256 ozetini ve RSA imzasini ACIK anahtarla dogrular. Dogrulanmayan paket UYGULANMAZ.
  3) Sunucuyu durdurur, veri kopyasi alir, ekranlari ve sema dosyalarini gunceller, semayi calistirir, sunucuyu baslatir.
  4) Saglik kontrolu gecmezse eski hale doner (veri, ekranlar, sema dosyalari) ve sunucuyu eski haliyle baslatir.
  Paket yalnizca pb_public ve pb_migrations icerigi tasir; betik veya program calistirmaz.
#>
param([string]$Kok = "C:\dsolar", [int]$Port = 8090,
      [string]$ManifestUrl = "https://raw.githubusercontent.com/burhan494/dsolar-satis/main/surumler/manifest.json")
$ErrorActionPreference = "Stop"
$GorevAdi = "DSolar Satis Sunucusu"
$log = "$Kok\log\guncelleyici.log"
function Yaz($m) { $s = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $m; Add-Content -Path $log -Value $s -Encoding UTF8 }
function Durum($surum, $durum, $mesaj) {
  $o = @{ surum = $surum; durum = $durum; mesaj = $mesaj; tarih = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss") } | ConvertTo-Json -Compress
  Set-Content -Path "$Kok\guncelleme-durum.json" -Value $o -Encoding UTF8
  if (Test-Path "$Kok\pb_public") { Set-Content -Path "$Kok\pb_public\surum.json" -Value $o -Encoding UTF8 }
}
function Saglik { for ($i = 0; $i -lt 30; $i++) { Start-Sleep 2; try { $r = Invoke-RestMethod "http://127.0.0.1:$Port/api/health" -TimeoutSec 5; if ($r.code -eq 200) { return $true } } catch {} }; return $false }
function Durdur { Stop-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue; Start-Sleep 2; Get-Process pocketbase -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep 1 }

New-Item -ItemType Directory -Force -Path "$Kok\log" | Out-Null
$kilit = "$Kok\guncelleyici.kilit"
if ((Test-Path $kilit) -and ((Get-Item $kilit).LastWriteTime -gt (Get-Date).AddMinutes(-30))) { exit 0 }
Set-Content $kilit (Get-Date) -Encoding ASCII
try {
  $mevcut = 0; if (Test-Path "$Kok\surum.txt") { $mevcut = [int]((Get-Content "$Kok\surum.txt" -Raw).Trim()) }
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $m = Invoke-RestMethod ($ManifestUrl + "?t=" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()) -TimeoutSec 30
  $yeni = [int]$m.surum
  if ($yeni -le $mevcut) { exit 0 }
  Yaz "Yeni surum bulundu: $mevcut -> $yeni"

  # Indir ve dogrula
  $taban = $ManifestUrl.Substring(0, $ManifestUrl.LastIndexOf("/surumler/") + 1)
  $zip = Join-Path $env:TEMP ("dsolar-" + $yeni + ".zip")
  Invoke-WebRequest -Uri ($taban + $m.paket) -OutFile $zip -UseBasicParsing -TimeoutSec 120
  $h = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
  if ($h -ne ([string]$m.sha256).ToLower()) { throw "Paket ozeti manifestle uyusmuyor." }
  $rsa = [System.Security.Cryptography.RSA]::Create()
  $rsa.FromXmlString((Get-Content "$Kok\app\imza-acik.xml" -Raw))
  $veri = [Text.Encoding]::UTF8.GetBytes("dsolar|" + $yeni + "|" + $h)
  $imza = [Convert]::FromBase64String([string]$m.imza)
  if (-not $rsa.VerifyData($veri, $imza, [System.Security.Cryptography.HashAlgorithmName]::SHA256, [System.Security.Cryptography.RSASignaturePadding]::Pkcs1)) { throw "Imza dogrulanamadi. Paket uygulanmadi." }
  Yaz "Paket dogrulandi (SHA256 ve imza)."
  $acik = Join-Path $env:TEMP ("dsolar-" + $yeni)
  if (Test-Path $acik) { Remove-Item $acik -Recurse -Force }
  Expand-Archive -Path $zip -DestinationPath $acik -Force
  foreach ($d in @("pb_public", "pb_migrations")) { if (-not (Test-Path "$acik\$d")) { throw "Pakette $d yok." } }
  Get-ChildItem $acik -Recurse -File | Where-Object { $_.Extension -notin @(".html", ".js", ".css", ".json", ".png", ".svg", ".ico", ".webmanifest", ".txt") } | ForEach-Object { throw "Pakette izin verilmeyen dosya: $($_.Name)" }

  # Uygula (yedekle -> kopyala -> sema -> baslat)
  Durdur
  $yedek = "$Kok\yedek\otomatik-$mevcut-to-$yeni-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  New-Item -ItemType Directory -Force -Path "$yedek\pb_data" | Out-Null
  Get-ChildItem "$Kok\pb_data" -Force | Where-Object { $_.Name -ne "backups" } | Copy-Item -Destination "$yedek\pb_data" -Recurse -Force
  Copy-Item "$Kok\pb_migrations" "$yedek\pb_migrations" -Recurse -Force
  Copy-Item "$Kok\pb_public" "$yedek\pb_public" -Recurse -Force
  Yaz "Veri kopyasi: $yedek"
  try {
    Remove-Item "$Kok\pb_public\*" -Recurse -Force
    Copy-Item "$acik\pb_public\*" "$Kok\pb_public\" -Recurse -Force
    Copy-Item "$acik\pb_migrations\*" "$Kok\pb_migrations\" -Force
    $env:DSOLAR_PB_KEY = (Get-Content "$Kok\app\anahtar.txt" -Raw).Trim()
    $eap = $ErrorActionPreference; $ErrorActionPreference = "Continue"
    $o = & "$Kok\app\pocketbase.exe" migrate up --dir "$Kok\pb_data" --migrationsDir "$Kok\pb_migrations" --encryptionEnv DSOLAR_PB_KEY 2>&1; $kod = $LASTEXITCODE
    $ErrorActionPreference = $eap
    $o | ForEach-Object { $t = ($_ | Out-String).Trim(); if ($t -match "Applied|rror") { Yaz ("  " + $t) } }
    if ($kod -ne 0 -or (($o | Out-String) -match "failed to apply migration")) { throw "Sema guncellenemedi." }
    Start-ScheduledTask -TaskName $GorevAdi
    if (-not (Saglik)) { throw "Saglik kontrolu gecmedi." }
    Set-Content "$Kok\surum.txt" $yeni -Encoding ASCII
    Durum $yeni "basarili" ([string]$m.not)
    Yaz "Surum $yeni basariyla uygulandi."
  } catch {
    $neden = $_.Exception.Message
    Yaz "HATA: $neden  Eski hale donuluyor."
    Durdur
    Get-ChildItem "$Kok\pb_data" -Force | Where-Object { $_.Name -ne "backups" } | Remove-Item -Recurse -Force
    Copy-Item "$yedek\pb_data\*" "$Kok\pb_data\" -Recurse -Force
    Remove-Item "$Kok\pb_public\*" -Recurse -Force; Copy-Item "$yedek\pb_public\*" "$Kok\pb_public\" -Recurse -Force
    Remove-Item "$Kok\pb_migrations\*" -Force; Copy-Item "$yedek\pb_migrations\*" "$Kok\pb_migrations\" -Force
    Start-ScheduledTask -TaskName $GorevAdi
    $ok = Saglik
    Durum $mevcut "geri_alindi" ("Surum $yeni uygulanamadi: $neden. Eski surum " + $(if ($ok) { "calisiyor." } else { "baslamadi; BT kontrol etmeli." }))
    Yaz ("Geri alma tamam. Sunucu calisiyor: " + $ok)
  }
} catch {
  Yaz ("Guncelleme kontrolu hatasi: " + $_.Exception.Message)
} finally {
  Remove-Item $kilit -Force -ErrorAction SilentlyContinue
}

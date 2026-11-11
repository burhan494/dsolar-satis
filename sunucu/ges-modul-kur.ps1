#Requires -RunAsAdministrator
<#
  D Solar Satis - sunucu modulleri (iSolarCloud senkronu) ve hizli guncelleme kurulumu. BT bir kez calistirir.
  Kullanim (yonetici PowerShell, paketin acildigi klasorde):
      powershell -ExecutionPolicy Bypass -File .\ges-modul-kur.ps1
  Yapilanlar:
   1) C:\dsolar\pb_hooks klasoru ve iSolarCloud modulu (saatlik veri cekme) kurulur.
   2) Baslatma dosyasina --hooksDir eklenir (modul dosyalari yalniz imzali guncellemelerle degisir).
   3) Otomatik guncelleyici yenilenir (artik pb_hooks klasorunu da guncelleyip geri alabilir).
   4) Guncelleme kontrol sikligi 15 dakikadan 2 dakikaya indirilir.
  Once yedek alinir; modul calismazsa baslatma dosyasi eski haline doner.
#>
param([string]$Kok = "C:\dsolar", [int]$Port = 8090)
$ErrorActionPreference = "Stop"
$GorevAdi = "DSolar Satis Sunucusu"
$Rapor = New-Object System.Collections.Generic.List[string]
function Yaz($m) { $s = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $m; Write-Host $s; $Rapor.Add($s) }
function SadeceYonetici($yol) { & icacls $yol /inheritance:r /grant:r "*S-1-5-32-544:F" "*S-1-5-18:F" | Out-Null }
# Klasorler icin miras bayraklari sart: (OI)(CI) olmadan icerideki dosyalar hic izin almaz ve sunucu "Access is denied" ile acilmaz.
function SadeceYoneticiKlasor($yol) { & icacls $yol /inheritance:r /grant:r "*S-1-5-32-544:(OI)(CI)F" "*S-1-5-18:(OI)(CI)F" /T /C | Out-Null }
$kaynak = $PSScriptRoot
if (-not (Test-Path "$Kok\app\pocketbase.exe")) { throw "Kurulum bulunamadi ($Kok)." }
foreach ($f in @("pb_hooks\isc.pb.js", "pb_hooks\isc_lib.js", "guncelleyici.ps1")) { if (-not (Test-Path "$kaynak\$f")) { throw "Pakette $f yok." } }
$SaglikUrl = "http://127.0.0.1:$Port"; if (Test-Path "$Kok\saglik-adresi.txt") { $SaglikUrl = (Get-Content "$Kok\saglik-adresi.txt" -Raw).Trim() }
function Saglik { for ($i = 0; $i -lt 30; $i++) { Start-Sleep 2; try { $r = Invoke-RestMethod "$SaglikUrl/api/health" -TimeoutSec 5; if ($r.code -eq 200) { return $true } } catch {} }; return $false }
function ModulDurumu { try { Invoke-WebRequest -Uri "$SaglikUrl/api/dsolar/isc-senk" -Method Post -UseBasicParsing -TimeoutSec 10 | Out-Null; return 200 } catch { if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode } return 0 } }
Yaz "Kurulum basliyor: $Kok"

# 1) Yedek
$yedek = "$Kok\yedek\ges-modul-" + (Get-Date -Format "yyyyMMdd-HHmmss")
New-Item -ItemType Directory -Force -Path $yedek | Out-Null
Copy-Item "$Kok\app\baslat.cmd" "$yedek\baslat.cmd" -Force
if (Test-Path "$Kok\app\guncelleyici.ps1") { Copy-Item "$Kok\app\guncelleyici.ps1" "$yedek\guncelleyici.ps1" -Force }
Yaz "Yedek: $yedek"

# 2) Sunucuyu durdur, modulleri kopyala, baslatma dosyasini guncelle
Stop-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue; Start-Sleep 2
Get-Process pocketbase -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep 1
New-Item -ItemType Directory -Force -Path "$Kok\pb_hooks" | Out-Null
Copy-Item "$kaynak\pb_hooks\*" "$Kok\pb_hooks\" -Recurse -Force
SadeceYoneticiKlasor "$Kok\pb_hooks"
Yaz "Sunucu modulleri kopyalandi: $Kok\pb_hooks"
$bat = "$Kok\app\baslat.cmd"; $icerik = Get-Content $bat -Raw
if ($icerik -notmatch "--hooksDir") {
  $icerik = $icerik -replace '--migrationsDir', ('--hooksDir "' + $Kok + '\pb_hooks" --hooksWatch=false --migrationsDir')
  Set-Content -Path $bat -Value $icerik -Encoding ASCII -NoNewline
  Yaz "Baslatma dosyasina --hooksDir eklendi."
} else { Yaz "Baslatma dosyasi zaten --hooksDir iceriyor." }

# 3) Guncelleyiciyi yenile
Copy-Item "$kaynak\guncelleyici.ps1" "$Kok\app\guncelleyici.ps1" -Force
SadeceYonetici "$Kok\app\guncelleyici.ps1"
Yaz "Otomatik guncelleyici yenilendi."

# 4) Sunucuyu baslat ve modulu dogrula
Start-ScheduledTask -TaskName $GorevAdi
if (-not (Saglik)) {
  Yaz "UYARI: sunucu acilmadi; baslatma dosyasi eski haline donduruluyor."
  Stop-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue; Get-Process pocketbase -ErrorAction SilentlyContinue | Stop-Process -Force
  Copy-Item "$yedek\baslat.cmd" $bat -Force; Start-ScheduledTask -TaskName $GorevAdi
  Yaz ("Eski haliyle sunucu calisiyor: " + (Saglik))
} else {
  Yaz "Saglik kontrolu: API calisiyor."
  $d = ModulDurumu
  if ($d -eq 401 -or $d -eq 403 -or $d -eq 200) { Yaz "iSolarCloud modulu yuklu (uc nokta yanit veriyor: $d)." }
  else { Yaz "UYARI: iSolarCloud modulu yanit vermedi (kod $d). Log: $Kok\log\sunucu.log" }
}

# 5) Guncelleme sikligi: 2 dakika
try {
  $gt = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 2)
  Set-ScheduledTask -TaskName "DSolar Guncelleyici" -Trigger $gt | Out-Null
  Yaz "Guncelleme kontrolu artik 2 dakikada bir."
} catch { Yaz ("UYARI: guncelleme sikligi degistirilemedi: " + $_.Exception.Message) }

$Rapor | Set-Content "$Kok\ges-modul-raporu.txt" -Encoding UTF8
Write-Host ""
Write-Host "Bu pencerenin ekran goruntusunu ya da $Kok\ges-modul-raporu.txt dosyasini Claude'a gonderin." -ForegroundColor Yellow

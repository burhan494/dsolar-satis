#Requires -RunAsAdministrator
<#
  D Solar Satis - elle guncelleme ve otomatik guncelleyici kurulumu
  Paketteki surumu kurar, ilk yonetici hesabini (yoksa) olusturur ve 15 dakikada bir calisan imzali
  otomatik guncelleyiciyi kurar. Bundan sonraki guncellemeler BT islemi gerektirmez.
  Kullanim (yonetici PowerShell, paketin acildigi klasorde):
      powershell -ExecutionPolicy Bypass -File .\guncelle.ps1 -IlkYoneticiEposta "ad@firma.com" -IlkYoneticiAd "Ad Soyad"
  Ilk yonetici hesabi yoksa olusturulur; gecici sifre yalniz sunucuda, yonetici erisimli dosyaya yazilir.
  Guncellemeden once veri klasorunun kopyasi alinir. Mevcut veri silinmez.
#>
param(
  [string]$Kok = "C:\dsolar",
  [string]$IlkYoneticiEposta = "burhan@drk-enerji.com",
  [string]$IlkYoneticiAd = "Burhan Gokdemir",
  [int]$Port = 8090
)
$ErrorActionPreference = "Stop"
$GorevAdi = "DSolar Satis Sunucusu"
$Rapor = New-Object System.Collections.Generic.List[string]
function Yaz($m) { $s = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $m; Write-Host $s; $Rapor.Add($s) }
function RastgeleSifre([int]$n) {
  $harf = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  $b = New-Object byte[] $n; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  -join ($b | ForEach-Object { $harf[$_ % $harf.Length] })
}
function SadeceYonetici($yol) { & icacls $yol /inheritance:r /grant:r "*S-1-5-32-544:F" "*S-1-5-18:F" | Out-Null }
$pb = "$Kok\app\pocketbase.exe"
if (-not (Test-Path $pb)) { throw "Kurulum bulunamadi ($pb). Once kur.ps1 calistirilmali." }
$kaynak = $PSScriptRoot
Yaz "Guncelleme basliyor: $Kok"

# 1) Sunucuyu durdur
Stop-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue
Start-Sleep 2
Get-Process pocketbase -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep 1
Yaz "Sunucu durduruldu."

# 2) Veri kopyasi (geri donus icin)
$yedek = "$Kok\yedek\guncelleme-" + (Get-Date -Format "yyyyMMdd-HHmmss")
New-Item -ItemType Directory -Force -Path $yedek | Out-Null
Copy-Item "$Kok\pb_data\*" $yedek -Recurse -Force -Exclude "backups"
Copy-Item "$Kok\pb_migrations" "$yedek\pb_migrations" -Recurse -Force
if (Test-Path "$Kok\pb_public") { Copy-Item "$Kok\pb_public" "$yedek\pb_public" -Recurse -Force }
Yaz "Veri kopyasi alindi: $yedek"

# 3) Yeni dosyalar
New-Item -ItemType Directory -Force -Path "$Kok\pb_public" | Out-Null
Copy-Item "$kaynak\pb_migrations\*" "$Kok\pb_migrations\" -Force
Remove-Item "$Kok\pb_public\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$kaynak\pb_public\*" "$Kok\pb_public\" -Recurse -Force
Yaz "Uygulama ekranlari ve sema dosyalari kopyalandi."
$bat = "$Kok\app\baslat.cmd"; $icerik = Get-Content $bat -Raw
if ($icerik -notmatch "--publicDir") {
  $icerik = $icerik -replace '--migrationsDir', ('--publicDir "' + $Kok + '\pb_public" --migrationsDir')
  Set-Content -Path $bat -Value $icerik -Encoding ASCII -NoNewline
  Yaz "Baslatma dosyasina ekran klasoru eklendi."
}

# 4) Sema guncellemesi (+ ilk yonetici hesabi)
$env:DSOLAR_PB_KEY = (Get-Content "$Kok\app\anahtar.txt" -Raw).Trim()
$sifre = ""
if ($IlkYoneticiEposta) { $sifre = RastgeleSifre 14; $env:DSOLAR_ILK_EPOSTA = $IlkYoneticiEposta; $env:DSOLAR_ILK_SIFRE = $sifre; $env:DSOLAR_ILK_AD = $IlkYoneticiAd }
$eap = $ErrorActionPreference; $ErrorActionPreference = "Continue"
$o = & $pb migrate up --dir "$Kok\pb_data" --migrationsDir "$Kok\pb_migrations" --encryptionEnv DSOLAR_PB_KEY 2>&1; $kod = $LASTEXITCODE
$ErrorActionPreference = $eap
$o | ForEach-Object { $t = ($_ | Out-String).Trim(); if ($t -and $t -notmatch '^\[\d+(\.\d+)?ms\]' -and $t -notmatch '^(DEBUG|\S*\s*\{"error")' -and $t -notmatch 'resolveStaticRequestField') { Yaz ("  " + $t) } }
Remove-Item Env:\DSOLAR_ILK_SIFRE -ErrorAction SilentlyContinue
if ($kod -ne 0 -or (($o | Out-String) -match "failed to apply migration")) { throw "Sema guncellenemedi. Veri kopyasi: $yedek" }
Yaz "Sema guncel."
if ($IlkYoneticiEposta) {
  $gizli = "$Kok\GIZLI-ilk-giris.txt"
  Set-Content -Path $gizli -Value ("Uygulama: http://192.168.1.254:$Port`r`nKullanici: $IlkYoneticiEposta`r`nGecici sifre: $sifre`r`n(Hesap zaten varsa bu sifre GECERSIZDIR; mevcut sifre degismedi.)`r`nBu bilgiyi kisiye iletin ve dosyayi silin.") -Encoding UTF8
  SadeceYonetici $gizli
  Yaz "Ilk yonetici bilgisi: $gizli (yalniz yoneticiler acabilir)"
}

# 4b) Otomatik guncelleyici (imzali paketler, 15 dakikada bir)
Copy-Item "$kaynak\guncelleyici.ps1" "$Kok\app\guncelleyici.ps1" -Force
Copy-Item "$kaynak\imza-acik.xml" "$Kok\app\imza-acik.xml" -Force
SadeceYonetici "$Kok\app\guncelleyici.ps1"; SadeceYonetici "$Kok\app\imza-acik.xml"
$surum = (Get-Content "$kaynak\surum.txt" -Raw).Trim()
Set-Content "$Kok\surum.txt" $surum -Encoding ASCII
$ge = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ("-NoProfile -ExecutionPolicy Bypass -File `"$Kok\app\guncelleyici.ps1`" -Kok `"$Kok`" -Port $Port")
$gt = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) -RepetitionInterval (New-TimeSpan -Minutes 15)
$gs = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 20) -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$gp = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "DSolar Guncelleyici" -Action $ge -Trigger $gt -Settings $gs -Principal $gp -Force | Out-Null
Yaz "Otomatik guncelleyici kuruldu (15 dakikada bir, imza dogrulamali). Surum: $surum"
$dj = @{ surum = [int]$surum; durum = "basarili"; mesaj = "Elle kurulum"; tarih = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss") } | ConvertTo-Json -Compress
Set-Content "$Kok\pb_public\surum.json" $dj -Encoding UTF8

# 5) Yeniden baslat ve kontrol
Start-ScheduledTask -TaskName $GorevAdi
$tamam = $false
for ($i = 0; $i -lt 30; $i++) { Start-Sleep 2
  try { $r = Invoke-RestMethod "http://127.0.0.1:$Port/api/health" -TimeoutSec 5; if ($r.code -eq 200) { $tamam = $true; break } } catch {} }
if (-not $tamam) { Yaz "UYARI: sunucu 60 sn icinde cevap vermedi. Log: $Kok\log\sunucu.log  Veri kopyasi: $yedek" }
else {
  Yaz "Saglik kontrolu: API calisiyor."
  try { $s = Invoke-WebRequest "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 10; if ($s.Content -match "D Solar Sat") { Yaz "Uygulama ekrani yayinda: http://192.168.1.254:$Port" } else { Yaz "UYARI: ana sayfa beklenen icerigi vermedi." } }
  catch { Yaz "UYARI: ana sayfa acilamadi: $($_.Exception.Message)" }
}
$Rapor | Set-Content "$Kok\guncelleme-raporu.txt" -Encoding UTF8
Write-Host ""
Write-Host "Bu pencerenin ekran goruntusunu ya da $Kok\guncelleme-raporu.txt dosyasini Claude'a gonderin (GIZLI dosyalari GONDERMEYIN)." -ForegroundColor Yellow

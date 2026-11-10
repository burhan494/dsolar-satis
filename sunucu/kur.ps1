#Requires -RunAsAdministrator
<#
  D Solar Satis - TEST sunucusu kurulumu (Windows Server 2022, PowerShell 5.1)
  Kullanim (yonetici PowerShell):
      powershell -ExecutionPolicy Bypass -File .\kur.ps1
  Varsayilan: yalniz ic ag / VPN'den erisilen TEST kurulumu, http://192.168.1.254:8090
  Internete acik HTTPS kurulum (satis.dsolar.net) ayri asama: DNS kaydi Burhan Bey onayindan sonra eklenir,
  sonra:  .\kur.ps1 -Alan satis.dsolar.net
  Betik tekrar calistirilabilir; mevcut veriyi silmez.
#>
param(
  [string]$Kok = "C:\dsolar",
  [string]$Alan = "",
  [int]$Port = 8090,
  [string]$IzinliAg = "LocalSubnet",
  [string]$YoneticiEposta = "sunucu-yonetici@dsolar.net"
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$PB_SHA256 = "21A9D960BA98F92C7A307AF5835CAE474506D22DA5735AF18BCD2217EB5B4B0B"
$GorevAdi = "DSolar Satis Sunucusu"
$Rapor = New-Object System.Collections.Generic.List[string]
function Yaz($m) { $s = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $m; Write-Host $s; $Rapor.Add($s) }
function RastgeleSifre([int]$n) {
  $harf = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  $b = New-Object byte[] $n; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  -join ($b | ForEach-Object { $harf[$_ % $harf.Length] })
}
function SadeceYonetici($yol) { & icacls $yol /inheritance:r /grant:r "*S-1-5-32-544:F" "*S-1-5-18:F" | Out-Null }

Yaz "D Solar TEST kurulumu basliyor. Klasor: $Kok"
$kaynak = $PSScriptRoot
foreach ($d in @($Kok, "$Kok\app", "$Kok\pb_data", "$Kok\pb_migrations", "$Kok\log")) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

# 1) Dosyalar ve butunluk kontrolu (pocketbase.exe pakette yoksa resmi GitHub surumunden indirilir)
if (-not (Test-Path "$kaynak\pocketbase.exe")) {
  $url = "https://github.com/pocketbase/pocketbase/releases/download/v0.36.5/pocketbase_0.36.5_windows_amd64.zip"
  $zip = Join-Path $env:TEMP "pocketbase_0.36.5_windows_amd64.zip"
  Yaz "pocketbase.exe pakette yok; resmi surum indiriliyor: $url"
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  $zh = (Get-FileHash $zip -Algorithm SHA256).Hash
  if ($zh -ne "546A520E589E68865DCFF2F8DCA701EF92240CDD599D18186F230284180BB7C2") { throw "Indirilen zip ozeti beklenen degil ($zh). Kurulum durduruldu." }
  $acik = Join-Path $env:TEMP "pocketbase_0365"; Expand-Archive -Path $zip -DestinationPath $acik -Force
  Copy-Item "$acik\pocketbase.exe" "$Kok\app\pocketbase.exe" -Force
} else { Copy-Item "$kaynak\pocketbase.exe" "$Kok\app\pocketbase.exe" -Force }
Copy-Item "$kaynak\pb_migrations\*" "$Kok\pb_migrations\" -Force
$h = (Get-FileHash "$Kok\app\pocketbase.exe" -Algorithm SHA256).Hash
if ($h -ne $PB_SHA256) { throw "pocketbase.exe ozeti beklenen degil ($h). Kurulum durduruldu." }
Yaz "pocketbase.exe dogrulandi (SHA256 eslesti, surum 0.36.5)."

# 2) Ayar sifreleme anahtari (yalniz yoneticiler ve SYSTEM okur)
$anahtarDosya = "$Kok\app\anahtar.txt"
if (-not (Test-Path $anahtarDosya)) { Set-Content -Path $anahtarDosya -Value (RastgeleSifre 32) -NoNewline -Encoding ASCII; SadeceYonetici $anahtarDosya; Yaz "Sifreleme anahtari olusturuldu." }
else { Yaz "Mevcut sifreleme anahtari korundu." }
$env:DSOLAR_PB_KEY = (Get-Content $anahtarDosya -Raw).Trim()
$pb = "$Kok\app\pocketbase.exe"
$ortak = @("--dir", "$Kok\pb_data", "--migrationsDir", "$Kok\pb_migrations", "--encryptionEnv", "DSOLAR_PB_KEY")
function PB([string[]]$a) {
  $eap = $ErrorActionPreference; $ErrorActionPreference = "Continue"
  $o = & $pb @a 2>&1; $kod = $LASTEXITCODE; $ErrorActionPreference = $eap
  $o | ForEach-Object { $t = ($_ | Out-String).Trim(); if ($t -and $t -notmatch '^\[\d+(\.\d+)?ms\]') { Yaz ("  " + $t) } }
  return $kod
}

# 3) Gorev calisiyorsa durdur (guncelleme durumu)
$g = Get-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue
if ($g) { Stop-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue; Start-Sleep 2; Get-Process pocketbase -ErrorAction SilentlyContinue | Stop-Process -Force; Yaz "Calisan surum durduruldu." }

# 4) Veritabani semasi
$k = PB (@("migrate", "up") + $ortak)
if ($k -ne 0) { throw "Sema kurulamadi." }
Yaz "Veritabani semasi hazir (adaylar, teklifler, finans, komisyon, kesif fotograflari, roller)."

# 5) Sunucu yoneticisi hesabi (sifre yalniz bu sunucuda, yonetici erisimli dosyada)
$gizli = "$Kok\GIZLI-sunucu-yonetici.txt"
if (-not (Test-Path $gizli)) {
  $sifre = RastgeleSifre 24
  $k = PB (@("superuser", "upsert", $YoneticiEposta, $sifre) + $ortak)
  if ($k -ne 0) { throw "Yonetici hesabi olusturulamadi." }
  Set-Content -Path $gizli -Value ("Kullanici: $YoneticiEposta`r`nSifre: $sifre`r`nBu dosyayi kimseyle paylasmayin; giristen sonra panelden sifreyi degistirip MFA acin.") -Encoding UTF8
  SadeceYonetici $gizli
  Yaz "Sunucu yoneticisi olusturuldu. Bilgiler: $gizli (yalniz yoneticiler acabilir)."
} else { $sifre = ((Get-Content $gizli) | Where-Object { $_ -like "Sifre: *" }) -replace "^Sifre: ", ""; Yaz "Mevcut yonetici hesabi korundu." }

# 6) Calisma modu
if ($Alan) {
  foreach ($p in 80, 443) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -ne 0 }
    if ($c) { $ad = (Get-Process -Id $c[0].OwningProcess).ProcessName; if ($ad -ne "pocketbase") { throw "Port $p baska bir program tarafindan kullaniliyor ($ad). BT ile gorusun." } } }
  try { $ip = (Resolve-DnsName $Alan -Type A -ErrorAction Stop | Where-Object { $_.Type -eq "A" } | Select-Object -First 1).IPAddress } catch { $ip = "" }
  if (-not $ip) { throw "$Alan DNS'te bulunamadi. Once DNS A kaydi eklenmeli." }
  Yaz "DNS: $Alan -> $ip"
  $servis = "serve $Alan"; $adres = "https://$Alan"; $saglik = "https://$Alan"
  # Sunucu kendi adresini yerelden cozsun (saglik kontrolu ve guncelleyici icin; router NAT donusu gerekmez)
  $hosts = "$env:SystemRoot\System32\drivers\etc\hosts"
  if (-not (Select-String -Path $hosts -Pattern ("\s" + [regex]::Escape($Alan) + "\s*$") -Quiet)) { Add-Content -Path $hosts -Value ("`r`n127.0.0.1`t" + $Alan) -Encoding ASCII; Yaz "hosts dosyasina eklendi: 127.0.0.1 $Alan" }
  $kuralPort = "80,443"; $kuralUzak = "Any"
} else {
  $servis = "serve --http=0.0.0.0:$Port"; $adres = "http://192.168.1.254:$Port"; $saglik = "http://127.0.0.1:$Port"
  $kuralPort = "$Port"; $kuralUzak = $IzinliAg
}

# 7) Windows guvenlik duvari
Get-NetFirewallRule -DisplayName "DSolar Satis*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
New-NetFirewallRule -DisplayName "DSolar Satis ($kuralPort)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort ($kuralPort -split ",") -Program $pb -RemoteAddress ($kuralUzak -split ",") | Out-Null
Yaz "Guvenlik duvari kurali: TCP $kuralPort, izinli kaynak: $kuralUzak"

# 8) Baslatma dosyasi ve otomatik baslayan gorev (SYSTEM, cokerse 1 dk sonra yeniden)
$bat = "$Kok\app\baslat.cmd"
$satir = "@echo off`r`nset /p DSOLAR_PB_KEY=<`"$anahtarDosya`"`r`n`"$pb`" $servis --dir `"$Kok\pb_data`" --publicDir `"$Kok\pb_public`" --migrationsDir `"$Kok\pb_migrations`" --encryptionEnv DSOLAR_PB_KEY >> `"$Kok\log\sunucu.log`" 2>&1`r`n"
Set-Content -Path $bat -Value $satir -Encoding ASCII
SadeceYonetici $bat
$eylem = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$bat`""
$tetik = New-ScheduledTaskTrigger -AtStartup
$ayar = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$kim = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName $GorevAdi -Action $eylem -Trigger $tetik -Settings $ayar -Principal $kim -Force | Out-Null
Start-ScheduledTask -TaskName $GorevAdi
Yaz "Otomatik baslayan gorev kuruldu ve calistirildi: '$GorevAdi'"

# 8b) Otomatik guncelleyiciye saglik adresini bildir; yeni guncelleyici pakette varsa kur
Set-Content -Path "$Kok\saglik-adresi.txt" -Value $saglik -Encoding ASCII
if (Test-Path "$kaynak\guncelleyici.ps1") { Copy-Item "$kaynak\guncelleyici.ps1" "$Kok\app\guncelleyici.ps1" -Force; SadeceYonetici "$Kok\app\guncelleyici.ps1"; Yaz "Otomatik guncelleyici yenilendi." }

# 9) Saglik kontrolu
$tamam = $false
for ($i = 0; $i -lt 30; $i++) { Start-Sleep 2
  try { $r = Invoke-RestMethod "$saglik/api/health" -TimeoutSec 5; if ($r.code -eq 200) { $tamam = $true; break } } catch {} }
if (-not $tamam -and $Alan) { try { $r = Invoke-RestMethod "$adres/api/health" -TimeoutSec 10; $tamam = ($r.code -eq 200) } catch {} }
if (-not $tamam) { Yaz "UYARI: sunucu 60 sn icinde cevap vermedi. Log: $Kok\log\sunucu.log"; }
else { Yaz "Saglik kontrolu: API calisiyor." }

# 10) Ayarlar: gunluk yedek 03:00 (14 kopya), istek sinirlama, uygulama adi
if ($tamam) {
  try {
    $giris = Invoke-RestMethod "$saglik/api/collections/_superusers/auth-with-password" -Method Post -ContentType "application/json" -Body (@{ identity = $YoneticiEposta; password = $sifre } | ConvertTo-Json)
    $hd = @{ Authorization = $giris.token }
    $govde = @{ backups = @{ cron = "0 3 * * *"; cronMaxKeep = 14 }; rateLimits = @{ enabled = $true }; meta = @{ appName = "D Solar Satis (TEST)"; appURL = $adres } } | ConvertTo-Json -Depth 5
    $s = Invoke-RestMethod "$saglik/api/settings" -Method Patch -Headers $hd -ContentType "application/json" -Body $govde
    Yaz ("Ayarlar: yedek '{0}', {1} kopya; istek sinirlama: {2}" -f $s.backups.cron, $s.backups.cronMaxKeep, $s.rateLimits.enabled)
    $cols = (Invoke-RestMethod "$saglik/api/collections?perPage=100" -Headers $hd).items | ForEach-Object { $_.name }
    Yaz ("Koleksiyonlar: " + ($cols -join ", "))
  } catch { Yaz "UYARI: ayarlar uygulanamadi: $($_.Exception.Message)" }
}

Yaz "Bitti. Adres: $adres/_/  (yonetim paneli)."
Yaz "Kullanici bilgisi: $gizli"
$Rapor | Set-Content "$Kok\kurulum-raporu.txt" -Encoding UTF8
Write-Host ""
Write-Host "Bu pencerenin ekran goruntusunu ya da $Kok\kurulum-raporu.txt dosyasini Claude'a gonderin (sifre dosyasini GONDERMEYIN)." -ForegroundColor Yellow

#Requires -RunAsAdministrator
# D Solar Satis TEST sunucusunu durdurur ve kaldirir. Veri (C:\dsolar\pb_data) SILINMEZ.
param([string]$Kok = "C:\dsolar")
$GorevAdi = "DSolar Satis Sunucusu"
Stop-ScheduledTask -TaskName $GorevAdi -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $GorevAdi -Confirm:$false -ErrorAction SilentlyContinue
Get-Process pocketbase -ErrorAction SilentlyContinue | Stop-Process -Force
Get-NetFirewallRule -DisplayName "DSolar Satis*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
Write-Host "Durduruldu ve kaldirildi. Veri klasoru yerinde: $Kok\pb_data"

# auth
$user = '$cloud-backend-fs'
$pass = 'Hae6FroGkDjZx9JGnEsFrWpj2sXF4gLfeHAbYJl8eyPDo6ArTmluobgxYyyR'
$pair = "$($user):$($pass)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [Convert]::ToBase64String($bytes)

Invoke-RestMethod `
 -Uri "https://cloud-backend-fs-enfyewhphxfjaad8.scm.francecentral-01.azurewebsites.net/api/zipdeploy" `
 -Method POST `
 -Headers @{ Authorization = "Basic $base64" } `
 -InFile "cloud-backend.zip" `
 -ContentType "application/zip"

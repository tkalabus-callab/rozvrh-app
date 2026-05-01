$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$StartPort = 5500
$EndPort = 5599
$Listener = $null
$Port = $StartPort

for($CandidatePort = $StartPort; $CandidatePort -le $EndPort; $CandidatePort++){
  try{
    $Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $CandidatePort)
    $Listener.Start()
    $Port = $CandidatePort
    break
  }catch{
    $Listener = $null
  }
}

if(-not $Listener){
  Write-Host "Nepodarilo se spustit lokalni server na portech $StartPort az $EndPort."
  Write-Host "Zavri prosim jine testovaci instance aplikace a zkus to znovu."
  Read-Host "Stiskni Enter pro ukonceni"
  exit 1
}

function Get-MimeType($Path){
  switch([System.IO.Path]::GetExtension($Path).ToLowerInvariant()){
    ".html" { "text/html; charset=utf-8"; break }
    ".css"  { "text/css; charset=utf-8"; break }
    ".js"   { "text/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".md"   { "text/plain; charset=utf-8"; break }
    ".png"  { "image/png"; break }
    ".jpg"  { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".svg"  { "image/svg+xml"; break }
    default { "application/octet-stream" }
  }
}

function Write-Response($Stream, $StatusCode, $StatusText, $ContentType, [byte[]]$Body){
  $Header = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
  $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
  $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
  if($Body.Length -gt 0){
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$Url = "http://127.0.0.1:$Port/home.html"
Write-Host ""
Write-Host "Rozvrh app je spustena."
Write-Host "Adresa: $Url"
Write-Host ""
Write-Host "Toto okno nech otevrene po celou dobu prace s aplikaci."
Write-Host "Pro ukonceni aplikace zavri toto okno."
Write-Host ""

Start-Process $Url

while($true){
  $Client = $Listener.AcceptTcpClient()
  try{
    $Stream = $Client.GetStream()
    $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $RequestLine = $Reader.ReadLine()

    if([string]::IsNullOrWhiteSpace($RequestLine)){
      $Client.Close()
      continue
    }

    do{
      $Line = $Reader.ReadLine()
    }while($Line -ne $null -and $Line -ne "")

    $Parts = $RequestLine.Split(" ")
    $RequestPath = if($Parts.Length -ge 2){ $Parts[1] } else { "/" }
    $RequestPath = $RequestPath.Split("?")[0]
    $RequestPath = [System.Uri]::UnescapeDataString($RequestPath)

    if($RequestPath -eq "/"){
      $RequestPath = "/home.html"
    }

    $RelativePath = $RequestPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $RelativePath))
    $RootFullPath = [System.IO.Path]::GetFullPath($Root)

    if(-not $FullPath.StartsWith($RootFullPath, [System.StringComparison]::OrdinalIgnoreCase)){
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Pristup zamitnut.")
      Write-Response $Stream 403 "Forbidden" "text/plain; charset=utf-8" $Body
      continue
    }

    if(-not [System.IO.File]::Exists($FullPath)){
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Soubor nenalezen.")
      Write-Response $Stream 404 "Not Found" "text/plain; charset=utf-8" $Body
      continue
    }

    $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
    Write-Response $Stream 200 "OK" (Get-MimeType $FullPath) $Bytes
  }catch{
    try{
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Chyba serveru.")
      Write-Response $Stream 500 "Internal Server Error" "text/plain; charset=utf-8" $Body
    }catch{}
  }finally{
    $Client.Close()
  }
}

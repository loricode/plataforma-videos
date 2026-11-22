# Genera la locución de cada escena con la voz de Windows (offline, System.Speech).
# Uso: powershell -File narrar.ps1 <escenas.json> <carpeta-salida> [voz] [velocidad]
#   escenas.json: [{ "id": "s1", "text": "..." }, ...]  →  <carpeta>/s1.wav, ...
param(
  [Parameter(Mandatory = $true)][string]$Json,
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Voice = "Microsoft Helena Desktop",
  [int]$Rate = 0
)
Add-Type -AssemblyName System.Speech
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$scenes = Get-Content -Raw -Encoding UTF8 $Json | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $synth.SelectVoice($Voice) } catch { Write-Warning "Voz '$Voice' no disponible; se usa la predeterminada." }
$synth.Rate = $Rate
$synth.Volume = 100
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)

foreach ($s in $scenes) {
  $file = Join-Path $OutDir ("{0}.wav" -f $s.id)
  $synth.SetOutputToWaveFile($file, $format)
  $synth.Speak($s.text)
  $synth.SetOutputToNull()
}
$synth.Dispose()

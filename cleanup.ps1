# PowerShell script to safely remove [id] directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$idDir = Join-Path $scriptPath "app\groomers\[id]"
$logFile = Join-Path $scriptPath "cleanup.log"

Write-Host "Script running from: $scriptPath"
Write-Host "Attempting to remove directory: $idDir"

Add-Content $logFile "Cleanup operation started at: $(Get-Date)"
Add-Content $logFile "Working directory: $scriptPath"

if (Test-Path $idDir) {
    try {
        Remove-Item -Path $idDir -Recurse -Force
        $message = "Directory removed successfully at $(Get-Date)"
        Write-Host $message
        Add-Content $logFile $message
    } catch {
        $errorMsg = "Error removing directory: $_"
        Write-Host $errorMsg -ForegroundColor Red
        Add-Content $logFile $errorMsg
    }
} else {
    $message = "Directory not found: $idDir"
    Write-Host $message
    Add-Content $logFile $message
}

Add-Content $logFile "Cleanup operation completed at: $(Get-Date)"

# setup.ps1 for graphify initialization
New-Item -ItemType Directory -Force -Path "graphify-out" | Out-Null
$GRAPHIFY_PYTHON = $null

function Find-GraphifyPython {
    # 1. uv tool install
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        $uvDir = (uv tool dir 2>$null)
        if ($uvDir) {
            $uvDir = $uvDir.Trim()
            $py = Join-Path $uvDir "graphifyy\Scripts\python.exe"
            if (Test-Path $py) {
                & $py -c "import graphify" 2>$null
                if ($LASTEXITCODE -eq 0) { return $py }
            }
        }
    }
    # 2. pipx install
    if (Get-Command pipx -ErrorAction SilentlyContinue) {
        $venvs = (pipx environment --value PIPX_LOCAL_VENVS 2>$null)
        if ($venvs) {
            $venvs = $venvs.Trim()
            $py = Join-Path $venvs "graphifyy\Scripts\python.exe"
            if (Test-Path $py) {
                & $py -c "import graphify" 2>$null
                if ($LASTEXITCODE -eq 0) { return $py }
            }
        }
    }
    # 3. Active venv / conda / pip-into-current-env
    $pyCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pyCmd) {
        & $pyCmd.Source -c "import graphify" 2>$null
        if ($LASTEXITCODE -eq 0) {
            return (& $pyCmd.Source -c "import sys; print(sys.executable)").Trim()
        }
    }
    return $null
}

# Try to find the right Python
$GRAPHIFY_PYTHON = Find-GraphifyPython

# Not found — install then re-detect
if (-not $GRAPHIFY_PYTHON) {
    Write-Host "Graphify not found. Installing graphifyy..."
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        uv tool install --upgrade graphifyy -q 2>&1 | Select-Object -Last 3
    } else {
        pip install graphifyy -q 2>&1 | Select-Object -Last 3
    }
    $GRAPHIFY_PYTHON = Find-GraphifyPython
}

if ($GRAPHIFY_PYTHON) {
    $GRAPHIFY_PYTHON | Out-File -FilePath "graphify-out\.graphify_python" -Encoding utf8 -NoNewline
    (Resolve-Path ".").Path | Out-File -FilePath "graphify-out\.graphify_root" -Encoding utf8 -NoNewline
    Write-Host "Saved interpreter: $GRAPHIFY_PYTHON"
} else {
    Write-Error "Failed to locate Python interpreter with graphify"
}

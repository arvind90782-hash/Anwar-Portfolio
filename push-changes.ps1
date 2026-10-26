$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

git rev-parse --show-toplevel *> $null
if ($LASTEXITCODE -ne 0) {
    throw 'This folder is not inside a Git repository.'
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or -not $remote) {
    throw 'No Git remote named origin is configured for this repository.'
}

$changes = git status --short
if ($LASTEXITCODE -ne 0) {
    throw 'Could not read Git status.'
}
if (-not $changes) {
    Write-Host 'There are no changes to publish.'
    exit 0
}

Write-Host 'Changes currently in the project:'
git status --short
if ($LASTEXITCODE -ne 0) {
    throw 'Could not read Git status.'
}

$confirmation = Read-Host 'Stage all project changes? Type yes'
if ($confirmation -cne 'yes') {
    Write-Host 'Cancelled without staging or committing changes.'
    exit 0
}

git add --all
if ($LASTEXITCODE -ne 0) {
    throw 'Could not stage changes.'
}

git diff --cached --check
if ($LASTEXITCODE -ne 0) {
    throw 'The staged changes contain whitespace errors. Fix them before publishing.'
}

Write-Host ''
Write-Host 'Files staged for the commit:'
git status --short
if ($LASTEXITCODE -ne 0) {
    throw 'Could not read staged Git status.'
}

$commitConfirmation = Read-Host 'Commit and push these files to GitHub? Type yes'
if ($commitConfirmation -cne 'yes') {
    Write-Host 'Cancelled before committing. The changes remain staged.'
    exit 0
}

$message = Read-Host 'Commit message'
if ([string]::IsNullOrWhiteSpace($message)) {
    throw 'A commit message is required. Changes remain staged.'
}

git commit -m $message
if ($LASTEXITCODE -ne 0) {
    throw 'Git could not create the commit.'
}

$branch = git branch --show-current
if ($LASTEXITCODE -ne 0 -or -not $branch) {
    throw 'Could not determine the current Git branch.'
}

$upstream = git for-each-ref --format='%(upstream:short)' "refs/heads/$branch"
if ($LASTEXITCODE -ne 0) {
    throw 'Could not determine the current branch upstream.'
}

try {
    $ErrorActionPreference = 'Continue'
    if ($upstream) {
        $pushOutput = git push 2>&1
    } else {
        $pushOutput = git push --set-upstream origin $branch 2>&1
    }
    $pushExitCode = $LASTEXITCODE
} finally {
    $ErrorActionPreference = 'Stop'
}
$pushOutput | ForEach-Object { Write-Host $_ }
if ($pushExitCode -ne 0) {
    throw 'The commit was created, but pushing failed. Resolve the Git error and run git push.'
}

Write-Host 'Changes committed and pushed successfully.'

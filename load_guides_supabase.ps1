# PowerShell script to load guides to Supabase
# Usage: .\load_guides_supabase.ps1

# Load environment variables from .env.local
$env_file = ".\.env.local"
if (Test-Path $env_file) {
    Write-Host "📄 Reading $env_file..." -ForegroundColor Cyan
    $env_content = Get-Content $env_file
    foreach ($line in $env_content) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($key, $value)
        }
    }
} else {
    Write-Host "❌ File .env.local not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$apiKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $apiKey) {
    Write-Host "❌ Missing Supabase credentials in .env.local" -ForegroundColor Red
    Write-Host "Required:" -ForegroundColor Yellow
    Write-Host "  NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "  SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "📚 Loading guides from seed_guides.json..." -ForegroundColor Cyan
Write-Host "🔗 URL: $supabaseUrl" -ForegroundColor Gray

# Load guides JSON
$guides = Get-Content "./frontend/seed_guides.json" | ConvertFrom-Json

$loaded = 0
$errors = 0

foreach ($guide in $guides) {
    try {
        $body = @{
            id = $guide.id
            title = $guide.title
            description = $guide.description
            cover_emoji = $guide.cover_emoji
            cefr_level = $guide.cefr_level
            concept_tags = $guide.concept_tags
            estimated_minutes = $guide.estimated_minutes
            content = $guide.content
            mission_connection = $guide.mission_connection
            story_connection = $guide.story_connection
            scene_concepts = $guide.scene_concepts
            is_published = $guide.is_published
            created_at = $guide.created_at
        } | ConvertTo-Json -Depth 10

        # First delete existing guide with same ID
        $deleteUrl = "$supabaseUrl/rest/v1/guides?id=eq.$($guide.id)"
        $headers = @{
            "apikey" = $apiKey
            "Authorization" = "Bearer $apiKey"
            "Content-Type" = "application/json"
        }

        try {
            Invoke-WebRequest -Uri $deleteUrl -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
        } catch {}

        # Insert guide
        $insertUrl = "$supabaseUrl/rest/v1/guides"
        $response = Invoke-WebRequest -Uri $insertUrl -Method POST -Headers $headers -Body $body

        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host "✅ Guide '$($guide.title)' (ID: $($guide.id))" -ForegroundColor Green
            $loaded++
        } else {
            Write-Host "❌ Error loading guide $($guide.id): Status $($response.StatusCode)" -ForegroundColor Red
            $errors++
        }
    } catch {
        Write-Host "❌ Error processing guide $($guide.id): $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "✨ Complete! Loaded: $loaded, Errors: $errors" -ForegroundColor Green
if ($errors -eq 0) {
    Write-Host "All guides loaded successfully!" -ForegroundColor Green
    exit 0
} else {
    exit 1
}

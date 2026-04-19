# Start database services in the background
Write-Host "Starting database and redis..."
docker-compose up -d

# Give the DB a few seconds to initialize
Start-Sleep -Seconds 3

# Start the dev servers concurrently
Write-Host "Starting backend and frontend..."
npm run dev

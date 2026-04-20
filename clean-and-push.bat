@echo off
echo ========================================
echo Cleaning Git History and Pushing Fresh
echo ========================================
echo.

echo Step 1: Configuring git for large repository...
git config http.postBuffer 524288000
git config http.timeout 600
git config pack.windowMemory 256m
git config pack.packSizeLimit 256m

echo.
echo Step 2: Removing .git folder to start fresh...
rmdir /s /q .git

echo.
echo Step 3: Initializing new git repository...
git init

echo.
echo Step 4: Adding all files (cache/db files are now ignored)...
git add .

echo.
echo Step 5: Creating initial commit...
git commit -m "Initial commit: PitWall AI - F1 Strategy Analysis Platform"

echo.
echo Step 6: Renaming branch to main...
git branch -M main

echo.
echo Step 7: Adding remote...
git remote add origin https://github.com/KURO-1125/PItWall-AI.git

echo.
echo Step 8: Pushing to GitHub (this may take a few minutes)...
git push -u origin main --force

echo.
echo ========================================
echo Done!
echo ========================================
pause

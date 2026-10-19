@echo off

curl.exe --fail-with-body ^
  -X POST "http://localhost:3000/generate-latex" ^
  -H "Content-Type: application/json" ^
  --data-binary "@%~dp0request.json" ^
  --output "%~dp0generated-resume.tex"

if errorlevel 1 (
    echo LaTeX generation failed.
    exit /b 1
)

echo LaTeX file generated:
echo %~dp0generated-resume.tex
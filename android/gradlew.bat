@echo off
setlocal
set PRG=%~dp0
cd /d "%PRG%.."
set GRADLE_WRAPPER="%PRG%gradle\wrapper\gradle-wrapper.jar"
if exist %GRADLE_WRAPPER% (
	java -jar %GRADLE_WRAPPER% %*
) else (
	echo Gradle wrapper JAR not found. Continuing without wrapper.
	gradle %*
)
endlocal

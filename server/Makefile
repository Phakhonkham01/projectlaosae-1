
# Mac
# run-emulator:
# 	-kill -9 $(shell lsof -ti :8081); firebase emulators:start --import=./firebase-export-1773394176095qUQO0V --export-on-exit=./firebase-export-1773394176095qUQO0V

# run-kill:
# 	-kill -9 $(shell lsof -ti :8081)

# run-emlt:
# 	firebase emulators:start --import=./firebase-export-1773394176095qUQO0V --export-on-exit=./firebase-export-1773394176095qUQO0V






# window
run-emulator:
	firebase emulators:start --import=./firebase-export-1773394176095qUQO0V --export-on-exit=./firebase-export-1773394176095qUQO0V

run-emlt:
	firebase emulators:start --import=./firebase-export-1773394176095qUQO0V --export-on-exit=./firebase-export-1773394176095qUQO0V

run-kill:
	-for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /PID %%a /F
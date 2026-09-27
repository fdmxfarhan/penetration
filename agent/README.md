```
mkdir agent-release

Copy-Item "C:\Program Files\nodejs\node.exe" ".\agent-release\agent.exe"
Copy-Item ".\dist" ".\agent-release\dist" -Recurse
Copy-Item ".\config.json" ".\agent-release\config.json"
Copy-Item ".\package.json" ".\agent-release\package.json"
Copy-Item ".\package-lock.json" ".\agent-release\package-lock.json"

cd agent-release

npm install --omit=dev
```
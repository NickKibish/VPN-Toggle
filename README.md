# VPN-Toggle
Quickly connect and disconnect to your macOS VPN with a single button.

## Setup Instructions
### Setup WebSocket Server

1. Rename vpn_watcher_template.sh to vpn_watcher.sh (or make a copy of it and rename it).
Set correct paths in the script.

2. Make the script executable.
```bash
chmod +x vpn_watcher.sh
```

3. Create a Server Launch Agent Plist File
```bash
nano ~/Library/LaunchAgents/com.user.vpn_watcher.plist
```

Add the following content to the file:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.vpn_watcher</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/zsh</string>
        <string>/path/to/vpn_watcher.sh</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>WorkingDirectory</key>
    <string>/path/to/project/server</string>

    <key>StandardOutPath</key>
    <string>/path/to/project/logs/vpn_watcher.log</string>

    <key>StandardErrorPath</key>
    <string>/path/to/project/logs/vpn_watcher-error.log</string>
</dict>
</plist>
```

4. Load the Launch Agent
```bash
launchctl load ~/Library/LaunchAgents/com.user.vpn_watcher.plist
```

Verify the agent is loaded:
```bash
launchctl list | grep com.user.vpn_watcher
```

### Setup VPN Status Tracker
1. Rename `check_vpn_status_template.sh` to `check_vpn_status.sh` (or make a copy of it and rename it).
Set correct paths and VPN service name in the script.

2. Make the script executable.
```bash
chmod +x check_vpn_status.sh
```

3. Create a Launch Agent Plist File
```bash
nano ~/Library/LaunchAgents/com.user.vpnmonitor.plist
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.vpnmonitor</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/path/to/check_vpn_status.sh</string>
    </array>
    
    <!-- Option 1: Monitor Network Changes -->
    <key>WatchPaths</key>
    <array>
        <string>/Library/Preferences/SystemConfiguration</string>
    </array>

    <!-- Option 2: Periodic Trigger (Uncomment if WatchPaths doesn't work) -->
    <!--
    <key>StartInterval</key>
    <integer>60</integer>
    -->

    <key>RunAtLoad</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/path/to/project/logs/vpn_status.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/project/logs/vpn_error.log</string>
</dict>
</plist>
```
4. Load the Launch Agent
```bash
launchctl load ~/Library/LaunchAgents/com.user.vpnmonitor.plist
```

### Run Plugin
1. Go to `./vpn-toggle` directory.
2. Install Elgato CLI.
```bash
npm install -g @elgato/cli
```
3. Install dependencies.
```bash
npm install
```

4. Build the plugin.
``` bash
npm run build
```

5. Link the plugin.
```bash
streamdeck link com.john-doe.demo-plugin.sdPlugin
```
#!/bin/bash

VPN_NAME="VPN Name"
STATUS=$(networksetup -showpppoestatus "$VPN_NAME")

if [ "$STATUS" == "connected" ]; then
	echo "VPN is connected"
	# echo "VPN Status: $STATUS at $(date)" >> /Users/nick/Developer/scripts/logs/vpn_status.log
	# Add any actions for when the VPN connects
else
	echo "VPN is disconnected"
	# echo "VPN Status: $STATUS at $(date)" >> /Users/nick/Developer/scripts/logs/vpn_error.log
	# Add any actions for when the VPN disconnects
fi

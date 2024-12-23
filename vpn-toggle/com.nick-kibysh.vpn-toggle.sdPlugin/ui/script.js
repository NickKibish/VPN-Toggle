document.getElementById('connectButton').addEventListener('click', () => {
  const port = document.querySelector('sdpi-textfield[setting="port"]').value;

  if (!port) {
    alert('Please enter a port number.');
    return;
  }

  // Attempt to connect to the WebSocket server
  connectWebSocket(port);
});

// Enable Save button when network list changes
document.getElementById('networkList').addEventListener('input', () => {
  changeDisableSaveButton(false); // Enable Save button
});

// Disable Save button when it's clicked
document.getElementById('saveButton').addEventListener('click', async () => {
  const port = document.querySelector('sdpi-textfield[setting="port"]').value;
  const streamDeckClient = SDPIComponents.streamDeckClient;
  streamDeckClient.setGlobalSettings({ port: port });

  const networkName = document.getElementById('networkList').value;

  streamDeckClient.setSettings({
    networkName: networkName,
  });
  alert('Saved Network: ' + networkName);
  changeDisableSaveButton(true); // Disable Save button
});

// Function to toggle Save button's disabled state
function changeDisableSaveButton(disabled) {
  const saveButton = document.getElementById('saveButton');
  saveButton.disabled = disabled;
}

// WebSocket and network selection functionality
function connectWebSocket(port) {
  websocket = new WebSocket(`ws://localhost:${port}`);

  websocket.onopen = () => {
    console.log('WebSocket connected');
    enableNetworkSelection();
    requestNetworks();
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'networks') {
      populateNetworkList(message.data);
    } else if (message.type === 'success') {
      alert(message.message);
    } else if (message.type === 'error') {
      alert(`Error: ${message.message}`);
    }
  };

  websocket.onclose = () => {
    console.log('WebSocket disconnected');
    disableNetworkSelection();
  };

  websocket.onerror = (error) => {
    alert('Failed to connect to WebSocket server.');
    console.error(error);
    disableNetworkSelection();
  };
}

function requestNetworks() {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ type: 'listNetworks' }));
  }
}

function populateNetworkList(networks) {
  const networkList = document.getElementById('networkList');
  networkList.innerHTML = ''; // Clear existing options

  networks.forEach((network) => {
    const option = document.createElement('option');
    option.value = network.name; // Store network ID
    option.textContent = network.name; // Display network name
    networkList.appendChild(option);
  });

  networkList.disabled = false;
}

function enableNetworkSelection() {
  document.getElementById('networkList').disabled = false;
}

function disableNetworkSelection() {
  const networkList = document.getElementById('networkList');
  networkList.disabled = true;
  networkList.innerHTML = '<option value="" disabled selected>Choose a network</option>'; // Reset options
}

// Initialize: Disable network selection and Save button by default
disableNetworkSelection();
changeDisableSaveButton(true);
let websocket;

// Connect to WebSocket server
function connectWebSocket() {
  websocket = new WebSocket('ws://localhost:8080');

  websocket.onopen = () => {
    console.log('WebSocket connected');
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
  };
}

// Request list of networks
function requestNetworks() {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ type: 'listNetworks' }));
  }
}

// Populate the dropdown with networks
function populateNetworkList(networks) {
  const networkList = document.getElementById('networkList');
  networkList.innerHTML = ''; // Clear existing options

  networks.forEach((network) => {
    const option = document.createElement('option');
    option.value = network.id;
    option.textContent = network.name;
    networkList.appendChild(option);
  });

  networkList.disabled = false;
  document.getElementById('connectButton').disabled = false;
}

// Handle "Connect" button click
document.getElementById('connectButton').addEventListener('click', () => {
  const selectedNetwork = document.getElementById('networkList').value;
  if (selectedNetwork) {
    websocket.send(JSON.stringify({ type: 'connectNetwork', network: selectedNetwork }));
  }
});

// Initialize WebSocket connection on page load
window.onload = connectWebSocket;
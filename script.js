let dataTimeoutHandle;  

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrPCrGIJ9DERLi_e6_dz48YsLulDmPebw",
  authDomain: "sunday-cf-emm.firebaseapp.com",
  databaseURL: "https://sunday-cf-emm-default-rtdb.firebaseio.com",
  projectId: "sunday-cf-emm",
  storageBucket: "sunday-cf-emm.firebasestorage.app",
  messagingSenderId: "165257248425",
  appId: "1:165257248425:web:88ad2489433cbb35aff3b8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const connectionStatus = document.getElementById('connectionStatus');

// Connection state monitoring
firebase.database().ref('.info/connected').on('value', (snapshot) => {
  if (snapshot.val() === true) {
    connectionStatus.classList.add('connected');
    connectionStatus.querySelector('span').textContent = 'Connected';
  } else {
    connectionStatus.classList.remove('connected');
    connectionStatus.querySelector('span').textContent = 'Disconnected';
  }
});

// Data storage for charts
let allPowerData = [];
let allEnergyData = [];
const currentTimeRange = 1; // ~1 hour (for test)
let currentEnergyRange = 24; // hours for energy chart

// Initialize charts
const powerCtx = document.getElementById("powerChart").getContext("2d");
const energyCtx = document.getElementById("energyChart").getContext("2d");

// Power Chart - Fixed to 1 hour
const powerChart = new Chart(powerCtx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Power (W)',
      data: [],
      borderColor: '#00ff9d',
      backgroundColor: 'rgba(0, 255, 157, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.2,
      pointRadius: 0,
      pointBackgroundColor: '#00ff9d',
      pointHoverRadius: 5
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa',
          maxTicksLimit: 10,
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Time',
          color: '#aaa',
          font: {
            size: 13
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Power (W)',
          color: '#aaa',
          font: {
            size: 13
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          boxWidth: 0,
          font: {
            size: 13
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#00ff9d',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return 'Power Consumption';
          },
          label: function(context) {
            return `Power: ${context.parsed.y.toFixed(2)} W`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
});

// Energy Chart
const energyChart = new Chart(energyCtx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Energy (kWh)',
      data: [],
      borderColor: '#00b8ff',
      backgroundColor: 'rgba(0, 184, 255, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointBackgroundColor: '#00b8ff',
      pointHoverRadius: 5
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Time',
          color: '#aaa',
          font: {
            size: 13
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#aaa',
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Energy (kWh)',
          color: '#aaa',
          font: {
            size: 13
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          boxWidth: 0,
          font: {
            size: 13
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#00b8ff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return 'Energy Usage';
          },
          label: function(context) {
            return `Energy: ${context.parsed.y.toFixed(3)} kWh`;
          }
        }
      }
    }
  }
});

// Update power chart with fixed 1-hour time range
function updatePowerChart() {
  const now = Date.now();
  const maxAge = currentTimeRange * 60 * 60 * 1000; // Convert to milliseconds (1 hour)
  
  // Filter data based on fixed time range
  const filteredData = allPowerData.filter(point => now - point.x <= maxAge);
  
  // Update chart
  powerChart.data.datasets[0].data = filteredData;
  powerChart.options.scales.x.time.unit = 'minute'; // Show minutes for 1-hour range
  powerChart.options.scales.x.time.displayFormats = {
    minute: 'HH:mm'
  };

  powerChart.options.scales.x.ticks.maxTicksLimit = 6; // Show 6 ticks
  
  powerChart.update('none');
}

// Update energy chart with time filter
function updateEnergyChart() {
  const now = Date.now();
  const maxAge = currentEnergyRange * 60 * 60 * 1000; // Convert to milliseconds
  
  // Filter data based on current time range
  const filteredData = allEnergyData.filter(point => now - point.x <= maxAge);
  
  // Update chart
  energyChart.data.datasets[0].data = filteredData;
  energyChart.update();
}

// Time range selectors for energy chart
document.querySelectorAll('#energy-range .time-range-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#energy-range .time-range-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentEnergyRange = parseInt(this.dataset.range);
    updateEnergyChart();
  });
});

// Listen for realtime data updates
database.ref('sensor_data').on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    document.getElementById('voltage').textContent = data.voltage.toFixed(2) + " V";
    document.getElementById('current').textContent = data.current.toFixed(2) + " A";
    document.getElementById('power').textContent = data.power.toFixed(2) + " W";
    document.getElementById('frequency').textContent = data.frequency.toFixed(2) + " Hz";
    document.getElementById('powerFactor').textContent = data.power_factor.toFixed(2);
    document.getElementById('energy').textContent = data.energy.toFixed(3) + " kWh";
    document.getElementById('carbonEmission').textContent = data.carbon_emission.toFixed(2) + " kg CO2e"; // Display carbon emission
    
    const timestamp = Date.now();
    
    // Add new power data point
    allPowerData.push({
      x: timestamp,
      y: data.power
    });
    
    // Add new energy data point
    allEnergyData.push({
      x: timestamp,
      y: data.energy
    });
    
    // Update charts
    updatePowerChart();
    updateEnergyChart();
  }
});

// Create relay controls for 4 relays + 1 main power
const relayLabels = ["Light 1", "Light 2", "Outlet 1", "Outlet 2", "Main Power"];
const relayControls = document.getElementById("relayControls");

// Create icons array matching labels
const relayIcons = ["<i class=\"fas fa-lightbulb\"></i>", "<i class=\"fas fa-lightbulb\"></i>", "<i class=\"fas fa-plug\"></i>", "<i class=\"fas fa-plug\"></i>", "<i class=\"fas fa-power-off\"></i>"];

// Firebase references for relays
const relayRefs = relayLabels.map((_, i) => database.ref(`relays/relay${i + 1}`));
const mainPowerRef = database.ref('relays/main_power');

// Debounce mechanism to prevent rapid toggling
let isUpdating = false;

relayLabels.forEach((label, i) => {
  const relayId = `relay${i + 1}`;
  const isMainPower = label === "Main Power";

  const card = document.createElement("div");
  card.classList.add("control-card");
  card.innerHTML = `
    <div class="icon">${relayIcons[i]}</div>
    <div class="device-info">
        <p>${label}</p>
        <span>Status: Off</span>
    </div>
    <label class="switch">
        <input type="checkbox" id="${relayId}">
        <span class="slider round"></span>
    </label>
  `;
  relayControls.appendChild(card);

  const checkbox = card.querySelector(`#${relayId}`);
  const statusSpan = card.querySelector(".device-info span");

  // Firebase listener for each relay
  const currentRelayRef = isMainPower ? mainPowerRef : relayRefs[i];
  currentRelayRef.on('value', (snapshot) => {
    const state = snapshot.val();
    if (typeof state === 'boolean') {
      // Optimistic update: Only update UI if not currently being updated by user
      // or if the state from Firebase is different from the current UI state
      if (!isUpdating || checkbox.checked !== state) {
        checkbox.checked = state;
        statusSpan.textContent = `Status: ${state ? "On" : "Off"}`;
        card.classList.toggle("active", state);
      }
    }
  });

  // Event listener for user interaction
  checkbox.addEventListener('change', () => {
    if (isUpdating) return; // Prevent new updates while one is in progress

    isUpdating = true;
    const desiredState = checkbox.checked;

    // Optimistic UI update
    statusSpan.textContent = `Status: ${desiredState ? "On" : "Off"}`;
    card.classList.toggle("active", desiredState);

    if (isMainPower) {
      // Special logic for Main Power
      if (!desiredState) { // Main Power is turned OFF
        // Turn off all individual relays
        const updates = { 'main_power': false };
        relayLabels.slice(0, 4).forEach((_, idx) => {
          updates[`relay${idx + 1}`] = false;
        });
        database.ref('relays').update(updates)
          .then(() => {
            console.log("Main power and all relays turned OFF successfully.");
            isUpdating = false;
          })
          .catch((error) => {
            console.error("Error turning off main power and relays:", error);
            // Revert UI on error
            checkbox.checked = !desiredState;
            statusSpan.textContent = `Status: ${!desiredState ? "On" : "Off"}`;
            card.classList.toggle("active", !desiredState);
            isUpdating = false;
          });
      } else { // Main Power is turned ON
        // Only set main_power to true, do not force individual relays ON
        // Individual relays should retain their last state when main power is turned ON
        mainPowerRef.set(true)
          .then(() => {
            console.log("Main power turned ON successfully.");
            isUpdating = false;
          })
          .catch((error) => {
            console.error("Error turning on main power:", error);
            // Revert UI on error
            checkbox.checked = !desiredState;
            statusSpan.textContent = `Status: ${!desiredState ? "On" : "Off"}`;
            card.classList.toggle("active", !desiredState);
            isUpdating = false;
          });
      }
    } else {
      // Logic for individual relays
      currentRelayRef.set(desiredState)
        .then(() => {
          console.log(`${label} set to ${desiredState} successfully.`);
          isUpdating = false;
        })
        .catch((error) => {
          console.error(`Error setting ${label} to ${desiredState}:`, error);
          // Revert UI on error
          checkbox.checked = !desiredState;
          statusSpan.textContent = `Status: ${!desiredState ? "On" : "Off"}`;
          card.classList.toggle("active", !desiredState);
          isUpdating = false;
        });
    }
  });
});

// Load previous data
function loadHistoricalData() {
  const historyRef = database.ref('history');
  historyRef.once('value', snapshot => {
    const data = snapshot.val();
    if (!data) return;

    allPowerData = [];
    allEnergyData = [];

    Object.entries(data).forEach(([key, value]) => {
      const timestamp = parseInt(key) * 1000; // convert seconds to ms
      allPowerData.push({ x: timestamp, y: value.power });
      allEnergyData.push({ x: timestamp, y: value.energy });
    });

    updatePowerChart();
    updateEnergyChart();
  });
}

// Call to load previous data
loadHistoricalData();

// Clear existing timeout
if (dataTimeoutHandle) {
  clearTimeout(dataTimeoutHandle);
}

// Set a new 30s timeout to reset display
dataTimeoutHandle = setTimeout(() => {
  console.warn("No data received from ESP32 in 30 seconds. Resetting display.");
  
  // Reset card values to 0
  document.getElementById('voltage').textContent = "0.00 V";
  document.getElementById('current').textContent = "0.00 A";
  document.getElementById('power').textContent = "0.00 W";
  document.getElementById('frequency').textContent = "0.00 Hz";
  document.getElementById('powerFactor').textContent = "0.00";
  document.getElementById('energy').textContent = "0.00 kWh";
  document.getElementById('carbonEmission').textContent = "0.00 kg CO2e"; // Reset carbon emission

  // Optionally clear charts
  powerChart.data.datasets[0].data = [];
  energyChart.data.datasets[0].data = [];
  powerChart.update();
  energyChart.update();
}, 30000); // 30,000 ms = 30s

// // 1. We need a GeoJSON map imported 
// // 2. Merge the all_crimes_correlation_data.json with the GeoJSON map
// //    2.1 We won't be touching the outlines for the states 
// //    2.2 We will be adding the data to the states


// https://danielmargol.com/choropleth-map-google-maps/


// Define global variables at the top
var map = L.map('map').setView([37.8, -96], 4);
var geojsonLayer; // This will hold the GeoJSON layer for easy access and manipulation
var geojsonDataGlobal; // To store GeoJSON data globally after initial fetch
var transformedDataGlobal; // To store transformed correlation data globally


const idToStateAbbreviation = {
  "01": "AL", "02": "AK", "03": "AZ", "04": "AR", "05": "CA",
  "06": "CO", "07": "CT", "08": "DE", "09": "FL", "10": "GA",
  "11": "HI", "12": "ID", "13": "IL", "14": "IN", "15": "IA",
  "16": "KS", "17": "KY", "18": "LA", "19": "ME", "20": "MD",
  "21": "MA", "22": "MI", "23": "MN", "24": "MS", "25": "MO",
  "26": "MT", "27": "NE", "28": "NV", "29": "NH", "30": "NJ",
  "31": "NM", "32": "NY", "33": "NC", "34": "ND", "35": "OH",
  "36": "OK", "37": "OR", "38": "PA", "39": "RI", "40": "SC",
  "41": "SD", "42": "TN", "43": "TX", "44": "UT", "45": "VT",
  "46": "VA", "47": "WA", "48": "WV", "49": "WI", "50": "WY"
};



// Load and add the base tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// Function to determine fillColor based on Pearson r value
function getColor(pearsonR) {
    return pearsonR > 0.5 ? '#006837' :
           pearsonR > 0 ? '#78c679' :
           pearsonR > -0.5 ? '#ffffcc' :
                            '#d53e4f';
}


function loadDataAndInitializeMap() {
  Promise.all([
    fetch('Data/us-states.json').then(resp => resp.json()),
    fetch('Data/all_crimes_correlation_data.json').then(resp => resp.json())
  ])
  .then(([geojsonData, correlationData]) => {
    geojsonDataGlobal = geojsonData;
    transformedDataGlobal = transformCorrelationData(correlationData);
    populateCrimeDropdown(correlationData);
    
  })
  .catch(error => console.error('Error loading data:', error));
}


// Transform the correlation data
function transformCorrelationData(data) {
  const dataMap = {};
  data.forEach(item => {
      const state = item.data.State;
      const crimeType = item.data.Crime_Type;
      const pearsonR = parseFloat(item.data.Pearson_r); 
      const pValue = parseFloat(item.data.p_value); 

      if (!dataMap[state]) {
          dataMap[state] = {};
      }
      dataMap[state][crimeType] = { Pearson_r: pearsonR, p_value: pValue };
  });
  return dataMap;
}


// Populate crime selector dropdown
function populateCrimeDropdown(correlationData) {
  const crimeSelector = document.getElementById('crimeSelector');
  const crimeTypes = [...new Set(correlationData.map(item => item.data.Crime_Type))];
  
  crimeTypes.forEach(crimeType => {
      const option = document.createElement('option');
      option.value = crimeType;
      option.text = crimeType;
      crimeSelector.appendChild(option);
  });

  // Add event listener for when the crime type changes
  crimeSelector.addEventListener('change', function() {
    const selectedCrimeType = this.value;
    console.log("Selected crime type:", selectedCrimeType); // Debugging line
    // Call function to update the map based on the selected crime type
    updateMapForCrimeType(selectedCrimeType);
});
}



function updateMapForCrimeType(selectedCrimeType) {
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(geojsonDataGlobal, {
    style: function(feature) {
      // Use the state ID to get the abbreviation
      const stateAbbreviation = idToStateAbbreviation[feature.id];
      // Then use the abbreviation to get the data
      const stateData = transformedDataGlobal[stateAbbreviation];
      const pearsonR = stateData && stateData[selectedCrimeType] ? stateData[selectedCrimeType].Pearson_r : null;
      return {
          fillColor: getColor(pearsonR),
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7
      };
    },
    onEachFeature: function(feature, layer) {
      const stateAbbreviation = idToStateAbbreviation[feature.id];
      const stateData = transformedDataGlobal[stateAbbreviation];
      if (stateData && stateData[selectedCrimeType]) {
        const crimeData = stateData[selectedCrimeType];
        layer.bindPopup(`${feature.properties.name}: Pearson R = ${crimeData.Pearson_r}, P-value = ${crimeData.p_value}`);
      } else {
        console.log(`Data for ${selectedCrimeType} in ${stateAbbreviation} is undefined.`);
      }
    }
  }).addTo(map);
}

loadDataAndInitializeMap();
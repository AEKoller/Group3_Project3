var map = L.map('map').setView([37.8, -96], 4); // Unified map instance
var geojsonLayer; // For Choropleth GeoJSON layer
var bubbleLayers = L.layerGroup().addTo(map); // To hold Bubble Map markers
var geojsonDataGlobal; // To store GeoJSON data globally
var transformedDataGlobal; // To store transformed data for both visualizations
var stateMapping = {}; // Mapping for state abbreviations to names, useful for both

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

function createStateMapping(geojsonData) {
    const mapping = {};
    geojsonData.features.forEach(feature => {
        const stateId = feature.properties.ID; 
        const stateAbbreviation = idToStateAbbreviation[stateId];
        mapping[stateId] = stateAbbreviation;
    });
    return mapping;
};

// Unified function to fetch and process data
async function fetchDataAndInitialize() {
    try {
      const responses = await Promise.all([
        fetch('Data/us-states.json'),
        fetch('Data/all_crimes_correlation_data.json'),
        // Add other data sources as needed
      ]);
      const [geojsonData, correlationData] = await Promise.all(responses.map(r => r.json()));
  
      // Store GeoJSON data for Choropleth
      geojsonDataGlobal = geojsonData;
  
      // Process and store data for both visualizations
      transformedDataGlobal = transformCorrelationData(correlationData);
      stateMapping = createStateMapping(geojsonData);
  
      // Initialize visualizations
      initializeChoropleth();
      initializeBubbleMap();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

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
  };

function initializeChoropleth() {
    if (geojsonLayer) { // Check if a layer already exists
        map.removeLayer(geojsonLayer); // Remove existing layer if present
    }

    geojsonLayer = L.geoJSON(geojsonDataGlobal, {
        style: function(feature) {
            // Use state ID to get corresponding data for coloring
            const stateAbbreviation = idToStateAbbreviation[feature.id];
            const stateData = transformedDataGlobal[stateAbbreviation];
            const pearsonR = stateData ? stateData.Pearson_r : 0; // Example data attribute
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
            if (stateData) {
                layer.bindPopup(`State: ${stateAbbreviation}<br>Pearson R: ${stateData.Pearson_r}`);
            }
        }
    }).addTo(map);
};

function initializeBubbleMap() {
    // Clear existing markers
    bubbleLayers.clearLayers();
  
    // Assuming your transformed data includes latitude, longitude, and some value to size the bubbles
    transformedDataGlobal.forEach(dataItem => {
      const marker = L.circleMarker([dataItem.latitude, dataItem.longitude], {
        radius: calculateRadiusBasedOnValue(dataItem.value), // Define this function based on your data
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup(`Detail: ${dataItem.detail}`); // Customize popup content
  
      bubbleLayers.addLayer(marker);
    });
  };
// 1. We need a GeoJSON map imported 
// 2. 

// Creating the map object
var map = L.map('map').setView([37.8, -96], 4);
var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



function style(feature) {
  return {
      fillColor: getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
};

d3.json('../clean_data/avg_crime_rates.json')
    .then(data => {
      
      console.log(data)
      
    })

    d3.json('../clean_data/unemployment_year_state.json')
    .then(data => {
      
      console.log(data)
      
    })


fetch('Data/all_crimes_correlation_data.json')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Creating the map object
var map = L.map('map').setView([37.8, -96], 4);
var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function getColor(d) {
  return d > 1000 ? '#800026' :
         d > 500  ? '#BD0026' :
         d > 200  ? '#E31A1C' :
         d > 100  ? '#FC4E2A' :
         d > 50   ? '#FD8D3C' :
         d > 20   ? '#FEB24C' :
         d > 10   ? '#FED976' :
                    '#FFEDA0';
}

function style(feature) {
  return {
      fillColor: getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
}

var app = angular.module('plunker', []);

app.controller('MainCtrl', function($scope, $http) {
  vm = this;

  // Set the Map Options to be applied when the map is set.
  var mapOptions = {
    zoom: 4,
    scrollwheel: false,
    center: new google.maps.LatLng(40.00, -98),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN]
    }
  }

  // Set a blank infoWindow to be used for each to state on click
  var infoWindow = new google.maps.InfoWindow({
    content: ""
  });

  // Set the map to the element ID and give it the map options to be applied
  vm.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Create the state data layer and load the GeoJson Data
  var stateLayer = new google.maps.Data();
  stateLayer.loadGeoJson('https://gist.githubusercontent.com/dmarg/b2959e771ae680acbc95/raw/815a03f55d028dace4371c27d0b787ca0f2f2b5d/states.json');

  // Set and apply styling to the stateLayer
  stateLayer.setStyle(function(feature) {
    return {
      fillColor: getColor(feature.getProperty('COLI')), // call function to get color for state based on the COLI (Cost of Living Index)
      fillOpacity: 0.8,
      strokeColor: '#b3b3b3',
      strokeWeight: 1,
      zIndex: 1
    };
  });

  // Add mouseover and mouse out styling for the GeoJSON State data
  stateLayer.addListener('mouseover', function(e) {
    stateLayer.overrideStyle(e.feature, {
      strokeColor: '#2a2a2a',
      strokeWeight: 2,
      zIndex: 2
    });
  });

  stateLayer.addListener('mouseout', function(e) {
    stateLayer.revertStyle();
  });

  // Adds an info window on click with in a state that includes the state name and COLI
  stateLayer.addListener('click', function(e) {
    console.log(e);
    infoWindow.setContent('<div style="line-height:1.00;overflow:hidden;white-space:nowrap;">' +
      e.feature.getProperty('NAME') + '<br> COLI: ' +
      e.feature.getProperty('COLI') + '</div>');

    var anchor = new google.maps.MVCObject();
    anchor.set("position", e.latLng);
    infoWindow.open(vm.map, anchor);
  });


  // Final step here sets the stateLayer GeoJSON data onto the map
  stateLayer.setMap(vm.map);


  // returns a color based on the value given when the function is called
  function getColor(coli) {
    var colors = [
      '#d1ccad',
      '#c2c083',
      '#cbd97c',
      '#acd033',
      '#89a844'
    ];

    return coli >= 121 ? colors[4] :
      coli > 110 ? colors[3] :
      coli > 102.5 ? colors[2] :
      coli > 100 ? colors[1] :
      colors[0];
  }

});

// https://danielmargol.com/choropleth-map-google-maps/
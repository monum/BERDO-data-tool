
  mapboxgl.accessToken = 'pk.eyJ1IjoiYm9zdG9uYXBjYyIsImEiOiJja2MyYXplbDMwcG0xMnhqcjYyNmNjOWgwIn0.JwQHIGfBviLpgg4p2YlF_g';
  var map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/bostonapcc/ckcp7m95e071e1ilhoks0gz09', // Map style to use
    center: [-71.057083, 42.361145], // Starting position [lng, lat]
    zoom: 11.5, // Starting zoom level
  });

//search by address function
  var geocoder = new MapboxGeocoder({ // Initialize the geocoder
    accessToken: mapboxgl.accessToken, // Set the access token
    placeholder: 'Search by address',
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: false, // Do not use the default marker style
    bbox: [-71.183430, 42.228340, -70.918610, 42.42376], // Boundary for Boston
    proximity: {
      longitude: -71.057083,
      latitude: 42.361145
  }
});
  // Add the geocoder to the map
  map.addControl(geocoder);


map.on('load', function(){
  // add source and layer for NA
    // map.addSource('NA', {
    //   type: 'vector',
    //   url: 'mapbox://styles/bostonapcc/ckcp7m95e071e1ilhoks0gz09'
    // });
    // map.addLayer({
    //   'id': 'NA',
    //   'type': 'fill',
    //   'source': 'Berdo_Data_Tool',
    //   'layout': {
    //     // make layer visible by default
    //     'visibility': 'visible'
    //   },
    //     'source-layer': 'NA'
    // });
// legend steps and colors
  var layers = ['0-6', '6-13.9', '13.9-157.9', '157.9-1529.7', '1529.7-3593.9', '3593.9+'];
  var colors = ['#feefd7', '#fdb981', '#fc8d5a', '#e34c35', '#b30000', '#800026'];
// add legend
for (i = 0; i < layers.length; i++) {
  var layer = layers[i];
  var color = colors[i];
  var item = document.createElement('div');
  var key = document.createElement('span');
  key.className = 'legend-key';
  key.style.backgroundColor = color;

  var value = document.createElement('span');
  value.innerHTML = layer;
  item.appendChild(key);
  item.appendChild(value);
  legend.appendChild(item);
}

// add source and layer for ghg intensity
  // map.addSource('ghgintensity', {
  //   type: 'vector',
  //   url: 'mapbox://styles/bostonapcc/ckcp7m95e071e1ilhoks0gz09'
  // });
  // map.addLayer({
  //   'id': 'ghgintensity',
  //   'type': 'fill',
  //   'source': 'Berdo_Data_Tool',
  //   'layout': {
  //     // make layer visible by default
  //     'visibility': 'visible'
  //   },
  //     'source-layer': 'ghgintensity'
  // });
  //eui layer
  map.addSource('siteeui',{
    type: 'vector',
    url: 'mapbox://styles/bostonapcc/ckcp7m95e071e1ilhoks0gz09'
  });
  map.addLayer({
    'id': 'siteeui',
    'type': 'fill',
    'source': 'siteeui',
    'layout':{
      // make layer not visible by default
      'visibility': 'none'
    },
    'source-layer': 'siteeui'
  });

  // enumerate ids of the layers
  var layerSelect = document.getElementById("layerSelect");
  layerSelect.onchange = layerSelectChangeHandler;
  layerIds = ['siteeui', 'ghgintensity'];

  function layerSelectChangeHandler(event) {
    var selectedLayerName = event.target.value;
    console.log("selected layer", selectedLayerName);

    layerIds.forEach(function(layerId) {
      if (layerId === selectedLayerName) {
        console.log(map.getLayer(selectedLayerName).visibility);
        map.setLayoutProperty(selectedLayerName, 'visibility', 'visible');
        console.log(map.getLayer(selectedLayerName).visibility);

      }
      else {
        map.setLayoutProperty(selectedLayerName, 'visibility', 'none');
      }
    })


    // var i;
    // for (i = 0; i <layer.length; i++){
    //   var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
    //   if (visibility === 'visible'){
    //     map.setLayoutProperty(clickedLayer, 'visibility', 'none');
    //   } else {
    //     map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
    //   }
    // }
    };

//   var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
// //
// //     // toggle layer visibility by changing the layout object's visibility property
//   if (visibility === 'visible') {
//     map.setLayoutProperty('layer', 'visibility', 'none');
//     this.className='';
//   } else {
//     this.className = 'active';
//     map.setLayoutProperty('layer', 'visibility', 'visible');
//   }
//
// var layers = document.getElementById('menu');
// layers.appendChild(link);

  // set up corresponding toggle button for each layer
  // for (var i = 0; i < layer.length; i++){
  //   var id = [layer.value];
  //   console.log(id)
  //   var link = document.getElementById('layer');
    // link.href='#';
    // link.className = 'active';
    // link.textContent = id;
  //
  //   link.onclick = function(e) {
  //     var clickedLayer = this.textContent;
  //     e.preventDefault();
  //     e.stopPropagation();
  //

});



// import original geojson dataset for the info panel
var allDataUrl = 'https://pounlaura.github.io/BERDO-data-tool/BERDO_2019_All.geojson';

// set up map
  mapboxgl.accessToken = 'pk.eyJ1IjoiYm9zdG9uYXBjYyIsImEiOiJja2MyYXplbDMwcG0xMnhqcjYyNmNjOWgwIn0.JwQHIGfBviLpgg4p2YlF_g';
  var map = new mapboxgl.Map({
   container: 'map', // Container ID
   style: 'mapbox://styles/bostonapcc/ckcp7m95e071e1ilhoks0gz09', // Map style to use
   center: [-71.057083, 42.361145], // Starting position [lng, lat]
   zoom: 11.5, // Starting zoom level
 });

//set up the geocoder (search by address function)
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

// set ghg intensity histograms
    var histograms = {};
 //histogram margin
    var margin = {top: 10, right: 10, bottom: 30, left: 40},
       width = 480 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;

 // append the svg object to the body of the page
     var svg = d3.select('.ghgintensityGraph')
       .append('svg')
         .attr('width', width + margin.left + margin.right)
         .attr('height', height + margin.top + margin.bottom)
         .append('g')
         .attr('transform',
               'translate(' + margin.left + ', ' + margin.top + ')');

 // name the data imported at the top
   d3.json(allDataUrl).then(function(allData) {

// organize data by property type and create objects based on property type
     var dataByType = allData.features.reduce(function(memo, element, index, array){
       if (!element.properties.GHGIN_NUM){
         return memo;
       }
       if (memo[element.properties.Property_T]){
         memo[element.properties.Property_T]=[ ...memo[element.properties.Property_T], element];
       }
       else {
         memo[element.properties.Property_T]=[ element];
       }
       return memo;
     }, {});

// create the histograms
     for (var propertyType in dataByType) {
       var blankGraphSVG = document.querySelector('.ghgintensityGraph');
       var graphContainerElement = blankGraphSVG.cloneNode(true);

       var graphContainer = d3.select(graphContainerElement);
       var graphSVG = graphContainer.select('svg');
       var ghgValues = dataByType[propertyType].map(function(feature) {
         return feature.properties.GHGIN_NUM;
       });
       var min = d3.min(ghgValues);
       var max = d3.max(ghgValues);
       var x = d3.scaleLinear()
       .domain([min, max])
       .range([50, width]);
       var data = d3.histogram()
       .thresholds(x.ticks(10))
       (ghgValues);
       var yMax = d3.max(data, function(d){return d.length});
       var yMin = d3.min(data, function(d){return d.length});
       var y = d3.scaleLinear()
        .domain([0, yMax])
        .range([height,0]);
        var xAxis = d3.axisBottom()
        .scale(x);
        var yAxis = d3.axisLeft()
        .scale(y);

        var bar = graphSVG.selectAll(".bar")
          .data(data)
          .enter().append('g')
          .attr('class', 'bar')
          .attr('transform', function(d){
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
          });

          bar.append('rect')
          .attr("x", 1)
          .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1; })
          .attr("height", function(d) { return y(0) - y(d.length); })
          .attr('data-min', function(d) { return d.x0 })
          .attr('data-max', function(d) { return d.x1 })
          .attr('fill', "blue");

          graphSVG.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

          graphSVG.append('text')
          .attr('class', 'xLabel')
          .attr('text-anchor', 'end')
          .attr('x', width)
          .attr('y',height+35)
          .text('kgCO2e/ft²');

          graphSVG.append('g')
          .attr("class", "y axis")
          .attr("transform", "translate(50,0)")
          .call(yAxis);

       histograms[propertyType] = graphContainer;
     }
   });

// visualize map
 map.on('load', function(){

   // enumerate ids of the layers
   var layerSelect = document.getElementById("layerSelect");
   layerSelect.onchange = layerSelectChangeHandler;
   layerIds = ['siteeui', 'ghgintensity'];
   // change layer on toggle click
   function layerSelectChangeHandler(event) {
     var selectedLayerName = event.target.value;

     layerIds.forEach(function(layerId) {
       if (layerId === selectedLayerName) {
         map.setLayoutProperty(layerId, 'visibility', 'visible');
       }
       if (layerId !== selectedLayerName) {
         map.setLayoutProperty(layerId, 'visibility', 'none');
       }
     });

     changeLegendLayer(event);
   };
  // set legend values
   var legendLayers = [{
    id: 'ghgintensity',
    steps: ['N/A','0-5', '5-10', '10-20', '20-30', '30+'],
    colors: ['#919191', '#feefd7', '#fdb981', '#fc8d5a', '#e34c35', '#b30000'],
    name: "GHG Intensity",
    default: true,
  },
  {
    id: 'siteeui',
    steps: ['N/A','0-20', '20-80', '80-120', '120-250', '250+'],
    colors: ['#919191', '#ffffcc', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'],
    name: "Site EUI",
  }];
   // legend steps and colors
   var legendElement = document.getElementById('legend');
   // add legend
   legendLayers.forEach(function(layer) {
     var legendLayer = document.createElement('div');
     legendLayer.className = `legendLayer ${layer.id}`;
     legendLayer.style.display = layer.default === true ? 'block' : 'none';
     var title = layer.name;
     var legendTitle = document.createElement('div');
     legendTitle.innerHTML = title;
     legendLayer.appendChild(legendTitle);
     for (i = 0; i < layer.steps.length; i++) {
       var labelText = layer.steps[i];
       var color = layer.colors[i];
       var legendItem = document.createElement('div');
       var itemKey = document.createElement('span');
       itemKey.className = 'legend-key';
       itemKey.style.backgroundColor = color;
       var itemLabel = document.createElement('span');
       itemLabel.innerHTML = labelText;
       legendItem.appendChild(itemKey);
       legendItem.appendChild(itemLabel);
       legendLayer.appendChild(legendItem);
      }
      legendElement.appendChild(legendLayer);
   });

  // change legend function
    function changeLegendLayer(event) {
      // var legend = document.getElementbyId('legend');
      legendLayers.forEach(function(layer) {
        var activeLegendLayer = document.getElementsByClassName(`legendLayer ${layer.id}`)[0];
        if (event.target.value === layer.id) {
          activeLegendLayer.style.display = 'block';
        } else {
          activeLegendLayer.style.display = 'none';
        }
      });
    };

// function to close the info panel when user clicks the close button
    function closeInfoPanel() {
      var buildingInfoPanel = document.getElementById('perbuildinginfo');
      buildingInfoPanel.className = 'perbuildinginfo';
    }

    var infoPanelCloseButton = document.querySelector('#perbuildinginfo .close');
    infoPanelCloseButton.onclick = closeInfoPanel;

// create info panel
    map.on('click', 'alldata', function(e) {

      var coordinates = e.features[0].geometry.coordinates.slice();
      var buildingID = e.features[0].properties.BID;

      var buildingInfoPanel = document.getElementById('perbuildinginfo');
      var reportsContainer = document.querySelector('#perbuildinginfo .reportsContainer');
      var infoContainer = document.querySelector('#perbuildinginfo .reportsContainer .info');
      var infoPanelClass = buildingInfoPanel.className;

      if (infoPanelClass.indexOf('visible') < 0) {
        buildingInfoPanel.className = `${infoPanelClass} visible`;
      }
// show empty values as N/A
      function replaceUndefined(originalValue) {
        return originalValue || 'N/A';
      }
// loop through all reports to show values based on clicked building
      var reports = e.features.map(
        function(report) {
          var populatedReport = infoContainer.cloneNode(true);
          // query values for each BID based on column names
          populatedReport.querySelector('.buildingID .value').innerHTML = replaceUndefined(report.properties.BID);
          populatedReport.querySelector('.address .value').innerHTML = replaceUndefined(report.properties.PropertyNa);
          populatedReport.querySelector('.type .value').innerHTML = replaceUndefined(report.properties.Property_T);
          populatedReport.querySelector('.ghgintens .value').innerHTML = replaceUndefined(report.properties.GHGIN_NUM);
          populatedReport.querySelector('.siteeui .value').innerHTML = replaceUndefined(report.properties.Site_EUI_N) + ' kBTU/ft²';
          populatedReport.querySelector('.area .value').innerHTML = replaceUndefined(report.properties.Gross_Sq_F) + ' ft²';
          populatedReport.querySelector('.energystar .value').innerHTML = replaceUndefined(report.properties.EnergyStar);
          // populatedReport.querySelector('.area .value').innerHTML = report.properties.yearReno;

          // call histogram
          d3.select(populatedReport).select('.ghgintensityGraph').remove();
          if (report.properties.Property_T) {d3.select(populatedReport).node().appendChild(histograms[report.properties.Property_T].node().cloneNode(true));
          }
          var svg = d3.select(populatedReport.querySelector('.ghgintensityGraph svg'));
          var matchingBar = svg.selectAll('.bar rect')
            .nodes()
            .find(function(rect) {
              return Number(rect.getAttribute('data-min')) <= Number(report.properties.GHGIN_NUM) &&
                Number(rect.getAttribute('data-max')) >= Number(report.properties.GHGIN_NUM)
            });
            if (matchingBar) {matchingBar.setAttribute('fill', 'yellow');}

          return populatedReport;
        }
      );
      reportsContainer.innerHTML = '';
      reports.forEach(function(report) {
        reportsContainer.appendChild(report);
      })


// change mouse to pointer when hovering clickable object
    map.on('mouseenter', 'alldata', function() {
    map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'alldata', function() {
    map.getCanvas().style.cursor = '';
});
});
});

var county_url = 'https://raw.githubusercontent.com/aeisenba61/Winners-repo/master/clean-data/geojson/countyOut.geojson';
// var county_url_alt = 'https://raw.githubusercontent.com/aeisenba61/Winners-repo/master/produce%20geojson%20files/countyOut.js';

console.log(county_url);
d3.json(county_url, function(error, countyData){
    if (error) throw error;
    console.log(countyData);
    var map = L.map('countyMap').setView([37.8, -96], 3);

    L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
        "T6YbdDixkOBWH_k9GbS8JQ"
    );

    var geojson;

    function getColor(d) {
        return  d > 40 ? '#800026' :
                d > 35 ? '#BD0026' :
                d > 30 ? '#E31A1C' :
                d > 25 ? '#FC4E2A' :
                d > 20 ? '#FD8D3C' :
                d > 15 ? '#FEB24C' :
                d > 10 ? '#FED976' :
                         '#FFEDA0';
    }   
    function style(feature) {
        return {
            fillColor: getColor(feature.properties.diab_per),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

       /* if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }*/
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    geojson = L.geoJson(countyData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>US Diabetes Rate</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + props.diab_per + ' %'
            : 'Hover over a county');
    };

    info.addTo(map);

    function highlightFeature(e) {
        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        info.update();
    }

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 30, 40],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
})
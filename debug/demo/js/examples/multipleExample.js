function multipleExample(){

    var latlons = {

        map  : [52.51, 13.37],
        src1 : [52.50992656168169, 13.38435173034668],
        src2 : [52.510429355469256, 13.39181900024414]
    };

    // add the map and set the initial center to berlin
    var map = L.map('map-multipleExample').setView(latlons.map, 13);

    // attribution to give credit to OSM map data and VBB for public transportation 
    var attribution ="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";

    // initialising the base map. To change the base map just change following
    // lines as described by cloudmade, mapbox etc..
    // note that mapbox is a paided service
    L.tileLayer('https://a.tiles.mapbox.com/v3/mi.h220d1ec/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: attribution
    }).addTo(map);

    // set the service key, this is a demo key
    // please contact us and request your own key
    r360.config.serviceKey = 'iWJUcDfMWTzVDL69EWCG';

    // create the layer to add the polygons
    var cpl = r360.route360PolygonLayer();
    // add it to the map
    map.addLayer(cpl);

    // add a radio element with all the different intersection modes
    var buttonOptions = {
        buttons : [
            // each button has a label which is displayed, a key, a tooltip for mouseover events 
            // and a boolean which indicates if the button is selected by default
            // labels may contain html
            { label: 'Union', key: 'union',     
              tooltip: 'No intersection of polygons', checked : false },

            { label: 'Intersection', key: 'intersection',     
              tooltip: 'Only intersected area shown.', checked : false  },

            { label: 'Average', key: 'average',      
              tooltip: 'Average traveltime in polygons', checked : true },
        ]
    };

    // create a new readio button control with the given options
    var intersectionModeButtons = r360.radioButtonControl(buttonOptions);

    // add the newly created control to the map
    map.addControl(intersectionModeButtons);

    // create a target marker icon to be able to distingush source and targets
    var redIcon = L.icon({iconUrl: 'lib/leaflet/images/marker-icon-red.png', 
        shadowUrl: 'lib/leaflet/images/marker-shadow.png', iconAnchor: [12,45], popupAnchor:  [0, -35] });

    // create a source and a two target markers and add them to the map
    var sourceMarker1 = L.marker(latlons.src1).addTo(map);
    sourceMarker1.lat = latlons.src1[0]; sourceMarker1.lon = latlons.src1[1];
    // only for r360
    var sourceMarker2 = L.marker(latlons.src2).addTo(map);
    sourceMarker2.lat = latlons.src2[0]; sourceMarker2.lon = latlons.src2[1];
    
    // bind the action to the change event of the radio travel mode element
    intersectionModeButtons.onChange(function(intersectionMode){ showPolygons(intersectionMode); });

    // call the helper function to display polygons with initial value
    showPolygons(_.find(buttonOptions.buttons, function(button){ return button.checked; }).key);

    map.on('click', function(e){ console.log(e.latlng); });

    // helper function to encapsulate the show polygon action
    function showPolygons(intersectionMode){
        
        // you need to define some options for the polygon service
        // for more travel options check out the other tutorials
        var travelOptions = r360.travelOptions();
        // we only have one source which is the marker we just added
        travelOptions.addSource(sourceMarker2);
        travelOptions.addSource(sourceMarker1);
        // we want to have polygons for 5 to 30 minutes
        travelOptions.setTravelTimes([300, 600,900, 1200, 1500, 1800]);
        // get the selected travel type from the control
        travelOptions.setTravelType('walk');
        // intersection means that areas are marker in a certain color
        // if they are reach from both locations in the same time
        travelOptions.setIntersectionMode(intersectionMode);

        // call the service
        r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){
            // in case there are already polygons on the map/layer
            cpl.clearLayers();
            // add the returned polygons to the polygon layer 
            cpl.addLayer(polygons);
            // zoom the map to fit the polygons perfectly
            map.fitBounds(cpl.getBoundingBox());
        });
    };
}
var map;
var bounds;
var markerLocations = [];
var plotted = [];

function initialize() {

    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(42.3989,-71.1324),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    google.maps.event.addListener(map, 'bounds_changed', function() {
        bounds = map.getBounds();
        drawMarkers();
    });

}

function boundsToCoords() {
    var minlat, minlong, maxlat, maxlong, sw, ne;
    sw = bounds.getSouthWest();
    ne = bounds.getNorthEast();
    var coords = new Object();
    coords.minlat = sw.lat();
    coords.minlong = sw.lng();
    coords.maxlat = ne.lat();
    coords.maxlong = ne.lng();
    return coords;
}

function drawMarkers() {
    var url = '../placesterbox.json';

    coords = boundsToCoords();

   $.ajax({
        type: "POST",
        url: url,
        data: {maxlat:coords.maxlat,minlat:coords.minlat,minlong:coords.minlong,maxlong:coords.maxlong},
        dataType: "json",
        success: function(json) {
            if(markerLocations) {
                for(i in markerLocations) {
                    if(!bounds.contains(markerLocations[i].position)) markerLocations[i].setVisible(false);
                    if(bounds.contains(markerLocations[i].position) && !markerLocations[i].getVisible()) {
                        markerLocations[i].setVisible(true);
                    }
                }
            }
            $.each(json, function(i, entry) {
                if(findMarkerVal(markerLocations, "title", entry.id) == -1) {
                    plotted.push(entry.id);
                    plotSingleMarker(entry.latitude, entry.longitude, entry.id);
                }
            });
        },
        error: function(err){
            console.log(err);
        }
    });
}

function findMarkerVal(markerArray, property, propValue) {
    for(var i=0, len=markerArray.length; i<len; i++) {
        if(markerArray[i][property] === propValue) {
            return i;
        }
    }
    return -1;
}

function plotSingleMarker(lat, lon, id) {
    var content = '<div id="content"><p>'+id+'</p></div>';
    var infowindow = new google.maps.InfoWindow({content: content});
    var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat,lon),
    map: map,
    title: id,
    animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
    });
    markerLocations.push(marker);
}

google.maps.event.addDomListener(window, 'load', initialize);

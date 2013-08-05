var map;
var bounds;
var markerLocations = [];
var plotted = [];

function initialize() {

    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(38.895111,-77.036667),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var drawingManager = new google.maps.drawing.DrawingManager();
    drawingManager.setMap(map);

    google.maps.event.addListener(map, 'idle', function() {
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

function checkmarkers(json) {
    if(markerLocations) {
        for(var i in markerLocations) {
            if(!bounds.contains(markerLocations[i].position)) markerLocations[i].setVisible(false);
            if(bounds.contains(markerLocations[i].position) && !markerLocations[i].getVisible()) {
                markerLocations[i].setVisible(true);
            }
        }
    }
    $.each(json[1], function(i, entry) {
        if(findMarkerVal(markerLocations, "title", entry.id) == -1) {
            plotted.push(entry.id);
            plotSingleMarker(entry);
        }
    });
}

function drawMarkers() {
    var url = '../placesterbox.json';
    var page = 0;

    coords = boundsToCoords();

   $.ajax({
        type: "POST",
        url: url,
        data: {maxlat:coords.maxlat,minlat:coords.minlat,minlong:coords.minlong,maxlong:coords.maxlong, page:page},
        dataType: "json",
        success: function(json) {
            offset = json[0].offset;
            total = json[0].total;
            checkmarkers(json);
            while(offset+50 < total) {
                offset += 50;
                page +=1;
                console.log("Getting results "+(50*page)+"-"+(50*page+50)+" of "+total);
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {maxlat:coords.maxlat,minlat:coords.minlat,minlong:coords.minlong,maxlong:coords.maxlong,page:page},
                    dataType: "json",
                    success: checkmarkers(json),
                    error: function(err) {
                        console.log(err);
                    }
                })
            }},
            error: function(err){
                console.log(err);
            }
   })
}

function findMarkerVal(markerArray, property, propValue) {
    for(var i=0, len=markerArray.length; i<len; i++) {
        if(markerArray[i][property] === propValue) {
            return i;
        }
    }
    return -1;
}

function plotSingleMarker(entry) {
    var content = '<div id="content"><p>'+entry.description+'</p><p><a href="'+entry.url+'">See More</a></p></div>';
    var infowindow = new google.maps.InfoWindow({content: content});
    var marker = new google.maps.Marker({
    position: new google.maps.LatLng(entry.latitude,entry.longitude),
    map: map,
    title: entry.id,
    animation: google.maps.Animation.DROP
    });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
    });
    markerLocations.push(marker);
}

google.maps.event.addDomListener(window, 'load', initialize);

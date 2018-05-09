require('bootstrap');
require('startbootstrap-agency/js/jqBootstrapValidation');
require('startbootstrap-agency/js/contact_me');
require('startbootstrap-agency/js/agency');
require('startbootstrap-agency/vendor/jquery-easing/jquery.easing');

let googleMapsLoader= require('google-maps');
googleMapsLoader.KEY='AIzaSyBD2c0P2K3jpSa98WUOkXIMXXEkwnx5CcY';

var markers = [];

googleMapsLoader.load(function(google){
    var styledMapType = new google.maps.StyledMapType(
        [
            {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
            {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{color: '#c9b2a6'}]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{color: '#dcd2be'}]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{color: '#ae9e90'}]
            },
            {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#93817c'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{color: '#a5b076'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#447530'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#f5f1e6'}]
            },
            {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{color: '#fdfcf8'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#f8c967'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#e9bc62'}]
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry',
                stylers: [{color: '#e98d58'}]
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry.stroke',
                stylers: [{color: '#db8555'}]
            },
            {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{color: '#806b63'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.fill',
                stylers: [{color: '#8f7d77'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#ebe3cd'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{color: '#dfd2ae'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{color: '#b9d3c2'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#92998d'}]
            }
        ],
        {name: 'Paslaugų tiekėjai'}
    );

    var map = new google.maps.Map(document.getElementById('googleMap'), {
        center: new google.maps.LatLng(0,0),
        zoom: 12,
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                'styled_map']
        }
    });

    var timer;
    map.addListener('bounds_changed', function() {

        if(timer) {
            window.clearTimeout(timer);
        }

        timer = window.setTimeout(function () {
            deleteCoordinates();
            getCoordinates(google, map);
        }, 1000);

    });


    infoWindow = new google.maps.InfoWindow;


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function() {
            $.getJSON('https://geoip-db.com/json/')
                .done (function(location) {
                    var pos = {
                        lat: location.latitude,
                        lng: location.longitude,
                    };
                    infoWindow.open(map);
                    map.setCenter(pos);
                });

        });
    }

    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');

});




function getCoordinates( google, map ) {

    var bounds = map.getBounds();
    console.log(bounds);
    $.get(
        "/mapcoordinate",
        {
            'bottom_left_lat': bounds.f.b,
            'top_right_lat': bounds.f.f,
            'bottom_left_lng': bounds.b.b,
            'top_right_lng': bounds.b.f
        },
        function( data ) {
            var infowindow = new google.maps.InfoWindow();


            var marker, i;
            var infoWindowContent = [];
            for (i = 0; i < data.length; i++) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(data[i].latitude, data[i].longitude),
                    map: map
                });
                markers.push(marker);
            }
            for (i = 0; i < data.length; i++) {
                var url = "/coordinate/" + data[i].id;
                infoWindowContent[i] = "<h5>" + data[i].name + "</h5>" +
                    "<div><a href="+url+">Plačiau</a></div>";

                var currentMarker = markers[i];
                google.maps.event.addListener(currentMarker, 'click', (function(currentMarker, i) {
                    return function() {
                        infowindow.setContent(infoWindowContent[i]);
                        infowindow.open(map, currentMarker);
                    }
                })(currentMarker, i));
            }
        }
    );


}

function deleteCoordinates() {
    //Loop through all the markers and remove
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}



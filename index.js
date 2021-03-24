let lines = []
let map;
let target;
let panorama;
let checkDist = true;


function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function showLastLine(map) {
    for (let i = 0; i < lines.length - 1; i++) {
        lines[i].setMap(null);
    }
    lines[lines.length - 1].setMap(map);
    let savedLine = lines[lines.length - 1]
    lines = []
    lines.push(savedLine)
}
async function TryRandomLocation(callback) {
    var lat = getRandom(30, 70);
    var lng = getRandom(-10, 40)
    var sv = new google.maps.StreetViewService();
    target = {
        lat: lat,
        lng: lng
    }

    // Try to find a panorama within 50 metres 
    sv.getPanorama({
        location: new google.maps.LatLng(lat, lng),
        radius: 50
    }, callback);
}

function HandleCallback(data, status) {
    if (status == 'OK') {
        let latT = data.location.latLng.lat();
        let lngT = data.location.latLng.lng();
        document.getElementById("loading").className = "";
        panorama.setPosition(new google.maps.LatLng(latT, lngT));
        btn = document.getElementById("chkButton")
        btn.disabled = false;
        start();
        let anchors = document.getElementsByTagName('a')
        for (let a of anchors) {
            if (a.href.includes('https://maps.google.com/maps')) {
                a.title = '';
                a.onclick = function() { return false; };
            }
        }

    } else {
        TryRandomLocation(HandleCallback);
    }
}

function initialize() {
    btn = document.getElementById("chkButton")
    btn.innerHTML = '<span> Check </span>'
    btn.disabled = true;
    const paris = { lat: 48.864716, lng: 2.349014 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: paris,
        zoom: 5,
    });

    map.setOptions({
        disableDefaultUI: true,
    });
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"), {
            position: { lat: 0, lng: 0 },
            pov: {
                heading: 34,
                pitch: 10,
            },
        }
    );
    panorama.setOptions({
        addressControl: false,
        disableDefaultUI: true,
        showRoadLabels: false
    });
    $('<div/>').addClass('centerMarker').attr('id', 'centerMarker').appendTo(map.getDiv())
    let pDiv = document.getElementById("pano")
    $('<div/>').addClass('lds-dual-ring').attr('id', 'loading').appendTo(pDiv)

    $("#progressbar").kendoProgressBar({
        change: change
    });

    //Target
    TryRandomLocation(HandleCallback);
}

function check() {
    if (checkDist) {
        var lineCoordinates = [
            target,
            map.center,

        ];
        var linePath = new google.maps.Polyline({
            path: lineCoordinates,
            geodesic: true,
            strokeColor: '#FF0000'
        });
        document.getElementById("centerMarker").className = "";
        pause();
        lines.push(linePath);
        showLastLine(map);
        var marker = new google.maps.Marker({
            position: map.center,
            title: "Guess"
        });
        marker.setMap(map);
        var marker = new google.maps.Marker({
            position: target,
            title: "Target"
        });
        marker.setMap(map);
        let markerPos = map.center;
        let bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(target.lat, target.lng));
        bounds.extend(new google.maps.LatLng(markerPos.lat(), markerPos.lng()));
        map.fitBounds(bounds);

        dist = getDistanceFromLatLonInKm(target.lat, target.lng, markerPos.lat(), markerPos.lng()).toFixed(0).toString()
        maxD = 1000
        distanceDiv = document.getElementById("distance");
        distanceDiv.textContent = dist + ' km'

        document.getElementById("chkButton").innerHTML = '<span> Next Map </span>'







        $("#progressbar").data("kendoProgressBar").value(((maxD - dist) / maxD) * 100);
        checkDist = false;
    } else {
        checkDist = true;
        document.getElementById('loading').remove()
        document.getElementById('centerMarker').remove()
        document.getElementById("progressbar").innerHTML = ''
        reset();


        initialize();
    }


}

function change(e) {
    switch (true) {
        case (e.value <= 25):
            this.progressWrapper.css({ "background-color": "#e32424", "border-color": "#e32424" });
            break;

        case (e.value > 25 && e.value <= 50):
            this.progressWrapper.css({ "background-color": "#e68e1c", "border-color": "#e68e1c" });
            break;

        case (e.value > 51 && e.value <= 75):
            this.progressWrapper.css({ "background-color": "#e6dc1c", "border-color": "#e6dc1c" });
            break;

        case (e.value > 76 && e.value <= 100):
            this.progressWrapper.css({ "background-color": "#32c728", "border-color": "#32c728" });
            break;
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}


// Convert time to a format of hours, minutes, seconds, and milliseconds

function timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let diffInMs = (diffInSec - ss) * 100;
    let ms = Math.floor(diffInMs);

    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");
    let formattedMS = ms.toString().padStart(2, "0");

    return `${formattedMM}:${formattedSS}:${formattedMS}`;
}

// Declare variables to use in our functions below

let startTime;
let elapsedTime = 0;
let timerInterval;

// Create function to modify innerHTML

function print(txt) {
    document.getElementById("display").innerHTML = txt;
}

// Create "start", "pause" and "reset" functions

function start() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function printTime() {
        elapsedTime = Date.now() - startTime;
        print(timeToString(elapsedTime));
    }, 10);
}

function pause() {
    clearInterval(timerInterval);
}

function reset() {
    clearInterval(timerInterval);
    print("00:00:00");
    elapsedTime = 0;
}
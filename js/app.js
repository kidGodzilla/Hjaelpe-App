var lat, long, sLoc, zip, suburb, city, state, country, curId, latitude, longitude, img, name;

var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);

var temp = localStorage.getItem('location');
if(temp) {
    sLoc = temp;
} else {
    sLoc = '98122';
}

var addToCoords = function(address) {
    console.log(address);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            latitude = results[0].geometry.location.lat();
            longitude = results[0].geometry.location.lng();
            img = "http://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=16&size=300x300&sensor=false";
            console.log("http://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=16&size=300x300&sensor=false");
            $('#map').attr('src', img);
            if(iOS) {
                $('#mapsLink').attr('onclick', 'window.open("comgooglemaps://?q='+name+'&center='+latitude+','+longitude+'")');
            } else {
                $('#mapsLink').attr('onclick', 'window.open("http://maps.apple.com/?q='+latitude+','+longitude+'")');
            }


        } else {
            console.log("Geocode Request failed. "+status)
        }
    });
}

var getLocation = function(cb) {
    if (document.location.protocol === 'http:' && (navigator.geolocation != null)) {
        return navigator.geolocation.getCurrentPosition(function(pos) {
            var coords, url;
            coords = pos.coords;
            lat  = pos.coords.latitude;
            long = pos.coords.longitude;
            console.log('Latitude is ' + lat + '°, Longitude is ' + long + '°');
            url = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" + coords.latitude + "&lon=" + coords.longitude + "&addressdetails=1";
            return $.ajax({
                url: url,
                dataType: 'jsonp',
                jsonp: 'json_callback',
                cache: true
            }).success(function(data) {
                zip = data.address.postcode;
                suburb = data.address.suburb;
                city = data.address.city;
                state = data.address.state;
                country = data.address.country;

                if(zip) {
                    console.log("zip code found:" + zip);
                    sLoc = zip+', '+country;
                } else {
                    sLoc = city+', '+state+', '+country;
                }
                localStorage.setItem('location', sLoc);
            });
        });
    }
};

getLocation();

var hjaelpe = new Framework7({
    modalTitle: 'Hjælpe',
    animateNavBackIcon: true
});

var $$ = Framework7.$;

var mainView = hjaelpe.addView('.view-main', {
    dynamicNavbar: true
});

/* ===== Index Page events ===== */
hjaelpe.onPageInit('home', function (page) {
    $.ajax({
        url: 'http://ajs-yelp-api.herokuapp.com/search?term=indian&sort=1&location='+sLoc,
        dataType: 'jsonp',
        success: function(data) {
            var template = $$('#mediaTemplate').html();
            var html = '';
            for(var i = 0; i < data.businesses.length; i++) {
                var obj = data.businesses[i];
                //console.log(obj);
                if(obj.name && obj.image_url && obj.rating_img_url && obj.snippet_text) {
                    var open = (obj.is_closed) ? 'CLOSED' : 'OPEN';
                    html += template
                        .replace(/{{name}}/g, obj.name)
                        .replace(/{{id}}/g, obj.id)
                        .replace(/{{image}}/g, obj.image_url)
                        .replace(/{{open}}/g, open)
                        .replace(/{{rating}}/g, obj.rating_img_url)
                        .replace(/{{text}}/g, obj.snippet_text);
                }
            }
            $$('#hjaelpeList').html(html);
        },
        error : function(e) {
            console.log(e);
        }
    });
}).trigger();//

/* Search */
$$('#searchBar').submit(function() {
    var term = $$('#searchBar input').val()
    $.ajax({
        url: 'http://ajs-yelp-api.herokuapp.com/search?term='+term+'&location='+sLoc,
        dataType: 'jsonp',
        success: function(data) {
            var template = $$('#mediaTemplate').html();
            var html = '';
            for(var i = 0; i < data.businesses.length; i++) {
                var obj = data.businesses[i];
                //console.log(obj);
                if(obj.name && obj.image_url && obj.rating_img_url && obj.snippet_text) {
                    var open = (obj.is_closed) ? 'CLOSED' : 'OPEN';
                    html += template
                        .replace(/{{name}}/g, obj.name)
                        .replace(/{{id}}/g, obj.id)
                        .replace(/{{image}}/g, obj.image_url)
                        .replace(/{{open}}/g, open)
                        .replace(/{{rating}}/g, obj.rating_img_url)
                        .replace(/{{text}}/g, obj.snippet_text);
                }
            }
            $$('#hjaelpeList').html(html);
            $$('#mainMessage').html('Results for '+term+' near '+sLoc+':');
            $$('#searchBar input').val('');
            $$('#searchBar input').blur();
            $('#clearSearch').trigger('click');
        },
        error : function(e) {
            console.log(e);
        }
    });
});

/* ===== Index Page events ===== */
hjaelpe.onPageInit('business', function (page) {
    console.log(curId);
    $.ajax({
        url: 'http://ajs-yelp-api.herokuapp.com/business/'+curId,
        dataType: 'jsonp',
        success: function(data) {
            var template = $$('#businessTemplate').html();
            var html = '';
            if(data.name) {
                var open = (data.is_closed) ? 'CLOSED' : 'OPEN';
                var cats = '';
                for(var i = 0; i < data.categories.length; i++) {
                    cats += data.categories[i][0];
                    if(i < data.categories.length - 1)
                        cats += ', ';
                }
                name = data.name;
                var dAddr = '';
                console.log(data.location.display_address);
                for(var i = 0; i < data.location.display_address.length; i++) {
                    dAddr += data.location.display_address[i] + '<br>';
                }
                html = template
                    .replace(/{{name}}/g, data.name)
                    .replace(/{{cats}}/g, cats)
                    .replace(/{{phone}}/g, data.phone)
                    .replace(/{{address}}/g, dAddr)
                    .replace(/{{open}}/g, open)
                    .replace(/{{image}}/g, data.image_url)
                    .replace(/{{rating}}/g, data.rating_img_url)
                    .replace(/{{text}}/g, data.snippet_text);
            }
            $$('#outlet').html(html);
            var template = $$('#reviewTemplate').html();
            html = '';
            for(var i = 0; i < data.reviews.length; i++) {
                html += template
                    .replace(/{{name}}/g, data.reviews[i].user.name)
                    .replace(/{{image}}/g, data.reviews[i].user.image_url)
                    .replace(/{{rating}}/g, data.reviews[i].rating_image_url)
                    .replace(/{{date}}/g, data.reviews[i].time_created)
                    .replace(/{{text}}/g, data.reviews[i].excerpt);
            }
            $$('#reviews').html(html);
            var address = data.location.address[0]+', '+ data.location.postal_code;
            addToCoords(address);
            $$('#businessName').html(data.name);
        },
        error : function(e) {
            console.log(e);
        }
    });
});
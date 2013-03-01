
$(function(){
	
	var example = [{ 
			id: 'the-westin-book-cadillac-detroit-detroit',
			is_closed: false,
			name: 'The Westin Book Cadillac Detroit',
			image_url: 'http://s3-media1.ak.yelpcdn.com/bphoto/zKs2B4ohmZwhpraQ1PnbmA/ms.jpg',
			display_phone: '+1-313-442-1600',
			rating: 4,
			rating_img_url_small: 'http://s3-media4.ak.yelpcdn.com/assets/2/www/img/f62a5be2f902/ico/stars/v1/stars_small_4.png',
			location: 
			 { city: 'Detroit',
			   display_address: 
			    [ '1114 Washington Blvd',
			      'Downtown Detroit',
			      'Detroit, MI 48226' ],
			   geo_accuracy: 8,
			   neighborhoods: [ 'Downtown Detroit' ],
			   postal_code: '48226',
			   country_code: 'US',
			   address: [ '1114 Washington Blvd' ],
			   coordinate: { latitude: 42.3317983, longitude: -83.0508191 },
			   state_code: 'MI' 
			}
		}
		] 
	
	console.log(example);
	/*
	$('#page').masonry({
	    // options
	    itemSelector : '.section',
		columnWidth: function( containerWidth ) {
		    return containerWidth / 2.1;
		  }
	});
	*/
	
	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map', {"scrollWheelZoom": false}).setView([42.336076,-83.049292], 17);

	/*
	// add Cloudmade tile layer (better vis)
	L.tileLayer('http://{s}.tile.cloudmade.com/5278d1bee38f4ebabc822e8d5a6faa2e/997/256/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	    maxZoom: 18
	}).addTo(map);
	*/
	
	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	
	$.each(example, function(i, v){
		console.log(v);
	})
	
	// add a marker in the given location, attach some popup content to it and open the popup
	L.marker([42.336076,-83.049292]).addTo(map).bindPopup('<h4>apicraftconf</h4> M@dison Building - 1555 Broadway St')
	    .openPopup();	
	
	
		
});





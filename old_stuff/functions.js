
$(function(){
	
	var hotelIcon = L.icon({
	    iconUrl: 'images/hotel_icon.png',
	    iconRetinaUrl: 'images/hotel_icon@2x.png',
	    iconSize: [40, 48],
	    iconAnchor: [20, 48],
	    popupAnchor: [0, -40],
	    shadowUrl: 'images/hotel_icon_shadow.png',
	    shadowRetinaUrl: 'images/hotel_icon_shadow@2x.png',
	    shadowSize: [53, 46],
	    shadowAnchor: [24, 48]
	});
	
	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map', {"scrollWheelZoom": false}).setView([42.335000,-83.049292], 15);

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
	
	$.ajax({
		url: window.config.proxyUrl + "/locations/detroit/", 
		crossDomain: true,
		success: function(d){ 
			console.log(d);
			$.each(d, function(i, v){
				if(!v.is_closed){
					var options = null;
					//build up the html
					v.popupTitle = v.name
					if(typeof(v.apicraftTitle) != "undefined"){v.popupTitle = v.apicraftTitle;}
					
					var html ='<h4><a href="'+v.url+'" title="Click to view on yelp">'+v.popupTitle+'</a></h4>'; //popup title
					html +='<table><tr><td>';	//using a table
					html +='<Strong>'+v.name+'</strong><br/>'; //name
					html +='<p>Address</p>'; //address
					
					html +='</td><td>'; //cell #2
					
					html +='<img src="" alt="venue image" /><br />'; //venue image
					html +='<img src="'+v.rating_img_url_small+'" alt="/5 Stars" /><br />'; //yelp rating
					html +='<span class="phone">Phone Number</span>';//phone
					
					html +='</td></tr></table>'; //end of the table
					
					if(typeof(v.apicraftType) != "undefined" && v.apicraftType == "hotel") {options = {icon: hotelIcon};}
					
					//plot it on the map
					// add a marker in the given location, attach some popup content to it and open the popup
					var a = L.marker([v.location.coordinate.latitude, v.location.coordinate.longitude], options)
						.addTo(map)
						.bindPopup(html);
					if(typeof(v.apicraftType) != "undefined" && v.apicraftType == "main_venue"){a.openPopup();}
						
				}
			}); 
		}
	});
	/*
	
	*/
		
	
	
		
});





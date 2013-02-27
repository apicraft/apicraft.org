
$(function(){
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
	var map = L.map('map').setView([42.336076,-83.049292], 17);

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

	// add a marker in the given location, attach some popup content to it and open the popup
	L.marker([42.336076,-83.049292]).addTo(map).bindPopup('<h4>apicraftconf:</h4> M@dison Building<br/>1555 Broadway St')
	    .openPopup();	
	
	
		
});





$(function(){
	var baseURL = "http://api.apicraft.org";
	var api_url = baseURL + "/conferences/detroit";
	/*
	$.getJSON(api_url, function(response){
		//console.log(response);
	});
	*/
	var spin_options = {lines:9,length:3,width:2,radius:4,corners:1,rotate:0,color:'#fff',speed:1.2,trail:35,shadow:false,hwaccel:false,className:'spinner',zIndex:2e9,top:'2px',left:'10'};

	$(".verb").hover(function(){ $(this).addClass("hover"); }, function(){ $(this).removeClass("hover"); });
	
	$(".resource .verb").click(function(){
			if($(this).data('verb')=="get"){
				var verb = $(this);
				var target = verb.parent().find(".response");

				if(verb.hasClass("active")){ 
					verb.toggleClass('active');
					target.slideUp("fast"); 
				}else{
					
					var requestURL = baseURL + $(this).data("resource");
					target.addClass("language-javascript");
					
					target.find(".request_url").html("GET " + requestURL);
					target.find(".raw_response a").hide();
					target.find(".raw_response").spin(spin_options);
					target.slideDown();
					
					$.ajax({
						url: requestURL, 
						success: function(data){
									var html = JSON.stringify(data, undefined, 1);
									target.find("code").text(html);
									
									target.find(".raw_response a").attr({"href": requestURL});
									target.find(".raw_response a").show();	
								},
						error: function(){
								target.find("code").text("Sorry, resource not available (404)");	
						},
						complete: function(){
							target.find(".raw_response").spin(false);
							Prism.highlightAll();
							verb.toggleClass('active');
						}	
					});
					
				}
			} 
			else if($(this).data('verb')=="post"){
				var verb = $(this);
				var request = verb.parent().find(".request");
				var response = verb.parent().find(".response");
				if(verb.hasClass("active")){ 
					//hide
					verb.toggleClass('active');
					request.slideUp("fast"); response.slideUp("fast");
				}else{
					request.slideDown();
					verb.toggleClass('active');
				}
			}
	});
	
	$(".request_form").submit(function(e){
		//try/catch stops errors from bypassing the "return false" statement at the end of this callback
		try{
			var $data = {}
			$(this).find("input").each(function(i, v){
				//build up a request
				$data[$(v).attr("name")] = $(v).val();
			});
			var verb = $(".resource_" + $(this).data("resource-index") + " .verb_" + $(this).data("post-index"));
			var target = $(".resource_" + $(this).data("resource-index") + " .response_" + $(this).data("post-index"));
			
			var requestURL = baseURL + verb.data("resource");
			log(requestURL);
			target.addClass("language-javascript");
					
			target.find(".request_url").html("POST " + requestURL);
			target.find(".raw_response a").hide();
			target.find(".raw_response").spin(spin_options);
			target.slideDown();
					
			//make the request
			$.ajax({
				url: api_url+"/questions",
				data: $data,
				method: "POST", 
				success: function(d){
					//display the response
					var html = JSON.stringify(d, undefined, 1);
					target.find("code").text(html);
					
					target.find(".raw_response a").attr({"href": api_url+"/questions"});
					target.find(".raw_response a").show();
				},
				error: function(e){ 
					target.find("code").text("Sorry, resource not available (404)");
				},
				complete: function(){
							target.find(".raw_response").spin(false);
							Prism.highlightAll();
							//verb.toggleClass('active');
						}

			});
			
		}
		catch(e){log(e);}
		//stop default form submission behavior
		return false;
	});

	$(window).load(function(){
		log("window loaded.");
		load_hotel_map();
	});

	function load_hotel_map(){
		var hotelIcon = L.icon({
		    iconUrl: 			'images/hotel_icon.png',
		    iconRetinaUrl: 		'images/hotel_icon@2x.png',
		    iconSize: 			[40, 48],
		    iconAnchor: 		[20, 48],
		    popupAnchor: 		[0, -40],
		    shadowUrl: 			'images/hotel_icon_shadow.png',
		    shadowRetinaUrl: 	'images/hotel_icon_shadow@2x.png',
		    shadowSize: 		[53, 46],
		    shadowAnchor: 		[24, 48]
		});

		// create a map in the "map" div, set the view to a given place and zoom
		var map = L.map('hotel_map', {"scrollWheelZoom": false}).setView([42.335000,-83.049292], 15);

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
			url: "http://api.api-craft.org/conferences/detroit/places", 
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

	}
	
	

	function log(x){console.log(x);} //silence is close at hand
	//$(".resource .verb:first").click();
});
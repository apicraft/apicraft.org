$(function(){
	var baseURL = "http://api.apicraft.org";
	var api_url = baseURL + "/conferences/detroit2013";
	var template_dir = "templates/";
	$verb = {self: $(window.location.hash).find(".verb")};

	routie({
		"resource/close": function(){
			log("closed");
		},
		"conferences": function(){
			log('conferences');
			toggle_resource($verb.self);
		},
		"goals": function(){
			log('goals');
			toggle_resource($verb.self);
		},
		"parties": function(){
			log('parties');
			toggle_resource($verb.self);
		},
		"guidelines": function(){
			log('guidelines');
			toggle_resource($verb.self);

		},
		"agenda": function(){
			log('agenda');
			toggle_resource($verb.self);
		},
		"hotels": function(){
			log('hotels');
			toggle_resource($verb.self);
		},
		"sessions": function(){
			log('sessions');
			toggle_resource($verb.self);
		},
		"places": function(){
			log('places');
			toggle_resource($verb.self);
			//animations don't play nice with rendering the map...
			setTimeout(function(){
				load_hotel_map("/places");
			}, 500); 
		},
		"questions": function(){
			log('questions');
			toggle_resource($verb.self);
		},


	});

	var spin_options = {lines:9,length:3,width:2,radius:4,corners:1,rotate:0,color:'#fff',speed:1.2,trail:35,shadow:false,hwaccel:false,className:'spinner',zIndex:2e9,top:'2px',left:'10'};

	$(".verb").hover(function(){ $(this).addClass("hover"); }, function(){ $(this).removeClass("hover"); });
	
	$(".resource .verb").click(function(){ 
		log(window.location.hash + ", " + $(this).data("name"));
		$verb = {self: $(this)};

		if(window.location.hash == "#" + $(this).data("name")){
			log("toggle it");
			toggle_resource($verb.self);
		}else{
			log("routie it");
			routie($(this).data("name"));
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
					target.find("code").text("Question POSTed successfully.");
					
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

	function toggle_resource(element){
			log("toggle: " + element);
			$this = element;
			
			var $verb = {
				self: $this,
				group: $this.parent(),
				target: $this.parent().find(".response"),
				url: $this.data('resource'),
				name: $this.data('resource').replace(/^(?:\/)+/, "")
			}

			if($verb.self.data('verb')=="get"){
				
				
					if($verb.self.hasClass("active")){ 
						$verb.self.toggleClass('active');
						$verb.target.slideUp(); 
						$verb.group.find(".rendered .content").slideUp();

					}else{
						$verb.self.toggleClass('active');
						var requestURL = api_url + $verb.url;
						var template_url = template_dir + $verb.self.data("render") + ".ejs";

						if($verb.url == "/conferences"){ requestURL = baseURL + $verb.url; }
						$verb.target.addClass("language-javascript");
						
						$verb.target.find(".request_url").html("GET " + requestURL);
						$verb.target.find(".raw_response a").hide();
						$verb.target.find(".raw_response").spin(spin_options);
						$verb.target.slideDown();
						
						$.ajax({
							url: requestURL, 
							success: function(data){
										var html = JSON.stringify(data, undefined, 1);
										$verb.target.find("code").text(html);
										
										$verb.target.find(".raw_response a").attr({"href": requestURL});
										$verb.target.find(".raw_response a").show();
										var rendered_response = render_template(template_url, data)
										$verb.group.find(".rendered .content").html(rendered_response);
										
									},
							error: function(){
									$verb.target.find("code").text("Sorry, resource not available (404)");	
							},
							complete: function(){
								$verb.target.find(".raw_response").spin(false);
								Prism.highlightAll();
								$verb.group.find(".rendered .content").slideDown();
								$verb.self.data("busy", false);
							}	
						});
						
					}
			} 
			else if($verb.self.data('verb')=="post"){
				var request = $verb.group.find(".request");
				if($verb.self.hasClass("active")){ 
					//hide
					request.slideUp("fast"); $verb.target.slideUp("fast");
				}else{
					request.slideDown();
				}
				$verb.self.toggleClass('active');

			}
	}//toggle resource

	function render_template(resource, data){
		var response = "Sorry, couldn't find a template at "+ resource +" (404)";
		$.ajax({
			url: resource,
			async: false,
			type: "GET",
			success: function(template){
				try{
					 response = ejs.render(template, data);
				}catch(e){
					log(e);
					response = "Sorry, but there is a problem with "+ resource +" (" + e + ")";
				}
			},
			error: function(e){
				log(e);
			},
			complete: function(){

			}
		});

		return response;
			
	}

	function load_hotel_map(resource){
		// create a map in the "hotel_map" div, set the view to a given place and zoom
		var hotel_map = L.map('hotel_map', {"scrollWheelZoom": false}).setView([42.335000,-83.049292], 15);
		
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

		/*
		// add Cloudmade tile layer (better vis)
		L.tileLayer('http://{s}.tile.cloudmade.com/5278d1bee38f4ebabc822e8d5a6faa2e/997/256/{z}/{x}/{y}.png', {
		    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
		    maxZoom: 18
		}).addTo(hotel_map);
		*/

		// add an OpenStreetMap tile layer
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(hotel_map);

		$.ajax({
			url: api_url + resource, 
			crossDomain: true,
			success: function(d){ 
				log(d);
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
							.addTo(hotel_map)
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
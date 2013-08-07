$(function(){
	var baseURL = "http://api.api-craft.org";
	var api_url = baseURL + "/conferences/detroit2013";
	var template_dir = "templates/";
	var spin_options = {lines:9,length:3,width:2,radius:4,corners:1,rotate:0,color:'#fff',speed:1.2,trail:35,shadow:false,hwaccel:false,className:'spinner',zIndex:2e9,top:'2px',left:'10'};

	$verb = {self: $(window.location.hash).find(".verb.verb_get")};

	//what to do when clicking on a resource or landing on the corresponding hash
	var routes = {
		"registered": function(){
			$("#header .button.register").hide();
			$("#header .thank_you").show();
		},
		"goals": function(){
			toggle_resource({ 
				"target": $verb.self, 
				"data_callback": function(data){
					log("goals");
					return data
				} 
			}); 
		},
		"attendees": function(){ 	toggle_resource({ "target": $verb.self }); },
		"transit": function(){ 		toggle_resource({ "target": $verb.self }); },
		"parties": function(){
			toggle_resource({
				"target": $verb.self, 
				"data_callback": function(data){
					return {"parties": data};
				},
				"complete_callback": function(data){
					log("party complete");
					for(p in data){
						var party = data[p]
						if(typeof(party.yelpID) != "undefined"){
							party.mapID = 'party_map_' + p;
							var party_map = L.map(party.mapID, {"scrollWheelZoom": false}).setView([party.location.coordinate.latitude,party.location.coordinate.longitude], 17);
							// add an OpenStreetMap tile layer
							L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
							    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							}).addTo(party_map);
							L.marker([party.location.coordinate.latitude, party.location.coordinate.longitude])
									.addTo(party_map)
									.bindPopup("<a href='"+party.url+"' target='_blank'>"+party.name+"</a> on Yelp")
									.openPopup();
						}
					}
				}
			});
		},
		"guidelines": function(){ 	toggle_resource({ 
			"target": $verb.self, 
			"data_callback": function(data){
		       delete data.links;
		       return {"guidelines": data};
		     }
		 }); 
		},
		"agenda": function(){
			toggle_resource({
				"target": $verb.self, 
				"data_callback": function(data){
				delete data.links;
				data.days = [ [], [], [], [], [], [], [] ]; 
				
				$.each(data.agenda, function(i, v){
					var t = {}
					t.start = new Date(Date.parse(v.start));
					t.end = new Date(Date.parse(v.end));

					t.start_hour = fix_hour( t.start.getHours() );
					t.start_min = fix_min( t.start.getMinutes() );
					t.start_period = get_period( t.start.getHours() );
					
					t.end_hour = fix_hour( t.end.getHours() );
					t.end_min = fix_min( t.end.getMinutes() );
					t.end_period = get_period( t.end.getHours() );
					
					if (t.start_min == 0){t.start_min = "00";}
					if (t.end_min == 0){t.end_min = "00";}
					
					var add = {
						"duration_minutes": (Date.parse(v.end) - Date.parse(v.start))/1000/60,
						"start_minutes": (t.start.getHours() * 60) + t.start.getMinutes() - 480, /* Nothing starts before 8am */
						"end_minutes": (t.end.getHours() * 60) + t.end.getMinutes() -480,
						"day": t.start.getDay(),
						"start": t.start_hour + ":" + t.start_min + t.start_period,
						"end": t.end_hour + ":" + t.end_min + t.end_period

					}
					$.extend(data.agenda[i], add);
					data.days[add.day].push(data.agenda[i]);
				});

				return data;
			 }
			});
		},
		"hotels": function(){
			toggle_resource({
				"target": $verb.self, 
				"complete_callback": function(data){
					load_hotel_map(data);
					 
				}
			});
		},
		"sessions": function(){ 	toggle_resource({ "target": $verb.self }); },
		"questions": function(){ 	toggle_resource({ "target": $verb.self }); }
	}

	routie(routes);

	$(".verb").hover(function(){ $(this).addClass("hover"); }, function(){ $(this).removeClass("hover"); });
	
	$(".resource .verb").click(function(){ 
		$verb = {self: $(this)};
		var route = $(this).data("name");
		//workaround for browser's onHashChange() not catching some interations (routie is a hash-based router)
		window.location.hash == "#" + route ? routes[route]() : routie(route);
		
	});
	
	$(".request_form").submit(function(e){
		// try/catch stops errors from bypassing the "return false" statement at the end of this callback
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

	function toggle_resource(options){
			var params = {
				"target": $(".verb:first"), 
				"data_callback": function(d){delete d.links; return d;}, 
				"complete_callback": function(d){}
			}
			$.extend(params, options);

			$this = params.target;
			var $verb = {
				self: $this,
				group: $this.parent(),
				target: $this.parent().find(".response"),
				url: $this.data('resource'),
				name: $this.data('resource').replace(/^(?:\/)+/, "")
			}

			$('html,body').stop().animate({
				scrollTop: $verb.group.offset().top -50
			}, 500);

			if($verb.self.data('verb')=="get"){
				
				
					if($verb.self.hasClass("active")){ 
						$verb.self.toggleClass('active');
						$verb.target.slideUp(); 
						$verb.group.find(".rendered .content").slideUp();

					}else{
						$verb.self.toggleClass('active');
						var requestURL = api_url + $verb.url;
						var template_url = template_dir + $verb.self.data("render") + ".ejs";

						if($verb.url == "/conferences"){ requestURL = api_url; }
						$verb.target.addClass("language-javascript");
						
						$verb.target.find(".request_url").html("GET " + requestURL);
						$verb.target.find(".raw_response a").hide();
						$verb.target.find(".raw_response").spin(spin_options);
						$verb.target.slideDown();
						
						$.ajax({
							url: requestURL, 
							success: function(data){
					                    var text = typeof data === 'object' 
					                      ? JSON.stringify(data, undefined, 1)
					                      : JSON.stringify(JSON.parse(data), undefined, 1);

					                    var obj = typeof data === 'string'
					                      ? JSON.parse(data)
					                      : data;

										$verb.target.find("code").text(text);
										$verb.target.find(".raw_response a").attr({"href": requestURL});
										$verb.target.find(".raw_response a").show();

										//execute the pre-processor function
										var template_data = params.data_callback(obj);
										//send processed data to template
										var rendered_response = render_template(template_url, template_data)
										$verb.group.find(".rendered .content").html(rendered_response);
										
									},
							error: function(e){
								log(e);
									$verb.target.find("code").text("Sorry, Resource "+ e.statusText + " (" + e.status + ")");	
							},
							complete: function(data){
								$verb.target.find(".raw_response").spin(false);
								Prism.highlightAll();
								$verb.group.find(".rendered .content").slideDown();
								$verb.self.data("busy", false);

								//send the response data to the callback
								params.complete_callback($.parseJSON(data.responseText));
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
	function fix_min(x){ if(x == 0){return "00";}else{return x;} }
	function fix_hour(x){ if(x > 12){return x - 12; }else{return x;} }
	function get_period(x){if(x < 12){return "am";} else {return "pm";}}
	function load_hotel_map(d){
		//just a custom icon
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


		// create a map in the "hotel_map" div, set the view to a given place and zoom
		$.get(api_url, function(data){
			var text = typeof data === 'object' ? JSON.stringify(data, undefined, 1) : JSON.stringify(JSON.parse(data), undefined, 1);
            var obj = typeof data === 'string' ? JSON.parse(data) : data;

            //create the map and center it on the conference
			var hotel_map = L.map('hotel_map', {"scrollWheelZoom": false}).setView([obj.location.coordinate.latitude, obj.location.coordinate.longitude], 15);

			// add an OpenStreetMap tile layer
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(hotel_map);

			//add the main venue
			var madison = L.marker([obj.location.coordinate.latitude, obj.location.coordinate.longitude])
				.addTo(hotel_map)
				.bindPopup(obj.name)
				.openPopup();
			//add a circle to call out walking distances
			var circle = L.circle([obj.location.coordinate.latitude, obj.location.coordinate.longitude], 800, {
				    color: 'green',
				    fillColor: '#0f0',
				    fillOpacity: 0.05
				})
				.addTo(hotel_map);

			//get the popup template
			$.get(template_dir + "hotel_popup.ejs", function(popup_template){
					//iterate over the hotels
				$.get(template_dir + "hotel_popup.ejs", function(popup_template){
					$.each(d.hotels, function(i, v){
						if(!v.is_closed){
							//render popup template with hotel data
							var html = ejs.render(popup_template, {"v": v});
							// add a marker in the given location, attach the popup content to it
							var a = L.marker([v.location.coordinate.latitude, v.location.coordinate.longitude], {icon: hotelIcon})
								.addTo(hotel_map)
								.bindPopup(html);

						}
					});

				}); 
			
			});

		});//get api_url
		
	}
	
	function log(x){console.log(x);} //silence is close at hand
	//$(".resource .verb:first").click();
});

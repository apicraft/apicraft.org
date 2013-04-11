$(function(){
	var baseURL = "http://api.apicraft.org";
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
				delete data.links;
				return data;
				}
			});
		},
		"attendees": function(){
			toggle_resource({
				"target": $verb.self, 
				"data_callback": function(data){
				delete data.links;
				return data;
				}
			});
		},
		"transit": function(){
			toggle_resource({
				"target": $verb.self, 
				"data_callback": function(data){
				delete data.links;
				return data;
				}
			});
		},
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
		"guidelines": function(){
			toggle_resource({
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
					var start = new Date(Date.parse(v.start));
					var end = new Date(Date.parse(v.end));
					var add = {
						"duration_minutes": (Date.parse(v.end) - Date.parse(v.start))/1000/60,
						"start_minutes": (start.getHours() * 60) + start.getMinutes() - 480, /* Nothing starts before 8am */
						"end_minutes": (end.getHours() * 60) + end.getMinutes() -480,
						"day": start.getDay(),
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
				"data_callback": function(data){
					//animations don't play nice with rendering the map...
					setTimeout(function(){
						load_hotel_map("/hotels");
					}, 500); 
					return data;
				}
			});
		},
		"sessions": function(){
			toggle_resource({
				"target": $verb.self, 
				"data_callback": function(data){
				return data;
				}
			});
		},
		"questions": function(){
			toggle_resource({
				"target": $verb.self, 
				"data_callback": function(data){
				delete data.links;
				return data;
				}
			});
		}
	}

	/*
	"conferences": function(){
			log('conferences');
			toggle_resource($verb.self, function(data){

				var start = new Date(Date.parse(data.start));
				var end = new Date(Date.parse(data.end));
				var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
				data.dateText = days[start.getDay()] + ", " + months[start.getMonth()] + " " + start.getDate() + " - " + days[end.getDay()] + ", " + months[end.getMonth()] + " " + end.getDate() + " " + end.getFullYear();
				log(data.dateText);

				return {"conference": data};
			});
		},
	*/

	routie(routes);

	$(".verb").hover(function(){ $(this).addClass("hover"); }, function(){ $(this).removeClass("hover"); });
	
	$(".resource .verb").click(function(){ 
		$verb = {self: $(this)};
		var route = $(this).data("name");
		//workaround for onHashChange not catching some interations (routie is a hash-based router)
		window.location.hash == "#" + route ? routes[route]() : routie(route);
		
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

	function toggle_resource(options){
			var params = {
				"target": $(".verb:first"), 
				"data_callback": function(d){}, 
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
										var html = JSON.stringify(data, undefined, 1);
										$verb.target.find("code").text(html);
										
										$verb.target.find(".raw_response a").attr({"href": requestURL});
										$verb.target.find(".raw_response a").show();

										//execute the pre-processor function
										var template_data = params.data_callback(data);
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
				$.get(template_dir + "hotel_popup.ejs", function(popup_template){
					$.each(d.hotels, function(i, v){
						if(!v.is_closed){
							var options = null;
							v.popupTitle = v.name
							if(typeof(v.apicraftTitle) != "undefined"){v.popupTitle = v.apicraftTitle;}
							if(typeof(v.apicraftType) != "undefined" && v.apicraftType == "hotel") {options = {icon: hotelIcon};}

							var html = ejs.render(popup_template, {"v": v});
							// add a marker in the given location, attach some popup content to it
							var a = L.marker([v.location.coordinate.latitude, v.location.coordinate.longitude], options)
								.addTo(hotel_map)
								.bindPopup(html);
							if(typeof(v.apicraftType) != "undefined" && v.apicraftType == "main_venue"){a.openPopup();}
						}
					});
					$.get(api_url, function(data){
						var madison = L.marker([data.location.coordinate.latitude, data.location.coordinate.longitude])
							.addTo(hotel_map)
							.bindPopup(data.name)
							.openPopup();

						var circle = L.circle([data.location.coordinate.latitude, data.location.coordinate.longitude], 800, {
							    color: 'green',
							    fillColor: '#0f0',
							    fillOpacity: 0.1
							})
							.addTo(hotel_map)
							.bindPopup("15 Minute Walking Distance");
					});
				}); 
			}
		});

	}

	function log(x){console.log(x);} //silence is close at hand
	//$(".resource .verb:first").click();
});
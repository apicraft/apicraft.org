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

	function log(x){console.log(x);} //silence is close at hand
	//$(".resource .verb:first").click();
});
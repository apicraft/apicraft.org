$(function(){
	
	$.getJSON("http://api.apicraft.org/conferences/detroit/", function(response){
		//console.log(response);
	});
	
	$(".verb").hover(function(){ $(this).addClass("hover"); }, function(){ $(this).removeClass("hover"); });
	
	$(".resource .verb").click(function(){
			if($(this).data('verb')=="get"){
				var verb = $(this);
				var target = verb.parent().find(".response");
				if(verb.hasClass("active")){ 
					verb.toggleClass('active');
					target.slideUp("fast"); 
					
				}else{
					

					var baseURL = "http://api.apicraft.org";
					var requestURL = baseURL + $(this).data("resource");
					target.addClass("language-javascript");
					
					target.find(".request_url").html("GET " + requestURL);
					target.find(".raw_response a").hide();
					target.find(".raw_response").spin({
					  lines: 9, // The number of lines to draw
					  length: 3, // The length of each line
					  width: 2, // The line thickness
					  radius: 4, // The radius of the inner circle
					  corners: 1, // Corner roundness (0..1)
					  rotate: 0, // The rotation offset
					  color: '#fff', // #rgb or #rrggbb
					  speed: 1.2, // Rounds per second
					  trail: 35, // Afterglow percentage
					  shadow: false, // Whether to render a shadow
					  hwaccel: false, // Whether to use hardware acceleration
					  className: 'spinner', // The CSS class to assign to the spinner
					  zIndex: 2e9, // The z-index (defaults to 2000000000)
					  top: '2px', // Top position relative to parent in px
					  left: '10' // Left position relative to parent in px
					});
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
	});
	
	//$(".resource .verb:first").click();
});
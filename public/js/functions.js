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
					target.find(".raw_response a").attr({"href": requestURL});
					
					$.ajax({
						url: requestURL, 
						success: function(data){
									var html = JSON.stringify(data, undefined, 1);
									target.find("code").text(html);
									Prism.highlightAll();
									verb.toggleClass('active');
									target.slideDown();
								},
						error: function(){
								target.find("code").text("Sorry, resource not available (404)");
								Prism.highlightAll();
								verb.toggleClass('active');
								target.slideDown();
						}	
					});
				
				}
			}
	});
	
	//$(".resource .verb:first").click();
});
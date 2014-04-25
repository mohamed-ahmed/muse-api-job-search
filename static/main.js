$( document ).ready( function(){
	console.log("document ready");

	$("#search-button").click(requestData);

} );

function requestData(){
	console.log("requestData");
	var url = "/json";
	$.get(url, onGetJsonResponse);
}

function onGetJsonResponse(data){
	console.log("onGetJsonResponse");
	console.log(data);
	processJobData(data);
}

function processJobData(data){
	var numPages = data.page_count;
	var results = data.results;
	console.log(numPages);
	for( var i = 0 ; i < results.length ; i++){
		addJobtoDom(results[i]);
	}
}

function addJobtoDom(job){
	var elem =
		dom("div", {class:"job row"},
			dom("img", {class:"logo col-xs-6 col-md-4", src: job.company_small_logo_image}),
			dom("div", {class:"text-info col-xs-6 col-md-4"},
				dom("p", {class:"company-name"}, document.createTextNode("Company: " + job.company_name)),
				dom("p", {class:"company-location"}, document.createTextNode("Location: " + job.locations.toString())),
				dom("a", {class:"muse-link",href:"https://www.themuse.com"+job.apply_link, target:"_blank"}, document.createTextNode("More info"))
			)
		);

	$("#job-container").append(elem);
}













function dom(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    forEachIn(attributes, function(name, value) {
      setNodeAttribute(node, name, value);
    });
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

function forEachIn(object, action) {
  for (var property in object) {
    if (object.hasOwnProperty(property))
      action(property, object[property]);
  }
}

function setNodeAttribute(node, attribute, value) {
  if (attribute == "class")
    node.className = value;
  else if (attribute == "checked")
    node.defaultChecked = value;
  else if (attribute == "for")
    node.htmlFor = value;
  else if (attribute == "style")
    node.style.cssText = value;
  else
    node.setAttribute(attribute, value);
}
var _sortedList;
var queryObject = {
	baseString : "/json?",
	page : 0,
	company: null,
	job_location : null,
	job_category : null,
	job_level : null,
	company_industry: null,
	getUrlString : function(){
		var s = "/json?";
		s += "page=" + encodeURIComponent(this.page);
		if(this.company) s += "&company=" + encodeURIComponent(this.company);
		if(this.job_location) s += "&job_location=" + encodeURIComponent(this.job_location);
		if(this.job_category) s += "&job_category=" + encodeURIComponent(this.job_category);
		if(this.job_level) s += "&job_level=" + encodeURIComponent(this.job_level);
		if(this.company_industry) s += "&company_industry=" + encodeURIComponent(this.company_industry);

		return s;
	}
};

$( document ).ready( function(){
	console.log("document ready");

	$("#search-button").click(requestData);


} );

function requestData(){
	console.log("requestData");
	$(".job").remove();

	//var myLocation = new google.maps.LatLng(45.4214, -75.691);
	var myLocation = new google.maps.LatLng(36, -118.691);
	rankLocationsByDistance(LOCATIONS, myLocation);

	queryObject.job_location = _sortedList[0].name;

	var url = queryObject.getUrlString();
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

function rankLocationsByDistance(jobLocations, myLatLang){
	var jobLatLng;
	var distance;
	var sortedList = [];

	for(var i = 0 ; i < jobLocations.length ; i++){
		jobLatLng = new google.maps.LatLng(jobLocations[i].location[0], jobLocations[i].location[1]);
		distance = google.maps.geometry.spherical.computeDistanceBetween(myLatLang, jobLatLng);
		jobLocations[i].distance = distance;
		//console.log(jobLocations[i].name + " : " + jobLocations[i].distance);
		/*if(sortedList.length == 0){
			sortedList.push(jobLocations[0]);
		}
		var j = 0;

		while(jobLocations[i].distance > sortedList[j].distance){
			j++;
		}
		sortedList.splice(j, 0, jobLocations[i] );*/

	}

	sortedList = _.sortBy(jobLocations, "distance");

	_sortedList = sortedList;

	for(var i = 0 ; i < sortedList.length ; i++){
		console.log(sortedList[i].name + " : " + sortedList[i].distance);
	}


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
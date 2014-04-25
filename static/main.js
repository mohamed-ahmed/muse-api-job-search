var _searchLocation
var _sortedList;
var _queryObject = {
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

var _responseObject = {
	currentPage : null,
	totalPages : null,
	numberOfResults : null
}

var _cityNum = 0;


//var myLocation = new google.maps.LatLng(45.4214, -75.691);
//var myLocation = new google.maps.LatLng(36, -118.691);






$( document ).ready( function(){
	console.log("document ready");


	$("#search-button").click(function(){
		$(".job").remove();
		_cityNum = 0;
		_queryObject.page=0;
		requestData();
	});



	$("#load-more-button").click(function(){
		if(_responseObject.currentPage == _responseObject.totalPages -1){
			_queryObject.page = 0;
			_cityNum++;
			_queryObject.job_location = _sortedList[_cityNum].name;
		}
		else{
			_queryObject.page = _queryObject.page+1;
		}
		requestData();
	});

	$("#inputJobCategory").change(function(){
		console.log( $("#inputJobCategory").val() );
		_queryObject.job_category = $("#inputJobCategory").val();
		_cityNum = 0;
	});

	$("#inputJobLevel").change(function(){
		console.log( $("#inputJobLevel").val() );
		_queryObject.job_level = $("#inputJobLevel").val();
		_cityNum = 0;
	});

	$("#inputCompany").change(function(){
		console.log( $("#inputCompany").val() );
		_queryObject.company = $("#inputCompany").val();
		_cityNum = 0;
	});

	var input = document.getElementById('search-location');
	autocomplete = new google.maps.places.Autocomplete(input);

	google.maps.event.addListener(autocomplete, 'place_changed', inputEventHandler);


	function inputEventHandler() {
			//input.className = '';
			var place = autocomplete.getPlace();
			console.log("Searching for place: ");
			console.log(place);
			if (!place.geometry) {
			// Inform the user that the place was not found and return.
			//input.className = 'notfound';
			return;
		}

		else{
			_searchLocation =  new google.maps.LatLng( place.geometry.location.lat(), place.geometry.location.lng());
			console.log("_searchLocation: ");
			console.log(_searchLocation);
			$("#use-current-location").css({"background-color":"white"});
			rankLocationsByDistance(LOCATIONS, _searchLocation);
			_queryObject.job_location = _sortedList[0].name;

		}

	}

	$("#use-current-location").click(function(){
		console.log("use-current-location clicked");
		getLocation();
		function getLocation(){
			if (navigator.geolocation){
				navigator.geolocation.getCurrentPosition(showPosition);
			}
		}
		function showPosition(position){
			_searchLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			console.log(_searchLocation);
			$("#use-current-location").css({"background-color":"rgb(0, 133, 255)"});
			rankLocationsByDistance(LOCATIONS, _searchLocation);
			_queryObject.job_location = _sortedList[0].name;
		}

	});

	$("#use-current-location").trigger("click");
	$("#search-button").trigger("click");

} );

function requestData(){
	console.log("requestData");


	var url = _queryObject.getUrlString();
	$.get(url, onGetJsonResponse);
}

function onGetJsonResponse(data){
	console.log("onGetJsonResponse");
	console.log(data);
	_responseObject.totalPages = data.page_count;
	_responseObject.currentPage = data.page;
	_responseObject.numberOfResults = data.results.length;

	if(_responseObject.numberOfResults == 0 && _responseObject.currentPage == 0){
		_cityNum++;
		_queryObject.job_location = _sortedList[_cityNum].name;
		requestData();
	}

	processJobData(data);
	$("#load-more-button").show();
}

function processJobData(data){
	var numPages = data.page_count;
	var results = data.results;
	var query;
	console.log(numPages);
	for( var i = 0 ; i < results.length ; i++){
		if(results[i].locations.length > 1){
			results[i].distance = "multiple";
		}
		else{
			query = _.where(LOCATIONS, { name : results[i].locations[0] } )[0];
			if(!query){
				results[i].distance = "N/A";
			}
			else{
				results[i].distance =  "" + Math.floor(query.distance / 1000 ) + " km";
			}
		}

		addJobToDom(results[i]);
	}
}

function addJobToDom(job){
	var elem =
		dom("div", {class:"job row"},
			dom("img", {class:"logo col-xs-6 col-md-4", src: job.company_small_logo_image}),
			dom("div", {class:"text-info col-xs-12 col-md-4"},
				dom("p", {class:"company-name"}, document.createTextNode("Company: " + job.company_name)),
				dom("p", {class:"company-location"}, document.createTextNode("Location: " + job.locations.toString())),
				dom("p", {class:"distance"}, document.createTextNode("Distance: " + job.distance)),
				dom("a", {class:"muse-link",href:"https://www.themuse.com"+job.apply_link, target:"_blank"}, document.createTextNode("More info"))
			),
			dom("div", {class:"text-info col-xs-12 col-md-4"},
				dom("p", {class:"job-title"}, document.createTextNode("Job Title: " + job.title)),
				dom("p", {class:"job-levels"}, document.createTextNode("Job Level: " + job.levels.toString())),
				dom("p", {class:"posting-date"}, document.createTextNode("Posting date: " + (new Date(job.creation_date)).toDateString() )),
				dom("a", {class:"muse-link",href:"https://www.themuse.com"+job.apply_link, target:"_blank"}, document.createTextNode("More info"))
			)
		);

	$("#job-container").append(elem);
	$(elem).slideDown("slow");
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
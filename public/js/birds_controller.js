angular.module('BirdWatcher').controller('BirdsController', BirdsController);

function BirdsController($http){
	var birds = this;

	birds.new = function(){
		var sighting ={bird: birds.type, Location: birds.location}
		$http
			.post('/sightings', sighting)
			.then(function(response){
				birds.list.push(response.data.ops[0])
				birds.fetch();
			})
	}

	birds.fetch = function(){
		$http
			.get('/sightings')
			.then(function(response){
				birds.list = response.data.sightings
		})
	}

	birds.url = function(sighting){
		console.log(sighting)
		return "http://maps.google.com/maps?z=18&q=" +sighting.latLong.lng + sighting.latLong.lat
	}

	birds.fetch();
}
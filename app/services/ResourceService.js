var ResourceService = {
	graphics: {
		mapLib: function(index) {
			switch(index) {
				case 100:
					return {
						path: "data/tiles" + (index - 99),
						type: 'jpg'					
					};
				case 110:
					return {
						path: "data/smtiles" + (index - 109),
						type: 'jpg'			
					};		
				case 120:
				case 123:
					return {
						path: "data/objects" + (index - 119),
						type: 'png',
						placements: 'data/objects' + (index - 119) + '.json'			
					};		
				default:
					return null;		
			}
		},
		placements: [
			"data/objects1",
			"data/objects3",
			"data/objects4"
		]
	}
}

module.exports = ResourceService;
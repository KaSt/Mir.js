var ResourceService = {
	graphics: {
		mapLib: function(index) {
			switch(index) {
				case 100:
					return {
						path: "data/tiles" + (index - 100),
						type: 'jpg'					
					};
				case 110:
					return {
						path: "data/smtiles" + (index - 110),
						type: 'jpg'					
					};		
				case 120:
				case 123:
					return {
						path: "data/objects" + (index - 120),
						type: 'png'					
					};		
				default:
					return null;		
			}
		}
	}
}

module.exports = ResourceService;
var ResourceService = {
	graphics: {
		mapLib: function(index) {
			switch(index) {
				case 100:
					return {
						path: "data/tiles" + (100 - index),
						type: 'jpg'					
					};
				case 110:
					return {
						path: "data/smtiles" + (110 - index),
						type: 'jpg'					
					};		
				case 120:
					return {
						path: "data/objects" + (120 - index),
						type: 'png'					
					};		
				default:
					return null;		
			}
		}
	}
}

module.exports = ResourceService;
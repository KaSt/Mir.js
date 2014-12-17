var ResourceService = {
	graphics: {
		mapLib: function(index) {
			switch(index) {
				case 100:
					return {
						path: "data/tiles" + (index - 99),
						type: 'jpg',
						placements: 'data/tiles' + (index - 99) + '.json'
					};
				case 110:
					return {
						path: "data/smtiles" + (index - 109),
						type: 'jpg'			
					};		
				case 120:
				case 123:
				case 125:
					return {
						path: "data/objects" + (index - 119),
						type: 'png',
						placements: 'data/objects' + (index - 119) + '.json'		
					};		
				default:
					return null;		
			}
		},
		humLib: function(look) {
			switch(look) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					return {
						path: "data/hum1",
						type: 'png',
						placements: 'data/hum1.json'
					};
			}
		},
		hairLib: function(look) {
			switch(look) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					return {
						path: "data/hair1",
						type: 'png',
						placements: 'data/hair1.json'
					};
			}
		},		
		npcLib: function(look) {
			switch(look) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
					return {
						path: "data/npc1",
						type: 'png',
						placements: 'data/npc1.json'
					};
			}
		},		
		mobLib: function(look) {
			switch(look) {
				case 0:
					return {
						path: "data/mon1",
						type: 'png',
						placements: 'data/mon1.json'
					};
			}			
		},
		placements: [
			"data/mon1",
			"data/hair1",
			"data/hum1",
			"data/npc1",
			"data/tiles1",
			"data/objects1",
			"data/objects3",
			"data/objects4",
			"data/objects6"
		]
	}
}

module.exports = ResourceService;
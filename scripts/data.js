var fs = require("fs");

module.exports.get = function(req, res){
	var file = fs.readFileSync(__dirname + "/../data/PGATour"+req.params.year+"_aggregate.json");

	res.setHeader("Content-Type", "application/json");
	res.send(file);
}
var express = require("express"),
	path = require("path"),
	data = require("./data");

var app = express();
var port = 3000;

app.use("/", express.static(path.normalize(__dirname + "/../app")));

app.get("/data/:year", data.get);

app.listen(port);
console.log("Listening on port: " + port);
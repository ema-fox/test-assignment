var http = require("http");
var url = require("url");
var fs = require("fs");

var index = fs.readFileSync("index.html");
var client = fs.readFileSync("client.js");

var clients = {}

function get (request, response) {
    switch (url.parse(request.url)["pathname"]) {
    case "/":
    case "/index.html":
	response.setHeader("Content-Type", "text/html");
	response.end(index);
	break;
    case "/client.js":
	response.setHeader("Content-Type", "text/javascript");
	response.end(client);
	break;
    default:
	response.statusCode = 404;
	response.end();
    }
}

function forEachClient (f) {
    for (var c in clients) {
	if (clients.hasOwnProperty(c)) {
	    f(c, clients[c]);
	}
    }
}

function post (request, response) {
    var chunks = "";
    request.on("data", function(chunk) {
	chunks = chunks + chunk;
    });
    request.on("end", function () {
	var data = JSON.parse(chunks);
	var id = request.headers["host"] + " " + request.headers["user-agent"];
	if (data[0] !== "poll") {
	    forEachClient(function (cname, cmsgs) {
		if (cname !== id) {
		    cmsgs.push(data);
		}
	    });
	}
	response.setHeader("Content-Type", "text/plain");
	if (clients[id]) {
	    response.end(JSON.stringify(clients[id]));
	    clients[id] = [];
	} else {
	    clients[id] = [];
	    var clist = ""
	    forEachClient(function (cname, cmsgs) {
		clist = clist + cname + "<br>";
	    });
	    forEachClient(function (cname, cmsgs) {
		cmsgs.push(["clientlist", clist]);
	    });
	    response.end("[]");
	}
    });
}

server = http.createServer(function (request, response) {
    switch(request.method) {
    case "GET":
	get(request, response);
	break;
    case "POST":
	post(request, response);
	break;
    }
});

server.listen(8080);

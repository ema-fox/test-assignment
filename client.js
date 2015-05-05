var ctx;
var mousep = [0, 0];
var mousedown = false;

function draw (pa, pb) {
    ctx.beginPath();
    ctx.moveTo(pa[0], pa[1]);
    ctx.lineTo(pb[0], pb[1]);
    ctx.stroke();
}

function send (data) {
    $.ajax("/msg", {"data": JSON.stringify(data),
		    "method": "POST",
		    "dataType": "json",
		    "processData": false,
		    "success": function (data, status, jqXHR) {
			for (var i = 0; i < data.length; i++) {
			    received(data[i]);
			}
		    }});
}

function received (data) {
    if (data[0] === "line") {
	draw(data[1][0], data[1][1]);
    }
}

function line (pa, pb) {
    draw(pa, pb);
    send(["line", [pa, pb]]);
}

$(function () {
    var canvas = $("canvas");
    canvas[0].width = window.innerWidth;
    canvas[0].height = window.innerHeight;
    ctx = canvas[0].getContext("2d");
    canvas.mousemove(function (event) {
	newmousep = [event.pageX - canvas.offset().left, event.pageY - canvas.offset().top];
	if (mousedown) {
	    line(mousep, newmousep);
	}
	mousep = newmousep;
    })
    canvas.mousedown(function (event) {
	mousedown = true;
    });
    canvas.mouseup(function (event) {
	mousedown = false;
    });
    setInterval(function () {
	send(["poll"]);
    }, 200);
});

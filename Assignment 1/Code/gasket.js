
var canvas;
var gl;
var points;

window.onload=function init()
{
	canvas=document.getElementById("gl-canvas");

	gl=WebGLUtils.setupWebGL(canvas);
	if(!gl){
		alert("WebGL not available");
	}

	var vertices=[
		vec2(-0.5, -0.5),
		vec2(0.5, -0.5),
		vec2(0.0, 0.5)
	];

	var u=add(vertices[0], vertices[1]);
	var v=add(vertices[0], vertices[2]);
	var p=scale(0.25, add(u,v));
	
	points=[p];

	for(var i=0; points.length<5000; ++i){
		var j=Math.floor(Math.random()*3);
        	p=add(points[i], vertices[j]);
        	p=scale(0.5, p);
        	points.push(p);
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	
	var program=initShaders(gl, "vertex-shader", "fragment-shader")
	gl.useProgram(program);
	
	var buffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	var vPosition=gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	render();
};

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.POINTS, 0, points.length);
}

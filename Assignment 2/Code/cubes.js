
var canvas;
var gl;
var length = 2.0;
var vPosition;

//translation vars
var translate_cube1 = vec3(10.0, 10.0, 10.0);
var translate_cube2 = vec3(10.0, 10.0, -10.0);
var translate_cube3 = vec3(10.0, -10.0, 10.0);
var translate_cube4 = vec3(10.0, -10.0, -10.0);
var translate_cube5 = vec3(-10.0, 10.0, 10.0);
var translate_cube6 = vec3(-10.0, 10.0, -10.0);
var translate_cube7 = vec3(-10.0, -10.0, 10.0);
var translate_cube8 = vec3(-10.0, -10.0, -10.0);

//color vars
var cubeColor;
var colors=[
    [0.0, 0.0, 0.0, 1.0],
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 0.0, 1.0],
    [1.0, 0.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0]
]

var modelViewMatrix;

//camera vars
var projectionMatrix;
var fovy=100.0;
var aspect=1;
var near=0.1;
var far=100;

var x=0;
var y=0;
var z=-30;

var phi=0;
var theta=0;

//crosshair var
var cross=false;

var deg=0;

window.onload = function init()
{

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    vertices = [
        vec3(  length,   length, length ), //vertex 0
        vec3(  length,  -length, length ), //vertex 1
        vec3( -length,   length, length ), //vertex 2
        vec3( -length,  -length, length ),  //vertex 3 
        vec3(  length,   length, -length ), //vertex 4
        vec3(  length,  -length, -length ), //vertex 5
        vec3( -length,   length, -length ), //vertex 6
        vec3( -length,  -length, -length )  //vertex 7
    ];

    //setup vertices for cubes
    var points = [];
    Cube(vertices, points);
    
    //add vertices for crosshair
    points.push(vec3(1, 0, -1));
    points.push(vec3(-1, 0, -1));
    points.push(vec3(0, 1, -1));
    points.push(vec3(0, -1, -1));

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    cubeColor=gl.getUniformLocation(program, "vColor");

    modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

    
    //keyboard input handler
    window.onkeydown = function (e){
        var key = e.keyCode ? e.keyCode : e.which;
        //c for color
        if(key==67){
            var newColors=[];
            for(i=0; i<colors.length; i++)
            {
                newColors[i]=colors[(i+1)%8];
            }
            colors=newColors;
        
        }
        //n
        else if(key==78){
            fovy=fovy-0.25;
        }
        //w
        else if(key==87){
            fovy=fovy+0.25;
        }
        //i
        else if(key==73){
            //z=z+0.25;
            z=z + (Math.cos(theta*(Math.PI/180))*0.25)
            x=x - (Math.sin(theta*(Math.PI/180))*0.25)
        }
        //j
        else if(key==74){
            z=z + (Math.sin(theta*(Math.PI/180))*0.25)
            x=x + (Math.cos(theta*(Math.PI/180))*0.25)
        }
        //k
        else if(key==75){
            z=z - (Math.sin(theta*(Math.PI/180))*0.25)
            x=x - (Math.cos(theta*(Math.PI/180))*0.25)
        }
        //m
        else if(key==77){
            z=z - (Math.cos(theta*(Math.PI/180))*0.25)
            x=x + (Math.sin(theta*(Math.PI/180))*0.25)
        }
        //up
        else if(key==38){
            phi=phi-1;
        }
        //down
        else if(key==40){
            phi=phi+1;
        }
        //left
        else if(key==37){
            theta=theta-1;
        }
        //right
        else if(key==39){
            theta=theta+1;
        }
        //h for crosshair
        else if(key==72){
            cross=(!cross);
        }
        //r for reset
        else if(key==82){
            fovy=100.0;
            aspect=1;
            near=0.1;
            far=100;
            
            x=0;
            y=0;
            z=-30;
            
            phi=0;
            theta=0;
        }
    }
    
    render();
}

//helper function to help make vertices 3d, from discussion section
function Cube(vertices, points){
    Quad(vertices, points, 0, 1, 2, 3);
    Quad(vertices, points, 4, 0, 6, 2);
    Quad(vertices, points, 4, 5, 0, 1);
    Quad(vertices, points, 2, 3, 6, 7);
    Quad(vertices, points, 1, 5, 3, 7);
    Quad(vertices, points, 6, 7, 4, 5);
}

//helper function to help make vertices 3d, from discussion section
function Quad( vertices, points, v1, v2, v3, v4){
    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    deg=deg+3;
    
    projectionMatrix = perspective(fovy, aspect, near, far);
    
    //render the cubes
    gl.uniform4fv(cubeColor, colors[0]);
    var ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, translate(translate_cube1));
    //ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );
    
    gl.uniform4fv(cubeColor, colors[1]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube2));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    gl.uniform4fv(cubeColor, colors[2]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube3));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    gl.uniform4fv(cubeColor, colors[3]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube4));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    gl.uniform4fv(cubeColor, colors[4]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube5));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    gl.uniform4fv(cubeColor, colors[5]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube6));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    gl.uniform4fv(cubeColor, colors[6]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube7));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );

    gl.uniform4fv(cubeColor, colors[7]);
    ctm = mat4();
    ctm = mult(ctm, projectionMatrix);
    ctm = mult(ctm, rotate(theta, [0, 1, 0]));
    ctm = mult(ctm, rotate(phi, [1, 0, 0]));
    ctm = mult(ctm, translate(translate_cube8));
    ctm = mult(ctm, translate(vec3(x,y,z)));
    ctm = mult(ctm, rotate(deg,[0, 1, 0]));
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
    gl.drawArrays( gl.TRIANGLES, 0, 36 );
    
    //render the crosshair
    if(cross){
        projectionMatrix = ortho(-3, 3, -3, 3, -3, 3);
        gl.uniform4fv(cubeColor, [0.0, 0.0, 0.0, 1.0]);
        ctm = mat4();
        ctm = mult(ctm, projectionMatrix);
        gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
        gl.drawArrays(gl.LINES, 36, 4);
    }
    
    window.requestAnimFrame( render );
}


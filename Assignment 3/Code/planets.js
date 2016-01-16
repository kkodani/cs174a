

var canvas;
var gl;

var sphereVerts = 4;
 
var index = 0;

var pointsArray = [];
var normalsArray = [];

var fovy = 100.0
var aspect = 1;
var near = 0.1;
var far = 1000;

var x=0;
var y=0;
var z=-15;

var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

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

var deg1=0;
var deg2=0;
var deg3=0;
var deg4=0;

var translate_sun = vec3(0.0, 0.0, 0.0);
var translate_planet1 = vec3(10.0, 0.0, 0.0);
var translate_planet2 = vec3(14.0, 0.0, 0.0);
var translate_planet3 = vec3(19.0, 0.0, 0.0);
var translate_planet4 = vec3(26.0, 0.0, 0.0);

var scale_sun =vec3(5, 5, 5);
var scale_planet1 =vec3(1, 1, 1);
var scale_planet2 =vec3(1.6, 1.6, 1.6);
var scale_planet3 =vec3(2, 2, 2);
var scale_planet4 =vec3(2.3, 2.3, 2.3);

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
var lightAmbient = vec4(0.9, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 0.9, 0.5, 0.5, 1.0 );
var lightSpecular = vec4( 0.9, 0.5, 0.5, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye = vec3(0.0, 10.0, -20.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
    
function triangle(a, b, c) {

     normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    
    
    tetrahedron(va, vb, vc, vd, sphereVerts);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    ambProd = gl.getUniformLocation(program, "ambientProduct");
    diffProd = gl.getUniformLocation(program, "diffuseProduct");
    specProd = gl.getUniformLocation(program, "specularProduct");
    lightPos = gl.getUniformLocation(program, "lightPosition");
    shiny = gl.getUniformLocation(program, "shininess");

    


    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    deg1=deg1+1.2;
    deg2=deg2+1.0;
    deg3=deg3+0.8;
    deg4=deg4+0.6;
    
    //sun
    materialAmbient = vec4( 0.9, 0.5, 0.5, 1.0 );
    materialDiffuse = vec4( 0.9, 0.5, 0.5, 1.0 );
    materialSpecular = vec4( 0.9, 0.5, 0.5, 1.0 );
    materialShininess = 100.0;

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( ambProd, flatten(ambientProduct) );
    gl.uniform4fv( diffProd, flatten(diffuseProduct) );
    gl.uniform4fv( specProd, flatten(specularProduct) );
    gl.uniform4fv( lightPos, flatten(lightPosition) );
    gl.uniform1f( shiny, materialShininess );

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = mat4();
    
    modelViewMatrix = mult(modelViewMatrix, translate(translate_sun));
    modelViewMatrix = mult(modelViewMatrix, scale(scale_sun));
    projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    
    
    //planet 1: ice planet
    
    materialAmbient = vec4( 0.5, 0.6, 0.9, 1.0 );
    materialDiffuse = vec4( 0.5, 0.6, 0.9, 1.0 );
    materialSpecular = vec4( 0.5, 0.6, 0.9, 1.0 );
    materialShininess = 1000.0;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( ambProd, flatten(ambientProduct) );
    gl.uniform4fv( diffProd, flatten(diffuseProduct) );
    gl.uniform4fv( specProd, flatten(specularProduct) );
    gl.uniform4fv( lightPos, flatten(lightPosition) );
    gl.uniform1f( shiny, materialShininess );

    
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = mat4();
    
    modelViewMatrix = mult(modelViewMatrix, rotate(deg1, [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, translate(translate_planet1));
    modelViewMatrix = mult(modelViewMatrix, scale(scale_planet1));
    projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    
    //planet 2: water planet
    materialAmbient = vec4( 0.1, 0.1, 0.4, 1.0 );
    materialDiffuse = vec4( 0.1, 0.1, 0.5, 1.0 );
    materialSpecular = vec4( 0.1, 0.1, 0.5, 1.0 );
    materialShininess = 200.0;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( ambProd, flatten(ambientProduct) );
    gl.uniform4fv( diffProd, flatten(diffuseProduct) );
    gl.uniform4fv( specProd, flatten(specularProduct) );
    gl.uniform4fv( lightPos, flatten(lightPosition) );
    gl.uniform1f( shiny, materialShininess );
    
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = mat4();
    
    modelViewMatrix = mult(modelViewMatrix, rotate(deg2, [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, translate(translate_planet2));
    modelViewMatrix = mult(modelViewMatrix, scale(scale_planet2));
    projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    
    //planet 3: swamp planet
    materialAmbient = vec4( 0.1, 0.4, 0.1, 1.0 );
    materialDiffuse = vec4( 0.3, 0.9, 0.3, 1.0 );
    materialSpecular = vec4( 0.1, 0.4, 0.1, 1.0 );
    materialShininess = 20.0;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( ambProd, flatten(ambientProduct) );
    gl.uniform4fv( diffProd, flatten(diffuseProduct) );
    gl.uniform4fv( specProd, flatten(specularProduct) );
    gl.uniform4fv( lightPos, flatten(lightPosition) );
    gl.uniform1f( shiny, materialShininess );
    
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = mat4();
    
    modelViewMatrix = mult(modelViewMatrix, rotate(deg3, [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, translate(translate_planet3));
    modelViewMatrix = mult(modelViewMatrix, scale(scale_planet3));
    projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    
    
    //planet 4: mud planet
    materialAmbient = vec4( 0.5, 0.3, 0.1, 1.0 );
    materialDiffuse = vec4( 0.5, 0.3, 0.1, 1.0 );
    materialSpecular = vec4( 0.1, 0.05, 0.0, 1.0 );
    materialShininess = 20.0;
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( ambProd, flatten(ambientProduct) );
    gl.uniform4fv( diffProd, flatten(diffuseProduct) );
    gl.uniform4fv( specProd, flatten(specularProduct) );
    gl.uniform4fv( lightPos, flatten(lightPosition) );
    gl.uniform1f( shiny, materialShininess );
    
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = mat4();
    
    modelViewMatrix = mult(modelViewMatrix, rotate(deg4, [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, translate(translate_planet4));
    modelViewMatrix = mult(modelViewMatrix, scale(scale_planet4));
    projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    
    window.requestAnimFrame(render);
}

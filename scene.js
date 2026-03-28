// webgl vars
var gl, canvas;
var uProjectionMatrix, uViewMatrix;

// movement vars
var keys = {
    "w": false,
    "a": false,
    "s": false,
    "d": false,
    "q": false,
    "e": false
};

var yaw = 0.0;
var pitch = 0.0;
var walkSpeed = 0.1;
var turnSpeed = 0.05;

// initial cam position
var camX = 0.0;
var camY = 2.0;
var camZ = 5.0;

const floorVertices = new Float32Array([
    // First Triangle (Left half of the square)
    -2.0, 0.0, -2.0,
     2.0, 0.0, -2.0,
    -2.0, 0.0,  2.0,
    // Second Triangle (Right half of the square)
    -2.0, 0.0,  2.0,
     2.0, 0.0, -2.0,
     2.0, 0.0,  2.0
]);

// Let's make the floor a dark, gloomy gray (RGBA format)
const floorColors = new Float32Array([
    0.2, 0.2, 0.2, 1.0,   0.2, 0.2, 0.2, 1.0,   0.2, 0.2, 0.2, 1.0,
    0.2, 0.2, 0.2, 1.0,   0.2, 0.2, 0.2, 1.0,   0.2, 0.2, 0.2, 1.0
]);

window.onload = function init() {
    canvas = document.querySelector("#gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available :("); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.5, 1.0); // Very dark night sky
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Color Buffer
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorColors, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Position Buffer
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // event listeners
    window.addEventListener("keydown", function(event) {
        var key = event.key.toLowerCase();
        if (key in keys) {
            keys[key] = true;
        }
    });

    // "debouncing" the button
    window.addEventListener("keyup", function(event) {
        var key = event.key.toLowerCase();
        if (key in keys) {
            keys[key] = false;
        }
    });

    // Matrices
    uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");

    render();
}

// rendering logic
function render() {
    // Clear out the previous frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate the Projection Matrix (Lens)
    // 45 degree FOV, matching canvas aspect ratio, 0.1 near clip, 100.0 far clip
    var projectionMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 100.0);

    // turning head left or right
    if (keys.q) yaw -= turnSpeed;
    if (keys.e) yaw += turnSpeed;

    // Calculate the direction we are currently facing
    var forwardX = Math.sin(yaw);
    var forwardZ = -Math.cos(yaw);
    
    // Calculate the direction directly to our right (for strafing)
    var rightX = Math.cos(yaw);
    var rightZ = Math.sin(yaw);

    if (keys.w) { camX += forwardX * walkSpeed; camZ += forwardZ * walkSpeed; } // Forward
    if (keys.s) { camX -= forwardX * walkSpeed; camZ -= forwardZ * walkSpeed; } // Backward
    if (keys.a) { camX -= rightX * walkSpeed;   camZ -= rightZ * walkSpeed; }   // Left
    if (keys.d) { camX += rightX * walkSpeed;   camZ += rightZ * walkSpeed; }   // Right

    // update camera matrices
    var eye = vec3(camX, camY, camZ);
    
    // target = current pos + forward direction
    var at = vec3(camX + forwardX, camY, camZ + forwardZ);  
    var up = vec3(0.0, 1.0, 0.0);

    var viewMatrix = lookAt(eye, at, up);

    // send flattened matrices to GPU
    gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(uViewMatrix, false, flatten(viewMatrix));

    // Draw the floor
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Ask the browser to draw the next frame
    requestAnimFrame(render); 
}
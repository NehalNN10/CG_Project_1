// webgl vars
var gl, canvas;
var uProjectionMatrix, uViewMatrix, uModelMatrixLoc;

// buffer vars
var floorVBuffer, floorCBuffer;
var tombstoneVBuffer, tombstoneCBuffer;
var vPositionLoc, vColorLoc; 

// movement vars
var keys = { "w": false, "a": false, "s": false, "d": false, "q": false, "e": false };

var yaw = 0.0;
var pitch = 0.0;
var walkSpeed = 0.05;
var turnSpeed = 0.05;

// initial cam position (Spawned close to the graves)
var camX = 0.0;
var camY = 2.0;
var camZ = 5.0; 

// --- VERTEX DATA ---
const floorVertices = new Float32Array([
    -3.0, 0.0, -20.0,  
     3.0, 0.0, -20.0,  
    -3.0, 0.0,  20.0,  
    -3.0, 0.0,  20.0,  
     3.0, 0.0, -20.0,  
     3.0, 0.0,  20.0   
]);

const floorColors = new Float32Array([
    0.3, 0.3, 0.3, 1.0,   0.3, 0.3, 0.3, 1.0,   0.3, 0.3, 0.3, 1.0,
    0.3, 0.3, 0.3, 1.0,   0.3, 0.3, 0.3, 1.0,   0.3, 0.3, 0.3, 1.0
]);

const tombstoneVertices = new Float32Array([
    // Front, Back, Top, Bottom, Right, Left faces...
    -0.25, 0.0,  0.1,    0.25, 0.0,  0.1,    0.25, 1.0,  0.1,
    -0.25, 0.0,  0.1,    0.25, 1.0,  0.1,   -0.25, 1.0,  0.1,
    -0.25, 0.0, -0.1,   -0.25, 1.0, -0.1,    0.25, 1.0, -0.1,
    -0.25, 0.0, -0.1,    0.25, 1.0, -0.1,    0.25, 0.0, -0.1,
    -0.25, 1.0,  0.1,    0.25, 1.0,  0.1,    0.25, 1.0, -0.1,
    -0.25, 1.0,  0.1,    0.25, 1.0, -0.1,   -0.25, 1.0, -0.1,
    -0.25, 0.0,  0.1,   -0.25, 0.0, -0.1,    0.25, 0.0, -0.1,
    -0.25, 0.0,  0.1,    0.25, 0.0, -0.1,    0.25, 0.0,  0.1,
     0.25, 0.0,  0.1,    0.25, 0.0, -0.1,    0.25, 1.0, -0.1,
     0.25, 0.0,  0.1,    0.25, 1.0, -0.1,    0.25, 1.0,  0.1,
    -0.25, 0.0,  0.1,   -0.25, 1.0,  0.1,   -0.25, 1.0, -0.1,
    -0.25, 0.0,  0.1,   -0.25, 1.0, -0.1,   -0.25, 0.0, -0.1
]);

const tombstoneColors = new Float32Array([
    0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,  0.5, 0.5, 0.5, 1.0,
    0.6, 0.6, 0.6, 1.0,  0.6, 0.6, 0.6, 1.0,  0.6, 0.6, 0.6, 1.0,
    0.6, 0.6, 0.6, 1.0,  0.6, 0.6, 0.6, 1.0,  0.6, 0.6, 0.6, 1.0,
    0.3, 0.3, 0.3, 1.0,  0.3, 0.3, 0.3, 1.0,  0.3, 0.3, 0.3, 1.0,
    0.3, 0.3, 0.3, 1.0,  0.3, 0.3, 0.3, 1.0,  0.3, 0.3, 0.3, 1.0,
    0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,
    0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,
    0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,
    0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0,  0.4, 0.4, 0.4, 1.0
]);

window.onload = function init() {
    canvas = document.querySelector("#gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available :("); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // 1. Initialize Shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // 2. Build Floor Buffers
    floorCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorColors, gl.STATIC_DRAW);

    floorVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);

    // 3. Build Tombstone Buffers
    tombstoneCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tombstoneColors, gl.STATIC_DRAW);

    tombstoneVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tombstoneVertices, gl.STATIC_DRAW);

    // 4. Get Attributes
    vPositionLoc = gl.getAttribLocation(program, "vPosition");
    vColorLoc = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vPositionLoc);
    gl.enableVertexAttribArray(vColorLoc);

    // 5. Get Matrix Uniforms
    uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
    uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");

    // Event listeners
    window.addEventListener("keydown", function(event) {
        var key = event.key.toLowerCase();
        if (key in keys) keys[key] = true;
    });

    window.addEventListener("keyup", function(event) {
        var key = event.key.toLowerCase();
        if (key in keys) keys[key] = false;
    });

    // Start the game!
    render();
}

// --- RENDER PHASE ---
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projectionMatrix = perspective(45.0, canvas.width / canvas.height, 0.1, 100.0);

    // Movement Logic
    if (keys.q) yaw -= turnSpeed;
    if (keys.e) yaw += turnSpeed;

    var forwardX = Math.sin(yaw);
    var forwardZ = -Math.cos(yaw);
    var rightX = Math.cos(yaw);
    var rightZ = Math.sin(yaw);

    if (keys.w) { camX += forwardX * walkSpeed; camZ += forwardZ * walkSpeed; } 
    if (keys.s) { camX -= forwardX * walkSpeed; camZ -= forwardZ * walkSpeed; } 
    if (keys.a) { camX -= rightX * walkSpeed;   camZ -= rightZ * walkSpeed; }   
    if (keys.d) { camX += rightX * walkSpeed;   camZ += rightZ * walkSpeed; }   

    // Camera Matrices
    var eye = vec3(camX, camY, camZ);
    var at = vec3(camX + forwardX, camY, camZ + forwardZ);  
    var up = vec3(0.0, 1.0, 0.0);

    var viewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(uViewMatrix, false, flatten(viewMatrix));

    // --- DRAW THE FLOOR ---
    // The floor uses an identity matrix (no movement)
    var identityMatrix = mat4();
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(identityMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, floorCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);


    // --- DRAW THE TOMBSTONES ---
    // Bind tombstone data to the workbench once
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    // Tombstone 1: Left
    var modelMatrix1 = translate(-1.5, 0.0, -3.0);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(modelMatrix1));
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // Tombstone 2: Right
    var modelMatrix2 = translate(1.5, 0.0, -5.0);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(modelMatrix2));
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // Tombstone 3: Center Distance
    var modelMatrix3 = translate(0.0, 0.0, -8.0);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(modelMatrix3));
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    requestAnimFrame(render); 
}
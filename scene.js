// webgl vars
var gl, canvas;
var uProjectionMatrix, uViewMatrix, uModelMatrixLoc;

// buffer vars
var floorVBuffer, floorCBuffer, floorNBuffer;
var tombstoneVBuffer, tombstoneCBuffer;
var moonCBuffer;
var  tree1VBuffer, tree1CBuffer, tree1NBuffer;
var tree2VBuffer, tree2CBuffer, tree2NBuffer;
var tree3VBuffer, tree3CBuffer, tree3NBuffer;
var vPositionLoc, vColorLoc; 

// movement vars
var keys = { "w": false, "a": false, "s": false, "d": false, "q": false, "e": false, "space": false, "shiftleft": false, "leftCtrl": false };
var yaw = 0.0;
var pitch = 0.0;
var walkSpeed = 0.05;
var turnSpeed = 0.05;

// initial cam position
var camX = 0.0;
var camY = 2.0;
var camZ = 5.0;

// moon position
var moonX = 1.0;
var moonY = 2.0;
var moonZ = -2.0;

// lighting vars
var tombstoneNBuffer;
var vNormalLoc;
var uLightDirectionLoc;

// shading var
var drawMode;

// floor def
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

// points to the sky for the normal
const floorNormals = new Float32Array([
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0
]);

function proceduralTree()
{
    let origin = [0.5, 0, 0.5];

    let numLayers = Math.floor(Math.random() * 5) + 4; // between 4 and 8
    let height = (numLayers + 2)*1;
    
    let trunkRadius = (1.0/height)*0.8; // taller trees have thinner trunks
    let trunkVertices = [];
    for (let i = 0; i < 8; i++)
    {
        let angle = (i/8.0) * 2 * Math.PI;
        let x = origin[0] + trunkRadius * Math.cos(angle);
        let z = origin[2] + trunkRadius * Math.sin(angle);
        trunkVertices.push([x, 0, z]); // bottom octagon
        trunkVertices.push([x, height-0.2*numLayers, z]); // top octagon
    }
    let trunkFaces = [];
    let trunkColors = [];
    for (let i = 0; i < 8; i++)
    {
        let next = (i + 1) % 8;
        let bot_right = i*2;
        let top_right = i*2 + 1;
        let bot_left = next*2;
        let top_left = next*2 + 1;
        trunkFaces.push(trunkVertices[bot_right], trunkVertices[bot_left], trunkVertices[top_left]);
        trunkFaces.push(trunkVertices[bot_right], trunkVertices[top_left], trunkVertices[top_right]);
        for (let j = 0; j < 6; j++)
        {
            trunkColors.push(0.35, 0.07, 0.07, 1.0); // brown color
        }
    }

    // adjust this later to be different for each layer
    let layerHeight = (height - height/4) / numLayers; // leave some space for the trunk
    let layerSize = 1; 
    let layerVertices = [];
    for (let i = 0; i < numLayers; i++)
    {
        let y = height/4 + (i*layerHeight); // start a bit above the trunk and move up
        layerVertices.push([origin[0] - layerSize, y*0.75, origin[2] - layerSize]); 
        layerVertices.push([origin[0] + layerSize, y*0.75, origin[2] - layerSize]);
        layerVertices.push([origin[0] + layerSize, y*0.75, origin[2] + layerSize]);
        layerVertices.push([origin[0] - layerSize, y*0.75, origin[2] + layerSize]);
        layerVertices.push([origin[0], y + layerHeight, origin[2]]); 
        layerSize *= 0.8; // each layer is smaller than the one below
    }
    let layerFaces = [];
    let layerColors = [];
    for (let i = 0; i < numLayers; i++)
    {
        for (let j = 0; j < 4; j++)
        {
            let next = (j + 1) % 4;
            let base = i*5;
            layerFaces.push(layerVertices[base + j], layerVertices[base + next], layerVertices[base + 4]); 
            for (let k = 0; k < 3; k++)
            {
                layerColors.push(0.0, 0.2, 0.0, 1.0); // green color
            }
        }
    }

    let faces = trunkFaces.concat(layerFaces);
    let colors = trunkColors.concat(layerColors);
    // WIP
    let normals = [];
    for (let i = 0; i < colors.length; i += 4)
    {
        let v1 = vec3(0, 1, 0); // placeholder normal vector pointing up
        normals.push(v1[0], v1[1], v1[2]);
    }
    

    return {
        faces: faces,
        colors: colors,
        normals: normals
    };
}

const tree1Data = proceduralTree();
const tree1Vertices = new Float32Array(flatten(tree1Data.faces));
const tree1Colors = new Float32Array(tree1Data.colors);
const tree1Normals = new Float32Array(tree1Data.normals);

const tree2Data = proceduralTree();
const tree2Vertices = new Float32Array(flatten(tree2Data.faces));
const tree2Colors = new Float32Array(tree2Data.colors);
const tree2Normals = new Float32Array(tree2Data.normals);

const tree3Data = proceduralTree();
const tree3Vertices = new Float32Array(flatten(tree3Data.faces));
const tree3Colors = new Float32Array(tree3Data.colors);
const tree3Normals = new Float32Array(tree3Data.normals);

// tombstone def
const tombstoneVertices = new Float32Array([
    // Front
    -0.25, 0.0,  0.1,    0.25, 0.0,  0.1,    0.25, 1.0,  0.1,
    -0.25, 0.0,  0.1,    0.25, 1.0,  0.1,   -0.25, 1.0,  0.1,
    // Back
    -0.25, 0.0, -0.1,   -0.25, 1.0, -0.1,    0.25, 1.0, -0.1,
    -0.25, 0.0, -0.1,    0.25, 1.0, -0.1,    0.25, 0.0, -0.1,
    // Top
    -0.25, 1.0,  0.1,    0.25, 1.0,  0.1,    0.25, 1.0, -0.1,
    -0.25, 1.0,  0.1,    0.25, 1.0, -0.1,   -0.25, 1.0, -0.1,
    // Bottom
    -0.25, 0.0,  0.1,   -0.25, 0.0, -0.1,    0.25, 0.0, -0.1,
    -0.25, 0.0,  0.1,    0.25, 0.0, -0.1,    0.25, 0.0,  0.1,
    // Right
    0.25, 0.0,  0.1,    0.25, 0.0, -0.1,    0.25, 1.0, -0.1,
    0.25, 0.0,  0.1,    0.25, 1.0, -0.1,    0.25, 1.0,  0.1,
    // Left
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

// lighting normals
// The directions each face of the tombstone is pointing (X, Y, Z)
const tombstoneNormals = new Float32Array([
    // Front Face points +Z (0, 0, 1)
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    // Back Face points -Z (0, 0, -1)
    0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,
    // Top Face points +Y (0, 1, 0)
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
    // Bottom Face points -Y (0, -1, 0)
    0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,
    // Right Face points +X (1, 0, 0)
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    // Left Face points -X (-1, 0, 0)
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0
]);

// moon definition
var moonColorArray = new Float32Array(144);

for (let i = 0; i < 144; i += 4) {
    moonColorArray[i] = 1.0;     // Red
    moonColorArray[i+1] = 1.0;   // Green
    moonColorArray[i+2] = 0.8;   // Blue (Slightly less blue makes yellow)
    moonColorArray[i+3] = 1.0;   // Alpha
}

window.onload = function init() {
    canvas = document.querySelector("#gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available :("); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Initialize Shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // draw mode
    drawMode = gl.TRIANGLES;

    // floor buffers
    floorCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorColors, gl.STATIC_DRAW);

    floorVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);

    // floor normal buffer
    floorNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorNormals, gl.STATIC_DRAW);

    // tombstone buffers
    tombstoneCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tombstoneColors, gl.STATIC_DRAW);

    tombstoneVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tombstoneVertices, gl.STATIC_DRAW);

    // tombstone normal buffer
    tombstoneNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tombstoneNormals, gl.STATIC_DRAW);

    // normal vector locs
    vNormalLoc = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(vNormalLoc);
    uLightDirectionLoc = gl.getUniformLocation(program, "uLightDirection");

    // Moon buffers
    moonCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, moonCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, moonColorArray, gl.STATIC_DRAW);

    // Tree 1 buffers
    tree1CBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree1CBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree1Colors, gl.STATIC_DRAW);

    tree1VBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree1VBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree1Vertices, gl.STATIC_DRAW);

    tree1NBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree1NBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree1Normals, gl.STATIC_DRAW);

    // Tree 2 buffers
    tree2CBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree2CBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree2Colors, gl.STATIC_DRAW);

    tree2VBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree2VBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree2Vertices, gl.STATIC_DRAW);

    tree2NBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree2NBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree2Normals, gl.STATIC_DRAW);

    // Tree 3 buffers
    tree3CBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree3CBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree3Colors, gl.STATIC_DRAW);

    tree3VBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree3VBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree3Vertices, gl.STATIC_DRAW);

    tree3NBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tree3NBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tree3Normals, gl.STATIC_DRAW);

    // Get Attributes
    vPositionLoc = gl.getAttribLocation(program, "vPosition");
    vColorLoc = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vPositionLoc);
    gl.enableVertexAttribArray(vColorLoc);

    // matrix uniform locs
    uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
    uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");

    // Event listeners
    window.addEventListener("keydown", function(event) {
        var key = event.key.toLowerCase();
        if (event.code === "Space") key = "space";
        if (event.code === "ShiftLeft") key = "shiftleft";
        if (event.code === "ControlLeft") key = "leftCtrl";
        if (key in keys) keys[key] = true;

        // switch shading mode
        if (key === "1") drawMode = gl.LINE_LOOP; // wireframe
        if (key === "2") drawMode = gl.TRIANGLES; // solid
    });

    window.addEventListener("keyup", function(event) {
        var key = event.key.toLowerCase();
        if (event.code === "Space") key = "space";
        if (event.code === "ShiftLeft") key = "shiftleft";
        if (event.code === "ControlLeft") key = "leftCtrl";
        if (key in keys) keys[key] = false;
    });

    // simulator alligator
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

    if (keys.w) { camX += forwardX * (walkSpeed*(1+keys.leftCtrl)); camZ += forwardZ * (walkSpeed*(1+keys.leftCtrl)); } 
    if (keys.s) { camX -= forwardX * (walkSpeed*(1+keys.leftCtrl)); camZ -= forwardZ * (walkSpeed*(1+keys.leftCtrl)); } 
    if (keys.a) { camX -= rightX * (walkSpeed*(1+keys.leftCtrl));   camZ -= rightZ * (walkSpeed*(1+keys.leftCtrl)); }   
    if (keys.d) { camX += rightX * (walkSpeed*(1+keys.leftCtrl));   camZ += rightZ * (walkSpeed*(1+keys.leftCtrl)); }   
    if (keys.space) {camY += walkSpeed; }
    if (keys.shiftleft) { camY -= walkSpeed; }

    // Camera Matrices
    var eye = vec3(camX, camY, camZ);
    var at = vec3(camX + forwardX, camY, camZ + forwardZ);  
    var up = vec3(0.0, 1.0, 0.0);

    var viewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(uViewMatrix, false, flatten(viewMatrix));

    // setting light direction and passing to shader
    // var lightDirection = [10.0, 15.0, -20.0];
    var lightDirection = [moonX, moonY, moonZ];
    gl.uniform3fv(uLightDirectionLoc, flatten(lightDirection));

    // --- DRAW THE FLOOR ---
    // The floor uses an identity matrix (no movement)
    var identityMatrix = mat4();
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(identityMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, floorCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, floorNBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(drawMode, 0, 6);


    // Bind tombstone data - includes normal vector binding
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneNBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    // Tombstone 1: Left
    var modelMatrix1 = translate(-1.5, 0.0, -3.0);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(modelMatrix1));
    gl.drawArrays(drawMode, 0, 36);

    // Tombstone 2: Right
    var modelMatrix2 = translate(1.5, 0.0, -5.0);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(modelMatrix2));
    gl.drawArrays(drawMode, 0, 36);

    // Tombstone 3: Center Distance
    var modelMatrix3 = translate(0.0, 0.0, -8.0);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(modelMatrix3));
    gl.drawArrays(drawMode, 0, 36);

    // Bind moon data
    gl.bindBuffer(gl.ARRAY_BUFFER, moonCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tombstoneVBuffer); // Cuboid shape for moon for now
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    // Moon
    var moveMoon = translate(moonX, moonY, moonZ);
    var growMoon = scale(4.0, 2.0, 6.0);
    var moonModelMatrix = mult(moveMoon, growMoon);

    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(moonModelMatrix));
    gl.drawArrays(drawMode, 0, 36);

    // Tree 1: Left
    gl.bindBuffer(gl.ARRAY_BUFFER, tree1CBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree1VBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree1NBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    var shrinkTree = scale(0.5, 0.5, 0.5);
    var transTree = translate(-1.5, 0.0, -4.0);
    var tree1ModelMatrix = mult(transTree, shrinkTree);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(tree1ModelMatrix));
    gl.drawArrays(drawMode, 0, tree1Vertices.length / 3);

    // Tree 2: Right
    gl.bindBuffer(gl.ARRAY_BUFFER, tree2CBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree2VBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree2NBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    transTree = translate(1.5, 0.0, -1.0);
    var tree2ModelMatrix = mult(transTree, shrinkTree);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(tree2ModelMatrix));
    gl.drawArrays(drawMode, 0, tree2Vertices.length / 3);

    // Tree 3: Center Distance
    gl.bindBuffer(gl.ARRAY_BUFFER, tree3CBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree3VBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tree3NBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    transTree = translate(0.0, 0.0, -12.0);
    var tree3ModelMatrix = mult(transTree, shrinkTree);
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(tree3ModelMatrix));
    gl.drawArrays(drawMode, 0, tree3Vertices.length / 3);

    requestAnimFrame(render); 
}
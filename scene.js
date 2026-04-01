// webgl vars
var gl, canvas;
var uProjectionMatrix, uViewMatrix, uModelMatrixLoc;

// car vars
var carVBuffer, carCBuffer, carNBuffer;
var carVertexCount = 0; 

// corpse vars
var corpseVBuffer, corpseCBuffer, corpseNBuffer;
var corpseVertexCount = 0;

// fog vars
var fogColor = new Float32Array([0.3, 0.3, 0.3, 1.0]); // dark grey
var fogNear = 0.0;  
var fogFar = 8.0; 
var uFogColorLoc, uFogNearLoc, uFogFarLoc;

// shader toggle var for grass
var uIsGrassLoc;

// buffer vars
var floorVBuffer, floorCBuffer, floorNBuffer;
// var moonVBuffer, moonCBuffer;
var tree1VBuffer, tree1CBuffer, tree1NBuffer;
var tree2VBuffer, tree2CBuffer, tree2NBuffer;
var tree3VBuffer, tree3CBuffer, tree3NBuffer;
var tree4VBuffer, tree4CBuffer, tree4NBuffer;
var tree5VBuffer, tree5CBuffer, tree5NBuffer;
var streetlightLeftVBuffer, streetlightLeftCBuffer, streetlightLeftNBuffer;
var streetlightRightVBuffer, streetlightRightCBuffer, streetlightRightNBuffer;
var vPositionLoc, vColorLoc; 

// movement vars
var keys = { "w": false, "a": false, "s": false, "d": false, "q": false, "e": false, "jump": false, "crouch": false, "sprint": false, "pitchUp": false, "pitchDown": false, "rollLeft": false, "rollRight": false, "r": false};
var sprintHeld = 0;
let maxFovPercent = 0.2;
let fovChangeRate = 0.02;
var yaw = 0.0;
var pitch = 0.0;
var roll = 0.0;
var walkSpeed = 0.05;
var turnSpeed = 1;
let bobbingAmount = 0.01;
let bobCounter = 0;

const initCamX = 0.0;
const initCamY = 0.6;
const initCamZ = 20.0;

// initial cam position
var camX = initCamX;
var camY = initCamY;
var camZ = initCamZ;

// car1 position
var car1X = 1.2;
var car1Y = 0.0;
var car1Z = -14.0;

// corpse position
var corpseX = 0.4;
var corpseY = 0.15;
var corpseZ = -14.0;

// car scale
var carScale = 0.4;

// corpse scale
var corpseScale = 0.3;

// car rotation
var carRotation = -20;

// lighting vars
var vNormalLoc;
// var uLightDirectionLoc;
var uNumLightsLoc;
var uLightsLoc = [];

// shading var
var drawMode;
var shadingMode; // "flat" or "gouraud"

// road variables
var roadWidth = 4.0;
var roadLength = 80.0;
var stripWidth = 0.1;
var roadSections = 40;

var roadVBuffer, roadCBuffer, roadNBuffer;
var roadVertexCount = 0;

// generating the road as smaller triangles for fog issue
function generateRoad(roadWidth, roadLength, stripWidth, nBlocks) {
    // nBlocks is the number of blocks the road is divided into along its length, each block will be a separate set of triangles
    let vertices = [];
    let colors = [];
    let normals = [];
    const blockLength = roadLength / nBlocks;
    const blockWidth = roadWidth/2 - stripWidth/2; // width of the road on either side of the strip
    let zStart = [-roadWidth/2, 0.0, -roadLength / 2];

    for (let i = 0; i < nBlocks; i++) {
        // we simply push the vertices, colors, and normals for each block of the road into the arrays

        // left side
        vertices.push(zStart[0], 0.0, zStart[2]);
        vertices.push(zStart[0] + blockWidth, 0.0, zStart[2]);
        vertices.push(zStart[0] + blockWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0], 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0], 0.0, zStart[2]); 

        // middle strip
        vertices.push(zStart[0] + blockWidth, 0.0, zStart[2]);
        vertices.push(zStart[0] + blockWidth + stripWidth, 0.0, zStart[2]);
        vertices.push(zStart[0] + blockWidth + stripWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth + stripWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth, 0.0, zStart[2]);

        // right side
        vertices.push(zStart[0] + blockWidth + stripWidth, 0.0, zStart[2]);
        vertices.push(zStart[0] + blockWidth + stripWidth + blockWidth, 0.0, zStart[2]);
        vertices.push(zStart[0] + blockWidth + stripWidth + blockWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth + stripWidth + blockWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth + stripWidth, 0.0, zStart[2] + blockLength);
        vertices.push(zStart[0] + blockWidth + stripWidth, 0.0, zStart[2]);

        zStart = [zStart[0], 0.0, zStart[2] + blockLength];

        // colors.push(
        //     0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,
        //     0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,

        //     0.7, 0.7, 0.7, 1.0,   0.7, 0.7, 0.7, 1.0,   0.7, 0.7, 0.7, 1.0,
        //     0.7, 0.7, 0.7, 1.0,   0.7, 0.7, 0.7, 1.0,   0.7, 0.7, 0.7, 1.0,

        //     0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,
        //     0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0,   0.1, 0.1, 0.1, 1.0
        // );

        // normals.push(
        //     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        //     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        //     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        //     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        //     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        //     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0
        // );

        for (let v = 0; v < 6; v++) {
            colors.push(0.1, 0.1, 0.1, 1.0); 
        }

        for (let v = 0; v < 6; v++) {
            colors.push(0.7, 0.7, 0.7, 1.0); 
        }

        for (let v = 0; v < 6; v++) {
            colors.push(0.1, 0.1, 0.1, 1.0); 
        }
        
        for (let v = 0; v < 18; v++) {
            normals.push(0.0, 1.0, 0.0); 
        }
    };

    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals)
    };
}

const roadData = generateRoad(roadWidth, roadLength, stripWidth, roadSections);
const roadVertices = roadData.vertices;
const roadColors = roadData.colors;
const roadNormals = roadData.normals;
roadVertexCount = roadVertices.length / 3;


// width of the grass patch on each side of the road
var grassWidth = 15.0;
var grassSectionsZ = roadSections; 
var grassSectionsX = 15;

function generateGrass(grassWidth, roadWidth, roadLength, numPatchesZ, numPatchesX) {
    let vertices = [];
    let colors = [];
    let normals = [];

    const patchLengthZ = roadLength / numPatchesZ;
    const patchWidthX = grassWidth / numPatchesX;
    
    const leftInnerX = -roadWidth / 2;
    const leftOuterX = leftInnerX - grassWidth;
    const rightInnerX = roadWidth / 2;
    const rightOuterX = rightInnerX + grassWidth;
    
    let zStart = -roadLength / 2;

    for (let i = 0; i < numPatchesZ; i++) {
        let z1 = zStart + (i * patchLengthZ);
        let z2 = zStart + ((i + 1) * patchLengthZ);

        // left grass patch
        for (let j = 0; j < numPatchesX; j++) {
            let x1 = leftOuterX + (j * patchWidthX);
            let x2 = leftOuterX + ((j + 1) * patchWidthX);

            vertices.push(x1, 0.0, z1);
            vertices.push(x2, 0.0, z1);
            vertices.push(x1, 0.0, z2);
            
            vertices.push(x1, 0.0, z2);
            vertices.push(x2, 0.0, z1);
            vertices.push(x2, 0.0, z2); 

            for (let v = 0; v < 6; v++) {
                colors.push(0.1, 0.25, 0.1, 1.0); 
                normals.push(0.0, 1.0, 0.0); 
            }
        }

        // right grass patch
        for (let j = 0; j < numPatchesX; j++) {
            let x1 = rightInnerX + (j * patchWidthX);
            let x2 = rightInnerX + ((j + 1) * patchWidthX);

            vertices.push(x1, 0.0, z1);
            vertices.push(x2, 0.0, z1);
            vertices.push(x1, 0.0, z2);
            
            vertices.push(x1, 0.0, z2);
            vertices.push(x2, 0.0, z1);
            vertices.push(x2, 0.0, z2);

            for (let v = 0; v < 6; v++) {
                colors.push(0.1, 0.25, 0.1, 1.0); 
                normals.push(0.0, 1.0, 0.0); 
            }
        }
    }

    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors),
        normals: new Float32Array(normals)
    };
}

var grassVertexCount = 0;
const grassData = generateGrass(grassWidth, roadWidth, roadLength, grassSectionsZ, grassSectionsX);
const grassVertices = grassData.vertices;
const grassColors = grassData.colors;
const grassNormals = grassData.normals;
grassVertexCount = grassVertices.length / 3;

// tree def
function generateTree(type) // 4 <= numLayers <= 8
{
    let origin = [0.5, 0, 0.5];

    let numLayers = type + 3;
    let height = (numLayers + 2)*1;
    
    let trunkRadius = (1.0/height)*1; // taller trees have thinner trunks
    let trunkVertices = [];
    let trunkVerticesInFaces = []; // to store which vertices are in which faces
    for (let i = 0; i < 8; i++)
    {
        let angle = (i/8.0) * 2 * Math.PI;
        let x = origin[0] + trunkRadius * Math.cos(angle);
        let z = origin[2] + trunkRadius * Math.sin(angle);
        trunkVertices.push([x, 0, z]); // bottom octagon
        trunkVerticesInFaces.push([]);
        trunkVertices.push([x, height-0.2*numLayers, z]); // top octagon
        trunkVerticesInFaces.push([]);
    }
    let trunkFaces = [];
    let trunkFacesIndices = [];
    let trunkColors = [];
    for (let i = 0; i < 8; i++)
    {
        let next = (i + 1) % 8;
        let bot_right = i*2;
        let top_right = i*2 + 1;
        let bot_left = next*2;
        let top_left = next*2 + 1;

        trunkFaces.push(trunkVertices[bot_right], trunkVertices[bot_left], trunkVertices[top_left]);
        trunkFacesIndices.push(bot_right, bot_left, top_left);
        trunkVerticesInFaces[bot_right].push(trunkFaces.length/3 - 1);
        trunkVerticesInFaces[bot_left].push(trunkFaces.length/3 - 1);
        trunkVerticesInFaces[top_left].push(trunkFaces.length/3 - 1);

        trunkFaces.push(trunkVertices[bot_right], trunkVertices[top_left], trunkVertices[top_right]);
        trunkFacesIndices.push(bot_right, top_left, top_right);
        trunkVerticesInFaces[bot_right].push(trunkFaces.length/3 - 1);
        trunkVerticesInFaces[top_left].push(trunkFaces.length/3 - 1);
        trunkVerticesInFaces[top_right].push(trunkFaces.length/3 - 1);
        for (let j = 0; j < 6; j++)
        {
            trunkColors.push(0.396, 0.263, 0.129, 1.0); // brown color
        }
    }
    let trunkFaceNormals = [];
    for (let i = 0; i < trunkFaces.length; i += 3)
    {
        let v1 = vectorDifference(trunkFaces[i+1], trunkFaces[i]);
        let v2 = vectorDifference(trunkFaces[i+1], trunkFaces[i+2]);
        let normal = crossProduct(v1, v2);
        normal = normalizeVector(normal);
        for (let j = 0; j < 3; j++)
        {
            trunkFaceNormals.push(normal[0], normal[1], normal[2]);
        }
    }
    let trunkVertexNormals = [];
    for (let i = 0; i < trunkFacesIndices.length; i++)
    {
        let vertIndex = trunkFacesIndices[i];
        let normalSum = [0, 0, 0];
        for (let j = 0; j < trunkVerticesInFaces[vertIndex].length; j++)
        {
            let faceIndex = trunkVerticesInFaces[vertIndex][j];
            normalSum[0] += trunkFaceNormals[faceIndex*9];
            normalSum[1] += trunkFaceNormals[faceIndex*9 + 1];
            normalSum[2] += trunkFaceNormals[faceIndex*9 + 2];
        }

        normalSum = normalizeVector(normalSum);
        trunkVertexNormals.push(normalSum[0], normalSum[1], normalSum[2]);
    }

    let layerHeight = (height - height/4) / numLayers; // leave some space for the trunk
    let layerSize = 1; 
    let layerVertices = [];
    let layerVerticesInFaces = [];
    for (let i = 0; i < numLayers; i++)
    {
        let y = height/4 + (i*layerHeight); // start a bit above the trunk and move up
        layerVertices.push([origin[0] - layerSize, y*0.75, origin[2] - layerSize]); 
        layerVerticesInFaces.push([]);
        layerVertices.push([origin[0] + layerSize, y*0.75, origin[2] - layerSize]);
        layerVerticesInFaces.push([]);
        layerVertices.push([origin[0] + layerSize, y*0.75, origin[2] + layerSize]);
        layerVerticesInFaces.push([]);
        layerVertices.push([origin[0] - layerSize, y*0.75, origin[2] + layerSize]);
        layerVerticesInFaces.push([]);
        layerVertices.push([origin[0], y + layerHeight, origin[2]]);
        layerVerticesInFaces.push([]);
        layerSize *= 0.8; // each layer is smaller than the one below
    }
    let layerFaces = [];
    let layerFacesIndices = [];
    let layerColors = [];
    for (let i = 0; i < numLayers; i++)
    {
        for (let j = 0; j < 4; j++)
        {
            let next = (j + 1) % 4;
            let base = i*5;
            layerFaces.push(layerVertices[base + j], layerVertices[base + next], layerVertices[base + 4]); 
            layerFacesIndices.push(base + j, base + next, base + 4);
            layerVerticesInFaces[base + j].push(layerFaces.length/3 - 1);
            layerVerticesInFaces[base + next].push(layerFaces.length/3 - 1);
            layerVerticesInFaces[base + 4].push(layerFaces.length/3 - 1);
            for (let k = 0; k < 3; k++)
            {
                layerColors.push(0.0, 0.2, 0.0, 1.0); // green color
            }
        }
    }
    let layerFaceNormals = [];
    let layerVertexNormals = [];
    for (let i = 0; i < layerFaces.length; i += 3)
    {
        let v1 = vectorDifference(layerFaces[i+1], layerFaces[i]);
        let v2 = vectorDifference(layerFaces[i+1], layerFaces[i+2]);
        let normal = crossProduct(v1, v2);
        normal = normalizeVector(normal);
        for (let j = 0; j < 3; j++)
        {
            layerFaceNormals.push(normal[0], normal[1], normal[2]);
        }
    }
    for (let i = 0; i < layerFacesIndices.length; i++)
    {
        let vertIndex = layerFacesIndices[i];
        let normalSum = [0, 0, 0];
        for (let j = 0; j < layerVerticesInFaces[vertIndex].length; j++)
        {
            let faceIndex = layerVerticesInFaces[vertIndex][j];
            normalSum[0] += layerFaceNormals[faceIndex*9];
            normalSum[1] += layerFaceNormals[faceIndex*9 + 1];
            normalSum[2] += layerFaceNormals[faceIndex*9 + 2];
        }
        normalSum = normalizeVector(normalSum);
        layerVertexNormals.push(normalSum[0], normalSum[1], normalSum[2]);
    }
    
    let faces = trunkFaces.concat(layerFaces);
    let colors = trunkColors.concat(layerColors);
    let faceNormals = trunkFaceNormals.concat(layerFaceNormals);
    let vertexNormals = trunkVertexNormals.concat(layerVertexNormals);
    
    return {
        faces: faces,
        colors: colors,
        faceNormals: faceNormals,
        vertexNormals: vertexNormals
    };
}

// tree vars
var treeVBuffers = [tree1VBuffer, tree2VBuffer, tree3VBuffer, tree4VBuffer, tree5VBuffer];
var treeCBuffers = [tree1CBuffer, tree2CBuffer, tree3CBuffer, tree4CBuffer, tree5CBuffer];
var treeNBuffers = [tree1NBuffer, tree2NBuffer, tree3NBuffer, tree4NBuffer, tree5NBuffer];

var treeVertices = [];
var treeColors = [];
var treeFaceNormals = []; 
var treeVertexNormals = [];

for (let i = 1; i <= 5; i++)
{
    let treeData = generateTree(i);
    treeVertices.push(new Float32Array(flatten(treeData.faces)));
    treeColors.push(new Float32Array(treeData.colors));
    treeFaceNormals.push(new Float32Array(treeData.faceNormals));
    treeVertexNormals.push(new Float32Array(treeData.vertexNormals));
}

const numTrees = 300;
const treeTypeArray = [];
const treeLocations = [];

const columns = 14;
const columnX = [];
for (let i = 0; i < columns; i++)
{
    if (i < columns/2)
    {
        columnX.push(-roadWidth*2.0 + (i) * (roadWidth*2.5/columns));
    }
    else
    {
        columnX.push(roadWidth*2.0 - (columns - i) * (roadWidth*2.5/columns));
    }
}
const rows = Math.ceil(numTrees / columns);
const columnZ = [];
for (let i = 0; i < rows; i++)
{
    if (i < rows/2)
    {
        columnZ.push(-roadLength/2 + (i + 0.5) * (roadLength/rows));
    }
    else if (i == 0)
    {
        columnZ.push(0);
    }
    else
    {
        columnZ.push(roadLength/2 - (rows - i - 0.5) * (roadLength/rows));
    }
}

for (let i = 0; i < columns; i++)
{
    for (let j = 0; j < rows; j++)
    {
        if (treeLocations.length < numTrees)
        {
            let treeType = Math.floor(Math.random() * 5) + 1;
            treeTypeArray.push(treeType);
            treeLocations.push([columnX[i] + Math.random() * (roadWidth*2/columns * 0.75), 0, columnZ[j] + Math.random() * (roadLength/rows * 0.65)]);
        }
    }
}

function generateStreetlight(dir) // dir = 0 for left, 1 for right
{
    let origin = [0.5, 0, 0.5];

    let lampHeight = 4.0;
    let lampThickness = 0.1;
    let lampBaseThickness = lampThickness + (lampThickness * 0.3);
    let lampBaseHeight = lampHeight/40;
    let lampOverhangLength = 1.0;
    let lampOverhangWidth = lampThickness-0.001;
    let lampOverhangThickness = 0.1;

    let lampColor = [0.5, 0.5, 0.5, 1.0]; // grey color

    let baseVertices = [];
    let baseVerticesInFaces = [];
    for (let i = 0; i < 10; i++)
    {
        let angle = (i/10.0) * 2 * Math.PI;
        let x = origin[0] + lampBaseThickness * Math.cos(angle);
        let z = origin[2] + lampBaseThickness * Math.sin(angle);
        baseVertices.push([x, 0, z]); // bottom part
        baseVerticesInFaces.push([]);
        baseVertices.push([x, lampBaseHeight, z]); // top part
        baseVerticesInFaces.push([]);
    }
    baseVertices.push([origin[0], lampBaseHeight, origin[2]]); // center top vertex for the base
    baseVerticesInFaces.push([]);

    let baseFaces = [];
    let baseFacesIndices = [];
    let baseColors = [];
    for (let i = 0; i < 10; i++)
    {
        let next = (i + 1) % 10;
        let bot_right = i*2;
        let top_right = i*2 + 1;
        let bot_left = next*2;
        let top_left = next*2 + 1;

        baseFaces.push(baseVertices[bot_right], baseVertices[bot_left], baseVertices[top_left]);
        baseFacesIndices.push(bot_right, bot_left, top_left);
        baseVerticesInFaces[bot_right].push(baseFaces.length/3 - 1);
        baseVerticesInFaces[bot_left].push(baseFaces.length/3 - 1);
        baseVerticesInFaces[top_left].push(baseFaces.length/3 - 1);

        baseFaces.push(baseVertices[bot_right], baseVertices[top_left], baseVertices[top_right]);
        baseFacesIndices.push(bot_right, top_left, top_right);
        baseVerticesInFaces[bot_right].push(baseFaces.length/3 - 1);
        baseVerticesInFaces[top_left].push(baseFaces.length/3 - 1);
        baseVerticesInFaces[top_right].push(baseFaces.length/3 - 1);

        baseFaces.push(baseVertices[top_right], baseVertices[top_left], baseVertices[20]); // top face using the center vertex
        baseFacesIndices.push(top_right, top_left, 20);
        baseVerticesInFaces[top_right].push(baseFaces.length/3 - 1);
        baseVerticesInFaces[top_left].push(baseFaces.length/3 - 1);
        baseVerticesInFaces[20].push(baseFaces.length/3 - 1);
        for (let j = 0; j < 9; j++)
        {
            baseColors.push(lampColor[0], lampColor[1], lampColor[2], lampColor[3]);
        }
    }
    
    let baseFaceNormals = [];
    for (let i = 0; i < baseFaces.length; i += 3)
    {
        let v1 = vectorDifference(baseFaces[i+1], baseFaces[i]);
        let v2 = vectorDifference(baseFaces[i+1], baseFaces[i+2]);
        let normal = crossProduct(v1, v2);
        normal = normalizeVector(normal);
        for (let j = 0; j < 3; j++)
        {
            baseFaceNormals.push(normal[0], normal[1], normal[2]);
        }
    }
    let baseVertexNormals = [];
    for (let i = 0; i < baseFacesIndices.length; i++)
    {
        let vertIndex = baseFacesIndices[i];
        let normalSum = [0, 0, 0];
        for (let j = 0; j < baseVerticesInFaces[vertIndex].length; j++)
        {
            let faceIndex = baseVerticesInFaces[vertIndex][j];
            normalSum[0] += baseFaceNormals[faceIndex*9];
            normalSum[1] += baseFaceNormals[faceIndex*9 + 1];
            normalSum[2] += baseFaceNormals[faceIndex*9 + 2];
        }
        normalSum = normalizeVector(normalSum);
        baseVertexNormals.push(normalSum[0], normalSum[1], normalSum[2]);
    }

    let poleVertices = [];
    let poleVerticesInFaces = [];
    for (let i = 0; i < 10; i++)
    {
        let angle = (i/10.0) * 2 * Math.PI;
        let x = origin[0] + lampThickness * Math.cos(angle);
        let z = origin[2] + lampThickness * Math.sin(angle);
        poleVertices.push([x, lampBaseHeight, z]); // bottom part
        poleVerticesInFaces.push([]);
        poleVertices.push([x, lampHeight, z]); // top part
        poleVerticesInFaces.push([]);
    }
    poleVertices.push([origin[0], lampHeight, origin[2]]); // center top vertex for the pole
    poleVerticesInFaces.push([]);

    let poleFaces = [];
    let poleFacesIndices = [];
    let poleColors = [];
    for (let i = 0; i < 10; i++)
    {
        let next = (i + 1) % 10;
        let bot_right = i*2;
        let top_right = i*2 + 1;
        let bot_left = next*2;
        let top_left = next*2 + 1;

        poleFaces.push(poleVertices[bot_right], poleVertices[bot_left], poleVertices[top_left]);
        poleFacesIndices.push(bot_right, bot_left, top_left);
        poleVerticesInFaces[bot_right].push(poleFaces.length/3 - 1);
        poleVerticesInFaces[bot_left].push(poleFaces.length/3 - 1);
        poleVerticesInFaces[top_left].push(poleFaces.length/3 - 1);
        
        poleFaces.push(poleVertices[bot_right], poleVertices[top_left], poleVertices[top_right]);
        poleFacesIndices.push(bot_right, top_left, top_right);
        poleVerticesInFaces[bot_right].push(poleFaces.length/3 - 1);
        poleVerticesInFaces[top_left].push(poleFaces.length/3 - 1);
        poleVerticesInFaces[top_right].push(poleFaces.length/3 - 1);

        poleFaces.push(poleVertices[top_right], poleVertices[top_left], poleVertices[20]); // top face using the center vertex
        poleFacesIndices.push(top_right, top_left, 20);
        poleVerticesInFaces[top_right].push(poleFaces.length/3 - 1);
        poleVerticesInFaces[top_left].push(poleFaces.length/3 - 1);
        poleVerticesInFaces[20].push(poleFaces.length/3 - 1);
        for (let j = 0; j < 9; j++)
        {
            poleColors.push(lampColor[0], lampColor[1], lampColor[2], lampColor[3]);
        }
    }

    let poleFaceNormals = [];
    for (let i = 0; i < poleFaces.length; i += 3)
    {
        let v1 = vectorDifference(poleFaces[i+1], poleFaces[i]);
        let v2 = vectorDifference(poleFaces[i+1], poleFaces[i+2]);
        let normal = crossProduct(v1, v2);
        normal = normalizeVector(normal);
        for (let j = 0; j < 3; j++)
        {
            poleFaceNormals.push(normal[0], normal[1], normal[2]);
        }
    }
    let poleVertexNormals = [];
    for (let i = 0; i < poleFacesIndices.length; i++)
    {
        let vertIndex = poleFacesIndices[i];
        let normalSum = [0, 0, 0];
        for (let j = 0; j < poleVerticesInFaces[vertIndex].length; j++)
        {
            let faceIndex = poleVerticesInFaces[vertIndex][j];
            normalSum[0] += poleFaceNormals[faceIndex*9];
            normalSum[1] += poleFaceNormals[faceIndex*9 + 1];
            normalSum[2] += poleFaceNormals[faceIndex*9 + 2];
        }
        normalSum = normalizeVector(normalSum);
        poleVertexNormals.push(normalSum[0], normalSum[1], normalSum[2]);
    }

    let overhangVertices = [];
    let overhangVerticesInFaces = [];

    let dirSign = dir == 1 ? 1 : -1;
    let xInner = origin[0];
    let xOuter = xInner + dirSign * lampOverhangLength;
    let xMin = Math.min(xInner, xOuter);
    let xMax = Math.max(xInner, xOuter);
    let yBottom = lampHeight - lampOverhangThickness;
    let yTop = lampHeight-0.01; // to avoid z-fighting with the pole's top face
    let zNear = origin[2] - lampOverhangWidth;
    let zFar = origin[2] + lampOverhangWidth;

    overhangVertices.push(
        [xMin, yBottom, zNear], 
        [xMax, yBottom, zNear], 
        [xMax, yTop, zNear],    
        [xMin, yTop, zNear],    
        [xMin, yBottom, zFar],  
        [xMax, yBottom, zFar],  
        [xMax, yTop, zFar],     
        [xMin, yTop, zFar]      
    );
    for (let i = 0; i < 8; i++)
    {
        overhangVerticesInFaces.push([]);
    }

    let overhangFaces = [];
    let overhangFacesIndices = [];
    let overhangColors = [];

    let overhangTriIndices = [
        [4, 5, 6], [4, 6, 7], 
        [1, 0, 3], [1, 3, 2], 
        [3, 7, 6], [3, 6, 2], 
        [0, 1, 5], [0, 5, 4], 
        [1, 2, 6], [1, 6, 5], 
        [0, 4, 7], [0, 7, 3]  
    ];

    for (let i = 0; i < overhangTriIndices.length; i++)
    {
        let a = overhangTriIndices[i][0];
        let b = overhangTriIndices[i][1];
        let c = overhangTriIndices[i][2];

        overhangFaces.push(overhangVertices[a], overhangVertices[b], overhangVertices[c]);
        overhangFacesIndices.push(a, b, c);

        overhangVerticesInFaces[a].push(overhangFaces.length/3 - 1);
        overhangVerticesInFaces[b].push(overhangFaces.length/3 - 1);
        overhangVerticesInFaces[c].push(overhangFaces.length/3 - 1);

        for (let j = 0; j < 3; j++)
        {
            overhangColors.push(lampColor[0], lampColor[1], lampColor[2], lampColor[3]);
        }
    }
    
    let overhangFaceNormals = [];
    for (let i = 0; i < overhangFaces.length; i += 3)
    {
        let v1 = vectorDifference(overhangFaces[i+1], overhangFaces[i]);
        let v2 = vectorDifference(overhangFaces[i+1], overhangFaces[i+2]);
        let normal = crossProduct(v2, v1);
        normal = normalizeVector(normal);
        for (let j = 0; j < 3; j++)
        {
            overhangFaceNormals.push(normal[0], normal[1], normal[2]);
        }
    }
    let overhangVertexNormals = [];
    for (let i = 0; i < overhangFacesIndices.length; i++)
    {
        let vertIndex = overhangFacesIndices[i];
        let normalSum = [0, 0, 0];
        for (let j = 0; j < overhangVerticesInFaces[vertIndex].length; j++)
        {
            let faceIndex = overhangVerticesInFaces[vertIndex][j];
            normalSum[0] += overhangFaceNormals[faceIndex*9];
            normalSum[1] += overhangFaceNormals[faceIndex*9 + 1];
            normalSum[2] += overhangFaceNormals[faceIndex*9 + 2];
        }
        normalSum = normalizeVector(normalSum);
        overhangVertexNormals.push(normalSum[0], normalSum[1], normalSum[2]);
    }

    let lampLightContainerVertices = [];
    let lampLightContainerVerticesInFaces = [];
    for (let i = 0; i < 4; i++)
    {
        let angle = (i/4.0) * 2 * Math.PI + Math.PI/4;
        let x = origin[0] + 2* lampOverhangWidth * Math.cos(angle);
        x = dir == 1 ? x + lampOverhangLength - lampOverhangWidth : x - lampOverhangLength + lampOverhangWidth;
        let z = origin[2] + 2* lampOverhangWidth * Math.sin(angle);
        lampLightContainerVertices.push([x, origin[1] + lampHeight - lampOverhangThickness*2, z]);
        lampLightContainerVerticesInFaces.push([]);
    }
    let lightPosition = [origin[0] + (dir == 1 ? lampOverhangLength - lampOverhangWidth : -lampOverhangLength + lampOverhangWidth), origin[1] + lampHeight - lampOverhangThickness/2, origin[2]];
    lampLightContainerVertices.push(lightPosition);
    lampLightContainerVerticesInFaces.push([]);

    let lampLightContainerFaces = [];
    let lampLightContainerFacesIndices = [];
    let lampLightContainerColors = [];
    for (let i = 0; i < 4; i++)
    {
        let next = (i + 1) % 4;
        lampLightContainerFaces.push(lampLightContainerVertices[i], lampLightContainerVertices[next], lampLightContainerVertices[4]);
        lampLightContainerFacesIndices.push(i, next, 4);
        lampLightContainerVerticesInFaces[i].push(lampLightContainerFaces.length/3 - 1);
        lampLightContainerVerticesInFaces[next].push(lampLightContainerFaces.length/3 - 1);
        lampLightContainerVerticesInFaces[4].push(lampLightContainerFaces.length/3 - 1);
        for (let j = 0; j < 3; j++)
        {
            lampLightContainerColors.push(lampColor[0], lampColor[1], lampColor[2], lampColor[3]);
        }
    }
    let lampLightContainerFaceNormals = [];
    for (let i = 0; i < lampLightContainerFaces.length; i += 3)
    {
        let v1 = vectorDifference(lampLightContainerFaces[i+1], lampLightContainerFaces[i]);
        let v2 = vectorDifference(lampLightContainerFaces[i+1], lampLightContainerFaces[i+2]);
        let normal = crossProduct(v1, v2);
        normal = normalizeVector(normal);
        for (let j = 0; j < 3; j++)
        {
            lampLightContainerFaceNormals.push(normal[0], normal[1], normal[2]);
        }
    }
    let lampLightContainerVertexNormals = [];
    for (let i = 0; i < lampLightContainerFacesIndices.length; i++)
    {
        let vertIndex = lampLightContainerFacesIndices[i];
        let normalSum = [0, 0, 0];
        for (let j = 0; j < lampLightContainerVerticesInFaces[vertIndex].length; j++)
        {
            let faceIndex = lampLightContainerVerticesInFaces[vertIndex][j];
            normalSum[0] += lampLightContainerFaceNormals[faceIndex*9];
            normalSum[1] += lampLightContainerFaceNormals[faceIndex*9 + 1];
            normalSum[2] += lampLightContainerFaceNormals[faceIndex*9 + 2];
        }
        normalSum = normalizeVector(normalSum);
        lampLightContainerVertexNormals.push(normalSum[0], normalSum[1], normalSum[2]);
    }

    let faces = baseFaces.concat(poleFaces, overhangFaces, lampLightContainerFaces);
    let colors = baseColors.concat(poleColors, overhangColors, lampLightContainerColors);
    let faceNormals = baseFaceNormals.concat(poleFaceNormals, overhangFaceNormals, lampLightContainerFaceNormals);
    let vertexNormals = baseVertexNormals.concat(poleVertexNormals, overhangVertexNormals, lampLightContainerVertexNormals);

    return {
        faces: faces,
        colors: colors,
        faceNormals: faceNormals,
        vertexNormals: vertexNormals,
        lightPosition: lightPosition
    };
}

// streetlight vars
var streetlightVBuffers = [streetlightLeftVBuffer, streetlightRightVBuffer];
var streetlightCBuffers = [streetlightLeftCBuffer, streetlightRightCBuffer];
var streetlightNBuffers = [streetlightLeftNBuffer, streetlightRightNBuffer];

var streetlightVertices = [];
var streetlightColors = [];
var streetlightFaceNormals = [];
var streetlightVertexNormals = [];
var streetlightLightPositions = [];

for (let i = 0; i < 2; i++)
{
    let streetlightData = generateStreetlight(i);
    streetlightVertices.push(new Float32Array(flatten(streetlightData.faces)));
    streetlightColors.push(new Float32Array(streetlightData.colors));
    streetlightFaceNormals.push(new Float32Array(streetlightData.faceNormals));
    streetlightVertexNormals.push(new Float32Array(streetlightData.vertexNormals));
    streetlightLightPositions.push(streetlightData.lightPosition);
}

const numStreetlights = 5;
const zDistBetweenLights = roadLength / numStreetlights;
const streetlightTypeArray = [];
const streetlightLocations = [];
const streetlightLightWorldPositions = [];

for (let i = 0; i < numStreetlights; i++)
{
    let dir = (i + 1) % 2; // alternate left and right
    streetlightTypeArray.push(dir);
    let xOffset = dir == 0 ? 1.7 : -2.7; 
    let zOffset = -roadLength/2 + (i + 0.5) * zDistBetweenLights;
    streetlightLocations.push([xOffset, 0, zOffset]);
    streetlightLightWorldPositions.push([streetlightLightPositions[dir][0] + xOffset, streetlightLightPositions[dir][1], streetlightLightPositions[dir][2] + zOffset]);
}

window.onload = async function init() {
    canvas = document.querySelector("#gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available :("); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    // initialize the bg with fog color to maintain fog effect
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], fogColor[3]);
    gl.enable(gl.DEPTH_TEST);

    // loading car1
    const car1Data = await loadCarOBJ('/models/Car.obj', "Green"); 
    carVertexCount = car1Data.vertices.length / 3; // 3 components per vertex

    // loading corpse1
    const corpse1Data = await loadCorpseOBJ('/models/Corpse.obj', "Dark Brown");
    corpseVertexCount = corpse1Data.vertices.length / 3; // 3 components per vertex

    // Initialize Shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // draw mode
    drawMode = gl.TRIANGLES;
    shadingMode = "flat";

    // road buffers
    roadCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roadCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roadColors, gl.STATIC_DRAW);

    roadVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roadVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roadVertices, gl.STATIC_DRAW);

    // road normal buffer
    roadNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, roadNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, roadNormals, gl.STATIC_DRAW);

    // grass buffers
    grassCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grassCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, grassColors, gl.STATIC_DRAW);

    grassVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grassVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, grassVertices, gl.STATIC_DRAW);

    // grass normal buffer
    grassNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grassNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, grassNormals, gl.STATIC_DRAW);

    // Tree buffers 
    for (let i = 0; i < 5; i++)
    {
        treeCBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, treeCBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, treeColors[i], gl.STATIC_DRAW);

        treeVBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, treeVBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, treeVertices[i], gl.STATIC_DRAW);

        treeNBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, treeNBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, treeFaceNormals[i], gl.STATIC_DRAW);
    }

    // Streetlight buffers
    for (let i = 0; i < 2; i++)
    {
        streetlightCBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, streetlightCBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, streetlightColors[i], gl.STATIC_DRAW);

        streetlightVBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, streetlightVBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, streetlightVertices[i], gl.STATIC_DRAW);

        streetlightNBuffers[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, streetlightNBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, streetlightFaceNormals[i], gl.STATIC_DRAW);
    }

    // car buffers
    carCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, carCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, car1Data.colors, gl.STATIC_DRAW);

    carVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, carVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, car1Data.vertices, gl.STATIC_DRAW);

    carNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, carNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, car1Data.faceNormals, gl.STATIC_DRAW);

    // corpse buffers
    corpseCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, corpseCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, corpse1Data.colors, gl.STATIC_DRAW);

    corpseVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, corpseVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, corpse1Data.vertices, gl.STATIC_DRAW);

    corpseNBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, corpseNBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, corpse1Data.faceNormals, gl.STATIC_DRAW);

    // Get Attributes
    vPositionLoc = gl.getAttribLocation(program, "vPosition");
    vColorLoc = gl.getAttribLocation(program, "vColor");
    vNormalLoc = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(vPositionLoc);
    gl.enableVertexAttribArray(vColorLoc);
    gl.enableVertexAttribArray(vNormalLoc);
    
    // uniform locs
    uLightDirectionLoc = gl.getUniformLocation(program, "uLightDirection");
    uModelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
    uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
    uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");

    // fog uniform locs
    uFogColorLoc = gl.getUniformLocation(program, "uFogColor");
    uFogNearLoc = gl.getUniformLocation(program, "uFogNear");
    uFogFarLoc = gl.getUniformLocation(program, "uFogFar");
    // grass
    uIsGrassLoc = gl.getUniformLocation(program, "uIsGrass");

    // light uniform locs
    uNumLightsLoc = gl.getUniformLocation(program, "uNumLights");
    for (let i = 0; i < numStreetlights; i++) {
        uLightsLoc.push({
            type: gl.getUniformLocation(program, `uLights[${i}].type`),
            position: gl.getUniformLocation(program, `uLights[${i}].position`),
            color: gl.getUniformLocation(program, `uLights[${i}].color`),
            direction: gl.getUniformLocation(program, `uLights[${i}].direction`),
            constant: gl.getUniformLocation(program, `uLights[${i}].constant`),
            linear: gl.getUniformLocation(program, `uLights[${i}].linear`),
            quadratic: gl.getUniformLocation(program, `uLights[${i}].quadratic`),
            cutoff: gl.getUniformLocation(program, `uLights[${i}].cutoff`),
            exponent: gl.getUniformLocation(program, `uLights[${i}].exponent`)
        });
    }

    // Event listeners
    window.addEventListener("keydown", function(event) {
        var key = event.key.toLowerCase();
        if (event.code === "Space") key = "jump";
        if (event.code === "ShiftLeft") key = "sprint";
        if (key === "c") key = "crouch";
        if (event.code === "ArrowUp") key = "pitchUp";
        if (event.code === "ArrowDown") key = "pitchDown";
        if (event.code === "ArrowLeft") key = "rollLeft";
        if (event.code === "ArrowRight") key = "rollRight";
        if (key in keys) keys[key] = true;

        // switch shading mode
        if (key === "1") 
        {
            drawMode = gl.TRIANGLES; // solid
            shadingMode = "flat";
            for (let i = 0; i < 5; i++)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, treeNBuffers[i]);
                gl.bufferData(gl.ARRAY_BUFFER, treeFaceNormals[i], gl.STATIC_DRAW);
            }
            for (let i = 0; i < 2; i++)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, streetlightNBuffers[i]);
                gl.bufferData(gl.ARRAY_BUFFER, streetlightFaceNormals[i], gl.STATIC_DRAW);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, carNBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, car1Data.faceNormals, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, corpseNBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, corpse1Data.faceNormals, gl.STATIC_DRAW);
        }
        if (key === "2")
        {
            drawMode = gl.TRIANGLES; // solid
            shadingMode = "gouraud";
            for (let i = 0; i < 5; i++)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, treeNBuffers[i]);
                gl.bufferData(gl.ARRAY_BUFFER, treeVertexNormals[i], gl.STATIC_DRAW);
            }
            for (let i = 0; i < 2; i++)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, streetlightNBuffers[i]);
                gl.bufferData(gl.ARRAY_BUFFER, streetlightVertexNormals[i], gl.STATIC_DRAW);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, carNBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, car1Data.vertexNormals, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, corpseNBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, corpse1Data.vertexNormals, gl.STATIC_DRAW);
        }
        if (key === "3") 
        {
            drawMode = gl.LINES; // wireframe
        }
    });

    window.addEventListener("keyup", function(event) {
        var key = event.key.toLowerCase();
        if (event.code === "Space") key = "jump";
        if (event.code === "ShiftLeft") key = "sprint";
        if (key === "c") key = "crouch";
        if (event.code === "ArrowUp") key = "pitchUp";
        if (event.code === "ArrowDown") key = "pitchDown";
        if (event.code === "ArrowLeft") key = "rollLeft";
        if (event.code === "ArrowRight") key = "rollRight";
        if (key in keys) keys[key] = false;
    });

    // simulator alligator
    render();
}

// --- RENDER PHASE ---
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // read walker and turning speed from slider
    walkSpeed = parseFloat(document.querySelector("#speed-slider").value) * 0.025;
    turnSpeed = parseFloat(document.querySelector("#turning-slider").value) * 0.33;

    // read fogFar value from slider
    fogFar = Math.max(40 - parseFloat(document.querySelector("#fog-slider").value) * 2, fogNear + 0.1); // Ensure fogFar is always greater than fogNear

    // update slider values
    document.querySelector("#speed-slider-val").textContent = document.querySelector("#speed-slider").value;
    document.querySelector("#turning-slider-val").textContent = document.querySelector("#turning-slider").value;
    document.querySelector("#fog-slider-val").textContent = document.querySelector("#fog-slider").value;

    moving = (keys["w"] || keys["s"] || keys["a"] || keys["d"]);
    sprinting = keys["sprint"] && moving;
    sprintHeld = sprinting ? sprintHeld + fovChangeRate : sprintHeld - fovChangeRate;
    sprintHeld = Math.max(0, Math.min(sprintHeld, maxFovPercent)); // Clamp between 0 and maxFovPercent
    var projectionMatrix = perspective(45.0*(1 + sprintHeld), canvas.width / canvas.height, 0.1, 100.0);
    
    // View Bobbing
    camY = camY + (0.4*Math.sin((0.5*(1+sprinting))*Math.PI*bobCounter) * bobbingAmount * (1 + sprinting))*moving; 
    bobCounter += 0.1; 

    // Movement Logic
    if (keys.q) yaw += turnSpeed;
    if (keys.e) yaw -= turnSpeed;
    if (keys.pitchUp) pitch += turnSpeed;
    if (keys.pitchDown) pitch -= turnSpeed;
    if (keys.rollLeft) roll += turnSpeed;
    if (keys.rollRight) roll -= turnSpeed;

    var rotationX = rotateX(pitch);
    var rotationY = rotateY(yaw);
    var rotationZ = rotateZ(roll);
    var viewRotation = mult(rotationZ, mult(rotationY, rotationX));
    var rotatedForward = multVec(viewRotation, vec4(0, 0, -1, 0));
    var rotatedRight = multVec(viewRotation, vec4(1, 0, 0, 0));
    var rotatedJump = multVec(viewRotation, vec4(0, 1, 0, 0));
    var forwardX = rotatedForward[0];
    var forwardY = rotatedForward[1];
    var forwardZ = rotatedForward[2];
    var rightX = rotatedRight[0];
    var rightY = rotatedRight[1];
    var rightZ = rotatedRight[2];
    var jumpX = rotatedJump[0];
    var jumpY = rotatedJump[1];
    var jumpZ = rotatedJump[2];

    if (keys.w) 
    { 
        camX += forwardX * (walkSpeed*(1+(0.4*keys.sprint))); 
        camY += forwardY * (walkSpeed*(1+(0.4*keys.sprint)));
        camZ += forwardZ * (walkSpeed*(1+(0.4*keys.sprint))); 

    } 
    if (keys.s) 
    { 
        camX -= forwardX * (walkSpeed*(1+(0.4*keys.sprint))); 
        camY -= forwardY * (walkSpeed*(1+(0.4*keys.sprint)));
        camZ -= forwardZ * (walkSpeed*(1+(0.4*keys.sprint)));    
    } 
    if (keys.a) 
    { 
        camX -= rightX * (walkSpeed*(1+(0.4*keys.sprint))); 
        camY -= rightY * (walkSpeed*(1+(0.4*keys.sprint)));  
        camZ -= rightZ * (walkSpeed*(1+(0.4*keys.sprint))); 
    }   
    if (keys.d) 
    { 
        camX += rightX * (walkSpeed*(1+(0.4*keys.sprint)));  
        camY += rightY * (walkSpeed*(1+(0.4*keys.sprint))); 
        camZ += rightZ * (walkSpeed*(1+(0.4*keys.sprint))); 
    }   
    if (keys.jump) 
    {
        camX += jumpX * walkSpeed;
        camY += jumpY * walkSpeed;
        camZ += jumpZ * walkSpeed;
    }
    if (keys.crouch) 
    { 
        camX -= jumpX * walkSpeed;
        camY -= jumpY * walkSpeed;
        camZ -= jumpZ * walkSpeed; 
    }

    // reset camera
    if (keys.r)
    {
        camX = initCamX;
        camY = initCamY;
        camZ = initCamZ;
        yaw = 0.0;
        pitch = 0.0;
        roll = 0.0;
    }

    // clamp movement here
    var limitX = roadWidth;       // Keeps them roughly within the tree lines
    var limitZ = (roadLength / 2) * 0.8;  // Keeps them from falling off the ends of the road
    var minY = 0.2;                     // Keeps them from sinking under the floor
    var maxY = 3.0;                     // Keeps them from flying away

    // Clamp X
    camX = Math.max(-limitX, Math.min(camX, limitX));
    
    // Clamp Y
    camY = Math.max(minY, Math.min(camY, maxY));
    
    // Clamp Z
    camZ = Math.max(-limitZ, Math.min(camZ, limitZ));

    // Camera Matrices
    var eye = vec3(camX, camY, camZ);
    var at = vec3(camX + forwardX, camY + forwardY, camZ + forwardZ);  
    var up = multVec(viewRotation, vec4(0, 1, 0, 0));
    up = vec3(up[0], up[1], up[2]);

    var viewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(uViewMatrix, false, flatten(viewMatrix));

    // Light values
    let activeLights = [];
    for (let i = 0; i < numStreetlights; i++)
    {
        activeLights.push({
            type: 1, // spotlight
            position: streetlightLightWorldPositions[i],
            color: [1.0, 0.8, 0.6], // warm light
            direction: [0, -1, 0], // pointing downwards
            constant: 1.0,
            linear: 0.09,
            quadratic: 0.032,
            cutoff: 75.0, // degrees
            exponent: 1.0
        });
    }

    gl.uniform1i(uNumLightsLoc, activeLights.length);

    for (let i = 0; i < activeLights.length; i++) {
        gl.uniform1i(uLightsLoc[i].type, activeLights[i].type);
        gl.uniform3fv(uLightsLoc[i].position, flatten(activeLights[i].position));
        gl.uniform3fv(uLightsLoc[i].color, flatten(activeLights[i].color));
        gl.uniform3fv(uLightsLoc[i].direction, flatten(activeLights[i].direction));
        
        gl.uniform1f(uLightsLoc[i].constant, activeLights[i].constant);
        gl.uniform1f(uLightsLoc[i].linear, activeLights[i].linear);
        gl.uniform1f(uLightsLoc[i].quadratic, activeLights[i].quadratic);
        
        gl.uniform1f(uLightsLoc[i].cutoff, activeLights[i].cutoff);
        gl.uniform1f(uLightsLoc[i].exponent, activeLights[i].exponent);
    }

    // setting fog uniforms
    gl.uniform4fv(uFogColorLoc, fogColor);
    gl.uniform1f(uFogNearLoc, fogNear);
    gl.uniform1f(uFogFarLoc, fogFar);

    // The road uses an identity matrix (no movement)
    var identityMatrix = mat4();
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(identityMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, roadCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, roadVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, roadNBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(drawMode, 0, roadVertexCount);

    // The grass uses an identity matrix (no movement)
    var identityMatrix = mat4();
    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(identityMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, grassCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, grassVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, grassNBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

    gl.uniform1f(uIsGrassLoc, 1.0); // switch to grass shader logic
    gl.drawArrays(drawMode, 0, grassVertexCount);
    gl.uniform1f(uIsGrassLoc, 0.0); // turn off grass shader logic for other objects

    // Bind moon data
    gl.bindBuffer(gl.ARRAY_BUFFER, moonCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, moonVBuffer); // Cuboid shape for moon for now
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    // Moon
    var moveMoon = translate(moonX, moonY, moonZ);
    var growMoon = scale(2.0, 2.0, 2.0);
    var moonModelMatrix = mult(moveMoon, growMoon);

    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(moonModelMatrix));
    gl.drawArrays(drawMode, 0, 36);

    // bind car data
    gl.bindBuffer(gl.ARRAY_BUFFER, carCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, carVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, carNBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);
    
    // Car
    var scaleCar = scale(carScale, carScale, carScale);
    var rotateCar = rotateY(carRotation);
    var moveCar = translate(car1X, car1Y, car1Z);
    var carModelMatrix = mult(moveCar, mult(rotateCar, scaleCar));

    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(carModelMatrix));
    gl.drawArrays(drawMode, 0, carVertexCount);

    // bind corpse data
    gl.bindBuffer(gl.ARRAY_BUFFER, corpseCBuffer);
    gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, corpseVBuffer);
    gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, corpseNBuffer);
    gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);
    
    // Corpse
    var scaleCorpse = scale(corpseScale, corpseScale, corpseScale);
    var moveCorpse = translate(corpseX, corpseY, corpseZ);
    var corpseModelMatrix = mult(moveCorpse, scaleCorpse);

    gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(corpseModelMatrix));
    gl.drawArrays(drawMode, 0, corpseVertexCount);

    // Trees
    for (let i = 0; i < numTrees; i++)
    {
        let treeType = treeTypeArray[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, treeCBuffers[treeType-1]);
        gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, treeVBuffers[treeType-1]);
        gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, treeNBuffers[treeType-1]);
        gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);
        var shrinkTree = scale(0.5, 0.5, 0.5);
        var transTree = translate(treeLocations[i][0], treeLocations[i][1], treeLocations[i][2]);
        var treeModelMatrix = mult(transTree, shrinkTree);
        gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(treeModelMatrix));
        gl.drawArrays(drawMode, 0, treeVertices[treeType-1].length / 3);
    }

    for (let i = 0; i < numStreetlights; i++)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, streetlightCBuffers[streetlightTypeArray[i]]);
        gl.vertexAttribPointer(vColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, streetlightVBuffers[streetlightTypeArray[i]]);
        gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, streetlightNBuffers[streetlightTypeArray[i]]);
        gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);
        var shrinkLamp = scale(1.0, 1.0, 1.0);
        var transLamp = translate(streetlightLocations[i][0], streetlightLocations[i][1], streetlightLocations[i][2]);
        var lampModelMatrix = mult(transLamp, shrinkLamp);
        gl.uniformMatrix4fv(uModelMatrixLoc, false, flatten(lampModelMatrix));
        gl.drawArrays(drawMode, 0, streetlightVertices[streetlightTypeArray[i]].length / 3);
    }

    requestAnimFrame(render); 
}
function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

//----------------------------------------------------------------------------

function radians( degrees ) {
    return degrees * Math.PI / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2()
{
    var result = _argumentsToArray( arguments );
    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}

function vec3()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    }

    return result.splice( 0, 3 );
}

function vec4()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
    }

    return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec2( v[0],  0.0 ),
            vec2(  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec2(v) );  v.splice( 0, 2 );
        m.push( vec2(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat3()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec3( v[0],  0.0,  0.0 ),
            vec3(  0.0, v[0],  0.0 ),
            vec3(  0.0,  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );
        break;
    }

    m.matrix = true;

    return m;
}

//----------------------------------------------------------------------------

function mat4()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec4( v[0], 0.0,  0.0,   0.0 ),
            vec4( 0.0,  v[0], 0.0,   0.0 ),
            vec4( 0.0,  0.0,  v[0],  0.0 ),
            vec4( 0.0,  0.0,  0.0,  v[0] )
        ];
        break;

    default:
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );
        break;
    }

    m.matrix = true;

    return m;
}

function flatten( v )
{
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}


var sizeof = {
    'vec2' : new Float32Array( flatten(vec2()) ).byteLength,
    'vec3' : new Float32Array( flatten(vec3()) ).byteLength,
    'vec4' : new Float32Array( flatten(vec4()) ).byteLength,
    'mat2' : new Float32Array( flatten(mat2()) ).byteLength,
    'mat3' : new Float32Array( flatten(mat3()) ).byteLength,
    'mat4' : new Float32Array( flatten(mat4()) ).byteLength
};

function transpose( m )
{
    if ( !m.matrix ) {
        return "transpose(): trying to transpose a non-matrix";
    }

    var result = [];
    for ( var i = 0; i < m.length; ++i ) {
        result.push( [] );
        for ( var j = 0; j < m[i].length; ++j ) {
            result[i].push( m[j][i] );
        }
    }

    result.matrix = true;

    return result;
}

// other functions from my version of common.js

// Helper functions
function isEqual(vec_1, vec_2) {
  if (vec_1.length !== vec_2.length) {
    return false;
  }
  for (let i = 0; i < vec_1.length; i++) {
    if (vec_1[i] !== vec_2[i]) return false;
  }
  return true;
}

function vectorLengths(vec_1, vec_2) {
  return [vec_1.length, vec_2.length];
}

function normalizeVector(vec) {
  let denom =
    vec.reduce(
      (accumulator, currentValue) => (accumulator += currentValue ** 2),
      0,
    ) ** 0.5;
  return vec.map((number) => number / denom);
}

function normalizeVectors(vec_1, vec_2) {
  return [normalizeVector(vec_1), normalizeVector(vec_2)];
}

function vectorSum(vec_1, vec_2) {
  if (vec_1.length !== vec_2.length) return "ERROR";

  let vec_3 = [];
  for (let i = 0; i < vec_1.length; i++) vec_3.push(vec_1[i] + vec_2[i]);

  return vec_3;
}

function vectorDifference(vec_1, vec_2) {
  if (vec_1.length !== vec_2.length) return "ERROR";

  let vec_3 = [];
  for (let i = 0; i < vec_1.length; i++) vec_3.push(vec_1[i] - vec_2[i]);

  return vec_3;
}

function dotProduct(vec_1, vec_2) {
  if (vec_1.length !== vec_2.length) return "ERROR";
  let dp = 0;
  for (let i = 0; i < vec_1.length; i++) dp += vec_1[i] * vec_2[i];
  return dp;
}

function crossProduct(vec_1, vec_2) {
  if (vec_1.length !== vec_2.length) return "ERROR - dimension mismatch";
  if (vec_1.length === 4)
    return "ERROR - Need 3 vectors to calculate the cross-product of 4D vectors";
  if (vec_1.length === 2)
    return vec3(0, 0, vec_1[0] * vec_2[1] - vec_1[1] * vec_2[0]);
  return vec3(
    vec_1[1] * vec_2[2] - vec_1[2] * vec_2[1],
    vec_1[2] * vec_2[0] - vec_1[0] * vec_2[2],
    vec_1[0] * vec_2[1] - vec_1[1] * vec_2[0],
  );
}

// lerp functions
function lerp(P, Q, alpha) {
  var beta = 1 - alpha;
  var alphaQ = Q * alpha;
  var betaP = P * beta;
  var X = alphaQ + betaP;
  return X;
}

function map_point(P, Q, A, B, X) {
  var alpha = (X - P) / (Q - P);
  return lerp(A, B, alpha);
}

// actual logic
function mapComplex(L, pixelCoord) {
  if (pixelCoord.length !== 2) return "ERROR";

  for (let i = 0; i < 2; i++) {
    if (pixelCoord[i] < 0 || pixelCoord[i] >= L) return "ERROR";
  }

  const mappingX = map_point(0, L, -2, 2, pixelCoord[0]);
  const mappingY = map_point(0, L, 2, -2, pixelCoord[1]);

  return `${mappingX} + ${mappingY}i`;
}

function mapWebGL(L, pixelCoord) {
  if (pixelCoord.length !== 2) return "ERROR";

  for (let i = 0; i < 2; i++) {
    if (pixelCoord[i] < 0 || pixelCoord[i] >= L) return "ERROR";
  }

  const mappingX = map_point(0, L, -1, 1, pixelCoord[0]);
  const mappingY = map_point(0, L, 1, -1, pixelCoord[1]);

  return [mappingX, mappingY];
}

function interpolateCoord(W, pixelCoord) {
  if (pixelCoord < 0 || pixelCoord >= W) return "ERROR";
  return [map_point(0, W, -1, 1, pixelCoord), 0];
}

function interpolateGrey(W, pixelCoord) {
  if (pixelCoord < 0 || pixelCoord >= W) return "ERROR";
  const mappedPoint = map_point(0, W, 0, 1, pixelCoord);
  return [mappedPoint, mappedPoint, mappedPoint];
}

function interpolateColor(W, pixelCoord) {
  if (pixelCoord < 0 || pixelCoord >= W) return "ERROR";
  if (pixelCoord < W / 2)
  {
    const colorX = map_point(0, W / 2, 1, 0, pixelCoord);
    const colorY = map_point(0, W / 2, 0, 1, pixelCoord);
    var color = [colorX, colorY];
    color.push(0);
  }
  else
  {
    const colorX = map_point(W/2, W, 1, 0, pixelCoord);
    const colorY = map_point(W/2, W, 0, 1, pixelCoord);
    var color = [colorX, colorY];
    color.unshift(0);
  }
  return color;
}

// matrix functions
function mult(matrixA, matrixB) {
    if (matrixA[0].length !== matrixB.length) return "ERROR - dimension mismatch";
    let result = [];
    for (let i = 0; i < matrixA.length; i++) {
        result.push([]);
        for (let j = 0; j < matrixB[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < matrixA[0].length; k++) {
                sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i].push(sum);
        }
    }

    result.matrix = true;

    return result;
}

// matrix-vector multiplication
function multVec(matrix, vector) {
    if (matrix[0].length !== vector.length) return "ERROR - dimension mismatch";
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        let sum = 0;
        for (let j = 0; j < matrix[0].length; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result.push(sum);
    }
    return result;
}

// translation matrix
function translate(tx, ty, tz) {
    var result = mat4(); // Starts as an identity matrix
    result[0][3] = tx;
    result[1][3] = ty;
    result[2][3] = tz;
    return result;
}

// scale matrix
function scale(sx, sy, sz) {
    var result = mat4();
    result[0][0] = sx;
    result[1][1] = sy;
    result[2][2] = sz;
    return result;
}

// rotate x matrix
function rotateX(angle) {
    var c = Math.cos(radians(angle));
    var s = Math.sin(radians(angle));
    var result = mat4();
    result[1][1] = c;
    result[1][2] = -s;
    result[2][1] = s;
    result[2][2] = c;
    return result;
}

// rotate y matrix
function rotateY(angle) {
    var c = Math.cos(radians(angle));
    var s = Math.sin(radians(angle));
    var result = mat4();
    result[0][0] = c;
    result[0][2] = s;
    result[2][0] = -s;
    result[2][2] = c;
    return result;
}

// rotate z matrix
function rotateZ(angle) {
    var c = Math.cos(radians(angle));
    var s = Math.sin(radians(angle));
    var result = mat4();
    result[0][0] = c;
    result[0][1] = -s;
    result[1][0] = s;
    result[1][1] = c;
    return result;
}

// lookAt
function lookAt(eye, at, up) {

    // forward vector
    var v = normalizeVector(vectorDifference(at, eye)); 
    
    // right vector
    var n = normalizeVector(crossProduct(v, up)); 
    
    // true up vector
    var u = normalizeVector(crossProduct(n, v)); 

    // reverse v because we want to look in direction of v
    v = [-v[0], -v[1], -v[2]];

    var result = mat4();

    // Row 0 is the Right/Side vector (n)
    result[0][0] = n[0];
    result[0][1] = n[1];
    result[0][2] = n[2];

    // Row 1 is the Up vector (u)
    result[1][0] = u[0];
    result[1][1] = u[1];
    result[1][2] = u[2];

    // Row 2 is the Forward vector (v)
    result[2][0] = v[0];
    result[2][1] = v[1];
    result[2][2] = v[2];

    // The Translation (Camera Position)
    result[0][3] = -(n[0] * eye[0] + n[1] * eye[1] + n[2] * eye[2]);
    result[1][3] = -(u[0] * eye[0] + u[1] * eye[1] + u[2] * eye[2]);
    result[2][3] = -(v[0] * eye[0] + v[1] * eye[1] + v[2] * eye[2]);

    return result;
}

// perspective
function perspective(fovy, aspect, near, far)
{
    var f = 1.0 / Math.tan(radians(fovy) / 2);
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = -(near + far) / d;
    result[2][3] = -2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

// importing mesh for car
// specifically for car due to .obj file format
async function loadCarOBJ(url, color) {
    const response = await fetch(url);
    const text = await response.text();

    const tempVertices = [];
    // these are vertex normals, not face normals
    // lighting is preferred to be done with vertex normals (smooth shading)
    const tempNormals = [];

    const finalVertices = [];
    const finalNormals = [];
    const finalColors = [];
    const finalFaceNormals = [];

    const triangles = [];
    const vertexNormalSums = [];

    // Define colors for the materials in your OBJ
    const materials = {
        "Green": [0.15, 0.25, 0.2, 1.0], // Murky green
        "Blue": [0.2, 0.25, 0.32, 1.0], // Muddy blue
        "Black": [0.1, 0.1, 0.1, 1.0],  // Dark grey/black
        "Window": [0.2, 0.2, 0.3, 1.0], // Dark blueish glass
        "Bumpers": [0.5, 0.5, 0.5, 1.0], // Chrome/Grey
        "Wheels": [0.5, 0.5, 0.5, 1.0], // grey rim
        "Lights": [1.0, 0.8, 0.6, 1.0], // Warm light color
        "Bottom": [0.3, 0.1, 0.1, 1.0], // Darker red for undercarriage
        "Tires": [0.05, 0.05, 0.05, 1.0], // Very dark rubber
    };
    
    // Default color if a material is missing
    let currentColor = [0.8, 0.8, 0.8, 1.0]; 

    const lines = text.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line === '' || line.startsWith('#')) continue;

        const parts = line.split(/\s+/);
        const type = parts[0];

        if (type === 'v') {
            tempVertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            vertexNormalSums.push([0, 0, 0]);
        } 
        else if (type === 'vn') {
            tempNormals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } 
        else if (type === 'usemtl') {
            const matName = parts[1];
            if (matName == "Body"){
                currentColor = materials[color];
            }
            else {currentColor = materials[matName];}
        } 
        else if (type === 'f') {
            // parsing face data
            const faceVertices = [];
            for (let i = 1; i < parts.length; i++) {
                // Split v//vn or v/vt/vn
                const indices = parts[i].split('/'); 
                // OBJ is 1-indexed, subtract 1
                const vIndex = parseInt(indices[0]) - 1; 
                // vn can be missing; treat as -1 in that case
                const lastIndexToken = indices[indices.length - 1];
                const vnIndex = lastIndexToken !== "" && indices.length > 1 ? parseInt(lastIndexToken) - 1 : -1;
                faceVertices.push({ v: vIndex, vn: vnIndex });
            }

            // triangulate N-gons using a Triangle Fan
            for (let i = 1; i < faceVertices.length - 1; i++) {
                triangles.push({
                    verts: [faceVertices[0], faceVertices[i], faceVertices[i + 1]],
                    color: [currentColor[0], currentColor[1], currentColor[2], currentColor[3]]
                });
            }
        }
    }

    // Pass 2: compute face normals and accumulate for smooth vertex normals.
    for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i].verts;
        const p0 = tempVertices[tri[0].v];
        const p1 = tempVertices[tri[1].v];
        const p2 = tempVertices[tri[2].v];

        const edge1 = vectorDifference(p1, p0);
        const edge2 = vectorDifference(p2, p0);
        let faceNormal = crossProduct(edge1, edge2);
        const lenSq = dotProduct(faceNormal, faceNormal);
        if (lenSq > 0) {
            faceNormal = normalizeVector(faceNormal);
        } else {
            faceNormal = [0, 1, 0];
        }

        triangles[i].faceNormal = faceNormal;

        for (let j = 0; j < 3; j++) {
            const vi = tri[j].v;
            vertexNormalSums[vi][0] += faceNormal[0];
            vertexNormalSums[vi][1] += faceNormal[1];
            vertexNormalSums[vi][2] += faceNormal[2];
        }
    }

    // Pass 3: emit final arrays; prefer OBJ vn if present, otherwise computed smooth normal.
    for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i].verts;
        const triColor = triangles[i].color;
        const triFaceNormal = triangles[i].faceNormal;

        for (let j = 0; j < 3; j++) {
            const vertIndex = tri[j].v;
            const vert = tempVertices[vertIndex];
            const vnIndex = tri[j].vn;
            let normal = vnIndex >= 0 ? tempNormals[vnIndex] : null;

            if (!normal) {
                const summed = vertexNormalSums[vertIndex];
                const summedLenSq = dotProduct(summed, summed);
                normal = summedLenSq > 0 ? normalizeVector(summed) : triFaceNormal;
            }

            finalVertices.push(vert[0], vert[1], vert[2]);
            finalNormals.push(normal[0], normal[1], normal[2]);
            finalColors.push(triColor[0], triColor[1], triColor[2], triColor[3]);
            finalFaceNormals.push(triFaceNormal[0], triFaceNormal[1], triFaceNormal[2]);
        }
    }

    return {
        vertices: new Float32Array(finalVertices),
        vertexNormals: new Float32Array(finalNormals),
        colors: new Float32Array(finalColors),
        faceNormals: new Float32Array(finalFaceNormals)
    };
}


async function loadCorpseOBJ(url, color) {
    const response = await fetch(url);
    const text = await response.text();

    const tempVertices = [];
    const tempUVs = [];

    const finalVertices = [];
    const finalNormals = [];
    const finalColors = [];
    const finalFaceNormals = [];

    const triangles = [];
    const vertexNormalSums = [];

    const materials = {
        "Blue Grey": [0.2, 0.25, 0.32, 1.0], // Muddy blue
        "Dark Brown": [0.3, 0.2, 0.1, 1.0], // Fleshy brown
        "mat_0-Corpse_head_D.jpg": [0.5, 0.4, 0.3, 1.0],     // fleshy dark brown skin
        "mat_1-Corpse_hair_D.jpg": [0.1, 0.1, 0.1, 1.0],     // Greasy black/grey hair
        "mat_2-Corpse_clothing_D.jpg": [0.2, 0.2, 0.3, 1.0], // Muddy blue
        "mat_3-Corpse_skin_D.jpg": [0.5, 0.4, 0.3, 1.0],     // Matching body skin
        "mat_4-default-grey.jpg": [0.5, 0.5, 0.5, 1.0]       // Fallback
    };
    
    let currentColor = [0.8, 0.8, 0.8, 1.0];

    const lines = text.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line === '' || line.startsWith('#')) continue;

        const parts = line.split(/\s+/);
        const type = parts[0];

        if (type === 'v') {
            tempVertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            vertexNormalSums.push([0, 0, 0]);
        } 
        else if (type === 'vt') {
            // Store texture coordinates (U, V)
            tempUVs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
        }
        else if (type === 'usemtl') {
            const matName = parts[1];
            if (matName == "mat_2-Corpse_clothing_D.jpg"){
                currentColor = materials[color]; // Use the same color for head and skin
            }
            else if (materials[matName]) {
                currentColor = materials[matName];
            } else {
                currentColor = materials["mat_4-default-grey.jpg"]; // Fallback color
            }
        }
        else if (type === 'f') {
            const faceVertices = [];
            for (let i = 1; i < parts.length; i++) {
                // Split v/vt format
                const indices = parts[i].split('/'); 
                const vIndex = parseInt(indices[0]) - 1; 
                // We parse vt just to have it, though we don't push it to WebGL yet
                const vtIndex = indices.length > 1 && indices[1] !== "" ? parseInt(indices[1]) - 1 : -1; 
                faceVertices.push({ v: vIndex, vt: vtIndex });
            }
            // triangulate N-gons using a Triangle Fan
            for (let i = 1; i < faceVertices.length - 1; i++) {
                triangles.push({
                    verts: [faceVertices[0], faceVertices[i], faceVertices[i + 1]],
                    color: [currentColor[0], currentColor[1], currentColor[2], currentColor[3]]
                });
            }
        }
    }

    // Pass 2: compute face normals and accumulate per-vertex normals.
    for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i].verts;
        const p0 = tempVertices[tri[0].v];
        const p1 = tempVertices[tri[1].v];
        const p2 = tempVertices[tri[2].v];

        const edge1 = vectorDifference(p1, p0);
        const edge2 = vectorDifference(p2, p0);
        let faceNormal = crossProduct(edge1, edge2);
        const lenSq = dotProduct(faceNormal, faceNormal);
        if (lenSq > 0) {
            faceNormal = normalizeVector(faceNormal);
        } else {
            faceNormal = [0, 1, 0];
        }

        triangles[i].faceNormal = faceNormal;

        for (let j = 0; j < 3; j++) {
            const vi = tri[j].v;
            vertexNormalSums[vi][0] += faceNormal[0];
            vertexNormalSums[vi][1] += faceNormal[1];
            vertexNormalSums[vi][2] += faceNormal[2];
        }
    }

    // Pass 3: emit smooth vertex normals and also expose per-triangle face normals.
    for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i].verts;
        const triColor = triangles[i].color;
        const triFaceNormal = triangles[i].faceNormal;

        for (let j = 0; j < 3; j++) {
            const vertIndex = tri[j].v;
            const vert = tempVertices[vertIndex];
            const summed = vertexNormalSums[vertIndex];
            const summedLenSq = dotProduct(summed, summed);
            const vertexNormal = summedLenSq > 0 ? normalizeVector(summed) : triFaceNormal;

            finalVertices.push(vert[0], vert[1], vert[2]);
            finalNormals.push(vertexNormal[0], vertexNormal[1], vertexNormal[2]);
            finalColors.push(triColor[0], triColor[1], triColor[2], triColor[3]);
            finalFaceNormals.push(triFaceNormal[0], triFaceNormal[1], triFaceNormal[2]);
        }
    }

    return {
        vertices: new Float32Array(finalVertices),
        vertexNormals: new Float32Array(finalNormals),
        colors: new Float32Array(finalColors),
        faceNormals: new Float32Array(finalFaceNormals)
    };
}
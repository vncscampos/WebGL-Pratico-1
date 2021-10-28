// Iniciar o ambiente quando a página for carregada
$(function () {
  iniciaWebGL();
});

function iniciaWebGL() {
  var canvas = $("#canvas-webgl")[0];
  iniciarGL(canvas); // Definir como um canvas 3D
  iniciarShaders(); // Obter e processar os Shaders
  iniciarBuffers(); // Enviar o triângulo e quadrado na GPU
  iniciarAmbiente(); // Definir background e cor do objeto
  desenharCena(); // Usar os itens anteriores e desenhar
}

// O contexto é obtido do canvas. Com ele, você carrega os shaders, desenha os objetos, manda os vértices para a GPU, carrega as texturas e outras coisas mais.
function iniciarGL(canvas) {
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
    if (!gl) alert("Não pode inicializar WebGL, desculpe");
  }
}

// Shading é o processo de desenhar, atribuir e ajustar shaders para criar seu aspecto tridimensional.
// Shaders são definições de como os objetos responderão à luz, descrevendo a aparência de sua superfície e como serão renderizados.

// Antes de compilar o shader na GPU temos que criar um programa, anexar os shaders compilados no programa e depois compilar.
// Também obteremos as referências para as variáveis uniforms e atributos para enviar nossos dados de vértices e transformações.
var shaderProgram;
function iniciarShaders() {
  var vertexShader = getShader(gl, "#shader-vs");
  var fragmentShader = getShader(gl, "#shader-fs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Não pode inicializar shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    "aVertexPosition"
  );
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(
    shaderProgram,
    "aVertexColor"
  );
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    "uPMatrix"
  );
  shaderProgram.vMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    "uVMatrix"
  );
  shaderProgram.mMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    "uMMatrix"
  );
}

// A função getShader faz a compilação dos shaders
function getShader(gl, id) {
  var shaderScript = $(id)[0];
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) str += k.textContent;
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

// Criando oss buffers na GPU para colocar os dados dos vértices
var mMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;

function iniciarBuffers() {
  triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

  var vertices = [0.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 3;

  triangleVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  var cores = [1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
  triangleVertexColorBuffer.itemSize = 4;
  triangleVertexColorBuffer.numItems = 3;

  squareVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  squareVertexPositionBuffer.itemSize = 3;
  squareVertexPositionBuffer.numItems = 4;

  squareVertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  cores = [];
  for (var i = 0; i < 4; i++) {
    cores = cores.concat([0.5, 0.5, 1.0, 1.0]);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
  squareVertexColorBuffer.itemSize = 4;
  squareVertexColorBuffer.numItems = 4;
}

function iniciarAmbiente() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}

function desenharCena() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(
    pMatrix,
    45,
    gl.viewportWidth / gl.viewportHeight,
    0.1,
    100.0
  );
  mat4.identity(mMatrix);
  mat4.identity(vMatrix);

  // Desenhando Triângulo
  var translation = vec3.create();
  vec3.set(translation, -1.5, 1.0, -7.0);
  mat4.translate(mMatrix, mMatrix, translation);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    triangleVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  setMatrixUniforms();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexColorAttribute,
    triangleVertexColorBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

  // Desenhando o Quadrado
  vec3.set(translation, 3.0, 0.0, 0.0);
  mat4.translate(mMatrix, mMatrix, translation);
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    squareVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  setMatrixUniforms();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexColorAttribute,
    squareVertexColorBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
  gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}

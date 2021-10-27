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

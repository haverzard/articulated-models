var observer

var textures = {}

function setMatTransform(gl, shaderProgram, attr, mat) {
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, attr), false, transpose(mat).flat())
}

function setVector3D(gl, shaderProgram, attr, vec) {
  gl.uniform3fv(gl.getUniformLocation(shaderProgram, attr), vec)
}

function createBuffer(gl, data, DataClass=Float32Array, bufferType=gl.ARRAY_BUFFER, draw=gl.DYNAMIC_DRAW) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(bufferType, buffer)
  gl.bufferData(bufferType, new DataClass(data), draw)
  return buffer
}

function bindBuffer(gl, shaderProgram, buffer, dimension, attrName, bufferType=gl.ARRAY_BUFFER, dataType=gl.FLOAT) {
  gl.bindBuffer(bufferType, buffer)
  var attr = gl.getAttribLocation(shaderProgram, attrName)
  gl.vertexAttribPointer(attr, dimension, dataType, false, 0, 0)
  gl.enableVertexAttribArray(attr)
}

function configureTexture(gl, url, id) {
  // generate image
  var image = new Image();
  image.src = url
  requestCORSIfNotSameOrigin(image, url);
  
  var texture = gl.createTexture();
  textures[id] = texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  image.onload = () => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // gpu support power of 2 only by default
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // use padding instead by using wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }
}

function loadShader(gl, vertCoder, fragCoder) {
  var vertShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertShader, vertCoder())
  gl.compileShader(vertShader)

  var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragShader, fragCoder())
  gl.compileShader(fragShader)

  // create shader program
  var shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertShader)
  gl.attachShader(shaderProgram, fragShader)

  gl.linkProgram(shaderProgram)
  gl.useProgram(shaderProgram)

  return shaderProgram
}

window.onload = () => {
  new Observer()
}
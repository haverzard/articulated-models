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

function configureTexture(gl, url) {
  // generate image
  var image = new Image();
  image.src = url
  requestCORSIfNotSameOrigin(image, url);
  
  var texture = gl.createTexture();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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
  return texture
}

function environmentTexture(gl,id) {
  var texture = gl.createTexture();
  // textures[id] = texture
  // gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  // const faceInfos = [
  //   {
  //     target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
  //     url: '/src/assets/wallpaper.jpg',
  //   },
  //   {
  //     target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
  //     url: '/src/assets/wallpaper.jpg',
  //   },
  //   {
  //     target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
  //     url: '/src/assets/wallpaper.jpg',
  //   },
  //   {
  //     target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
  //     url: '/src/assets/wallpaper.jpg',
  //   },
  //   {
  //     target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
  //     url: '/src/assets/wallpaper.jpg',
  //   },
  //   {
  //     target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  //     url: '/src/assets/wallpaper.jpg',
  //   },
  // ];
  // faceInfos.forEach((faceInfo) => {
  //   const {target, url} = faceInfo;

  //   // Upload the canvas to the cubemap face.
  //   const level = 0;
  //   const internalFormat = gl.RGBA;
  //   const width = 512;
  //   const height = 512;
  //   const format = gl.RGBA;
  //   const type = gl.UNSIGNED_BYTE;

  //   // setup each face so it's immediately renderable
  //   gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

  //   // Asynchronously load an image
  //   const image = new Image();
  //   requestCORSIfNotSameOrigin(image, url)
  //   image.src = url;
  //   image.addEventListener('load', function() {
  //     // Now that the image has loaded make copy it to the texture.
  //     gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  //     gl.texImage2D(target, level, internalFormat, format, type, image);
  //     gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  //   });
  // });
  // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
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
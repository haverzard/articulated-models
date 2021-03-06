const ASPECT_RATIO = 1
const FRAMES = 200
const MODE = Object.freeze({ NONE: null, ROTATE: "rotate", TRANSLATE: "translate" })
const PROJ = Object.freeze({ ORTHO: "ortho", PSPEC: "pspec", OBLIQUE: "oblique"})



function normalizeX(canvas, x) {
    return (x * 2) / canvas.width - 1
}

function normalizeY(canvas, y) {
    return (-y * 2) / canvas.height + 1
}

function isPowerOf2(n) {
    if (n == 0) return false;
    let r = Math.log(n) / Math.log(2)
    return Math.ceil(r) == Math.floor(r)
}

function requestCORSIfNotSameOrigin(image, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        image.crossOrigin = "";
    }
}

function getPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y]
}

function getDeg(rad) {
    return rad * 180 / Math.PI
}

function getRad(degree) {
    return Math.PI * degree / 180
}

function neg(v) {
    let u = Array(v.length)
    for (let i = 0; i < v.length; i++)
        u[i] = - v[i]
    return u
}

function getGL(canvas) {
    var gl = canvas.getContext('webgl')
    if (!gl) {
        gl = canvas.getContext('experimental-webgl')
        if (!gl) alert("Your browser doesn't support WebGL")
        console.log('[Paint] Using experimental WebGL')
    }
    return gl
}

function toggleHelpMenu() {
    const helpMenu = document.getElementById('help')
    if (helpMenu) {
        helpMenu.classList.toggle('hide-menu')
    }
}

function crossProd(v1, v2) {
    let xcomp = v1[1] * v2[2] - v1[2] * v2[1]
    let ycomp = v1[0] * v2[2] - v1[2] * v2[0]
    let zcomp = v1[0] * v2[1] - v1[1] * v2[0]
    
    return [xcomp, -ycomp, zcomp]
}

function getNorm2Vec(v1, v2) {
    let cProd = crossProd(v1, v2)
    let lengthVec = Math.sqrt(Math.pow(cProd[0], 2) + Math.pow(cProd[1], 2) + Math.pow(cProd[2], 2))
    
    return cProd.map(function(element) {
        return element / lengthVec
    })
}

function cross(u, v) {
    var result = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    ]
  
    return result
}

function vectorSubs(vec1, vec2) {
    var res = vec1.map(function (item, index) {
      return item - vec2[index];
    })
    return res
}
  
function normalize(u) {
    let vlen = mag(u)
    let res = [...u]
    for(let i = 0; i < res.length; i++)
      res[i] /= vlen
    
    return res 
}


function mag(u) {
    return Math.sqrt(
      Math.pow(u[0], 2) +
      Math.pow(u[1], 2) + 
      Math.pow(u[2], 2)
    )
  }
  
  function dot(u, v) {
    let sum = 0
    for(let i = 0; i < 3; i++)
      sum += (u[i] * v[i])
    return sum
  }
  
  

function lookAt(eye, at, up) {
    let v = normalize( vectorSubs(at, eye) ),
        n = normalize( cross(v, up) ),
        u = normalize( cross(n, v) )
    // Negate
    for(let i = 0; i < 3; i++)
      v[i] *= (-1)
    
    let res = []
    
    n.push( -1 * dot(n, eye) )
    u.push( -1 * dot(u, eye) )
    v.push( -1 * dot(v, eye) )
  
    res.push(n, u, v, [0, 0, 0, 1])
    return res
}


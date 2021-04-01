const ASPECT_RATIO = 1
const MODE = Object.freeze({ NONE: null, ROTATE: "rotate", TRANSLATE: "translate", SCALE: "scale" })
const PROJ = Object.freeze({ ORTHO: "ortho", PSPEC: "pspec", OBLIQUE: "oblique"})

function normalizeX(canvas, x) {
    return (x * 2) / canvas.width - 1
}

function normalizeY(canvas, y) {
    return (-y * 2) / canvas.height + 1
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
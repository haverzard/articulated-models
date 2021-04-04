const I = getIdentityMat()

function copyMat(mat) {
    var newMat = []
    for (let i = 0; i < mat.length; i++) {
        newMat.push(mat[i].slice())
    }
    return newMat
}

function getIdentityMat() {
    var mat = []
    for (let i = 0; i < 4; i++) {
        mat.push(Array(4).fill(0.0))
        mat[i][i] = 1.0
    }
    return mat
}

function getZeroMat(length=4) {
    var mat = []
    for (let i = 0; i < length; i++) {
        mat.push(Array(4).fill(0.0))
    }
    return mat
}

function transpose(mat) {
    let newMat = Array(mat[0].length)
    for (let i = 0; i < mat[0].length; i++)
        newMat[i] = Array(mat.length)
    for (let i = 0; i < mat.length; i++) {
        for (let j = 0; j < mat[0].length; j++) {
            newMat[j][i] = mat[i][j]
        }
    }
    return newMat
}

function to4D(mat) {
    let newMat = Array(mat.length)
    for (let i = 0; i < mat.length; i++) {
        newMat[i] = Array(4).fill(1)
        for (let j = 0; j < 3; j++) {
            newMat[i][j] = mat[i][j]
        }
    }
    return newMat
}

function to3D(mat) {
    let newMat = Array(mat.length)
    for (let i = 0; i < mat.length; i++) {
        newMat[i] = Array(3).fill(1)
        for (let j = 0; j < 3; j++) {
            newMat[i][j] = mat[i][j]
        }
    }
    return newMat
}

function matMult(mat1, mat2) {
    var mat = getZeroMat(mat1.length)
    for (let i = 0; i < mat1.length; i++)
        for (let j = 0; j < 4; j++)
            for (let k = 0; k < 4; k++)
                mat[i][j] += mat1[i][k] * mat2[k][j]
    return mat
}

function getSMat(scale) {
    var mat = getIdentityMat()
    for (let i = 0; i < 3; i++)
        mat[i][i] = scale[i]
    return mat
}

function getTMat(translate) {
    var mat = getIdentityMat()
    for (let i = 0; i < 3; i++)
        mat[i][3] = translate[i]
    return mat
}

function getRxMat(degree) {
    var angle = getRad(degree)
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mat = getIdentityMat()
    mat[1][1] = c
    mat[2][2] = c
    mat[1][2] = -s
    mat[2][1] = s
    return mat
}

function getRyMat(degree) {
    var angle = getRad(degree)
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mat = getIdentityMat()
    mat[0][0] = c
    mat[2][2] = c
    mat[0][2] = s
    mat[2][0] = -s
    return mat
}

function getRzMat(degree) {
    var angle = getRad(degree)
    var c = Math.cos(angle)
    var s = Math.sin(angle)
    var mat = getIdentityMat()
    mat[0][0] = c
    mat[1][1] = c
    mat[0][1] = -s
    mat[1][0] = s
    return mat
}

function getOrthoMat(left, right, bottom, top, near, far) {
    var oMat = getZeroMat()
    oMat[0][0] = 2 / (right - left)
    oMat[1][1] = 2 / (top - bottom)
    oMat[2][2] = - 2 / (far - near)
    oMat[0][3] = - (left + right) / (right - left)
    oMat[1][3] = - (top + bottom) / (top - bottom)
    oMat[2][3] = - (far + near) / (far - near)
    oMat[3][3] = 1.0
    var noZ = getIdentityMat()
    noZ[2][2] = 0
    return matMult(noZ, oMat)
}

function getPerspectiveMat(fovy, aspect, near, far) {
    var pMat = getZeroMat()
    var top = near * Math.tan(getRad(fovy) / 2)
    var right = top * aspect
    pMat[0][0] = near / right
    pMat[1][1] = near / top
    pMat[2][2] = - (far + near) / (far - near)
    pMat[2][3] = - (2 * far * near) / (far - near)
    pMat[3][2] = -1.0
    return pMat
}

function getObliqueMat(left, right, bottom, top, near, far, xz_deg, yz_deg) {
    var oMat = getOrthoMat(left, right, bottom, top, near, far)
    var h = getIdentityMat()
    h[0][2] = - 1 / Math.tan(getRad(xz_deg))
    h[1][2] = - 1 / Math.tan(getRad(yz_deg))
    return matMult(oMat, h)
}
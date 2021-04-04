class GeoObject {
    constructor() {
        this.id = ""
        this.TransformMatrix = getIdentityMat()
        this.sibling = null
        this.child = null
    }

    setColor(color) {
        this.color = color
    }

    setTransformMatrix(mat) {
        this.TransformMatrix = mat
    }

    resetTransformMatrix() {
        this.TransformMatrix = getIdentityMat()
        return this
    }

    addSibling(sibling) {
        let obj = this
        while (obj.sibling) {
            obj = obj.sibling
        }
        obj.sibling = sibling
        return this
    }

    addChild(child) {
        let obj = this
        if (!obj.child) {
            obj.child = child
            return;
        }
        obj = obj.child
        while (obj.sibling) {
            obj = obj.sibling
        }
        obj.sibling = child
        return this
    }

    addScaling(scale) {
        this.TransformMatrix = matMult(getSMat(Array(3).fill(scale)), this.TransformMatrix)
        return this
    }

    addScaling3D(scale) {
        this.TransformMatrix = matMult(getSMat(scale), this.TransformMatrix)
        return this
    }

    addTranslation(translate) {
        this.TransformMatrix = matMult(getTMat(translate), this.TransformMatrix)
        return this
    }

    addRotateX(deg) {
        this.TransformMatrix = matMult(getRxMat(deg), this.TransformMatrix)
        return this
    }

    addRotateY(deg) {
        this.TransformMatrix = matMult(getRyMat(deg), this.TransformMatrix)
        return this
    }

    addRotateZ(deg) {
        this.TransformMatrix = matMult(getRzMat(deg), this.TransformMatrix)
        return this
    }

    addTransformMatrix(TransformMatrix) {
        this.TransformMatrix = matMult(TransformMatrix, this.TransformMatrix)
        return this
    }

    applyTransformation() {
        return
    }
}
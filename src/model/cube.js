class Cube extends GeoObject {
    constructor(data = null, size = 1) {
        super()
        this.FACES = ["front", "behind", "left", "right", "top", "bottom"]
        // load from ext file
        if (data) {
            this._toShape(data)
            return
        } else {
            this._generate(size)
        }
    }

    _generate(size) {
        this.faces = {}
        this.FACES.forEach((v) => {
            this.faces[v] = new Polygon([
                [ size / 2, -size / 2, size / 2],
                [ size / 2,  size / 2, size / 2],
                [-size / 2,  size / 2, size / 2],
                [-size / 2, -size / 2, size / 2]
            ], [0,1,0])
        })

        this.faces["top"].addRotateX(90)
        this.faces["bottom"].addRotateX(-90)
        this.faces["behind"].addRotateX(180)
        this.faces["left"].addRotateY(-90)
        this.faces["right"].addRotateY(90)

        this.FACES.forEach((v) => {
            this.faces[v].applyTransformation()
        })
    }

    draw(gl, shaderProgram) { // still placeholder
        setMatTransform(gl, shaderProgram, "u_View", this.TransformMatrix)
        this.FACES.forEach((k) => {
            this.faces[k].draw(gl, shaderProgram)
        })
    }


    _toShape(data) {
        this.faces = []
        this.FACES.forEach((k) => {
            let part = data[k]
            this.faces[k] = new Shape(part["vertices"], part["color"], part["normal"], part["shininess"])
        })
    }

    parse() {
        let parsed = {}
        this.FACES.forEach((k) => {
            parsed[k] = new Shape(
                to3D(matMult(to4D(this.faces[k].vertices), transpose(this.ViewMatrix))),
                this.faces[k].color,
                to3D(matMult(to4D([this.faces[k].normal]), transpose(this.ViewMatrix)))[0],
                this.faces[k].shininess,
            )
        })
        return parsed
    }

    applyTransformation() {
        this.mid = to3D(matMult(to4D([this.mid]), transpose(this.TransformMatrix)))[0]
        this.FACES.forEach((k) => {
            this.faces[k].vertices = to3D(matMult(to4D(this.faces[k].vertices), transpose(this.TransformMatrix)))
            this.faces[k].normal = to3D(matMult(to4D([this.faces[k].normal]), transpose(this.TransformMatrix)))[0]
        })
        this.resetTransformMatrix()
    }
}
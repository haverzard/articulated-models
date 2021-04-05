class MinecraftPigModel extends GeoObject {
    constructor(data = null, size = 1) {
        super()
        this.id = "Minecraft Pig"
        this.PARTS = ["body", "right-arm", "left-arm", "right-leg", "left-leg", "head", "nose"]
        this.main = "body"
        // load from ext file
        if (data) {
            // this._toShape(data)
            return
        } else {
            this._generate()
        }
    }

    _generate() {
        this.parts = {}
        this.PARTS.forEach((k) => {
            this.parts[k] = new Cube(null, 1, [1,0.8,0.9])
        })

        this.parts["nose"].addScaling3D([0.2, 0.15, 0.1])
        this.parts["nose"].addTranslation([0, 0.05, -0.7])
        this.parts["nose"].applyTransformation()
        this.parts["nose"].id = "nose"
        this.parts["nose"].mid = [0, 0.05, -0.7]
        this.parts["nose"].bound = {
            translate: {
                activation: [true, true, false],
                range: [[-0.02, 0.02, 0.001], [-0.02, 0.02, 0.001], []]
            },
            rotate: {
                activation: [true, false, false],
                range: [[-10, 10, 1], [], []]
            }
        }

        this.parts["head"].addScaling3D([0.4, 0.4, 0.4])
        this.parts["head"].addTranslation([0, 0.1, -0.5])
        this.parts["head"].applyTransformation()
        this.parts["head"].id = "head"
        this.parts["head"].mid = [0, 0.1, -0.3]
        this.parts["head"].bound = {
            ...this.parts["head"].bound,
            rotate: {
                activation: [true, false, false],
                range: [[-90, 90, 1], [], []]
            }
        }

        const keys = ["right-arm", "left-arm", "right-leg", "left-leg"]
        keys.forEach((k, i) => {
            let x = -0.149
            let z = -0.25
            if (Math.floor(i / 2)) z = 0.35
            if (i % 2) x = -x
            this.parts[k].addScaling3D([0.2, 0.3, 0.2])
            this.parts[k].addTranslation([x, -0.3, z])
            this.parts[k].applyTransformation()
            this.parts[k].id = k
            this.parts[k].mid = [0, -0.2, z]
            this.parts[k].bound = {
                ...this.parts[k].bound,
                rotate: {
                    activation: [true, false, false],
                    range: [[-90, 90, 1], [], []]
                }
            }    
        })

        this.parts["body"].addScaling3D([0.5, 0.4, 0.8])
        this.parts["body"].applyTransformation()
        this.parts["body"].id = "body"
        this.parts["body"].bound = {
            translate: {
                activation: [true, true, true],
                range: [[-5, 5, 0.01], [-5, 5, 0.01], [-5, 5, 0.01]]
            },
            rotate: {
                activation: [true, true, true],
                range: [[-180, 180, 1], [-180, 180, 1], [-180, 180, 1]]
            }
        }

        this.parts["body"].addChild(this.parts["head"])
        this.parts["body"].addChild(this.parts["right-arm"])
        this.parts["body"].addChild(this.parts["left-arm"])
        this.parts["body"].addChild(this.parts["right-leg"])
        this.parts["body"].addChild(this.parts["left-leg"])
        this.parts["head"].addChild(this.parts["nose"])
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
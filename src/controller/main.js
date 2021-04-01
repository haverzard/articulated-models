const modes = ["rotate", "translate", "scale"]
const proj = ["ortho", "pspec", "oblique"]
const confirmations = ["apply", "cancel"]

class Observer {
    constructor() {
        this.selected = null
        this.mode = MODE.NONE
        this.projMode = PROJ.ORTHO
        this.objects = []
        this.shading = []

        this.initCamConfig()
        this.initProjection()
        this.initInputs()
        this.initButtons()
        this.initTransforms()
        this.initUploader()
    
        this.main = new MainView(this)
        this.applyProjection()
    }

    initCamConfig() {
        this.camConfig = {
            "radius": 0,
            "xRot": 0,
            "yRot": 0,
            "zRot": 0
        }
    }

    initProjection() {
        this.projection = {
            "left": -1,
            "right": 1,
            "bottom": -1,
            "top": 1,
            "near": 0.01,
            "far": 100,
            "xz-deg": 75,
            "yz-deg": 75,
            "fovy": 45,
            "aspect": 1,
        }
    }

    initTransforms() {
        this.transform = {
            "rotate": [0,0,0],
            "translate": [0,0,0],
            "scale": 1,
        }
    }

    initUploader() {
        var fileUploader = document.getElementById('file-uploader')
        fileUploader.onchange = (e) => {
          this.__loadFromFile(e.target.files[0])
        }
    }

    initButtons() {
        modes.forEach((k) => {
            document.getElementById(k+"-btn").hidden = true
            document.getElementById(k+"-btn").onclick = () => {
                if (this.mode !== null) {
                    document.getElementById(this.mode+'-btn').classList.toggle("selected", false)
                    document.getElementById(this.mode+"-sec").hidden = true
                }
                this.mode = k
                document.getElementById(k+"-sec").hidden = false
                document.getElementById(k+'-btn').classList.toggle("selected")
                this.applyTransformation();

                confirmations.forEach((k) => {
                    document.getElementById(k+'-btn').hidden = false
                })
            }
        })

        proj.forEach((m) => {
            if (m === PROJ.OBLIQUE) {
                document.getElementById(m+'-sec').childNodes.forEach((child) => {
                    child.hidden = true
                })
            } else if (m === PROJ.PSPEC) {
                document.getElementById(m+'-sec').hidden = true
            } else {
                document.getElementById(m+'-btn').classList.toggle("selected")
            }
            document.getElementById(m+"-btn").onclick = () => {
                document.getElementById(this.projMode+'-btn').classList.toggle("selected", false)
                if (this.projMode !== PROJ.PSPEC) {
                    document.getElementById(this.projMode+'-sec').childNodes.forEach((child) => {
                        child.hidden = true
                    })
                } else {
                    document.getElementById(this.projMode+'-sec').hidden = true
                }

                this.projMode = m
                if (m !== PROJ.PSPEC) {
                    document.getElementById(m+'-sec').childNodes.forEach((child) => {
                        child.hidden = false
                    })
                } else {
                    document.getElementById(m+'-sec').hidden = false
                }
                document.getElementById(m+'-btn').classList.toggle("selected")
                this.applyProjection();
            }
        })

        confirmations.forEach((k) => {
            document.getElementById(k+'-btn').hidden = true
        })
        document.getElementById("apply-btn").onclick = () => {
            this.applyTransformation(true)
            this.initTransforms()
        }
        document.getElementById("cancel-btn").onclick = () => {
            this.initTransforms()
            this.applyTransformation(true)
        }
        document.getElementById("reset-btn").onclick = () => {
            document.getElementById(this.projMode+'-btn').classList.toggle("selected")
            this.projMode = PROJ.ORTHO
            this.initProjection()
            this.applyProjection()
            this.resetProjs()
            this.resetCam()
        }
        document.getElementById("shading-btn").hidden = true
        document.getElementById("shading-btn").onclick = () => {
            if (this.selected !== null) {
                this.shading[this.selected] = !this.shading[this.selected]
            }
            document.getElementById("shading-btn").classList.toggle("selected-on")
            this.drawObjects(this.main.gl, this.main.shaderProgram)
        }
    }

    applyTransformation(perm=false) {
        // translate to origin
        this.objects[this.selected]
            .resetViewMatrix()
            .addTranslation(neg(this.objects[this.selected].mid))

        // apply transformation
        if (this.mode == MODE.ROTATE) {
            this.objects[this.selected]
                .addRotateX(this.transform["rotate"][0])
                .addRotateY(this.transform["rotate"][1])
                .addRotateZ(this.transform["rotate"][2])
        } else if (this.mode == MODE.TRANSLATE) {
            this.objects[this.selected].addTranslation(this.transform["translate"])
        } else {
            this.objects[this.selected].addScaling(this.transform["scale"])
        }

        // translate back
        this.objects[this.selected].addTranslation(this.objects[this.selected].mid)

        // apply it to the object so it's permanent
        if (perm) {
            this.objects[this.selected].applyTransformation()
            this.resetTrf()
            document.getElementById(this.mode+'-btn').classList.toggle("selected", false)
            this.mode = MODE.NONE

            confirmations.forEach((k) => {
                document.getElementById(k+'-btn').hidden = true
            })
        }

        // draw changes
        this.drawObjects(this.main.gl, this.main.shaderProgram)
    }

    applyProjection() {
        // get projection matrix
        let projectionMatrix
        if (this.projMode === PROJ.ORTHO) { 
            projectionMatrix = getOrthoMat(
                this.projection["left"],
                this.projection["right"],
                this.projection["bottom"],
                this.projection["top"],
                this.projection["near"],
                this.projection["far"]
            )
        } else if (this.projMode === PROJ.PSPEC) {
            projectionMatrix = getPerspectiveMat(
                this.projection["fovy"],
                this.projection["aspect"],
                this.projection["near"],
                this.projection["far"]
            )
        } else {
            projectionMatrix = getObliqueMat(
                this.projection["left"],
                this.projection["right"],
                this.projection["bottom"],
                this.projection["top"],
                this.projection["near"],
                this.projection["far"],
                this.projection["xz-deg"],
                this.projection["yz-deg"]
            )
        }
        // send projection matrix to gpu
        setMatTransform(this.main.gl, this.main.shaderProgram, "u_Projection", projectionMatrix)
        // draw changes
        this.drawObjects(this.main.gl, this.main.shaderProgram)
    }

    applyCamConfig() {
        // get camera model matrix
        let matCam = getIdentityMat()
        matCam = matMult(getTMat([0, 0, -this.camConfig["radius"]]), matCam)
        matCam = matMult(matCam, getRxMat(this.camConfig["xRot"]))
        matCam = matMult(matCam, getRyMat(this.camConfig["yRot"]))
        matCam = matMult(matCam, getRzMat(this.camConfig["zRot"]))
        // send model matrix to gpu
        setMatTransform(this.main.gl, this.main.shaderProgram, "u_Model", matCam)
        this.main.ModelMatrix = matCam
        // draw changes
        this.drawObjects(this.main.gl, this.main.shaderProgram)
    }

    resetTrf() {
        modes.forEach((k) => {
            document.getElementById(k+"-sec").hidden = true
        })
        modes.slice(0, 2).forEach((k) => {
            for (let i = 0; i < 3; i++) {
                document.getElementById(k+"-"+i).value = 0
            }
        })
        document.getElementById("scale").value = 0
    }

    resetProjs() {
        proj.forEach((m) => {
            let t
            if (m === PROJ.OBLIQUE) {
                document.getElementById(m+'-sec').childNodes.forEach((child) => {
                    child.hidden = true
                })
                t = ["left", "right", "top", "bottom", "near", "far", "xz", "yz"]
            } else if (m === PROJ.PSPEC) {
                document.getElementById(m+'-sec').hidden = true
                t = ["fovy", "aspect", "near", "far"]
            } else {
                document.getElementById(m+'-sec').childNodes.forEach((child) => {
                    child.hidden = false
                })
                document.getElementById(m+'-btn').classList.toggle("selected")
                t = ["left", "right", "top", "bottom", "near", "far"]
            }
            t.forEach((e) => {
                let val
                if (["xz", "yz"].includes(e)) {
                    val = this.projection[e+"-deg"]
                } else {
                    val = this.projection[e]
                }
                document.getElementById(m+'-'+e).value = val
            })
        })

        document.getElementById("scale").value = 0

    }

    resetCam() {
        this.initCamConfig()
        this.applyCamConfig()
        document.getElementById("translate-cam").value = 0
        document.getElementById("rotate-cam0").value = 0
        document.getElementById("rotate-cam1").value = 0
        document.getElementById("rotate-cam2").value = 0
    }

    initInputs() {
        modes.forEach((k) => {
            document.getElementById(k+"-sec").hidden = true
        })

        modes.slice(0, 2).forEach((k) => {
            for (let i = 0; i < 3; i++) {
                document.getElementById(k+"-"+i).oninput = (e) => {
                    this.transform[k][i] = parseFloat(e.target.value)
                    this.applyTransformation()
                }
            }
        })

        document.getElementById("scale").oninput = (e) => {
            this.transform["scale"] = parseFloat(e.target.value)
            this.applyTransformation()
        }

        proj.forEach((p) => {
            document.getElementById(p+'-near').oninput = (e) => {
                this.projection["near"] = parseFloat(e.target.value)
                this.applyProjection()
            }
            document.getElementById(p+'-far').oninput = (e) => {
                this.projection["far"] = parseFloat(e.target.value)
                this.applyProjection()
            }
            if (p !== PROJ.PSPEC) {
                document.getElementById(p+'-left').oninput = (e) => {
                    this.projection["left"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
                document.getElementById(p+'-right').oninput = (e) => {
                    this.projection["right"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
                document.getElementById(p+'-bottom').oninput = (e) => {
                    this.projection["bottom"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
                document.getElementById(p+'-top').oninput = (e) => {
                    this.projection["top"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
            } else {
                document.getElementById(p+'-fovy').oninput = (e) => {
                    this.projection["fovy"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
                document.getElementById(p+'-aspect').oninput = (e) => {
                    this.projection["aspect"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
            }
            if (p === PROJ.OBLIQUE) {
                document.getElementById(p+'-xz').oninput = (e) => {
                    this.projection["xz-deg"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
                document.getElementById(p+'-yz').oninput = (e) => {
                    this.projection["yz-deg"] = parseFloat(e.target.value)
                    this.applyProjection()
                }
            }
        })

        document.getElementById("translate-cam").oninput = (e) => {
            this.camConfig["radius"] = parseFloat(e.target.value)
            this.applyCamConfig()
        }

        document.getElementById("rotate-cam0").oninput = (e) => {
            this.camConfig["xRot"] = parseFloat(e.target.value)
            this.applyCamConfig()
        }

        document.getElementById("rotate-cam1").oninput = (e) => {
            this.camConfig["yRot"] = parseFloat(e.target.value)
            this.applyCamConfig()
        }

        document.getElementById("rotate-cam2").oninput = (e) => {
            this.camConfig["zRot"] = parseFloat(e.target.value)
            this.applyCamConfig()
        }
    }

    __loadFromFile(file) {
        try {
          const reader = new FileReader(file)
          reader.addEventListener('load', (e) => {
            this.initObjects(JSON.parse(e.target.result))
          })
          reader.readAsText(file)
        } catch {
          console.log('Please use valid model file.')
        }
    }

    _resetTransform() {
        this.initTransforms()
        this.resetTrf()
        if (this.mode)
            document.getElementById(this.mode+'-btn').classList.toggle("selected", false)

        this.mode = MODE.NONE
        this.selected = null
        modes.forEach((k) => {
            document.getElementById(k+'-btn').hidden = true
        })
        modes.forEach((k) => {
            document.getElementById(k+'-sec').hidden = true
        })
        confirmations.forEach((k) => {
            document.getElementById(k+'-btn').hidden = true
        })
    }

    _initObjectButtons() {
        document.getElementById('btn-container').innerHTML = ""
        for (let i = 0; i < this.objects.length; i++) {
            var button = document.createElement("button")
            button.textContent = "Object "+i
            document.getElementById('btn-container').appendChild(button)
            button.onclick = () => {
                if (this.selected !== null) {
                    document.getElementById('btn-container')
                        .children[this.selected]
                        .classList.toggle("selected", false)
                } else {
                    modes.forEach((k) => {
                        document.getElementById(k+'-btn').hidden = false
                    })
                    document.getElementById('shading-btn').hidden = false
                }
                this.pointToObject(i)
                document.getElementById('btn-container').children[i].classList.toggle("selected")

            }
        }
    }

    initObjects(data) {
        this.objects = []
        data.forEach((obj) => {
            if (obj["type"] == "triangular_pyramid") {
                this.objects.push(new HollowPyramid(obj))
            } else if (obj["type"] == "hexagonal_prism") {
                this.objects.push(new HollowHexagonPrism(obj))
            } else if (obj["type"] == "cube")  {
                this.objects.push(new HollowCube(obj))
            }
            this.shading.push(true)
        })
        this._resetTransform()
        this._initObjectButtons()
        this.drawObjects(this.main.gl, this.main.shaderProgram)
    }

    drawObjects(gl, shaderProgram) {
        gl.clearColor(1.0, 1.0, 1.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        this.objects.forEach((obj, i) => {
            gl.uniform1f(gl.getUniformLocation(shaderProgram, "u_shading"), this.shading[i])
            obj.draw(gl, shaderProgram)
        })
    }

    pointToObject(idx) {
        // auto cancel transformation
        if (this.selected != idx && this.mode) {
            this.initTransforms()
            this.resetTrf()

            this.objects[this.selected].resetViewMatrix()
            this.drawObjects(this.main.gl, this.main.shaderProgram)

            document.getElementById(this.mode+'-btn').classList.toggle("selected", false)
            this.mode = MODE.NONE
            confirmations.forEach((k) => {
                document.getElementById(k+'-btn').hidden = true
            })
        }
        document.getElementById("shading-btn").classList.toggle("selected-on", this.shading[idx])
        this.selected = idx
    }

}

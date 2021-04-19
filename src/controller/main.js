const modes = ["rotate", "translate"];
const proj = ["ortho", "pspec", "oblique"];
const confirmations = ["apply", "cancel"];

class Observer {
  constructor() {
    observer = this;
    this.selected = null;
    this.selectedIdx = null;
    this.animationLoop = null;
    this.instances = [new MinecraftPigModel(), new MinecraftTurtleModel(), new R3D3()];
    this.objects = [];
    this.mode = MODE.NONE;
    this.projMode = PROJ.NONE;
    this.frames = 0;

    // TODO: DELETE LATER
    // model saver
    // var pig = new MinecraftPigModel()
    // pig.addTranslation([-0.5, 0, 0])
    // pig.applyTransformation()
    // var turtle = new MinecraftTurtleModel()
    // turtle.addTranslation([0.5, 0, 0])
    // turtle.applyTransformation()
    // var a = document.createElement("a");
    // a.download = "model.json";
    // a.href = window.URL.createObjectURL(
    //   new Blob([JSON.stringify([pig.parse(), turtle.parse()], null, 2)], {
    //     type: "application/json",
    //   })
    // );
    // a.click();
    // var a = document.createElement("a");
    // a.download = "model.json";
    // a.href = window.URL.createObjectURL(
    //   new Blob([JSON.stringify([new MinecraftTurtleModel().parse()], null, 2)], {
    //     type: "application/json",
    //   })
    // );
    // a.click();
    // var a = document.createElement("a");
    // a.download = "model.json";
    // a.href = window.URL.createObjectURL(
    //   new Blob([JSON.stringify([new MinecraftPigModel().parse()], null, 2)], {
    //     type: "application/json",
    //   })
    // );
    // a.click();

    this.initCamConfig();
    this.initProjection();
    this.initInputs();
    this.initButtons();
    this.initUploader();

    this.main = new MainView(this);
    textures["pig_skin"] = configureTexture(
      this.main.gl,
      "https://live.staticflickr.com/65535/51100246183_ce643b82b0_z.jpg"
    );
    textures["turtle_skin"] = configureTexture(
      this.main.gl,
      "https://live.staticflickr.com/65535/51116334840_4d1d06d798_m.jpg"
    );
    textures["wallpaper"] = environmentTexture(
      this.main.gl,
      "https://live.staticflickr.com/65535/51121219693_d9b57aa314_n.jpg"
    );
    textures["depth"] = configureTexture(
      this.main.gl,
      "https://live.staticflickr.com/65535/51115539946_58d2df30c1_m.jpg"
    );

    this.drawObjects(this.main.gl, this.main.shaderProgram);
    // setTimeout(() => this.drawObjects(this.main.gl, this.main.shaderProgram), 1000)
    // this.applyProjection()
  }

  initCamConfig() {
    this.camConfig = {
      radius: 0,
      xRot: 0,
      yRot: 0,
      zRot: 0,
    };
  }

  initProjection() {
    this.projection = {
      left: -1,
      right: 1,
      bottom: -1,
      top: 1,
      near: 0.01,
      far: 100,
      "xz-deg": 75,
      "yz-deg": 75,
      fovy: 45,
      aspect: 1,
    };
  }

  initTransforms() {
    this.transform = JSON.parse(JSON.stringify(this.selected.state));
  }

  initUploader() {
    var fileUploader = document.getElementById("file-uploader");
    fileUploader.onchange = (e) => {
      this.__loadFromFile(e.target.files[0]);
      fileUploader.value = "";
    };
  }

  initButtons() {
    document.getElementById("while-animate-btn").disabled = true;
    document.getElementById("while-animate-btn").onclick = () => {
      if (
        document.getElementById("while-animate-btn").innerHTML ==
        "Pause Animation"
      ) {
        document.getElementById("while-animate-btn").innerHTML =
          "Continue Animation";
        clearInterval(this.animationLoop);
      } else {
        this.animateObjects(this.main.gl, this.main.shaderProgram, false);
        document.getElementById("while-animate-btn").innerHTML =
          "Pause Animation";
      }
    };
    document.getElementById("animate-btn").onclick = () => {
      if (document.getElementById("animate-btn").innerHTML == "Start Animate") {
        this.frames = 0;
        this.main.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.main.gl.clear(
          this.main.gl.COLOR_BUFFER_BIT | this.main.gl.DEPTH_BUFFER_BIT
        );
        this.animateObjects(this.main.gl, this.main.shaderProgram);
        document.getElementById("while-animate-btn").disabled = false;
        document.getElementById("while-animate-btn").innerHTML =
          "Pause Animation";
        document.getElementById("animate-btn").innerHTML = "Stop Animate";
      } else {
        document.getElementById("while-animate-btn").disabled = true;
        document.getElementById("while-animate-btn").innerHTML =
          "Continue Animation";
        document.getElementById("animate-btn").innerHTML = "Start Animate";
        document.getElementById("model-transformation").style.display =
          "initial";
        document.getElementById("animate-btn").disabled = false;
        clearInterval(this.animationLoop);
        this.objects.forEach((obj) => {
          obj.reset();
        });
        this.cleanupAnimation();
        if (this.selected) {
          this.resetTrf();
          this.selected.resetState();

          if (this.mode)
            document
              .getElementById(this.mode + "-btn")
              .classList.toggle("selected", false);
          this.mode = MODE.NONE;
        }
        this.drawObjects(this.main.gl, this.main.shaderProgram);
      }
    };

    modes.forEach((k) => {
      document.getElementById(k + "-btn").hidden = true;
      document.getElementById(k + "-btn").onclick = () => {
        document.getElementById(k + "-sec").hidden = false;
        this.initTransforms();
        this.resetTrf();
        if (this.selected.bound[k].activation.includes(true)) {
          this.selected.bound[k].activation.forEach((val, idx) => {
            let input = document.getElementById(k + "-input-" + (idx + 1));
            input.hidden = !val;
            if (val) {
              input.children[2].min = this.selected.bound[k].range[idx][0];
              input.children[2].max = this.selected.bound[k].range[idx][1];
              input.children[2].value = this.selected.state[k][idx];
              input.children[2].step = this.selected.bound[k].range[idx][2];
            }
          });
        }
        if (this.mode !== null) {
          document
            .getElementById(this.mode + "-btn")
            .classList.toggle("selected", false);
          document.getElementById(this.mode + "-sec").hidden = true;
        }
        this.mode = k;
        document.getElementById(k + "-sec").hidden = false;
        document.getElementById(k + "-btn").classList.toggle("selected");
        this.applyTransformation();

        confirmations.forEach((k) => {
          document.getElementById(k + "-btn").hidden = false;
        });
      };
    });

    proj.forEach((m) => {
      if (m !== PROJ.PSPEC) {
        document.getElementById(m + "-sec").childNodes.forEach((child) => {
          child.hidden = true;
        });
      } else {
        document.getElementById(m + "-sec").hidden = true;
      }
      document.getElementById(m + "-btn").onclick = (applied = true) => {
        if (this.projMode) {
          document
            .getElementById(this.projMode + "-btn")
            .classList.toggle("selected", false);
          if (this.projMode !== PROJ.PSPEC) {
            document
              .getElementById(this.projMode + "-sec")
              .childNodes.forEach((child) => {
                child.hidden = true;
              });
          } else {
            document.getElementById(this.projMode + "-sec").hidden = true;
          }
        }

        this.projMode = m;
        if (m !== PROJ.PSPEC) {
          document.getElementById(m + "-sec").childNodes.forEach((child) => {
            child.hidden = false;
          });
        } else {
          document.getElementById(m + "-sec").hidden = false;
        }
        document.getElementById(m + "-btn").classList.toggle("selected");
        this.applyProjection(applied);
      };
    });

    confirmations.forEach((k) => {
      document.getElementById(k + "-btn").hidden = true;
    });
    document.getElementById("apply-btn").onclick = () => {
      this.applyTransformation(true);
      this.selected.state = this.transform;
      this.initTransforms();
    };
    document.getElementById("cancel-btn").onclick = () => {
      this.initTransforms();
      this.applyTransformation(true);
    };
    document.getElementById("reset-btn").onclick = () => {
      if (this.projMode)
        document
          .getElementById(this.projMode + "-btn")
          .classList.toggle("selected");
      this.projMode = PROJ.NONE;
      this.initProjection();
      this.applyProjection();
      this.resetProjs();
      this.resetCam();
    };
    document.getElementById("shading-btn").hidden = true;
    document.getElementById("shading-btn").onclick = () => {
      if (this.selected !== null) {
        this.selected.shading = !this.selected.shading;
      }
      document.getElementById("shading-btn").classList.toggle("selected-on");
      this.drawObjects(this.main.gl, this.main.shaderProgram);
    };
    document.getElementById("texture-btn").hidden = true;
    document.getElementById("texture-btn").onclick = () => {
      if (this.selected !== null) {
        this.selected.texture = !this.selected.texture;
      }
      document.getElementById("texture-btn").classList.toggle("selected-on");
      this.drawObjects(this.main.gl, this.main.shaderProgram);
    };
  }

  applyTransformation(perm = false) {
    // translate to origin
    this.selected.resetTransformMatrix().addTranslation(neg(this.selected.mid));

    // apply transformation
    this.selected
      .addRotateX(this.transform["rotate"][0])
      .addRotateY(this.transform["rotate"][1])
      .addRotateZ(this.transform["rotate"][2])
      .addTranslation(this.transform["translate"]);

    // translate back
    this.selected.addTranslation(this.selected.mid);

    // apply it to the object so it's permanent
    if (perm) {
      this.resetTrf();
      document
        .getElementById(this.mode + "-btn")
        .classList.toggle("selected", false);
      this.mode = MODE.NONE;
    }

    // draw changes
    this.drawObjects(this.main.gl, this.main.shaderProgram);
  }

  applyProjection(applied = true) {
    // get projection matrix
    let projectionMatrix = I;
    if (this.projMode === PROJ.ORTHO) {
      projectionMatrix = getOrthoMat(
        this.projection["left"],
        this.projection["right"],
        this.projection["bottom"],
        this.projection["top"],
        this.projection["near"],
        this.projection["far"]
      );
    } else if (this.projMode === PROJ.PSPEC) {
      projectionMatrix = getPerspectiveMat(
        this.projection["fovy"],
        this.projection["aspect"],
        this.projection["near"],
        this.projection["far"]
      );
    } else if (this.projMode === PROJ.OBLIQUE) {
      projectionMatrix = getObliqueMat(
        this.projection["left"],
        this.projection["right"],
        this.projection["bottom"],
        this.projection["top"],
        this.projection["near"],
        this.projection["far"],
        this.projection["xz-deg"],
        this.projection["yz-deg"]
      );
    }
    // send projection matrix to gpu
    setMatTransform(
      this.main.gl,
      this.main.shaderProgram,
      "u_Projection",
      projectionMatrix
    );
    // draw changes
    if (applied) this.drawObjects(this.main.gl, this.main.shaderProgram);
  }

  applyCamConfig(applied = true) {
    // get camera model matrix
    let matCam = getIdentityMat();
    matCam = matMult(getTMat([0, 0, -this.camConfig["radius"]]), matCam);
    matCam = matMult(matCam, getRxMat(this.camConfig["xRot"]));
    matCam = matMult(matCam, getRyMat(this.camConfig["yRot"]));
    matCam = matMult(matCam, getRzMat(this.camConfig["zRot"]));
    // send model matrix to gpu
    setMatTransform(this.main.gl, this.main.shaderProgram, "u_Model", matCam);
    this.main.ModelMatrix = matCam;
    // draw changes
    if (applied) this.drawObjects(this.main.gl, this.main.shaderProgram);
  }

  resetTrf() {
    modes.forEach((k) => {
      document.getElementById(k + "-sec").hidden = true;
    });
    confirmations.forEach((k) => {
      document.getElementById(k + "-btn").hidden = true;
    });
  }

  resetProjs() {
    proj.forEach((m) => {
      let t;
      if (m === PROJ.OBLIQUE) {
        document.getElementById(m + "-sec").childNodes.forEach((child) => {
          child.hidden = true;
        });
        t = ["left", "right", "top", "bottom", "near", "far", "xz", "yz"];
      } else if (m === PROJ.PSPEC) {
        document.getElementById(m + "-sec").hidden = true;
        t = ["fovy", "aspect", "near", "far"];
      } else {
        document.getElementById(m + "-sec").childNodes.forEach((child) => {
          child.hidden = true;
        });
        t = ["left", "right", "top", "bottom", "near", "far"];
      }
      t.forEach((e) => {
        let val;
        if (["xz", "yz"].includes(e)) {
          val = this.projection[e + "-deg"];
        } else {
          val = this.projection[e];
        }
        document.getElementById(m + "-" + e).value = val;
      });
    });
  }

  resetCam() {
    this.initCamConfig();
    this.applyCamConfig();
    document.getElementById("translate-cam").value = 0;
    document.getElementById("rotate-cam0").value = 0;
    document.getElementById("rotate-cam1").value = 0;
    document.getElementById("rotate-cam2").value = 0;
  }

  initInputs() {
    modes.forEach((k) => {
      document.getElementById(k + "-sec").hidden = true;
    });

    modes.slice(0, 2).forEach((k) => {
      for (let i = 0; i < 3; i++) {
        document.getElementById(k + "-" + i).oninput = (e) => {
          this.transform[k][i] = parseFloat(e.target.value);
          this.applyTransformation();
        };
      }
    });

    proj.forEach((p) => {
      document.getElementById(p + "-near").oninput = (e) => {
        this.projection["near"] = parseFloat(e.target.value);
        this.applyProjection();
      };
      document.getElementById(p + "-far").oninput = (e) => {
        this.projection["far"] = parseFloat(e.target.value);
        this.applyProjection();
      };
      if (p !== PROJ.PSPEC) {
        document.getElementById(p + "-left").oninput = (e) => {
          this.projection["left"] = parseFloat(e.target.value);
          this.applyProjection();
        };
        document.getElementById(p + "-right").oninput = (e) => {
          this.projection["right"] = parseFloat(e.target.value);
          this.applyProjection();
        };
        document.getElementById(p + "-bottom").oninput = (e) => {
          this.projection["bottom"] = parseFloat(e.target.value);
          this.applyProjection();
        };
        document.getElementById(p + "-top").oninput = (e) => {
          this.projection["top"] = parseFloat(e.target.value);
          this.applyProjection();
        };
      } else {
        document.getElementById(p + "-fovy").oninput = (e) => {
          this.projection["fovy"] = parseFloat(e.target.value);
          this.applyProjection();
        };
        document.getElementById(p + "-aspect").oninput = (e) => {
          this.projection["aspect"] = parseFloat(e.target.value);
          this.applyProjection();
        };
      }
      if (p === PROJ.OBLIQUE) {
        document.getElementById(p + "-xz").oninput = (e) => {
          this.projection["xz-deg"] = parseFloat(e.target.value);
          this.applyProjection();
        };
        document.getElementById(p + "-yz").oninput = (e) => {
          this.projection["yz-deg"] = parseFloat(e.target.value);
          this.applyProjection();
        };
      }
    });

    document.getElementById("translate-cam").oninput = (e) => {
      this.camConfig["radius"] = parseFloat(e.target.value);
      this.applyCamConfig();
    };

    document.getElementById("rotate-cam0").oninput = (e) => {
      this.camConfig["xRot"] = parseFloat(e.target.value);
      this.applyCamConfig();
    };

    document.getElementById("rotate-cam1").oninput = (e) => {
      this.camConfig["yRot"] = parseFloat(e.target.value);
      this.applyCamConfig();
    };

    document.getElementById("rotate-cam2").oninput = (e) => {
      this.camConfig["zRot"] = parseFloat(e.target.value);
      this.applyCamConfig();
    };
  }

  __loadFromFile(file) {
    try {
      const reader = new FileReader(file);
      reader.addEventListener("load", (e) => {
        this.initObjects(JSON.parse(e.target.result));
      });
      reader.readAsText(file);
    } catch {
      console.log("Please use valid model file.");
    }
  }

  _initObjectButtons() {
    document.getElementById("btn-container").innerHTML = "";
    for (let i = 0; i < this.objects.length; i++) {
      var button = document.createElement("button");
      button.textContent = this.objects[i].id;
      document.getElementById("btn-container").appendChild(button);
      button.onclick = () => {
        document.getElementById("btn-container2").innerHTML = "";
        this.objects[i].PARTS.forEach((k, j) => {
          if (this.selectedIdx) {
            document
              .getElementById("btn-container")
              .children[this.selectedIdx].classList.toggle("selected", false);
          }
          var button2 = document.createElement("button");
          button2.textContent = k;
          document.getElementById("btn-container2").appendChild(button2);
          this.selectedIdx = i;
          document
            .getElementById("btn-container")
            .children[this.selectedIdx].classList.toggle("selected", true);
          document.getElementById("model-transformation").style.display =
            "none";

          button2.onclick = () => {
            document.getElementById("model-transformation").style.display =
              "initial";
            this.resetTrf();
            let obj = this.objects[i].parts[k];
            if (this.selected !== null) {
              var children = document.getElementById("btn-container2").children;
              for (let cidx = 0; cidx < children.length; cidx++) {
                document
                  .getElementById("btn-container2")
                  .children[cidx].classList.toggle("selected", false);
              }
            }
            modes.forEach((mode) => {
              if (
                obj.bound[mode].activation.includes(true) &&
                this.animationLoop === null
              ) {
                document.getElementById(mode + "-btn").hidden = false;
                document
                  .getElementById(mode + "-btn")
                  .classList.toggle("selected", false);
              } else {
                document.getElementById(mode + "-btn").hidden = true;
              }
            });
            document.getElementById("shading-btn").hidden = false;
            document.getElementById("texture-btn").hidden = false;
            this.pointToObject(obj);
            document
              .getElementById("btn-container2")
              .children[j].classList.toggle("selected");
          };
        });
      };
    }
  }

  initObjects(data) {
    this.objects = [];
    data.forEach((obj) => {
      if (obj["id"].includes("Pig")) {
        this.objects.push(new MinecraftPigModel(obj));
      } else if (obj["id"].includes("Turtle")) {
        this.objects.push(new MinecraftTurtleModel(obj));
      }
      if (obj["id"].includes("r3d3")) {
        this.objects.push(new R3D3(obj))        
      }
    });
    this._initObjectButtons();
    this.drawObjects(this.main.gl, this.main.shaderProgram);
  }

  drawObjects(gl, shaderProgram) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.objects.forEach((obj, i) => {
      obj.draw(gl, shaderProgram);
    });
  }

  initAnimation() {
    this.temp = {
      radius: this.camConfig["radius"],
      yRot: this.camConfig["yRot"],
    };
    document.getElementById("pspec-btn").onclick(false);
    document.getElementById("translate-cam").value = 7;
    document.getElementById("rotate-cam1").value = 350;
    this.camConfig["radius"] = 7;
    this.camConfig["yRot"] = 350;
    this.applyCamConfig(false);
    this.applyProjection(false);
  }

  cleanupAnimation() {
    document.getElementById("translate-cam").value = this.temp.radius;
    document.getElementById("rotate-cam1").value = this.temp.yRot;
    this.camConfig["radius"] = this.temp.radius;
    this.camConfig["yRot"] = this.temp.yRot;

    if (this.projMode)
      document
        .getElementById(this.projMode + "-btn")
        .classList.toggle("selected", false);
    this.projMode = PROJ.NONE;
    this.applyCamConfig();
    this.applyProjection();
    this.resetProjs();
    this.animationLoop = null;
    if (this.objects.length != 0) {
      document.getElementById("btn-container").children[0].onclick();
    }
  }

  animateObjects(gl, shaderProgram, init = true) {
    if (this.objects.length != 0) {
      document.getElementById("btn-container").children[0].onclick();
    }

    if (init) this.initAnimation();
    this.animationLoop = setInterval(() => {
      gl.clearColor(1.0, 1.0, 1.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      this.objects.forEach((obj) => {
        obj.animate(gl, shaderProgram, this.frames);
      });
      this.frames++;
      if (this.frames == FRAMES + 1) {
        this.frames = 0;
      }
    }, 100);
  }

  pointToObject(obj) {
    // auto cancel transformation
    if (this.selected != obj && this.mode) {
      this.resetTrf();
      this.initTransforms();
      this.applyTransformation();
      this.drawObjects(this.main.gl, this.main.shaderProgram);

      document
        .getElementById(this.mode + "-btn")
        .classList.toggle("selected", false);
      this.mode = MODE.NONE;
    }
    document
      .getElementById("shading-btn")
      .classList.toggle("selected-on", obj.shading);
    document
      .getElementById("texture-btn")
      .classList.toggle("selected-on", obj.texture);
    this.selected = obj;
    this.initTransforms();
  }
}

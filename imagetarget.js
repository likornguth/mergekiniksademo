const imageTargetPipelineModule = () => {
  // instantiate assets
  const modelFile = require('./assets/heart.gltf')
  const videoFile = require('./assets/Award_Video.mp4')
  const videoFile2 = require('./assets/video2.mp4')
  const heartofpc = require('./assets/newheartofpc.png')
  const website = require('./assets/newwebsite.png')
  const popup1 = require('./assets/notepadflat.png')
  const popup2 = require('./assets/dosinginfo.jpg')
  const pamphlet = require('./assets/newpamphlet.png')
  const pamphlet2 = require('./assets/pamphletopen.png')
  const ipad = require('./assets/newipad.png')
  const bottle = require('./assets/bottle.png')
  const mask = require('./assets/mask-01.png')
  // const mask2 = require('./assets/getready.png')


  // temp global variables keep track of meshes/geometries that change texture or size on touch events
  let materialtemp = new THREE.MeshBasicMaterial()
  let geometrytemp = new THREE.PlaneGeometry(1, 0.75)

  const loader = new THREE.GLTFLoader()  // This comes from GLTFLoader.js.
  const raycaster = new THREE.Raycaster()  // Instantiate raycaster for touch event
  const tapPosition = new THREE.Vector2()  // x y coords of touch event
  const objects = []
  let scanned = 0
  let renderer
  let img; let mesh
  let model
  let a1mesh; let a2mesh; let a3mesh; let a4mesh; let a5mesh; let a6mesh
  let vein1; let vein2; let vein3; let vein4; let vein5; let vein6
  let popMesh; let popMesh2; let maskMesh; let maskMesh2
  let meshGroup = []
  let video; let
    videoObj

  let video2; let
    videoObj2

  // array of camera feed shaders, only the last one is used (purple)
  const fragmentShaders = [
    ` precision mediump float;  // Just the camera feed.
    varying vec2 texUv;
    uniform sampler2D sampler;
    void main() { gl_FragColor = texture2D(sampler, texUv); }`,
    ` precision mediump float;  // Black and white.
    varying vec2 texUv;
    uniform sampler2D sampler;
    void main() {
      vec4 c = texture2D(sampler, texUv);
      gl_FragColor = vec4(vec3(dot(c.rgb, vec3(0.299, 0.587, 0.114))), c.a);
    }`,
    ` precision mediump float;  // green.
    varying vec2 texUv;
    uniform sampler2D sampler;
    void main() {
      vec4 c = texture2D(sampler, texUv);
      float y = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      vec3 p = vec3(0.4, 0, 0.5);
      vec3 rgb = y < .25 ? (y * 4.0) * p : ((y - .25) * 1.333) * (vec3(1.0, 1.0, 1.0) - p) + p;
      gl_FragColor = vec4(rgb, c.a);
    }`,
  ]

  // Populates some object into an XR scene and sets the initial camera position. The scene and
  // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
  const initXrScene = ({scene, camera}) => {
    const popGeom = new THREE.PlaneGeometry(0.5 * 3.59, 0.5 * 4.56)  // notepad geometry
    const popGeom2 = new THREE.PlaneGeometry(0.15 * 5.22, 0.15 * 6.48)  // open notepad popup
    const popTxt = new THREE.TextureLoader().load(popup1)
    const popMat = new THREE.MeshBasicMaterial({map: popTxt})
    const popMat2 = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(popup2)})
    popMesh = new THREE.Mesh(popGeom, popMat)
    popMesh2 = new THREE.Mesh(popGeom2, popMat2)
    popMat.transparent = true
    popMesh2.visible = false
    popMesh2.position.set(0, 0, -1)
    camera.add(popMesh2)

    // Kiniksa logo at start screen
    const maskGeom = new THREE.PlaneGeometry(0.25 * 3.125, 0.25 * 5.56)
    const maskMat = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(mask)})
    maskMat.transparent = true
    maskMat.opacity = 0.80

    maskMesh = new THREE.Mesh(maskGeom, maskMat)

    maskMesh.position.set(0, 0, -1)

    camera.add(maskMesh)

    // create the video element
    video = document.createElement('video')
    video.src = videoFile
    video.setAttribute('preload', 'auto')
    video.setAttribute('loop', '')
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.format = THREE.RGBFormat
    texture.crossOrigin = 'anonymous'

    videoObj = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.75),
      new THREE.MeshBasicMaterial({map: texture})
    )
    // Hide video until image target is detected.
    videoObj.visible = false
    scene.add(videoObj)
    video.load()

    // create second video element (only starts when asset 3 is touched)
    video2 = document.createElement('video')
    video2.src = videoFile2
    video2.setAttribute('preload', 'auto')
    video2.setAttribute('loop', '')
    video2.setAttribute('muted', '')
    // video2.setAttribute('playsinline', '')
    video2.setAttribute('webkit-playsinline', '')

    const texture2 = new THREE.VideoTexture(video2)
    texture2.minFilter = THREE.LinearFilter
    texture2.magFilter = THREE.LinearFilter
    texture2.format = THREE.RGBFormat
    texture2.crossOrigin = 'anonymous'

    videoObj2 = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.75),
      new THREE.MeshBasicMaterial({map: texture2})
    )
    // Hide video until touch event is detected.
    videoObj2.visible = false
    videoObj2.position.set(0, 0, -1)
    camera.add(videoObj2)
    video2.load()

    scene.add(camera)

    // create asset meshes for all 6 floating objects
    const asset1 = new THREE.PlaneGeometry(2.74, 1.525)
    const bottlegeom = new THREE.PlaneGeometry(6, 3)
    const a1material = new THREE.MeshBasicMaterial({map: popTxt, transparent: true})
    const a2material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(ipad), transparent: true})
    const a3material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(heartofpc), transparent: true})
    const a6material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(bottle), transparent: true})
    const a5material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(pamphlet), transparent: true})
    const a4material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(website), transparent: true})

    a1mesh = new THREE.Mesh(popGeom, a1material)  // notepad
    a2mesh = new THREE.Mesh(asset1.clone().scale(1.25, 1.50, 1.25), a2material)  // ipad
    a3mesh = new THREE.Mesh(asset1.clone().scale(1, 1.25, 1), a3material)  // video
    a4mesh = new THREE.Mesh(asset1.clone().scale(1, 1.25, 1), a4material)  // website
    a6mesh = new THREE.Mesh(bottlegeom, a6material)  // bottle
    a5mesh = new THREE.Mesh(asset1.clone().scale(1.25, 1.25, 1.25), a5material)  // pamphlet

    // names help decide what action to execute on touch event
    a1mesh.name = 'a1'
    a2mesh.name = 'a2'
    a3mesh.name = 'a3'
    a4mesh.name = 'a4'
    a5mesh.name = 'a5'
    a6mesh.name = 'a6'

    a1mesh.position.set(-4, 2, 0)  // centermost on left
    a2mesh.position.set(4, 2, 0)  // centermost on right
    a3mesh.position.set(-7.25, 3, 2.75)  // furthest left
    a4mesh.position.set(7.25, 3, 2.75)  // furthest right
    a5mesh.position.set(-5, 6, 1.25)  // upper left
    a6mesh.position.set(5, 6, 1.25)  // upper right

    // meshGroup is the group of ALL items in the scene, including untouchable veins
    meshGroup = new THREE.Group()
    // objects is the array of all interactive elements that should trigger events when the raycaster intersects with them
    // objects only contains the asset meshes
    objects.push(a1mesh, a2mesh, a3mesh, a4mesh, a5mesh, a6mesh)
    meshGroup.add(a1mesh, a2mesh, a3mesh, a4mesh, a5mesh, a6mesh)

    // veins fom heart to assets are quadratic bezier curves
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 4, -1.8),
      new THREE.Vector3(-1, 6, -3.5),
      a1mesh.position
    )
    const cgeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50))
    const cmaterial = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 12})
    vein1 = new THREE.Line(cgeometry, cmaterial)

    const curve2 = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 4, -1.8),
      new THREE.Vector3(1, 6, -3.5),
      a2mesh.position
    )

    const c2geometry = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(50))
    const c2material = new THREE.LineBasicMaterial({color: 0x0000FF, linewidth: 12})
    vein2 = new THREE.Line(c2geometry, c2material)

    const curve3 = curve.clone()
    curve3.v2 = a5mesh.position
    curve3.v1 = new THREE.Vector3(a3mesh.position.x - 1, a3mesh.position.y + 1, a3mesh.position.z - 2)
    curve3.v0 = curve.getPointAt(0.5)
    const c3geometry = new THREE.BufferGeometry().setFromPoints(curve3.getPoints(50))
    vein3 = new THREE.Line(c3geometry, cmaterial)

    const curve4 = curve2.clone()
    curve4.v2 = a6mesh.position
    curve4.v1 = new THREE.Vector3(a4mesh.position.x + 1, a4mesh.position.y + 1, a4mesh.position.z - 2)
    curve4.v0 = curve2.getPointAt(0.5)
    const c4geometry = new THREE.BufferGeometry().setFromPoints(curve4.getPoints(50))
    vein4 = new THREE.Line(c4geometry, c2material)

    const curve5 = curve3.clone()
    curve5.v2 = a3mesh.position
    curve5.v1.position = new THREE.Vector3(a5mesh.position.x - 1, a5mesh.position.y + 3, a5mesh.position.z - 2)
    curve5.v0 = curve3.getPointAt(0.5)
    const c5geometry = new THREE.BufferGeometry().setFromPoints(curve5.getPoints(50))
    vein5 = new THREE.Line(c5geometry, cmaterial)

    const curve6 = curve4.clone()
    curve6.v2 = a4mesh.position
    curve5.v1.position = new THREE.Vector3(a5mesh.position.x + 1, a5mesh.position.y + 3, a5mesh.position.z - 2)
    curve6.v0 = curve4.getPointAt(0.5)
    const c6geometry = new THREE.BufferGeometry().setFromPoints(curve6.getPoints(50))
    vein6 = new THREE.Line(c6geometry, c2material)

    meshGroup.add(vein1, vein2, vein3, vein4, vein5, vein6)

    // Load 3D model
    loader.load(
      // resource URL
      modelFile,
      // loaded handler
      (gltf) => {
        model = gltf.scene
        model.position.set(0, 3, -1)
        meshGroup.add(model)
        // Hide 3D model until image target is detected.
        // model.visible = false
      }
    )
    // add all elements in meshGroup to the scene
    scene.add(meshGroup)
    meshGroup.visible = false
    // Add soft white light to the scene.
    // This light cannot be used to cast shadows as it does not have a direction.
    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1)
    scene.add(light)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    camera.position.set(0, 3, 0)
  }

  // Places content over image target
  const showTarget = ({detail}) => {
    // When the image target named 'model-target' is detected, show 3D model.
    // This string must match the name of the image target uploaded to 8th Wall.

    if (detail.name === 'logo_target') {
      // hide target graphic
      maskMesh.visible = false
      // change color filter
      XR8.GlTextureRenderer.configure({fragmentSource: fragmentShaders[2]})
      // set video (1) mesh over the original target image
      videoObj.position.copy(detail.position)
      videoObj.quaternion.copy(detail.rotation)
      videoObj.scale.set(detail.scale, detail.scale, detail.scale)
      videoObj.visible = true
      video.play()

      if (scanned === 0) {
        // place 3D model above the target
        model.quaternion.copy(detail.rotation)
        model.scale.set(detail.scale / 3, detail.scale / 3, detail.scale / 3)
        model.visible = true
        meshGroup.position.set(detail.position.x, detail.position.y - 1.25, detail.position.z)
        meshGroup.visible = true
        // arrange the meshes in a semicircle facing the camera
        for (let i = 0; i < 5; i++) {
          const child = meshGroup.children[i]
          child.quaternion.copy(detail.rotation)
          child.scale.set(detail.scale / 1.25, detail.scale / 1.25)
          const angle = Math.floor(i / 2)
          if (angle !== 0) {
            child.rotation.y = Math.PI / (angle + 1) - (i % 2) * ((2 * Math.PI) / (angle + 1))
          }
        }
      }
      // scanned variable starts at 0 and changes to 1 to indicate we should not reset the objects
      // every time the target image is out of frame -- keeps the experience smoother, less breaking
      scanned = 1
    }
  }

  // Hides the image frame + pauses video when the target is no longer detected.
  const hideTarget = ({detail}) => {
    if (detail.name === 'logo_target') {
      // model.visible = false
      video.pause()
      // videoObj.visible = false
    }
  }

  // Grab a handle to the threejs scene and set the camera position on pipeline startup.
  const onStart = ({canvas}) => {
    XR8.GlTextureRenderer.configure({fragmentSource: fragmentShaders[0]})
    const {scene, camera} = XR8.Threejs.xrScene()  // Get the 3js scene from XR
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth / window.innerHeight)
    document.body.appendChild(renderer.domElement)

    initXrScene({scene, camera})  // Add content to the scene and set starting camera

    // animation loop
    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    function onOpen(name) {
      // console.log(name)
      if (name === 'a1') {
        popMesh2.visible = true
      }
      if (name === 'a3') {
        // videoObj2.visible = true
        video2.play()
      }
      if (name === 'a5') {
        a5mesh.material = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load(pamphlet2), transparent: true})
        a5mesh.geometry = new THREE.PlaneGeometry(1.6 * 2.74, 1.6 * 1.525)
      }
      if (name === 'a6') {
        a6mesh.geometry = new THREE.PlaneGeometry(8, 4)
      }
      if (name === 'a2') {
        window.location.href = document.getElementById(name).href
      }
    }

    // changes color of selected object
    function onTouch(e) {
      e.preventDefault()
      // will close any already open popup frames
      popMesh2.visible = false
      videoObj2.visible = false
      video2.pause()
      // get coords of touch on canvas
      tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
      tapPosition.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1
      // use raycaster to find array of 3D intersects of tap position on canvas
      raycaster.setFromCamera(tapPosition, camera)
      // we only want to detect objects in the objects[] array
      const intersects = raycaster.intersectObjects(objects)
      // if length intersects[] > 0,then an object has been touched
      if (intersects.length > 0) {
        // store object attributes in temp variables
        materialtemp = intersects[0].object.material
        geometrytemp = intersects[0].object.geometry
        // change color to blue
        intersects[0].object.material = new THREE.MeshBasicMaterial({map: materialtemp.map, color: 0x00FFFF, transparent: true})
        // execute onOpen function for object with given name
        onOpen(intersects[0].object.name)
      }
    }

    function onTouchEnd(e) {
      e.preventDefault()
      raycaster.setFromCamera(tapPosition, camera)
      const intersects = raycaster.intersectObjects(objects)
      // intersects[0].object.material.color.setHex(Math.random() * 0xffffff)
      if (intersects.length > 0) {
        // restore original properties to selected object
        intersects[0].object.material = materialtemp
        intersects[0].object.geometry = geometrytemp
      }
    }

    canvas.addEventListener('touchstart', onTouch, true)
    canvas.addEventListener('touchend', onTouchEnd, true)

    // prevent scroll/pinch gestures on canvas
    canvas.addEventListener('touchmove', (event) => {
      event.preventDefault()
    })
    //
    // Sync the xr controller's 6DoF position and camera paremeters with our scene.
    XR8.XrController.updateCameraProjectionMatrix({
      origin: camera.position,
      facing: camera.quaternion,
    })

    // XR8.GlTextureRenderer.configure({fragmentSource: fragmentShaders[0]})
  }

  return {
    // Camera pipeline modules need a name. It can be whatever you want but must be
    // unique within your app.
    name: 'threejs-flyer',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR8.Threejs scene to be ready before we can access it to add content. It was created in
    // XR8.Threejs.pipelineModule()'s onStart method.
    onStart,

    // Listeners are called right after the processing stage that fired them. This guarantees that
    // updates can be applied at an appropriate synchronized point in the rendering cycle.
    listeners: [
      {event: 'reality.imagefound', process: showTarget},
      {event: 'reality.imageupdated', process: showTarget},
      {event: 'reality.imagelost', process: hideTarget},
    ],
  }
}

export {imageTargetPipelineModule}

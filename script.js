//Global variables
var scene, camera, renderer, controls, object, hobbitHole;

var animateZ = false;
var origin = new THREE.Vector3(0, 0, 0);
var shire = new THREE.Vector3(-778, 540, 0);

//initialize the scene
init();
//animate the scene
animate();

function init() {
    //Scene
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    scene = new THREE.Scene();
    var background = new THREE.TextureLoader().load("background.jpg");
    scene.background = background;

    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    //Camera
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
    camera.position.set(-778, 1000, 0);
    scene.add(camera);

    //Update size
    window.addEventListener("resize", function () {
        var WIDTH = window.innerWidth;
        var HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });

    //Background color
    renderer.setClearColor(0xcefa, 1);

    //Light
    /*var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);*/

    //Spotlight
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 1000, 100);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 5000;
    spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);
    scene.add(new THREE.SpotLightHelper(spotLight));

    //Texture from https://www.donsmaps.com/middleearthmap.html
    var texture = new THREE.TextureLoader().load("middle_earth.jpg");

    var geometry = new THREE.PlaneBufferGeometry(3200, 2400);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    material.side = THREE.DoubleSide;
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;

    scene.add(plane);

    //Load hobbit hole
    //Model from https://3dwarehouse.sketchup.com/model/2d102601-c7b9-4e84-9530-244683b19d24/Hobbit-hole?hl=en
    var loader = new THREE.ColladaLoader();
    loader.load("hobbit+hole+final/model.dae", function (collada) {
        hobbitHole = collada.scene;
        hobbitHole.scale.set(0.1, 0.1, 0.1);
        hobbitHole.castShadow = true;
        hobbitHole.translateX(shire.x-40);
        hobbitHole.translateY(shire.y);
        hobbitHole.translateZ(shire.z-100);

        //remove Gandalf
        for (var i = 0; i < hobbitHole.children[0].children.length; i++) {
            if (hobbitHole.children[0].children[i].name == "_2D_Gandalf") {
                hobbitHole.children[0].remove(hobbitHole.children[0].children[i]);
            }
        }

        scene.add(hobbitHole);
    }, undefined, function (error) {
        console.log(error);
        });

    //Add keyboard controls
    document.onkeydown = function (ev) { keydown(ev, camera) };

    //Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElemet);
    controls.target = new THREE.Vector3(-778, 10, -540);
}

var origin = new THREE.Vector3(0, 0, 0);
var upVector = new THREE.Vector3(1, 0, 0);

//Animation loop
function animate() {
    requestAnimationFrame(animate);
    /*
    var speed = Date.now() * 0.0005;
    camera.position.x = Math.cos(speed) * 100;
    camera.position.y = Math.sin(speed) * 100;*/

    //camera.lookAt(shire);
    //controls.target = shire;

    //camera.up.set(0, 0, 1);

    //animate the scene
    if (animateZ && hobbitHole != undefined) {
        if (hobbitHole.position.y < -10) {
            hobbitHole.translateZ(0.5);
        }
    }
    

    TWEEN.update();

    renderer.render(scene, camera);
    //Update the controls for the camera
    controls.update();
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

//Keystroke function
function keydown(ev, camera) {
   
    //set the animation on
    switch (ev.keyCode) {
        case 49: //1
            if (hobbitHole != undefined) {
                camera.position.set(-782, 23, -445);
                animateZ = true;
            }
            break;
    }

    /*
    //Current camera position
    var curPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    var newPos = curPos;

    //Get the vector that the camera is looking at
    var lookAtVector = new THREE.Vector3(0, 0, - 1);
    lookAtVector.applyQuaternion(camera.quaternion);
    //Save the lookAt vector
    var curLookAt = { x: lookAtVector.x, y: lookAtVector.y, z: lookAtVector.z };
    var newLookAt = curLookAt;

    var curRotate = { x: 0, y: 0, z: 0 };
    var rotate = { x: degToRad(90), y: degToRad(90), z: degToRad(90) };
    
    switch (ev.keyCode) {
        case 48: //0
            newPos = { x: 0, y: 0, z: 4000 };
            //newLookAt = { x: 0, y: 0, z: -1 };
            break;
        case 49: //1
            newPos = { x: -778, y: 0, z: 300 };
            //newLookAt = { x: 0, y: 0, z: -1 };
            break;
    }
    //Move camera
    var posTween = new TWEEN.Tween(curPos)
        .to(newPos, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function () {
            camera.position.set(curPos.x, curPos.y, curPos.z);
        })
        .start();

    /*
    var lookAtTween = new TWEEN.Tween(curLookAt)
        .to(newLookAt, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function () {
            var test = new THREE.Vector3(0, 0, - 1);
            test.applyQuaternion(camera.quaternion);
            console.log(test);
            camera.lookAt(curLookAt.x, curLookAt.y, curLookAt.z);
        })
        .start();*/
}
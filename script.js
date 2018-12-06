//Global variables
var scene, camera, renderer, controls, object, hobbitHole, sauron, sauronTarget, mountain1, mountain2, mountainSet, isengard, isengardLocation, ring, ringLocation;

var animateZ = false;
var origin = new THREE.Vector3(0, 0, 0);
var shire = new THREE.Vector3(-778, 540, 0);
var trueShire = new THREE.Vector3(-778, 0, -540);
var mordor = new THREE.Vector3(800, 0, 390);
var isengardLocation = new THREE.Vector3(-220, 0, 50);
var ringLocation = new THREE.Vector3(0, 3100, 950);
var mountainRange = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-150, 0, 0),
    new THREE.Vector3(-130, 0, -200),
    new THREE.Vector3(150,0,-500),
    new THREE.Vector3(22,0,-800)
);

var xVector = new THREE.Vector3(1, 0, 0);
var yVector = new THREE.Vector3(0, 1, 0);
var zVector = new THREE.Vector3(0, 0, 1);

var ready = false;

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
    camera.position.set(0, 3248, 1000);
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

    //Lights
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0,1,1);
    scene.add(directionalLight);

    var light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);

    sauronTarget = new THREE.Object3D();
    sauronTarget.position.set(mordor.x, 0, mordor.z);
    scene.add(sauronTarget);

    //Texture from https://www.donsmaps.com/middleearthmap.html
    var texture = new THREE.TextureLoader().load("middle_earth.jpg");

    var geometry = new THREE.PlaneBufferGeometry(3200, 2400);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    material.side = THREE.DoubleSide;
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;

    scene.add(plane);

    var points = mountainRange.getPoints(15);

    //Load hobbit hole
    //Model from https://3dwarehouse.sketchup.com/model/2d102601-c7b9-4e84-9530-244683b19d24/Hobbit-hole?hl=en
    var loader1 = new THREE.ColladaLoader();
    loader1.load("hobbit+hole+final/model.dae", function (collada) {
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

    var loader2 = new THREE.GLTFLoader();
    loader2.load("the_eye_of_sauron_lord_of_the_rings/scene.gltf", function (gltf) {
        sauron = gltf.scene;
        sauron.scale.set(0.1, 0.1, 0.1);
        //sauron.castShadow = true;

        sauron.translateX(mordor.x);
        sauron.translateY(-29);
        sauron.translateZ(mordor.z);

        //Get tower object
        var tower = sauron.children[0].children[0].children[0].children[0].children[0];

        //Change tower's material color and type to lambert material
        var newMaterial = new THREE.MeshLambertMaterial();
        newMaterial.color = new THREE.Color(0x202020);
        tower.children[0].material = newMaterial;

        //Add the tower to the scene
        scene.add(sauron);
    }, undefined, function (error) {
        console.log(error);
        });

    /*
    //Model from https://sketchfab.com/models/12b29bb3ff554a6fbad3d6b6a2519236
    var loader3 = new THREE.GLTFLoader();
    loader3.load("mountain1/scene.gltf", function (gltf) {
        mountain1 = gltf.scene;
        
        var scale = 50;
        mountain1.scale.set(scale, scale, scale);
        mountain1.translateX(-scale/2);
        mountain1.translateY(scale);
        mountain1.translateZ(scale/2);

        //scene.add(mountain1);
    }, undefined, function (error) {
        console.log(error);
    });*/

    //Model from https://sketchfab.com/models/cafd463503ba4724a7aadff917786cd5
    var loader4 = new THREE.GLTFLoader();
    loader4.load("mountain2/scene.gltf", function (gltf) {
        mountain2 = gltf.scene;

        var scale = 15;
        mountain2.scale.set(scale, scale, scale);
        mountain2.translateX(-scale);
        mountain2.translateY(-scale/2);
        mountain2.translateZ(-scale);

        mountainSet = new Array();
        //Add the mountains to a curve for the mountain range
        for (var i = 0; i < points.length; i++) {
            //Clone the mountain
            var newMountain = mountain2.clone();

            //Rotate the mountain
            var min = 0;
            var max = 2 * Math.PI;
            var random = Math.random() * (max - min) + min;
            newMountain.rotateY(random);

            //Translate the mountain
            newMountain.position.set(points[i].x, points[i].y, points[i].z);
            newMountain.translateX(-scale);
            newMountain.translateY(-100);
            newMountain.translateZ(-scale);

            newMountain.animate = false;

            //Add the mountain to the scene
            mountainSet.unshift(newMountain);
            scene.add(newMountain);
        }

        //scene.add(mountainSet);
        //scene.add(mountain2);
    }, undefined, function (error) {
        console.log(error);
        });

    //Model from https://sketchfab.com/models/62a7642c92804387b99a73ae6844de06
    var loader5 = new THREE.GLTFLoader();
    loader5.load("isengard/scene.gltf", function (gltf) {
        isengard = gltf.scene;

        var scale = 30;
        isengard.scale.set(scale, scale, scale);

        isengard.position.set(isengardLocation.x, -scale, isengardLocation.z);
        
        //Change some settings on the model
        var obj = isengard.getObjectByName("Collada_visual_scene_group");
        var c = new THREE.Color(0x303030);
        obj.children = obj.children.map(function (d) {
            //Change model color
            d.children[0].material.color = c;
            //Remove the texture map (looked too dark)
            d.children[0].material.map = null;
            return d;
        });

        
        scene.add(isengard);
    }, undefined, function (error) {
        console.log(error);
        });

    //Model from https://sketchfab.com/models/e63a62533f514c808b4f0770241a31e7
    var loader6 = new THREE.GLTFLoader();
    loader6.load("ring/scene.gltf", function (gltf) {
        ring = gltf.scene;

        //Scale factor
        var scale = 30;

        //Scale and move ring
        ring.scale.set(scale, scale, scale);
        ring.position.set(ringLocation.x, ringLocation.y, ringLocation.z);
        //ring.translateY(-500);

        //Get ring object
        var object = ring.getObjectByName("BezierCircle002").children[0];

        //Change ring properties
        object.material.metalness = 0.5;
        object.material.roughness = 0.5;
        //console.log(object.material);

        //Add ring to scene
        scene.add(ring);
    }, undefined, function (error) {
        console.log(error);
    });

    //Add keyboard controls
    document.onkeydown = function (ev) { keydown(ev, camera) };

    //Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElemet);
    controls.target = new THREE.Vector3(0, 0, 0);
}

//Animation loop
function animate() {
    requestAnimationFrame(animate);

    //Check to see if the scene is ready
    if (!ready) {
        if (hobbitHole != null && sauron != null && mountain2 != null && isengard != null) {
            ready = true;
            console.log("ready!");
        }
    }
    else {
        //Animations

        //Ring
        ring.rotateY(0.02);
        ring.rotateOnWorldAxis(xVector, 0.02);
        ring.rotateOnWorldAxis(zVector, 0.02);

        /*
        var maxHeight = -8;
        var startHeight = -50;
        var mountainSpeed = 1;

        for (var i = 0; i < mountainSet.length; i++) {
            if (mountainSet[i].animate == true) {
                mountainSet[i].position.y += mountainSpeed;
                if (mountainSet[i].position.y >= maxHeight) {
                    mountainSet[i].animate = false;
                }
                else if (mountainSet[i].position.y >= startHeight && mountainSet.length != i+1) {
                    mountainSet[i + 1].animate = true;
                }
            }
        }*/

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
        case 48: //0
            controls.target = new THREE.Vector3(0, 0, 0);
            camera.position.set(0, 3248, 1000);
            break;
        case 49: //1
            if (hobbitHole != undefined) {
                camera.position.set(-782, 23, -445);
                animateZ = true;
            }
            break;
        case 50: //2
            controls.target = mordor;
            break;
        case 51: //3
            //controls.target = ringLocation;
            //camera.position.set(0, -330, 0);
            console.log(camera.position);
            break;
        case 65: //a: animate the project
            if (!ready) {
                break;
            }

            camera.position.set(0, 3248, 1000);
            controls.target.set(0, 0, 0);

            //animate
            var toPos = new THREE.Vector3(-775, 183, -300);
            //Move camera to shire
            var cameraTween1 = new TWEEN.Tween(camera.position)
                .to(toPos, 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera target to shire
            var cameraTween2 = new TWEEN.Tween(controls.target)
                .to(trueShire, 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Rise shire out of ground
            var hobbitHoleTween1 = new TWEEN.Tween(hobbitHole.position)
                .to(new THREE.Vector3(hobbitHole.position.x, -10, hobbitHole.position.z), 5000)
                .easing(TWEEN.Easing.Cubic.Out);
            //Move camera to shire ground level
            var cameraTween3 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(-778, 24, -416), 5000)
                .easing(TWEEN.Easing.Sinusoidal.InOut);
            //Rotate camera around shire
            /*
            var cameraTween4 = new TWEEN.Tween(camera.position)
                .to({ x: -654 }, 2000)
                .easing(TWEEN.Easing.Sinusoidal.Out)
                .onUpdate(function () { controls.update() });
            var cameraTween5 = new TWEEN.Tween(camera.position)
                .to({ z: -540 }, 2000)
                .easing(TWEEN.Easing.Sinusoidal.In)
                .onUpdate(function () { controls.update() });
            */
            //Move camera to mountains
            var cameraTween6 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(-43, 1170, 642), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move target to mountains
            var cameraTween7 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(0, 20, -400), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move target to first mountain
            var cameraTween8 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(22, 50, -800), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera to fist mountain
            var cameraTween9 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(22, 126, -535), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);

            var tweenSet = new Array();
            for (var i = 0; i < mountainSet.length; i++) {
                var tween = new TWEEN.Tween(mountainSet[i].position)
                    .to(new THREE.Vector3(mountainSet[i].position.x, -8, mountainSet[i].position.z), 2000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onUpdate(function () {
                        //console.log(mountainSet[i].position);
                    })
                    .delay(i*250);
                tweenSet.push(tween);
            }

            //Move camera backwards from the mountains
            var cameraTween10 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(-159, 126, 239), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            var cameraTween11 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(-150, 50, 0), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move target to isengard
            var cameraTween12 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(-220, -10, 50), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera to isengard
            var cameraTween13 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(-215, 175, 159), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            var cameraTween14 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(-215, 10, 61), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Rise isengard
            var isengardTween1 = new TWEEN.Tween(isengard.position)
                .to(new THREE.Vector3(isengard.position.x, 30, isengard.position.z), 5000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    if (controls.target.y < 30) {
                        controls.target.y = isengard.position.y + 20;
                    }
                    controls.update();
                });
            //Move camera to view isengard
            var cameraTween15 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(-184,5,134), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera to mordor
            var cameraTween16 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(962, 1209, 817), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move target to mordor
            var cameraTween17 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(958,0,592), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera to sauron
            var cameraTween18 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(799, 147, 445), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move target to sauron
            var cameraTween19 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(799, 0, 390), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera closer to sauron
            var cameraTween20 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(799, 0.4, 400), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move sauron from ground
            var sauronTween1 = new TWEEN.Tween(sauron.position)
                .to(new THREE.Vector3(sauron.position.x, 29, sauron.position.z), 3000)
                .easing(TWEEN.Easing.Quartic.Out);
            //Move camera to eye
            var cameraTween21 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(799, 51, 400), 5000)
                .easing(TWEEN.Easing.Quartic.Out);
            //Move target to eye
            var cameraTween22 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(799, 51, 390), 5000)
                .easing(TWEEN.Easing.Quartic.Out);
            //Move camera to see sauron
            var cameraTween23 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(799, 78, 546), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move camera to ring
            var cameraTween24 = new TWEEN.Tween(camera.position)
                .to(new THREE.Vector3(0, 3248, 1000), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);
            //Move target to origin
            var cameraTween25 = new TWEEN.Tween(controls.target)
                .to(new THREE.Vector3(0, 0, 0), 5000)
                .easing(TWEEN.Easing.Cubic.InOut);

            //Tween playing
            cameraTween1.start();
            cameraTween2.start();
            cameraTween2.chain(hobbitHoleTween1.delay(4000), cameraTween3.delay(2000));
            hobbitHoleTween1.chain(cameraTween6.delay(3000), cameraTween7.delay(3000));
            cameraTween7.chain(cameraTween8.delay(1000), cameraTween9.delay(1000));
            cameraTween8.onComplete(function () {
                for (var i = 0; i < tweenSet.length; i++) {
                    tweenSet[i].start();
                }
                cameraTween10.start();
                cameraTween11.start();
            });
            cameraTween11.chain(cameraTween12, cameraTween13);
            cameraTween13.chain(cameraTween14.delay(1000));
            cameraTween14.chain(isengardTween1);
            isengardTween1.chain(cameraTween15);
            cameraTween15.chain(cameraTween16.delay(3000), cameraTween17.delay(3000));
            cameraTween17.chain(cameraTween18, cameraTween19);
            cameraTween19.chain(cameraTween20.delay(1000));
            cameraTween20.chain(sauronTween1);
            sauronTween1.chain(cameraTween21, cameraTween22);
            cameraTween22.chain(cameraTween23.delay(2000));
            cameraTween23.chain(cameraTween24.delay(1000), cameraTween25.delay(1000));

            break;
    }

}
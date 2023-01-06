import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';


const renderer = new THREE.WebGLRenderer();


renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
const camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.1, 1000 );
const orbit = new OrbitControls( camera, renderer.domElement );

const axesHelper = new THREE.AxesHelper( 3 );


scene.add( axesHelper );
camera.position.set( 0, 5, 60 );
orbit.update();

const padelGeometry = new THREE.BoxGeometry(6, 1, 1);
const padelMaterial = new THREE.MeshStandardMaterial( { color: getRandomColor() } );
const padel = new THREE.Mesh( padelGeometry, padelMaterial )
padel.position.set( 0, -12, 1 );
scene.add(padel);
padel.castShadow = true;

var bricks = [];
var bricksRow = [];
const spacing = 2;
// create 2d array of bricks 
for(let i = 0; i < 15; i++){
  for (let j = 0; j < 4; j++){
    const brickGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const brickMaterial = new THREE.MeshStandardMaterial( { color: getRandomColor(), wireframe: false } );
    const brick = new THREE.Mesh( brickGeometry, brickMaterial );
    brick.position.set(14- (i*spacing) ,7 +  (j*(spacing)), 1 );
    console.log(brick.position);
    bricksRow.push(brick);
    scene.add( brick );
    brick.castShadow = true;
  }
  bricks.push(bricksRow);
}
console.log(bricks);


const planeGeometry = new THREE.PlaneGeometry( 30, 30 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide} );
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.position.set( 0, 0, 0 );
scene.add( plane );
plane.receiveShadow = true;


const planeHelper = new THREE.GridHelper( 30, 6, '#666', '#666' );
planeHelper.position.set( 0, 0, 0 );
planeHelper.rotation.x = Math.PI / 2;
scene.add( planeHelper );


const sphereGeometry = new THREE.SphereGeometry( 1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000, wireframe: false } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.position.set( -5, -5, 1 );
sphere.castShadow = true;
scene.add( sphere );
function getRandomColor(){
    return Math.random() * 0xffffff;
}

const ambiantLight = new THREE.AmbientLight( 0x333333,0.2);
scene.add( ambiantLight );


const spotLight = new THREE.SpotLight( 0xffffff, 1);
scene.add( spotLight );
spotLight.position.set( -30, 0, 60 );
spotLight.castShadow = true;
spotLight.angle = 0.50;


const sLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( sLightHelper );


const gui = new dat.GUI();

const options = {
    sphereColor: 0x0000ff,
    wireframe: false,
    HorizontalSpeed: 0.15,
    VerticalSpeed: 0.15,
};

gui.addColor( options, 'sphereColor' ).onChange(function(e){
    sphere.material.color.set(e);
})

gui.add( options, 'wireframe' ).onChange(function(e){
    sphere.material.wireframe = e;
})
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);



var step  = 0;
function onKeyDown(event) {
  // move left
  if (event.keyCode == 37) {
    console.log("left");
    step = -0.2;
  }
  if (event.keyCode == 39) {
    console.log("right");
    step = 0.2;
  }
}

function onKeyUp(event) {
  if (event.keyCode == 37) {
    step = 0;
  }
  if (event.keyCode == 39) {
    step = 0;
  }
}
var currentPosition = padel.position.x;
function updatePadelPosition() {
  currentPosition += step;

  if ( currentPosition  < -12) {
    currentPosition = -12;
  }else if(currentPosition > 12) {
    currentPosition = 12;
  }
  padel.position.x = currentPosition;
}
var counter = 0;
var sphereHorizontalDirection = 1;
var sphereVerticalDirection = -1;
function updateSpherePosition() {
    sphere.position.x = sphere.position.x + options.HorizontalSpeed * sphereHorizontalDirection;
    sphere.position.y = sphere.position.y + options.VerticalSpeed * sphereVerticalDirection;
    //if sphere hit the edge of the field or players then change direction
    if (sphere.position.x < -14 || sphere.position.x >14) {
      sphereHorizontalDirection *= -1;
    }
    if (sphere.position.y > 14) {
      sphereVerticalDirection *= -1;
    }
    if (sphere.position.y < -14) {
      gameOver();
    }
    //p2 scored

    // if sphere hits a padel it changes direction
    if (sphere.position.y < -11 && sphere.position.x > padel.position.x - 3 && sphere.position.x < padel.position.x + 3) {
      sphereVerticalDirection *= -1;
      sphereHorizontalDirection = Math.random() * 2 - 1;
    }

    // if sphere hits a brick it changes direction and brick is removed
    for (let i = 0; i < bricks.length; i++){
      for (let j = 0; j < bricks[i].length; j++){
        if (sphere.position.y > bricks[i][j].position.y - 1 && sphere.position.y < bricks[i][j].position.y + 1 && sphere.position.x > bricks[i][j].position.x - 1 && sphere.position.x < bricks[i][j].position.x + 1){
          sphereVerticalDirection *= -1;
          sphereHorizontalDirection = Math.random() * 2 - 1;
          scene.remove(bricks[i][j]);
          bricks[i].splice(j, 1);
          counter++;
          updateScoreHTML();
        }
      }
    }
  }

function gameOver() {
  scene.remove(sphere);
  const msg = document.getElementById("gameOver");
  msg.style.display = "block";
  isPlaying = false;
}

function updateScoreHTML() {
  const msg = document.getElementById("score");
  msg.innerHTML = '<p>score: '+counter+ '</p>';
}
var isPlaying  = false;
const button = document.getElementById("start");
button.addEventListener("click", function(){
    counter = 0;
    scene.add(sphere);
    button.style.display = "none";
    isPlaying = true;
});
function congratulationMsg() {
  scene.remove(sphere);
  const msg = document.getElementById("gameOver");
  msg.innerHTML = '<p>Congratulation!</p>';
  msg.style.display = "block";
  isPlaying = false;
}
function animate() {
    if (counter == 60){
      congratulationMsg();
    }
    updatePadelPosition();
    if(isPlaying){
        updateSpherePosition();
    }
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );




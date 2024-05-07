import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
  materialColor: '#f5402c'
}

gui
  .addColor(parameters, 'materialColor')
  .onChange(() => {
    material.color.set(parameters.materialColor)
    particlesMaterial.color.set(parameters.materialColor)
  })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */

// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter


//Material 
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture
})



//Meshes
const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  material
)

const mesh2 = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32),
  material
)

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
)

scene.add(mesh1, mesh2, mesh3)


const objectsDistance = 4

mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

const sectionMeshes = [mesh1, mesh2, mesh3]

//Position Objects Horizontally
mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)


/**
 * Scroll
 */
//This retrieves the scroll value via the window.scrollY property
let scrollY = window.scrollY
let currentSection = 0

// The function below updates the scrollY vallue when the user scrolls by listening to the scroll event on window
window.addEventListener('scroll', () => {
  scrollY = window.scrollY

  sectionMeshes.forEach((mesh, index) => {
    const sectionTop = index * sizes.height; // Assuming each section has the same height
    const sectionBottom = (index + 1) * sizes.height;

    if (scrollY >= sectionTop && scrollY < sectionBottom) {
      currentSection = index;
    }
  });

  gsap.to(sectionMeshes[currentSection].rotation, {
    duration: 1.5,
    ease: 'power2.inOut',
    x: '+=6',
    y: '+=3',
    z: '+=1.5'
  })
  //   While the above code is valid, it will unfortunately not work. The reason is that, on each frame, we are already updating the rotation.x and rotation.y of each mesh with the elapsedTime.

  // To fix that, in the tick function, instead of setting a very specific rotation based on the elapsedTime, we are going to add the deltaTime to the current rotation:

  //this shows the scroll values in the console.logs
  // console.log(scrollY)
})


// Parallax Effect

// Cursor
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)




// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true
})
renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Particles
 */
// Geometry
const particlesCount = 500
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = Math.random()
  positions[i * 3 + 1] = Math.random()
  positions[i * 3 + 2] = Math.random()
}

const particlesGeometry = new THREE.BufferGeometry()
// This instantiates the Buffer Geometry and sets the position attribute
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03
})

// For the x (horizontal) and z (depth), we can use random values that can be as much positive as they are negative:

//For the y (vertical) it's a bit more tricky. We need to make the particles start high enough and then spread far enough below so that we reach the end with the scroll. To do that, we can use the objectsDistance variable and multiply by the number of objects which is the length of the sectionMeshes array:

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.05) * 10
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
  positions[i * 3 + 2] = (Math.random() - 0.05) * 10
}

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Animate
 */
const clock = new THREE.Clock()

// const clock = new THREE.clock()
// This line creates a new instance of the Clock class from the Three.js library. The Clock class is used to measure time in the application. It allows you to track the time elapsed between frames and is commonly used for animation purposes.
// const tick = () => { ... }:
// This defines a function named tick. This function is likely intended to be called on every frame of the animation loop.
// const elapsedTime = clock.getElapsedTime():
// Within the tick function, this line retrieves the elapsed time since the clock's start using the getElapsedTime() method of the Clock instance. This elapsed time is typically used to calculate animations to ensure smooth motion irrespective of the frame rate.

let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Animate Meshes
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  }

  // Animate Camera

  // camera.position.y = scrollY

  // Setting the above camera position to scrollY doesn't work because the camera is going in the wrong direction. ScrollY is positive when scrolling down, but the camera needs to go down on the y axis. To fix this I invert my scrollY value.

  // camera.position.y = - scrollY

  //This is better but my shapes still dissapear immediately upon scroll. This is because the scrollY variable is set to scroll down 1000 units to match the 1000 pixels that I've scrolled. One scroll is around 1000 pixels, but I don't want to SCROLL DOWN THAT MUCH! To scroll more slowly, each section has the same size as the viewport, which means that when I scroll the distance of one viewport height, the camera should reach the next object. To do this I divide scrollY by the height of the viewport which is defined by sizes.height

  camera.position.y = - scrollY / sizes.height * objectsDistance

  // In order to be able to scroll to the very bottom I need to set multiply the value I get from - scrollY / sizes.height times objectsDistance. Because objectsDistance is set to 4, that means each of my objects is separated by 4 units, which means the scroll wouldn't reach the bottom without multiplying by objectsDistance. In a nutshell, if the user scrolls down one section then the camera will move down to the next object.

  const parallaxX = cursor.x * 0.5
  const parallaxY = - cursor.y * 0.5
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

  // In the above two cameraGroup calls the camera will get a little closer to the destination. But, the closer it gets, the slower it moves because it's always a 10th of the actual position toward the target position.

  // The idea behind the formula is that, on each frame, instead of moving the camera straight to the target, we are going to move it (let's say) a 10th closer to the destination. Then, on the next frame, another 10th closer. Then, on the next frame, another 10th closer.




  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

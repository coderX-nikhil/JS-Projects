const scene = new THREE.Scene()

function randint(min, max) {return Math.floor(Math.random() * (max - min + 1) + min)}

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
)

var score = 0
var dead = false

const cooldown = 1000
var speed = 0.01
var lastshot = 0
var bullets = []
var enemies = []
var eni = 0

function canshoot() {
    const now = performance.now()
    return now - lastshot >= cooldown
}

function speedinginterval(callback, initialwait, minwait, factor) {
    var currentwait = initialwait

    function next() {
        callback()
        currentwait = Math.max(currentwait * factor, minwait)
        setTimeout(next, currentwait)
    }
    
    setTimeout(next, initialwait)
}

const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000, 1)
document.getElementById("diebg").onclick = shoot
document.body.appendChild(renderer.domElement)

const frontwallgeo = new THREE.BoxGeometry(10, 5, 0.1)
const frontwallmat = new THREE.MeshBasicMaterial({color: 0x444444})

const sidewallgeo = new THREE.BoxGeometry(10, 5, 0.1)
const sidewallmat = new THREE.MeshBasicMaterial({color: 0x333333})
405+2
const frontwall = new THREE.Mesh(frontwallgeo, frontwallmat)
const leftwall = new THREE.Mesh(sidewallgeo, sidewallmat)
const rightwall = new THREE.Mesh(sidewallgeo, sidewallmat)

const floorgeo = new THREE.BoxGeometry(10, 0.1, 10)
const floormat = new THREE.MeshBasicMaterial({color: 0x555555})

const floor = new THREE.Mesh(floorgeo, floormat)
const roof = new THREE.Mesh(floorgeo, floormat)

frontwall.position.z = -13
scene.add(frontwall)

leftwall.position.x = -5
leftwall.rotation.y = Math.PI / 2
leftwall.position.z = -8
scene.add(leftwall)

rightwall.position.x = 5
rightwall.rotation.y = -Math.PI / 2
rightwall.position.z = -8
scene.add(rightwall)

floor.position.y = -2.5
floor.position.z = -8
scene.add(floor)

roof.position.y = 2.5
roof.position.z = -8
scene.add(roof)

const light = new THREE.PointLight(0xffffff, 10, 10)
camera.add(light)
scene.add(camera)

camera.position.set(0, 0, 0)
camera.lookAt(0, 0, 0)

function shoot() {
    if (!dead) {
        if (!canshoot()) {return}
        
        const blockgeo = new THREE.BoxGeometry(0.3, 0.3, 0.3)
        const blockmat = new THREE.MeshBasicMaterial({color: 0xff0000})
        const block = new THREE.Mesh(blockgeo, blockmat)
    
        const camdir = new THREE.Vector3()
        camera.getWorldDirection(camdir)
    
        const startpos = new THREE.Vector3()
        camera.getWorldPosition(startpos)
    
        block.position.copy(startpos)
        block.geometry.computeBoundingBox()
        
        const velocity = camdir.clone().multiplyScalar(0.5)
    
        scene.add(block)
        bullets.push(block)
    
        lastshot = performance.now()
    
        const update = () => {
            block.position.add(velocity)
    
            if (block.position.z < frontwall.position.z) {
                scene.remove(block)
                bullets.splice(bullets.indexOf(block), 1)
            }
            else {
                renderer.render(scene, camera)
                requestAnimationFrame(update)
            }
        }
        
        update()
    }
}

function spawnenemy() {
    if (!dead) {
        const enemygeo = new THREE.BoxGeometry(0.2, 0.2, 0.2)
        const enemymat = new THREE.MeshBasicMaterial({color: 0x0000ff})
        const enemy = new THREE.Mesh(enemygeo, enemymat)
    
        const x = randint(-4, 4)
        const y = randint(-2, 2)
        enemy.position.set(x, y, frontwall.position.z)
        enemy.geometry.computeBoundingBox()
        enemy.name = eni.toString()
        eni++
        speed += 0.001
    
        scene.add(enemy)
        enemies.push(enemy)
    
        const update = () => {
            enemy.position.z += speed
    
            if (enemy.position.z > -2) {
                if (scene.getObjectByName(enemy.name)) {dead = true}
            }
            else {
                renderer.render(scene, camera)
                requestAnimationFrame(update)
            }
        }
    
        update()
    }
}

function updatedeaths() {
    const bulletboxes = bullets.map(bullet => new THREE.Box3().setFromObject(bullet))
    const enemyboxes = enemies.map(enemy => new THREE.Box3().setFromObject(enemy))

    bullets.forEach((bullet, bulletindex) => {
        enemies.forEach((enemy, enemyindex) => {
            const bulletbox = bulletboxes[bulletindex]
            const enemybox = enemyboxes[enemyindex]

            if (bulletbox.intersectsBox(enemybox)) {
                scene.remove(bullet)
                bullets.splice(bulletindex, 1)

                scene.remove(enemy)
                enemies.splice(enemyindex, 1)
                score++
            }
        })
    })
    
    renderer.render(scene, camera)
    requestAnimationFrame(updatedeaths)
}

updatedeaths()
setInterval(spawnenemy, 2250)

function die() {
    document.getElementById("deathmsg").innerHTML = "GAME OVER<br>Score: " + score
    document.getElementById("diebg").style.opacity = "1"
    vidcamera.stop()
    setTimeout(() => {document.getElementsByTagName("canvas")[0].remove()}, 1500)
}

function render() {
    if (!dead) {
        renderer.render(scene, camera)

        camera.lookAt(nosex, nosey, nosez)
        camera.position.set(0, 0, cameradistance)
        // if (mouthopen) {shoot()}
    
        document.getElementById("score").innerHTML = "Score: " + score
        
        requestAnimationFrame(render)
    }
    else {die()}
}

render()
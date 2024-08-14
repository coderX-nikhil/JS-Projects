const input = document.getElementById("input")

const intensity = 150

var mouthopen = false
var cameradistance = 0
var startnosez
var nosex = 0
var nosey = 0
var nosez = 0

function onresults(results) {
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            const nose = landmarks[4]
            // const topmouth = landmarks[13]
            // const bottommouth = landmarks[14]

            // if (((bottommouth.y * window.innerHeight) - (topmouth.y * window.innerHeight)) > 20) {mouthopen = true}
            // else {mouthopen = false}

            if (!startnosez) {startnosez = nosez}
            
            cameradistance = (nosez - startnosez) / 3
            nosex = (nose.x - 0.5) * intensity
            nosey = ((1 - nose.y) - 0.5) * intensity
            nosez = (nose.z - 0.5) * intensity
        }
    }
}

const facemesh = new FaceMesh({locateFile: (file) => {return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`}})

facemesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.3,
    selfieMode: true
})

facemesh.onResults(onresults)

const vidcamera = new Camera(input, {
    onFrame: async () => {await facemesh.send({image: input})},
    width: window.innerWidth,
    height: window.innerHeight
})

vidcamera.start()
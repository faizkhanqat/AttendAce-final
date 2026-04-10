let video;
let status;
let detectionInterval = null;
let hasMarkedAttendance = false;
let registeredDescriptor = null;

console.log('✅ scanface.js loaded');

// ---------- INIT ----------
window.addEventListener('DOMContentLoaded', async () => {
  video = document.getElementById('video');
  status = document.getElementById('status');

  if (!video || !status) {
    console.error('❌ Required DOM elements missing');
    return;
  }

  // Step 1: Check active class
  const activeClass = await getActiveClass();
  if (!activeClass) {
    status.innerText = '⏳ No active class right now';
    return;
  }

  // Step 2: Check attendance status
  const attendanceStatus = await checkAttendanceStatus(activeClass.class_id);
  if (attendanceStatus.marked) {
    status.innerText = 'Attendance already marked for today!';
    hasMarkedAttendance = true;
    return; // ✅ Skip camera and detection
  }

  // Step 2.5: Get registered face
registeredDescriptor = await getRegisteredFace();
if (!registeredDescriptor) {
  status.innerText = '❌ No face registered';
  return; // ❌ do not open camera
}

  // Step 3: Start camera and face detection
  await init();
});


async function getRegisteredFace() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/student/face/encoding', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();

  if (!data.face_encoding) return null;
  return new Float32Array(JSON.parse(data.face_encoding));
}



// ---------- LOAD FACEAPI MODELS ----------
async function init() {
  try {
    if (!window.faceapi) {
      status.innerText = 'FaceAPI not loaded';
      return;
    }

    // Skip loading if already loaded
    if (!faceapi.nets.tinyFaceDetector.params) {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models')
      ]);
    }

    // Start camera
    await startVideo();
  } catch (err) {
    console.error('❌ Init failed:', err);
    status.innerText = 'Failed to initialize face detection.';
  }
}

// ---------- START CAMERA ----------
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();

      // Fix canvas size to match actual video size
  const canvas = document.getElementById('overlay');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;



      status.innerText = 'Could you bring your face a little closer to the camera?';
      startDetection();
    };
  } catch (err) {
    console.error('❌ Camera error:', err);
    status.innerText = 'Cannot access camera.';
  }
}

// ---------- GET ACTIVE CLASS ----------
async function getActiveClass() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const res = await fetch('/api/student/classes/active', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) return null;

    const data = await res.json();
    console.log('🔍 Active class_id:', data.class_id);
    return data; // { class_id, expires_at }
  } catch (err) {
    console.error('❌ Error fetching active class:', err);
    return null;
  }
}

// ---------- CHECK ATTENDANCE STATUS ----------
async function checkAttendanceStatus(class_id) {
  const token = localStorage.getItem('token');
  if (!token) return { marked: false };

  try {
    const res = await fetch(`/api/attendance/status?class_id=${class_id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) return { marked: false };

    const data = await res.json();
    return { marked: !!data.marked };
  } catch (err) {
    console.error('❌ Error checking attendance status:', err);
    return { marked: false };
  }
}

// ---------- MARK FACE ATTENDANCE ----------
async function markFaceAttendance(class_id) {
  if (hasMarkedAttendance) return;

  hasMarkedAttendance = true;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('/api/attendance/face-mark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ class_id })
    });

    const data = await res.json();

    if (res.ok) {
      status.innerText = 'Attendance marked successfully!';
    } else if (res.status === 409) {
      status.innerText = 'Attendance already marked for today';
      hasMarkedAttendance = true; // prevent further 409 POSTs
    } else {
      status.innerText = data.message || '❌ Attendance failed';
      hasMarkedAttendance = false;
    }

    clearInterval(detectionInterval);

  } catch (err) {
    console.error('❌ Face attendance error:', err);
    status.innerText = '❌ Server error';
    hasMarkedAttendance = false;
  }
}

// ---------- FACE DETECTION ----------
// Add this variable above startDetection to track the blink state
let blinkCaptured = false;

function startDetection() {
  const container = document.getElementById('video-container');
  const canvas = document.getElementById('overlay');

  const displaySize = { width: container.clientWidth, height: container.clientHeight };
  faceapi.matchDimensions(canvas, displaySize);

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.9
  });

  detectionInterval = setInterval(async () => {
    if (hasMarkedAttendance) return;

    const detection = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const resized = faceapi.resizeResults(detection, displaySize);
      faceapi.draw.drawDetections(canvas, resized);

      // --- 🔐 Step 1: Face Match Check ---
      const distance = faceapi.euclideanDistance(
        detection.descriptor,
        registeredDescriptor
      );

      if (distance > 0.6) {
        status.innerText = "This face doesn't match. Try again!";
        return; 
      }

      // --- 👀 Step 2: Blink Detection (Liveness) ---
      // We calculate landmarks and avgEAR INSIDE the same block where we use them
      const landmarks = detection.landmarks;
      const leftEAR = getEAR(landmarks.getLeftEye());
      const rightEAR = getEAR(landmarks.getRightEye());
      const avgEAR = (leftEAR + rightEAR) / 2; // Defined and used here

      // ADD THE DEBUG LINE HERE:
      console.log(`[BIOMETRIC_LOG] EAR: ${avgEAR.toFixed(3)} | Liveness: ${blinkCaptured}`);

      if (avgEAR < 0.25) { // Loosened threshold to 0.25 for better detection
        blinkCaptured = true;
      }

      if (!blinkCaptured) {
        status.innerText = 'Blink your eyes to verify liveness...';
        return; 
      }

      // --- ✅ Step 3: Success & Redirect ---
      status.innerText = 'Liveness verified! Preparing QR scanner...';

      const activeClass = await getActiveClass();
      if (!activeClass) {
        status.innerText = "⏳ No active class found.";
        clearInterval(detectionInterval);
        return;
      }

      clearInterval(detectionInterval);
      window.location.href = `scanqr.html?faceVerified=true&class_id=${activeClass.class_id}`;
    } else {
      status.innerText = 'No face detected...';
    }
  }, 200); 
}


function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getEAR(eye) {
  // Vertical distances between eyelids
  const v1 = getDistance(eye[1], eye[5]);
  const v2 = getDistance(eye[2], eye[4]);
  // Horizontal distance between eye corners
  const h = getDistance(eye[0], eye[3]);
  return (v1 + v2) / (2 * h);
}
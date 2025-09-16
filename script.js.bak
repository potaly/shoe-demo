const videoEl = document.getElementById('video');
const canvasEl = document.getElementById('output');
const ctx = canvasEl.getContext('2d');

canvasEl.width = 360;
canvasEl.height = 480;

// 默认鞋子
let shoeImg = new Image();
shoeImg.src = 'images/111.jpg';

// 切换鞋子
function changeShoe(path) {
  shoeImg.src = path;
  console.log("切换鞋子：" + path);
}

// 初始化 MediaPipe Pose
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// ✅ 使用后置摄像头
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 360,
        height: 480,
        facingMode: { exact: "environment" } // 强制后置
      },
      audio: false
    });
    videoEl.srcObject = stream;
    videoEl.play();

    // 持续送帧给 MediaPipe
    async function sendFrame() {
      await pose.send({ image: videoEl });
      requestAnimationFrame(sendFrame);
    }
    sendFrame();

  } catch (err) {
    console.error("摄像头访问失败:", err);
  }
}
initCamera();

function onResults(results) {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);

  if (!results.poseLandmarks) return;

  const ankle = results.poseLandmarks[27]; // 左脚踝
  const toe = results.poseLandmarks[31];   // 左脚趾

  if (ankle && toe) {
    const x1 = ankle.x * canvasEl.width;
    const y1 = ankle.y * canvasEl.height;
    const x2 = toe.x * canvasEl.width;
    const y2 = toe.y * canvasEl.height;

    const footLength = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    const shoeWidth = footLength * 2;
    const shoeHeight = shoeWidth * (shoeImg.height / shoeImg.width);

    if (shoeImg.complete && shoeImg.naturalWidth > 0) {
      ctx.save();
      ctx.translate(x1, y1);
      ctx.rotate(angle);
      ctx.drawImage(shoeImg, -shoeWidth / 2, -shoeHeight / 2, shoeWidth, shoeHeight);
      ctx.restore();
    }
  }
}

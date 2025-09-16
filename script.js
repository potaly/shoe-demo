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

// 平滑滤波存储
let prevPoints = null;
function smoothPoint(curr, prev, alpha = 0.7) {
  if (!prev) return curr;
  return {
    x: alpha * curr.x + (1 - alpha) * prev.x,
    y: alpha * curr.y + (1 - alpha) * prev.y
  };
}

// MediaPipe Pose
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

// 启动摄像头（后置）
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: 360, height: 480 },
    audio: false
  });
  videoEl.srcObject = stream;
  videoEl.play();

  async function sendFrame() {
    await pose.send({ image: videoEl });
    requestAnimationFrame(sendFrame);
  }
  sendFrame();
}
initCamera();

function onResults(results) {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);

  if (!results.poseLandmarks) return;

  // 左脚：踝(27)、大趾(31)、小趾(29)
  let ankle = {x: results.poseLandmarks[27].x * canvasEl.width, y: results.poseLandmarks[27].y * canvasEl.height};
  let bigToe = {x: results.poseLandmarks[31].x * canvasEl.width, y: results.poseLandmarks[31].y * canvasEl.height};
  let smallToe = {x: results.poseLandmarks[29].x * canvasEl.width, y: results.poseLandmarks[29].y * canvasEl.height};

  // 平滑滤波
  if (prevPoints) {
    ankle = smoothPoint(ankle, prevPoints.ankle);
    bigToe = smoothPoint(bigToe, prevPoints.bigToe);
    smallToe = smoothPoint(smallToe, prevPoints.smallToe);
  }
  prevPoints = {ankle, bigToe, smallToe};

  // 用三点定义一个平行四边形（脚的平面）
  if (shoeImg.complete && shoeImg.naturalWidth > 0) {
    ctx.save();

    // 计算脚的基向量
    const dx1 = bigToe.x - ankle.x;
    const dy1 = bigToe.y - ankle.y;
    const dx2 = smallToe.x - ankle.x;
    const dy2 = smallToe.y - ankle.y;

    // 缩放鞋子到脚的大小
    const scale = Math.hypot(dx1, dy1) / shoeImg.width * 2.0;

    // 仿射变换矩阵
    ctx.setTransform(
      dx1 / shoeImg.width, dy1 / shoeImg.width,
      dx2 / shoeImg.height, dy2 / shoeImg.height,
      ankle.x, ankle.y
    );

    ctx.drawImage(shoeImg, 0, 0, shoeImg.width, shoeImg.height);

    ctx.restore();
  }
}

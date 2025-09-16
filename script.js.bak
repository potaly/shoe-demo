let videoEl = document.getElementById('video');
let canvasEl = document.getElementById('output');
let ctx = canvasEl.getContext('2d');

 默认鞋子
let shoeImg = new Image();
shoeImg.src = 'imagesshoe1.png';

 切换鞋子
function changeShoe(path) {
  shoeImg.src = path;
}

 初始化 MediaPipe Pose
const pose = new Pose({
  locateFile (file) = {
    return `httpscdn.jsdelivr.netnpm@mediapipepose@0.5${file}`;
  }
});

pose.setOptions({
  modelComplexity 0,
  smoothLandmarks true,
  enableSegmentation false,
  minDetectionConfidence 0.5,
  minTrackingConfidence 0.5
});

pose.onResults(onResults);

 使用摄像头
const camera = new Camera(videoEl, {
  onFrame async () = {
    await pose.send({image videoEl});
  },
  width 360,
  height 480
});
camera.start();

function onResults(results) {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

   画摄像头画面
  ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);

  if (!results.poseLandmarks) return;

   脚踝（左脚 = 27，右脚 = 28），脚趾尖（左脚 = 31，右脚 = 32）
  const leftAnkle = results.poseLandmarks[27];
  const leftToe = results.poseLandmarks[31];

  if (leftAnkle && leftToe) {
    const x1 = leftAnkle.x  canvasEl.width;
    const y1 = leftAnkle.y  canvasEl.height;
    const x2 = leftToe.x  canvasEl.width;
    const y2 = leftToe.y  canvasEl.height;

     脚长 & 旋转角度
    const footLength = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);

     鞋图绘制
    const shoeWidth = footLength  2;  可以调比例
    const shoeHeight = shoeWidth  (shoeImg.height  shoeImg.width);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(angle);
    ctx.drawImage(shoeImg, -shoeWidth  2, -shoeHeight  2, shoeWidth, shoeHeight);
    ctx.restore();
  }
}

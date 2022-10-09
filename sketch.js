const ac = document.getElementById("ac"); // canvas要素のオブジェクトを取得
const acc = document.querySelector("#ac");
const ctx = acc.getContext("2d");
const button = document.getElementById("button");

let music = new Audio();

let BPM;
function setup() {
  window.addEventListener(
    "touchstart",
    function (event) {
      event.preventDefault();
    },
    { passive: false }
  );
  window.addEventListener(
    "touchmove",
    function (event) {
      event.preventDefault();
    },
    { passive: false }
  );
  reszCanvas(windowWidth, windowHeight);
  setting();
  noCanvas()
}
function setting() {
  ac.style.display = "none";
  let checkButton = document.getElementById("checkButton");
  checkButton.addEventListener("click", buttonClick);
}
function buttonClick() {
  let BPMe = document.getElementById("BPM");
  BPM = BPMe.value;
  button.style.display = "none";
  ac.style.display = "block";

  let input = document.getElementById("Music");
  if (input.files.length === 0) {
    return;
  }
  const file = input.files[0];
  if (!file.type.match("audio.*")) {
    alert("音声ファイルを選択してください。");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    music.src = reader.result;
    music.pause();
    let ofs = document.getElementById("OffSet")
setTimeout('music.play()', ofs.value * 1000);
    if(document.getElementById("tc").checked){
      showTimer();
    }
  };
  reader.readAsDataURL(file);
}
function getLane(x, y) {
  let lan = Math.floor(( x - 0.5 ) / 0.064);
  return lan+6;
}
function draw() {
  let img = new Image();
  img.src = "hi2.png";
  ctx.drawImage(img, 0, 0, windowWidth, windowHeight);

  ctx.strokeStyle = "white";
  // パスの開始
  ctx.beginPath();
  // 起点
  ctx.moveTo(windowWidth / 2, 0);
  // 終点
  ctx.lineTo(windowWidth / 2, windowHeight);

  // 描画
  ctx.stroke();

  ac.ontouchstart = function (e) {
    e.preventDefault(); // デフォルトイベントをキャンセル
    let s = ""; // 変数sを初期化
    let sd = "";
    // 引数のtouchesプロパティは配列の要素数（触れている指の数）だけ繰り返し処理
    for (let i = 0; i < e.touches.length; i++) {
      let t = e.touches[i]; // 触れている指に関する情報を取得>
      
      let lx = t.pageX / windowWidth;
      let ly = t.pageY /windowHeight;
      s += "[" + i + "]";
      s += "x=" + Math.round( Math.round( lx * 1000 ) / 1000 ) + ",";
      s += "y=" + Math.round( Math.round( ly * 1000 ) / 1000 );
      s += "[" +getLane(lx,ly)+"]"+ "<br>";

      ctx.beginPath();
      ctx.arc(t.pageX, t.pageY, 50, 0, 2 * Math.PI, false);
      ctx.fillStyle = "white";
      ctx.fill();
    }
    document.getElementById("disp").innerHTML = s;  // 生成した文字列を画面に表示
  };

  ac.ontouchmove = function (e) {
    e.preventDefault(); // デフォルトイベントをキャンセル
    let sd = "";
    // 引数のtouchesプロパティは配列の要素数（触れている指の数）だけ繰り返し処理
    for (let i = 0; i < e.touches.length; i++) {
      let t = e.touches[i]; // 触れている指に関する情報を取得

      s += "[" + i + "]";
      s += "x=" + t.pageX + ",";
      s += "y=" + t.pageY + "<br>";

      ctx.beginPath();
      ctx.arc(t.pageX, t.pageY, 50, 0, 2 * Math.PI, false);
      ctx.fillStyle = "white";
      ctx.fill();
    }
  };
}
const paddingZero = (number) => {
    if(number < 10) {
        return ('00' + number).slice(-2)
    }
    return number
}

const startTime = new Date().getTime()
const jac = new Audio();
jac.src="assets/よわい.wav"

const showTimer = () => {
    const currentTime = new Date().getTime()
    const elapsedTime = new Date(currentTime - startTime)

    const h = elapsedTime.getHours()
    const m = elapsedTime.getMinutes()
    const s = elapsedTime.getSeconds()

    //console.log(h + ":" + m + ":" + s + '\r')
    jac.currentTime = 0;
    jac.play();

    const timerId = setTimeout(showTimer,60000/BPM)

}
//ウィンドウサイズが変更されたときに実行される関数
function windowResized() {
  // print("ウィンドウサイズの変更");
  reszCanvas(windowWidth, windowHeight);
}
function reszCanvas(W, H) {
  let canvas = document.querySelector("#ac");
  canvas.width = windowWidth;
  canvas.height = windowHeight;
}

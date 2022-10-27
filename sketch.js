const ac = document.getElementById("ac"); // canvas要素のオブジェクトを取得
const acc = document.querySelector("#ac");
const ctx = acc.getContext("2d");
const button = document.getElementById("button");
const gomil = document.getElementById("gomil");
const playf = document.getElementById("playf");
const outputf = document.getElementById("output");
const bumk = document.getElementById("bunkatsu");

let music = new Audio();
const jac = new Audio();
jac.src = "assets/よわい.mp3";
const tuy = new Audio();
tuy.src = "assets/つよい.mp3";
let BPM;

let playing = false;

let bunkatsu = 4; //n分音符
let shousetsu = 0;//今の小節
let haku = 1;//今の拍

let lanData = [];//タップされたノーツのレーン
let timData = [];//タップされたtiming
let widData = [];//ノーツ幅(デフォルト:3)

let sLanData = [];//レーンタップで光るやつ用
let TchTim = [];

const longSec = 100;//長押しでスライドと判定されるミリ秒数

bumk.addEventListener("change", Updat);
function Updat() {
  if (!playing) {
    bunkatsu = bumk.value;
  }
}
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
  noCanvas();
}
function setting() {
  ac.style.display = "none";
  let checkButton = document.getElementById("checkButton");
  checkButton.addEventListener("click", buttonClick);
  gomil.style.display = "none";
}

function buttonClick() {
  reszCanvas(windowWidth, windowHeight);
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
    music.play().catch(() => {});
    music.pause();
  };
  reader.readAsDataURL(file);
  gomil.style.display = "inline";
}
function tohex(i) {
  return "0123456789abcdefghijklmnopqrstu".charAt(i);
}
playf.addEventListener("click", musicStart);
function musicStart() {
  let ofs = document.getElementById("OffSet");
  setTimeout(function () {
    music.play();
    playing = true;
  }, ofs.value * 1000);
  jac.play().catch(() => {}); //NotAllowedError回避
  jac.pause();
  tuy.play().catch(() => {});
  tuy.pause();
  if (document.getElementById("tc").checked) {
    //メトロノームつける
    nom();
  }
  hakuc();
}
outputf.addEventListener("click", output);
function output() {
  //("000" + num).slice(-3)
  let tex = "This file is Oshiri\n\n";
  tex += "#00002:4\n\n";
  tex += "#BPM01:" + BPM + "\n";
  tex += "#00008:01\n\n";
  let shousetsuData = [];
  let noteData = []; //
  let fLanData = [];

  for (let i = 0; i < lanData.length; i++) {
    //susに読み込みやすくする
    if (lanData[i] === -1) {
    } else {
      //有効なタップなら
      let nowSh = Math.ceil(timData[i] / bunkatsu);
      let nowHak = (timData[i] % bunkatsu) + 1;
      let find = shousetsuData.indexOf(nowSh);
      if (find === -1) {
        //小節がない
        shousetsuData.push(nowSh);
        fLanData.push(lanData[i]);

        let chores = "";
        for (j = 0; j < bunkatsu; j++) {
          if (j + 1 === nowHak) {
            chores += "1" + widData[j];
          } else {
            chores += "00";
          }
        }
        noteData.push(chores);
      } else {
        let find2 = fLanData.indexOf(lanData[i]);
        let k = 0;
        while (
          k < shousetsuData.length - 1 &&
          !(shousetsuData[find2] === nowSh) &&
          !(find2 === -1)
        ) {
          k = find2;
          find2 = fLanData.indexOf(lanData[i], k + 1);
        }
        if (find2 === -1) {
          shousetsuData.push(nowSh);
          fLanData.push(lanData[i]);

          let chores = "";
          for (j = 0; j < bunkatsu; j++) {
            if (j + 1 === nowHak) {
              chores += "1" + widData[i];
            } else {
              chores += "00";
            }
          }
          noteData.push(chores);
        } else {
          //小説もレーンもある
          let chores = noteData[find2];
          let chores2 = "";
          for (j = 0; j < bunkatsu; j++) {
            if (j + 1 === nowHak) {
              chores2 += "1" + widData[i];
            } else {
              chores2 += chores.substr(j * 2, 2);
            }
          }
          noteData[find2] = chores2;
        }
      }
    }
  }
  for (i = 0; i < shousetsuData.length; i++) {
    tex +=
      "#" +
      ("000" + (shousetsuData[i] - 1)).slice(-3) +
      "1" +
      tohex(fLanData[i] + 1) +
      ":";
    tex += noteData[i] + "\n";
  }

  const blob = new Blob([tex], { type: "text/sus" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ファイル名.sus";
  link.click();
}
function getLane(x, y) {
  let lan = Math.floor((x - 0.5) / 0.064);
  if (0 <= lan + 6 <= 11) {
    if (9 <= lan + 6) {
      //はみ出し防止
      return 9;
    } else {
      return lan + 6;
    }
  } else {
    return -1;
  }
}
function getLaneD(x, y) {
  let lan = Math.floor((x - 0.5) / 0.064);
  if (0 <= lan + 6 <= 11) {
    return lan + 6;
  } else {
    return -1;
  }
}
function draw() {
  let img = new Image();
  img.src = "hi2.png";
  ctx.drawImage(img, 0, 0, windowWidth, windowHeight);

  if (playing) {
      ac.ontouchstart = function (e) {
      e.preventDefault(); // デフォルトイベントをキャンセル
      // 引数のtouchesプロパティは配列の要素数（触れている指の数）だけ繰り返し処理
      for (let i = 0; i < e.touches.length; i++) {
        let t = e.touches[i]; // 触れている指に関する情報を取得>

        let lx = t.pageX / windowWidth;
        let ly = t.pageY / windowHeight;

        lanData.push(getLane(lx, ly));
        timData.push(shousetsu * bunkatsu + haku);
        widData.push(3);
    if (getLane(lx,ly) != -1) {
      let f = getLaneD(lx, ly);
      sLanData.push(f);
      TchTim.push(frameCount);
    }
      }
    };
    long_press(ac,addTap,addSlide,longSec)
  }
  for (i = 0; i < sLanData.length; i++) {
    let tick = frameCount - TchTim[i];
    drawLane(sLanData[i] , 0.5 - tick / 20);
    if(tick > 10){
      sLanData.splice(i,1);
      TchTim.splice(i,1);
    }
  }
}
function addTap(){

}
function addSlide(){
  
}
function long_press(el,nf,lf,sec){
  let longclick = false;
  let longtap = false;
  let touch = false;
  let timer;
  el.addEventListener('touchstart',()=>{
    touch = true;
    longtap = false;
    timer = setTimeout(() => {
      longtap = true;
      lf();
    }, sec);
  })
  el.addEventListener('touchend',()=>{
    if(!longtap){
      clearTimeout(timer);
      nf();
    }else{
      touch = false;
    }
  })
  
  el.addEventListener('mousedown',()=>{
    if(touch) return;
    longclick = false;
    timer = setTimeout(() => {
      longclick = true;
      lf();
    }, sec);
  })
  el.addEventListener('click',()=>{
    if(touch){
      touch = false;
      return;
    }
    if(!longclick){
      clearTimeout(timer);
      nf();
    }
  });
}

function drawLane(lane,alf) {
ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,"+alf+")";
  ctx.moveTo((lane * 0.0794 + 0.103) * windowWidth, windowHeight);
  ctx.lineTo(((lane - 1) * 0.0794 + 0.103) * windowWidth, windowHeight);
  ctx.lineTo((lane* 0.0026 +0.487) * windowWidth, 0);
  ctx.lineTo(((lane -1) * 0.0026 +0.487) * windowWidth, 0);
  ctx.closePath();
  ctx.fill();
}
function hakuc() {
  if (haku === bunkatsu) {
    haku = 0;
    shousetsu += 1;
  }
  haku++;
  setTimeout(hakuc, 240000 / BPM / bunkatsu);
}
function mouseClicked() {
  //pc用
  if (playing) {
    let lx = mouseX / windowWidth;
    let ly = mouseY / windowHeight;
    let lane = getLane(lx, ly);

    lanData.push(getLane(lx, ly));
    timData.push(shousetsu * bunkatsu + haku);
    widData.push(3);
    if (lane != -1) {
      let f = getLaneD(lx, ly);
      sLanData.push(f);
      TchTim.push(frameCount);
    }
  }
}
function nom() {
  jac.currentTime = 0;
  jac.play();
  setTimeout(nom, 60000 / BPM);
}
//ウィンドウサイズが変更されたときに実行される関数
function windowResized() {
  // print("ウィンドウサイズの変更");
  reszCanvas(windowWidth, windowHeight);
}
function reszCanvas(W, H) {
  let canvas = document.querySelector("#ac");
  canvas.width = windowWidth;
  canvas.height = windowHeight - 50;
}

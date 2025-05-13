let tahminTamam = false;
let sonTahmin = "";
let sonEtiketler = [];
const ETIKET_TEKRARI = 3;
let classifier;
let video;
let label = "Kamerayı kitabeye doğrultun...";

function preload() {
  classifier = ml5.imageClassifier("https://ardaa83.github.io/konya-kitabeleri/model/model.json");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  let constraints = {
    video: {
      facingMode: { ideal: "environment" }
    },
    audio: false
  };
  
  video = createCapture(constraints).hide();
  
  createButton('Yeniden Tara').position(20, 60).mousePressed(() => {
    tahminTamam = false;
    sonTahmin = "";
    sonEtiketler = [];
    label = "Yeniden taranıyor...";
    loop(); // draw() fonksiyonunu yeniden başlat
  });
  
  classifyVideo();
}

function classifyVideo() {
  if (!tahminTamam && classifier && video) {
    let input = video.get();
    input.resize(224, 224);
    classifier.classify(input, gotResult);
  }
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  if (results && results[0]) {
    if (results[0].confidence >= 0.9) {
      sonEtiketler.push(results[0].label);
      
      if (sonEtiketler.length > ETIKET_TEKRARI) {
        sonEtiketler.shift();
      }

      // 3 kez aynı sonuç gelirse kesinleştir
      if (sonEtiketler.length === ETIKET_TEKRARI && 
          sonEtiketler.every(etiket => etiket === sonEtiketler[0])) {
        tahminTamam = true;
        sonTahmin = sonEtiketler[0];
        label = sonTahmin;
        noLoop(); // draw() fonksiyonunu durdur
      }
    }
  }

  if (!tahminTamam) {
    setTimeout(classifyVideo, 2000);
  }
}

function draw() {
  background(240);
  
  // Kamera görüntüsü (tahmin yapılmış olsa bile göster)
  imageMode(CENTER);
  let camSize = min(width, height) * 0.8;
  image(video, width/2, height/2, camSize, camSize * 0.75);
  
  // Tahmin metni
  fill(0);
  textSize(24);
  textAlign(CENTER);
  text(label, width/2, height - 50);
  
  // Eğer kesin tahmin yapıldıysa bilgiyi göster
  if (tahminTamam) {
    fill(255, 200);
    rect(width/2, height/2, width*0.9, 200, 20);
    fill(0);
    textSize(16);
    text("Tahmin kesinleşti: " + sonTahmin, width/2, height/2);
  }
}

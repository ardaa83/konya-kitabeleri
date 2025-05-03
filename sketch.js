let classifier;
let img;
let label = "Henüz tahmin yapılmadı.";
let bilgiler = {
  "Konevi Camii Kitabesi": "Bu mübarek mamure içindeki muhakkik ve rabbani alim Sadreddin Muhammed ibn ishak ibn Muhammed'in -Allah kendisinden razı olsun- türbesi; vakviyesinde şartları belli edildiği ve yazıldığı şekilde kendisinin vakfeylediği kitapları ihtiva eden kütüphanesiyle beraber ashabından; kalpleriyle ve kalıplarıyla Tanrı'ya yönelen salih fakirler adına 673 yılı aylarında yapıldı",
  "Haghia Elena Kilisesi Kitabesi": "1- 327 Tarihinde bu şerif kilisemizi Aya Elena 2- Mihail Arhankolos isminde kurdu temeli 3-Halen Kilisemizin üçüncü tamiri şevketlü 4-Sultan Mahmud efendimiz ihsan eyledi emri 5-Epit Robos Sarraf Hacı İliya oldu tekmil nazırı 6- Mihail Arhankolos'un şefaati ile hal teala 7- İmdad edenler ve zahmet çekenlere verecek ecri Sene: 18 Şubat 1833",
  "Abdül Mümin Mescidi Kitabesi": "1-Muğarebe Mescidi olarak bilinen bu mübarek mescidin yenilenmesini; Büyük sultan, Allah'ın alemdeki gölgesi, fethin babası (fatih), müslümanların sultanı Gıyassedin Keyhüsrev bin Kılıçarslan -Allah onun devletini devamlı kılıp yardım etsin- döneminde 2-Allah'ın rahmetine muhtaç, zayıf bir kul olan Hac Emiri'nin oğlu Mahmud -Allah onun saadetini devamlı kılsın ve ona güzel bir son versin- 674 yılında emretti. Hamd Allah'a mahsustur, O birdir. Salat, peygamberimiz Muhammed'in (s.a.v.) üzerine olsun",
  "Karatay Medresesi Kitabesi": "Ulu Tanrı şöyle buyuruyor: 'Allah iyilik yapanların ecrini sevabını katiyen zayi etmez.' Bu mübarek mamurenin kurulmasını, 649 yılı aylarında Kılıçaslan oğlu Mesud oğlu Kılıçaslan oğlu Lehid Sultan Keyhüsrevzade, Tanrının yeryüzünde gölgesi, din ve dünyanın ulusu fetih babası Sultan Keykavus'un hükümdarlığı günlerinde Abdullah oğlu Karatayi emretti. Tanrı bunu yaptıranı mağfiret etsin."
};
let video;
let camWidth, camHeight;

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
  
  video = createCapture(constraints);
  video.size(640, 480);
  video.hide();
  let uploadBtn = createFileInput(handleFile);
  uploadBtn.position(20, 20);
  textAlign(CENTER, CENTER);
  textSize(18);
  background(240);
  text("Bir görsel yükleyin...", width / 2, height / 2);
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      classifyImage();
    });
  }
}

function classifyImage() {
  if (img && classifier) {
    image(img, 0, 0, 400, 200);
    let input = get(0, 0, 400, 200);
    classifier.classify(input, gotResult);
  }
}


function gotResult(error, results) {
  if (error) {
    console.error("Tahmin sırasında hata:", error);
    label = "Tahmin başarısız.";
    return;
  }

  if (results && results[0]) {
    label = results[0].label;
  } else {
    label = "Sonuç alınamadı.";
  }
}

function draw() {
  background(240);
  camWidth = width * 0.9;
  camHeight = camWidth * 3 / 4;
  image(video, width / 2 - 180, 40, 360, 240);

  if (!img) {
    imageMode(CENTER);
    image(video, width * 0.05, height * 0.1, camWidth, camHeight);
  }

  fill(0);
  textSize(22);
  textAlign(CENTER);
  text("Tahmin: " + label, width / 2, height * 0.75);

  if (bilgiler[label]) {
    // Bilgi kutusu arka planı
    fill(255);
    rectMode(CENTER);
    rect(width / 2, height * 0.87, width * 0.9, 100, 16);

    // Bilgi metni
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(bilgiler[label], width / 2, height * 0.87, width * 0.85);
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// Değişkenler
let tahminTamam = false;
let sonEtiketler = [];
const ETIKET_TEKRARI = 3;
let classifier;
let img;
let video;
let label = "Kamerayı kitabeye doğrultun...";
let bilgiler = {
  "Konevi Camii Kitabesi": "Bu mübarek mamure içindeki muhakkik ve rabbani alim Sadreddin Muhammed ibn ishak ibn Muhammed'in -Allah kendisinden razı olsun- türbesi; vakviyesinde şartları belli edildiği ve yazıldığı şekilde kendisinin vakfeylediği kitapları ihtiva eden kütüphanesiyle beraber ashabından; kalpleriyle ve kalıplarıyla Tanrı'ya yönelen salih fakirler adına 673 yılı aylarında yapıldı",
  "Haghia Elena Kilisesi Kitabesi": "1- 327 Tarihinde bu şerif kilisemizi Aya Elena 2- Mihail Arhankolos isminde kurdu temeli 3-Halen Kilisemizin üçüncü tamiri şevketlü 4-Sultan Mahmud efendimiz ihsan eyledi emri 5-Epit Robos Sarraf Hacı İliya oldu tekmil nazırı 6- Mihail Arhankolos'un şefaati ile hal teala 7- İmdad edenler ve zahmet çekenlere verecek ecri Sene: 18 Şubat 1833",
  "Abdül Mümin Mescidi Kitabesi": "1-Muğarebe Mescidi olarak bilinen bu mübarek mescidin yenilenmesini; Büyük sultan, Allah'ın alemdeki gölgesi, fethin babası (fatih), müslümanların sultanı Gıyassedin Keyhüsrev bin Kılıçarslan -Allah onun devletini devamlı kılıp yardım etsin- döneminde 2-Allah'ın rahmetine muhtaç, zayıf bir kul olan Hac Emiri'nin oğlu Mahmud -Allah onun saadetini devamlı kılsın ve ona güzel bir son versin- 674 yılında emretti. Hamd Allah'a mahsustur, O birdir. Salat, peygamberimiz Muhammed'in (s.a.v.) üzerine olsun",
  "Karatay Medresesi Kitabesi": "Ulu Tanrı şöyle buyuruyor: 'Allah iyilik yapanların ecrini sevabını katiyen zayi etmez.' Bu mübarek mamurenin kurulmasını, 649 yılı aylarında Kılıçaslan oğlu Mesud oğlu Kılıçaslan oğlu Lehid Sultan Keyhüsrevzade, Tanrının yeryüzünde gölgesi, din ve dünyanın ulusu fetih babası Sultan Keykavus'un hükümdarlığı günlerinde Abdullah oğlu Karatayi emretti. Tanrı bunu yaptıranı mağfiret etsin."
};

// ML5 Modelini Yükle
function preload() {
  classifier = ml5.imageClassifier("https://ardaa83.github.io/konya-kitabeleri/model/model.json");
}

// Kamera ve Canvas Ayarları
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Kamera Ayarları
  let constraints = {
    video: {
      facingMode: { ideal: "environment" }
    },
    audio: false
  };
  video = createCapture(constraints);
  video.size(width * 0.8, height * 0.5);
  video.hide();
  
  // Butonlar
  createFileInput(handleFile).position(20, 20);
  createButton('Yeniden Tara').position(20, 60).mousePressed(restartModel);
  
  // İlk Tahmini Başlat
  classifyVideo();
}

// Dosya Yükleme
function handleFile(file) {
  if (file.type === 'image') {
    img = createImg(file.data, '').hide();
    classifyImage();
  }
}

// Görselden Tahmin Yap
function classifyImage() {
  if (img && classifier) {
    classifier.classify(img.elt, gotResult);
  }
}

// Videodan Tahmin Yap
function classifyVideo() {
  if (!tahminTamam && classifier && video) {
    let input = video.get();
    input.resize(224, 224);
    classifier.classify(input, gotResult);
  }
}

// Sonuçları İşle
function gotResult(error, results) {
  if (error) {
    console.error("Hata:", error);
    return;
  }

  if (results && results[0]) {
    if (results[0].confidence < 0.85) {
      if (!tahminTamam) label = "Kitabe algılanamadı";
    } else {
      sonEtiketler.push(results[0].label);
      if (sonEtiketler.length > ETIKET_TEKRARI) sonEtiketler.shift();

      // 3 kez aynı sonuç gelirse onayla
      if (sonEtiketler.every(l => l === results[0].label) && !tahminTamam) {
        label = results[0].label;
        tahminTamam = true;
      }
    }
  }

  // Tahmin yapılmadıysa 1 saniye sonra tekrar dene
  if (!tahminTamam) setTimeout(classifyVideo, 1000);
}

// Yeniden Tara Butonu
function restartModel() {
  console.log("Yeniden tara butonu çalıştı!"); // Konsolda kontrol
  tahminTamam = false;
  sonEtiketler = [];
  label = "Yeniden taranıyor...";
  classifyVideo();
}

// Ekranı Çiz
function draw() {
  background(240);
  
  // Kamera Görüntüsü
  imageMode(CENTER);
  let camWidth = width * 0.8;
  image(video, width / 2, height / 2 - 100, camWidth, camWidth * 0.75);

  // Tahmin Metni
  fill(0);
  textSize(width * 0.04);
  textAlign(CENTER);
  text("Tahmin: " + label, width / 2, height - 160);

  // Kitabe Bilgisi (Sabitlenmişse)
  if (tahminTamam && bilgiler[label]) {
    fill(255, 230);
    rect(width / 2, height - 120, width * 0.9, 160, 20);
    fill(0);
    textSize(16);
    text(bilgiler[label], width / 2, height - 120, width * 0.85);
  }
}

// Pencere Boyutu Değişirse
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

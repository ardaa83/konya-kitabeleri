let classifier;
let img;
let kutuGenislik;
let kutuYukseklik;
let video;
let label = "Henüz tahmin yapılmadı.";
let tahminYapildi = false;
let bilgiler = {
  "Konevi Camii Kitabesi": "Bu mübarek mamure içindeki muhakkik ve rabbani alim Sadreddin Muhammed ibn ishak ibn Muhammed'in -Allah kendisinden razı olsun- türbesi; vakviyesinde şartları belli edildiği ve yazıldığı şekilde kendisinin vakfeylediği kitapları ihtiva eden kütüphanesiyle beraber ashabından; kalpleriyle ve kalıplarıyla Tanrı'ya yönelen salih fakirler adına 673 yılı aylarında yapıldı",
  "Haghia Elena Kilisesi Kitabesi": "1- 327 Tarihinde bu şerif kilisemizi Aya Elena 2- Mihail Arhankolos isminde kurdu temeli 3-Halen Kilisemizin üçüncü tamiri şevketlü 4-Sultan Mahmud efendimiz ihsan eyledi emri 5-Epit Robos Sarraf Hacı İliya oldu tekmil nazırı 6- Mihail Arhankolos'un şefaati ile hal teala 7- İmdad edenler ve zahmet çekenlere verecek ecri Sene: 18 Şubat 1833",
  "Abdül Mümin Mescidi Kitabesi": "1-Muğarebe Mescidi olarak bilinen bu mübarek mescidin yenilenmesini; Büyük sultan, Allah'ın alemdeki gölgesi, fethin babası (fatih), müslümanların sultanı Gıyassedin Keyhüsrev bin Kılıçarslan -Allah onun devletini devamlı kılıp yardım etsin- döneminde 2-Allah'ın rahmetine muhtaç, zayıf bir kul olan Hac Emiri'nin oğlu Mahmud -Allah onun saadetini devamlı kılsın ve ona güzel bir son versin- 674 yılında emretti. Hamd Allah'a mahsustur, O birdir. Salat, peygamberimiz Muhammed'in (s.a.v.) üzerine olsun",
  "Karatay Medresesi Kitabesi": "Ulu Tanrı şöyle buyuruyor: 'Allah iyilik yapanların ecrini sevabını katiyen zayi etmez.' Bu mübarek mamurenin kurulmasını, 649 yılı aylarında Kılıçaslan oğlu Mesud oğlu Kılıçaslan oğlu Lehid Sultan Keyhüsrevzade, Tanrının yeryüzünde gölgesi, din ve dünyanın ulusu fetih babası Sultan Keykavus'un hükümdarlığı günlerinde Abdullah oğlu Karatayi emretti. Tanrı bunu yaptıranı mağfiret etsin."
};
const bilgiAnahtarlari = Object.keys(bilgiler);

function normalizeMetin(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function getBilgiByLabel(rawLabel) {
  if (!rawLabel) return null;
  if (bilgiler[rawLabel]) return bilgiler[rawLabel];

  const cleaned = String(rawLabel).trim();
  if (bilgiler[cleaned]) return bilgiler[cleaned];

  const normalizedLabel = normalizeMetin(cleaned);
  for (const key of bilgiAnahtarlari) {
    if (normalizeMetin(key) === normalizedLabel) {
      return bilgiler[key];
    }
  }
  for (const key of bilgiAnahtarlari) {
    const normalizedKey = normalizeMetin(key);
    if (normalizedKey.includes(normalizedLabel) || normalizedLabel.includes(normalizedKey)) {
      return bilgiler[key];
    }
  }
  return null;
}

function getCanvasSize() {
  const w = Math.max(300, Math.min(windowWidth - 24, 960));
  const h = Math.max(360, Math.min(windowHeight * 0.72, 760));
  return { w, h };
}

function preload() {
  classifier = ml5.imageClassifier("https://ardaa83.github.io/konya-kitabeleri/model/model.json");
}

function windowResized() {
  const { w, h } = getCanvasSize();
  resizeCanvas(w, h);
  kutuGenislik = width * 0.92;
  kutuYukseklik = Math.min(height * 0.35, 220);
}

function setup() {
  const { w, h } = getCanvasSize();
  createCanvas(w, h);
  kutuGenislik = width * 0.92;
  kutuYukseklik = Math.min(height * 0.35, 220);

  let constraints = {
    video: {
      facingMode: { ideal: "environment" }
    },
    audio: false
  };

  video = createCapture(constraints);
  video.size(224, 224);
  video.hide();

  let uploadBtn = createFileInput(handleFile);
  uploadBtn.position(20, 20);

  textAlign(CENTER, CENTER);
  textSize(18);
  background(240);
  text("Bir görsel yükleyin...", width / 2, height / 2);

  classifyVideo();
}

function handleFile(file) {
  if (file.type === "image") {
    img = loadImage(file.data, () => {
      classifyImage();
    });
  }
}

function classifyImage() {
  if (img && classifier) {
    image(img, 0, 0, 224, 224);
    let input = get(0, 0, 224, 224);
    classifier.classify(input, gotResultImage);
  }
}

function classifyVideo() {
  if (tahminYapildi || !video || !classifier) {
    return;
  }

  classifier.classify(video, gotResultVideo);
}

function gotResultImage(error, results) {
  if (error) {
    console.error("Tahmin sırasında hata:", error);
    label = "Tahmin başarısız.";
    return;
  }

  if (results && results[0]) {
    if (results[0].confidence < 0.95) {
      label = "Kitabe algılanamadı";
    } else {
      label = results[0].label;
      tahminYapildi = true;
      console.log("Kitabe tanındı: " + label);
    }
  }
}

function gotResultVideo(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  if (results && results[0]) {
    if (results[0].confidence < 0.95) {
      label = "Kitabe algılanamadı";
      classifyVideo();
    } else {
      label = results[0].label;
      tahminYapildi = true;
      console.log("Kitabe tanındı: " + label);
    }
  } else {
    classifyVideo();
  }
}

function getLayout() {
  const aktifBilgi = getBilgiByLabel(label);
  const padding = Math.max(12, width * 0.03);
  const labelHeight = 44;
  const showInfo = Boolean(aktifBilgi);
  const infoHeight = showInfo ? kutuYukseklik : 0;
  const gap = showInfo ? 12 : 0;
  const availableHeight = Math.max(180, height - (padding * 2 + labelHeight + infoHeight + gap + 16));
  const availableWidth = Math.max(180, width - padding * 2);
  const cameraSize = Math.max(170, Math.min(availableWidth, availableHeight));
  const cameraX = width / 2;
  const cameraY = padding + cameraSize / 2;
  const labelY = cameraY + cameraSize / 2 + 26;

  return {
    padding,
    showInfo,
    aktifBilgi,
    infoHeight,
    cameraSize,
    cameraX,
    cameraY,
    labelY
  };
}

function draw() {
  background(240);

  if (video) {
    const layout = getLayout();

    imageMode(CENTER);
    image(video, layout.cameraX, layout.cameraY, layout.cameraSize, layout.cameraSize);

    fill(0);
    textSize(Math.max(16, width * 0.03));
    textAlign(CENTER, CENTER);
    text("Tahmin: " + label, width / 2, layout.labelY);

    if (layout.showInfo) {
      const infoCenterY = layout.labelY + layout.infoHeight / 2 + 18;
      const infoTextX = (width - kutuGenislik) / 2 + kutuGenislik * 0.05;
      const infoTextY = infoCenterY - layout.infoHeight / 2 + 8;
      const infoTextW = kutuGenislik * 0.9;
      const infoTextH = layout.infoHeight - 16;
      fill(255);
      rectMode(CENTER);
      rect(width / 2, infoCenterY, kutuGenislik, layout.infoHeight, 16);

      fill(0);
      textSize(Math.max(13, width * 0.02));
      textAlign(LEFT, TOP);
      text(layout.aktifBilgi, infoTextX, infoTextY, infoTextW, infoTextH);
    }
  }
}

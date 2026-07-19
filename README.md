# İnteraktif Periyodik Tablo

[Dilum Sanjaya'nın "Animated Periodic Table"](https://codepen.io/dilums/pen/oNzyeEv) demosundan
esinlenen, çok daha gelişmiş ve tamamen interaktif bir periyodik tablo. Bağımlılık yok — saf
HTML + CSS + JavaScript.

## Çalıştırma

Herhangi bir statik sunucu yeterli:

```bash
python3 -m http.server 8317
# http://localhost:8317
```

## Özellikler

- **Altıgen bal peteği düzeni** ve faz animasyonları: katılar dolu, sıvılar dalgalanan yüzey,
  gazlar süzülen atomlar. Grup (1–18) ve periyot (1–7) numaraları; üzerine gelince aynı grup ve
  periyottaki elementler vurgulanır.
- **Sıcaklık kaydırıcısı (0–6000 K):** her elementin fazı gerçek erime/kaynama noktalarına göre
  canlı hesaplanır. Ön ayarlar: 0 K, sıvı azot, oda, demirin erime noktası, Güneş yüzeyi.
  Katı/sıvı/gaz sayaçları anlık güncellenir.
- **Keşif zaman çizelgesi (1650–2020):** yıl kaydırıcısını sürükledikçe elementler keşif
  sırasına göre belirir — 1800'de yalnızca 35 element!
- **Görünüm modları:** Kategori, Faz + 8 ısı haritası (elektronegatiflik, yoğunluk, iyonlaşma
  enerjisi, kütle, atom yarıçapı, keşif yılı, erime ve kaynama noktası).
- **Detay paneli:** animasyonlu **Bohr atom modeli**, gerçek element fotoğrafı, Türkçe tanıtım,
  **orbital doluluk diyagramı** (↑↓ okları, Hund kuralı), **emisyon spektrumu**, oksidasyon
  basamakları, atom yarıçapı, keşif yılı ve daha fazlası; Vikipedi (TR) + Wikipedia (EN)
  bağlantıları.
- **Karşılaştırma modu:** iki elemente tıkla, 7 özelliği yan yana çubuklarla kıyasla.
- **Quiz modu:** 10 soruluk mini oyun — "tabloda bul" ve "hangisi daha yüksek?" soruları,
  skor takibi.
- **TR / EN dil değiştirici** ve **URL ile paylaşım** (`#el=Fe&t=3500&m=density&y=1900` gibi) —
  görünümün aynısını linkle paylaş.
- **Arama** (sembol, Türkçe/İngilizce isim, numara) ve tıklanabilir **lejant filtresi**.

## Nüklit Haritası (`nuclides.html`)

Periyodik tablonun kardeş sayfası: 3386 nüklitlik interaktif **Segrè diyagramı**.

- Bozunma moduna göre renkli harita (β⁻, β⁺/EC, α, SF, p, n) veya yarı ömür ısı haritası.
- **Zaman kaydırıcısı** (zeptosaniye → evrenin yaşı): sürükledikçe kısa ömürlü çekirdekler
  kaybolur, kararlılık vadisi ortaya çıkar.
- Nüklite tıklayınca **bozunma zinciri** hem listede hem haritada çizilir
  (ör. ²³⁸U'dan ²⁰⁶Pb'ye 15 adım).
- Sihirli sayı çizgileri (2, 8, 20, 28, 50, 82, 126), yakınlaştırma/gezinme, element arama.
- Periyodik tablodaki element panelinden "🧭 İzotoplar" ile geçiş yapılır.
- Veri: [IAEA Livechart API](https://nds.iaea.org/relnsd/vcharthtml/VChartHTML.html)
  (taban durumları, yarı ömürler, bozunma modları, keşif yılları).

## Dosyalar

- `index.html` — sayfa iskeleti
- `style.css` — tema ve yerleşim (masaüstü + mobil)
- `app.js` — tüm uygulama mantığı ve animasyonlar
- `data.js` — 118 elementin verisi: [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON)
  + [PubChem](https://pubchem.ncbi.nlm.nih.gov/periodic-table/) (keşif yılı, atom yarıçapı,
  oksidasyon basamakları) veri setlerinden türetildi; Türkçe isimler ve tanıtımlar eklendi.
  Element fotoğrafları ve spektrum görselleri Wikimedia Commons'tan yüklenir.

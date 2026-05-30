# 🎲 Jumanji Board Game Engine

Jumanji temasında, satranç tahtası mantığında, dokulu taşlar ve yaratıcı kartlarla geliştirilmiş modern bir board game motoru.

## ✨ Özellikler

### 🎮 Oyun Mekanikleri
- **Zar Atma:** Klasik 6 yüzlü zar sistemi
- **Taş Efektleri:** İleri, geri, tuzak, tur kaybı, ışınlanma, olay kartları
- **Çok Oyuncu:** 2-4 oyuncu desteği
- **Jumanji Kartları:** Tematik olay kartları

### 🎨 Görsel Tasarım
- **Grid Sistemi:** Satranç tahtası gibi düz grid görünümü
- **İzometrik Görünüm:** 3D benzeri görsel alternatif
- **Dokulu Taşlar:** 
  - 💎 Mermer (başlangıç/bitiş)
  - 🪵 Ahşap (ileri/geri)
  - 🪨 Taş (tuzak/tur kaybı)
  - 🧵 Kumaş (olay kartları)
  - ⚙️ Metal (ışınlanma)
- **Oyuncu Tokenları:** Animasyonlu, renkli, kişiselleştirilebilir
- **Jumanji Kartları:** Parlama efektleri, animasyonlar, dekoratif tasarım

### 🛠️ Teknik Özellikler
- **React + TypeScript:** Tip güvenliği ve modern geliştirme
- **Vite:** Hızlı build ve development
- **TailwindCSS:** Responsive tasarım
- **SVG Grafikleri:** Ölçeklenebilir vektör grafikleri
- **CSS Animasyonları:** Akıcı ve performans-optimized

## 📁 Proje Yapısı

```
mini-games/
├── jumanji-engine/          # Motor Versiyonu (Temel Engine)
│   └── Monolitik yapı, hızlı prototipleme
│
├── jumanji-playable/        # Oynanabilir Versiyon (Modüler)
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   ├── data/               # Oyun mantığı ve veri
│   ├── types.ts            # TypeScript türleri
│   └── Tam işlevsel oyun
│
└── DEVELOPMENT_GUIDE.md    # Geliştirme rehberi
```

## 🚀 Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/myag07/mini-games.git
cd mini-games

# Oynanabilir versiyona git
cd jumanji-playable

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## 🎯 Kullanım

### Oyun Başlatma
1. Geliştirme sunucusunu başlat: `npm run dev`
2. Tarayıcıda `http://localhost:5173` aç
3. Oyun otomatik olarak yüklenecek

### Tahta Modunu Değiştirme
- **Grid Modu:** Satranç tahtası gibi düz görünüm
- **İzometrik Modu:** 3D benzeri görünüm
- Üst sağ köşedeki butonlarla geçiş yap

### Oyun Oynama
1. Sıradaki oyuncu "Zar At" butonuna tıkla
2. Zar sonucuna göre otomatik ilerleme
3. Taş efektleri uygulanır
4. Sıra sonraki oyuncuya geçer
5. İlk bitişe ulaşan oyunu kazanır

## 📊 Veri Yapıları

### Taş (Tile)
```typescript
{
  id: string;
  index: number;        // Sıra
  type: EffectType;     // Taş tipi
  label: string;        // Adı
  icon: string;         // Emoji
  color: string;        // Renk
  value?: number;       // Efekt değeri
  cardText?: string;    // Kart metni
}
```

### Oyuncu (Player)
```typescript
{
  id: number;
  name: string;
  position: number;     // Mevcut taş
  color: string;        // Renk
  token: string;        // Emoji
  skipNext: boolean;    // Tur kaybı
  finished: boolean;    // Bitirdi mi
}
```

## 🎨 Bileşenler

### GridBoard
Satranç tahtası mantığında grid tabanlı tahta görünümü.

```typescript
<GridBoard 
  game={gameConfig}
  players={players}
  mode="grid"
  onSelect={handleSelect}
/>
```

### TexturedTile
Dokulu taş bileşeni.

```typescript
<TexturedTile
  color="#22c55e"
  icon="🌿"
  label="Güvenli"
  textureType="stone"
  isSelected={true}
/>
```

### JumanjiCard
Jumanji temalı olay kartı.

```typescript
<JumanjiCard
  card={cardData}
  isOpen={true}
  onClose={handleClose}
/>
```

### PlayerToken
Animasyonlu oyuncu tokenı.

```typescript
<PlayerToken
  token="🦁"
  color="#f59e0b"
  name="Oyuncu 1"
  isActive={true}
/>
```

## 🎮 Oyun Türleri

### Başlangıç Taşları
- **Başlangıç (🏁):** Oyunun başladığı yer
- **Bitiş (🏆):** Kazanmak için ulaşılması gereken yer

### Efekt Taşları
- **Güvenli (🌿):** Hiçbir şey olmaz
- **İleri (⏩):** N kare ilerleme
- **Geri (⏪):** N kare geriye gitme
- **Tuzak (🪤):** 2 kare geri
- **Tur Kaybı (💤):** Sıradaki turu geç
- **Işınlanma (🌀):** Belirtilen kareye git
- **Olay Kartı (🎴):** Jumanji kartı çek

## 🎲 Jumanji Kartları

Oyunda rastgele çekilen tematik kartlar:

- 🦁 "Bir aslan sürüsü peşinde! 2 kare geri kaç."
- 🌧️ "Tropik yağmur başladı, zemin kaygan. Bu tur bekle."
- 🗺️ "Gizli bir patika buldun, 3 kare ilerle."
- 🐒 "Maymunlar pusulanı çaldı. 1 kare geri."
- 💪 "Cesur davrandın, zar tekrar at gibi 2 ileri."
- 🏜️ "Quicksand! Bataklığa saplandın, yerinde kal."
- 🗺️ "Bir kâşifin haritasını buldun, başlangıca yakın bir kestirme: 4 ileri."
- 🕷️ "Dev örümcek ağı! 2 kare geri savruldun."

## 🔧 Geliştirme

### Yeni Bileşen Ekleme
1. `src/components/` klasöründe yeni dosya oluştur
2. React bileşeni yazı
3. `PlayMode.tsx`'e import et
4. Kullan

### Oyun Mantığını Değiştirme
1. `src/data/gameLogic.ts` dosyasını düzenle
2. `EFFECT_META` veya `JUMANJI_CARDS` güncelle
3. Değişiklikleri test et

### Stil Özelleştirme
- TailwindCSS: `src/index.css`
- Inline styles: Bileşenlerde doğrudan
- SVG: `TexturedTile.tsx` ve `JumanjiCard.tsx`

## 📚 Kaynaklar

- [Geliştirme Rehberi](./DEVELOPMENT_GUIDE.md)
- [React Dokümantasyonu](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 📝 Lisans

MIT

## 👥 Katkıda Bulunma

Katkılar hoş karşılanır! Lütfen:
1. Fork et
2. Feature branch oluştur (`git checkout -b feature/AmazingFeature`)
3. Commit et (`git commit -m 'Add some AmazingFeature'`)
4. Push et (`git push origin feature/AmazingFeature`)
5. Pull Request aç

## 🐛 Hata Raporlama

Hata bulduğunuzda lütfen [Issues](https://github.com/myag07/mini-games/issues) bölümünde rapor edin.

## 🎉 Teşekkürler

Bu proje Jumanji'nin klasik board game mekanikleri ve modern web teknolojilerinin birleşimidir.

---

**Sürüm:** 1.0.0  
**Son Güncelleme:** 2026-05-30  
**Durum:** Aktif Geliştirme 🚀

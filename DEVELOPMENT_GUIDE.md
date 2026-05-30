# Jumanji Board Game Engine - Geliştirme Rehberi

## 📋 Proje Yapısı

```
mini-games/
├── jumanji-engine/          # Motor Versiyonu (Temel Engine)
│   ├── src/
│   │   ├── App.tsx          # Ana uygulama (monolitik)
│   │   ├── index.css        # Stiller
│   │   └── main.tsx         # Entry point
│   └── package.json
│
├── jumanji-playable/        # Oynanabilir Versiyon (Modüler)
│   ├── src/
│   │   ├── App.tsx          # Ana uygulama
│   │   ├── components/      # Bileşen kütüphanesi
│   │   │   ├── BuildPanel.tsx
│   │   │   ├── Editor.tsx
│   │   │   ├── IsometricBoard.tsx
│   │   │   ├── PlayMode.tsx
│   │   │   ├── GridBoard.tsx          # ✨ YENİ: Grid tabanlı tahta
│   │   │   ├── TexturedTile.tsx       # ✨ YENİ: Dokulu taşlar
│   │   │   ├── JumanjiCard.tsx        # ✨ YENİ: Yaratıcı kartlar
│   │   │   └── PlayerToken.tsx        # ✨ YENİ: Oyuncu tokenları
│   │   ├── data/
│   │   │   └── gameLogic.ts           # Oyun mantığı
│   │   ├── types.ts                   # TypeScript türleri
│   │   └── utils/
│   │       └── cn.ts                  # Utility fonksiyonları
│   └── package.json
│
└── DEVELOPMENT_GUIDE.md    # Bu dosya
```

## 🎮 Versiyon Karşılaştırması

### Motor Versiyonu (jumanji-engine)
- **Amaç:** Temel oyun motorunun referans uygulaması
- **Yapı:** Monolitik (tek dosyada)
- **Kullanım:** Oyun mantığının temel prototiplemesi
- **Avantajlar:** Basit, hızlı prototipleme
- **Dezavantajlar:** Yeniden kullanılabilirlik sınırlı

### Oynanabilir Versiyon (jumanji-playable)
- **Amaç:** Tam işlevsel, üretim-hazır oyun
- **Yapı:** Modüler bileşenler
- **Kullanım:** Gerçek oyun oynama deneyimi
- **Avantajlar:** Genişletilebilir, bakım kolay
- **Dezavantajlar:** Daha karmaşık yapı

## 🎨 Yeni Özellikler (Aşama 3-4)

### 1. Grid Sistemi (GridBoard.tsx)
```typescript
// Satranç tahtası mantığında grid tabanlı tahta
// Özellikler:
- Düz grid görünümü (isometric alternatifi)
- Tam satranç tahtası gibi hizalama
- Taş seçimi ve vurgulama
- Oyuncu pozisyonları
```

### 2. Dokulu Taşlar (TexturedTile.tsx)
```typescript
// Mermer, ahşap, taş, kumaş, metal dokular
// Dokular:
- marble: Parlak mermer efekti
- wood: Ahşap desen
- stone: Taş dokular
- fabric: Kumaş deseni
- metal: Metal parlaklığı
```

### 3. Yaratıcı Kartlar (JumanjiCard.tsx)
```typescript
// Jumanji temalı olay kartları
// Özellikler:
- Animasyonlu açılış/kapanış
- Renkli gradyan tasarımı
- Parlama efektleri
- Dekoratif köşeler
```

### 4. Oyuncu Tokenları (PlayerToken.tsx)
```typescript
// Animasyonlu oyuncu figürleri
// Özellikler:
- Aktif oyuncu için nabız efekti
- Bitişe ulaşan oyuncu için dönüş animasyonu
- Kişiselleştirilebilir renkler
- Farklı boyutlar (sm, md, lg)
```

## 🔄 Birleştirme Stratejisi

### Faz 1: Modüler Yapı
Motor versiyonundan PlayMode bileşeni:
```typescript
// jumanji-engine/src/App.tsx'den PlayMode mantığını çıkart
// jumanji-playable/src/components/PlayMode.tsx'e entegre et
```

### Faz 2: Paylaşılan Mantık
```typescript
// Ortak dosyalar:
- types.ts (veri yapıları)
- gameLogic.ts (oyun kuralları)
- cn.ts (utility fonksiyonları)
```

### Faz 3: UI Bileşenleri
```typescript
// jumanji-playable'daki bileşenleri kullan:
- GridBoard (yeni grid sistemi)
- TexturedTile (dokulu taşlar)
- JumanjiCard (yaratıcı kartlar)
- PlayerToken (oyuncu tokenları)
```

## 🚀 Kullanım Örnekleri

### Grid Modunu Etkinleştirme
```typescript
import GridBoard from './components/GridBoard';

<GridBoard 
  game={gameConfig}
  players={players}
  mode="grid"  // 'grid' | 'isometric'
  onSelect={handleTileSelect}
/>
```

### Dokulu Taş Kullanımı
```typescript
import TexturedTile from './components/TexturedTile';

<TexturedTile
  color="#22c55e"
  icon="🌿"
  label="Güvenli"
  textureType="stone"  // 'marble' | 'wood' | 'stone' | 'fabric' | 'metal'
  isSelected={true}
  onClick={handleClick}
/>
```

### Jumanji Kartı Gösterme
```typescript
import JumanjiCard from './components/JumanjiCard';

<JumanjiCard
  card={{
    title: "ASLAN SALDIRISI",
    text: "Bir aslan sürüsü peşinde! 2 kare geri kaç.",
    icon: "🦁",
    color: "#f59e0b"
  }}
  isOpen={showCard}
  onClose={handleCloseCard}
/>
```

### Oyuncu Tokenı Kullanımı
```typescript
import PlayerToken from './components/PlayerToken';

<PlayerToken
  token="🦁"
  color="#f59e0b"
  name="Oyuncu 1"
  isActive={true}
  size="lg"
/>
```

## 📊 Veri Yapıları

### Tile (Taş)
```typescript
interface Tile {
  id: string;
  index: number;           // Taş sırası (0 = başlangıç)
  type: EffectType;        // 'start' | 'finish' | 'safe' | 'forward' | 'back' | 'skip' | 'teleport' | 'event' | 'trap'
  label: string;           // Taş adı
  icon: string;            // Emoji
  color: string;           // Hex renk
  value?: number;          // Forward/back/teleport değeri
  cardText?: string;       // Jumanji kartı metni
}
```

### Player (Oyuncu)
```typescript
interface Player {
  id: number;
  name: string;
  position: number;        // Mevcut taş indeksi
  color: string;           // Oyuncu rengi
  token: string;           // Oyuncu emojisi
  skipNext: boolean;       // Sıradaki turu geç
  finished: boolean;       // Oyunu bitirdi mi
}
```

### GameConfig (Oyun Konfigürasyonu)
```typescript
interface GameConfig {
  id: string;
  name: string;
  theme: string;
  description: string;
  cols: number;            // Grid sütun sayısı
  rows: number;            // Grid satır sayısı
  diceSides: number;       // Zar yüz sayısı
  playerCount: number;     // Oyuncu sayısı
  accent: string;          // Vurgu rengi
  tiles: Tile[];           // Taşlar
  packageName: string;
  version: string;
  updatedAt: number;
}
```

## 🎯 Sonraki Adımlar

1. **Bileşen Entegrasyonu**
   - [ ] GridBoard'u PlayMode'a entegre et
   - [ ] TexturedTile'ı GridBoard'da kullan
   - [ ] JumanjiCard'ı olay kartları için etkinleştir
   - [ ] PlayerToken'ı oyuncu gösterimi için kullan

2. **Performans Optimizasyonu**
   - [ ] Memoization ekle (useMemo, useCallback)
   - [ ] Gereksiz re-render'ları azalt
   - [ ] Canvas rendering'i optimize et

3. **Özellik Geliştirme**
   - [ ] Çok oyunculu ağ desteği
   - [ ] Oyun kaydetme/yükleme
   - [ ] Özel tahta tasarımı
   - [ ] Tema seçeneği

4. **Test & QA**
   - [ ] Unit testler
   - [ ] İntegrasyon testleri
   - [ ] Kullanıcı testi

## 📝 Notlar

- **TypeScript:** Tüm kod TypeScript'te yazılmıştır
- **Styling:** TailwindCSS + inline styles
- **State Management:** React hooks (useState, useRef, useMemo)
- **Animasyonlar:** CSS keyframes + React transitions

## 🔗 Faydalı Linkler

- [React Hooks Dokümantasyonu](https://react.dev/reference/react)
- [TailwindCSS](https://tailwindcss.com/)
- [SVG Animasyonları](https://developer.mozilla.org/en-US/docs/Web/SVG)

---

**Son Güncelleme:** 2026-05-30
**Versiyon:** 1.0.0

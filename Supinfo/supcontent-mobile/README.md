# SUPCONTENT Mobile

Application mobile React Native pour SUPCONTENT.

## Prérequis

- Node.js (v18+)
- Watchman (`brew install watchman`)
- Xcode (pour iOS) ou Android Studio (pour Android)
- CocoaPods (`sudo gem install cocoapods`)

## Installation

1. Aller dans le dossier mobile :
   ```bash
   cd supcontent-mobile
   ```

2. Installer les dépendances JS :
   ```bash
   npm install
   ```

3. Installer les dépendances iOS (Mac uniquement) :
   ```bash
   cd ios/
   pod install
   cd ..
   ```

## Lancement

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Configuration

L'URL de l'API est hardcodée pour le développement local dans `src/screens/*.tsx` :
- iOS Simulator utilise `http://localhost:5000`
- Android Emulator utilise `http://10.0.2.2:5000`

Si vous testez sur un appareil physique, remplacez `localhost` par l'IP de votre machine.

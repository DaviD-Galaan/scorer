# Configuration du Proxy - Scorer App

## 📋 Vue d'ensemble

Cette application utilise un proxy HTTP pour rediriger les requêtes API et les ressources statiques pendant le développement.

## 🔧 Configuration

### Développement (localhost)

Le fichier `src/setupProxy.js` configure automatiquement le proxy pour le serveur de développement :

- **API** : `/api.1.0/*` → `https://dev.tttm.co.il/api.1.0/*`
- **Images** : `/matchsPict/*` → `https://dev.tttm.co.il/matchsPict/*`
- **Assets** : `/img/*` → `https://dev.tttm.co.il/img/*`

**URL de développement** : `http://localhost:3001`

### Production

En production, l'application sera hébergée sur `/scorer/` et utilisera des chemins relatifs :

- **API** : `/api.1.0/*` (chemin relatif au serveur)
- **Images** : `/matchsPict/*` (chemin relatif au serveur)

## 📁 Fichiers concernés

### `src/setupProxy.js`
```javascript
// Configure le proxy pour le développement
// Redirige automatiquement :
//   /api.1.0/* → https://dev.tttm.co.il/api.1.0/*
//   /matchsPict/* → https://dev.tttm.co.il/matchsPict/*
//   /img/* → https://dev.tttm.co.il/img/*
```

### `src/App.js`
```javascript
// En développement ET production : utilise "/api.1.0/"
// Le proxy s'occupe de la redirection en dev
// En prod, le serveur gère directement ces routes
http.API = "/api.1.0/";
```

### `package.json`
```json
{
  "homepage": "./",  // Permet le déploiement sur /scorer/
  "dependencies": {
    "http-proxy-middleware": "^x.x.x"  // Package nécessaire pour le proxy
  }
}
```

## 🚀 Utilisation

### Démarrer le serveur de développement
```bash
npm start
```

L'application démarre sur `http://localhost:3001` avec le proxy activé.

### Build pour la production
```bash
npm run build
```

Génère les fichiers optimisés dans le dossier `build/` pour le déploiement sur `/scorer/`.

## 🐛 Debug

Les logs du proxy sont activés dans `setupProxy.js` :
- `🌐 Proxying API request:` - Requête API interceptée
- `✅ API response:` - Réponse API reçue
- `🖼️ Proxying image request:` - Image interceptée

Consultez la console du terminal pour voir ces logs.

## ⚙️ Options avancées

### Désactiver SSL en développement
Le proxy est configuré avec `secure: false` pour accepter les certificats auto-signés de `https://dev.tttm.co.il`.

### Modifier le serveur cible
Éditez `src/setupProxy.js` et changez la propriété `target` :
```javascript
target: 'https://autre-serveur.com'
```

## 📝 Notes

- Le proxy ne fonctionne qu'en **développement** (`npm start`)
- En **production**, le serveur web doit être configuré pour servir l'API et les images
- Les chemins relatifs (`/api.1.0/`) fonctionnent aussi bien en dev qu'en prod

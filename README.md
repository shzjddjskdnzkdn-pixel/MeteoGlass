# MeteoGlass

MeteoGlass est un projet Next.js prêt à être importé dans GitHub puis déployé sur Vercel.

## Ce qui fonctionne déjà
- Recherche d'une ville en français.
- Géolocalisation facultative.
- Température actuelle, ressenti, humidité, vent et précipitations.
- Prévisions heure par heure et sur 7 jours.
- Actualisation automatique toutes les 15 minutes.
- Interface responsive pensée pour mobile.

Les données météo de cette première version proviennent d'Open-Meteo. La section Vigilances est volontairement indiquée comme « à configurer » : les bulletins officiels détaillés de Météo-France et une éventuelle intégration Météociel ne sont pas encore branchés. Il ne faut pas présenter ces vigilances comme disponibles tant que la connexion officielle n'est pas mise en place.

## Déploiement sur Vercel
1. Crée un dépôt GitHub vide nommé `MeteoGlass`.
2. Ajoute le contenu de ce dossier à la racine du dépôt (ne mets pas le dossier `MeteoGlass` dans un sous-dossier).
3. Sur Vercel, choisis **Add New → Project**, puis importe le dépôt `MeteoGlass`.
4. Garde les réglages détectés automatiquement : Framework **Next.js**, commande de build `next build`.
5. Appuie sur **Deploy**.

Vercel attribuera une adresse `*.vercel.app`. Les prochains changements envoyés sur la branche principale déclencheront un nouveau déploiement sur cette même adresse.

## Développement
Nécessite Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Sources
- Open-Meteo Forecast API : https://open-meteo.com/
- Open-Meteo Geocoding API : https://open-meteo.com/en/docs/geocoding-api
- Météo-France : https://meteofrance.com/

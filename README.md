# CarteMagic - Gestionnaire de Collection Magic: The Gathering

CarteMagic est une application web permettant de suivre sa collection de cartes Magic: The Gathering pour une extension spécifique (par défaut "Fondations" - code `fin`). L'application récupère les données en temps réel via l'API Scryfall et permet de marquer les cartes possédées pour suivre sa progression et la valeur de sa collection.

## 🚀 Fonctionnalités

- **Synchronisation Scryfall** : Récupération automatique des cartes, images, raretés et prix.
- **Suivi de Collection** : Cochez les cartes que vous possédez. La sélection est sauvegardée localement.
- **Statistiques en Temps Réel** :
    - Barre de progression globale.
    - Compteur par rareté (Communes, Unco, Rares, Mythiques).
    - Calcul de la valeur financière de la collection possédée vs totale.
- **Filtres Avancés** :
    - Filtrage par rareté.
    - Filtrage par état (possédée / manquante).
    - Filtrage par type de pack (booster ou hors-booster).
    - Tri par nom, prix ou numéro de collection.
- **Interface Moderne** : Design responsive avec support du mode sombre.

## 🛠 Technologies utilisées

### Backend
- **Python 3**
- **Flask** : Framework web pour l'API.
- **Flask-CORS** : Gestion du Cross-Origin Resource Sharing pour la communication avec le frontend.
- **Requests** : Pour les appels à l'API Scryfall.

### Frontend
- **React 19**
- **Tailwind CSS** : Pour le stylisage moderne et rapide.
- **Radix UI** : Composants accessibles (Collapsible).
- **Lucide React / React Icons** : Bibliothèque d'icônes.
- **Vite** : Outil de build (configuré dans le dossier front).

## 📋 Prérequis

- Python 3.x installé.
- Node.js et npm installés.

## ⚙️ Installation et Utilisation

### 1. Configuration du Backend

Allez dans le dossier du serveur :
```bash
cd MagicCardList
```

Installez les dépendances Python :
```bash
pip install flask flask-cors requests
```

Lancez le serveur :
```bash
python main.py
```
Le serveur tournera sur `http://localhost:5000`.

### 2. Configuration du Frontend

Allez dans le dossier du client :
```bash
cd frontmagic
```

Installez les dépendances :
```bash
npm install
```

Lancez l'application :
```bash
npm start
# ou
npm run dev
```
L'application sera accessible sur `http://localhost:3000`.

## 📂 Structure du projet

- `MagicCardList/` : Contient le code Flask (Backend).
    - `main.py` : Point d'entrée de l'API.
    - `cartes_selectionnees.json` : Fichier de stockage de votre collection.
- `frontmagic/` : Contient le code React (Frontend).
    - `src/components/` : Composants de l'interface (CardList, Header, etc.).
    - `src/ui/` : Composants de base stylisés avec Tailwind.

## 📝 Notes
Par défaut, l'application est configurée pour l'extension **Foundations (FIN)**. Vous pouvez modifier le `set_code` dans `MagicCardList/main.py` pour suivre une autre extension.

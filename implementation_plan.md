# Plan d'Implémentation - Application "Ligue d'Assiduité" (Football Theme)

Application web interactive (HTML/CSS/JS) sous forme de championnat de football pour motiver les élèves et améliorer leur assiduité. Le code est modulaire, pédagogique et respecte la contrainte de **moins de 300 lignes par fichier**.

---

## 🎯 Règles Métier & Barème

- **Présent** : `+3 points` 🟢
- **Retard < 5 min** : `+1 point` 🟡
- **Retard > 5 min ou Absent** : `0 point` 🔴
- **Ajustement manuel** : Modification directe de points avec date précise et motif (ex: bonus participation, rattrapage).

---

## ⚽ Fonctionnalités Clefs

1. **🏆 Classement Général (Ligue)**
   - Tableau de classement type championnat (Rang, Nom, Points, Présences, Retards, Absences, Forme des 5 dernières séances).
   - Mise en évidence du podium (1er à 3e).
2. **📋 Module "Faire l'Appel" (Séance de cours)**
   - Interface rapide pour valider l'assiduité de toute la classe en 1 clic par élève (+3, +1, 0) avec horodatage de la séance.
3. **👤 Gestion des Élèves & Personnages**
   - Ajout d'élève (nom complet uniquement).
   - Fiche individuelle et ajustement précis des points avec choix de la date et commentaire.
4. **📜 Historique Détaillé & Daté**
   - Journal complet de toutes les attributions de points datées avec filtre par élève.
5. **💾 LocalStorage & Import/Export de Sauvegarde**
   - Sauvegarde automatique dans le `localStorage`.
   - Bouton **Export JSON** (Télécharger un fichier de sauvegarde `.json`).
   - Bouton **Import JSON** (Restaurer à partir d'un fichier).
   - Réinitialisation avec données de démo (jeu d'essai pour la pédagogie).

---

## 📂 Architecture Modulaire (< 300 lignes / fichier)

```text
c:\Users\alxph\Documents\Code\ESEO\assiduity\
├── index.html               # Structure HTML5 sémantique avec onglets et modales (~180 lignes)
├── css/
│   ├── main.css             # Variables CSS, thème sombre moderne (stade/gazon/or), typographie (~180 lignes)
│   ├── league.css           # Styles spécifiques au classement foot et au podium (~170 lignes)
│   └── components.css       # Modales, formulaires, timeline historique, fiches d'appel (~190 lignes)
└── js/
    ├── models.js            # Modèles de données (Élève, Historique, Barème) (~80 lignes)
    ├── storage.js           # Gestion du LocalStorage + Import/Export JSON (~120 lignes)
    ├── state.js             # Gestionnaire d'état de l'application (~90 lignes)
    ├── ui/
    │   ├── leaderboard.ui.js# Rendu et tri du classement général (~150 lignes)
    │   ├── rollcall.ui.js   # Interface "Faire l'appel" (~140 lignes)
    │   ├── students.ui.js   # Gestion des cartes d'élèves & édition de points (~160 lignes)
    │   └── history.ui.js    # Journal d'historique des points (~110 lignes)
    └── app.js               # Point d'entrée, routage onglets et événements principaux (~130 lignes)
```

---

## 📋 Plan d'Exécution

### Phase 1 : Structure & Design System
- Création de `index.html` avec navigation sémantique et conteneurs d'onglets.
- Création de `css/main.css`, `css/league.css`, `css/components.css` avec design sombre néon/stade ultra-soigné et responsive.

### Phase 2 : Modèles & Persistence (Storage & State)
- `js/models.js` : Définition des structures d'élèves, sessions d'appel, et historiques.
- `js/storage.js` : Méthodes `saveData()`, `loadData()`, `exportJSON()`, `importJSON()`.
- `js/state.js` : Store centralisé réactif simple (sans framework complexe pour garder un code clair et lisible par des étudiants).

### Phase 3 : Modules d'Interface (UI Components)
- `js/ui/leaderboard.ui.js` : Calcul des rangs, stats, départages et affichage des zones de ligue.
- `js/ui/rollcall.ui.js` : Interface interactive d'appel rapide par séance.
- `js/ui/students.ui.js` : Formulaire d'ajout d'élève + modale de modification de points à date précise.
- `js/ui/history.ui.js` : Timeline des changements de points.

### Phase 4 : Assemblage, Démo & Vérification
- Connecter `js/app.js` pour gérer les évènements et le changement d'onglet.
- Ajouter un jeu de données initial d'exemple (élèves de démo) si la sauvegarde est vide.
- Tester l'export/import JSON et la persistance LocalStorage.

---

## 🧪 Plan de Vérification

1. **Navigation & Rendu** : Tester l'ouverture de `index.html` dans le navigateur local.
2. **Attribution de Points** :
   - Tester un appel complet : vérifier qu'un élève présent gagne 3pts, retard < 5min 1pt, retard > 5min/absent 0pt.
   - Tester la modification manuelle d'un élève avec sélection d'une date passée et motif : vérifier la mise à jour immédiate du score et de l'historique.
3. **Persistance & Sauvegarde** :
   - Recharger la page : vérifier que les données sont conservées (`localStorage`).
   - Exporter le fichier JSON : vérifier son contenu.
   - Réinitialiser puis réimporter le fichier JSON : vérifier que toutes les données réapparaissent intactes.
4. **Conformité des Fichiers** :
   - Vérifier le nombre de lignes de chaque fichier (tous sous la limite de 300 lignes).

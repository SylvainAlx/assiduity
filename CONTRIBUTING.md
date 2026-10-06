# Guide de contribution

Merci de contribuer à Ligue d'Assiduité ! Les contributions peuvent prendre la forme d'une correction, d'une amélioration de l'interface, d'une évolution fonctionnelle ou d'une amélioration de la documentation.

## Avant de commencer

1. Recherchez les issues et pull requests existantes pour éviter de dupliquer un travail.
2. Pour une évolution importante, ouvrez une issue avant de coder afin de valider le besoin et l'approche.
3. Travaillez à partir de la branche principale à jour.
4. Exportez vos données de test depuis l'application avant toute manipulation importante.

## Développement local

Le projet est une application HTML/CSS/JavaScript sans étape de compilation ni dépendance npm. Lancez un serveur HTTP depuis la racine du dépôt :

```bash
python -m http.server 8000
```

L'application sera accessible à l'adresse [http://localhost:8000](http://localhost:8000).

## Organisation recommandée

Utilisez un nom de branche explicite, par exemple :

```text
feature/historique-filtrable
fix/correction-points-appel
docs/guide-installation
```

Gardez les pull requests ciblées : une intention principale par pull request facilite la relecture et le retour en arrière.

## Règles de code

- privilégier le JavaScript natif déjà utilisé dans le projet ;
- conserver la séparation entre état métier (`js/state.js`), modèles (`js/models.js`) et affichage (`js/ui/`) ;
- réutiliser les fonctions d'échappement HTML lors de l'affichage de données saisies par l'utilisateur ;
- conserver les libellés et messages en français, sauf nécessité technique ;
- éviter d'ajouter une dépendance pour un besoin qui peut rester simple ;
- préserver la compatibilité avec les données déjà stockées et les sauvegardes JSON lorsque c'est possible.

## Vérifications avant une pull request

Exécutez les contrôles de syntaxe concernés :

```bash
node --check js/app.js
node --check js/models.js
node --check js/state.js
node --check js/storage.js
node --check js/ui/history.ui.js
node --check js/ui/leaderboard.ui.js
node --check js/ui/rollcall.ui.js
node --check js/ui/students.ui.js
```

Effectuez ensuite un test manuel de la fonctionnalité modifiée, notamment sur un jeu de données de démonstration et sur une sauvegarde importée si le format des données est concerné.

## Pull requests

La description doit expliquer :

- le problème ou le besoin traité ;
- la solution retenue ;
- la manière de vérifier le changement ;
- les éventuelles limites ou migrations de données nécessaires.

Utilisez la checklist proposée dans le modèle de pull request. Les captures d'écran sont utiles pour les changements d'interface.

## Issues

Utilisez le modèle de bug pour les problèmes reproductibles et le modèle de demande d'évolution pour les idées ou besoins fonctionnels. Donnez autant de contexte que possible : navigateur, étapes pour reproduire, résultat attendu et résultat observé.

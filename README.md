# Ligue d'Assiduité

Application web simple pour suivre l'assiduité des élèves sous la forme d'un classement. Les séances d'appel attribuent des points selon le statut de chaque élève : présent, retard de moins de 5 minutes ou absent.

## Fonctionnalités

- classement général des élèves ;
- saisie d'une séance d'appel ;
- correction d'un appel déjà enregistré ;
- historique regroupé par date ;
- gestion de l'effectif et ajustements manuels ;
- sauvegarde et restauration des données au format JSON ;
- stockage local dans le navigateur, sans serveur ni base de données.

## Lancer le projet localement

Le projet utilise des modules JavaScript natifs. Il doit donc être servi par un petit serveur HTTP plutôt qu'ouvert directement en `file://`.

Avec Python :

```bash
python -m http.server 8000
```

Puis ouvrir [http://localhost:8000](http://localhost:8000).

Une extension de serveur local pour l'éditeur (par exemple Live Server) convient également.

## Contribuer

Les améliorations, corrections et nouvelles idées sont les bienvenues. Avant de commencer, consultez le [guide de contribution](CONTRIBUTING.md), puis utilisez les modèles d'issues ou de pull requests proposés par GitHub.

Pour une petite correction, une pull request directe suffit. Pour une évolution importante, il est préférable d'ouvrir d'abord une issue afin de discuter de l'objectif et de l'approche.

Les échanges doivent rester respectueux et constructifs ; consultez le [code de conduite](CODE_OF_CONDUCT.md).

## Organisation du code

```text
index.html          Structure de l'interface
css/                Styles de l'application
js/app.js           Initialisation et événements globaux
js/models.js        Modèles et règles de points
js/state.js         État global et opérations métier
js/storage.js       Sauvegarde locale et import/export JSON
js/ui/              Rendu des différents onglets
```

## Vérifications rapides

Il n'y a pas encore de suite de tests automatisés. Avant de proposer une modification, vérifier au minimum la syntaxe JavaScript :

```bash
node --check js/app.js
node --check js/models.js
node --check js/state.js
```

Puis effectuer un parcours manuel dans le navigateur : appel, correction d'un appel, historique, sauvegarde/export et import si la modification les concerne.

## Données et confidentialité

Les données sont conservées dans le `localStorage` du navigateur et ne sont pas envoyées à un serveur par l'application. Pensez à exporter une sauvegarde avant de tester une évolution qui modifie l'état des données.

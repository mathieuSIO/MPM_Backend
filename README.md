## Rôle fonctionnel du serveur MPM

Le serveur MPM constitue le cœur logique du studio et l'entierté de l'application MPM.  
Il agit comme une **interface entre le frontend (studio / site vitrine)** et les données métier.

Son rôle n’est pas seulement technique : il structure toute la logique de l’activité MPM.


## À quoi sert concrètement ce serveur ?

Le backend MPM va permettre de gérer l’ensemble du cycle de vie d’une commande textile personnalisée.

Il sera responsable de :

### 1. Gestion des produits

Le serveur permet de :

- récupérer la liste des produits disponibles (t-shirts, sweats, casquettes…)
- définir leurs caractéristiques (couleurs, tailles, zones d’impression)
- gérer les prix de base

Exemple :
- un t-shirt blanc n’a pas le même coût qu’un sweat
- certaines zones d’impression peuvent être limitées


### 2. Gestion de la personnalisation

Le cœur du projet MPM.

Le serveur reçoit les données du studio (frontend) :

- position des logos
- taille des éléments
- type d’impression (DTF, broderie…)
- nombre de zones imprimées

Il permet de :

- valider que la personnalisation est réalisable
- préparer les données pour la production
- standardiser les informations envoyées aux machines ou aux opérateurs


### 3. Calcul des prix

Le backend centralise toute la logique de pricing :

- prix du textile
- coût d’impression
- remises selon quantité
- options (col, dos, manches…)

Objectif :

👉 éviter que la logique prix soit côté frontend  
👉 garantir une cohérence business


### 4. Gestion des devis (quotes)

Le serveur permettra de :

- créer des devis automatiquement
- stocker les demandes clients
- retrouver un projet plus tard
- transformer un devis en commande


### 5. Gestion des commandes

Le backend gère :

- la création des commandes
- le suivi (en attente, en production, expédié…)
- les informations client
- l’historique

C’est le point central pour :

👉 organiser la production  
👉 suivre le chiffre d’affaires  


### 6. Préparation à la production

Le serveur servira aussi à :

- structurer les fichiers d’impression
- préparer les informations nécessaires aux machines (DTF, broderie)
- standardiser les commandes pour éviter les erreurs


### 7. Gestion des clients

À terme, le serveur pourra :

- stocker les clients
- historiser leurs commandes
- faciliter les relances commerciales
- permettre une logique B2B (associations, entreprises)
- Permettre l'affiliation pour les commandes


### 8. Base pour automatisation future

Le serveur est conçu pour évoluer vers :

- automatisation des devis
- connexion avec un outil de gestion de production
- génération automatique de propositions commerciales
- CRM simplifié



## Vision long terme

Le serveur MPM n’est pas seulement une API.

C’est une **brique centrale du système MPM**, qui permettra à terme :

- d’automatiser une grande partie du business
- de scaler la production
- de connecter plusieurs interfaces (site, outils internes, SaaS…)


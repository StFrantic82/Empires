# Empires

Prototype du jeu de société **Empires** (titre provisoire), de Matthieu Verdier et Régis Crosnier.

Chaque joueur développe une ville de 3 × 3 bâtiments. Ses ouvriers gagnent en expérience sur une roue (niveaux 0 à 5) : plus leur niveau est élevé, plus ils paient cher, et ceux qui dépassent le niveau 5 partent à la retraite pour poser des marqueurs sur les Merveilles.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Interface : partie contre des bots, atelier de simulation, catalogue des cartes, règles |
| `engine.js` | Moteur de règles (cartes, Merveilles, cartes de guilde, bots), utilisable dans le navigateur et avec Node |
| `img/` | Icônes des tags, des guildes et de la roue |
| `sim/` | Scripts de simulation en ligne de commande |

## Lancer l'app

Ouvrez `index.html` dans un navigateur, ou la version en ligne une fois GitHub Pages activé :
`https://stfrantic82.github.io/Empires/`

La partie à distance et la synchronisation du Google Sheet dépendent de services fournis par Claude : hors de Claude, l'app fonctionne en local (joueurs sur le même écran et bots).

## Simulations

```
node sim/v4.js "réglages par défaut" '{}'
```

Le second argument est un objet JSON d'options qui remplace les valeurs de `DEFAULT_OPTS` dans `engine.js` (par exemple `'{"retireStep":3}'`).

## Règles en bref

À son tour, un joueur :

1. prend une des 4 cartes de guilde visibles et applique son effet ;
2. puis construit un bâtiment **ou** tourne sa roue d'un cran.

La partie se termine quand il y a 2 marqueurs par joueur sur les Merveilles, ou quand une ville compte 9 bâtiments. Les règles complètes sont dans l'onglet « Règles » de l'app.

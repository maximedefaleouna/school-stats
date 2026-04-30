# Import de la Structure de l'Inspection

## 📋 Vue d'ensemble

Le système permet d'importer la structure scolaire officielle (cycles, filières, niveaux, classes) définie par l'inspection via un fichier JSON.

## 🔄 Flux de travail

### 1. **Réception du JSON de l'inspection**
Chaque année, l'inspection envoie un fichier JSON contenant :
- La liste des cycles (BAC, CAP, BT, etc.)
- La liste des filières (Série A, Mécanique, Comptabilité, etc.)
- La liste des niveaux (Seconde, Première, Terminale, etc.)
- La liste des classes avec leurs associations

### 2. **Import dans le système**
1. Aller dans la page **Paramètres**
2. Cliquer sur **"Importer le JSON de l'inspection"**
3. Sélectionner le fichier JSON reçu
4. Le système valide et importe automatiquement la structure

### 3. **Personnalisation par l'école**
Après l'import de la structure officielle :
- L'école peut ajouter ses propres variantes de classes
- Exemple : si l'inspection définit "2nde A", l'école peut créer "2nde A1", "2nde A2", etc.
- Les classes personnalisées sont marquées comme "Personnalisée"

## 📁 Format du fichier JSON

Le fichier JSON doit respecter la structure suivante :

```json
{
  "cycles": [
    {
      "id": "c1",
      "nom": "BAC"
    },
    {
      "id": "c2",
      "nom": "CAP"
    }
  ],
  "filieres": [
    {
      "id": "f1",
      "nom": "Série A",
      "cycleId": "c1"
    },
    {
      "id": "f2",
      "nom": "Mécanique Auto",
      "cycleId": "c2"
    }
  ],
  "niveaux": [
    {
      "id": "n1",
      "nom": "Seconde",
      "cycleId": "c1"
    },
    {
      "id": "n2",
      "nom": "1ère Année",
      "cycleId": "c2"
    }
  ],
  "classes": [
    {
      "id": "cl1",
      "nom": "2nde A",
      "niveauId": "n1",
      "filiereId": "f1"
    },
    {
      "id": "cl2",
      "nom": "CAP MA 1",
      "niveauId": "n2",
      "filiereId": "f2"
    }
  ]
}
```

### 🔍 Détails des champs

#### Cycles
- `id` : Identifiant unique (string)
- `nom` : Nom du cycle (ex: "BAC", "CAP", "BT")

#### Filières
- `id` : Identifiant unique (string)
- `nom` : Nom de la filière (ex: "Série A", "Mécanique Auto")
- `cycleId` : Référence au cycle parent

#### Niveaux
- `id` : Identifiant unique (string)
- `nom` : Nom du niveau (ex: "Seconde", "Première")
- `cycleId` : Référence au cycle parent

#### Classes
- `id` : Identifiant unique (string)
- `nom` : Nom de la classe (ex: "2nde A1", "Tle C")
- `niveauId` : Référence au niveau
- `filiereId` : Référence à la filière

## 📊 Ce qui se passe après l'import

### ✅ Actions automatiques
1. **Stockage** : La structure est sauvegardée dans le localStorage du navigateur
2. **Priorité** : Les classes de l'inspection ont priorité sur les classes par défaut
3. **Nettoyage** : Les classes personnalisées précédentes sont supprimées
4. **Application** : La nouvelle structure est appliquée immédiatement dans toutes les pages

### 📄 Pages impactées
- **Effectifs** : Affiche les classes importées
- **Examens** : Utilise les nouvelles classes pour les compositions
- **Statistiques** : Calcule les stats basées sur la nouvelle structure
- **Paramètres** : Montre le résumé de la structure importée

## 🛠️ Gestion des classes personnalisées

Après l'import d'une structure de l'inspection :

### Créer une variante
1. Aller dans **Effectifs**
2. Filtrer par niveau/filière
3. Cliquer sur **"Nouvelle classe"**
4. Remplir le formulaire :
   - Nom : ex: "2nde A3" (variante de "2nde A")
   - Cycle : celui de l'inspection
   - Niveau : celui de l'inspection
   - Filière : celle de l'inspection
5. La classe est créée avec le badge **"Personnalisée"**

### Supprimer une variante
- Cliquer sur l'icône 🗑️ (poubelle) à côté du crayon
- Confirmation demandée avant suppression
- Seules les classes personnalisées peuvent être supprimées

## 🔄 Réinitialisation

Si besoin, vous pouvez supprimer la structure de l'inspection :

1. Aller dans **Paramètres**
2. Si une structure est importée, cliquer sur **"Supprimer"**
3. Confirmation requise
4. Le système revient aux classes par défaut
5. Toutes les classes personnalisées sont également supprimées

## 💡 Bonnes pratiques

### ✅ À faire
- Toujours vérifier le format du JSON avant import
- Sauvegarder les données importantes avant d'importer une nouvelle structure
- Importer le JSON de l'inspection au début de chaque année scolaire
- Créer les variantes de classes après l'import officiel

### ❌ À éviter
- Modifier manuellement le localStorage
- Importer un JSON non validé
- Supprimer la structure de l'inspection en cours d'année
- Créer des classes personnalisées avant d'importer la structure officielle

## 📝 Exemple concret

### Situation initiale
L'école utilise les classes par défaut du système.

### Année 2026-2027
1. **Réception** : L'inspection envoie le JSON avec :
   - 3 cycles (BAC, CAP, BT)
   - 7 filières
   - 8 niveaux
   - 25 classes officielles

2. **Import** : 
   - L'admin va dans Paramètres
   - Importe le JSON reçu
   - Le système affiche : "✓ Structure importée (25 classes)"

3. **Adaptation** :
   - L'école voit que "2nde A" existe maintenant
   - Elle crée "2nde A1", "2nde A2", "2nde A3" comme variantes
   - Chaque variante peut avoir ses propres effectifs

4. **Utilisation** :
   - Les professeurs saisissent les notes dans les classes créées
   - Les statistiques incluent toutes les classes (officielles + personnalisées)
   - Les exports contiennent toute la structure

## 🆘 Dépannage

### Problème : "Structure JSON invalide"
**Solution** : Vérifiez que le fichier contient bien les 4 tableaux :
- `cycles`
- `filieres`
- `niveaux`
- `classes`

### Problème : Les classes ne s'affichent pas
**Solution** :
1. Rafraîchir la page (F5)
2. Vérifier dans Paramètres que la structure est bien importée
3. Vider le cache du navigateur si nécessaire

### Problème : J'ai perdu mes données
**Solution** : 
1. Exporter les données avant tout import (bouton Exporter)
2. Après import, réimporter vos données avec le bouton Importer
3. Les effectifs et agents sont conservés, seule la structure change

## 📞 Support

Pour toute question ou problème :
1. Vérifier ce guide
2. Consulter le fichier sample : `/inspection-sample.json`
3. Contacter l'administrateur système

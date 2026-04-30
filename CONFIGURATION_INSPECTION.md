# 🎓 Configuration par Inspection JSON

## 📋 Vue d'ensemble

Le système utilise maintenant un fichier de configuration `inspection-config.json` pour définir toute la structure scolaire (cycles, filières, niveaux, classes) au lieu de données en dur.

## 🔄 Nouveau Flux de Travail

### 1. **Début d'année scolaire**
Quand vous créez une nouvelle année scolaire :
- Les cycles, filières, niveaux et classes NE SONT PLUS en dur
- Vous devez importer le fichier `inspection-config.json` dans **Paramètres**
- Ce fichier configure TOUTE la structure officielle

### 2. **Import de la configuration**
1. Aller dans la page **Paramètres**
2. Cliquer sur **"Importer inspection-config.json"**
3. Sélectionner le fichier JSON fourni par l'inspection
4. Le système importe automatiquement :
   - ✅ Tous les cycles
   - ✅ Toutes les filières
   - ✅ Tous les niveaux
   - ✅ Toutes les classes pédagogiques

### 3. **Personnalisation par l'école**
Après l'import de la configuration officielle :
- L'école peut créer ses **classes personnalisées** (variantes)
- Exemple : Si "2nde A" existe, créer "2nde A1", "2nde A2", "2nde A3"
- Les classes personnalisées sont marquées comme telles
- Peuvent être supprimées si besoin

## 📁 Fichier inspection-config.json

### Structure du fichier

```json
{
  "version": "1.0",
  "type": "inspection-configuration",
  "generatedAt": "2026-03-05T10:00:00Z",
  "description": "Configuration de la structure scolaire",
  "data": {
    "cycles": [...],
    "filieres": [...],
    "niveaux": [...],
    "classesPedagogiques": [...]
  }
}
```

### Contenu type

#### Cycles
```json
"cycles": [
  {
    "id": "c1",
    "nom": "BAC GENERAL",
    "description": "Baccalauréat Général"
  },
  {
    "id": "c2",
    "nom": "CAP METIERS",
    "description": "Certificat d'Aptitude Professionnelle"
  }
]
```

#### Filières
```json
"filieres": [
  {
    "id": "f1",
    "nom": "Série A - Littéraire",
    "cycleId": "c1",
    "description": "Enseignement littéraire"
  }
]
```

#### Niveaux
```json
"niveaux": [
  {
    "id": "n1",
    "nom": "Seconde",
    "cycleId": "c1",
    "order": 1,
    "description": "Première année du cycle BAC"
  }
]
```

#### Classes Pédagogiques
```json
"classesPedagogiques": [
  {
    "id": "cp1",
    "nom": "2nde A",
    "niveauId": "n1",
    "filiereId": "f1"
  },
  {
    "id": "cp2",
    "nom": "2nde C",
    "niveauId": "n1",
    "filiereId": "f2"
  }
]
```

## 💡 Avantages de cette approche

### ✅ Centralisation
- **Une seule source de vérité** : Le fichier inspection-config.json
- **Facile à mettre à jour** : Modifier le JSON suffit
- **Reproductible** : Même configuration pour toutes les écoles

### ✅ Flexibilité
- **Personnalisable** : Chaque école peut ajouter ses variantes
- **Évolutif** : Ajouter de nouvelles classes est simple
- **Sécurisé** : Les classes officielles ne peuvent pas être supprimées accidentellement

### ✅ Maintenance
- **Pas de données en dur** : Plus besoin de modifier le code
- **Mise à jour facile** : Changer le fichier JSON
- **Versioning** : Garder un historique des configurations

## 🔧 Comment ça marche techniquement

### Stockage
```javascript
// Après import, la configuration est stockée dans localStorage
localStorage.setItem("school-inspection-classes", JSON.stringify(classes));
localStorage.setItem("school-inspection-cycles", JSON.stringify(cycles));
localStorage.setItem("school-inspection-filieres", JSON.stringify(filieres));
localStorage.setItem("school-inspection-niveaux", JSON.stringify(niveaux));
```

### Priority System
```javascript
getClasses() retourne :
[...inspectionClasses, ...defaultClasses, ...customClasses]

Priorité :
1. Classes de l'inspection (officielles)
2. Classes par défaut (fallback)
3. Classes personnalisées (école)
```

### Création de nouvelles années
```javascript
// Quand on crée une année 2026-2027
addYear("2026-2027") → {
  effectifs: [],
  agents: [...agents de l'année précédente]
}

// La structure (cycles, classes) vient de inspection-config.json
// Pas besoin de recréer la structure chaque année
```

## 📝 Exemple concret

### Scénario : Rentrée 2026-2027

1. **1er Septembre**
   - L'admin crée l'année "2026-2027" dans le système
   - L'année est vide (pas de classes, juste les agents)

2. **2 Septembre**
   - L'inspection envoie `inspection-config-2026.json`
   - L'admin va dans **Paramètres**
   - Importe le fichier
   - Le système affiche : "✓ Structure importée (26 classes)"

3. **3 Septembre**
   - L'école voit que "2nde A" existe (classe officielle)
   - Elle a besoin de 3 variantes
   - Elle crée "2nde A1", "2nde A2", "2nde A3" dans **Effectifs**
   - Chaque variante peut avoir ses propres effectifs

4. **Toute l'année**
   - Les professeurs utilisent les classes créées
   - Les statistiques incluent tout
   - Les exports contiennent toute la structure

## 🆘 Dépannage

### Problème : "Je viens de créer une année mais il n'y a aucune classe"
**Solution** : C'est normal ! Importez d'abord le fichier `inspection-config.json` dans **Paramètres**.

### Problème : "J'ai modifié le code mais les classes ne changent pas"
**Solution** : Les classes ne sont plus dans le code, elles viennent du fichier JSON. Modifiez `inspection-config.json` et réimportez-le.

### Problème : "Comment mettre à jour la structure en cours d'année ?"
**Solution** : 
1. Modifier le fichier `inspection-config.json`
2. Supprimer l'ancienne structure dans **Paramètres**
3. Réimporter le nouveau fichier
4. Les classes personnalisées seront conservées

## 📊 Fichiers disponibles

### Mocks et exemples
- `/mocks/inspection-config.json` - Configuration complète exemple
- `/mocks/complete-database-export.json` - Export complet de données
- `/public/inspection-sample.json` - Échantillon simple

### Dans le code
- `src/data/schoolData.ts` - Fonctions d'import/export
- `src/pages/Parametres.tsx` - Interface d'import
- `src/hooks/useAppStore.ts` - Gestion des années

## 🎯 Bonnes pratiques

### ✅ À faire
- Toujours importer `inspection-config.json` après avoir créé une nouvelle année
- Conserver une copie du fichier JSON de configuration
- Vérifier la structure avant import (nombre de cycles, classes, etc.)
- Créer les classes personnalisées APRÈS l'import officiel

### ❌ À éviter
- Modifier manuellement le localStorage
- Supprimer la structure officielle en cours d'année
- Créer des classes personnalisées avant l'import officiel
- Utiliser d'anciens fichiers JSON sans vérifier

## 🔄 Migration depuis l'ancien système

Si vous aviez des données en dur avant :

1. **Exporter** les données existantes (bouton Exporter)
2. **Créer** le fichier `inspection-config.json` avec votre structure
3. **Importer** la configuration dans **Paramètres**
4. **Vérifier** que toutes les classes sont présentes
5. **Créer** les variantes personnalisées si nécessaire

## 📞 Support

Pour toute question :
1. Consulter ce guide
2. Vérifier le fichier `/mocks/inspection-config.json` comme exemple
3. Contacter l'administrateur système

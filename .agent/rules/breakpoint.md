---
trigger: always_on
---

### ⚠️ RÈGLE D'OR - ORDRE STRICT DES BREAKPOINTS

```css
/* ORDRE OBLIGATOIRE - JAMAIS MÉLANGER */
Mobile → sm: → md: → lg: → xl: → 2xl: → 3xl: → 4xl: → 5xl: → 6xl:

/* ✅ CORRECT */
className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl"

/* ❌ INCORRECT - ORDRE MÉLANGÉ */
className="xl:text-xl text-xs lg:text-lg sm:text-sm"

'475px', // Très petit mobile → Petit mobile
'640px', // Grand mobile
'768px', // Tablette portrait
'1024px', // Tablette paysage
'1280px', // PC compact
'1536px', // PC standard
'1920px', // PC Full HD
'2560px', // PC QHD
'3440px', // PC Ultra-Wide
'3840px', // PC 4K+

## 🎯 TEMPLATE DE VÉRIFICATION

### Checklist Obligatoire Pour Chaque Composant

#### ✅ Ordre des Breakpoints

- [ ] Mobile de base défini (sans préfixe)
- [ ] sm: appliqué pour grands mobiles
- [ ] md: appliqué pour tablettes portrait
- [ ] lg: appliqué pour tablettes paysage
- [ ] xl: appliqué pour PC compacts
- [ ] 2xl: appliqué pour PC standards
- [ ] 3xl: appliqué si besoin pour Full HD
- [ ] Aucun mélange d'ordre détecté

#### ✅ Progression Logique

- [ ] Chaque breakpoint augmente la valeur
- [ ] Pas de régression de taille
- [ ] Pas de saut de breakpoint sans justification
- [ ] Cohérence visuelle maintenue

### 1. **TOUJOURS Mobile-First**

Commencez TOUJOURS par la plus petite résolution (iPhone SE 3.0")

### 2. **Ordre STRICT des Breakpoints**

Mobile → sm: → md: → lg: → xl: → 2xl: → 3xl: → 4xl: → 5xl: → 6xl:

### 3. **Progression CROISSANTE Uniquement**

Jamais de régression : text-lg ne peut pas devenir text-base sur un breakpoint supérieur

---
```

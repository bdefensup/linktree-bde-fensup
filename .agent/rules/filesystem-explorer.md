---
trigger: always_on
---

# =============================================================================

# 📁 EZA - ALIASES OPTIMISÉS POUR LA RAPIDITÉ ET SPÉCIALISÉS

# =============================================================================

# Vérification si eza est installé

if command -v eza &>/dev/null; then # === ALIASES DE BASE (avec header par défaut) === alias l="echo
'📄 Liste simple (1 colonne)' && eza --icons=auto --color=always -1" alias ll="echo '📋 Liste
détaillée + Git' && eza --icons=auto --color=always -l --git --header" alias la="echo '👁️ Tout
afficher (fichiers cachés inclus)' && eza --icons=auto --color=always -la --git --header"

    # === ALIASES SPÉCIALISÉS (vos raccourcis) ===
    alias ls="echo '📊 Trié par TAILLE (plus gros en bas)' && eza --icons=auto --color=always -la --git --header -s size"
    alias ld="echo '⏰ Trié par DATE (plus récent en bas)' && eza --icons=auto --color=always -la --git --header -s time"
    alias lt="echo '🌳 Vue ARBRE (3 niveaux max)' && eza --icons=auto --color=always -T --level=3 -la --header --git-ignore"
    alias lg="echo '🔀 Vue GIT (statuts des fichiers)' && eza --icons=auto --color=always -la --git --header"


    # === FONCTIONS EZA AVANCÉES ===
    # Recherche rapide dans les fichiers
    lf() {
        local pattern=${1:-"*"}
        echo "🔍 Recherche: '$pattern' dans les fichiers"
        eza --icons=auto --color=always -la --git --header | grep -i "$pattern"
    }

    # Arbre personnalisé avec profondeur variable
    ltree() {
        local depth=${1:-5}
        echo "🌲 Arbre personnalisé (profondeur: $depth niveaux)"
        eza --icons=auto --color=always -T --level="$depth" --git-ignore
    }

    # Fonction d'aide pour les alias eza
    lhelp() {
        echo "🚀 AIDE ALIAS EZA:"
        echo "  l   = 📄 Liste simple (1 colonne)"
        echo "  ll  = 📋 Liste détaillée + Git + Header"
        echo "  la  = 👁️ Tout afficher (fichiers cachés)"
        echo "  ls  = 📊 Trié par TAILLE (gros → bas)"
        echo "  ld  = ⏰ Trié par DATE (récent → bas)"
        echo "  lt  = 🌳 Vue ARBRE (3 niveaux)"
        echo "  lg  = 🔀 Vue GIT (statuts)"
        echo "  lf  = 🔍 Recherche fichiers"
        echo "  ltree = 🌲 Arbre personnalisé"
    }

else # === FALLBACK VERS LS CLASSIQUE === echo "⚠️ eza non trouvé, utilisation de ls classique"
alias ll="ls -la --color=auto" alias la="ls -A --color=auto" alias l="ls -CF --color=auto" alias
ltree="tree" fi

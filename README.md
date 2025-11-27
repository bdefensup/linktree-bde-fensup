# 🦊 Le QG Numérique du BDE Fénelon Sup Paris 🎉

Salut l'équipe ! Bienvenue sur le repo officiel du **BDE Fénelon Sup**. C'est ici que la magie opère pour gérer toute la vie étudiante de la fac. Pas de stress, pas de galère, juste du code propre pour des soirées légendaires ! 🚀

## 🎯 C'est quoi ce bousin ?

C'est pas juste un Linktree, c'est **LA** plateforme centrale pour tout ce qui se passe à Fénelon Sup. On a tout concentré ici pour que vous puissiez choper vos places de soirées, faire des dons (pour qu'on régale encore plus), et suivre toutes les infos croustillantes.

### 🔥 Ce qu'on a sous le capot :

- **🎟️ Billetterie du Futur** : Achète tes places pour les soirées, les WEI, les afterworks en deux-deux. Fini la queue au local BDE !
- **💸 Système de Dons** : Parce qu'on a besoin de moula pour vous mettre bien (et pour les assos caritatives aussi, on a un cœur ❤️).
- **🔐 Espace Admin Sécurisé** : Pour que le staff puisse gérer les events comme des chefs, sans que n'importe qui fasse n'importe quoi.
- **📧 Mails Automatiques** : Tu reçois tes billets et tes confirmes direct dans ta boîte mail. Propre, net, sans bavure.
- **📱 Mobile First** : Parce qu'on sait que vous êtes H24 sur vos tels.

## 🛠️ La Tech de Fou (Stack Technique)

On n'est pas là pour enfiler des perles, on utilise les meilleurs outils du moment :

- **⚡ Next.js 16** : Le framework React qui va plus vite que la lumière.
- **🎨 Tailwind CSS & Shadcn/ui** : Pour un design qui claque, sombre et stylé comme nos soirées.
- **🐘 Prisma & PostgreSQL** : La base de données solide, gérée avec amour.
- **🔒 Better Auth** : La sécu avant tout, on rigole pas avec vos comptes.
- **✉️ Resend** : Pour vous spammer (gentiment) avec vos billets.

## 🚀 Comment lancer la bête (Installation)

Tu veux contribuer ou juste voir comment c'est fait ? Vas-y mon reuf, suis le guide :

1.  **Clone le repo** (comme un vrai dev) :

    ```bash
    git clone https://github.com/bdefensup/linktree-bde-fensup.git
    cd linktree-bde-fensup
    ```

2.  **Installe les dépendances** (avec pnpm, parce que npm c'est has-been) :

    ```bash
    pnpm install
    ```

3.  **Configure tes variables d'env** :
    Copie le `.env.example` en `.env` et mets tes clés secrètes (demande au resp numérique si t'es paumé).

4.  **Lance la base de données** :

    ```bash
    pnpm prisma generate
    pnpm prisma db push
    ```

5.  **Démarre le serveur de dev** :
    ```bash
    pnpm dev
    ```
    Et boum ! Rendez-vous sur `http://localhost:3000`.

## � Tu veux voir comment c'est fait ?

Le repo est ouvert pour que tu puisses voir comment ça tourne sous le capot, c'est cadeau ! Par contre, **on ne prend pas les modifications de code** (pas de PR pour l'instant, on garde la main sur la machine).

Mais si tu trouves un bug ou un truc qui part en vrille, fais pas le timide : **ouvre une Issue** et remonte-nous l'info ! On fixera ça entre deux amphis. 🐛

## 🦊 L'Équipe

Fait avec ❤️ et beaucoup de ☕ (et peut-être un peu de 🍺) par le pôle Numérique du BDE Fénelon Sup.

---

_BDE Fénelon Sup - L'ambiance avant tout, le code après (mais pas trop loin)._ 🎓🥳

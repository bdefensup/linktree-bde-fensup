"use client";

import { AdvancedEditor } from "@/components/editor/advanced-editor";

export default function TestPage() {
  return (
    <div className="bg-muted/20 flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl space-y-4">
        <h1 className="mb-8 text-3xl font-bold">Test de l'Éditeur Tiptap Avancé</h1>
      <AdvancedEditor
        placeholder="Écrivez votre contenu ici..."
        initialContent={`
          <h2>Bienvenue sur l'éditeur avancé</h2>
          <p>Ceci est un exemple d'éditeur complet utilisant Tiptap et shadcn/ui.</p>
          <ul>
            <li>Support du <strong>gras</strong>, <em>italique</em>, <s>barré</s></li>
            <li>Listes à puces et numérotées</li>
            <li>Tableaux et Images</li>
          </ul>
        `}
        onChange={(content) => console.log(content)}
      />
      </div>
    </div>
  );
}

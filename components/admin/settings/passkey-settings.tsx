"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Passkey {
  id: string;
  name?: string;
  createdAt?: Date;
}

export function PasskeySettings() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    loadPasskeys();
  }, []);

  async function loadPasskeys() {
    try {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (error) {
        console.error("Failed to list passkeys:", error);
        return;
      }
      setPasskeys(data || []);
    } catch (err) {
      console.error("Error loading passkeys:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterPasskey() {
    setIsRegistering(true);
    try {
      const { error } = await authClient.passkey.addPasskey({
        name: `Passkey (${new Date().toLocaleDateString()})`,
      });
      
      if (error) {
        toast.error("Erreur lors de l'ajout de la clé : " + error.message);
      } else {
        toast.success("Clé ajoutée avec succès !");
        loadPasskeys();
      }
    } catch (err) {
      console.error("Error registering passkey:", err);
      toast.error("Une erreur est survenue.");
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleDeletePasskey(id: string) {
    try {
      const { error } = await authClient.passkey.deletePasskey({
        id,
      });
      
      if (error) {
        toast.error("Erreur lors de la suppression : " + error.message);
      } else {
        toast.success("Clé supprimée.");
        loadPasskeys();
      }
    } catch (err) {
      console.error("Error deleting passkey:", err);
      toast.error("Une erreur est survenue.");
    }
  }

  return (
    <Card className="bg-[#09090b] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-blue-500" />
              Clés d'accès (Passkeys)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Gérez vos clés d'accès pour une connexion sécurisée sans mot de passe (FaceID, TouchID).
            </CardDescription>
          </div>
          <Button 
            onClick={handleRegisterPasskey} 
            disabled={isRegistering}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRegistering ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Ajouter une clé
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
            <Fingerprint className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aucune clé enregistrée.</p>
            <p className="text-sm mt-1">Ajoutez votre appareil actuel pour vous connecter plus rapidement.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Nom</TableHead>
                <TableHead className="text-gray-400">Date d'ajout</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passkeys.map((passkey) => (
                <TableRow key={passkey.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-gray-500" />
                      {passkey.name || "Clé sans nom"}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {passkey.createdAt ? new Date(passkey.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePasskey(passkey.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

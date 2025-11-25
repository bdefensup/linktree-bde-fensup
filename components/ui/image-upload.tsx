"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setLoading(true);
        const file = acceptedFiles[0];

        if (!file) return;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("events").getPublicUrl(filePath);

        onChange(data.publicUrl);
        toast.success("Image téléchargée avec succès");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Erreur lors du téléchargement de l'image");
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    disabled: disabled || loading,
  });

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={cn("w-full", className)}>
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <Image src={value} alt="Upload" fill className="object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-destructive p-1 text-white shadow-sm transition-colors hover:bg-destructive/90"
            type="button"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 py-10 text-center transition-colors hover:bg-muted/80",
            isDragActive && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <input {...getInputProps()} />
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          ) : (
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {isDragActive
              ? "Déposez l'image ici..."
              : "Glissez une image ou cliquez pour sélectionner"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/75">
            PNG, JPG, WEBP (max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}

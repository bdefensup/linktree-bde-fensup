import { supabase } from "./supabase";

export async function uploadFile(
  file: Buffer | ArrayBuffer,
  fileName: string,
  bucket: string = "inbox-attachments",
  contentType?: string
): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

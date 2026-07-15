import { NextResponse } from "next/server";
import { runIngestionPipeline } from "@/lib/ai/ingestion/pipeline";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

/**
 * Next.js API Route Handler to trigger the Ingestion Pipeline.
 * Expects a multipart/form-data payload containing the uploaded file.
 * Automatically handles uploading to Supabase Storage and database indexing.
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate first." }, { status: 401 });
    }

    const userId = user.id;

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing required file parameter." }, { status: 400 });
    }

    const fileName = file.name;
    const mimeType = file.type || "application/octet-stream";
    const fileSize = file.size;
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileId = crypto.randomUUID();
    const storagePath = `${userId}/${fileId}/${fileName}`;

    // 3. Upload File to Supabase Storage Bucket
    const { error: uploadError } = await getSupabaseAdmin()
      .storage
      .from("knowledge_base")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // 4. Create metadata row in files table with 'pending' status
    const { data: fileRecord, error: fileError } = await getSupabaseAdmin()
      .from("files")
      .insert({
        id: fileId,
        user_id: userId,
        file_name: fileName,
        file_type: mimeType,
        file_size: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
        storage_path: storagePath,
        status: "pending",
        status_message: "Ingestion pipeline queued."
      })
      .select("id")
      .single();

    if (fileError) {
      console.error("Database insert error:", fileError);
      return NextResponse.json({ error: `Database insert failed: ${fileError.message}` }, { status: 500 });
    }

    // 5. Trigger the ingestion pipeline asynchronously in the background
    runIngestionPipeline({
      fileId,
      userId,
      storagePath,
      mimeType,
      fileName
    }).catch(err => {
      console.error(`[Background Ingestion Error] File ID ${fileId}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: "Ingestion pipeline triggered successfully.",
      file: {
        id: fileId,
        name: fileName,
        status: "processing"
      }
    });

  } catch (error: any) {
    console.error("Ingestion route API error:", error);
    return NextResponse.json({ error: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}

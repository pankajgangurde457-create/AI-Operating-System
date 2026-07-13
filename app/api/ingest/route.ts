import { NextResponse } from "next/server";
import { runIngestionPipeline } from "@/lib/ai/ingestion/pipeline";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

/**
 * Next.js API Route Handler to trigger the Ingestion Pipeline.
 * Expects a JSON payload containing the Supabase Storage file reference and user metadata.
 * Runs the processing pipeline asynchronously.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileId, userId, storagePath, mimeType, fileName } = body;

    // Validate parameters
    if (!fileId || !userId || !storagePath || !mimeType || !fileName) {
      return NextResponse.json(
        { error: "Missing required parameters: fileId, userId, storagePath, mimeType, fileName" },
        { status: 400 }
      );
    }

    // Assert that the file metadata record exists in the files table
    const { data: fileRecord, error: fileError } = await supabaseAdmin
      .from("files")
      .select("id")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError || !fileRecord) {
      // If the file row doesn't exist, create it so status updates can be tracked
      await supabaseAdmin.from("files").insert({
        id: fileId,
        user_id: userId,
        file_name: fileName,
        file_type: mimeType,
        storage_path: storagePath,
        status: "pending"
      });
    }

    // Trigger the ingestion pipeline in the background
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
      job: {
        fileId,
        status: "processing"
      }
    });

  } catch (error: any) {
    console.error("Ingestion route API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

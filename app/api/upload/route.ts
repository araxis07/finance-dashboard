import { NextResponse } from "next/server";
import { parseUploadedFile } from "@/lib/upload-parser";
import { validateUploadFile } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          errorCode: "invalid_request"
        },
        { status: 400 }
      );
    }

    const validationIssue = validateUploadFile(file);

    if (validationIssue) {
      return NextResponse.json(
        {
          errorCode: validationIssue
        },
        { status: 400 }
      );
    }

    const result = await parseUploadedFile(file);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        errorCode: "parse_failed"
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
// Removed unused Prisma enum import

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized. Only job seekers can upload files." },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type = data.get("type") as string; // "cv" or "cover-letter"

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!type || !["cv", "cover-letter"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be 'cv' or 'cover-letter'" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, and DOCX files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const userId = session.user.id;
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}-${timestamp}-${type}.${fileExtension}`;
    
    // Save file to public/uploads directory
    const path = join(process.cwd(), "public", "uploads", fileName);
    await writeFile(path, buffer);

    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: type
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
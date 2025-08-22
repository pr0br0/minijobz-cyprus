import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
// Removed enum import; using plain string role checks.
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Add authentication if needed
    const { filename } = await params;
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract user ID from filename (format: userId_timestamp.ext)
    const filenameParts = filename.split("_");
    if (filenameParts.length < 2) {
      return NextResponse.json(
        { error: "Invalid file format" },
        { status: 400 }
      );
    }

    const userIdFromFilename = filenameParts[0];

    // Check if the user has permission to access this file
    // Users can only access their own CVs, or employers can access CVs of applicants
    const hasAccess = await checkFileAccess(session.user.id, userIdFromFilename, session.user.role);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Read and serve the file
    const filePath = join(process.cwd(), "uploads", "cvs", filename);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Determine content type
      const extension = filename.split(".").pop()?.toLowerCase();
      let contentType = "application/octet-stream";
      
      switch (extension) {
        case "pdf":
          contentType = "application/pdf";
          break;
        case "doc":
          contentType = "application/msword";
          break;
        case "docx":
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          break;
      }

      // Create response with proper headers
  const response = new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "private, max-age=3600", // Cache for 1 hour
        },
      });

      return response;
    } catch (fileError) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error serving CV file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function checkFileAccess(
  currentUserId: string,
  fileUserId: string,
  userRole: string
): Promise<boolean> {
  // Users can always access their own files
  if (currentUserId === fileUserId) {
    return true;
  }

  // Employers can access CVs of applicants
  if (userRole === 'EMPLOYER') {
    // Check if there's an application from this job seeker to the employer's jobs
    const application = await db.application.findFirst({
      where: {
        jobSeeker: {
          userId: fileUserId,
        },
        job: {
          employer: {
            userId: currentUserId,
          },
        },
      },
    });

    return !!application;
  }

  // Admins can access all files
  if (userRole === 'ADMIN') {
    return true;
  }

  return false;
}
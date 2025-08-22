import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Check authentication using Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload CV." },
        { status: 401 }
      );
    }

    // Get user role from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'JOB_SEEKER') {
      return NextResponse.json(
        { error: "Unauthorized. Only job seekers can upload CVs." },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get("cv") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and Word documents are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${user.id}_${timestamp}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading to Supabase Storage:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(filePath);

    // Get job seeker profile
    const { data: jobSeeker, error: jobSeekerError } = await supabase
      .from('job_seekers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (jobSeekerError) {
      // Create job seeker profile if it doesn't exist
      const { data: newJobSeeker, error: createError } = await supabase
        .from('job_seekers')
        .insert({
          user_id: user.id,
          first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          last_name: user.user_metadata?.last_name || '',
          location: 'Cyprus',
          country: 'Cyprus',
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating job seeker profile:", createError);
        return NextResponse.json(
          { error: "Failed to create job seeker profile" },
          { status: 500 }
        );
      }

      // Update the new profile with CV information
      const { error: updateError } = await supabase
        .from('job_seekers')
        .update({
          cv_url: publicUrl,
          cv_file_name: file.name,
          cv_uploaded_at: new Date().toISOString(),
        })
        .eq('id', newJobSeeker.id);

      if (updateError) {
        console.error("Error updating job seeker profile:", updateError);
        return NextResponse.json(
          { error: "Failed to update profile with CV information" },
          { status: 500 }
        );
      }

      // Log the CV upload for audit trail
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: "CV_UPLOADED",
          entity_type: "JobSeeker",
          entity_id: newJobSeeker.id,
          changes: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          }),
          ip_address: request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        });

      return NextResponse.json({
        message: "CV uploaded successfully",
        cvUrl: publicUrl,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      });
    }

    // Update existing job seeker profile with CV information
    const { error: updateError } = await supabase
      .from('job_seekers')
      .update({
        cv_url: publicUrl,
        cv_file_name: file.name,
        cv_uploaded_at: new Date().toISOString(),
      })
      .eq('id', jobSeeker.id);

    if (updateError) {
      console.error("Error updating job seeker profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile with CV information" },
        { status: 500 }
      );
    }

    // Log the CV upload for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: "CV_UPLOADED",
        entity_type: "JobSeeker",
        entity_id: jobSeeker.id,
        changes: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      });

    return NextResponse.json({
      message: "CV uploaded successfully",
      cvUrl: publicUrl,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error uploading CV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
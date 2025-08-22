import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { UserRoleEnum } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, ...profileData } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    if (!Object.values(UserRoleEnum).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name: profileData.name || "",
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        email: data.user.email!,
        role,
        name: profileData.name || "",
        avatar: profileData.avatar || null,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Clean up the user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    // Create role-specific profile
    if (role === UserRoleEnum.JOB_SEEKER) {
      const { error: jobSeekerError } = await supabase
        .from("job_seekers")
        .insert({
          user_id: data.user.id,
          first_name: profileData.firstName || "",
          last_name: profileData.lastName || "",
          location: profileData.location || "",
          country: "Cyprus",
          profile_visibility: "PUBLIC",
        });

      if (jobSeekerError) {
        console.error("Error creating job seeker profile:", jobSeekerError);
      }
    } else if (role === UserRoleEnum.EMPLOYER) {
      const { error: employerError } = await supabase
        .from("employers")
        .insert({
          user_id: data.user.id,
          company_name: profileData.companyName || "",
          company_description: profileData.companyDescription || null,
          company_website: profileData.companyWebsite || null,
          company_size: profileData.companySize || null,
          industry: profileData.industry || null,
          location: profileData.location || "",
          country: "Cyprus",
        });

      if (employerError) {
        console.error("Error creating employer profile:", employerError);
      }
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        role,
      },
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
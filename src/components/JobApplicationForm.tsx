"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface FileUploadProps {
  onFileSelect: (fileUrl: string, fileName: string) => void;
  onFileRemove: () => void;
  acceptedTypes: string[];
  maxSize: number; // in MB
  label: string;
  description: string;
  currentFile?: { url: string; name: string } | null;
}

function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  acceptedTypes, 
  maxSize, 
  label, 
  description,
  currentFile 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", label.toLowerCase().replace(" ", "-"));

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onFileSelect(data.fileUrl, data.fileName);
      } else {
        const error = await response.json();
        setUploadError(error.error || "Failed to upload file");
      }
    } catch (error) {
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {currentFile ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">{currentFile.name}</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onFileRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <p className="text-xs text-gray-500 mb-3">
            Accepted formats: {acceptedTypes.join(", ")} (Max {maxSize}MB)
          </p>
          <Input
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${label}`}
            disabled={uploading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Choose File"}
          </Button>
        </div>
      )}
      
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface JobApplicationFormProps {
  jobId: string;
  onApplicationSuccess: () => void;
  onApplicationError: (error: string) => void;
}

export default function JobApplicationForm({ 
  jobId, 
  onApplicationSuccess, 
  onApplicationError 
}: JobApplicationFormProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [cvFile, setCvFile] = useState<{ url: string; name: string } | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<{ url: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      
      if (cvFile) {
        formData.append("cvFile", cvFile.url);
      }
      
      if (coverLetterFile) {
        formData.append("coverLetterFile", coverLetterFile.url);
      }
      
      if (coverLetterText) {
        formData.append("coverLetterText", coverLetterText);
      }

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onApplicationSuccess();
      } else {
        const error = await response.json();
        onApplicationError(error.error || "Failed to submit application");
      }
    } catch (error) {
      onApplicationError("An error occurred while submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Please sign in to apply for this job.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this Position</CardTitle>
        <CardDescription>
          Submit your application with your resume and optional cover letter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Upload */}
          <FileUpload
            onFileSelect={(url, name) => setCvFile({ url, name })}
            onFileRemove={() => setCvFile(null)}
            acceptedTypes={[
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ]}
            maxSize={5}
            label="CV/Resume"
            description="Upload your CV or resume"
          />

          {/* Cover Letter Options */}
          <div className="space-y-4">
            <Label>Cover Letter (Optional)</Label>
            
            {/* Text Cover Letter */}
            <div>
              <Label htmlFor="cover-letter-text" className="text-sm text-gray-600">
                Or write a cover letter
              </Label>
              <Textarea
                id="cover-letter-text"
                placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            {/* File Cover Letter */}
            <FileUpload
              onFileSelect={(url, name) => setCoverLetterFile({ url, name })}
              onFileRemove={() => setCoverLetterFile(null)}
              acceptedTypes={[
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ]}
              maxSize={5}
              label="Cover Letter File"
              description="Or upload a cover letter file"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting || (!cvFile && !session.user?.cvUrl)}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting Application...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>

          {!cvFile && !session.user?.cvUrl && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Please upload your CV to apply for this position.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
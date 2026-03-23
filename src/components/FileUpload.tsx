'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  defaultValue?: string;
  label?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "any";
}

export default function FileUpload({ 
  onUploadComplete, 
  defaultValue, 
  label = "上传图片", 
  className,
  aspectRatio = "square"
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload
    setIsUploading(true);
    setIsSuccess(false);

    // Artificial delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would use FormData and fetch to upload to S3/Cloudinary
    // Here we just return the local data URL as the "uploaded" URL for demo purposes
    const mockUrl = reader.result as string; 
    
    setIsUploading(false);
    setIsSuccess(true);
    onUploadComplete(mockUrl);

    // Reset success state after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const clearFile = () => {
    setPreview(null);
    onUploadComplete("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{label}</label>}
      
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden border-2 border-dashed rounded-3xl transition-all duration-500 ease-out",
          preview ? "border-green-500/30" : "border-white/10 hover:border-green-500/50 bg-white/5",
          aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "h-40",
          isUploading && "opacity-70 pointer-events-none"
        )}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Upload className="h-8 w-8 text-white" />
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:bg-green-500/10 transition-all duration-500">
              <ImageIcon className="h-8 w-8 text-zinc-500 group-hover:text-green-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">点击上传</p>
              <p className="text-xs text-zinc-500 mt-1">支持 JPG, PNG, WEBP</p>
            </div>
          </div>
        )}

        {/* Uploading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-10">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
            <p className="text-xs font-bold text-green-500 uppercase tracking-tighter">上传中...</p>
          </div>
        )}

        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-10 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-xs font-bold text-green-500 uppercase tracking-tighter">上传成功</p>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

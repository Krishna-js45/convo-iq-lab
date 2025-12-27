import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ImagePlus, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingAnalyzeInputProps {
  transcript: string;
  setTranscript: (value: string) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  sidebarOpen: boolean;
}

const FloatingAnalyzeInput = ({
  transcript,
  setTranscript,
  isAnalyzing,
  onAnalyze,
  sidebarOpen,
}: FloatingAnalyzeInputProps) => {
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validImages = files.filter(file => file.type.startsWith("image/"));
    
    // Limit to 4 images max
    const newImages = [...attachedImages, ...validImages].slice(0, 4);
    setAttachedImages(newImages);

    // Generate previews
    const newPreviews: string[] = [];
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newImages.length) {
          setImagePreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && transcript.trim()) {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300",
        sidebarOpen ? "lg:left-72" : ""
      )}
    >
      {/* Gradient fade effect */}
      <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      <div className="bg-transparent backdrop-blur-md border-t border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/20"
                >
                  <img
                    src={preview}
                    alt={`Attached ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/70 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image attach button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-10 w-10 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-white/20"
              disabled={attachedImages.length >= 4}
            >
              <ImagePlus className="w-5 h-5" />
            </Button>

            {/* Textarea container */}
            <div className="flex-1 relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
              <Textarea
                placeholder="Paste your conversation transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsExpanded(true)}
                onBlur={() => {
                  if (!transcript.trim()) {
                    setIsExpanded(false);
                  }
                }}
                className={cn(
                  "relative resize-none bg-white/[0.03] border border-white/10 text-white/90 placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20 pr-12 transition-all duration-300 rounded-xl",
                  isExpanded || transcript.trim() ? "min-h-[120px]" : "min-h-[48px]"
                )}
              />
            </div>

            {/* Analyze button */}
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing || !transcript.trim()}
              size="icon"
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-full transition-all duration-300 border",
                transcript.trim()
                  ? "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "bg-white/[0.02] text-white/30 border-white/10"
              )}
            >
              {isAnalyzing ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Helper text */}
          <div className="flex items-center justify-between mt-2 text-xs text-white/40">
            <span>
              {attachedImages.length > 0 && (
                <span className="text-white/60">{attachedImages.length}/4 images attached · </span>
              )}
              Press Enter to analyze, Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingAnalyzeInput;

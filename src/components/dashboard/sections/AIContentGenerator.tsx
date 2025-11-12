import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VisualGenerator from "./ai-generator/VisualGenerator";
import VideoGenerator from "./ai-generator/VideoGenerator";
import AICreatorGenerator from "./ai-generator/AICreatorGenerator";
import { Wand2 } from "lucide-react";

// Types for external ModelArk API
type SeedreamImageItem = {
  url: string;
  size?: string;
  image_index?: number;
};

type ImageGenerationResponse = {
  data: SeedreamImageItem[];
};

type VideoTaskResponse = {
  task_id?: string;
  status?: string;
  result?: any;
};

type ModelArkApiModule = {
  SeedreamAPI: {
    generateSingleImage: (
      prompt: string,
      options?: Record<string, any>
    ) => Promise<ImageGenerationResponse>;
    generateMultipleImages: (
      prompt: string,
      maxImages?: number,
      options?: Record<string, any>
    ) => Promise<ImageGenerationResponse>;
    editImage: (
      prompt: string,
      imageUrl: string,
      options?: Record<string, any>
    ) => Promise<ImageGenerationResponse>;
    expandImageToMultiples: (
      prompt: string,
      imageUrl: string,
      maxImages?: number,
      options?: Record<string, any>
    ) => Promise<ImageGenerationResponse>;
    generateWithReferenceImages: (
      prompt: string,
      imageUrls: string | string[],
      options?: Record<string, any>
    ) => Promise<ImageGenerationResponse>;
  };
  SeedanceAPI: {
    createVideoTask: (
      prompt: string,
      imageUrl?: string | null,
      options?: Record<string, any>
    ) => Promise<VideoTaskResponse>;
    createVideoWithFrames: (
      prompt: string,
      firstFrameUrl: string,
      lastFrameUrl: string,
      options?: Record<string, any>
    ) => Promise<VideoTaskResponse>;
    queryTask: (taskId: string) => Promise<VideoTaskResponse>;
    pollTaskUntilComplete: (
      taskId: string,
      maxAttempts?: number,
      interval?: number
    ) => Promise<VideoTaskResponse>;
  };
};

const AIContentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("visual");

  // External API module state
  const [apiModule, setApiModule] = useState<ModelArkApiModule | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [refImageUrl, setRefImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SeedreamImageItem[]>([]);
  const [videoTask, setVideoTask] = useState<VideoTaskResponse | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem('modelark_api_key') || '' : '';
    } catch { return ''; }
  });

  // Add state for number of images
  const [imageCount, setImageCount] = useState<number>(4);
  const [imageCountInput, setImageCountInput] = useState<string>('4');

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Seed localStorage with API key from env if available
      try {
        const env: any = (typeof import.meta !== "undefined" && (import.meta as any).env) ? (import.meta as any).env : {};
        const envKey = env?.VITE_ARK_API_KEY || env?.REACT_APP_ARK_API_KEY;
        if (envKey && typeof window !== "undefined" && window.localStorage) {
          const existing = window.localStorage.getItem("modelark_api_key");
          if (!existing) {
            window.localStorage.setItem("modelark_api_key", envKey);
            setApiKey(envKey);
          }
        }
      } catch {}

      try {
        // Prefer local copy to avoid FS sandbox issues
        const modLocal = await import(/* @vite-ignore */ "@/services/tmp-api.js");
        const apiLocal = (modLocal as any).default || modLocal;
        if (mounted) setApiModule(apiLocal as ModelArkApiModule);
        return; // stop here if local import succeeds
      } catch (e) {
        console.warn("Local ModelArk API module could not be loaded:", e);
      }
      try {
        // Fallback to external absolute path (may be blocked by bundler in browser)
        const mod = await import(/* @vite-ignore */ "/Users/bytedance/WorkAtByteDance/BytePlus/igdx-demo/src/services/api.js");
        const api = (mod as any).default || mod;
        if (mounted) setApiModule(api as ModelArkApiModule);
      } catch (e) {
        console.warn("External ModelArk API module could not be loaded:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveApiKey = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('modelark_api_key', apiKey);
      }
    } catch {}
  }, [apiKey]);

  const extractImages = useCallback((resp: any): SeedreamImageItem[] => {
    if (!resp) return [];
    if (Array.isArray(resp?.data)) {
      return resp.data.map((d: any) => ({
        url: d?.url ?? d,
        size: d?.size,
        image_index: d?.image_index,
      }));
    }
    if (Array.isArray(resp)) {
      return resp.map((d: any) => ({ url: d?.url ?? d }));
    }
    if (resp?.url) return [{ url: resp.url }];
    if (typeof resp === "string") return [{ url: resp }];
    return [];
  }, []);

  const handleGenerateSingle = useCallback(async () => {
    if (!apiModule) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await apiModule.SeedreamAPI.generateSingleImage(prompt, {
        watermark: false,
      });
      const imgs = extractImages(res);
      setResults(imgs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate image");
    } finally {
      setLoading(false);
    }
  }, [apiModule, prompt, extractImages]);

  const handleGenerateMultiple = useCallback(async () => {
    if (!apiModule) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await apiModule.SeedreamAPI.generateMultipleImages(
        prompt,
        imageCount, // Use the imageCount state instead of hardcoded 4
        { watermark: false }
      );
      const imgs = extractImages(res);
      setResults(imgs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate images");
    } finally {
      setLoading(false);
    }
  }, [apiModule, prompt, imageCount, extractImages]); // Add imageCount to dependencies

  const handleEditImage = useCallback(async () => {
    if (!apiModule || !refImageUrl) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await apiModule.SeedreamAPI.editImage(
        prompt,
        refImageUrl,
        { watermark: false }
      );
      const imgs = extractImages(res);
      setResults(imgs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to edit image");
    } finally {
      setLoading(false);
    }
  }, [apiModule, prompt, refImageUrl, extractImages]);

  const handleExpandImage = useCallback(async () => {
    if (!apiModule || !refImageUrl) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await apiModule.SeedreamAPI.expandImageToMultiples(
        prompt,
        refImageUrl,
        4,
        { watermark: false }
      );
      const imgs = extractImages(res);
      setResults(imgs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to expand image");
    } finally {
      setLoading(false);
    }
  }, [apiModule, prompt, refImageUrl, extractImages]);

  const handleGenerateWithReference = useCallback(async () => {
    if (!apiModule || !refImageUrl) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await apiModule.SeedreamAPI.generateWithReferenceImages(
        prompt,
        refImageUrl,
        { watermark: false }
      );
      const imgs = extractImages(res);
      setResults(imgs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate with reference image");
    } finally {
      setLoading(false);
    }
  }, [apiModule, prompt, refImageUrl, extractImages]);

  const handleCreateVideoTask = useCallback(async () => {
    if (!apiModule) return;
    setLoading(true);
    setError(null);
    setVideoTask(null);
    try {
      const res = await apiModule.SeedanceAPI.createVideoTask(
        prompt,
        refImageUrl || null,
        {}
      );
      setVideoTask(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create video task");
    } finally {
      setLoading(false);
    }
  }, [apiModule, prompt, refImageUrl]);

  const renderContent = () => {
    switch (activeTab) {
      case "visual":
        return <VisualGenerator />;
      case "video":
        return <VideoGenerator />;
      case "audio":
        return <AICreatorGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm">
          <Wand2 className="mr-2 h-4 w-4" />
          Quick Generate
        </Button>
      </div>



      {renderContent()}
    </div>
  );
};

export default AIContentGenerator;

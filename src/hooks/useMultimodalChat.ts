import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  createGenerationRequest,
  pollVideoRequest,
  GenerationRequest,
} from '@/services/generationRequestService';
import { resolveResultUrl } from '@/utils/resolveResultUrl';
import { joinStoredAttachmentUrls } from '@/utils/requestMedia';
import { toast } from 'sonner';

export type ChatMode = 'auto' | 'chat' | 'image' | 'video';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  kind: 'text' | 'image' | 'video' | 'pending' | 'error';
  content: string; // text content or status
  attachments?: { name: string; previewUrl: string }[]; // user uploads (preview only)
  resultUrl?: string;
  requestId?: string; // generation_requests.id for image/video
  status?: 'processing' | 'completed' | 'failed';
}

const STORAGE_KEY = 'viralin_chat_thread_v1';

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadThread(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch { return []; }
}

function saveThread(messages: ChatMessage[]) {
  try {
    // strip blob: previewUrls (won't be valid next session)
    const cleaned = messages.map(m => ({
      ...m,
      attachments: m.attachments?.map(a => ({ name: a.name, previewUrl: '' })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned.slice(-50)));
  } catch {}
}

export function useMultimodalChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadThread());
  const [isBusy, setIsBusy] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => { saveThread(messages); }, [messages]);

  const update = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const append = useCallback((m: ChatMessage) => {
    setMessages(prev => [...prev, m]);
    return m;
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // Build chat history (text only) for the router/chat
  const buildHistory = useCallback(() => {
    return messagesRef.current
      .filter(m => m.kind === 'text')
      .map(m => ({ role: m.role, content: m.content }));
  }, []);

  // Stream chat reply via SSE
  const streamChat = useCallback(async (assistantId: string, history: { role: string; content: string }[]) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-router`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ mode: 'chat', messages: history }),
    });

    if (resp.status === 429) { toast.error('Rate limit reached. Try again in a moment.'); update(assistantId, { kind: 'error', content: 'Rate limit reached.' }); return; }
    if (resp.status === 402) { toast.error('AI credits exhausted.'); update(assistantId, { kind: 'error', content: 'AI credits exhausted.' }); return; }
    if (!resp.ok || !resp.body) { update(assistantId, { kind: 'error', content: 'Chat unavailable.' }); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let acc = '';
    let done = false;
    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (json === '[DONE]') { done = true; break; }
        try {
          const parsed = JSON.parse(json);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (delta) {
            acc += delta;
            update(assistantId, { content: acc });
          }
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }
  }, [update]);

  // Run image/video generation and track until terminal
  const runGeneration = useCallback(async (
    assistantId: string,
    intent: 'image' | 'video',
    prompt: string,
    storageRefs: string[],
    routed: { ratio?: string; duration?: number; resolution?: string; useAttachmentAsFirstFrame?: boolean },
    audioRef?: string,
    firstFrameRef?: string,
    lastFrameRef?: string,
    maskRef?: string,
  ) => {
    if (!user) {
      update(assistantId, { kind: 'error', content: 'Please sign in to generate.' });
      return;
    }

    const refUrl = joinStoredAttachmentUrls(storageRefs);
    let request: GenerationRequest | null = null;

    if (intent === 'image') {
      const isInpaint = !!maskRef && storageRefs.length >= 1;
      request = await createGenerationRequest({
        requestType: 'image',
        prompt,
        aspectRatio: routed.ratio,
        referenceImageUrl: refUrl,
        category: isInpaint ? 'image-inpaint' : (storageRefs.length ? 'image-edit-instruction' : 'image-gen'),
        referenceImageUrls: storageRefs.length ? storageRefs : undefined,
        maskUrl: isInpaint ? maskRef : undefined,
      });
    } else {
      const hasFirst = !!firstFrameRef;
      const hasLast = !!lastFrameRef;
      const isKf2v = hasFirst && hasLast;
      const isLipsync = !isKf2v && !!audioRef && (hasFirst || storageRefs.length >= 1);
      const isI2V = !isKf2v && !isLipsync && (hasFirst || (storageRefs.length === 1 && routed.useAttachmentAsFirstFrame !== false));
      const isR2V = !isKf2v && !isLipsync && !isI2V && storageRefs.length > 1;
      const category = isKf2v ? 'video-kf2v'
        : isLipsync ? 'video-lipsync'
        : isR2V ? 'video-r2v'
        : isI2V ? 'video-i2v'
        : 'video-t2v';

      const firstFrame = firstFrameRef || (isI2V && !hasFirst ? storageRefs[0] : undefined);

      request = await createGenerationRequest({
        requestType: 'video',
        prompt,
        aspectRatio: routed.ratio,
        referenceImageUrl: refUrl,
        category,
        firstFrameUrl: (category === 'video-i2v' || category === 'video-kf2v' || category === 'video-lipsync') ? firstFrame : undefined,
        lastFrameUrl: category === 'video-kf2v' ? lastFrameRef : undefined,
        referenceImageUrls: category === 'video-r2v' ? storageRefs : undefined,
        duration: routed.duration,
        resolution: routed.resolution,
        audioUrl: audioRef,
        lipsyncMode: isLipsync ? 'portrait' : undefined,
      });
    }


    if (!request) {
      update(assistantId, { kind: 'error', content: 'Could not start generation. Check your credits.' });
      return;
    }

    update(assistantId, {
      kind: 'pending',
      requestId: request.id,
      status: 'processing',
      content: intent === 'image' ? 'Generating your image…' : 'Generating your video…',
    });

    // Poll
    const poll = async (): Promise<void> => {
      try {
        if (
          request!.request_type === 'video' &&
          (request as any).auto_provider === 'wan'
        ) {
          await pollVideoRequest(request!.id);
        }
        const { data } = await supabase
          .from('generation_requests')
          .select('*')
          .eq('id', request!.id)
          .maybeSingle();
        if (!data) return;
        const cur = data as GenerationRequest;
        if (cur.status === 'completed' && cur.result_url) {
          const url = await resolveResultUrl(cur.result_url);
          update(assistantId, {
            kind: intent,
            status: 'completed',
            resultUrl: url || cur.result_url,
            content: intent === 'image' ? 'Here is your image.' : 'Here is your video.',
          });
          return;
        }
        if (cur.status === 'failed') {
          update(assistantId, {
            kind: 'error',
            status: 'failed',
            content: 'Auto-generation failed. A human editor will take over and the result will appear in your dashboard.',
          });
          return;
        }
        setTimeout(poll, 5000);
      } catch (e) {
        console.error('poll error', e);
        setTimeout(poll, 8000);
      }
    };
    setTimeout(poll, 3000);
  }, [user, update]);

  const send = useCallback(async (
    text: string,
    attachments: File[],
    modeOverride: ChatMode = 'auto',
    videoOpts?: {
      ratio?: string;
      duration?: number;
      resolution?: string;
      audioFile?: File | null;
      firstFrameFile?: File | null;
      lastFrameFile?: File | null;
    },
    imageOpts?: {
      maskFile?: File | null;
    },
  ) => {
    if (!text.trim() && attachments.length === 0 && !videoOpts?.firstFrameFile && !videoOpts?.lastFrameFile) return;
    setIsBusy(true);

    // 1. Append user message
    const allPreviews: File[] = [
      ...attachments,
      ...(videoOpts?.firstFrameFile ? [videoOpts.firstFrameFile] : []),
      ...(videoOpts?.lastFrameFile ? [videoOpts.lastFrameFile] : []),
    ];
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      kind: 'text',
      content: text,
      attachments: allPreviews.map(f => ({ name: f.name, previewUrl: URL.createObjectURL(f) })),
    };
    setMessages(prev => [...prev, userMsg]);

    const uploadFile = async (file: File, prefix = ''): Promise<string | undefined> => {
      if (!user) return undefined;
      try {
        const fileName = `${user.id}/${prefix}${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        if (error || !data) return undefined;
        return `storage:product-images/${data.path}`;
      } catch (e) { console.error('upload fail', e); return undefined; }
    };

    // 2. Upload attachments (paperclip)
    const storageRefs: string[] = [];
    if (user && attachments.length) {
      for (const file of attachments) {
        const r = await uploadFile(file);
        if (r) storageRefs.push(r);
      }
    }

    // 2b. Upload optional audio + keyframe files for video mode
    let audioRef: string | undefined;
    let firstFrameRef: string | undefined;
    let lastFrameRef: string | undefined;
    let maskRef: string | undefined;
    if (user && videoOpts?.audioFile) audioRef = await uploadFile(videoOpts.audioFile, 'audio-');
    if (user && videoOpts?.firstFrameFile) firstFrameRef = await uploadFile(videoOpts.firstFrameFile, 'first-');
    if (user && videoOpts?.lastFrameFile) lastFrameRef = await uploadFile(videoOpts.lastFrameFile, 'last-');
    if (user && imageOpts?.maskFile) maskRef = await uploadFile(imageOpts.maskFile, 'mask-');

    // If a mask is provided, force image intent (inpaint)
    const hasMask = !!maskRef;

    // 3. Decide intent
    let intent: 'chat' | 'image' | 'video' = 'chat';
    let routed: { prompt?: string; ratio?: string; duration?: number; resolution?: string; useAttachmentAsFirstFrame?: boolean } = {};

    if (modeOverride !== 'auto') {
      intent = modeOverride;
      routed.prompt = text;
    } else {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-router`;
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            mode: 'route',
            messages: [...buildHistory(), { role: 'user', content: text }],
            hasAttachment: attachments.length > 0,
          }),
        });
        if (r.ok) {
          const j = await r.json();
          intent = (j.intent as any) || 'chat';
          routed = j;
        }
      } catch (e) {
        console.error('route err', e);
      }
    }

    // If user provided keyframes, force video intent
    if (firstFrameRef || lastFrameRef) intent = 'video';
    // If user provided a mask, force image intent (inpaint)
    if (hasMask) intent = 'image';

    // Merge explicit video options (user-selected) over routed values
    if (intent === 'video' && videoOpts) {
      if (videoOpts.ratio) routed.ratio = videoOpts.ratio;
      if (videoOpts.duration) routed.duration = videoOpts.duration;
      if (videoOpts.resolution) routed.resolution = videoOpts.resolution;
    }

    // 4. Reserve assistant message
    const assistantMsg: ChatMessage = {
      id: uid(),
      role: 'assistant',
      kind: intent === 'chat' ? 'text' : 'pending',
      content: intent === 'chat' ? '' : (intent === 'image' ? 'Starting image…' : 'Starting video…'),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      if (intent === 'chat') {
        await streamChat(assistantMsg.id, [...buildHistory(), { role: 'user', content: text }]);
      } else {
        if (!user) {
          update(assistantMsg.id, { kind: 'error', content: 'Please sign in to generate images or videos.' });
        } else {
          await runGeneration(
            assistantMsg.id,
            intent,
            (routed.prompt && routed.prompt.trim()) || text,
            storageRefs,
            routed,
            audioRef,
            firstFrameRef,
            lastFrameRef,
            maskRef,
          );
        }
      }
    } finally {
      setIsBusy(false);
    }
  }, [user, buildHistory, streamChat, runGeneration, update]);

  return { messages, send, isBusy, clear };
}

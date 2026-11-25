"use client";

import { useState, useTransition, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { 
  QrCode, Search, Upload, Camera, CheckCircle, 
  XCircle, Loader2, UserCheck, AlertTriangle 
} from "lucide-react";
import jsQR from "jsqr";
import { verifyCheckInTicket, confirmCheckInAction, scanCheckIn, type ScanResult } from "@/actions/registrations";
import { RegistrationStatusBadge } from "@/components/shared/RegistrationStatusBadge";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

interface CheckInClientProps {
  demoTickets: Array<{
    ticketNumber: string;
    token: string;
    studentName: string;
    eventName: string;
    teamName: string;
  }>;
}

const subscribeNoop = () => () => {};

function extractTicketPayload(rawString: string): { identifier: string; token: string } | null {
  if (!rawString || typeof rawString !== "string") return null;
  const dataStr = rawString.trim();

  // 1. JSON Payload format (from generateQRCodeDataUrl)
  try {
    const parsed = JSON.parse(dataStr);
    const identifier = parsed.ticketNumber || parsed.ticketId || parsed.id || parsed.registrationId || "";
    const token = parsed.verificationToken || parsed.token || "";
    if (identifier) {
      return { identifier, token };
    }
  } catch {}

  // 2. Colon-delimited format "TICKET_NUMBER:TOKEN"
  if (dataStr.includes(":") && !dataStr.startsWith("http")) {
    const parts = dataStr.split(":");
    if (parts.length >= 2) {
      return { identifier: parts[0].trim(), token: parts[1].trim() };
    }
  }

  // 3. URL format "http.../dashboard/tickets/[id]"
  if (dataStr.startsWith("http")) {
    try {
      const url = new URL(dataStr);
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      if (lastSegment) {
        return {
          identifier: lastSegment,
          token: url.searchParams.get("token") || "",
        };
      }
    } catch {}
  }

  // 4. Raw identifier fallback (e.g. CE-TKT-2026-0001 or UUID)
  if (dataStr.length >= 3) {
    return { identifier: dataStr, token: "" };
  }

  return null;
}

function decodeQRFromImage(img: HTMLImageElement): { identifier: string; token: string } | null {
  const maxDim = Math.max(img.width, img.height);
  const targetScales = [
    1,
    1200 / maxDim,
    800 / maxDim,
    500 / maxDim,
    350 / maxDim,
  ].filter(s => s > 0 && s <= 1.5);

  // Remove near duplicates
  const uniqueScales = Array.from(new Set(targetScales.map(s => Math.round(s * 100) / 100)));

  for (const scale of uniqueScales) {
    const targetW = Math.max(50, Math.round(img.width * scale));
    const targetH = Math.max(50, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) continue;

    ctx.drawImage(img, 0, 0, targetW, targetH);
    const imageData = ctx.getImageData(0, 0, targetW, targetH);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data) {
      const payload = extractTicketPayload(code.data);
      if (payload) {
        return payload;
      }
    }
  }
  return null;
}

type ScanState =
  | { phase: "idle" }
  | { phase: "verifying" }
  | { phase: ScanResult["state"]; result: ScanResult };

// How long the colour result stays up before the scanner re-arms itself for the next ticket
const RESULT_MS = { valid: 1400, used: 2200, invalid: 2200 } as const;
// The same QR still sitting in front of the camera must not be submitted again
const SAME_CODE_COOLDOWN_MS = 5000;

const PHASE_STYLE = {
  verifying: { bg: "bg-amber-400", text: "text-black", title: "Verifying…" },
  valid: { bg: "bg-emerald-500", text: "text-white", title: "Valid — Entry Approved" },
  used: { bg: "bg-red-600", text: "text-white", title: "Already Used" },
  invalid: { bg: "bg-red-600", text: "text-white", title: "Invalid Ticket" },
} as const;

function PhaseIcon({ phase, className }: { phase: keyof typeof PHASE_STYLE; className?: string }) {
  if (phase === "verifying") return <Loader2 className={cn(className, "animate-spin")} />;
  if (phase === "valid") return <CheckCircle className={className} />;
  if (phase === "used") return <AlertTriangle className={className} />;
  return <XCircle className={className} />;
}

export function CheckInClient({ demoTickets }: CheckInClientProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("camera");
  const [ticketSearch, setTicketSearch] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");

  // Manual flow (verify, then approve)
  const [scannedDetails, setScannedDetails] = useState<Extract<Awaited<ReturnType<typeof verifyCheckInTicket>>, { success: boolean }> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isDecodingImage, setIsDecodingImage] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Instant scan flow (camera + upload): yellow -> green/red -> back to idle on its own
  const [scan, setScan] = useState<ScanState>({ phase: "idle" });
  const [lastScan, setLastScan] = useState<Exclude<ScanState, { phase: "idle" | "verifying" }> | null>(null);
  const busyRef = useRef(false); // one ticket in flight / on screen at a time
  const lastCodeRef = useRef({ key: "", at: 0 });
  const resetTimer = useRef<number | undefined>(undefined);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Stable (only touches refs, setters and an imported action) so the camera loop never holds a stale copy
  const runScan = useCallback(async (payload: { identifier: string; token: string }) => {
    const key = `${payload.identifier}:${payload.token}`;
    const now = Date.now();
    if (busyRef.current) return;
    if (lastCodeRef.current.key === key && now - lastCodeRef.current.at < SAME_CODE_COOLDOWN_MS) return;
    busyRef.current = true;
    lastCodeRef.current = { key, at: now };

    setScannedDetails(null);
    setErrorMsg(null);
    setScan({ phase: "verifying" });
    try { navigator.vibrate?.(30); } catch {}

    const device = navigator.userAgent.includes("Mobile") ? "Mobile Scanner" : "Desktop Terminal";
    const result = await scanCheckIn(payload.identifier, payload.token, device);
    const next = { phase: result.state, result } as const;
    setScan(next);
    setLastScan(next);
    lastCodeRef.current.at = Date.now();
    try { navigator.vibrate?.(result.state === "valid" ? 80 : [120, 60, 120]); } catch {}

    // Auto-prepare for the next ticket
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => {
      setScan({ phase: "idle" });
      busyRef.current = false;
    }, RESULT_MS[result.state]);
  }, []);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  // Manual lookup: shows the attendee first, staff approve explicitly
  const handleVerify = async (ticketNum: string, token?: string) => {
    if (!ticketNum.trim()) {
      toast.error("Please provide a valid ticket number or QR pass.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setScannedDetails(null);
    setLastScan(null);

    try {
      const res = await verifyCheckInTicket(ticketNum, token);
      setIsVerifying(false);

      if (!res.success) {
        const msg = res.error ?? "Failed to verify ticket.";
        setErrorMsg(msg);
        toast.error(msg);
      } else {
        setScannedDetails(res);
      }
    } catch (err) {
      setIsVerifying(false);
      setErrorMsg((err as Error)?.message || "Failed to verify ticket.");
      toast.error((err as Error)?.message || "Failed to verify ticket.");
    }
  };

  const handleApprove = () => {
    if (!scannedDetails?.ticket?.id) return;

    startTransition(async () => {
      try {
        const res = await confirmCheckInAction(
          scannedDetails.ticket.id,
          "MANUAL",
          navigator.userAgent.includes("Mobile") ? "Mobile Scanner" : "Desktop Terminal"
        );

        if (res.error) {
          toast.error(res.error);
        } else {
          setShowSuccessAnimation(true);
          toast.success("Attendee successfully checked in!");
          setTimeout(() => {
            setShowSuccessAnimation(false);
            setScannedDetails(null);
            setTicketSearch("");
            setTokenSearch("");
          }, 2500);
        }
      } catch (err) {
        toast.error((err as Error)?.message || "Failed to confirm check-in.");
      }
    });
  };

  // Process uploaded image file
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    setIsDecodingImage(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setIsDecodingImage(false);
        const payload = decodeQRFromImage(img);

        if (payload) {
          // A deliberate upload should always run, even for a code scanned moments ago
          lastCodeRef.current = { key: "", at: 0 };
          runScan(payload);
        } else {
          toast.error("No valid QR code could be detected in this image. Please ensure the QR code is clearly visible.");
        }
      };

      img.onerror = () => {
        setIsDecodingImage(false);
        toast.error("Failed to load image file.");
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setIsDecodingImage(false);
      toast.error("Error reading file.");
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDemoScan = (ticketNum: string, token: string) => {
    setTicketSearch(ticketNum);
    setTokenSearch(token);
    handleVerify(ticketNum, token);
  };

  // Continuous camera scan loop (rear camera, continuous autofocus, runs until the tab changes)
  useEffect(() => {
    if (!mounted || activeTab !== "camera") return;

    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let decoding = false;
    let lastJsQr = 0;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Native detector (Chrome/Android, hardware accelerated) when available, else jsQR
    type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };
    const NativeDetector = (globalThis as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    let detector: Detector | null = null;
    try { detector = NativeDetector ? new NativeDetector({ formats: ["qr_code"] }) : null; } catch { detector = null; }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const SCAN_SIZE = 640; // jsQR works on a downscaled centre square: far fewer pixels than a full frame

    const decodeFrame = async (now: number): Promise<string | null> => {
      if (detector) {
        try {
          const [hit] = await detector.detect(video);
          if (hit?.rawValue) return hit.rawValue;
        } catch {
          detector = null; // unsupported for this source: jsQR only from now on
        }
      }
      // Some devices' native detectors miss codes jsQR reads fine, so jsQR also runs (throttled) on native misses
      if (!ctx || now - lastJsQr < 80) return null;
      lastJsQr = now;
      const side = Math.min(video.videoWidth, video.videoHeight);
      if (!side) return null;
      const size = Math.min(SCAN_SIZE, side);
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(video, (video.videoWidth - side) / 2, (video.videoHeight - side) / 2, side, side, 0, 0, size, size);
      const { data, width, height } = ctx.getImageData(0, 0, size, size);
      return jsQR(data, width, height, { inversionAttempts: "dontInvert" })?.data ?? null;
    };

    const tick = async (now: number) => {
      if (cancelled) return;
      raf = requestAnimationFrame(tick);
      // Don't decode while a ticket is being verified/shown or a previous frame is still decoding
      if (decoding || busyRef.current || video.readyState < video.HAVE_ENOUGH_DATA) return;
      decoding = true;
      try {
        const raw = await decodeFrame(now);
        const payload = raw ? extractTicketPayload(raw) : null;
        if (payload) runScan(payload);
      } finally {
        decoding = false;
      }
    };

    const startCamera = async () => {
      try {
        const base = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
        let mediaStream: MediaStream;
        try {
          // Rear camera by default; desktops without one fall through to the next attempt
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: { ...base, facingMode: { ideal: "environment" } } });
        } catch {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = mediaStream;

        // Continuous autofocus where the browser exposes it (Chrome/Android); silently ignored elsewhere
        const track = mediaStream.getVideoTracks()[0];
        const caps = track?.getCapabilities?.() as { focusMode?: string[] } | undefined;
        if (caps?.focusMode?.includes("continuous")) {
          await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] }).catch(() => {});
        }

        video.srcObject = mediaStream;
        video.setAttribute("playsinline", "true");
        await video.play().catch((err) => {
          if (err?.name !== "AbortError") console.warn("Video play error:", err);
        });
        if (cancelled) return;
        setCameraActive(true);
        raf = requestAnimationFrame(tick);
      } catch (err) {
        if ((err as Error)?.name !== "AbortError" && !cancelled) console.warn("Camera access failed or unavailable:", err);
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      setCameraActive(false);
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [activeTab, mounted, runScan]);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start relative">
      
      {/* Scanner Control Panel */}
      <div className="space-y-6 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex border-b border-border/50 pb-3 gap-2">
          <button 
            onClick={() => setActiveTab("camera")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "camera" ? "bg-white text-black shadow-md" : "text-text-faint hover:text-white"
            )}
          >
            <Camera className="w-4 h-4" /> Camera
          </button>
          <button 
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "upload" ? "bg-white text-black shadow-md" : "text-text-faint hover:text-white"
            )}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button 
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "manual" ? "bg-white text-black shadow-md" : "text-text-faint hover:text-white"
            )}
          >
            <Search className="w-4 h-4" /> Manual
          </button>
        </div>

        {/* Tab 1: Live Camera Stream */}
        {activeTab === "camera" && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/50 border border-border flex items-center justify-center">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                playsInline 
                muted 
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Graphic */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-[68%] aspect-square border-2 border-white/80 rounded-3xl relative flex items-center justify-center">
                  <div className="w-full h-0.5 bg-lime shadow-[0_0_12px_var(--color-lime)] animate-bounce" />
                </div>
              </div>

              {/* Instant result: yellow = verifying, green = valid, red = invalid / already used */}
              {scan.phase !== "idle" && (
                <div
                  role="status"
                  aria-live="assertive"
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center animate-in fade-in duration-100",
                    PHASE_STYLE[scan.phase].bg,
                    PHASE_STYLE[scan.phase].text
                  )}
                >
                  <PhaseIcon phase={scan.phase} className="w-20 h-20 stroke-[2.5]" />
                  <p className="text-2xl font-anton uppercase tracking-wide">{PHASE_STYLE[scan.phase].title}</p>
                  {scan.phase !== "verifying" && (
                    <>
                      {scan.result.studentName && <p className="text-lg font-bold">{scan.result.studentName}</p>}
                      <p className="text-sm font-medium opacity-90">{scan.result.message}</p>
                    </>
                  )}
                </div>
              )}

              {!cameraActive && (
                <div className="absolute inset-0 bg-bg-elevated/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-10 h-10 text-text-faint mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-white">Starting Optical Camera...</p>
                  <p className="text-xs text-text-faint mt-1">Please allow camera permissions in your browser, or switch to Upload/Manual mode.</p>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-text-faint">
              Point your camera directly at the student&apos;s digital ticket QR code.
            </p>
          </div>
        )}

        {/* Tab 2: Upload Ticket Screenshot */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <label 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) processImageFile(droppedFile);
              }}
              className="border-2 border-dashed border-border hover:border-lime/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-card-hover/20 relative"
            >
              {isDecodingImage ? (
                <div className="py-4 space-y-2 flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-lime animate-spin" />
                  <p className="text-sm font-semibold text-white">Scanning QR Code across resolutions...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-lime mb-3" />
                  <p className="text-sm font-semibold text-white">Upload Ticket QR Screenshot</p>
                  <p className="text-xs text-text-faint mt-1">Drag & drop or click to browse PNG, JPG, or WebP</p>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>
            <p className="text-center text-xs text-text-faint">
              Supports full-screen mobile screenshots, dark mode passes, and downloaded tickets.
            </p>
          </div>
        )}

        {/* Tab 3: Manual Input Search */}
        {activeTab === "manual" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                Ticket Number / Identifier
              </label>
              <input 
                type="text" 
                placeholder="e.g. CE-TKT-2026-XXXX or Ticket ID" 
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-white text-sm outline-none focus:border-lime font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">
                Digital Verification Signature Token (Optional for Admins)
              </label>
              <input 
                type="text" 
                placeholder="e.g. 7f8a9b2c3d4e..." 
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-white text-sm outline-none focus:border-lime font-mono"
              />
            </div>

            <button 
              onClick={() => handleVerify(ticketSearch, tokenSearch)}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-lime text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verify Attendee Record
            </button>
          </div>
        )}

        {/* Demo Fast-Scan Shortcuts: dev only. One tap performs a real check-in, so never show it in production. */}
        {process.env.NODE_ENV !== "production" && demoTickets.length > 0 && (
          <div className="border-t border-border/50 pt-4">
            <p className="text-[11px] font-bold text-text-faint uppercase tracking-wider mb-2">
              Recent Issued Tickets (Click to Fast-Test):
            </p>
            <div className="flex flex-wrap gap-2">
              {demoTickets.slice(0, 4).map(t => (
                <button
                  key={t.ticketNumber}
                  onClick={() => handleDemoScan(t.ticketNumber, t.token)}
                  className="px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border text-[11px] font-mono text-white/80 hover:text-lime hover:border-lime transition-all cursor-pointer"
                >
                  {t.ticketNumber} ({t.studentName})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validation Result Inspection View */}
      <div className="space-y-6">
        {showSuccessAnimation ? (
          <div className="p-8 rounded-3xl bg-lime/10 border border-lime/30 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-lime text-black flex items-center justify-center mx-auto shadow-lg shadow-lime/20">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-anton uppercase text-white tracking-wide">Check-In Confirmed!</h2>
            <p className="text-sm text-lime/90 font-medium">Attendee verified and checked in to event roster.</p>
          </div>
        ) : scannedDetails ? (
          <div className="p-6 md:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-lime/10 border border-lime/20 text-lime text-[11px] font-bold tracking-widest uppercase">
                  Verified QR Pass
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{scannedDetails.event.title}</h3>
              </div>
              <div className="text-right">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  scannedDetails.registration.checkInStatus === "CHECKED_IN" 
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                )}>
                  {scannedDetails.registration.checkInStatus === "CHECKED_IN" ? "Already Checked In" : "Ready For Entry"}
                </span>
              </div>
            </div>

            {/* Student & Ticket Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-bg-elevated border border-border">
                <p className="text-xs text-text-faint uppercase font-semibold">Attendee Name</p>
                <p className="text-base font-bold text-white mt-0.5">{scannedDetails.student.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{scannedDetails.student.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-bg-elevated border border-border">
                <p className="text-xs text-text-faint uppercase font-semibold">Ticket ID</p>
                <p className="text-base font-mono font-bold text-lime mt-0.5">{scannedDetails.ticket.ticketNumber}</p>
                <p className="text-xs text-text-muted mt-0.5">Team: {scannedDetails.registration.teamName || "Individual Entry"}</p>
              </div>

              <div className="p-4 rounded-xl bg-bg-elevated border border-border">
                <p className="text-xs text-text-faint uppercase font-semibold">Institution / Major</p>
                <p className="text-sm font-semibold text-white mt-0.5">{scannedDetails.student.college}</p>
                <p className="text-xs text-text-muted mt-0.5">{scannedDetails.student.branch} · {scannedDetails.student.academicYear}</p>
              </div>

              <div className="p-4 rounded-xl bg-bg-elevated border border-border">
                <p className="text-xs text-text-faint uppercase font-semibold">Contact Phone</p>
                <p className="text-sm font-semibold text-white mt-0.5">{scannedDetails.student.phone}</p>
                <p className="text-xs text-text-muted mt-0.5">Issued: {format(new Date(scannedDetails.ticket.issuedAt), "MMM d, yyyy")}</p>
              </div>
            </div>

            {/* Check-in Actions */}
            <div className="border-t border-border pt-4 flex flex-col sm:flex-row gap-3">
              {scannedDetails.registration.checkInStatus === "CHECKED_IN" ? (
                <div className="w-full p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold text-center">
                  ⚠️ This pass was already checked in on {scannedDetails.registration.checkedInAt ? format(new Date(scannedDetails.registration.checkedInAt), "MMM d 'at' h:mm a") : "an earlier scan"} by {scannedDetails.registration.checkedInByName || "Organizer"}.
                </div>
              ) : (
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="w-full py-4 rounded-2xl bg-lime text-black font-bold text-base flex items-center justify-center gap-2 hover:bg-lime/90 transition-all shadow-[4px_4px_0_var(--color-coral)] cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                  Approve Entry & Check In
                </button>
              )}
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Verification Failed</h3>
            <p className="text-sm text-red-300/80 max-w-sm mx-auto">{errorMsg}</p>
          </div>
        ) : (scan.phase !== "idle" ? scan : lastScan) ? (
          (() => {
            const s = (scan.phase !== "idle" ? scan : lastScan)!;
            const st = PHASE_STYLE[s.phase];
            const r = s.phase === "verifying" ? null : s.result;
            return (
              <div className={cn("p-8 rounded-3xl text-center space-y-3 shadow-2xl", st.bg, st.text)} role="status" aria-live="polite">
                <PhaseIcon phase={s.phase} className="w-14 h-14 mx-auto stroke-[2.5]" />
                <h3 className="text-2xl font-anton uppercase tracking-wide">{st.title}</h3>
                {r && (
                  <>
                    <p className="text-sm font-medium opacity-90">{r.message}</p>
                    <div className="mt-2 rounded-2xl bg-black/15 p-4 text-left text-sm space-y-1">
                      {r.studentName && <p className="font-bold text-base">{r.studentName}</p>}
                      {r.college && <p className="opacity-90">{r.college}</p>}
                      {r.eventTitle && <p className="opacity-90">{r.eventTitle}{r.teamName ? ` · Team ${r.teamName}` : ""}</p>}
                      {r.ticketNumber && <p className="font-mono font-bold">{r.ticketNumber}</p>}
                    </div>
                  </>
                )}
              </div>
            );
          })()
        ) : (
          <div className="p-12 rounded-3xl bg-card border border-border border-dashed text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-4 text-text-faint">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Pass Scanned Yet</h3>
            <p className="text-xs text-text-faint max-w-xs mt-1">
              Position a ticket QR code inside the camera viewfinder, upload a screenshot, or enter the ticket number manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { 
  QrCode, Search, Upload, Camera, CheckCircle, 
  XCircle, Loader2, Smartphone, ShieldCheck, UserCheck 
} from "lucide-react";
import jsQR from "jsqr";
import { verifyCheckInTicket, confirmCheckInAction } from "@/actions/registrations";
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

export function CheckInClient({ demoTickets }: CheckInClientProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">("camera");
  const [ticketSearch, setTicketSearch] = useState("");
  const [tokenSearch, setTokenSearch] = useState("");
  
  // Scanned verification details state
  const [scannedDetails, setScannedDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Transitions
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Camera canvas references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Camera Scan Loop
  useEffect(() => {
    if (!mounted) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          setCameraActive(true);
          scanFrame();
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraActive(false);
      }
    };

    const scanFrame = () => {
      if (videoRef.current && canvasRef.current && activeTab === "camera") {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            try {
              const parsed = JSON.parse(code.data);
              if (parsed.ticketId && parsed.verificationToken) {
                if (navigator.vibrate) navigator.vibrate(200);
                handleVerify(parsed.ticketId, parsed.verificationToken);
                setActiveTab("manual");
                setTicketSearch(parsed.ticketId);
                setTokenSearch(parsed.verificationToken);
                return;
              }
            } catch (e) {
              const parts = code.data.split(":");
              if (parts.length === 2) {
                handleVerify(parts[0], parts[1]);
                setActiveTab("manual");
                setTicketSearch(parts[0]);
                setTokenSearch(parts[1]);
                return;
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(scanFrame);
    };

    if (activeTab === "camera") {
      startCamera();
    } else {
      setCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTab, mounted]);

  if (!mounted) return null;

  const handleVerify = async (ticketNum: string, token: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    setScannedDetails(null);

    const res = await verifyCheckInTicket(ticketNum, token);
    setIsVerifying(false);

    if (res.error) {
      setErrorMsg(res.error);
      toast.error(res.error);
    } else {
      setScannedDetails(res);
      toast.success("Ticket scanned and signature verified!");
    }
  };

  const handleApprove = () => {
    if (!scannedDetails?.ticket?.id) return;
    
    startTransition(async () => {
      const res = await confirmCheckInAction(
        scannedDetails.ticket.id, 
        activeTab === "manual" ? "MANUAL" : "QR",
        "Admin Check-in Console"
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        setShowSuccessAnimation(true);
        toast.success("Attendance marked successfully!");
        
        // Refresh scanned states
        setScannedDetails((prev: any) => ({
          ...prev,
          ticket: { ...prev.ticket, status: "USED" },
          registration: {
            ...prev.registration,
            status: "CHECKED_IN",
            checkInStatus: "CHECKED_IN",
            checkedInAt: new Date().toISOString(),
          }
        }));

        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 3000);
      }
    });
  };

  // Handle Drag & Drop QR Image decoding
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            try {
              const parsed = JSON.parse(code.data);
              if (parsed.ticketId && parsed.verificationToken) {
                handleVerify(parsed.ticketId, parsed.verificationToken);
                return;
              }
            } catch (e) {
              const parts = code.data.split(":");
              if (parts.length === 2) {
                handleVerify(parts[0], parts[1]);
                return;
              }
            }
            toast.error("Decoded QR successfully, but format was invalid.");
          } else {
            toast.error("No QR code detected in this image.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDemoScan = (ticketNum: string, token: string) => {
    handleVerify(ticketNum, token);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start relative">
      
      {/* Scanner Control Panel */}
      <div className="space-y-6 bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex border-b border-border/50 pb-3 gap-2">
          <button 
            onClick={() => setActiveTab("camera")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "camera" ? "bg-white text-black" : "text-text-faint hover:text-white"
            )}
          >
            <Camera className="w-4 h-4" /> Camera
          </button>
          <button 
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "upload" ? "bg-white text-black" : "text-text-faint hover:text-white"
            )}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button 
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5",
              activeTab === "manual" ? "bg-white text-black" : "text-text-faint hover:text-white"
            )}
          >
            <Search className="w-4 h-4" /> Manual
          </button>
        </div>

        {/* Tab 1: Live Camera Scanner */}
        {activeTab === "camera" && (
          <div className="space-y-4 font-archivo">
            <div className="aspect-square bg-black border border-border/60 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover absolute inset-0"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Laser line overlay scanning guide */}
              <div className="absolute inset-0 border-[30px] border-black/45 flex items-center justify-center pointer-events-none z-10">
                <div className="w-48 h-48 border-2 border-dashed border-[var(--color-lime)]/70 rounded-xl relative">
                  <div className="absolute left-2 right-2 h-0.5 bg-[var(--color-lime)] shadow-[0_0_8px_var(--color-lime)] animate-[laser_2s_infinite_ease-in-out]" />
                </div>
              </div>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes laser {
                  0%, 100% { top: 5%; }
                  50% { top: 95%; }
                }
              `}} />

              {!cameraActive && (
                <div className="absolute inset-0 bg-[#0C0C0C]/85 flex flex-col items-center justify-center text-center p-6 z-20">
                  <QrCode className="w-12 h-12 text-white/20 mb-3 animate-pulse" />
                  <p className="text-sm font-bold text-white">Starting Video Feed...</p>
                  <p className="text-xs text-white/40 mt-1 max-w-[200px]">Please approve camera privileges if prompted by the browser.</p>
                </div>
              )}
            </div>

            {/* Test demo selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-text-muted uppercase">Scan Demo DB Ticket (For Testing)</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {demoTickets.length === 0 ? (
                  <p className="text-xs text-text-faint py-3 text-center border border-dashed border-border rounded-xl">
                    No active tickets in database to test. Create one first!
                  </p>
                ) : (
                  demoTickets.map((demo, i) => (
                    <button
                      key={i}
                      onClick={() => handleDemoScan(demo.ticketNumber || demo.token, demo.token)}
                      className="w-full text-left p-2.5 rounded-xl border border-border bg-card-hover hover:border-lime/30 text-xs flex flex-col gap-1 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between font-bold text-white group-hover:text-lime">
                        <span>{demo.studentName}</span>
                        <span className="font-mono text-[10px] text-text-faint">{demo.ticketNumber}</span>
                      </div>
                      <div className="text-[10px] text-text-faint flex justify-between">
                        <span>{demo.eventName}</span>
                        <span className="italic">{demo.teamName}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload Ticket QR Code */}
        {activeTab === "upload" && (
          <div className="border-2 border-dashed border-border/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center hover:border-[var(--color-lime)]/30 hover:bg-white/[0.01] transition-all relative min-h-[300px]">
            <Upload className="w-8 h-8 text-text-faint mb-3" />
            <p className="text-sm font-bold text-white mb-1">Upload QR image file</p>
            <p className="text-xs text-text-faint max-w-[200px] leading-relaxed mb-4 font-archivo">
              Select or drop ticket pass screenshots to auto-verify.
            </p>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer" 
              id="qr-file-upload" 
            />
            <label 
              htmlFor="qr-file-upload" 
              className="px-4 py-2.5 bg-[#1b1b1b] border border-border hover:border-[var(--color-lime)]/30 hover:text-[var(--color-lime)] text-xs font-bold rounded-xl transition-all pointer-events-none"
            >
              Browse Files
            </label>
          </div>
        )}

        {/* Tab 3: Manual Code Search */}
        {activeTab === "manual" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Ticket Number / ID</label>
              <input 
                type="text" 
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="e.g. CE-2027-000145"
                className="w-full px-4 py-3 rounded-xl bg-black border border-border text-white text-sm outline-none focus:border-lime" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2 uppercase">Verification Signature Token</label>
              <input 
                type="text" 
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                placeholder="e.g. 7XK4L92AFR18"
                className="w-full px-4 py-3 rounded-xl bg-black border border-border text-white text-sm outline-none focus:border-lime" 
              />
            </div>
            <button 
              onClick={() => handleVerify(ticketSearch, tokenSearch)}
              disabled={isVerifying || !ticketSearch || !tokenSearch}
              className="btn btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Signature & Fetch</>}
            </button>
          </div>
        )}
      </div>

      {/* Validation Screen Display */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 min-h-[380px] shadow-xl flex flex-col relative overflow-hidden">
        
        {/* Checked-In Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 bg-[#0E0E0E]/95 border border-[var(--color-lime)]/20 rounded-2xl flex flex-col items-center justify-center text-center p-6 z-30 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[var(--color-lime)]/10 border border-[var(--color-lime)]/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[var(--color-lime)] animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Attendance Marked Successfully</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm font-archivo leading-relaxed">
              The database has been updated and a confirmation notification has been sent to the attendee.
            </p>
          </div>
        )}

        {isVerifying && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
            <Loader2 className="w-10 h-10 animate-spin text-lime" />
            <p className="text-sm font-bold text-white mt-4">Verifying digital signature...</p>
            <p className="text-xs text-text-faint mt-1">Checking secure database records.</p>
          </div>
        )}

        {errorMsg && !isVerifying && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-coral/5 border border-coral/10 rounded-2xl animate-fade-in">
            <XCircle className="w-12 h-12 text-coral mb-3" />
            <h3 className="text-lg font-bold text-white">Validation Failed</h3>
            <p className="text-xs text-text-muted mt-2 max-w-sm leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {!scannedDetails && !errorMsg && !isVerifying && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/40 rounded-2xl">
            <QrCode className="w-12 h-12 text-text-faint opacity-50 mb-3" />
            <h3 className="text-base font-bold text-white">Awaiting QR Scan</h3>
            <p className="text-xs text-text-faint mt-1.5 max-w-xs leading-relaxed">
              Use the camera scanner, drag a screenshot, or search manually to inspect attendee details here.
            </p>
          </div>
        )}

        {scannedDetails && !isVerifying && (
          <div className="flex-1 space-y-6 animate-fade-in">
            
            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 pb-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider">Scanned Ticket</span>
                <h3 className="text-xl font-bold text-white font-mono">{scannedDetails.ticket.ticketNumber}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                  scannedDetails.ticket.status === "ACTIVE" 
                    ? "bg-lime/10 border-lime/20 text-lime"
                    : "bg-coral/10 border-coral/20 text-coral"
                )}>
                  Ticket: {scannedDetails.ticket.status}
                </span>
                <RegistrationStatusBadge status={scannedDetails.registration.status} size="sm" />
              </div>
            </div>

            {/* Event Info */}
            <div className="p-4 rounded-xl bg-card-hover border border-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-text-faint tracking-wider block">Target Event</span>
              <h4 className="text-base font-bold text-white">{scannedDetails.event.title}</h4>
              {scannedDetails.registration.teamName && (
                <div className="text-xs text-text-muted">
                  Team Association: <span className="font-semibold text-lime">{scannedDetails.registration.teamName}</span>
                </div>
              )}
            </div>

            {/* Attendee Info */}
            <div className="space-y-4 font-archivo">
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-faint">Participant Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-faint block uppercase mb-0.5">Full Name</span>
                  <span className="text-white font-semibold text-sm">{scannedDetails.student.name}</span>
                </div>
                <div>
                  <span className="text-text-faint block uppercase mb-0.5">Email Address</span>
                  <span className="text-white font-semibold text-sm">{scannedDetails.student.email}</span>
                </div>
                <div>
                  <span className="text-text-faint block uppercase mb-0.5">Phone Number</span>
                  <span className="text-white font-semibold text-sm">{scannedDetails.student.phone}</span>
                </div>
                <div>
                  <span className="text-text-faint block uppercase mb-0.5">College / Institution</span>
                  <span className="text-white font-semibold text-sm">{scannedDetails.student.college}</span>
                </div>
                <div>
                  <span className="text-text-faint block uppercase mb-0.5">Branch / Major</span>
                  <span className="text-white font-semibold text-sm">{scannedDetails.student.branch}</span>
                </div>
                <div>
                  <span className="text-text-faint block uppercase mb-0.5">Academic Year</span>
                  <span className="text-white font-semibold text-sm">{scannedDetails.student.academicYear}</span>
                </div>
              </div>
            </div>

            {/* Check-In Action Section */}
            <div className="border-t border-border/50 pt-5 mt-auto">
              {scannedDetails.registration.checkInStatus === "CHECKED_IN" ? (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <XCircle className="w-5 h-5 text-orange-400" />
                    <span>Already Checked In (Duplicate Prevented)</span>
                  </div>
                  <p className="text-white/60 leading-relaxed font-archivo pl-7">
                    This ticket was checked in on{" "}
                    <span className="text-white font-semibold">
                      {scannedDetails.registration.checkedInAt && 
                        format(new Date(scannedDetails.registration.checkedInAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>{" "}
                    by <span className="text-white font-semibold">{scannedDetails.registration.checkedInByName || "another organizer"}</span>.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={handleApprove}
                    disabled={isPending || scannedDetails.ticket.status !== "ACTIVE"}
                    className="flex-1 py-3 bg-lime text-black hover:bg-lime/90 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-4.5 h-4.5" /> Confirm & Approve Entry
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setScannedDetails(null);
                      toast.error("Participant entry rejected.");
                    }}
                    className="px-4 py-3 bg-card-hover border border-border hover:border-coral/25 hover:text-coral font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

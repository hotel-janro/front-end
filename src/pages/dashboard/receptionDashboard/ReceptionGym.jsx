import React, { useEffect, useState, useRef } from 'react';
import { Dumbbell, Users, QrCode, ShieldAlert, ShieldCheck, Clock, ArrowRight, Play, Camera } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function ReceptionGym() {
  const { settings } = useSettings();
  const [attendance, setAttendance] = useState([]);
  const [qrInput, setQrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success: true/false, message: "..." }
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  
  // Camera simulation state
  const [cameraActive, setCameraActive] = useState(true);

  const inputRef = useRef(null);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/gym/attendance`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load attendance logs');
      }

      setAttendance(result.attendance || []);
      setFetchError('');
    } catch (error) {
      setFetchError(error.message || 'Could not load attendance logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // Keep focus on scan input for hardware laser gun compatibility
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Browser Audio Synthesis for professional beep/buzz sound effects
  const playVerificationSound = (isSuccess) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (isSuccess) {
        // Clear High Beep for Success
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else {
        // Low Sawtooth Buzz for Failure
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(130, audioCtx.currentTime); // C3
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Audio Context blocked or unsupported', e);
    }
  };

  const handleScanSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!qrInput.trim()) return;

    setIsVerifying(true);
    setScanResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/gym/verify-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qrCodeKey: qrInput.trim() })
      });

      const result = await response.json();
      const isSuccess = response.ok && result.success;

      playVerificationSound(isSuccess);

      setScanResult({
        success: isSuccess,
        message: result.message || 'Verification failed.'
      });

      if (isSuccess) {
        // Prepend checkin and reload stats
        setAttendance((prev) => [result.attendance, ...prev]);
      }
      
      // Auto-clear success result after 4 seconds to stand ready for next scan
      if (isSuccess) {
        setTimeout(() => {
          setScanResult(null);
        }, 4000);
      }

      setQrInput('');
      // Refocus input
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } catch (error) {
      playVerificationSound(false);
      setScanResult({
        success: false,
        message: error.message || 'Network connection failed.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const totalAttendeesToday = useMemo(() => {
    const todayStr = new Date().toDateString();
    return attendance.filter((log) => new Date(log.checkInTime).toDateString() === todayStr).length;
  }, [attendance]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-6 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-2 font-semibold">{settings.hotelName}</p>
          <h1 className="text-2xl md:text-3xl text-white font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Gym Entrance Gate
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Webcam Scan Station & Attendance Logger
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-white self-start sm:self-center">
          <Users className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Visited Today</div>
            <div className="text-sm font-bold text-white">{totalAttendeesToday} guests</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SCANNER CONSOLE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Scanner view */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-video group">
            
            {/* Ambient scanner light effect */}
            {cameraActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-pulse pointer-events-none" />
            )}

            {/* Top camera status HUD */}
            <div className="flex justify-between items-center z-10">
              <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                {cameraActive ? 'CAMERA_ACTIVE' : 'CAMERA_STANDBY'}
              </span>
              <button 
                onClick={() => setCameraActive(!cameraActive)}
                className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-slate-300 transition-colors"
                title="Toggle Viewfinder"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner target HUD box */}
            <div className="flex flex-col items-center justify-center py-6 flex-grow z-10">
              {cameraActive ? (
                <div className="w-44 h-44 border-2 border-dashed border-[#D4AF37] rounded-3xl flex items-center justify-center relative animate-pulse">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br" />
                  
                  {/* Laser Line */}
                  <div className="w-full h-0.5 bg-[#D4AF37]/80 absolute top-1/2 left-0 shadow-lg shadow-[#D4AF37]/50" style={{ transform: 'translateY(-50%)' }} />
                  
                  <QrCode className="w-16 h-16 text-[#D4AF37]/45" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 py-10">
                  <Play className="w-10 h-10 text-slate-600" />
                  <p className="text-xs font-semibold">Camera is in Standby Mode</p>
                </div>
              )}
            </div>

            {/* Bottom HUD message */}
            <div className="text-center z-10">
              <p className="text-xs font-semibold text-slate-400">Position QR Code in scanner box for automatic entry check-in</p>
            </div>
          </div>

          {/* Manual / Laser Scan Form */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Laser Scanner / Manual Code Entry</h3>
            
            <form onSubmit={handleScanSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute top-1/2 left-3 w-5 h-5 text-slate-400 -translate-y-1/2" />
                <input 
                  type="text" 
                  ref={inputRef}
                  placeholder="Scan pass Barcode/QR or enter Key..." 
                  value={qrInput} 
                  onChange={(e) => setQrInput(e.target.value)} 
                  disabled={isVerifying}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none transition-all text-sm font-semibold tracking-wider text-slate-800" 
                />
              </div>
              <button 
                type="submit" 
                disabled={isVerifying}
                className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1 shadow-md"
              >
                Verify <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Validation Result Popup Display */}
          {scanResult && (
            <div className={`p-6 rounded-2xl border transition-all animate-bounce ${
              scanResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-lg shadow-emerald-500/10' 
                : 'bg-red-50 border-red-200 text-red-800 shadow-lg shadow-red-500/10'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  scanResult.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {scanResult.success ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider">{scanResult.success ? 'Access Granted' : 'Access Denied'}</h3>
                  <p className="text-sm font-semibold mt-1 text-slate-700">{scanResult.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ATTENDANCE RECENT LOG (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden min-h-[480px]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                Recent Check-Ins Today
              </h3>
              <span className="text-[10px] bg-slate-200/80 px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-wider">Live Log</span>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {attendance.map((log) => (
                <div key={log._id} className="p-4 hover:bg-slate-50/30 transition-colors flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{log.guestName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">{log.passType}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-600 block">{log.roomNumber ? `Room ${log.roomNumber}` : 'Walk-in'}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading activity...</div>
              )}
              {!isLoading && attendance.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">No check-ins registered today.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Camera,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Dumbbell,
  Edit,
  Plus,
  Play,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext.jsx';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const defaultPassForm = {
  passType: 'Day Pass',
  guestName: '',
  guestPhone: '',
  guestEmail: '',
  roomNumber: '',
  paymentStatus: 'Paid',
  validDays: '1',
  status: 'Active'
};

const defaultMemberForm = {
  name: '',
  phone: '',
  email: '',
  nic: '',
  gender: 'Male',
  dob: '',
  address: '',
  emergencyName: '',
  emergencyPhone: '',
  medicalNotes: '',
  status: 'Active'
};

export function ReceptionGym() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('gate');

  const [attendance, setAttendance] = useState([]);
  const [qrInput, setQrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  const [attendanceFetchError, setAttendanceFetchError] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState('');

  const [passes, setPasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState(defaultPassForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [editId, setEditId] = useState(null);
  const [newPass, setNewPass] = useState(null);

  const [members, setMembers] = useState([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [membersFetchError, setMembersFetchError] = useState('');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const scannerStateRef = useRef('idle'); // Initialize scanner state
  const [memberFormData, setMemberFormData] = useState(defaultMemberForm);
  const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);
  const [memberSubmitError, setMemberSubmitError] = useState('');
  const [editMemberId, setEditMemberId] = useState(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [regStep, setRegStep] = useState(1);
  const [isMemberQrModalOpen, setIsMemberQrModalOpen] = useState(false);
  const [newMember, setNewMember] = useState(null);

  const scanInputRef = useRef(null);
  const scannerRef = useRef(null);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/gym/attendance`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load attendance logs');
      }

      setAttendance(result.attendance || []);
      setAttendanceFetchError('');
    } catch (error) {
      setAttendanceFetchError(error.message || 'Could not load attendance logs');
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const fetchPasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/gym/passes`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load gym passes');
      }

      setPasses(result.passes || []);
      setFetchError('');
    } catch (error) {
      setFetchError(error.message || 'Could not load gym passes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/gym/members`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load gym members');
      }

      setMembers(result.members || []);
      setMembersFetchError('');
    } catch (error) {
      setMembersFetchError(error.message || 'Could not load gym members');
    } finally {
      setIsMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchPasses();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (activeTab === 'gate' && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [activeTab]);

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
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(130, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.35);
      }
    } catch (error) {
      console.warn('Audio Context blocked or unsupported', error);
    }
  };

  const verifyScannedCode = async (code) => {
    if (!code || !code.trim()) return;
    setIsVerifying(true);
    setScanResult(null);
    try {
      const response = await fetch(`${API_BASE}/api/gym/verify-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeKey: code.trim() })
      });
      const result = await response.json();
      const isSuccess = response.ok && result.success;
      playVerificationSound(isSuccess);
      setScanResult({ success: isSuccess, message: result.message || 'Verification failed.' });
      if (isSuccess && result.attendance) {
        setAttendance((prev) => {
          const exists = prev.some((log) => log._id === result.attendance._id);
          if (exists) {
            return prev.map((log) => log._id === result.attendance._id ? result.attendance : log);
          } else {
            return [result.attendance, ...prev];
          }
        });
        setTimeout(() => setScanResult(null), 5000);
      }
    } catch (error) {
      playVerificationSound(false);
      setScanResult({ success: false, message: error.message || 'Network connection failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScanSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!qrInput.trim()) return;
    await verifyScannedCode(qrInput);
    setQrInput('');
    setTimeout(() => { if (scanInputRef.current) scanInputRef.current.focus(); }, 50);
  };

  // Handle Gate Camera Scanner
  useEffect(() => {
    let isMounted = true;

    if (activeTab === 'gate' && cameraActive) {
      const startScanner = async () => {
        // If we are already starting or scanning, do not start again
        if (scannerStateRef.current === 'starting' || scannerStateRef.current === 'scanning') {
          return;
        }

        setCameraError('');

        try {
          const container = document.getElementById("gym-scanner-viewport");
          if (!container) return;

          scannerStateRef.current = 'starting';
          const html5QrCode = new Html5Qrcode("gym-scanner-viewport");
          scannerRef.current = html5QrCode;

          let lastScannedCode = "";
          let lastScanTime = 0;

          const onScanSuccess = (qrCodeMessage) => {
            const now = Date.now();
            if (qrCodeMessage === lastScannedCode && (now - lastScanTime) < 5000) {
              return; // ignore duplicates for 5 seconds
            }
            if (qrCodeMessage) {
              lastScannedCode = qrCodeMessage;
              lastScanTime = now;
              setQrInput(qrCodeMessage);
              verifyScannedCode(qrCodeMessage);
            }
          };

          const config = { fps: 20 };

          // Try to get available cameras to select rear/back camera
          let cameraId = null;
          try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              const backCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('environment') ||
                device.label.toLowerCase().includes('rear')
              );
              cameraId = backCamera ? backCamera.id : devices[0].id;
            }
          } catch (devicesError) {
            console.warn("Failed to get cameras, attempting fallback configuration...", devicesError);
          }

          if (isMounted) {
            if (cameraId) {
              await html5QrCode.start(cameraId, config, onScanSuccess, () => {});
            } else {
              // Fallback to default facingMode if getCameras failed or returned empty
              try {
                await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
              } catch (envError) {
                console.log("Environment camera failing, attempting user camera...", envError);
                if (isMounted) {
                  await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess, () => {});
                }
              }
            }

            if (isMounted) {
              scannerStateRef.current = 'scanning';
            } else {
              // Component was unmounted or state changed while starting
              scannerStateRef.current = 'stopping';
              if (html5QrCode.isScanning) {
                await html5QrCode.stop();
              }
              scannerStateRef.current = 'idle';
              scannerRef.current = null;
            }
          }
        } catch (err) {
          scannerStateRef.current = 'idle';
          scannerRef.current = null;
          console.error("Failed to start gym scanner camera:", err);

          let errMsg = err.message || String(err);
          if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            errMsg = "Camera access requires HTTPS or localhost (Secure Context). Please access the system via http://localhost:5174/ or configure HTTPS.";
          } else if (errMsg.includes("NotAllowedError") || errMsg.includes("Permission denied")) {
            errMsg = "Camera access was denied. Please grant camera permission in your browser's site settings.";
          } else if (errMsg.includes("NotFoundError") || errMsg.includes("Requested device not found")) {
            errMsg = "No camera hardware detected. Ensure a working camera is connected.";
          } else if (errMsg.includes("NotReadableError") || errMsg.includes("Could not start video source")) {
            errMsg = "Camera is already in use by another tab or application.";
          }
          setCameraError(errMsg);
        }
      };

      const timer = setTimeout(startScanner, 250);

      return () => {
        isMounted = false;
        clearTimeout(timer);

        const stopScanner = async () => {
          const html5QrCode = scannerRef.current;
          if (html5QrCode) {
            scannerStateRef.current = 'stopping';
            try {
              if (html5QrCode.isScanning) {
                await html5QrCode.stop();
              }
            } catch (err) {
              console.error("Failed to stop scanner in cleanup:", err);
            } finally {
              scannerStateRef.current = 'idle';
              scannerRef.current = null;
            }
          }
        };
        stopScanner();
      };
    } else {
      setCameraError('');
      const stopScanner = async () => {
        const html5QrCode = scannerRef.current;
        if (html5QrCode) {
          scannerStateRef.current = 'stopping';
          try {
            if (html5QrCode.isScanning) {
              await html5QrCode.stop();
            }
          } catch (err) {
            console.error("Failed to stop scanner:", err);
          } finally {
            scannerStateRef.current = 'idle';
            scannerRef.current = null;
          }
        }
      };
      stopScanner();
    }
  }, [activeTab, cameraActive]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => {
      const updated = { ...previous, [name]: value };
      if (name === 'passType') {
        updated.validDays = value === 'Day Pass' ? '1' : '30';
      }
      return updated;
    });
  };

  const handleMemberSelectChange = (event) => {
    const selectedId = event.target.value;
    if (!selectedId) return;

    const selectedMember = members.find((member) => member._id === selectedId);
    if (selectedMember) {
      setFormData((previous) => ({
        ...previous,
        guestName: selectedMember.name,
        guestPhone: selectedMember.phone,
        guestEmail: selectedMember.email || ''
      }));
    }
  };

  const handleSubmitPass = async (event) => {
    event.preventDefault();
    setSubmitError('');

    // Validate email and phone
    if (!formData.guestPhone || !formData.guestEmail) {
      setSubmitError('Phone number and Email are required.');
      return;
    }

    const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!phoneRegex.test(formData.guestPhone)) {
      setSubmitError('Please enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.guestEmail)) {
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEdit = !!editId;
      const url = isEdit ? `${API_BASE}/api/gym/pass/${editId}` : `${API_BASE}/api/gym/pass`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          validDays: Number(formData.validDays)
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'issue'} gym pass`);
      }

      if (isEdit) {
        setPasses((prev) => prev.map((pass) => (pass._id === editId ? result.pass : pass)));
      } else {
        setPasses((prev) => [result.pass, ...prev]);
        setNewPass(result.pass);
        setIsQrModalOpen(true);
      }

      setIsModalOpen(false);
      setEditId(null);
      setFormData(defaultPassForm);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit gym pass');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (pass) => {
    setEditId(pass._id);
    setFormData({
      passType: pass.passType,
      guestName: pass.guestName,
      guestPhone: pass.guestPhone,
      guestEmail: pass.guestEmail || '',
      roomNumber: pass.roomNumber || '',
      paymentStatus: pass.paymentStatus,
      validDays: '0',
      status: pass.status
    });
    setSubmitError('');
    setActiveTab('passes');
    setIsModalOpen(true);
  };

  const handleDeletePass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gym pass?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/gym/pass/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete pass');
      }

      setPasses((previous) => previous.filter((pass) => pass._id !== id));
    } catch (error) {
      alert(error.message || 'Failed to delete pass');
    }
  };

  const handleMemberFormChange = (event) => {
    const { name, value } = event.target;
    setMemberFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleMemberSubmit = async (event) => {
    event.preventDefault();
    setMemberSubmitError('');

    // Step 3 Validation: Emergency Name and Emergency Phone are required
    if (!memberFormData.emergencyName || !memberFormData.emergencyPhone) {
      setMemberSubmitError('Emergency Contact Name and Phone are required to complete registration!');
      return;
    }

    setIsMemberSubmitting(true);

    try {
      const isEdit = !!editMemberId;
      const url = isEdit ? `${API_BASE}/api/gym/member/${editMemberId}` : `${API_BASE}/api/gym/member`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberFormData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'register'} member`);
      }

      if (isEdit) {
        setMembers((prev) => prev.map((member) => (member._id === editMemberId ? result.member : member)));
        alert('Gym member updated successfully!');
      } else {
        setMembers((prev) => [result.member, ...prev]);
        alert('Gym member registered successfully!');
      }

      setIsMemberModalOpen(false);
      setEditMemberId(null);
      setMemberFormData(defaultMemberForm);
      setRegStep(1);
    } catch (error) {
      setMemberSubmitError(error.message || 'Failed to register gym member');
    } finally {
      setIsMemberSubmitting(false);
    }
  };

  const handleEditMemberClick = (member) => {
    setEditMemberId(member._id);
    setMemberFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      nic: member.nic || '',
      gender: member.gender || 'Male',
      dob: member.dob || '',
      address: member.address || '',
      emergencyName: member.emergencyName || '',
      emergencyPhone: member.emergencyPhone || '',
      medicalNotes: member.medicalNotes || '',
      status: member.status
    });
    setRegStep(1);
    setMemberSubmitError('');
    setActiveTab('members');
    setIsMemberModalOpen(true);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gym member? This will remove their record from the registry.')) return;

    try {
      const response = await fetch(`${API_BASE}/api/gym/member/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete member');
      }

      setMembers((previous) => previous.filter((member) => member._id !== id));
    } catch (error) {
      alert(error.message || 'Failed to delete member');
    }
  };

  const filteredPasses = useMemo(() => {
    return passes.filter((pass) => {
      const matchesSearch =
        pass.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pass.roomNumber && pass.roomNumber.includes(searchTerm)) ||
        pass.passId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || pass.passType === filterType;
      return matchesSearch && matchesType;
    });
  }, [passes, searchTerm, filterType]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.phone.includes(memberSearchTerm) ||
        member.memberId.toLowerCase().includes(memberSearchTerm.toLowerCase())
      );
    });
  }, [members, memberSearchTerm]);

  const totalRevenue = useMemo(() => {
    return passes.reduce((sum, pass) => {
      if (pass.paymentStatus === 'Paid') {
        return sum + (pass.passType === 'Day Pass' ? 1000 : 8000);
      }
      return sum;
    }, 0);
  }, [passes]);

  const activeMembersCount = useMemo(() => members.filter((member) => member.status === 'Active').length, [members]);

  const activeDayPassCount = useMemo(
    () => passes.filter((pass) => pass.status === 'Active' && pass.passType === 'Day Pass').length,
    [passes]
  );

  const todaysAttendanceCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return attendance.filter((log) => new Date(log.checkInTime).toDateString() === todayStr).length;
  }, [attendance]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-6 md:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xl">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-2 font-semibold">{settings.hotelName}</p>
          <h1 className="text-2xl md:text-3xl text-white font-bold" style={{ fontFamily: 'DM Serif Display, serif' }}>
            Gym Control Center
          </h1>
          <p className="text-slate-300 text-sm mt-1">Reception scanner plus pass and member management in one view.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl font-medium transition-all whitespace-nowrap"
            onClick={() => {
              setActiveTab('members');
              setEditMemberId(null);
              setMemberFormData(defaultMemberForm);
              setRegStep(1);
              setMemberSubmitError('');
              setIsMemberModalOpen(true);
            }}
            type="button"
          >
            <UserPlus className="w-5 h-5 text-[#D4AF37]" />
            Register Member
          </button>

          <button
            className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-slate-900 rounded-xl font-bold transition-all shadow-lg shadow-[#D4AF37]/20 whitespace-nowrap"
            onClick={() => {
              setActiveTab('passes');
              setEditId(null);
              setFormData(defaultPassForm);
              setSubmitError('');
              setIsModalOpen(true);
            }}
            type="button"
          >
            <Plus className="w-5 h-5" />
            Issue Pass
          </button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('gate')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'gate' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          type="button"
        >
          <QrCode className="w-5 h-5" />
          Entrance Gate
          {todaysAttendanceCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{todaysAttendanceCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('passes')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'passes' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          type="button"
        >
          <Dumbbell className="w-5 h-5" />
          Passes & Bookings ({passes.length})
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'members' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          type="button"
        >
          <Users className="w-5 h-5" />
          Gym Members Registry ({members.length})
        </button>
      </div>

      {activeTab === 'gate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Visited Today</p>
                <h3 className="text-2xl font-bold text-slate-800">{todaysAttendanceCount}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Check-ins</p>
                <h3 className="text-2xl font-bold text-slate-800">{attendance.length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Passes</p>
                <h3 className="text-2xl font-bold text-slate-800">{passes.filter((pass) => pass.status === 'Active').length}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-6">
              {scanResult && (
                <div
                  className={`p-6 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-4 duration-350 ${
                    scanResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-lg shadow-emerald-500/10'
                      : 'bg-red-50 border-red-200 text-red-800 shadow-lg shadow-red-500/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        scanResult.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {scanResult.success ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-base font-bold uppercase tracking-wider">{scanResult.success ? 'Access Granted' : 'Access Denied'}</h3>
                      <p className="text-sm font-semibold mt-1 text-slate-700">{scanResult.message}</p>
                    </div>
                    <button
                      onClick={() => setScanResult(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {attendanceFetchError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-350">
                  <span>{attendanceFetchError}</span>
                  <button
                    onClick={() => setAttendanceFetchError(null)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-video group" style={{ minHeight: '320px' }}>
                <style>{`
                  #gym-scanner-viewport video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 1.5rem !important;
                  }
                `}</style>
                <div id="gym-scanner-viewport" className="absolute inset-0 w-full h-full bg-slate-950" style={{ opacity: cameraActive ? 1 : 0 }} />
                {cameraActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-pulse pointer-events-none z-10" />
                )}
                <div className="flex justify-between items-center z-10">
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                    <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                    {cameraActive ? 'CAMERA ACTIVE' : 'CAMERA STANDBY'}
                  </span>
                  <button
                    onClick={() => setCameraActive(!cameraActive)}
                    className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-slate-300 transition-colors z-10"
                    title="Toggle Viewfinder"
                    type="button"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-6 flex-grow z-10">
                  {cameraActive ? (
                    cameraError ? (
                      <div className="flex flex-col items-center gap-2 text-center px-6 py-4 bg-red-950/85 border border-red-500/50 rounded-2xl max-w-xs shadow-lg shadow-red-950/50">
                        <ShieldAlert className="w-10 h-10 text-red-400 font-bold animate-bounce" />
                        <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider">Scanner Error</h4>
                        <p className="text-[10px] font-semibold text-red-300/90 leading-relaxed">{cameraError}</p>
                      </div>
                    ) : (
                      <div className="w-44 h-44 border-2 border-dashed border-[#D4AF37] rounded-3xl flex items-center justify-center relative animate-pulse">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br" />
                        <div className="w-full h-0.5 bg-[#D4AF37]/80 absolute top-1/2 left-0 shadow-lg shadow-[#D4AF37]/50" style={{ transform: 'translateY(-50%)' }} />
                        <QrCode className="w-16 h-16 text-[#D4AF37]/45" />
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 py-10">
                      <Play className="w-10 h-10 text-slate-600" />
                      <p className="text-xs font-semibold">Camera is in Standby Mode</p>
                    </div>
                  )}
                </div>
                <div className="text-center z-10 bg-black/40 backdrop-blur-sm py-2 rounded-xl">
                  <p className="text-xs font-semibold text-slate-200">Position QR Code in scanner box for automatic entry check-in</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Laser Scanner / Manual Code Entry</h3>

                <form onSubmit={handleScanSubmit} className="flex gap-3">
                  <div className="relative flex-1">
                    <QrCode className="absolute top-1/2 left-3 w-5 h-5 text-slate-400 -translate-y-1/2" />
                    <input
                      type="text"
                      ref={scanInputRef}
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
                    {isVerifying ? 'Checking...' : <><span>Verify</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>
            </div>

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
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          In: {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {log.checkOutTime && ` | Out: ${new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isAttendanceLoading && <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading activity...</div>}
                  {!isAttendanceLoading && attendance.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-xs font-medium">No check-ins registered today.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'passes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-[#D4AF37] rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Gym Passes Issued</p>
                <h3 className="text-2xl font-bold text-slate-800">{passes.length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Registered Members</p>
                <h3 className="text-2xl font-bold text-slate-800">{members.length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Day Passes</p>
                <h3 className="text-2xl font-bold text-slate-800">{activeDayPassCount}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Est. Gym Revenue</p>
                <h3 className="text-2xl font-bold text-slate-800">{settings.currency.symbol}{totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {fetchError && <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{fetchError}</div>}

            <div className="border-b border-slate-100 p-6 flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 w-5 h-5 text-slate-400 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by guest name, pass ID, or room number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none transition-all text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-600"
              >
                <option value="All">All Pass Types</option>
                <option value="Day Pass">Day Passes Only</option>
                <option value="Monthly Member">Monthly Members Only</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50/70 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Guest Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Room No.</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Validity Expiry</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">QR Code</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPasses.map((pass) => (
                    <tr key={pass._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{pass.passId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{pass.guestName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{pass.guestPhone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${pass.passType === 'Day Pass' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {pass.passType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">{pass.roomNumber || 'Walk-in'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">{new Date(pass.validDate).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${pass.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {pass.status === 'Active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {pass.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setNewPass(pass);
                            setIsQrModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 mx-auto"
                          type="button"
                        >
                          <Download className="w-3 h-3" /> Show QR
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex justify-end gap-1.5">
                        <button onClick={() => handleEditClick(pass)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Pass" type="button">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeletePass(pass._id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete Pass" type="button">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isLoading && <div className="py-12 text-center text-slate-500 font-medium">Loading passes...</div>}
              {!isLoading && filteredPasses.length === 0 && <div className="py-12 text-center text-slate-400 font-medium">No gym passes found.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Registered Gym Users</p>
                <h3 className="text-2xl font-bold text-slate-800">{members.length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Gym Members</p>
                <h3 className="text-2xl font-bold text-slate-800">{activeMembersCount}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Members Added This Month</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {members.filter((member) => new Date(member.joinedDate).getMonth() === new Date().getMonth()).length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {membersFetchError && <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">{membersFetchError}</div>}

            <div className="border-b border-slate-100 p-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 w-5 h-5 text-slate-400 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search members by name, phone, or Member ID..."
                  value={memberSearchTerm}
                  onChange={(e) => setMemberSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50/70 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NIC / Passport</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emergency Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reg. Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{member.memberId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                        <div>{member.name}</div>
                        <span className="text-[10px] uppercase font-bold text-[#D4AF37]">{member.gender || 'Male'} • DOB: {member.dob || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">{member.nic || 'Walk-in'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-semibold text-slate-800">{member.phone}</div>
                        <div className="text-xs text-slate-400">{member.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {member.emergencyName ? (
                          <>
                            <div className="font-semibold text-slate-800">{member.emergencyName}</div>
                            <div className="text-xs text-slate-400">{member.emergencyPhone}</div>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">{new Date(member.joinedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {member.status === 'Active' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex justify-end gap-1.5">
                        <button onClick={() => handleEditMemberClick(member)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Profile" type="button">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteMember(member._id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete Member" type="button">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isMembersLoading && <div className="py-12 text-center text-slate-500 font-medium">Loading registered users...</div>}
              {!isMembersLoading && filteredMembers.length === 0 && <div className="py-12 text-center text-slate-400 font-medium">No registered gym users found.</div>}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl my-4 border border-white/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-2xl" style={{ fontFamily: 'DM Serif Display, serif' }}>{editId ? 'Edit Gym Pass' : 'Issue Gym Pass'}</h2>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest mt-1">{editId ? 'Modify Details' : 'Gym Management'}</p>
              </div>
              <button type="button" className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (formData.passType === 'Monthly Member' && !formData.guestName) {
                  setSubmitError('A registered gym member is required to issue a Monthly Membership pass!');
                  return;
                }
                handleSubmitPass(e);
              }}
              className="p-8 overflow-y-auto space-y-5"
            >
              {submitError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">{submitError}</div>}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 ml-1">Pass / Membership Type</label>
                <select
                  name="passType"
                  value={formData.passType}
                  onChange={(e) => {
                    handleFormChange(e);
                    setFormData((previous) => ({
                      ...previous,
                      passType: e.target.value,
                      guestName: '',
                      guestPhone: '',
                      guestEmail: '',
                      validDays: e.target.value === 'Day Pass' ? '1' : '30'
                    }));
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800"
                >
                  <option value="Day Pass">One-Day Gym Pass (Rs. 1,000) [Anonymous]</option>
                  <option value="Monthly Member">Monthly Membership (Rs. 8,000) [Enforced Registry]</option>
                </select>
              </div>

              {!editId && formData.passType === 'Monthly Member' && (
                <div className="flex flex-col gap-1.5 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                  <label className="text-xs font-bold text-slate-700 ml-1">Select Registered Active Member <span className="text-red-500">*</span></label>
                  <select onChange={handleMemberSelectChange} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800">
                    <option value="">-- Choose active member from registry --</option>
                    {members.filter((member) => member.status === 'Active').map((member) => (
                      <option key={member._id} value={member._id}>{member.name} ({member.phone})</option>
                    ))}
                  </select>

                  {formData.guestName && (
                    <div className="mt-3 p-3 bg-white border border-slate-100 rounded-xl text-xs space-y-1">
                      <div>👤 <span className="font-bold text-slate-700">Selected:</span> {formData.guestName}</div>
                      <div>📞 <span className="font-bold text-slate-700">Phone:</span> {formData.guestPhone}</div>
                      {formData.guestEmail && <div>✉️ <span className="font-bold text-slate-700">Email:</span> {formData.guestEmail}</div>}
                      <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Details fetched securely from members database.</div>
                    </div>
                  )}
                </div>
              )}

              {formData.passType === 'Day Pass' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Guest Full Name</label>
                    <input type="text" name="guestName" value={formData.guestName} onChange={handleFormChange} required placeholder="Enter guest's full name (no registration required)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Contact Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleFormChange} required placeholder="e.g. +94771234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Contact Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="guestEmail" value={formData.guestEmail} onChange={handleFormChange} required placeholder="e.g. guest@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>
                </>
              ) : (
                editId && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                    <div className="font-semibold text-slate-800">Member: {formData.guestName}</div>
                    <div className="text-xs text-slate-500 mt-1">Phone: {formData.guestPhone}</div>
                    {formData.guestEmail && <div className="text-xs text-slate-500 mt-1">Email: {formData.guestEmail}</div>}
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Room Number (Optional)</label>
                  <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleFormChange} placeholder="e.g. 102" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1">{editId ? 'Extend Validity (Days)' : 'Validity (Days)'}</label>
                  <input type="number" name="validDays" value={formData.validDays} onChange={handleFormChange} min="0" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600 ml-1">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleFormChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800">
                  <option value="Paid">Paid / Confirmed</option>
                  <option value="Unpaid">Unpaid / Booked</option>
                </select>
              </div>

              {editId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1">Activation Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800">
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[#D4AF37] hover:bg-[#b8962d] text-slate-900 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 shadow-md shadow-[#D4AF37]/20">
                  {isSubmitting ? 'Submitting...' : editId ? 'Save Changes' : 'Issue Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-4 border border-white/20 flex flex-col max-h-[95vh] overflow-hidden">
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-2xl" style={{ fontFamily: 'DM Serif Display, serif' }}>{editMemberId ? 'Edit Gym Member' : 'Register Gym Member'}</h2>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest mt-1">{editMemberId ? 'Modify Member Profile' : 'Gym Registry'}</p>
              </div>
              <button type="button" className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white" onClick={() => setIsMemberModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 pt-6 pb-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${regStep === step ? 'bg-[#0F172A] text-[#D4AF37] ring-4 ring-[#D4AF37]/20 shadow-md' : regStep > step ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                      {regStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className={`text-xs font-bold ${regStep === step ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step === 1 ? 'Contact Info' : step === 2 ? 'Identity & Address' : 'Health & Emergency'}
                    </span>
                  </div>
                  {step < 3 && <div className={`flex-1 h-[2px] mx-4 transition-all duration-300 ${regStep > step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (regStep === 3) {
                  handleMemberSubmit(e);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              className="p-8 overflow-y-auto space-y-5 flex-1"
            >
              {memberSubmitError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">{memberSubmitError}</div>}

              {regStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl mb-2">
                    <h3 className="text-sm font-bold text-slate-800">Step 1: Contact details</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Please provide the member's full name and mobile phone numbers to create their communication logs.</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Member Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={memberFormData.name} onChange={handleMemberFormChange} required placeholder="Enter full name" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={memberFormData.phone} onChange={handleMemberFormChange} required placeholder="e.g. +94771234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={memberFormData.email} onChange={handleMemberFormChange} placeholder="e.g. member@email.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl mb-2">
                    <h3 className="text-sm font-bold text-slate-800">Step 2: Identity & Demographics</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Collect the member's legal identity documentation, gender, and age records.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 ml-1">NIC / Passport Number <span className="text-red-500">*</span></label>
                      <input type="text" name="nic" value={memberFormData.nic} onChange={handleMemberFormChange} placeholder="e.g. 199512345678 or N123456" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Gender</label>
                      <select name="gender" value={memberFormData.gender} onChange={handleMemberFormChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" name="dob" value={memberFormData.dob} onChange={handleMemberFormChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800 text-slate-500" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Home Address</label>
                    <input type="text" name="address" value={memberFormData.address} onChange={handleMemberFormChange} placeholder="Enter residential address" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl mb-2">
                    <h3 className="text-sm font-bold text-slate-800">Step 3: Health Remarks & Emergency</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Define emergency notification contacts and safety medical limitations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-amber-950 ml-1">Emergency Contact Name</label>
                      <input type="text" name="emergencyName" value={memberFormData.emergencyName} onChange={handleMemberFormChange} placeholder="Person name" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-amber-950 ml-1">Emergency Phone</label>
                      <input type="tel" name="emergencyPhone" value={memberFormData.emergencyPhone} onChange={handleMemberFormChange} placeholder="Contact number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Medical/Health Notes</label>
                    <input type="text" name="medicalNotes" value={memberFormData.medicalNotes} onChange={handleMemberFormChange} placeholder="e.g. cardiac conditions, allergies, bone issues..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Membership Status</label>
                    <select name="status" value={memberFormData.status} onChange={handleMemberFormChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] outline-none text-sm text-slate-800">
                      <option value="Active">Active / Registered</option>
                      <option value="Inactive">Inactive / Suspended</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
                <div>
                  {regStep > 1 && (
                    <button type="button" onClick={() => setRegStep((prev) => prev - 1)} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                      Back
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors">
                    Cancel
                  </button>

                  {regStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (regStep === 1) {
                          if (!memberFormData.name || !memberFormData.phone || !memberFormData.email) {
                            setMemberSubmitError('Name, Phone number, and Email address are required!');
                            return;
                          }
                          const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
                          if (!phoneRegex.test(memberFormData.phone)) {
                            setMemberSubmitError('Please enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567).');
                            return;
                          }
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!emailRegex.test(memberFormData.email)) {
                            setMemberSubmitError('Please enter a valid email address.');
                            return;
                          }
                        }

                        if (regStep === 2) {
                          if (!memberFormData.nic || !memberFormData.dob) {
                            setMemberSubmitError('NIC/Passport number and Date of Birth are required!');
                            return;
                          }
                          const nicOrPassport = memberFormData.nic.trim();
                          const nicRegex = /^(?:\d{9}[vVxX]|\d{12})$/;
                          const passportRegex = /^[A-Za-z0-9]{7,12}$/;
                          if (!nicRegex.test(nicOrPassport) && !passportRegex.test(nicOrPassport)) {
                            setMemberSubmitError('Please enter a valid NIC (e.g. 9 digits + V/X or 12 digits) or a valid Passport number (7-12 alphanumeric characters).');
                            return;
                          }
                          const birthDate = new Date(memberFormData.dob);
                          if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
                            setMemberSubmitError('Date of Birth cannot be in the future.');
                            return;
                          }
                        }

                        setMemberSubmitError('');
                        setRegStep((prev) => prev + 1);
                      }}
                      className="px-8 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button type="submit" disabled={isMemberSubmitting} className="px-8 py-2.5 bg-[#D4AF37] hover:bg-[#b8962d] text-slate-900 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 shadow-md shadow-[#D4AF37]/20">
                      {isMemberSubmitting ? 'Registering...' : editMemberId ? 'Save Changes' : 'Complete Registration'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQrModalOpen && newPass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md my-4 border border-white/20 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="bg-[#0F172A] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[#D4AF37]/20 rounded-l-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-xl" style={{ fontFamily: 'DM Serif Display, serif' }}>Pass QR Generated</h2>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest mt-1">Ready for Entrance Scan</p>
              </div>
              <button type="button" className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white" onClick={() => setIsQrModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-inner flex justify-center items-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${newPass.qrCodeKey}`} alt="Guest Gym Pass QR Code" className="w-48 h-48 block" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{newPass.guestName}</h3>
                <p className="text-xs text-[#D4AF37] font-semibold tracking-wider uppercase mt-1">{newPass.passType}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Pass ID: {newPass.passId}</p>
              </div>

              <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs text-slate-600 space-y-1.5 font-medium">
                <div>🔑 <span className="font-bold text-slate-700">QR Key:</span> <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10px]">{newPass.qrCodeKey}</code></div>
                <div>📞 <span className="font-bold text-slate-700">Phone:</span> {newPass.guestPhone}</div>
                <div>🚪 <span className="font-bold text-slate-700">Room:</span> {newPass.roomNumber || 'Walk-in'}</div>
                <div>📅 <span className="font-bold text-slate-700">Expires:</span> {new Date(newPass.validDate).toLocaleString()}</div>
              </div>

              <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors shadow-lg" type="button">
                <Download className="w-4 h-4" /> Print / Save Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
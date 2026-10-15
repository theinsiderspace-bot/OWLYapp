import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLms } from '../context/LmsContext';
import { 
  Dna, 
  Sparkles, 
  Search, 
  MapPin, 
  Mic, 
  MicOff, 
  Play, 
  Gamepad2, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  Activity, 
  Atom, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Cpu,
  Lock,
  ShieldAlert,
  LogIn,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  ArrowLeft,
  UserCheck
} from 'lucide-react';

interface BioscienceResearchHubProps {
  onLaunchGame: () => void;
  onOpenAuth?: (mode: 'signin' | 'student_signup' | 'teacher_signup') => void;
  onBackToCatalog?: () => void;
}

interface ProteinPreset {
  id: string;
  name: string;
  pdbId: string;
  uniprotId: string;
  organism: string;
  category: string;
  description: string;
  activeSite: string;
  helicesCount: number;
}

const PROTEIN_PRESETS: ProteinPreset[] = [
  {
    id: 'crispr-cas9',
    name: 'CRISPR-Cas9 Endonuclease',
    pdbId: '4OO8',
    uniprotId: 'Q99ZW2',
    organism: 'Streptococcus pyogenes',
    category: 'Genome Editing Engine',
    description: 'RNA-guided DNA endonuclease producing double-stranded breaks at target sites complementary to the 20-nucleotide crRNA guide.',
    activeSite: 'Catalytic HNH and RuvC nuclease domains coordinating Mg²⁺ ions',
    helicesCount: 8
  },
  {
    id: 'p53-tumor-suppressor',
    name: 'p53 Tumor Suppressor Core',
    pdbId: '1TUP',
    uniprotId: 'P04637',
    organism: 'Homo sapiens',
    category: 'Oncology / DNA Repair',
    description: 'Guardian of the Genome regulating cell cycle arrest, DNA repair, and apoptosis in response to cellular genomic stress.',
    activeSite: 'Zinc-coordinating DNA-binding loop-sheet-helix motif (residues 96-292)',
    helicesCount: 5
  },
  {
    id: 'sars-cov-2-spike',
    name: 'SARS-CoV-2 Prefusion Spike',
    pdbId: '6VXX',
    uniprotId: 'P0DTC2',
    organism: 'Coronaviridae',
    category: 'Virology / Vaccine Antigen',
    description: 'Trimeric viral glycoprotein mediating attachment to host ACE2 receptors and subsequent membrane fusion.',
    activeSite: 'Receptor Binding Domain (RBD) undergoing hinge up/down conformational switching',
    helicesCount: 9
  },
  {
    id: 'hemoglobin',
    name: 'Human Hemoglobin (Oxy)',
    pdbId: '1A3N',
    uniprotId: 'P69905',
    organism: 'Homo sapiens',
    category: 'Respiratory Transport',
    description: 'Heterotetrameric iron-containing oxygen transport metalloprotein displaying cooperative sigmoidal binding kinetics.',
    activeSite: 'Protoporphyrin IX Heme pocket with proximal and distal histidine residues',
    helicesCount: 7
  }
];

export const BioscienceResearchHub: React.FC<BioscienceResearchHubProps> = ({ 
  onLaunchGame, 
  onOpenAuth, 
  onBackToCatalog 
}) => {
  const { currentUser, allUsers, setCurrentUserById } = useLms();
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const [activeTab, setActiveTab] = useState<'3d-viewer' | 'search-scout' | 'maps-locator' | 'voice-notes'>('3d-viewer');
  const [selectedProtein, setSelectedProtein] = useState<ProteinPreset>(PROTEIN_PRESETS[0]);
  const [renderMode, setRenderMode] = useState<'plddt' | 'secondary' | 'surface'>('plddt');

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Maps Grounding state
  const [mapsLocation, setMapsLocation] = useState('Boston & Cambridge, MA');
  const [mapsSpecialty, setMapsSpecialty] = useState('Structural Biology, Cryo-EM & Genomics Core Facilities');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<any>(null);

  // Audio Voice Transcription state (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 3D Canvas Ref
  const viewerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // ==========================================
  // Three.js 3D Macromolecular Visualizer
  // ==========================================
  useEffect(() => {
    const canvas = viewerCanvasRef.current;
    if (!canvas || activeTab !== '3d-viewer' || !isAuthorized) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1120);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 36);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dir1.position.set(20, 30, 25);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x10b981, 1.5);
    dir2.position.set(-20, -20, -10);
    scene.add(dir2);

    // Build Procedural Macromolecule based on selected protein
    const proteinGroup = new THREE.Group();

    // Canonical AlphaFold pLDDT Colors:
    // >90 Dark Blue #0053D6, 70-90 Light Blue #65CBF3, 50-70 Yellow #FFDB13, <50 Orange #FF7D45
    const plddtHex = [0x0053d6, 0x65cbf3, 0xffdb13, 0xff7d45];
    const secondaryHex = [0x0ea5e9, 0x10b981, 0x8b5cf6, 0xf43f5e];

    const helixCount = selectedProtein.helicesCount;
    for (let i = 0; i < helixCount; i++) {
      const points: THREE.Vector3[] = [];
      const turns = 3 + (i % 3);
      const radius = 6 + (i * 1.5);
      const angleStart = (i * Math.PI * 2) / helixCount;

      for (let s = 0; s <= 50; s++) {
        const u = s / 50;
        const theta = angleStart + u * Math.PI * 2 * turns;
        points.push(
          new THREE.Vector3(
            Math.cos(theta) * radius + Math.sin(u * 5) * 1.5,
            (u - 0.5) * 22,
            Math.sin(theta) * radius + Math.cos(u * 4) * 1.5
          )
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 60, 0.55, 8, false);
      const col = renderMode === 'plddt' 
        ? plddtHex[i % plddtHex.length] 
        : secondaryHex[i % secondaryHex.length];

      const tubeMat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.25,
        metalness: 0.2,
        wireframe: renderMode === 'surface'
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      proteinGroup.add(tube);
    }

    // Active Site Binding Pocket Atoms
    const pocketGroup = new THREE.Group();
    const atomGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const atomColors = [0xec4899, 0xf59e0b, 0x38bdf8, 0x10b981];
    for (let a = 0; a < 8; a++) {
      const atomMat = new THREE.MeshStandardMaterial({
        color: atomColors[a % atomColors.length],
        emissive: atomColors[a % atomColors.length],
        emissiveIntensity: 0.5,
        metalness: 0.4
      });
      const atom = new THREE.Mesh(atomGeo, atomMat);
      atom.position.set(
        Math.cos(a) * 3,
        Math.sin(a * 2) * 2,
        Math.sin(a) * 3
      );
      pocketGroup.add(atom);
    }
    proteinGroup.add(pocketGroup);
    scene.add(proteinGroup);

    // Mouse drag rotation controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      proteinGroup.rotation.y += deltaX * 0.01;
      proteinGroup.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.03, 15, 60);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    // Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        proteinGroup.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [activeTab, selectedProtein, renderMode]);

  // Handle Search Grounding Submit
  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery || searchQuery).trim();
    if (!q) return;

    setSearchLoading(true);
    setSearchQuery(q);
    try {
      const res = await fetch('/api/science/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data);
      }
    } catch (err) {
      console.error('Search grounding failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle Maps Grounding Submit
  const handleMapsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMapsLoading(true);
    try {
      const res = await fetch('/api/science/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: mapsLocation, specialty: mapsSpecialty })
      });
      if (res.ok) {
        const data = await res.json();
        setMapsResult(data);
      }
    } catch (err) {
      console.error('Maps grounding failed:', err);
    } finally {
      setMapsLoading(false);
    }
  };

  // ==========================================
  // Audio Voice Recording & Transcription (gemini-3.5-transcribe)
  // ==========================================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        await transcribeAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission required for audio voice transcription.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudioBlob = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const res = await fetch('/api/audio/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: 'audio/webm'
          })
        });

        if (res.ok) {
          const data = await res.json();
          setTranscriptText(data.transcript || 'No transcript generated.');
        }
      };
    } catch (err) {
      console.error('Transcription failed:', err);
    } finally {
      setTranscribing(false);
    }
  };

  const handleCopyTranscript = () => {
    if (!transcriptText) return;
    navigator.clipboard.writeText(transcriptText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  // ==========================================
  // ACCESS CONTROL GATE (Admin or Educator Required)
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
        {/* Breadcrumb / Back Button */}
        {onBackToCatalog && (
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Course Catalog</span>
          </button>
        )}

        {/* Security Clearance Gate Card */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-teal-500/40 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
          {/* Ambient scientific glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            {/* Header with Clearance Stamp */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>RESTRICTED ACCESS · LEVEL 3 BIOLAB</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                  <span>Faculty & Admin Clearance Required</span>
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <Dna className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400 shrink-0" />
                  <span>Bioscience Discovery Lab & AlphaFold Modeler</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                  This scientific research environment executes GPU-accelerated Three.js 3D macromolecular protein simulations, live Gemini 2.5 Flash Search Grounding for biomedical literature (PDB, UniProt, PubMed), and Google Maps research core facility locator.
                </p>
              </div>
            </div>

            {/* Current Account State Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-4 backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Current Session State</span>
                  <span className="text-slate-600">·</span>
                  {currentUser ? (
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Standard Student Account ({currentUser.role})</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Unauthenticated Guest</span>
                    </span>
                  )}
                </div>

                {currentUser && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                    ID: {currentUser.id}
                  </span>
                )}
              </div>

              {currentUser ? (
                /* Logged in as student */
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-amber-100">
                        Instructor or Administrator Login Required
                      </p>
                      <p className="leading-relaxed text-amber-200/90">
                        You are currently signed in as <strong>{currentUser.name}</strong> (<span className="font-mono">{currentUser.email}</span>) with <em>Student (Learner)</em> permissions. The Bioscience Discovery Lab requires verified faculty accreditation or administrator governance rights.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {onOpenAuth && (
                      <button
                        onClick={() => onOpenAuth('teacher_signup')}
                        className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4 fill-current" />
                        <span>Apply for Faculty Accreditation</span>
                      </button>
                    )}

                    {/* Quick switch to verified educator account */}
                    <button
                      onClick={() => {
                        const educator = allUsers.find(u => u.role === 'teacher' && u.teacherVerificationStatus === 'approved') || allUsers.find(u => u.role === 'teacher');
                        if (educator) setCurrentUserById(educator.id);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Switch to Faculty Profile</span>
                    </button>

                    {/* Quick switch to Super Admin */}
                    <button
                      onClick={() => {
                        const admin = allUsers.find(u => u.role === 'admin' && u.email === 'theinsiderspace@gmail.com') || allUsers.find(u => u.role === 'admin');
                        if (admin) setCurrentUserById(admin.id);
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Switch to Super Admin</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated guest */
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Please log in with your educator credentials or administrator passkey to access this high-performance laboratory.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {onOpenAuth && (
                      <>
                        <button
                          onClick={() => onOpenAuth('signin')}
                          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In as Educator / Admin</span>
                        </button>

                        <button
                          onClick={() => onOpenAuth('teacher_signup')}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
                        >
                          <GraduationCap className="w-4 h-4 text-teal-400" />
                          <span>Apply for Faculty Accreditation</span>
                        </button>
                      </>
                    )}

                    {/* Instant Demo Logins */}
                    <div className="w-full pt-2 flex flex-wrap items-center gap-2 border-t border-slate-700/60">
                      <span className="text-[11px] font-mono text-slate-400 mr-1">Instant Demo Logins:</span>
                      <button
                        onClick={() => {
                          const educator = allUsers.find(u => u.role === 'teacher');
                          if (educator) setCurrentUserById(educator.id);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-teal-500/40 text-teal-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>Faculty (Prof. Julian Thorne)</span>
                      </button>
                      <button
                        onClick={() => {
                          const admin = allUsers.find(u => u.role === 'admin' && u.email === 'theinsiderspace@gmail.com') || allUsers.find(u => u.role === 'admin');
                          if (admin) setCurrentUserById(admin.id);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Super Admin (theinsiderspace)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Locked Features Preview */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-teal-400 font-semibold flex items-center gap-2">
                <Atom className="w-4 h-4" />
                <span>Protected Computational Modules</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Atom className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">Three.js 3D AlphaFold Viewer</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive macromolecular ribbon modeling, pLDDT residue confidence mapping, and catalytic pocket coordinate rendering.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">Gemini 2.5 Literature Scout</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live Google Search Grounding across PubMed, UniProt, and bioRxiv for real-time biomedical discoveries and citations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">Google Maps Core Facilities</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Geospatial routing and equipment inventory for cryo-EM facilities, NMR cores, and high-throughput genomic sequencers.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                OWLY Bioscience Governance Policy · Section 4.2 Research Clearances
              </span>
              {onBackToCatalog && (
                <button
                  onClick={onBackToCatalog}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Return to Course Catalog
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Header with 3D Game Launch CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/50 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-teal-300" />
                <span>Google DeepMind Science Skills · AlphaFold 3D · Gemini Grounding</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified {currentUser?.role === 'admin' ? 'Super Admin' : 'Faculty'} Access ({currentUser?.name})</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bioscience Discovery Lab & 3D Interactive Simulation
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore AlphaFold structural predictions, examine macromolecular active sites, ground clinical research via live Google Search & Google Maps, transcribe voice lab notes, and launch the 3D CRISPR-NANO simulation game.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onLaunchGame}
              className="px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Gamepad2 className="w-4 h-4 fill-current" />
              <span>Launch 3D CRISPR-NANO Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('3d-viewer')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === '3d-viewer'
              ? 'bg-white border-t border-x border-slate-200 text-teal-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Atom className="w-4 h-4 text-teal-600" />
          <span>3D Macromolecular Visualizer</span>
        </button>

        <button
          onClick={() => setActiveTab('search-scout')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'search-scout'
              ? 'bg-white border-t border-x border-slate-200 text-teal-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 text-sky-600" />
          <span>Google Search Grounded Discovery</span>
        </button>

        <button
          onClick={() => setActiveTab('maps-locator')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'maps-locator'
              ? 'bg-white border-t border-x border-slate-200 text-teal-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>Google Maps Research Core Locator</span>
        </button>

        <button
          onClick={() => setActiveTab('voice-notes')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'voice-notes'
              ? 'bg-white border-t border-x border-slate-200 text-teal-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-600" />
          <span>Microphone Voice Transcription</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: 3D MACROMOLECULAR VISUALIZER
          ======================================================== */}
      {activeTab === '3d-viewer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 3D WebGL Canvas Viewport */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative flex flex-col">
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-bold text-slate-200">{selectedProtein.name}</span>
                <span className="text-slate-500 font-mono">PDB: {selectedProtein.pdbId} · UniProt: {selectedProtein.uniprotId}</span>
              </div>

              {/* Color Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setRenderMode('plddt')}
                  className={`px-2 py-0.5 rounded transition-colors ${renderMode === 'plddt' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  AlphaFold pLDDT
                </button>
                <button
                  onClick={() => setRenderMode('secondary')}
                  className={`px-2 py-0.5 rounded transition-colors ${renderMode === 'secondary' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Secondary
                </button>
                <button
                  onClick={() => setRenderMode('surface')}
                  className={`px-2 py-0.5 rounded transition-colors ${renderMode === 'surface' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Wireframe
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 min-h-[460px] cursor-grab active:cursor-grabbing">
              <canvas ref={viewerCanvasRef} className="w-full h-full block" />

              {/* Interactive Overlay Hint */}
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800 pointer-events-none">
                Click & Drag to Rotate · Scroll to Zoom · Active Pocket Spheres Highlighted
              </div>
            </div>

            {/* AlphaFold Confidence Legend */}
            {renderMode === 'plddt' && (
              <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-[10px] font-mono flex flex-wrap items-center justify-between gap-3 text-slate-300">
                <span className="font-semibold text-slate-400 uppercase tracking-wider">AlphaFold Confidence (pLDDT):</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0053D6]" /> Very high (&gt;90)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#65CBF3]" /> Confident (70-90)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFDB13]" /> Low (50-70)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF7D45]" /> Disordered (&lt;50)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Protein Preset Selector & Active Site Analysis */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Dna className="w-4 h-4 text-teal-600" />
                <span>Select Protein Complex</span>
              </h3>

              <div className="space-y-2">
                {PROTEIN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedProtein(preset)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      selectedProtein.id === preset.id
                        ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{preset.name}</span>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-100/60 px-1.5 py-0.2 rounded font-bold">
                        PDB {preset.pdbId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{preset.category} · {preset.organism}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Protein Biological Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-teal-700 block">
                    {selectedProtein.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedProtein.name}</h4>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {selectedProtein.organism}
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px]">
                {selectedProtein.description}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                <span className="font-bold text-slate-800 block">Active Site & Binding Domain:</span>
                <p className="text-slate-600">{selectedProtein.activeSite}</p>
              </div>

              <button
                onClick={onLaunchGame}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>Simulate Ligand Defense in 3D Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: GOOGLE SEARCH GROUNDED DISCOVERY SCOUT
          ======================================================== */}
      {activeTab === 'search-scout' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-sky-600" />
              <span>Google Search Grounded Biomedical Discovery</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Powered by <strong>gemini-3.8-flash</strong> with native Google Search Grounding to query current PubMed literature, bioRxiv preprints, and clinical trial outcomes.
            </p>
          </div>

          <form onSubmit={(e) => handleSearchSubmit(e)} className="flex gap-2 max-w-3xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scientific topics, e.g. 'Recent allosteric KRAS G12D inhibitors' or 'AlphaFold 3 multi-chain predictive accuracy'..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Query Literature</span>
            </button>
          </form>

          {/* Quick preset queries */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Quick Prompts:</span>
            {[
              'Recent structural breakthroughs in CRISPR-Cas12a',
              'AlphaFold 3 nucleic acid binding accuracy',
              'Small molecule allosteric KRAS G12D inhibitors',
              'Cryo-EM insights into ATP synthase mechanisms'
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => handleSearchSubmit(undefined, promptText)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 rounded-lg text-[11px] transition-colors"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Results Display */}
          {searchResult && (
            <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-sm">Scientific Synthesis</span>
                <span className="text-[10px] font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-semibold">
                  Google Search Grounded
                </span>
              </div>

              <div className="prose prose-xs max-w-none text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {searchResult.analysis}
              </div>

              {searchResult.groundingMetadata?.webSearchQueries && (
                <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span className="font-semibold block mb-1">Grounded Search Queries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {searchResult.groundingMetadata.webSearchQueries.map((q: string, idx: number) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-[10px]">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: GOOGLE MAPS GROUNDED LAB LOCATOR
          ======================================================== */}
      {activeTab === 'maps-locator' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Google Maps Grounded Biomedical Facility Locator</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Powered by <strong>gemini-3.8-flash</strong> with native Google Maps Grounding to locate world-class research institutes, university genomics centers, and cryo-EM facilities.
            </p>
          </div>

          <form onSubmit={handleMapsSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Target Metro / Region
              </label>
              <input
                type="text"
                value={mapsLocation}
                onChange={(e) => setMapsLocation(e.target.value)}
                placeholder="e.g. Cambridge, MA"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Core Specialty
              </label>
              <input
                type="text"
                value={mapsSpecialty}
                onChange={(e) => setMapsSpecialty(e.target.value)}
                placeholder="Genomics & Structural Biology"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={mapsLoading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {mapsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span>Locate Laboratories</span>
              </button>
            </div>
          </form>

          {/* Maps Results Display */}
          {mapsResult && (
            <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-sm">Laboratories & Academic Institutes in {mapsResult.location}</span>
                <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-semibold">
                  Google Maps Grounded
                </span>
              </div>

              <div className="prose prose-xs max-w-none text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {mapsResult.facilities}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: MICROPHONE VOICE TRANSCRIPTION (gemini-3.5-transcribe)
          ======================================================== */}
      {activeTab === 'voice-notes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-600" />
              <span>Voice Lab Notes & Audio Transcription</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Record experimental observations and voice memos via your microphone. Audio is transcribed verbatim using Google&apos;s specialized <strong>gemini-3.5-transcribe</strong> model.
            </p>
          </div>

          {/* Recording Control Console */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 ${
                  isRecording 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {isRecording ? '🔴 Recording Microphone Audio...' : 'Click Microphone to Begin Speaking'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isRecording ? 'Speak clearly into your microphone · Click again to stop & transcribe' : 'Audio will be processed by gemini-3.5-transcribe'}
                </span>
              </div>
            </div>

            {transcribing && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Transcribing audio with gemini-3.5-transcribe...</span>
              </div>
            )}
          </div>

          {/* Transcript Output Box */}
          {transcriptText && (
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">Verbatim Transcript</span>
                <button
                  onClick={handleCopyTranscript}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                >
                  {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedTranscript ? 'Copied' : 'Copy Transcript'}</span>
                </button>
              </div>

              <p className="text-slate-800 leading-relaxed font-sans text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                {transcriptText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

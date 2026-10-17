import React, { useState, useEffect } from 'react';
import { useLms } from '../context/LmsContext';
import { User, UserRole } from '../types/lms';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Save, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  Github, 
  Linkedin, 
  Twitter, 
  Globe, 
  Award, 
  Layers, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  Plus, 
  Trash2,
  Calendar,
  Building,
  Briefcase
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCourse?: (courseId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCourse
}) => {
  const { 
    currentUser, 
    allUsers,
    courses, 
    enrollments, 
    updateUserProfile, 
    enhanceUserProfileWithAI,
    cloudSyncState,
    forceCloudSync,
    setUserRole
  } = useLms();

  const [activeTab, setActiveTab] = useState<'profile' | 'ai_insights' | 'academic_record' | 'account'>('profile');
  
  // Form State initialized from currentUser
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    institutionOrCompany: '',
    bio: '',
    skills: [] as string[],
    learningGoals: [] as string[],
    socialGithub: '',
    socialLinkedin: '',
    socialTwitter: '',
    socialWebsite: '',
    socialGoogleScholar: ''
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI profile enhancer state
  const [isEnhancingAI, setIsEnhancingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    polishedBio?: string;
    extractedSkills?: string[];
    recommendedSkills?: string[];
    careerTrajectory?: string;
    recommendedCourseTopics?: string[];
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        title: currentUser.title || '',
        institutionOrCompany: currentUser.institutionOrCompany || '',
        bio: currentUser.bio || '',
        skills: currentUser.skills || ['Distributed Systems', 'Cloud Architecture', 'TypeScript'],
        learningGoals: currentUser.learningGoals || ['Master Consensus Protocols', 'Deploy Autonomous AI Swarms'],
        socialGithub: currentUser.socialLinks?.github || '',
        socialLinkedin: currentUser.socialLinks?.linkedin || '',
        socialTwitter: currentUser.socialLinks?.twitter || '',
        socialWebsite: currentUser.socialLinks?.website || '',
        socialGoogleScholar: currentUser.socialLinks?.googleScholar || ''
      });
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddGoal = () => {
    const trimmed = newGoalInput.trim();
    if (trimmed && !formData.learningGoals.includes(trimmed)) {
      setFormData(prev => ({ ...prev, learningGoals: [...prev.learningGoals, trimmed] }));
      setNewGoalInput('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.filter(g => g !== goalToRemove)
    }));
  };

  const handleRunAIEnhance = async () => {
    setIsEnhancingAI(true);
    try {
      const result = await enhanceUserProfileWithAI();
      if (result) {
        setAiSuggestions(result);
        setActiveTab('ai_insights');
      }
    } finally {
      setIsEnhancingAI(false);
    }
  };

  const handleApplyAISuggestions = () => {
    if (!aiSuggestions) return;
    setFormData(prev => {
      const mergedSkills = Array.from(new Set([
        ...prev.skills,
        ...(aiSuggestions.extractedSkills || []),
        ...(aiSuggestions.recommendedSkills || []).slice(0, 2)
      ]));
      return {
        ...prev,
        bio: aiSuggestions.polishedBio || prev.bio,
        skills: mergedSkills
      };
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name.trim(),
        title: formData.title.trim(),
        institutionOrCompany: formData.institutionOrCompany.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills,
        learningGoals: formData.learningGoals,
        socialLinks: {
          github: formData.socialGithub.trim(),
          linkedin: formData.socialLinkedin.trim(),
          twitter: formData.socialTwitter.trim(),
          website: formData.socialWebsite.trim(),
          googleScholar: formData.socialGoogleScholar.trim()
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Enrolled courses details
  const userEnrolledCourses = courses.filter(c => currentUser.enrolledCourseIds?.includes(c.id));
  const userAuthoredCourses = courses.filter(c => c.instructorId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Top Header & Cloud Sync Status */}
        <div className="px-6 py-4 border-b border-slate-200/90 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-md ring-2 ring-white/20 ${
              currentUser.role === 'admin' 
                ? 'bg-purple-600' 
                : currentUser.role === 'teacher' 
                ? 'bg-sky-600' 
                : 'bg-indigo-600'
            }`}>
              {currentUser.avatarText}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{currentUser.name}</h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                    : currentUser.role === 'teacher'
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
                    : 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                }`}>
                  {currentUser.role === 'teacher' && currentUser.teacherVerificationStatus === 'approved' 
                    ? 'Verified Faculty' 
                    : currentUser.role === 'teacher'
                    ? 'Faculty (Pending Accreditation)' 
                    : currentUser.role === 'admin' 
                    ? 'Super Administrator' 
                    : 'Enrolled Student'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-2">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span>Member since {currentUser.joinedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cloud Sync Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg border border-white/15 text-xs">
              {cloudSyncState.status === 'synced' ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Firestore Synced</span>
                </>
              ) : cloudSyncState.status === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span className="text-amber-200">Syncing...</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300">Local Cache</span>
                </>
              )}
              <button
                type="button"
                onClick={forceCloudSync}
                title="Force real-time cloud sync with Firestore"
                className="hover:text-white text-slate-300 transition-colors ml-1"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'profile'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Profile & Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_insights')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'ai_insights'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI Career & Skills Intelligence</span>
            {aiSuggestions && (
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('academic_record')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'academic_record'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-sky-500" />
            <span>Academic Transcript ({userEnrolledCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'account'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Account & Cloud Sync</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Profile & Credentials Edit Form */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Quick AI Trigger Banner */}
              <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 border border-purple-200/70 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">AI Profile & Trajectory Copilot</h4>
                    <p className="text-[11px] text-slate-600">
                      Use Gemini to polish your academic biography, extract frontier competencies, and recommend next-step skills.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunAIEnhance}
                  disabled={isEnhancingAI}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isEnhancingAI ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze Profile</span>
                    </>
                  )}
                </button>
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal / Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic / Professional Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Distributed Systems Engineer or MIT Lecturer"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Affiliation / University / Organization</span>
                  </label>
                  <input
                    type="text"
                    value={formData.institutionOrCompany}
                    onChange={e => setFormData({ ...formData, institutionOrCompany: e.target.value })}
                    placeholder="e.g. Massachusetts Institute of Technology, DeepMind, or Autonomous AI Lab"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Biography & Research Focus</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formData.bio.length}/2000 chars
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Describe your research specialization, core engineering projects, or technical passions..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>

              {/* Skills & Competencies Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Technical Competencies & Specialties
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.skills.map(skill => (
                    <span 
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills listed yet. Add tags below.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    placeholder="Add a new skill tag (e.g. Raft Consensus, Lean 4, eBPF)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Active Learning Goals */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Active Learning Goals & Target Trajectories
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.learningGoals.map(goal => (
                    <span 
                      key={goal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg"
                    >
                      <span>{goal}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(goal)}
                        className="text-emerald-400 hover:text-emerald-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newGoalInput}
                    onChange={e => setNewGoalInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddGoal(); } }}
                    placeholder="Add learning milestone (e.g. Implement Raft in Rust from scratch)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Social & Academic Links */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Portfolio, Repository & Academic Scholar Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg">
                    <Github className="w-4 h-4 text-slate-600 shrink-0" />
                    <input
                      type="url"
                      value={formData.socialGithub}
                      onChange={e => setFormData({ ...formData, socialGithub: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg">
                    <Linkedin className="w-4 h-4 text-sky-600 shrink-0" />
                    <input
                      type="url"
                      value={formData.socialLinkedin}
                      onChange={e => setFormData({ ...formData, socialLinkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg">
                    <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    <input
                      type="url"
                      value={formData.socialWebsite}
                      onChange={e => setFormData({ ...formData, socialWebsite: e.target.value })}
                      placeholder="https://yourportfolio.dev"
                      className="w-full text-xs focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-lg">
                    <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                    <input
                      type="url"
                      value={formData.socialGoogleScholar}
                      onChange={e => setFormData({ ...formData, socialGoogleScholar: e.target.value })}
                      placeholder="Google Scholar / Lab URL"
                      className="w-full text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Save & Feedback Controls */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                    doc: users/{currentUser.id}
                  </span>
                  {saveSuccess && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>User profile successfully saved to FIRESTORE DATABASE!</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to Firestore Database...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile to FIRESTORE DATABASE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: AI Career & Skills Intelligence */}
          {activeTab === 'ai_insights' && (
            <div className="space-y-6">
              {!aiSuggestions ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Sparkles className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-900">Run Gemini Profile Intelligence</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-4">
                    Our AI model synthesizes your academic background, courses, and objectives into an executive dossier with recommended skill trajectories.
                  </p>
                  <button
                    type="button"
                    onClick={handleRunAIEnhance}
                    disabled={isEnhancingAI}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs inline-flex items-center gap-2 transition-all"
                  >
                    {isEnhancingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Dossier...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate AI Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>AI Executive Assessment</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Generated specifically for {currentUser.name} ({currentUser.role})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRunAIEnhance}
                        disabled={isEnhancingAI}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isEnhancingAI ? 'animate-spin' : ''}`} />
                        <span>Re-analyze</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyAISuggestions}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Apply to Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* Polished Bio Card */}
                  <div className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                      AI Polished Executive Summary
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      {aiSuggestions.polishedBio}
                    </p>
                  </div>

                  {/* Career Trajectory Card */}
                  {aiSuggestions.careerTrajectory && (
                    <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Career & Specialization Trajectory</span>
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans">
                        {aiSuggestions.careerTrajectory}
                      </p>
                    </div>
                  )}

                  {/* Recommended Frontier Skills */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">
                      Frontier Skills Recommended for Your Trajectory
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aiSuggestions.recommendedSkills?.map(skill => (
                        <span 
                          key={skill}
                          className="px-3 py-1 bg-white border border-slate-300 text-xs text-slate-800 font-medium rounded-lg shadow-2xs flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Courses / Curriculum */}
                  {aiSuggestions.recommendedCourseTopics && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-2">
                        Suggested Masterclass Curricula to Target Next
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {aiSuggestions.recommendedCourseTopics.map((topic, i) => (
                          <div 
                            key={i}
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-xs"
                          >
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="font-medium text-slate-800">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Academic Record & Transcript */}
          {activeTab === 'academic_record' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Enrolled Courses & Active Progress
                </h3>
                {userEnrolledCourses.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-600">You are not currently enrolled in any courses.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userEnrolledCourses.map(course => {
                      const prog = currentUser 
                        ? (enrollments[`${currentUser.id}_${course.id}`] || enrollments[course.id])
                        : enrollments[course.id];
                      const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
                      const completedCount = prog?.completedLessonIds?.length || 0;
                      const pct = Math.min(100, Math.round((completedCount / Math.max(1, totalLessons)) * 100));
                      return (
                        <div 
                          key={course.id}
                          className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                              {course.category} • {course.level}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                              {course.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Instructor: {course.instructorName}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full transition-all" 
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono font-medium text-slate-700">{pct}%</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {prog?.certificateIssued && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                                <Award className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Certified</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onNavigateToCourse?.(course.id);
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <span>Open Course</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* If User has Authored Courses (Educator/Faculty) */}
              {userAuthoredCourses.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Faculty Catalog: Courses Authored ({userAuthoredCourses.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userAuthoredCourses.map(course => (
                      <div 
                        key={course.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-700 uppercase">{course.category}</span>
                          <span className="font-mono font-semibold text-slate-900">${course.price}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 truncate">{course.title}</h5>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>★ {course.rating}</span>
                          <span>{course.studentCount} Students</span>
                          <span className="capitalize">{course.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Account & Cloud Sync */}
          {activeTab === 'account' && (
            <div className="space-y-6 text-xs">
              
              {/* Cloud Synchronization Status Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-indigo-600" />
                      <span>Firestore Cloud Persistence</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Collection: <code className="font-mono text-indigo-700">/users/{currentUser.id}</code>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={forceCloudSync}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync with Firestore</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SYNC STATUS</span>
                    <span className="font-semibold capitalize text-slate-800">{cloudSyncState.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LAST SYNCED</span>
                    <span className="font-semibold text-slate-800">{cloudSyncState.lastSyncedAt || 'Just now'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CLOUD FIRESTORE DB</span>
                    <span className="font-semibold text-slate-800 truncate block">ai-studio-aetherialmscours...</span>
                  </div>
                </div>
              </div>

              {/* Persona Switcher for Verification & Testing */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">
                  Development Persona & Access Role
                </h4>
                <p className="text-[11px] text-slate-600">
                  Switch roles instantly to inspect the platform from a Student, Verified Faculty, or Platform Dean perspective.
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUserRole('student')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      currentUser.role === 'student'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 mb-1 text-indigo-600" />
                    <div className="font-bold text-xs">Student</div>
                    <div className="text-[10px] text-slate-500">Learner Space</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRole('teacher')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      currentUser.role === 'teacher'
                        ? 'border-sky-600 bg-sky-50/70 text-sky-900 font-semibold ring-1 ring-sky-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mb-1 text-sky-600" />
                    <div className="font-bold text-xs">Faculty</div>
                    <div className="text-[10px] text-slate-500">Teacher Studio</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRole('admin')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      currentUser.role === 'admin'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-semibold ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-1 text-purple-600" />
                    <div className="font-bold text-xs">Platform Admin</div>
                    <div className="text-[10px] text-slate-500">Governance & Auth</div>
                  </button>
                </div>
              </div>

              {/* Security & Access Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Privacy & Identity Governance</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your credentials and academic records are guarded by Zero-Trust attribute-based access control (ABAC).
                  Private profile fields and notes are accessible only by your verified identity and designated platform governance.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

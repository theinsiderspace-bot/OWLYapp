import React, { useState } from 'react';
import { Course, CourseModule, Lesson, LessonType } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Video, 
  FileText, 
  HelpCircle, 
  Save, 
  Check, 
  Layers, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface CourseEditorModalProps {
  courseToEdit?: Course | null;
  onClose: () => void;
  onSaved: (course: Course) => void;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  courseToEdit,
  onClose,
  onSaved
}) => {
  const { currentUser, createCourse, updateCourse, hostedVideos } = useLms();

  // Basic Information
  const [title, setTitle] = useState(courseToEdit?.title || '');
  const [subtitle, setSubtitle] = useState(courseToEdit?.subtitle || '');
  const [description, setDescription] = useState(courseToEdit?.description || '');
  const [category, setCategory] = useState(courseToEdit?.category || 'Engineering');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>(
    courseToEdit?.level || 'Intermediate'
  );
  const [price, setPrice] = useState(courseToEdit?.price?.toString() || '199');
  const [prerequisitesText, setPrerequisitesText] = useState(
    courseToEdit?.prerequisites.join('\n') || 'Basic programming experience\nFamiliarity with terminal commands'
  );
  const [objectivesText, setObjectivesText] = useState(
    courseToEdit?.learningObjectives.join('\n') || 'Understand distributed systems foundations\nImplement fault-tolerant microservices'
  );

  // Modules & Lessons
  const [modules, setModules] = useState<CourseModule[]>(() => {
    if (courseToEdit?.modules && courseToEdit.modules.length > 0) {
      return courseToEdit.modules;
    }
    return [
      {
        id: `mod-${Date.now()}-1`,
        title: 'Module 1: Architecture Core Foundations',
        description: 'Fundamental principles and design constraints.',
        lessons: [
          {
            id: `les-${Date.now()}-1`,
            title: '1.1 System Overview & Theoretical Context',
            durationMinutes: 20,
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            contentMarkdown: 'Core architecture overview and system requirements specification.',
            resources: [{ id: 'res-1', name: 'Architecture_Blueprint.pdf', fileSize: '1.2 MB', type: 'PDF' }]
          }
        ]
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');
  const [errorMsg, setErrorMsg] = useState('');

  // Module actions
  const handleAddModule = () => {
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      title: `Module ${modules.length + 1}: Advanced Concepts`,
      description: 'In-depth implementation and system hardening.',
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: `${modules.length + 1}.1 Technical Implementation Guide`,
          durationMinutes: 25,
          type: 'video',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          contentMarkdown: 'Implementation guidelines and best practices.'
        }
      ]
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (modIndex: number) => {
    if (modules.length <= 1) return;
    setModules(modules.filter((_, idx) => idx !== modIndex));
  };

  const handleUpdateModule = (modIndex: number, field: 'title' | 'description', value: string) => {
    const updated = [...modules];
    updated[modIndex] = { ...updated[modIndex], [field]: value };
    setModules(updated);
  };

  // Lesson actions
  const handleAddLesson = (modIndex: number, type: LessonType) => {
    const updated = [...modules];
    const newLesson: Lesson = {
      id: `les-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `New ${type === 'video' ? 'Video Lecture' : type === 'quiz' ? 'Quiz Assessment' : 'Article Specification'}`,
      durationMinutes: type === 'quiz' ? 15 : 20,
      type,
      videoUrl: type === 'video' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' : undefined,
      contentMarkdown: type === 'article' ? 'Detailed lecture notes and design patterns.' : undefined,
      quizQuestions: type === 'quiz' ? [
        {
          id: `q-${Date.now()}`,
          question: 'What is the primary trade-off of this architectural approach?',
          options: ['Higher latency for stronger consistency', 'Zero resource utilization', 'Unbounded throughput', 'Loss of durability'],
          correctAnswerIndex: 0,
          explanation: 'Strong consistency necessitates synchronous replica acknowledgments, which introduces network round-trip overhead.'
        }
      ] : undefined
    };
    updated[modIndex].lessons.push(newLesson);
    setModules(updated);
  };

  const handleRemoveLesson = (modIndex: number, lessonIndex: number) => {
    const updated = [...modules];
    updated[modIndex].lessons = updated[modIndex].lessons.filter((_, idx) => idx !== lessonIndex);
    setModules(updated);
  };

  const handleUpdateLesson = (modIndex: number, lessonIndex: number, field: string, value: any) => {
    const updated = [...modules];
    updated[modIndex].lessons[lessonIndex] = {
      ...updated[modIndex].lessons[lessonIndex],
      [field]: value
    };
    setModules(updated);
  };

  const handleSaveCourse = () => {
    if (currentUser?.role === 'teacher' && currentUser.teacherVerificationStatus !== 'approved') {
      setErrorMsg('Access Restricted: Your instructor account is currently pending administrative approval. Course creation and curriculum publishing are locked.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Course title is required.');
      setActiveTab('info');
      return;
    }

    const parsedPrice = parseFloat(price) || 99;
    const prereqs = prerequisitesText.split('\n').map(s => s.trim()).filter(Boolean);
    const objectives = objectivesText.split('\n').map(s => s.trim()).filter(Boolean);

    // Calculate total duration
    const totalMinutes = modules.reduce(
      (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + l.durationMinutes, 0),
      0
    );
    const durationHours = Math.max(1, Math.round((totalMinutes / 60) * 10) / 10);

    const themeColors: Record<string, { accentColor: string; gradientFrom: string; gradientTo: string; icon: any }> = {
      Engineering: { accentColor: '#0284C7', gradientFrom: 'from-sky-950', gradientTo: 'to-slate-900', icon: 'server' },
      'Artificial Intelligence': { accentColor: '#6366F1', gradientFrom: 'from-indigo-950', gradientTo: 'to-slate-900', icon: 'cpu' },
      'Finance & Trading': { accentColor: '#10B981', gradientFrom: 'from-emerald-950', gradientTo: 'to-slate-900', icon: 'trending-up' },
      'Design Systems': { accentColor: '#F59E0B', gradientFrom: 'from-amber-950', gradientTo: 'to-slate-900', icon: 'layout' }
    };

    const coursePayload = {
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      title: title.trim(),
      subtitle: subtitle.trim() || 'Comprehensive professional curriculum.',
      description: description.trim() || 'In-depth professional masterclass engineered for senior practitioners.',
      category,
      level,
      price: parsedPrice,
      originalPrice: Math.round(parsedPrice * 1.3),
      instructorId: currentUser?.id || 'faculty-default',
      instructorName: currentUser?.name || 'Faculty Instructor',
      instructorTitle: currentUser?.title || 'Senior Instructor',
      instructorBio: currentUser?.bio || 'Expert educator with real-world industry background.',
      durationHours,
      status: 'published' as const,
      learningObjectives: objectives.length > 0 ? objectives : ['Master domain-level engineering fundamentals'],
      prerequisites: prereqs.length > 0 ? prereqs : ['Basic domain experience'],
      modules,
      theme: themeColors[category] || themeColors['Engineering']
    };

    if (courseToEdit) {
      updateCourse(courseToEdit.id, coursePayload);
      onSaved({ ...courseToEdit, ...coursePayload });
    } else {
      const created = createCourse(coursePayload);
      onSaved(created);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {courseToEdit ? 'Edit Course Curriculum' : 'Create & Publish New Course'}
            </h3>
            <p className="text-xs text-slate-500">
              Instructor: {currentUser?.name || 'Faculty Member'} · Content Upload Studio
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Course Details & Pricing
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Modules, Lessons & Quizzes</span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
              {modules.reduce((s, m) => s + m.lessons.length, 0)} lessons
            </span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Sharding & Active-Active Clusters"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Subtitle (One-line pitch)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Master high-throughput partition strategies and multi-region replication."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Finance & Trading">Finance & Trading</option>
                    <option value="Design Systems">Design Systems</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Tuition Price ($ USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums text-slate-900"
                    />
                  </div>
                  {/* Real-time 30% System Retention Split */}
                  <div className="mt-2 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center text-amber-800 text-[11px]">
                      <span>System Retention (30%):</span>
                      <span>-${((parseFloat(price) || 0) * 0.30).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-800 font-bold border-t border-emerald-200/60 pt-0.5">
                      <span>Educator Net Payout (70%):</span>
                      <span>+${((parseFloat(price) || 0) * 0.70).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Full Course Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide an in-depth breakdown of the syllabus, target audience, and engineering applications..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Learning Objectives (One per line)
                  </label>
                  <textarea
                    value={objectivesText}
                    onChange={(e) => setObjectivesText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px] leading-relaxed text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Prerequisites (One per line)
                  </label>
                  <textarea
                    value={prerequisitesText}
                    onChange={(e) => setPrerequisitesText(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px] leading-relaxed text-slate-800"
                  />
                </div>
              </div>

              {/* Course Certificate Settings */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 text-xs">
                    ★ Official Course Certificate Accreditation
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Enabled
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Upon completion of all curriculum modules and scoring 70%+ on assessments, enrolled students automatically receive a signed, verifiable Certificate of Academic Mastery.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-700 font-medium block mb-1 text-[11px]">
                      Certificate Diploma Title
                    </label>
                    <input
                      type="text"
                      defaultValue={`Certificate of Academic Mastery in ${title || 'Specialized Engineering'}`}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-medium block mb-1 text-[11px]">
                      Minimum Quiz Pass Score Threshold
                    </label>
                    <select
                      defaultValue="70"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs"
                    >
                      <option value="60">60% (Passing)</option>
                      <option value="70">70% (Standard Academic Mastery)</option>
                      <option value="80">80% (Advanced Honors)</option>
                      <option value="90">90% (Highest Distinction)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Course Modules & Lessons</h4>
                  <p className="text-slate-500">
                    Upload video lectures, attach code files, and build interactive quizzes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>

              {/* Modules list */}
              <div className="space-y-6">
                {modules.map((mod, modIdx) => (
                  <div key={mod.id} className="border border-slate-200 rounded-xl bg-slate-50/50 p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => handleUpdateModule(modIdx, 'title', e.target.value)}
                          placeholder="Module Title"
                          className="w-full px-3 py-1.5 font-bold text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                        />
                        <input
                          type="text"
                          value={mod.description}
                          onChange={(e) => handleUpdateModule(modIdx, 'description', e.target.value)}
                          placeholder="Module brief description"
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-600 text-xs"
                        />
                      </div>

                      {modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveModule(modIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1.5"
                          title="Delete module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Lesson Items */}
                    <div className="space-y-3 pl-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Lessons in this Module
                      </span>

                      {mod.lessons.map((lesson, lessonIdx) => (
                        <div key={lesson.id} className="bg-white border border-slate-200 rounded-lg p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-slate-400 font-mono text-[11px]">{lessonIdx + 1}.</span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleUpdateLesson(modIdx, lessonIdx, 'title', e.target.value)}
                                className="flex-1 font-semibold text-xs border border-slate-200 rounded px-2 py-1 text-slate-800"
                                placeholder="Lesson Title"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 font-mono">
                                <input
                                  type="number"
                                  value={lesson.durationMinutes}
                                  onChange={(e) => handleUpdateLesson(modIdx, lessonIdx, 'durationMinutes', parseInt(e.target.value) || 10)}
                                  className="w-12 border border-slate-200 rounded px-1.5 py-1 text-center text-xs"
                                />
                                <span className="text-slate-400 text-[11px]">min</span>
                              </div>

                              <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {lesson.type}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveLesson(modIdx, lessonIdx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Lesson Type Specific Fields */}
                          {lesson.type === 'video' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] text-slate-500 block mb-0.5">Video Asset Stream URL</label>
                                {hostedVideos && hostedVideos.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-indigo-600 font-semibold">Or pick from Cloud Library:</span>
                                    <select
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          const chosen = hostedVideos.find(v => v.id === e.target.value);
                                          if (chosen) {
                                            handleUpdateLesson(modIdx, lessonIdx, 'videoUrl', chosen.videoUrl);
                                            handleUpdateLesson(modIdx, lessonIdx, 'durationMinutes', Math.max(1, Math.round(chosen.durationSeconds / 60)));
                                          }
                                        }
                                      }}
                                      defaultValue=""
                                      className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 rounded px-1.5 py-0.5"
                                    >
                                      <option value="">-- Cloud Video --</option>
                                      {hostedVideos.map(v => (
                                        <option key={v.id} value={v.id}>{v.title} ({v.resolution})</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={lesson.videoUrl || ''}
                                onChange={(e) => handleUpdateLesson(modIdx, lessonIdx, 'videoUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full text-xs font-mono px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-700"
                              />
                            </div>
                          )}

                          {lesson.type === 'article' && (
                            <div>
                              <label className="text-[11px] text-slate-500 block mb-0.5">Article Content / Code Spec</label>
                              <textarea
                                value={lesson.contentMarkdown || ''}
                                onChange={(e) => handleUpdateLesson(modIdx, lessonIdx, 'contentMarkdown', e.target.value)}
                                rows={2}
                                className="w-full text-xs font-mono px-2 py-1 border border-slate-200 rounded text-slate-700"
                              />
                            </div>
                          )}

                          {lesson.type === 'quiz' && (
                            <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                              Contains {lesson.quizQuestions?.length || 0} interactive multiple choice assessment question(s).
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Lesson Buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleAddLesson(modIdx, 'video')}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                        >
                          <Video className="w-3 h-3 text-indigo-600" />
                          <span>+ Video</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddLesson(modIdx, 'article')}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-sky-600" />
                          <span>+ Article</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddLesson(modIdx, 'quiz')}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          <span>+ Quiz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'info' ? (
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Proceed to Curriculum & Lessons →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveCourse}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publish Course to Marketplace</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

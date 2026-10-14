import React, { useState } from 'react';
import { Course } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { CourseVisual } from './CourseVisual';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Star, 
  Users, 
  FileText, 
  PlayCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface CourseDetailsModalProps {
  course: Course;
  onClose: () => void;
  onEnroll: (course: Course) => void;
  onStartCourse: (course: Course) => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  onClose,
  onEnroll,
  onStartCourse
}) => {
  const { isUserEnrolled } = useLms();
  const enrolled = isUserEnrolled(course.id);
  const [openModuleIds, setOpenModuleIds] = useState<string[]>([course.modules[0]?.id || '']);

  const toggleModule = (modId: string) => {
    setOpenModuleIds(prev => 
      prev.includes(modId) ? prev.filter(id => id !== modId) : [...prev, modId]
    );
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Visual Header */}
        <div className="relative">
          <CourseVisual
            category={course.category}
            theme={course.theme}
            title={course.title}
            className="h-48 md:h-56"
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Header Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-semibold text-indigo-700">{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {course.durationHours} Total Hours
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-amber-700 font-mono tabular-nums font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {course.rating.toFixed(2)} ({course.reviewCount} verified reviews)
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {course.studentCount.toLocaleString()} Students Enrolled
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight mb-3">
              {course.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Pricing & CTA Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  ${course.price}
                </span>
                {course.originalPrice && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    ${course.originalPrice}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Full Lifetime License
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-slate-500">
                  Includes all code exercises, resources, and faculty Q&A.
                </span>
                <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium flex items-center gap-1">
                  <span>★ Official Verifiable Certificate Included</span>
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-3">
              {enrolled ? (
                <button
                  onClick={() => onStartCourse(course)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              What You Will Master
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Curriculum Syllabus
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {course.modules.length} Modules · {totalLessons} Lessons
              </span>
            </div>

            <div className="space-y-3">
              {course.modules.map((mod, idx) => {
                const isOpen = openModuleIds.includes(mod.id);
                return (
                  <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full px-5 py-3.5 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
                    >
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {mod.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {mod.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono tabular-nums hidden sm:inline">
                          {mod.lessons.length} lessons
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-100 px-5 py-2">
                        {mod.lessons.map(lesson => (
                          <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              {lesson.type === 'video' && <PlayCircle className="w-4 h-4 text-indigo-600 shrink-0" />}
                              {lesson.type === 'article' && <FileText className="w-4 h-4 text-sky-600 shrink-0" />}
                              {lesson.type === 'quiz' && <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                              <span className="text-slate-700 font-medium">{lesson.title}</span>
                            </div>
                            <span className="text-slate-400 font-mono tabular-nums">
                              {lesson.durationMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor Profile */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Instructor
            </h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {course.instructorName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{course.instructorName}</h4>
                <p className="text-xs text-indigo-700 font-medium mb-1.5">{course.instructorTitle}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{course.instructorBio}</p>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Prerequisites
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
              {course.prerequisites.map((prereq, i) => (
                <li key={i}>{prereq}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

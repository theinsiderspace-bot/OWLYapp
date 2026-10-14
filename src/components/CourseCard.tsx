import React from 'react';
import { Course } from '../types/lms';
import { useLms } from '../context/LmsContext';
import { CourseVisual } from './CourseVisual';
import { Star, Clock, Users, ArrowRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  onEnrollClick?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, onEnrollClick }) => {
  const { isUserEnrolled, getEnrollment } = useLms();
  const enrolled = isUserEnrolled(course.id);
  const enrollment = getEnrollment(course.id);

  // Calculate progress %
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = enrollment?.completedLessonIds.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all flex flex-col h-full">
      {/* Course Visual Cover */}
      <div className="cursor-pointer" onClick={() => onSelect(course)}>
        <CourseVisual
          category={course.category}
          theme={course.theme}
          title={course.title}
          className="h-44 group-hover:scale-[1.01] transition-transform duration-300"
        />
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata - Clean Unboxed Text with Separators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
            <span>{course.level}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3 h-3 text-slate-400" />
              {course.durationHours}h
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-amber-700 font-mono tabular-nums font-medium">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              {course.rating.toFixed(2)} ({course.reviewCount})
            </span>
          </div>

          {/* Primary Title */}
          <h4 
            onClick={() => onSelect(course)}
            className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
          >
            {course.title}
          </h4>

          {/* Subtitle / Description */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {course.subtitle}
          </p>

          {/* Instructor Line */}
          <div className="text-xs text-slate-500 mb-4">
            By <span className="font-medium text-slate-800">{course.instructorName}</span>
          </div>
        </div>

        {/* Card Footer: Progress or Pricing + Action */}
        <div className="pt-4 border-t border-slate-100 mt-2">
          {enrolled ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">Enrolled Progress</span>
                <span className="font-mono tabular-nums font-semibold text-indigo-700">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                onClick={() => onSelect(course)}
                className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                    ${course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                      ${course.originalPrice}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {course.studentCount.toLocaleString()} enrolled
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(course)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  Syllabus
                </button>
                <button
                  onClick={() => onEnrollClick ? onEnrollClick(course) : onSelect(course)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Enroll
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

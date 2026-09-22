import { Link } from 'react-router-dom'
import {
  Award,
  Briefcase,
  Mail,
  Star,
  Users,
} from 'lucide-react'
import type { TutorPublicProfile } from '../../types/tutorProfile'

interface TutorSidebarProps {
  profile: TutorPublicProfile
  isOwner?: boolean
}

export default function TutorSidebar({
  profile,
  isOwner = false,
}: TutorSidebarProps) {
  return (
    <aside className="space-y-5">
      <div>
        <img
          src={
            profile.avatarUrl ??
            `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(profile.handle)}`
          }
          alt={profile.fullName}
          className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-lg shadow-brand/10 ring-1 ring-[#c7d7f5] sm:h-52 sm:w-52"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          {profile.fullName}
        </h1>
        <p className="text-base text-muted">@{profile.handle}</p>

        {isOwner ? (
          <Link
            to="/tutor/complete-profile"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 sm:w-auto"
          >
            Edit Profile
          </Link>
        ) : (
          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:w-auto"
          >
            Book a Lesson
          </button>
        )}
      </div>

      <ul className="space-y-2.5 text-sm text-ink">
        <li className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted" aria-hidden />
          <span>
            <strong>{profile.studentsCount}</strong> students taught
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          <span>
            <strong>{profile.averageRating.toFixed(1)}</strong> ·{' '}
            {profile.reviewsCount} reviews
          </span>
        </li>
        <li className="flex items-center gap-2 text-muted">
          <Mail className="h-4 w-4" aria-hidden />
          <span>Contact available after booking</span>
        </li>
        <li className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted" aria-hidden />
          <span>{profile.yearsOfExperience} years experience</span>
        </li>
      </ul>

      {profile.certifications.length > 0 ? (
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand uppercase">
            <Award className="h-3.5 w-3.5" aria-hidden />
            Certifications
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile.certifications.map((cert) => (
              <span
                key={cert.id}
                className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand"
              >
                {cert.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-bold tracking-wide text-brand uppercase">
          About Me
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink whitespace-pre-wrap">
          {profile.aboutMe}
        </p>
      </div>
    </aside>
  )
}

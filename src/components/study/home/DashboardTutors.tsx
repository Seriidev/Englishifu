import { Link } from 'react-router-dom'
import type { TutorListingCard } from '../../../types/tutorListing'

interface DashboardTutorsProps {
  tutors: TutorListingCard[]
}

export default function DashboardTutors({ tutors }: DashboardTutorsProps) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">
          Tutors
        </h2>
        <Link
          to="/study/tutors"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          See all
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {tutors.length === 0 ? (
          <p className="col-span-4 text-xs text-slate-400">
            Approved teachers will appear here.
          </p>
        ) : (
          tutors.map((tutor) => (
          <Link
            key={tutor.id}
            to={`/study/tutors/${tutor.handle}`}
            className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-1 text-center transition hover:bg-slate-50"
          >
            {tutor.avatarUrl ? (
              <img
                src={tutor.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 sm:h-14 sm:w-14">
                {tutor.fullName.charAt(0)}
              </span>
            )}
            <span className="w-full truncate text-xs font-medium text-slate-700">
              {tutor.fullName.split(/\s+/)[0]}
            </span>
          </Link>
          ))
        )}
      </div>
    </section>
  )
}

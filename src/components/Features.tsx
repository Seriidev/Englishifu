import { featureStats } from '../data/features'

const FEATURES_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80'

export default function Features() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: title + description */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:gap-12">
          <h2 className="max-w-md text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            Why Choose{' '}
            <span className="text-brand">EnglishUp</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-gray-500 lg:pt-1 lg:text-right">
            EnglishUp helps you prepare for TOEFL, match with personal tutors,
            and practice fluency in speaking clubs. We combine mentorship,
            structured courses, and real conversation practice so you can
            progress with confidence.
          </p>
        </div>

        {/* Bottom: photo + stats */}
        <div className="mt-12 grid items-stretch gap-8 md:gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={FEATURES_IMAGE}
              alt="Students collaborating and learning English together"
              width={900}
              height={675}
              className="h-full min-h-[280px] w-full object-cover aspect-[4/3] lg:min-h-full"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
              What Makes Us Different
            </h3>

            <ul className="mt-5 flex flex-col gap-3">
              {featureStats.map((stat) => (
                <li
                  key={stat.title}
                  className="flex items-center gap-4 rounded-xl bg-gray-100 p-4 sm:gap-5 sm:p-5"
                >
                  <p className="shrink-0 text-3xl font-bold text-gray-900 sm:text-4xl">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-brand">{stat.suffix}</span>
                    )}
                  </p>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{stat.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

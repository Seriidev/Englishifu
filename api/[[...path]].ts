import type { VercelRequest, VercelResponse } from '@vercel/node'
import r_admin_consultation_requests from './_routes/admin/consultation-requests'
import r_tutors_submit_for_review from './_routes/tutors/submit-for-review'
import r_notifications_mark_read from './_routes/notifications/mark-read'
import r_speaking_club_sessions_index from './_routes/speaking-club/sessions/index'
import r_consultation_requests from './_routes/consultation-requests'
import r_admin_pending_tutors from './_routes/admin/pending-tutors'
import r_admin_speaking_club from './_routes/admin/speaking-club'
import r_admin_send_message from './_routes/admin/send-message'
import r_tutor_availability_index from './_routes/tutor-availability/index'
import r_admin_referrals from './_routes/admin/referrals'
import r_admin_overview from './_routes/admin/overview'
import r_admin_students from './_routes/admin/students'
import r_score_speaking from './_routes/score-speaking'
import r_student_boosts from './_routes/student-boosts'
import r_admin_banners_index from './_routes/admin/banners/index'
import r_admin_library_index from './_routes/admin/library/index'
import r_auth_register from './_routes/auth/register'
import r_notifications_index from './_routes/notifications/index'
import r_score_writing from './_routes/score-writing'
import r_tutors_resume from './_routes/tutors/resume'
import r_admin_tutors_index from './_routes/admin/tutors/index'
import r_auth_session from './_routes/auth/session'
import r_referrals_me from './_routes/referrals/me'
import r_test_results from './_routes/test-results'
import r_admin_login from './_routes/admin/login'
import r_auth_logout from './_routes/auth/logout'
import r_students_xp from './_routes/students/xp'
import r_unsubscribe from './_routes/unsubscribe'
import r_admin_news_index from './_routes/admin/news/index'
import r_auth_login from './_routes/auth/login'
import r_tutors_me from './_routes/tutors/me'
import r_bookings_index from './_routes/bookings/index'
import r_auth_me from './_routes/auth/me'
import r_banners from './_routes/banners'
import r_library from './_routes/library'
import r_reviews_index from './_routes/reviews/index'
import r_tutors_index from './_routes/tutors/index'
import r_news from './_routes/news'
import r_speaking_club_sessions_id_join from './_routes/speaking-club/sessions/[id]/join'
import r_tutors_id_available_slots from './_routes/tutors/[id]/available-slots'
import r_admin_tutors_id_decision from './_routes/admin/tutors/[id]/decision'
import r_admin_users_id_suspend from './_routes/admin/users/[id]/suspend'
import r_tutor_availability_id from './_routes/tutor-availability/[id]'
import r_bookings_id_complete from './_routes/bookings/[id]/complete'
import r_bookings_id_cancel from './_routes/bookings/[id]/cancel'
import r_tutors_id_students from './_routes/tutors/[id]/students'
import r_tutors_id_reviews from './_routes/tutors/[id]/reviews'
import r_admin_banners_id from './_routes/admin/banners/[id]'
import r_admin_library_id from './_routes/admin/library/[id]'
import r_admin_tutors_id from './_routes/admin/tutors/[id]'
import r_library_pdf_id from './_routes/library-pdf/[id]'
import r_admin_news_id from './_routes/admin/news/[id]'
import r_tutors_id_kpi from './_routes/tutors/[id]/kpi'
import r_users_handle from './_routes/users/[handle]'

type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => unknown | Promise<unknown>

const routes: { re: RegExp; keys: string[]; handler: ApiHandler }[] = [
  { re: new RegExp("^/api/admin/consultation-requests/?$"), keys: [], handler: r_admin_consultation_requests },
  { re: new RegExp("^/api/tutors/submit-for-review/?$"), keys: [], handler: r_tutors_submit_for_review },
  { re: new RegExp("^/api/notifications/mark-read/?$"), keys: [], handler: r_notifications_mark_read },
  { re: new RegExp("^/api/speaking-club/sessions/?$"), keys: [], handler: r_speaking_club_sessions_index },
  { re: new RegExp("^/api/consultation-requests/?$"), keys: [], handler: r_consultation_requests },
  { re: new RegExp("^/api/admin/pending-tutors/?$"), keys: [], handler: r_admin_pending_tutors },
  { re: new RegExp("^/api/admin/speaking-club/?$"), keys: [], handler: r_admin_speaking_club },
  { re: new RegExp("^/api/admin/send-message/?$"), keys: [], handler: r_admin_send_message },
  { re: new RegExp("^/api/tutor-availability/?$"), keys: [], handler: r_tutor_availability_index },
  { re: new RegExp("^/api/admin/referrals/?$"), keys: [], handler: r_admin_referrals },
  { re: new RegExp("^/api/admin/overview/?$"), keys: [], handler: r_admin_overview },
  { re: new RegExp("^/api/admin/students/?$"), keys: [], handler: r_admin_students },
  { re: new RegExp("^/api/score-speaking/?$"), keys: [], handler: r_score_speaking },
  { re: new RegExp("^/api/student-boosts/?$"), keys: [], handler: r_student_boosts },
  { re: new RegExp("^/api/admin/banners/?$"), keys: [], handler: r_admin_banners_index },
  { re: new RegExp("^/api/admin/library/?$"), keys: [], handler: r_admin_library_index },
  { re: new RegExp("^/api/auth/register/?$"), keys: [], handler: r_auth_register },
  { re: new RegExp("^/api/notifications/?$"), keys: [], handler: r_notifications_index },
  { re: new RegExp("^/api/score-writing/?$"), keys: [], handler: r_score_writing },
  { re: new RegExp("^/api/tutors/resume/?$"), keys: [], handler: r_tutors_resume },
  { re: new RegExp("^/api/admin/tutors/?$"), keys: [], handler: r_admin_tutors_index },
  { re: new RegExp("^/api/auth/session/?$"), keys: [], handler: r_auth_session },
  { re: new RegExp("^/api/referrals/me/?$"), keys: [], handler: r_referrals_me },
  { re: new RegExp("^/api/test-results/?$"), keys: [], handler: r_test_results },
  { re: new RegExp("^/api/admin/login/?$"), keys: [], handler: r_admin_login },
  { re: new RegExp("^/api/auth/logout/?$"), keys: [], handler: r_auth_logout },
  { re: new RegExp("^/api/students/xp/?$"), keys: [], handler: r_students_xp },
  { re: new RegExp("^/api/unsubscribe/?$"), keys: [], handler: r_unsubscribe },
  { re: new RegExp("^/api/admin/news/?$"), keys: [], handler: r_admin_news_index },
  { re: new RegExp("^/api/auth/login/?$"), keys: [], handler: r_auth_login },
  { re: new RegExp("^/api/tutors/me/?$"), keys: [], handler: r_tutors_me },
  { re: new RegExp("^/api/bookings/?$"), keys: [], handler: r_bookings_index },
  { re: new RegExp("^/api/auth/me/?$"), keys: [], handler: r_auth_me },
  { re: new RegExp("^/api/banners/?$"), keys: [], handler: r_banners },
  { re: new RegExp("^/api/library/?$"), keys: [], handler: r_library },
  { re: new RegExp("^/api/reviews/?$"), keys: [], handler: r_reviews_index },
  { re: new RegExp("^/api/tutors/?$"), keys: [], handler: r_tutors_index },
  { re: new RegExp("^/api/news/?$"), keys: [], handler: r_news },
  { re: new RegExp("^/api/speaking-club/sessions/([^/]+)/join/?$"), keys: ["id"], handler: r_speaking_club_sessions_id_join },
  { re: new RegExp("^/api/tutors/([^/]+)/available-slots/?$"), keys: ["id"], handler: r_tutors_id_available_slots },
  { re: new RegExp("^/api/admin/tutors/([^/]+)/decision/?$"), keys: ["id"], handler: r_admin_tutors_id_decision },
  { re: new RegExp("^/api/admin/users/([^/]+)/suspend/?$"), keys: ["id"], handler: r_admin_users_id_suspend },
  { re: new RegExp("^/api/tutor-availability/([^/]+)/?$"), keys: ["id"], handler: r_tutor_availability_id },
  { re: new RegExp("^/api/bookings/([^/]+)/complete/?$"), keys: ["id"], handler: r_bookings_id_complete },
  { re: new RegExp("^/api/bookings/([^/]+)/cancel/?$"), keys: ["id"], handler: r_bookings_id_cancel },
  { re: new RegExp("^/api/tutors/([^/]+)/students/?$"), keys: ["id"], handler: r_tutors_id_students },
  { re: new RegExp("^/api/tutors/([^/]+)/reviews/?$"), keys: ["id"], handler: r_tutors_id_reviews },
  { re: new RegExp("^/api/admin/banners/([^/]+)/?$"), keys: ["id"], handler: r_admin_banners_id },
  { re: new RegExp("^/api/admin/library/([^/]+)/?$"), keys: ["id"], handler: r_admin_library_id },
  { re: new RegExp("^/api/admin/tutors/([^/]+)/?$"), keys: ["id"], handler: r_admin_tutors_id },
  { re: new RegExp("^/api/library-pdf/([^/]+)/?$"), keys: ["id"], handler: r_library_pdf_id },
  { re: new RegExp("^/api/admin/news/([^/]+)/?$"), keys: ["id"], handler: r_admin_news_id },
  { re: new RegExp("^/api/tutors/([^/]+)/kpi/?$"), keys: ["id"], handler: r_tutors_id_kpi },
  { re: new RegExp("^/api/users/([^/]+)/?$"), keys: ["handle"], handler: r_users_handle },
]

export const config = {
  api: { bodyParser: false },
  maxDuration: 60,
}

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  const contentType = String(req.headers['content-type'] || '')
  if (contentType.includes('multipart/form-data')) return undefined
  if (req.body !== undefined) return req.body
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return {}
  if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
  return text
}

function pathnameOf(req: VercelRequest): string {
  const url = req.url || '/'
  const pathOnly = url.split('?')[0]
  if (pathOnly.startsWith('/api/')) return pathOnly
  const pathQ = req.query.path
  const segs = Array.isArray(pathQ) ? pathQ : pathQ ? [String(pathQ)] : []
  return segs.length ? `/api/${segs.join('/')}` : '/api'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathname = pathnameOf(req)
  const match = routes.find((route) => route.re.test(pathname))
  if (!match) {
    res.status(404).json({ error: `No API handler for ${pathname}` })
    return
  }

  const captured = pathname.match(match.re)
  const params: Record<string, string> = {}
  match.keys.forEach((key, i) => {
    params[key] = decodeURIComponent(captured?.[i + 1] || '')
  })
  req.query = { ...req.query, ...params }

  const body = await readJsonBody(req)
  if (body !== undefined) req.body = body

  return match.handler(req, res)
}

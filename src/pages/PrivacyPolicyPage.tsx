import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { useLanguage } from '../i18n/LanguageContext'
import type { LangCode } from '../i18n/dictionaries'

type PolicySection = {
  heading: string
  paragraphs: string[]
}

type PolicyCopy = {
  title: string
  updated: string
  intro: string
  sections: PolicySection[]
}

const POLICY: Record<LangCode, PolicyCopy> = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 10 October 2026',
    intro:
      'Englishcore is an English and TOEFL Preparation study platform. This page explains what we collect when you use the site, why we keep it, and how you can ask us to change or delete it.',
    sections: [
      {
        heading: 'Who this applies to',
        paragraphs: [
          'This policy covers the Englishcore website, student Study Place, tutor profiles, practice tests, bookings, and the contact form. It applies to students, tutors, and visitors.',
        ],
      },
      {
        heading: 'Account information',
        paragraphs: [
          'When you create an account we store your name, email, role (student or tutor), and public handle. Your password is stored only as a secure hash. We never keep the password itself and we do not show it back to you.',
          'A student profile can also include a photo, city, headline, short summary, CEFR level from the placement test, and experience points. A tutor profile can include specializations, years of experience, hourly rate, about text, and certificate images. If you turn on a public profile, other people can see the fields you chose to publish.',
        ],
      },
      {
        heading: 'Lessons, practice, and messages',
        paragraphs: [
          'Bookings store the student, tutor, time, and subject so the lesson can be requested, accepted, or cancelled. Reviews, homework, speaking-club joins, and in-app notifications are saved with the account they belong to.',
          'Writing answers and speaking recordings are sent to our scoring service so we can grade the attempt. A recording is used to score that task. We do not sell recordings or essays.',
          'The contact form stores the name, email, phone number, and message you type so we can reply about courses or admissions.',
        ],
      },
      {
        heading: 'Cookies and data on your device',
        paragraphs: [
          'A signed-in session uses an httpOnly cookie named session_token. The browser sends it back so you stay logged in. You can also have a session token in local storage, used so booking requests stay signed in.',
          'On this device we also remember your language, light or dark theme, saved library books, and saved vocabulary. A placement result can sit in session storage until it is written to your account. These items stay in your browser until you clear them or we replace them.',
        ],
      },
      {
        heading: 'How we use this information',
        paragraphs: [
          'We use it to run your account, show practice and progress, match you with tutors, send lesson and platform notifications, score practice, and keep the site secure.',
          'Creating an account includes agreeing to emails about courses, admissions help, and offers. You can ask us to stop those emails. Notifications inside the platform are separate from that mailing list.',
          'We do not sell personal information.',
        ],
      },
      {
        heading: 'Who can see it',
        paragraphs: [
          'You can see your own account. A tutor sees the booking details needed for your lesson. Students see a tutor’s public profile. Admins can see accounts, bookings, and messages so they can run Englishcore.',
          'Scoring of speaking and writing is processed so the result can be returned to you. We do not give your account to advertisers.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'We keep account and lesson records while the account is open. Practice scores and notifications stay so your history still makes sense. If you ask us to close the account, we delete the personal profile or reduce it to what we still need for a booking that already happened.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can edit your profile in the account settings. You can sign out, which ends the session cookie. You can clear language, theme, and saved books in your browser.',
          'To correct or delete your account, use the contact form on the home page and tell us the email on the account. We will reply and remove what we can.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: [
          'Englishcore is meant for students and tutors who create their own account. If a child sent us personal information without a parent’s permission, write to us through the contact form and we will delete it.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          'If this policy changes, we will update the date at the top of this page. The new text applies from that date.',
        ],
      },
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    updated: 'Обновлено: 10 октября 2026',
    intro:
      'Englishcore — платформа для изучения английского и подготовки к TOEFL Preparation. Здесь написано, какие данные мы берём, зачем они нужны и как попросить нас их изменить или удалить.',
    sections: [
      {
        heading: 'Кому это относится',
        paragraphs: [
          'Политика покрывает сайт Englishcore, Study Place студента, профили преподавателей, пробные тесты, бронирования и форму обратной связи. Она действует для студентов, преподавателей и гостей сайта.',
        ],
      },
      {
        heading: 'Данные аккаунта',
        paragraphs: [
          'При регистрации мы сохраняем имя, почту, роль (студент или преподаватель) и публичный адрес профиля. Пароль хранится только в виде защищённого хэша. Сам пароль мы не сохраняем и не показываем.',
          'В профиле студента могут быть фото, город, короткая подпись, уровень CEFR после теста и очки опыта. В профиле преподавателя — специализации, стаж, ставка, текст о себе и изображения сертификатов. Если профиль открыт, другие видят только те поля, которые вы сами опубликовали.',
        ],
      },
      {
        heading: 'Уроки, практика и сообщения',
        paragraphs: [
          'В бронировании сохраняются студент, преподаватель, время и тема, чтобы заявку можно было отправить, принять или отменить. Отзывы, домашка, запись в Speaking Club и уведомления привязаны к аккаунту.',
          'Ответы по письму и записи устной речи отправляются в сервис проверки, чтобы оценить попытку. Запись нужна для оценки этого задания. Мы не продаём записи и сочинения.',
          'Форма на сайте сохраняет имя, почту, телефон и текст, который вы написали, чтобы мы могли ответить про курсы или поступление.',
        ],
      },
      {
        heading: 'Cookie и данные на устройстве',
        paragraphs: [
          'Сессия входа держится на cookie session_token с флагом httpOnly. Браузер отправляет её, чтобы вы оставались в аккаунте. Отдельный токен сессии может лежать в local storage, чтобы запросы на бронь тоже были от вашего имени.',
          'На этом устройстве мы запоминаем язык, светлую или тёмную тему, сохранённые книги и слова. Результат placement-теста может временно лежать в session storage, пока не запишется в аккаунт. Эти данные остаются в браузере, пока вы их не очистите.',
        ],
      },
      {
        heading: 'Зачем мы это используем',
        paragraphs: [
          'Чтобы вести аккаунт, показывать практику и прогресс, связывать вас с преподавателем, присылать уведомления об уроках и платформе, проверять задания и защищать сайт.',
          'Создание аккаунта включает согласие на письма про курсы, помощь с поступлением и предложения. Эти письма можно остановить. Уведомления внутри платформы от этой рассылки не зависят.',
          'Мы не продаём персональные данные.',
        ],
      },
      {
        heading: 'Кто это видит',
        paragraphs: [
          'Свой аккаунт видите вы. Преподаватель видит данные брони, нужные для урока. Студенты видят публичный профиль преподавателя. Администраторы видят аккаунты, брони и сообщения, чтобы вести Englishcore.',
          'Проверка speaking и writing обрабатывается, чтобы вернуть вам результат. Мы не передаём аккаунт рекламным сетям.',
        ],
      },
      {
        heading: 'Сколько мы это храним',
        paragraphs: [
          'Данные аккаунта и уроков хранятся, пока аккаунт открыт. Оценки практики и уведомления остаются, чтобы история не обрывалась. Если вы просите закрыть аккаунт, мы удаляем профиль или оставляем только то, что нужно для уже прошедшей брони.',
        ],
      },
      {
        heading: 'Ваши действия',
        paragraphs: [
          'Профиль можно изменить в настройках. Выход из аккаунта закрывает cookie сессии. Язык, тему и сохранённые книги можно стереть в браузере.',
          'Чтобы исправить или удалить аккаунт, напишите через форму на главной и укажите почту аккаунта. Мы ответим и уберём то, что можем убрать.',
        ],
      },
      {
        heading: 'Дети',
        paragraphs: [
          'Englishcore рассчитан на студентов и преподавателей, которые сами создают аккаунт. Если ребёнок отправил нам данные без согласия родителя, напишите через форму — мы их удалим.',
        ],
      },
      {
        heading: 'Изменения',
        paragraphs: [
          'Если политика изменится, мы обновим дату вверху страницы. Новый текст действует с этой даты.',
        ],
      },
    ],
  },
  tm: {
    title: 'Gizlinlik syýasaty',
    updated: 'Täzelenen senesi: 10 oktýabr 2026',
    intro:
      'Englishcore — iňlisçe we TOEFL Preparation taýýarlygy üçin platforma. Bu sahypada saýt ulanylanda haýsy maglumaty alýandygymyz, näme üçin saklaýandygymyz we ony üýtgetmegi ýa-da pozmagy nädip sorap bilýändigiňiz düşündirilýär.',
    sections: [
      {
        heading: 'Kime degişli',
        paragraphs: [
          'Bu syýasat Englishcore sahypasyna, talyp Study Place-ine, mugallym profillerine, synaglara, bronlara we habarlaşma formuna degişli. Ol talyplara, mugallymlara we myhmanlara degişli.',
        ],
      },
      {
        heading: 'Hasap maglumaty',
        paragraphs: [
          'Hasap döredeniňizde adyňyzy, e-poçtaňyzy, roluňyzy (talyp ýa-da mugallym) we açyk profil salgyňyzy saklaýarys. Parol diňe goragly hash görnüşinde saklanýar. Parolyň özüni saklamaýarys we yzyna görkezmeýäris.',
          'Talyp profilinde surat, şäher, gysga düşündiriş, placement synagyndan soň CEFR derejesi we tejribe ballary bolup biler. Mugallym profilinde ugurlar, tejribe ýyly, sagat bahasy, özüňiz hakda tekst we sertifikat suratlary bolup biler. Profil açyk bolsa, başgalar diňe siziň çap eden meýdanlaryňyzy görýär.',
        ],
      },
      {
        heading: 'Sapaklar, praktika we habarlar',
        paragraphs: [
          'Bronda talyp, mugallym, wagt we tema saklanýar, şonuň üçin haýyşy ibermek, kabul etmek ýa-da ýatyrmak bolýar. Synlar, öý işi, Speaking Club-a goşulmak we programmanyň içindäki habarnamalar hasaba bagly.',
          'Ýazuw jogaplary we gepleşik ýazgylary şol synanyşygy bahalandyrmak üçin barlag hyzmatyna iberilýär. Ýazgy diňe şol tabşyryk üçin ulanylýar. Ýazgylary we düzmeleri satmaýarys.',
          'Habarlaşma formasy adyňyzy, e-poçtaňyzy, telefon belgiňizi we ýazan tekstiňizi saklaýar, şonuň üçin kurslar ýa-da okuwa girmek barada jogap berip bileris.',
        ],
      },
      {
        heading: 'Cookie we enjamdaky maglumat',
        paragraphs: [
          'Giriş sessiýasy session_token atly httpOnly cookie arkaly saklanýar. Brauzer ony yzyna iberýär, şonuň üçin hasapda galýarsyňyz. Bron soraglary üçin sessiýa tokeni local storage-da hem bolup biler.',
          'Bu enjamda dil, ýagty ýa-da garaňky tema, saklanan kitaplar we sözler ýatda saklanýar. Placement netijesi hasaba ýazylýança session storage-da durup biler. Olar brauzerde, siz pozýançaňyz saklanýar.',
        ],
      },
      {
        heading: 'Näme üçin ulanýarys',
        paragraphs: [
          'Hasaby işletmek, praktikany we ösüşi görkezmek, mugallym bilen baglanyşdyrmak, sapak we platforma habarnamalaryny ibermek, tabşyryklary bahalandyrmak we sahypany goramak üçin.',
          'Hasap döretmek kurslar, okuwa girmek kömegi we teklipler barada hatlary kabul etmegi öz içine alýar. Ol hatlary duruzmagy sorap bilersiňiz. Programmanyň içindäki habarnamalar bu hat sanawyndan aýry.',
          'Şahsy maglumaty satmaýarys.',
        ],
      },
      {
        heading: 'Kim görýär',
        paragraphs: [
          'Öz hasabyňyzy siz görýärsiňiz. Mugallym sapak üçin gerek bron maglumatyny görýär. Talyplar mugallymyň açyk profilini görýär. Administratorlar Englishcore-y işletmek üçin hasaplary, bronlary we habarlary görýär.',
          'Speaking we writing barlagy netijäni size gaýtarmak üçin işlenýär. Hasabyňyzy mahabat ulgamlaryna bermeýäris.',
        ],
      },
      {
        heading: 'Näçe wagt saklaýarys',
        paragraphs: [
          'Hasap we sapak ýazgylary hasap açyk wagty saklanýar. Praktika bahalary we habarnamalar taryhyň kesilmezligi üçin galýar. Hasaby ýapmagy sorasaňyz, profili pozýarys ýa-da eýýäm bolan bron üçin gerek bölegini galdyrýarys.',
        ],
      },
      {
        heading: 'Siziň saýlawlaryňyz',
        paragraphs: [
          'Profili sazlamalarda üýtgedip bilersiňiz. Hasapdan çykmak sessiýa cookie-sini ýapýar. Dili, temany we saklanan kitaplary brauzerde pozup bilersiňiz.',
          'Hasaby düzeltmek ýa-da pozmak üçin baş sahypadaky forma arkaly hasapdaky e-poçtaňyzy ýazyň. Jogap bereris we aýryp bilýän maglumaty aýryarys.',
        ],
      },
      {
        heading: 'Çagalar',
        paragraphs: [
          'Englishcore öz hasabyny döredýän talyplar we mugallymlar üçin. Çaga ata-enesiniň rugsady bolmazdan maglumat iberen bolsa, forma arkaly ýazyň — ony pozarys.',
        ],
      },
      {
        heading: 'Üýtgeşmeler',
        paragraphs: [
          'Syýasat üýtgese, bu sahypanyň ýokarsyndaky senäni täzeläris. Täze tekst şol seneden hereket edýär.',
        ],
      },
    ],
  },
}

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage()
  const copy = POLICY[lang]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="landing-shell min-h-svh">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:px-6 sm:pt-32 sm:pb-16">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-3 text-sm text-muted">{copy.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-ink/80">{copy.intro}</p>

        <div className="mt-10 space-y-8">
          {copy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink/80">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm leading-relaxed text-ink/80">
          <Link to="/#contact" className="font-semibold text-brand hover:underline">
            {lang === 'ru'
              ? 'Написать через форму'
              : lang === 'tm'
                ? 'Forma arkaly ýazmak'
                : 'Contact us'}
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}

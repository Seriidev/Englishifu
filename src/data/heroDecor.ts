import type { LucideIcon } from 'lucide-react'
import { BookOpen, Briefcase, Film, Globe, MessageCircle } from 'lucide-react'

export interface HeroDecorCard {
  id: string
  image: string
  alt: string
  label: string
  icon: LucideIcon
  frameClass: string
  rotateClass: string
}

export const heroDecorCards: HeroDecorCard[] = [
  {
    id: 'travel',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
    alt: 'Travel and explore the world',
    label: 'Travel',
    icon: Globe,
    frameClass: 'bg-brand-light',
    rotateClass: '-rotate-[3deg]',
  },
  {
    id: 'work',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80',
    alt: 'Work and career meetings',
    label: 'Work',
    icon: Briefcase,
    frameClass: 'bg-blue-50',
    rotateClass: 'rotate-[2deg]',
  },
  {
    id: 'original',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    alt: 'Watch films in the original language',
    label: 'See the original',
    icon: Film,
    frameClass: 'bg-[#e8efff]',
    rotateClass: '-rotate-[1deg]',
  },
  {
    id: 'speak',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80',
    alt: 'Speak English freely',
    label: 'Speak freely',
    icon: MessageCircle,
    frameClass: 'bg-brand-light',
    rotateClass: 'rotate-[3deg]',
  },
  {
    id: 'develop',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80',
    alt: 'Develop yourself through reading',
    label: 'Develop yourself',
    icon: BookOpen,
    frameClass: 'bg-blue-50',
    rotateClass: '-rotate-[2deg]',
  },
]

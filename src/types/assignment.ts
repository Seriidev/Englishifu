export type AssignmentKind = 'task' | 'homework'
export type AssignmentPriority = 'low' | 'normal' | 'urgent'
export type AssignmentStatus = 'todo' | 'in_progress' | 'completed'

export interface AssignmentRow {
  id: number
  kind: AssignmentKind
  title: string
  description: string
  dueAt: string | null
  priority: AssignmentPriority
  status: AssignmentStatus
  assignedBy: string
  assignedTo: string
  assigneeId: string
  createdAt: string | null
}

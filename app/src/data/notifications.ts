/* Sample notifications tied to seed contracts, from preview/new-contract-flow.html. */
import type { StatusKind } from '@/data/contracts'

export type Notification = {
  /** Contract title and party, used to open the contract */
  t: string
  p: string
  icon: 'check' | 'user' | 'clock' | 'x'
  kind: Extract<StatusKind, 'success' | 'warning' | 'error'>
  /** Message before and after the bold name */
  pre: string
  bold: string
  post: string
  when: string
  read: boolean
}

export const seedNotifications = (): Notification[] => [
  { t: 'Consulting agreement', p: 'Mia Schmid', icon: 'check', kind: 'success', pre: '', bold: 'Mia Schmid', post: ' signed the consulting agreement. 1 of 3 signed.', when: '25 min ago', read: false },
  { t: 'Internship contract', p: 'Elena Frei', icon: 'user', kind: 'warning', pre: 'The internship contract for ', bold: 'Elena Frei', post: ' is waiting for Sara Meier’s approval.', when: '1 hour ago', read: false },
  { t: 'NDA', p: 'Luca Frei', icon: 'clock', kind: 'warning', pre: 'The NDA with ', bold: 'Luca Frei', post: ' is due tomorrow. No one has signed yet.', when: '3 hours ago', read: false },
  { t: 'Employment contract', p: 'David Graf', icon: 'check', kind: 'success', pre: 'The employment contract with ', bold: 'David Graf', post: ' is fully signed.', when: '3 Nov', read: true },
  { t: 'Employment contract', p: 'Ben Huber', icon: 'x', kind: 'error', pre: '', bold: 'Ben Huber', post: ' declined the employment contract. It was cancelled for everyone.', when: '1 Nov', read: true },
  { t: 'NDA', p: 'Globex GmbH', icon: 'clock', kind: 'error', pre: 'The NDA with ', bold: 'Globex GmbH', post: ' expired. 1 of 2 signed.', when: '31 Oct', read: true },
]

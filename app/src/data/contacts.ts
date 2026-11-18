/* Saved people and companies, ported from preview/new-contract-flow.html. */
import anna_weber from '@/assets/people/anna-weber.jpg'
import elena_frei from '@/assets/people/elena-frei.jpg'
import erik_lund from '@/assets/people/erik-lund.jpg'
import jonas_keller from '@/assets/people/jonas-keller.jpg'
import julia_graf from '@/assets/people/julia-graf.jpg'
import lea_fischer from '@/assets/people/lea-fischer.jpg'
import luca_rossi from '@/assets/people/luca-rossi.jpg'
import marco_huber from '@/assets/people/marco-huber.jpg'
import mia_schmid from '@/assets/people/mia-schmid.jpg'
import nina_berg from '@/assets/people/nina-berg.jpg'
import noah_brunner from '@/assets/people/noah-brunner.jpg'
import paul_graf from '@/assets/people/paul-graf.jpg'
import sara_meier from '@/assets/people/sara-meier.jpg'
import tim_baumann from '@/assets/people/tim-baumann.jpg'

export type Company = {
  id: string
  name: string
  uid: string
  addr: string
  city: string
  form: string
  lang: string
  own?: boolean
  used: string
}

export type Person = {
  name: string
  email: string
  /** Company id, or '' for none */
  co: string
  role: string
  colleague: boolean
  contracts: number
  used: string
  /** Signs for the company */
  signs: boolean
  addr?: string
}

export const COMPANIES: Company[] = [
  { id: 'selise', name: 'SELISE AG', uid: 'CHE-109.876.543', addr: 'Seestrasse 1, 8002 Zurich', city: 'Zurich', form: 'Stock corporation (AG)', lang: 'German', own: true, used: 'Today' },
  { id: 'bluewave', name: 'Bluewave AG', uid: 'CHE-245.118.902', addr: 'Hardturmstrasse 161, 8005 Zurich', city: 'Zurich', form: 'Stock corporation (AG)', lang: 'German', used: '2 Nov' },
  { id: 'nordlicht', name: 'Nordlicht Ventures AG', uid: 'CHE-150.682.447', addr: 'Bundesplatz 14, 6300 Zug', city: 'Zug', form: 'Stock corporation (AG)', lang: 'German', used: '8 Nov' },
  { id: 'helix', name: 'Helix Labs GmbH', uid: 'CHE-276.540.318', addr: 'Steinenvorstadt 53, 4051 Basel', city: 'Basel', form: 'Limited liability company (GmbH)', lang: 'German', used: '7 Nov' },
  { id: 'schmid', name: 'Schmid Consulting GmbH', uid: 'CHE-311.420.776', addr: 'Bahnhofplatz 4, 3011 Bern', city: 'Bern', form: 'Limited liability company (GmbH)', lang: 'German', used: '4 Nov' },
  { id: 'rossi', name: 'Rossi Design', uid: 'CHE-402.913.115', addr: 'Via Nassa 21, 6900 Lugano', city: 'Lugano', form: 'Sole proprietorship', lang: 'Italian', used: '6 Nov' },
  { id: 'cloudhost', name: 'Cloudhost GmbH', uid: 'CHE-188.736.204', addr: 'Europaallee 41, 8004 Zurich', city: 'Zurich', form: 'Limited liability company (GmbH)', lang: 'German', used: '28 Oct' },
]

const ROWS: [string, string, string, string, number, number, string, number?][] = [
  ['Lea Fischer', 'lea.fischer@selise.ch', 'selise', 'HR manager', 1, 14, 'Today', 1],
  ['Sara Meier', 'sara.meier@selise.ch', 'selise', 'Admin manager', 1, 9, 'Yesterday', 1],
  ['Tim Baumann', 'tim.baumann@selise.ch', 'selise', 'Head of legal', 1, 6, '3 Nov', 1],
  ['Noah Brunner', 'noah.brunner@gmail.com', '', 'Employee', 0, 2, 'Today'],
  ['Anna Weber', 'anna.weber@bluewave.ch', 'bluewave', 'Legal counsel', 0, 2, '3 Nov', 1],
  ['Marco Huber', 'marco.huber@bluewave.ch', 'bluewave', 'CEO', 0, 1, '12 Sep', 1],
  ['Julia Graf', 'julia.graf@bluewave.ch', 'bluewave', 'Office manager', 0, 0, 'Never'],
  ['Mia Schmid', 'mia@schmid-consulting.ch', 'schmid', 'Consultant', 0, 1, '4 Nov', 1],
  ['Luca Rossi', 'hello@rossi-design.ch', 'rossi', 'Freelance designer', 0, 1, '6 Nov', 1],
  ['Jonas Keller', 'jonas.keller@gmail.com', '', 'Employee', 0, 1, '5 Nov'],
  ['Elena Frei', 'elena.frei@outlook.com', '', 'Intern', 0, 1, '1 Nov'],
  ['Erik Lund', 'erik.lund@nordlicht.vc', 'nordlicht', 'Partner', 0, 1, '8 Nov', 1],
  ['Nina Berg', 'nina.berg@helixlabs.ch', 'helix', 'COO', 0, 1, '7 Nov', 1],
  ['Paul Graf', 'paul.graf@cloudhost.ch', 'cloudhost', 'Data protection officer', 0, 1, '28 Oct', 1],
]

const ADDRESSES: Record<string, string> = {
  'Noah Brunner': 'Bahnhofstrasse 12, 8001 Zurich',
  'Jonas Keller': 'Seefeldstrasse 88, 8008 Zurich',
  'Elena Frei': 'Langstrasse 140, 8004 Zurich',
}

export const seedPeople = (): Person[] =>
  ROWS.map(([name, email, co, role, colleague, contracts, used, signs]) => ({
    name,
    email,
    co,
    role,
    colleague: !!colleague,
    contracts,
    used,
    signs: !!signs,
    addr: ADDRESSES[name],
  }))

export const PHOTOS: Record<string, string> = {
  'Anna Weber': anna_weber,
  'Elena Frei': elena_frei,
  'Erik Lund': erik_lund,
  'Jonas Keller': jonas_keller,
  'Julia Graf': julia_graf,
  'Lea Fischer': lea_fischer,
  'Luca Rossi': luca_rossi,
  'Marco Huber': marco_huber,
  'Mia Schmid': mia_schmid,
  'Nina Berg': nina_berg,
  'Noah Brunner': noah_brunner,
  'Paul Graf': paul_graf,
  'Sara Meier': sara_meier,
  'Tim Baumann': tim_baumann,
}

export const coOf = (id: string) => COMPANIES.find((c) => c.id === id)

/** Two-letter initials for people without a photo. */
export const initials = (n: string) =>
  (n || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join('')

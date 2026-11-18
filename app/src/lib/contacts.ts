/* Contacts helpers, ported from preview/new-contract-flow.html. */
import type { Company } from '@/data/contacts'
import type { Contract } from '@/data/contracts'
import { go, state, update } from '@/lib/store'

export function addContact(co = '') {
  update((s) => {
    s.nc = { first: '', last: '', email: '', co, role: '', colleague: co === 'selise', err: {} }
    s.dialog = 'contact'
  })
}

export const peopleAt = (id: string) => state.people.filter((p) => p.co === id)

/** Contracts made with a company: its name or one of its people appears in the contract. */
export function coContracts(co: Company): Contract[] {
  if (co.own) return []
  return state.contracts.filter((c) => {
    const h = ((c.party || '') + ' ' + JSON.stringify(c.values || {})).toLowerCase()
    return h.includes(co.name.toLowerCase()) || peopleAt(co.id).some((p) => h.includes(p.name.toLowerCase()))
  })
}

export function openCompany(id: string) {
  update((s) => (s.co.sel = id))
  go('company')
}


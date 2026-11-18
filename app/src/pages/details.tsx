import { Bell, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LinkButton, PageHeading, Panel, PanelHead } from '@/components/common/page'
import { SignerRow } from '@/components/signer-row'
import { StatusBadge, StatusChip } from '@/components/status-chip'
import { ME, isLive, partyName, tplOf, type SignerState, type StatusKind } from '@/data/contracts'
import { continueContract, go, openDialog, runAction, useApp } from '@/lib/store'

/* Port of V.details in preview/new-contract-flow.html. */

const ST: Record<SignerState, [string, StatusKind]> = {
  waiting: ['Waiting', 'neutral'],
  sent: ['Email sent', 'info'],
  opened: ['Opened, not signed', 'info'],
  signed: ['Signed', 'success'],
  declined: ['Declined', 'error'],
}
const AP: Record<'pending' | 'approved' | 'rejected', [string, StatusKind]> = {
  pending: ['Waiting for approval', 'warning'],
  approved: ['Approved', 'success'],
  rejected: ['Not approved', 'error'],
}
const ORD = ['1st', '2nd', '3rd', '4th', '5th']

export function Details() {
  const S = useApp()
  const c = S.detail!

  if (c.seed && !c.signers.length)
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeading
          title={`${c.title}, ${c.party}`}
          description="This contract is sample data. Create a new contract to try the whole flow."
          actions={
            <Button variant="outline" className="h-10 px-4 font-medium" onClick={() => go('contracts')}>
              Back to contracts
            </Button>
          }
        />
        <Panel>
          <PanelHead title="Status">
            <StatusBadge status={c.status} />
          </PanelHead>
          <p className="text-sm text-subtle-foreground">{c.note || 'Updated ' + c.updated}</p>
        </Panel>
      </div>
    )

  const signed = c.signers.filter((s) => s.state === 'signed').length
  const canCancel = isLive(c) && signed === 0
  const again = c.status === 'Declined' || c.status === 'Expired'

  return (
    <div className="flex flex-col gap-6 p-4 pb-32 md:p-6 md:pb-32">
      <PageHeading
        title={
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-heading">
              {c.title}, {partyName(c)}
            </h1>
            <StatusChip contract={c} />
          </div>
        }
        actions={
          (canCancel || again) && (
            <>
              {canCancel && (
                <Button variant="outline" className="h-10 px-4 font-medium" onClick={() => openDialog('cancel')}>
                  Cancel contract
                </Button>
              )}
              {again && (
                <Button className="h-10 px-4 font-medium" onClick={() => runAction(c.status === 'Declined' ? 'review-again' : 'resend', c.id)}>
                  {c.status === 'Declined' ? 'Review and send again' : 'Resend'}
                </Button>
              )}
            </>
          )
        }
      >
        <div className="mb-1 text-xs text-muted-foreground">Contracts / All contracts</div>
      </PageHeading>

      {c.status === 'Draft' && c.rejected && c.approver && (
        <div role="alert" className="flex items-start gap-3 rounded-md border border-danger-foreground/30 bg-danger p-4 text-sm text-foreground">
          <X className="mt-0.5 size-4 flex-none text-danger-foreground" />
          <div>
            <b className="font-medium">{c.approver.name} did not approve.</b> “{c.rejected}” The contract is back in Drafts.{' '}
            <LinkButton onClick={() => continueContract(c.id)}>Edit the contract</LinkButton>
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHead title="Signing progress" />
            <div className="flex flex-col gap-2">
              <span className="text-sm text-subtle-foreground">
                {signed} of {c.signers.length} signed
              </span>
              <Progress value={(signed / Math.max(1, c.signers.length)) * 100} aria-label={`${signed} of ${c.signers.length} signed`} />
            </div>
            <div className="flex flex-col divide-y divide-border-subtle">
              {c.approver && c.needsApproval && c.approver.state && (
                <SignerRow label="Approval" person={c.approver} state={AP[c.approver.state][0]} kind={AP[c.approver.state][1]} when={c.approver.when} />
              )}
              {c.signers.map((s, i) => {
                const [st, k] = ST[s.state ?? 'waiting']
                return <SignerRow key={i} label={c.order ? `Signs ${ORD[i] ?? i + 1 + 'th'}` : 'Signs'} person={s} state={st} kind={k} when={s.when} />
              })}
            </div>
          </Panel>
          <Panel>
            <PanelHead title="Activity" />
            <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-sm">
              {c.activity
                .slice()
                .reverse()
                .map(([t, e], i) => (
                  <div key={i} className="contents">
                    <dt className="text-muted-foreground tabular-nums">{t}</dt>
                    <dd className="text-foreground">{e}</dd>
                  </div>
                ))}
            </dl>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHead title="Contract">
              <LinkButton onClick={() => openDialog('doc')}>Open contract</LinkButton>
            </PanelHead>
            <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Template</dt>
              <dd>{c.blank ? 'Blank contract' : tplOf(c).name}</dd>
              <dt className="text-muted-foreground">Sender</dt>
              <dd>{ME.name}</dd>
              <dt className="text-muted-foreground">Sent</dt>
              <dd>{c.sentAt}</dd>
            </dl>
          </Panel>
          <Panel>
            <PanelHead title="Follow-up" />
            {isLive(c) && (c.due || c.lastRemind) && (
              <div className="flex flex-col gap-2">
                {c.due && (
                  <span className="flex items-center gap-2 text-sm text-alert-foreground">
                    <Clock className="size-4" />
                    Signing {c.due.toLowerCase()}
                  </span>
                )}
                {c.lastRemind && (
                  <span className="flex items-center gap-2 text-sm text-alert-foreground">
                    <Bell className="size-4" />
                    Last reminder sent {c.lastRemind}
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-subtle-foreground">SELISE Signature sends reminders to whoever has not signed.</p>
            <p className="text-sm text-subtle-foreground">
              {signed
                ? 'Cancelling is no longer possible because someone has signed.'
                : 'You can cancel the contract until the first signatory signs. Everyone gets an email that it has been cancelled.'}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}

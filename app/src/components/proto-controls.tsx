import { simulate, useApp } from '@/lib/store'

/* Prototype only: stands in for what approvers and signatories do in SELISE Signature. */
export function ProtoControls() {
  const S = useApp()
  const c = S.detail
  if (S.view !== 'details' || !c || c.seed || S.dialog || !['Waiting for approval', 'Out for signature'].includes(c.status)) return null
  const next = c.signers.find((s) => s.state !== 'signed')
  const btn = 'h-7 rounded-md border border-current px-2.5 text-xs hover:bg-[color-mix(in_srgb,currentColor_18%,transparent)]'
  return (
    <div role="region" aria-label="Prototype controls" className="fixed bottom-4 left-4 z-10 flex max-w-[min(620px,calc(100%-32px))] flex-col gap-2 rounded-xl bg-inverse p-3 text-inverse-foreground shadow-[0_12px_32px_#10182833] md:left-[280px]">
      <b className="text-xs font-medium opacity-80">Prototype only: act as the approver or signatories in SELISE Signature</b>
      <div className="flex flex-wrap gap-1.5">
        {c.status === 'Waiting for approval' && c.approver && (
          <>
            <button type="button" className={btn} onClick={() => simulate('approve')}>
              {c.approver.name} approves
            </button>
            <button type="button" className={btn} onClick={() => simulate('reject')}>
              {c.approver.name} rejects
            </button>
          </>
        )}
        {c.status === 'Out for signature' && next && (
          <>
            <button type="button" className={btn} onClick={() => simulate('open')}>
              {next.name} opens
            </button>
            <button type="button" className={btn} onClick={() => simulate('sign')}>
              {next.name} signs
            </button>
            <button type="button" className={btn} onClick={() => simulate('decline')}>
              {next.name} declines
            </button>
            <button type="button" className={btn} onClick={() => simulate('expire')}>
              Deadline passes
            </button>
          </>
        )}
      </div>
    </div>
  )
}

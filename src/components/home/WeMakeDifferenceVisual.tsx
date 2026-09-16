import Image from 'next/image'

const CHAMFER_STYLE: React.CSSProperties = {
  clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
}

export function WeMakeDifferenceVisual() {
  return (
    <div className="border border-line bg-white overflow-hidden" style={CHAMFER_STYLE}>
      <div className="relative w-full h-[340px]">
        <Image src="/images/home/we-make-difference.png" alt="" fill className="object-cover" />
      </div>
    </div>
  )
}

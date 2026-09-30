declare module 'lottie-web/build/player/lottie_svg' {
  interface LottieAnimationItem {
    play: () => void
    playSegments: (segments: [number, number], force: boolean) => void
    destroy: () => void
    addEventListener: (name: string, callback: () => void) => void
    removeEventListener: (name: string, callback: () => void) => void
  }

  interface LottieSvgPlayer {
    loadAnimation: (options: {
      container: Element
      renderer: 'svg'
      loop?: boolean
      autoplay?: boolean
      animationData: object
    }) => LottieAnimationItem
  }

  const lottie: LottieSvgPlayer
  export default lottie
}

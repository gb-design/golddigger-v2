import { gsap, ScrollTrigger } from './gsap-init'

function splitWords(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || ''
  element.innerHTML = ''
  const words: HTMLSpanElement[] = []

  const parts = text.split(/(\s+)/)
  parts.forEach((part) => {
    if (/^\s+$/.test(part)) {
      element.appendChild(document.createTextNode(part))
    } else if (part) {
      const span = document.createElement('span')
      span.className = 'word'
      span.textContent = part
      span.style.setProperty('--progress', '0%')
      element.appendChild(span)
      words.push(span)
    }
  })

  return words
}

export function initScrollText() {
  document.querySelectorAll<HTMLElement>('.story-scroll-text').forEach((el) => {
    if (el.dataset.initialized) return
    el.dataset.initialized = 'true'

    const words = splitWords(el)

    // Highlight "Gold Digger"
    for (let i = 0; i < words.length - 1; i++) {
      const current = words[i].textContent?.trim().toLowerCase()
      const next = words[i + 1].textContent?.trim().toLowerCase()
      if (current === 'gold' && next?.startsWith('digger')) {
        words[i].classList.add('gd-highlight')
        words[i + 1].classList.add('gd-highlight')
      }
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top center)',
        end: 'clamp(bottom center)',
        scrub: 1,
      },
    })

    tl.fromTo(
      words,
      { '--progress': '0%' },
      { '--progress': '100%', stagger: 0.5, ease: 'none' }
    )
  })
}

document.addEventListener('DOMContentLoaded', initScrollText)

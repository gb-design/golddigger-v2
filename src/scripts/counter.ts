function initCounters() {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]')

  const startCount = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count || '0')
    let current = 0
    const duration = 3000
    const steps = 60
    const increment = target / steps

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      el.textContent =
        target % 1 === 0 ? String(Math.floor(current)) : current.toFixed(1)
    }, duration / steps)
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCount(entry.target as HTMLElement)
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 }
  )

  counters.forEach((counter) => observer.observe(counter))
}

document.addEventListener('DOMContentLoaded', initCounters)

import { useEffect } from 'react'

function setupForms() {
  const emailjs = window.emailjs
  if (emailjs && !window._emailjsInited) {
    emailjs.init({ publicKey: 'UyDn_9uga43SkKTFK' })
    window._emailjsInited = true
  }

  const onSubmit = async (event) => {
    const form = event.target
    if (!(form instanceof HTMLFormElement) || !form.matches('#contactForm, #subscribeForm')) return
    event.preventDefault()
    if (!form.checkValidity()) return form.reportValidity()
    if (form.querySelector('[name="_gotcha"]')?.value) return

    const isContact = form.id === 'contactForm'
    const response = document.getElementById(isContact ? 'formResponse' : 'subscribeResponse')
    const button = isContact ? document.getElementById('contactSubmitBtn') : form.querySelector('[type="submit"]')
    const previous = button?.innerHTML

    if (button) {
      button.disabled = true
      button.innerHTML = '<span>Sending…</span>'
    }

    const email = form.querySelector('#email, #subscribeEmail')?.value.trim()
    const name = form.querySelector('#name')?.value.trim()
    const message = form.querySelector('#message')?.value.trim()
    const template = isContact ? 'template_3kq71rr' : 'template_saa1vp5'
    const payload = isContact
      ? { name, email, message, from_name: name, reply_to: email, message_html: message, source_url: location.href }
      : { email, reply_to: email, source_url: location.href }

    try {
      if (!emailjs) throw new Error('EmailJS failed to load')
      await emailjs.send('service_dbj7rap', template, payload)
      if (response) response.textContent = isContact
        ? '✅ Your message has been sent. We’ll get back to you soon.'
        : '✅ Email sent! We will contact you as soon as possible.'
      form.reset()
    } catch (error) {
      console.error(error)
      if (response) response.innerHTML = '❌ Couldn’t send this right now. Please try again later or email us at <a href="mailto:contact@blackroomprod.com">contact@blackroomprod.com</a>.'
    } finally {
      if (button) {
        button.disabled = false
        button.innerHTML = previous
      }
    }
  }

  document.addEventListener('submit', onSubmit)
  return () => document.removeEventListener('submit', onSubmit)
}

export default function useLegacyRuntime(title) {
  useEffect(() => {
    document.title = title
    window.scrollTo(0, 0)

    const script = document.createElement('script')
    script.src = '/js/main.js'
    script.dataset.reactRuntime = 'true'
    document.body.appendChild(script)
    const removeFormHandlers = setupForms()

    return () => {
      script.remove()
      removeFormHandlers()
    }
  }, [title])
}

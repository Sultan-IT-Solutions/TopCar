self.addEventListener('push', function (event) {
  const data = event.data?.json() || {}

  const options = {
    body: data.body || 'You have a new notification from TopCar.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'TopCar', options)
  )
})

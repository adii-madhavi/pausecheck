export const examples = [
  {
    id: 'delivery', label: 'Delivery fee', type: 'Text message',
    description: 'An unexpected payment request',
    message: 'Parcel notice: Your package is on hold. Pay the delivery fee within 30 minutes to release your parcel. Enter your card details at https://parcel-help.example/redelivery or your package will be returned.',
  },
  {
    id: 'friend', label: 'A friend needs help', type: 'Chat message',
    description: 'A familiar name, an unusual favor',
    message: "Hey, it's me. My phone broke so I'm using a new number. I need you to buy gift cards right now and send me the codes. Don't call, I'm in a meeting. Keep this between us, please.",
  },
  {
    id: 'reminder', label: 'Appointment reminder', type: 'Text message',
    description: 'An everyday notification',
    message: 'Hello Morgan, this is a reminder of your appointment at Example Studio on Tuesday at 10:30 AM. If you need to change the time, use the contact details on your original booking confirmation. Thank you.',
  },
] as const;

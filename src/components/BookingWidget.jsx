import { useState, useEffect } from 'react'

export default function BookingWidget({ property, onBookingComplete }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const nights = calculateNights()
  const subtotal = property.pricePerNight * nights
  const serviceFee = Math.round(subtotal * 0.12)
  const cleaningFee = 2000
  const tax = Math.round(subtotal * 0.13)
  const total = subtotal + serviceFee + cleaningFee + tax

  const handleBooking = () => {
    if (!checkIn || !checkOut || nights === 0) {
      alert('Please select valid check-in and check-out dates')
      return
    }
    if (guests > property.maxGuests) {
      alert(`Maximum ${property.maxGuests} guests allowed`)
      return
    }

    // Generate confirmation number
    const confNum = 'AB' + Math.random().toString(36).substr(2, 9).toUpperCase()
    setConfirmationNumber(confNum)
    setShowConfirmation(true)

    // Store booking in localStorage
    const booking = {
      confirmationNumber: confNum,
      property: property.name,
      location: property.location,
      checkIn,
      checkOut,
      nights,
      guests,
      total,
      date: new Date().toISOString()
    }
    localStorage.setItem('airbnb_booking_' + confNum, JSON.stringify(booking))
  }

  if (showConfirmation) {
    return (
      <div className="bg-surface-card rounded-2xl p-6 sm:p-8 border border-primary/30">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">Booking Confirmed!</h3>
          <div className="bg-surface-dark rounded-xl p-4 space-y-2">
            <p className="text-sm text-secondary-grey">Confirmation Number</p>
            <p className="text-xl font-bold text-primary font-mono">{confirmationNumber}</p>
          </div>
          <div className="text-left space-y-3 bg-surface-dark rounded-xl p-4">
            <div>
              <p className="text-xs text-secondary-grey">Property</p>
              <p className="text-white font-medium">{property.name}</p>
              <p className="text-sm text-secondary-grey">{property.location}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-secondary-grey">Check-in</p>
                <p className="text-white font-medium">{new Date(checkIn).toLocaleDateString()}</p>
                <p className="text-xs text-secondary-grey">{property.checkIn}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-grey">Check-out</p>
                <p className="text-white font-medium">{new Date(checkOut).toLocaleDateString()}</p>
                <p className="text-xs text-secondary-grey">{property.checkOut}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-secondary-grey">Guests</p>
              <p className="text-white font-medium">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-secondary-grey">Total</p>
              <p className="text-xl font-bold text-primary">{property.currency} {total.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-2 pt-4">
            <p className="text-sm text-secondary-grey">Host Contact</p>
            <p className="text-white">{property.host.name}</p>
            <a href={`tel:${property.host.contact}`} className="text-primary hover:text-primary-glow text-sm">
              {property.host.contact}
            </a>
          </div>
          <button
            onClick={() => {
              setShowConfirmation(false)
              setCheckIn('')
              setCheckOut('')
              setGuests(1)
              if (onBookingComplete) onBookingComplete()
            }}
            className="w-full py-3 bg-primary hover:bg-primary-glow text-white rounded-full font-bold transition-all"
          >
            Book Another Property
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card rounded-2xl p-6 border border-white/5 sticky top-4">
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">
            {property.currency} {property.pricePerNight.toLocaleString()}
          </span>
          <span className="text-secondary-grey">/ night</span>
        </div>

        {/* Date Picker */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-white mb-1 block">Check-in</label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 bg-surface-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white mb-1 block">Check-out</label>
            <input
              type="date"
              min={checkIn || tomorrow}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 bg-surface-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="text-xs font-semibold text-white mb-1 block">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2 bg-surface-dark border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
          >
            {[...Array(property.maxGuests)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>

        {/* Price Breakdown */}
        {nights > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-grey">
                {property.currency} {property.pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="text-white">{property.currency} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-grey">Service fee</span>
              <span className="text-white">{property.currency} {serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-grey">Cleaning fee</span>
              <span className="text-white">{property.currency} {cleaningFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-grey">Tax</span>
              <span className="text-white">{property.currency} {tax.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between">
              <span className="font-bold text-white">Total</span>
              <span className="font-bold text-primary text-lg">{property.currency} {total.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Reserve Button */}
        <button
          onClick={handleBooking}
          disabled={!checkIn || !checkOut || nights === 0}
          className="w-full py-4 bg-primary hover:bg-primary-glow disabled:bg-white/5 disabled:text-secondary-grey disabled:cursor-not-allowed text-white rounded-full font-bold transition-all shadow-[0_0_20px_-5px_rgba(91,140,90,0.3)] hover:scale-105"
        >
          Reserve Now
        </button>

        <p className="text-xs text-center text-secondary-grey">
          You won't be charged yet
        </p>
      </div>
    </div>
  )
}


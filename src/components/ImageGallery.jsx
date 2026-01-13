import { useState } from 'react'

export default function ImageGallery({ images, propertyName }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) return null

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Photos</h3>
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="text-sm text-primary hover:text-primary-glow transition-colors"
          >
            View all {images.length} photos
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedIndex(idx)
                setIsLightboxOpen(true)
              }}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-surface-dark"
            >
              <img
                src={img}
                alt={`${propertyName} - Image ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';
                }}
              />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold">+{images.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <img
                src={images[selectedIndex]}
                alt={`${propertyName} - Image ${selectedIndex + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
                }}
              />
            </div>

            {/* Image Counter */}
            <div className="text-center text-white mb-4">
              <span className="text-sm">
                {selectedIndex + 1} of {images.length}
              </span>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(idx)
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === selectedIndex
                      ? 'border-primary scale-110'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}


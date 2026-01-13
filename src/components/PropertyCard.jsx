export default function PropertyCard({ property, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(property)}
      className={`group relative bg-surface-card rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-primary/50 shadow-lg shadow-primary/20 scale-[1.02]' 
          : 'border-white/5 hover:border-primary/30'
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-surface-dark">
        <img
          src={property.thumbnail}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';
          }}
        />
        {property.host.isSuperhost && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-black">
            ⭐ Superhost
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white font-medium flex items-center gap-1">
          <span>⭐</span>
          <span>{property.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
              {property.name}
            </h3>
            <p className="text-xs text-secondary-grey truncate">{property.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <p className="text-sm font-bold text-white">
              {property.currency} {property.pricePerNight.toLocaleString()}
              <span className="text-xs font-normal text-secondary-grey"> / night</span>
            </p>
            <p className="text-xs text-secondary-grey">{property.reviews} reviews</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary-grey">
            <span>⭐</span>
            <span>{property.rating}</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-3 text-xs text-secondary-grey pt-1">
          <span>{property.bedrooms} bed</span>
          <span>•</span>
          <span>{property.bathrooms} bath</span>
          <span>•</span>
          <span>{property.maxGuests} guests</span>
        </div>
      </div>
    </div>
  )
}


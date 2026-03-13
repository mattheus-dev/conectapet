const SPECIES_CONFIG = {
  Cachorro: {
    label: 'Cachorro',
    emoji: '🐶',
    badge: 'bg-blue-100 text-blue-700',
  },
  Gato: {
    label: 'Gato',
    emoji: '🐱',
    badge: 'bg-violet-100 text-violet-700',
  },
  Outro: {
    label: 'Outro',
    emoji: '🐾',
    badge: 'bg-amber-100 text-amber-700',
  },
}

const PLACEHOLDER_IMAGES = {
  Cachorro: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
  Gato: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  Outro: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=300&fit=crop',
}

export default function PetCard({ pet, onAdopt }) {
  const species = SPECIES_CONFIG[pet.especie] ?? SPECIES_CONFIG['Outro']
  const imageUrl = pet.url_imagem || PLACEHOLDER_IMAGES[pet.especie] || PLACEHOLDER_IMAGES['Outro']
  const ageLabel = pet.idade === 1 ? '1 ano' : `${pet.idade} anos`

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={`Foto de ${pet.nome}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGES[pet.especie] ?? PLACEHOLDER_IMAGES['Outro']
          }}
        />
        {/* Badge de espécie */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${species.badge}`}
        >
          <span>{species.emoji}</span>
          {species.label}
        </span>

        {/* Badge de status */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          {pet.status}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{pet.nome}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {species.emoji} {species.label} · {ageLabel}
          </p>
        </div>

        {pet.descricao ? (
          <p className="text-sm text-gray-600 line-clamp-3 flex-1">{pet.descricao}</p>
        ) : (
          <p className="text-sm text-gray-400 italic flex-1">Sem descrição disponível.</p>
        )}

        <button
          onClick={() => onAdopt(pet)}
          className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          🐾 Quero Adotar
        </button>
      </div>
    </article>
  )
}

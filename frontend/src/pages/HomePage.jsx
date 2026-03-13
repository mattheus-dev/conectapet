import { useState, useEffect } from 'react'
import PetCard from '../components/PetCard'
import PetCardSkeleton from '../components/PetCardSkeleton'
import { API_URL } from '../lib/api'

const FILTERS = ['Todos', 'Cachorro', 'Gato', 'Outro']

export default function HomePage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('Todos')

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/pets`)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}: falha ao carregar os pets`)
        return res.json()
      })
      .then((data) => setPets(data.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredPets =
    activeFilter === 'Todos' ? pets : pets.filter((p) => p.especie === activeFilter)

  function handleAdopt(pet) {
    alert(`🐾 Você quer adotar ${pet.nome}!\nID do pet: ${pet.ID}`)
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14 text-center">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Encontre seu novo melhor amigo
          </h1>
          <p className="mt-2 text-emerald-100 text-base sm:text-lg max-w-xl mx-auto">
            Animais esperando por um lar cheio de amor. Adote e transforme duas vidas.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8">
        {/* Filtros por espécie */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 cursor-pointer border ${
                activeFilter === filter
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
              }`}
            >
              {filter === 'Cachorro' && '🐶 '}
              {filter === 'Gato' && '🐱 '}
              {filter === 'Outro' && '🐾 '}
              {filter === 'Todos' && '✨ '}
              {filter}
            </button>
          ))}
        </div>

        {/* Erro */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
            <div className="text-3xl mb-2">😕</div>
            <h2 className="text-lg font-semibold text-red-700">Ops! Algo deu errado</h2>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <p className="text-xs text-gray-400 mt-2">
              Verifique se o servidor está rodando em{' '}
              <code className="bg-gray-100 px-1 rounded">localhost:8080</code>
            </p>
          </div>
        )}

        {/* Skeletons de carregamento */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <PetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Grid de pets */}
        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredPets.length === 0
                ? 'Nenhum pet encontrado.'
                : `${filteredPets.length} pet${filteredPets.length > 1 ? 's' : ''} disponíve${filteredPets.length > 1 ? 'is' : 'l'}`}
            </p>

            {filteredPets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredPets.map((pet) => (
                  <PetCard key={pet.ID} pet={pet} onAdopt={handleAdopt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-700">Nenhum pet encontrado</h2>
                <p className="text-gray-400 mt-1 text-sm">
                  {activeFilter !== 'Todos'
                    ? `Não há pets da espécie "${activeFilter}" disponíveis no momento.`
                    : 'Nenhum pet disponível para adoção no momento.'}
                </p>
                {activeFilter !== 'Todos' && (
                  <button
                    onClick={() => setActiveFilter('Todos')}
                    className="mt-4 text-sm text-emerald-600 hover:underline cursor-pointer"
                  >
                    Ver todos os pets →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

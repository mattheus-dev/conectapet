import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import { API_URL } from '../lib/api'
import { authHeaders, clearAuth } from '../lib/auth'

const EMPTY_FORM = {
  nome: '',
  especie: 'Cachorro',
  idade: '',
  descricao: '',
  url_imagem: '',
}

const SPECIES_LABELS = {
  Cachorro: '🐶 Cachorro',
  Gato: '🐱 Gato',
  Outro: '🐾 Outro',
}

const STATUS_STYLES = {
  'Disponível': 'bg-emerald-100 text-emerald-700',
  'Adotado': 'bg-purple-100 text-purple-700',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function StatCard({ icon, label, value, colorClass }) {
  return (
    <div className={`rounded-2xl p-5 ${colorClass}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-extrabold leading-none">{value}</div>
      <div className="text-sm font-medium mt-1 opacity-75">{label}</div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition'

export default function AdminPage() {
  const [pets, setPets] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const navigate = useNavigate()
  const showToast = (type, message) => setToast({ type, message })

  function handleUnauthorized() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_URL}/admin/pets`, { headers: authHeaders() }).then((r) => {
        if (r.status === 401) { handleUnauthorized(); throw new Error('não autorizado') }
        return r.json()
      }),
      fetch(`${API_URL}/adoptions?status=Pendente`, { headers: authHeaders() }).then((r) => r.json()),
    ])
      .then(([petsData, adoptionsData]) => {
        setPets(petsData.data ?? [])
        setPendingCount(adoptionsData.total ?? 0)
      })
      .catch((err) => { if (err.message !== 'não autorizado') showToast('error', 'Erro ao carregar os dados do painel.') })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function validate() {
    const errors = {}
    if (!form.nome.trim()) errors.nome = 'Nome é obrigatório'
    else if (form.nome.trim().length < 2) errors.nome = 'Nome deve ter ao menos 2 caracteres'
    if (!form.especie) errors.especie = 'Espécie é obrigatória'
    if (form.idade === '' || Number(form.idade) < 0) errors.idade = 'Informe uma idade válida (0 ou mais)'
    return errors
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (formErrors[name]) setFormErrors((fe) => ({ ...fe, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/pets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, idade: Number(form.idade) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao cadastrar o pet')
      setPets((prev) => [data, ...prev])
      setForm(EMPTY_FORM)
      showToast('success', `${data.nome} cadastrado com sucesso! 🎉`)
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(petId, newStatus) {
    try {
      const res = await fetch(`${API_URL}/pets/${petId}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar o status')
      setPets((prev) => prev.map((p) => (p.ID === petId ? { ...p, status: newStatus } : p)))
      showToast('success', 'Status atualizado!')
    } catch (err) {
      showToast('error', err.message)
    }
  }

  async function handleDelete(pet) {
    if (!window.confirm(`Tem certeza que deseja remover "${pet.nome}"?`)) return
    try {
      const res = await fetch(`${API_URL}/pets/${pet.ID}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('Erro ao remover o pet')
      setPets((prev) => prev.filter((p) => p.ID !== pet.ID))
      showToast('success', `${pet.nome} foi removido com sucesso.`)
    } catch (err) {
      showToast('error', err.message)
    }
  }

  const available = pets.filter((p) => p.status === 'Disponível').length
  const adopted = pets.filter((p) => p.status === 'Adotado').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Cabeçalho da página */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel de Administração</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Cadastre novos pets e gerencie os animais disponíveis para adoção.
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🐾" label="Total de Pets" value={pets.length} colorClass="bg-blue-50 text-blue-800" />
        <StatCard icon="✅" label="Disponíveis" value={available} colorClass="bg-emerald-50 text-emerald-800" />
        <StatCard icon="🏠" label="Adotados" value={adopted} colorClass="bg-purple-50 text-purple-800" />
        <StatCard icon="⏳" label="Adoções Pendentes" value={pendingCount} colorClass="bg-amber-50 text-amber-800" />
      </div>

      {/* Conteúdo principal: formulário + tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6 items-start">

        {/* ── Formulário de cadastro ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-20">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <span className="text-lg">➕</span> Cadastrar Novo Pet
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Nome do pet *" error={formErrors.nome}>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Bolinha"
                className={inputClass}
              />
            </Field>

            <Field label="Espécie *" error={formErrors.especie}>
              <select
                name="especie"
                value={form.especie}
                onChange={handleChange}
                className={`${inputClass} bg-white`}
              >
                <option value="Cachorro">🐶 Cachorro</option>
                <option value="Gato">🐱 Gato</option>
                <option value="Outro">🐾 Outro</option>
              </select>
            </Field>

            <Field label="Idade (anos) *" error={formErrors.idade}>
              <input
                type="number"
                name="idade"
                value={form.idade}
                onChange={handleChange}
                min="0"
                placeholder="Ex: 2"
                className={inputClass}
              />
            </Field>

            <Field label="Descrição">
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Conte um pouco sobre o pet..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="URL da Imagem">
              <input
                type="url"
                name="url_imagem"
                value={form.url_imagem}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClass}
              />
              {form.url_imagem && (
                <img
                  src={form.url_imagem}
                  alt="Pré-visualização"
                  className="mt-2 rounded-xl h-32 w-full object-cover object-top border border-gray-200 bg-gray-50"
                  onError={(e) => (e.target.style.display = 'none')}
                  onLoad={(e) => (e.target.style.display = 'block')}
                />
              )}
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Cadastrando...
                </span>
              ) : (
                '+ Cadastrar Pet'
              )}
            </button>
          </form>
        </div>

        {/* ── Tabela de todos os pets ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Todos os Pets</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {pets.length} {pets.length === 1 ? 'pet' : 'pets'}
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-400">Carregando pets...</p>
            </div>
          ) : pets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-gray-500 text-sm font-medium">Nenhum pet cadastrado ainda.</p>
              <p className="text-gray-400 text-xs mt-1">Use o formulário ao lado para adicionar o primeiro!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Pet</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Espécie</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Idade</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Cadastrado em</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {pets.map((pet) => (
                    <tr key={pet.ID} className="hover:bg-gray-50/60 transition-colors">
                      {/* Pet: thumbnail + nome */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={pet.url_imagem || ''}
                            alt={pet.nome}
                            className="w-10 h-10 rounded-xl object-cover object-top flex-shrink-0 bg-gray-100 border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                          <div
                            className="w-10 h-10 rounded-xl flex-shrink-0 bg-gray-100 items-center justify-center text-lg hidden"
                            aria-hidden
                          >
                            {pet.especie === 'Cachorro' ? '🐶' : pet.especie === 'Gato' ? '🐱' : '🐾'}
                          </div>
                          <span className="font-semibold text-gray-900 truncate">{pet.nome}</span>
                        </div>
                      </td>

                      {/* Espécie */}
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-sm">
                        {SPECIES_LABELS[pet.especie] ?? pet.especie}
                      </td>

                      {/* Idade */}
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-sm">
                        {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                      </td>

                      {/* Data */}
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                        {formatDate(pet.CreatedAt)}
                      </td>

                      {/* Status — dropdown inline */}
                      <td className="px-4 py-3">
                        <select
                          value={pet.status}
                          onChange={(e) => handleStatusChange(pet.ID, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-400 transition ${
                            STATUS_STYLES[pet.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <option value="Disponível">✅ Disponível</option>
                          <option value="Adotado">🏠 Adotado</option>
                        </select>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(pet)}
                          title="Remover pet"
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

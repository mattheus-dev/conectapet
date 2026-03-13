import { useState, useEffect } from 'react'
import { API_URL } from '../lib/api'

const PLACEHOLDER_IMAGES = {
  Cachorro: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
  Gato: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  Outro: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&h=300&fit=crop',
}

const EMPTY_FORM = {
  nome_adotante: '',
  email: '',
  telefone: '',
  motivo_adocao: '',
}

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition placeholder:text-gray-300'

// ── Tela de sucesso ─────────────────────────────────────────────────────────
function SuccessView({ pet, onClose }) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-10">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mb-4">
        ✅
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitação enviada!</h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
        Recebemos seu pedido de adoção para o <strong>{pet.nome}</strong>. Entraremos em contato em
        breve pelo e-mail e telefone informados.
      </p>
      <div className="mt-6 w-full max-w-xs bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
        <img
          src={pet.url_imagem || PLACEHOLDER_IMAGES[pet.especie] || PLACEHOLDER_IMAGES['Outro']}
          alt={pet.nome}
          className="w-12 h-12 rounded-xl object-cover object-top flex-shrink-0"
          onError={(e) => (e.target.src = PLACEHOLDER_IMAGES[pet.especie] ?? PLACEHOLDER_IMAGES['Outro'])}
        />
        <div className="text-left">
          <p className="font-semibold text-gray-900 text-sm">{pet.nome}</p>
          <p className="text-xs text-emerald-600 font-medium">Aguardando aprovação ⏳</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
      >
        Fechar
      </button>
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────
export default function AdoptionModal({ pet, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  // Trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    if (serverError) setServerError('')
  }

  function validate() {
    const errs = {}
    if (!form.nome_adotante.trim()) errs.nome_adotante = 'Nome é obrigatório'
    else if (form.nome_adotante.trim().length < 3) errs.nome_adotante = 'Nome muito curto'

    if (!form.email.trim()) errs.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Formato de e-mail inválido'

    if (!form.telefone.trim()) errs.telefone = 'Telefone é obrigatório'
    else if (form.telefone.replace(/\D/g, '').length < 10) errs.telefone = 'Telefone inválido (mín. 10 dígitos)'

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setErrors({})
    setSubmitting(true)
    setServerError('')

    try {
      const res = await fetch(`${API_URL}/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pet_id: pet.ID }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar solicitação')
      setSuccess(true)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const imageUrl = pet.url_imagem || PLACEHOLDER_IMAGES[pet.especie] || PLACEHOLDER_IMAGES['Outro']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <SuccessView pet={pet} onClose={onClose} />
        ) : (
          <>
            {/* Header com info do pet */}
            <div className="relative h-32 overflow-hidden rounded-t-2xl bg-gray-100">
              <img
                src={imageUrl}
                alt={pet.nome}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => (e.target.src = PLACEHOLDER_IMAGES[pet.especie] ?? PLACEHOLDER_IMAGES['Outro'])}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Botão fechar */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                ✕
              </button>

              {/* Nome do pet */}
              <div className="absolute bottom-3 left-4">
                <p className="text-white text-xs font-medium opacity-80">Adotando</p>
                <h2 className="text-white text-xl font-bold leading-tight">{pet.nome}</h2>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              <p className="text-sm text-gray-500 leading-relaxed">
                Preencha seus dados abaixo. Nossa equipe entrará em contato para dar sequência ao
                processo de adoção. 🐾
              </p>

              {/* Erro do servidor */}
              {serverError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <span className="flex-shrink-0">⚠️</span>
                  <span>{serverError}</span>
                </div>
              )}

              <Field label="Seu nome completo" error={errors.nome_adotante} required>
                <input
                  type="text"
                  name="nome_adotante"
                  value={form.nome_adotante}
                  onChange={handleChange}
                  placeholder="Ex: Maria da Silva"
                  autoFocus
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="E-mail" error={errors.email} required>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className={inputClass}
                  />
                </Field>

                <Field label="Telefone / WhatsApp" error={errors.telefone} required>
                  <input
                    type="tel"
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label={`Por que você quer adotar ${pet.nome}?`} error={errors.motivo_adocao}>
                <div className="relative">
                  <textarea
                    name="motivo_adocao"
                    value={form.motivo_adocao}
                    onChange={handleChange}
                    placeholder={`Conte um pouco sobre sua rotina, onde você mora e por que quer adotar o(a) ${pet.nome}...`}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-gray-300 select-none">
                    {form.motivo_adocao.length} caracteres
                  </span>
                </div>
              </Field>

              {/* Ações */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-2 flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    '🐾 Enviar solicitação'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

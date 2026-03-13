export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
        Feito com ❤️ pelo ConectaPet · {new Date().getFullYear()}
      </div>
    </footer>
  )
}

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-4 md:ml-64 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center">
          <div className="text-sm text-gray-400">
            &copy; {currentYear} Copyright by <span className="font-medium text-pink-400">Võ Đức Thuận</span>. All
            rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Trang Chủ - Test Tailwind CSS Grid
        </h1>
        
        {/* Grid Layout chính */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Grid Box 1</h3>
            <p className="text-gray-600 mb-4">
              Đây là một grid box với gradient background và hiệu ứng hover.
            </p>
            <Link 
              to="/about" 
              className="inline-block bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
            >
              Tìm hiểu thêm
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Grid Box 2</h3>
            <p className="text-gray-600 mb-4">
              Box thứ hai với màu sắc khác và layout responsive.
            </p>
            <Link 
              to="/contact" 
              className="inline-block bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Liên hệ
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Grid Box 3</h3>
            <p className="text-gray-600 mb-4">
              Box cuối cùng với thiết kế tương tự nhưng màu sắc khác biệt.
            </p>
            <Link 
              to="/services" 
              className="inline-block bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Dịch vụ
            </Link>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Interactive Demos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Picture-in-Picture Demo */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Picture-in-Picture</h3>
              <p className="text-gray-600 mb-4">
                Demo drag-drop với Picture-in-Picture API. Kéo thả elements để tạo floating window.
              </p>
              <Link 
                to="/demo" 
                className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors"
              >
                🎮 Thử Demo
              </Link>
            </div>

            {/* New Window Demo */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="h-32 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🪟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Drag to New Window</h3>
              <p className="text-gray-600 mb-4">
                Demo drag-drop mở window mới hoàn toàn. Kéo items ra khỏi viewport để tạo window mới.
              </p>
              <Link 
                to="/new-window" 
                className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
              >
                🪟 Thử Demo
              </Link>
            </div>

            {/* Compatibility Test */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Browser Compatibility</h3>
              <p className="text-gray-600 mb-4">
                Kiểm tra tính tương thích của trình duyệt với các API hiện đại.
              </p>
              <Link 
                to="/compatibility" 
                className="inline-block bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
              >
                🔍 Kiểm tra
              </Link>
            </div>
          </div>
        </div>

        {/* Grid Layout phụ - 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin chi tiết</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Responsive Design</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Tailwind CSS Grid</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">React Router</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tính năng</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Grid layout responsive
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Hover effects
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Gradient backgrounds
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Navigation links
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 
 
import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Về Chúng Tôi - Grid Layout Test
        </h1>
        
        {/* Navigation */}
        <div className="mb-8 text-center">
          <Link 
            to="/" 
            className="inline-block bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors mr-4"
          >
            ← Về Trang Chủ
          </Link>
        </div>

        {/* Grid Layout 4 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className={`h-24 rounded-lg mb-4 bg-gradient-to-r ${
                i % 4 === 0 ? 'from-red-400 to-pink-400' :
                i % 4 === 1 ? 'from-blue-400 to-purple-400' :
                i % 4 === 2 ? 'from-green-400 to-teal-400' :
                'from-yellow-400 to-orange-400'
              }`}></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Item {i + 1}
              </h3>
              <p className="text-gray-600 text-sm">
                Mô tả ngắn gọn về item số {i + 1}
              </p>
            </div>
          ))}
        </div>

        {/* Grid Layout không đều */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nội dung chính</h2>
            <p className="text-gray-600 mb-4">
              Đây là một grid layout không đều với nội dung chính chiếm 2/3 không gian.
              Tailwind CSS giúp tạo ra các layout phức tạp một cách dễ dàng.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-purple-100 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Tính năng 1</h4>
                <p className="text-purple-600 text-sm">Responsive design</p>
              </div>
              <div className="bg-pink-100 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-2">Tính năng 2</h4>
                <p className="text-pink-600 text-sm">Grid system</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sidebar</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-800">Tip 1</h4>
                <p className="text-gray-600 text-sm">Sử dụng grid-cols-* để tạo cột</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-4">
                <h4 className="font-semibold text-gray-800">Tip 2</h4>
                <p className="text-gray-600 text-sm">gap-* để tạo khoảng cách</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800">Tip 3</h4>
                <p className="text-gray-600 text-sm">col-span-* để span cột</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About 
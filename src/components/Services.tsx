import { Link } from 'react-router-dom'

const Services = () => {
  const services = [
    {
      title: "Web Development",
      description: "Phát triển website hiện đại với React và Tailwind CSS",
      icon: "💻",
      color: "from-blue-400 to-purple-600"
    },
    {
      title: "Mobile App",
      description: "Ứng dụng di động đa nền tảng với React Native",
      icon: "📱",
      color: "from-green-400 to-blue-600"
    },
    {
      title: "UI/UX Design",
      description: "Thiết kế giao diện người dùng trực quan và đẹp mắt",
      icon: "🎨",
      color: "from-pink-400 to-red-600"
    },
    {
      title: "Backend API",
      description: "Phát triển API mạnh mẽ và bảo mật",
      icon: "⚙️",
      color: "from-yellow-400 to-orange-600"
    },
    {
      title: "Cloud Services",
      description: "Triển khai và quản lý ứng dụng trên cloud",
      icon: "☁️",
      color: "from-cyan-400 to-teal-600"
    },
    {
      title: "Consulting",
      description: "Tư vấn công nghệ và giải pháp phần mềm",
      icon: "🎯",
      color: "from-purple-400 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Dịch Vụ - Grid Services Layout
        </h1>
        
        {/* Navigation */}
        <div className="mb-8 text-center">
          <Link 
            to="/" 
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors mr-4"
          >
            ← Về Trang Chủ
          </Link>
        </div>

        {/* Grid Layout cho services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className={`h-32 bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                <span className="text-4xl">{service.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Grid Layout cho pricing */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Bảng Giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Basic</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">$99<span className="text-sm text-gray-500">/tháng</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Website cơ bản</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Responsive design</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Hỗ trợ 24/7</span>
                </li>
              </ul>
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                Chọn gói
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-orange-500 rounded-lg p-6 hover:shadow-lg transition-shadow relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm">
                Phổ biến
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pro</h3>
              <div className="text-3xl font-bold text-orange-600 mb-4">$199<span className="text-sm text-gray-500">/tháng</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Tất cả tính năng Basic</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Database integration</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">API development</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">SEO optimization</span>
                </li>
              </ul>
              <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                Chọn gói
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Enterprise</h3>
              <div className="text-3xl font-bold text-purple-600 mb-4">$399<span className="text-sm text-gray-500">/tháng</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Tất cả tính năng Pro</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Cloud deployment</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Custom features</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">Dedicated support</span>
                </li>
              </ul>
              <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors">
                Chọn gói
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600">Dự án hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Khách hàng hài lòng</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5+</div>
            <div className="text-gray-600">Năm kinh nghiệm</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Hỗ trợ khách hàng</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services 
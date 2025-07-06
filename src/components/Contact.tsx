import { Link } from 'react-router-dom'

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Liên Hệ - Grid Form Layout
        </h1>
        
        {/* Navigation */}
        <div className="mb-8 text-center">
          <Link 
            to="/" 
            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors mr-4"
          >
            ← Về Trang Chủ
          </Link>
        </div>

        {/* Grid Layout cho form và thông tin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form liên hệ */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h2>
            <form className="space-y-6">
              {/* Grid cho tên và email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chủ đề
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập chủ đề"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tin nhắn
                </label>
                <textarea 
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập tin nhắn của bạn"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 transition-colors font-medium"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* Thông tin liên hệ */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Địa chỉ</h3>
                    <p className="text-gray-600">123 Đường ABC, Quận XYZ, TP.HCM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Điện thoại</h3>
                    <p className="text-gray-600">+84 123 456 789</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <p className="text-gray-600">contact@example.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid cho social media */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết nối với chúng tôi</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-100 p-4 rounded-lg text-center hover:bg-blue-200 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2">📘</div>
                  <span className="text-blue-800 font-medium">Facebook</span>
                </div>
                <div className="bg-pink-100 p-4 rounded-lg text-center hover:bg-pink-200 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2">📷</div>
                  <span className="text-pink-800 font-medium">Instagram</span>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center hover:bg-blue-200 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2">🐦</div>
                  <span className="text-blue-800 font-medium">Twitter</span>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center hover:bg-red-200 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2">📺</div>
                  <span className="text-red-800 font-medium">YouTube</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact 
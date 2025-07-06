import React, { useState, useEffect } from 'react';

interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
}

interface CompatibilityResult {
  feature: string;
  supported: boolean;
  details: string;
  browserSpecific?: string;
}

const BrowserCompatibilityTest: React.FC = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [compatibilityResults, setCompatibilityResults] = useState<CompatibilityResult[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const detectBrowser = (): BrowserInfo => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    // Chrome
    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      const chromeMatch = userAgent.match(/Chrome\/([0-9]+)/);
      if (chromeMatch) browserVersion = chromeMatch[1];
    }
    // Firefox
    else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      const firefoxMatch = userAgent.match(/Firefox\/([0-9]+)/);
      if (firefoxMatch) browserVersion = firefoxMatch[1];
    }
    // Safari
    else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
      const safariMatch = userAgent.match(/Version\/([0-9]+)/);
      if (safariMatch) browserVersion = safariMatch[1];
    }
    // Edge
    else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
      const edgeMatch = userAgent.match(/Edge\/([0-9]+)/);
      if (edgeMatch) browserVersion = edgeMatch[1];
    }
    // IE
    else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
      browserName = 'Internet Explorer';
      const ieMatch = userAgent.match(/MSIE ([0-9]+)/);
      if (ieMatch) browserVersion = ieMatch[1];
    }

    return {
      name: browserName,
      version: browserVersion,
      userAgent: userAgent
    };
  };

  const runCompatibilityTests = async (): Promise<CompatibilityResult[]> => {
    const results: CompatibilityResult[] = [];

    // Test 1: Drag and Drop API
    try {
      const div = document.createElement('div');
      const dragAPISupported = 'draggable' in div && 'ondragstart' in div;
      results.push({
        feature: 'HTML5 Drag and Drop API',
        supported: dragAPISupported,
        details: dragAPISupported ? 'Hỗ trợ đầy đủ' : 'Không hỗ trợ',
        browserSpecific: browserInfo?.name === 'Safari' ? 'Safari cần -webkit-user-drag: element' : undefined
      });
    } catch (error) {
      results.push({
        feature: 'HTML5 Drag and Drop API',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    // Test 2: Window.open
    try {
      const windowOpenSupported = typeof window.open === 'function';
      results.push({
        feature: 'Window.open()',
        supported: windowOpenSupported,
        details: windowOpenSupported ? 'Hỗ trợ' : 'Không hỗ trợ',
        browserSpecific: 'Có thể bị popup blocker chặn'
      });
    } catch (error) {
      results.push({
        feature: 'Window.open()',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    // Test 3: localStorage
    try {
      const localStorageSupported = typeof(Storage) !== 'undefined';
      if (localStorageSupported) {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      }
      results.push({
        feature: 'localStorage',
        supported: localStorageSupported,
        details: localStorageSupported ? 'Hỗ trợ' : 'Không hỗ trợ',
        browserSpecific: 'Private/Incognito mode có thể hạn chế'
      });
    } catch (error) {
      results.push({
        feature: 'localStorage',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    // Test 4: postMessage
    try {
      const postMessageSupported = typeof window.postMessage === 'function';
      results.push({
        feature: 'postMessage API',
        supported: postMessageSupported,
        details: postMessageSupported ? 'Hỗ trợ' : 'Không hỗ trợ',
        browserSpecific: 'Cần kiểm tra origin để bảo mật'
      });
    } catch (error) {
      results.push({
        feature: 'postMessage API',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    // Test 5: URLSearchParams
    try {
      const urlSearchParamsSupported = typeof URLSearchParams === 'function';
      if (urlSearchParamsSupported) {
        new URLSearchParams('test=value');
      }
      results.push({
        feature: 'URLSearchParams',
        supported: urlSearchParamsSupported,
        details: urlSearchParamsSupported ? 'Hỗ trợ' : 'Không hỗ trợ',
        browserSpecific: 'IE cần polyfill'
      });
    } catch (error) {
      results.push({
        feature: 'URLSearchParams',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    // Test 6: Mouse Events
    try {
      const mouseEventsSupported = typeof MouseEvent === 'function';
      results.push({
        feature: 'Mouse Events',
        supported: mouseEventsSupported,
        details: mouseEventsSupported ? 'Hỗ trợ' : 'Không hỗ trợ',
        browserSpecific: 'Touch devices cần touch events'
      });
    } catch (error) {
      results.push({
        feature: 'Mouse Events',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    // Test 7: CSS Transforms
    try {
      const div = document.createElement('div');
      const transformSupported = 'transform' in div.style || 'webkitTransform' in div.style;
      results.push({
        feature: 'CSS Transforms',
        supported: transformSupported,
        details: transformSupported ? 'Hỗ trợ' : 'Không hỗ trợ',
        browserSpecific: 'Cần prefix -webkit- cho Safari cũ'
      });
    } catch (error) {
      results.push({
        feature: 'CSS Transforms',
        supported: false,
        details: 'Lỗi khi test: ' + (error as Error).message
      });
    }

    return results;
  };

  const handleRunTests = async () => {
    setTestStatus('running');
    const browser = detectBrowser();
    setBrowserInfo(browser);
    
    const results = await runCompatibilityTests();
    setCompatibilityResults(results);
    setTestStatus('completed');
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  const getOverallCompatibility = () => {
    if (compatibilityResults.length === 0) return 'pending';
    
    const supportedCount = compatibilityResults.filter(r => r.supported).length;
    const totalCount = compatibilityResults.length;
    const percentage = (supportedCount / totalCount) * 100;
    
    if (percentage >= 85) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  };

  const getCompatibilityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompatibilityLabel = (level: string) => {
    switch (level) {
      case 'excellent': return 'Tuyệt vời';
      case 'good': return 'Tốt';
      case 'fair': return 'Khá';
      case 'poor': return 'Kém';
      default: return 'Đang kiểm tra...';
    }
  };

  const overallCompatibility = getOverallCompatibility();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browser Compatibility Test
          </h1>
          <p className="text-gray-600 mb-6">
            Kiểm tra tính tương thích của tính năng drag-drop trên trình duyệt hiện tại
          </p>

          {/* Browser Info */}
          {browserInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-blue-900 mb-2">Thông tin trình duyệt</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Tên:</span> {browserInfo.name}
                </div>
                <div>
                  <span className="font-medium text-blue-800">Phiên bản:</span> {browserInfo.version}
                </div>
                <div className="md:col-span-1">
                  <span className="font-medium text-blue-800">User Agent:</span>
                  <div className="mt-1 text-xs text-blue-700 break-all">
                    {browserInfo.userAgent}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overall Compatibility */}
          <div className={`border rounded-lg p-4 mb-6 ${getCompatibilityColor(overallCompatibility)}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                Tình trạng tương thích tổng quan
              </h2>
              <span className="text-2xl font-bold">
                {getCompatibilityLabel(overallCompatibility)}
              </span>
            </div>
            {testStatus === 'completed' && (
              <div className="mt-2 text-sm">
                {compatibilityResults.filter(r => r.supported).length} / {compatibilityResults.length} tính năng được hỗ trợ
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kết quả kiểm tra từng tính năng
            </h2>
            
            {testStatus === 'running' && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Đang kiểm tra...</p>
              </div>
            )}

            {testStatus === 'completed' && (
              <div className="grid gap-4">
                {compatibilityResults.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{result.feature}</h3>
                        <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                        {result.browserSpecific && (
                          <p className="text-xs text-orange-600 mt-1">
                            ⚠️ {result.browserSpecific}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.supported 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.supported ? '✅ Hỗ trợ' : '❌ Không hỗ trợ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {testStatus === 'completed' && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Khuyến nghị cho tính tương thích
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Sử dụng polyfills cho các tính năng không được hỗ trợ</li>
                <li>• Cung cấp fallback methods cho các trình duyệt cũ</li>
                <li>• Test trên nhiều trình duyệt và thiết bị khác nhau</li>
                <li>• Xem xét sử dụng thư viện cross-browser như react-dnd</li>
              </ul>
            </div>
          )}

          {/* Test Again Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleRunTests}
              disabled={testStatus === 'running'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {testStatus === 'running' ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserCompatibilityTest; 
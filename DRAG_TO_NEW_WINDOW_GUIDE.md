# 🪟 Hướng dẫn Drag-to-New-Window Demo

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cách hoạt động](#cách-hoạt-động)
3. [Cấu trúc Code](#cấu-trúc-code)
4. [Cách Share Data](#cách-share-data)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

---

## 🎯 Giới thiệu

Demo **Drag-to-New-Window** cho phép người dùng kéo thả các elements ra khỏi viewport để tạo ra một **window mới hoàn toàn** (không phải tab), window mới này sẽ chứa thông tin chi tiết của element được kéo.

### ✨ Tính năng chính:
- **Drag-drop mượt mà**: Sử dụng `requestAnimationFrame` để tối ưu performance
- **Edge detection**: Tự động phát hiện khi drag gần viền màn hình
- **Auto-trigger**: Mở window mới sau 1 giây khi drag gần edge
- **Real-time communication**: Giao tiếp 2 chiều giữa main window và child window
- **Interactive controls**: Edit thông tin trong window mới
- **Cross-window data sharing**: Chia sẻ data giữa các windows

---

## ⚙️ Cách hoạt động

### 1. **Drag Detection**
```typescript
const handleMouseDown = (e: React.MouseEvent, item: DragItem) => {
  e.preventDefault();
  
  setDragOffset({
    x: e.clientX - item.x,
    y: e.clientY - item.y,
  });
  
  setDraggedItem(item);
  setIsDragging(true);
};
```

### 2. **Mouse Movement Tracking**
```typescript
const handleMouseMove = (e: MouseEvent) => {
  if (isDragging && draggedItem) {
    animationRef.current = requestAnimationFrame(() => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Cập nhật vị trí item
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === draggedItem.id 
            ? { ...item, x: newX, y: newY }
            : item
        )
      );
      
      // Kiểm tra edge detection
      const nearEdge = checkEdgeProximity(e.clientX, e.clientY);
      setShowDropZone(nearEdge);
    });
  }
};
```

### 3. **Edge Detection Algorithm**
```typescript
const checkEdgeProximity = (x: number, y: number): boolean => {
  const threshold = 50; // 50px từ viền
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  
  return (
    x < threshold || 
    x > viewport.width - threshold ||
    y < threshold || 
    y > viewport.height - threshold
  );
};
```

### 4. **Auto Window Creation**
```typescript
if (nearEdge && !timeoutRef.current) {
  timeoutRef.current = setTimeout(() => {
    if (draggedItem && isDragging) {
      handleCreateNewWindow(draggedItem);
    }
  }, 1000); // Đợi 1 giây
}
```

---

## 🏗️ Cấu trúc Code

### **Interface Definitions**
```typescript
interface DragItem {
  id: string;
  content: string;
  color: string;
  type: 'block' | 'card' | 'widget';
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

interface NewWindowInfo {
  windowRef: Window | null;
  items: DragItem[];
  windowId: string;
}
```

### **State Management**
```typescript
const [items, setItems] = useState<DragItem[]>([]);
const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
const [isDragging, setIsDragging] = useState(false);
const [showDropZone, setShowDropZone] = useState(false);
const [newWindows, setNewWindows] = useState<NewWindowInfo[]>([]);
const [notification, setNotification] = useState<string | null>(null);
```

### **Refs cho Performance**
```typescript
const containerRef = useRef<HTMLDivElement>(null);
const timeoutRef = useRef<number | null>(null);
const animationRef = useRef<number | null>(null);
```

---

## 🔄 Cách Share Data

### **1. Tạo Window mới**
```typescript
const handleCreateNewWindow = async (item: DragItem) => {
  // Tạo window với features cụ thể
  const windowFeatures = [
    'width=600',
    'height=400',
    'left=100',
    'top=100',
    'scrollbars=yes',
    'resizable=yes',
    'toolbar=no',
    'menubar=no',
    'location=no',
    'status=no'
  ].join(',');

  const windowId = `window-${item.id}-${Date.now()}`;
  const newWindow = window.open('', windowId, windowFeatures);
  
  if (!newWindow) {
    throw new Error('Window blocked by popup blocker');
  }

  // Ghi HTML content trực tiếp
  const windowContent = createWindowHTML(item, windowId);
  newWindow.document.write(windowContent);
  newWindow.document.close();
};
```

### **2. HTML Content Generation**
```typescript
const createWindowHTML = (item: DragItem, windowId: string): string => {
  const colorHex = getItemColor(item.color);
  
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Dragged Item - ${item.content}</title>
    <style>
        /* CSS styles */
    </style>
</head>
<body>
    <div class="container">
        <h1>New Window</h1>
        <div class="item-display">${item.content}</div>
        
        <!-- Thông tin chi tiết -->
        <div class="item-info">
            <p><strong>ID:</strong> ${item.id}</p>
            <p><strong>Type:</strong> ${item.type}</p>
            <p><strong>Data:</strong> ${JSON.stringify(item.data || {})}</p>
        </div>
        
        <!-- Interactive Controls -->
        <div class="interactive-panel">
            <input type="text" id="contentInput" value="${item.content}">
            <select id="colorSelect">
                <option value="bg-purple-500">Purple</option>
                <!-- More options -->
            </select>
        </div>
    </div>
    
    <script>
        // JavaScript for interactivity
        let currentItem = ${JSON.stringify(item)};
        
        function updateContent(newContent) {
            currentItem.content = newContent;
            // Update UI
        }
        
        function returnToParent() {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'RETURN_ITEM',
                    item: currentItem
                }, '*');
                window.close();
            }
        }
    </script>
</body>
</html>`;
  
  return html;
};
```

### **3. PostMessage Communication**

#### **Từ Child Window → Main Window**
```javascript
// Trong child window
window.opener.postMessage({
    type: 'RETURN_ITEM',
    item: currentItem
}, '*');

window.opener.postMessage({
    type: 'ITEM_UPDATED',
    item: currentItem,
    changes: { content: newContent, color: newColor }
}, '*');
```

#### **Từ Main Window → Child Window**
```typescript
// Trong main window
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'RETURN_ITEM') {
      const item = event.data.item;
      
      // Thêm item trở lại main window
      setItems(prev => [...prev, {
        ...item,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      }]);
      
      // Xóa khỏi tracking
      setNewWindows(prev => prev.filter(w => w.windowId !== item.windowId));
    }
    
    else if (event.data.type === 'ITEM_UPDATED') {
      const updatedItem = event.data.item;
      // Xử lý update
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### **4. Data Serialization**

#### **JSON Serialization**
```typescript
// Serialize complex data
const serializedData = JSON.stringify({
  item: item,
  metadata: {
    timestamp: Date.now(),
    windowId: windowId,
    parentOrigin: window.location.origin
  }
});

// Deserialize trong child window
const parsedData = JSON.parse(serializedData);
```

#### **URL Parameters (Alternative)**
```typescript
// Alternative method - URL params
const searchParams = new URLSearchParams({
  id: item.id,
  content: item.content,
  color: item.color,
  type: item.type,
  data: JSON.stringify(item.data)
});

const windowURL = `data:text/html,${encodeURIComponent(html)}?${searchParams}`;
```

---

## 🛠️ Troubleshooting

### **1. Window bị Popup Blocker**
```typescript
const newWindow = window.open('', windowId, windowFeatures);

if (!newWindow) {
  // Thông báo cho user
  setNotification('❌ Window bị chặn bởi popup blocker. Vui lòng allow popups.');
  return;
}
```

### **2. Window không hiển thị nội dung**
```typescript
// Kiểm tra HTML content
console.log('Generated HTML length:', windowContent.length);
console.log('First 200 chars:', windowContent.substring(0, 200));

// Kiểm tra sau khi write
newWindow.document.write(windowContent);
newWindow.document.close();
console.log('Window title:', newWindow.document.title);
```

### **3. PostMessage không hoạt động**
```typescript
// Kiểm tra window.opener
if (window.opener && !window.opener.closed) {
  // OK to send message
} else {
  console.warn('Parent window not available');
}

// Kiểm tra origin
window.opener.postMessage(data, '*'); // Hoặc chỉ định origin cụ thể
```

### **4. Drag không mượt**
```typescript
// Sử dụng requestAnimationFrame
animationRef.current = requestAnimationFrame(() => {
  // Update position
});

// Cleanup
if (animationRef.current) {
  cancelAnimationFrame(animationRef.current);
}
```

---

## 🎯 Best Practices

### **1. Performance Optimization**
- Sử dụng `requestAnimationFrame` cho smooth animation
- Throttle mouse events để tránh quá nhiều updates
- Cleanup timers và animation frames

### **2. Memory Management**
- Track và đóng child windows khi không cần
- Remove event listeners khi component unmount
- Clear timeouts và intervals

### **3. Error Handling**
```typescript
try {
  const newWindow = window.open('', windowId, windowFeatures);
  
  if (!newWindow) {
    throw new Error('Window blocked by popup blocker');
  }
  
  // Window creation logic
} catch (error) {
  console.error('Failed to create window:', error);
  setNotification(`❌ Lỗi: ${error.message}`);
}
```

### **4. Cross-browser Compatibility**
```typescript
// Kiểm tra feature support
if (typeof window.open === 'function') {
  // Proceed with window creation
} else {
  // Fallback hoặc thông báo
}
```

### **5. Security**
```typescript
// Validate PostMessage origin
window.addEventListener('message', (event) => {
  // Chỉ accept messages từ trusted origins
  if (event.origin !== window.location.origin) {
    return;
  }
  
  // Process message
});
```

---

## 📊 Flow Chart

```
User starts dragging item
         ↓
Mouse move events tracked
         ↓
Check if near viewport edge
         ↓
Show drop zone indicator
         ↓
Wait 1 second near edge
         ↓
Create new window
         ↓
Generate HTML content
         ↓
Write HTML to window
         ↓
Setup PostMessage communication
         ↓
User interacts in new window
         ↓
Send updates via PostMessage
         ↓
Main window receives updates
         ↓
User closes window or returns item
```

---

## 🔧 Debugging Tips

### **Console Logging**
```typescript
// Debug drag events
console.log('🖱️ Mouse down:', item.content);
console.log('🎯 Drag started:', draggedItem);
console.log('🎯 Moving to:', newX, newY);

// Debug window creation
console.log('🪟 Creating window for:', item.content);
console.log('🪟 Generated HTML length:', html.length);
console.log('🪟 Window created:', newWindow);
```

### **Visual Debug Panel**
```jsx
<div className="debug-panel">
  <h4>Debug Info:</h4>
  <div>Items: {items.length}</div>
  <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
  <div>Drop Zone: {showDropZone ? 'Yes' : 'No'}</div>
  <div>Windows: {newWindows.length}</div>
</div>
```

---

## 📚 Tài liệu tham khảo

- [Window.open() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open)
- [PostMessage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [Drag and Drop API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [RequestAnimationFrame - MDN](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

---

## 🎉 Kết luận

Demo **Drag-to-New-Window** là một ví dụ tuyệt vời về cách tạo ra trải nghiệm người dùng phong phú với:
- **Smooth drag-drop interactions**
- **Cross-window communication**
- **Real-time data sharing**
- **Interactive UI controls**

Công nghệ này có thể áp dụng trong nhiều trường hợp thực tế như:
- Dashboard applications
- Multi-window workflows
- Data visualization tools
- Content management systems 
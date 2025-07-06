import React, { useState, useRef, useEffect } from 'react';

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

const DragToNewWindow: React.FC = () => {
  const [items, setItems] = useState<DragItem[]>([
    { id: '1', content: 'Widget A', color: 'bg-purple-500', type: 'widget', x: 100, y: 100, data: { value: 42 } },
    { id: '2', content: 'Card B', color: 'bg-pink-500', type: 'card', x: 250, y: 150, data: { title: 'Important Card' } },
    { id: '3', content: 'Block C', color: 'bg-indigo-500', type: 'block', x: 150, y: 250, data: { count: 15 } },
    { id: '4', content: 'Item D', color: 'bg-teal-500', type: 'widget', x: 350, y: 200, data: { status: 'active' } },
  ]);
  
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newWindows, setNewWindows] = useState<NewWindowInfo[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🎨 Component mounted, items:', items);
  }, []);

  useEffect(() => {
    console.log('🎨 Items changed:', items);
  }, [items]);

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && draggedItem) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        animationRef.current = requestAnimationFrame(() => {
          const newX = e.clientX - dragOffset.x;
          const newY = e.clientY - dragOffset.y;
          
          console.log('🎯 Moving item:', draggedItem.content, 'to', newX, newY);
          
          setItems(prevItems => 
            prevItems.map(item => 
              item.id === draggedItem.id 
                ? { ...item, x: newX, y: newY }
                : item
            )
          );

          // Check if dragging near viewport edge
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
          };
          
          const threshold = 50;
          const nearEdge = 
            e.clientX < threshold || 
            e.clientX > viewport.width - threshold ||
            e.clientY < threshold || 
            e.clientY > viewport.height - threshold;

          setShowDropZone(nearEdge);
          
          // Auto-create new window when dragging near edge for 1 second
          if (nearEdge && !timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
              if (draggedItem && isDragging) {
                handleCreateNewWindow(draggedItem);
              }
            }, 1000);
          } else if (!nearEdge && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        });
      }
    };

    const handleMouseUp = () => {
      console.log('🖱️ Mouse up - ending drag');
      setDraggedItem(null);
      setIsDragging(false);
      setShowDropZone(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isDragging, draggedItem, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent, item: DragItem) => {
    e.preventDefault();
    console.log('🖱️ Mouse down on item:', item.content, 'at', e.clientX, e.clientY);
    
    setDragOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y,
    });
    
    setDraggedItem(item);
    setIsDragging(true);
    console.log('🎯 Drag started for:', item.content);
  };

  const handleCreateNewWindow = async (item: DragItem) => {
    try {
      console.log('🪟 Creating new window for:', item.content);
      
      // Reset drag state
      setDraggedItem(null);
      setIsDragging(false);
      setShowDropZone(false);
      
      // Create new window
      const windowId = `window-${item.id}-${Date.now()}`;
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

      // Create new window first
      const newWindow = window.open('', windowId, windowFeatures);
      
      if (!newWindow) {
        throw new Error('Window blocked by popup blocker');
      }

      // Write HTML content directly to the new window
      const windowContent = createWindowHTML(item, windowId);
      console.log('🪟 Generated HTML content length:', windowContent.length);
      console.log('🪟 First 200 chars:', windowContent.substring(0, 200));
      
      newWindow.document.write(windowContent);
      newWindow.document.close();
      
      console.log('🪟 Window document after write:', newWindow.document.title);
      console.log('🪟 Window document body:', newWindow.document.body);

      // Wait for window to load then setup
      newWindow.onload = () => {
        setupNewWindow(newWindow, item, windowId);
      };

      // Track new window
      const windowInfo: NewWindowInfo = {
        windowRef: newWindow,
        items: [item],
        windowId: windowId,
      };

      setNewWindows(prev => [...prev, windowInfo]);
      
      // Remove item from main window
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      // Show notification
      setNotification(`✅ ${item.content} đã được chuyển sang window mới!`);
      setTimeout(() => setNotification(null), 3000);

      // Handle window close
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          handleWindowClosed(windowId, item);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Failed to create new window:', error);
      setNotification(`❌ Không thể tạo window mới: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setNotification(null), 3000);
      
      // Reset states on failure
      setDraggedItem(null);
      setIsDragging(false);
      setShowDropZone(false);
    }
  };

  const createWindowHTML = (item: DragItem, windowId: string): string => {
    // Get color hex value
    const colorHex = getItemColor(item.color);
    console.log('🎨 Creating window HTML for item:', item.content, 'color:', colorHex);
    
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dragged Item - ${item.content}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
            position: relative;
            overflow: hidden;
        }
        
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: ${colorHex};
        }
        
        .item-display {
            width: 200px;
            height: 100px;
            background: ${colorHex};
            border-radius: 12px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            cursor: move;
            transition: transform 0.2s ease;
            user-select: none;
        }
        
        .item-display:hover {
            transform: scale(1.05) rotate(2deg);
        }
        
        .item-info {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid ${colorHex};
        }
        
        .item-info h3 {
            color: #1e293b;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .item-info p {
            color: #64748b;
            font-size: 14px;
            margin: 5px 0;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
        }
        
        .btn-primary {
            background: ${colorHex};
            color: white;
        }
        
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .btn-secondary {
            background: #e2e8f0;
            color: #475569;
        }
        
        .btn-secondary:hover {
            background: #cbd5e1;
        }
        
        .window-title {
            color: #1e293b;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .window-subtitle {
            color: #64748b;
            margin-bottom: 30px;
        }
        
        .floating-icons {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 20px;
            opacity: 0.1;
        }
        
        .interactive-panel {
            background: #f1f5f9;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            border: 2px solid #e2e8f0;
        }
        
        .interactive-panel h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .control-group {
            margin-bottom: 15px;
        }
        
        .control-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #475569;
        }
        
        .control-group input, .control-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s ease;
        }
        
        .control-group input:focus, .control-group select:focus {
            outline: none;
            border-color: ${colorHex};
            box-shadow: 0 0 0 2px ${colorHex}20;
        }
        
        .status-panel {
            background: #1e293b;
            color: white;
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .status-panel h4 {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .status-panel div {
            margin-bottom: 5px;
        }
        
        .status-panel span {
            font-weight: bold;
            color: #10b981;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="floating-icons">🪟✨</div>
        
        <h1 class="window-title">New Window</h1>
        <p class="window-subtitle">Item successfully transferred!</p>
        
        <div class="item-display" id="draggedItem">
            ${item.content}
        </div>
        
        <div class="item-info">
            <h3>📋 Item Details</h3>
            <p><strong>🆔 ID:</strong> ${item.id}</p>
            <p><strong>🏷️ Type:</strong> ${item.type}</p>
            <p><strong>🎨 Color:</strong> ${item.color}</p>
            <p><strong>📊 Data:</strong> ${JSON.stringify(item.data || {})}</p>
            <p><strong>🪟 Window ID:</strong> ${windowId}</p>
            <p><strong>⏰ Created:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        </div>

        <div class="item-info">
            <h3>🎮 Interactive Features</h3>
            <p>• Drag the item above to move it around</p>
            <p>• Use buttons below to control the window</p>
            <p>• This window communicates with the main window</p>
            <p>• All changes are synced in real-time</p>
        </div>

        <div class="item-info">
            <h3>🔧 Window Information</h3>
            <p><strong>Opener:</strong> ${window.opener ? 'Connected' : 'Not connected'}</p>
            <p><strong>URL:</strong> ${window.location.href.substring(0, 50)}...</p>
            <p><strong>Size:</strong> ${window.innerWidth}x${window.innerHeight}px</p>
            <p><strong>Position:</strong> ${window.screenX}, ${window.screenY}</p>
        </div>
        
        <div class="controls">
            <button class="btn btn-primary" onclick="returnToParent()">
                ← Return to Main Window
            </button>
            <button class="btn btn-secondary" onclick="window.close()">
                ✕ Close Window
            </button>
        </div>

        <div class="interactive-panel">
            <h3>🎨 Customize Item</h3>
            <div class="control-group">
                <label>Content:</label>
                <input type="text" id="contentInput" value="${item.content}" onchange="updateContent(this.value)">
            </div>
            <div class="control-group">
                <label>Color:</label>
                <select id="colorSelect" onchange="updateColor(this.value)">
                    <option value="bg-purple-500" ${item.color === 'bg-purple-500' ? 'selected' : ''}>Purple</option>
                    <option value="bg-pink-500" ${item.color === 'bg-pink-500' ? 'selected' : ''}>Pink</option>
                    <option value="bg-indigo-500" ${item.color === 'bg-indigo-500' ? 'selected' : ''}>Indigo</option>
                    <option value="bg-teal-500" ${item.color === 'bg-teal-500' ? 'selected' : ''}>Teal</option>
                    <option value="bg-red-500" ${item.color === 'bg-red-500' ? 'selected' : ''}>Red</option>
                    <option value="bg-green-500" ${item.color === 'bg-green-500' ? 'selected' : ''}>Green</option>
                    <option value="bg-blue-500" ${item.color === 'bg-blue-500' ? 'selected' : ''}>Blue</option>
                </select>
            </div>
            <div class="control-group">
                <label>Type:</label>
                <select id="typeSelect" onchange="updateType(this.value)">
                    <option value="block" ${item.type === 'block' ? 'selected' : ''}>Block</option>
                    <option value="card" ${item.type === 'card' ? 'selected' : ''}>Card</option>
                    <option value="widget" ${item.type === 'widget' ? 'selected' : ''}>Widget</option>
                </select>
            </div>
            <div class="control-group">
                <button class="btn btn-primary" onclick="applyChanges()">
                    💾 Apply Changes
                </button>
            </div>
        </div>

        <div class="status-panel">
            <h4>📊 Window Status</h4>
            <div id="statusDisplay">
                <div>Status: <span id="statusText">Active</span></div>
                <div>Uptime: <span id="uptimeText">0s</span></div>
                <div>Updates: <span id="updateCount">0</span></div>
            </div>
        </div>
    </div>

    <script>
        // Make the item draggable within this window
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        const itemElement = document.getElementById('draggedItem');
        
        itemElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = itemElement.getBoundingClientRect();
            dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            itemElement.style.position = 'fixed';
            itemElement.style.zIndex = '1000';
            itemElement.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                itemElement.style.left = (e.clientX - dragOffset.x) + 'px';
                itemElement.style.top = (e.clientY - dragOffset.y) + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                itemElement.style.cursor = 'move';
                
                // Reset position after a moment
                setTimeout(() => {
                    itemElement.style.position = 'static';
                    itemElement.style.zIndex = 'auto';
                }, 1000);
            }
        });
        
        // Window state management
        let currentItem = {
            id: '${item.id}',
            content: '${item.content}',
            color: '${item.color}',
            type: '${item.type}',
            data: ${JSON.stringify(item.data || {})},
            windowId: '${windowId}'
        };
        
        let updateCount = 0;
        let startTime = Date.now();
        
        // Update functions
        function updateContent(newContent) {
            currentItem.content = newContent;
            document.getElementById('draggedItem').textContent = newContent;
            document.title = 'Dragged Item - ' + newContent;
            incrementUpdateCount();
        }
        
        function updateColor(newColor) {
            currentItem.color = newColor;
            const colorMap = {
                'bg-purple-500': '#8b5cf6',
                'bg-pink-500': '#ec4899',
                'bg-indigo-500': '#6366f1',
                'bg-teal-500': '#14b8a6',
                'bg-red-500': '#ef4444',
                'bg-blue-500': '#3b82f6',
                'bg-green-500': '#10b981',
            };
            
            const colorHex = colorMap[newColor] || '#6b7280';
            const itemDisplay = document.getElementById('draggedItem');
            itemDisplay.style.background = colorHex;
            
            // Update other elements
            document.querySelector('.container::before').style.background = colorHex;
            incrementUpdateCount();
        }
        
        function updateType(newType) {
            currentItem.type = newType;
            incrementUpdateCount();
        }
        
        function incrementUpdateCount() {
            updateCount++;
            document.getElementById('updateCount').textContent = updateCount;
        }
        
        function applyChanges() {
            // Get current values
            const contentInput = document.getElementById('contentInput').value;
            const colorSelect = document.getElementById('colorSelect').value;
            const typeSelect = document.getElementById('typeSelect').value;
            
            // Update item
            updateContent(contentInput);
            updateColor(colorSelect);
            updateType(typeSelect);
            
            // Notify parent window
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'ITEM_UPDATED',
                    item: currentItem,
                    changes: {
                        content: contentInput,
                        color: colorSelect,
                        type: typeSelect
                    }
                }, '*');
            }
            
            // Show feedback
            const statusText = document.getElementById('statusText');
            statusText.textContent = 'Changes Applied';
            statusText.style.color = '#10b981';
            setTimeout(() => {
                statusText.textContent = 'Active';
                statusText.style.color = '#10b981';
            }, 2000);
        }
        
        // Status updates
        function updateStatus() {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById('uptimeText').textContent = uptime + 's';
        }
        
        // Start status timer
        setInterval(updateStatus, 1000);
        
        // Communication with parent window
        function returnToParent() {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'RETURN_ITEM',
                    item: currentItem
                }, '*');
                
                window.close();
            } else {
                alert('Parent window is not available!');
            }
        }
        
        // Notify parent when window loads
        window.addEventListener('load', () => {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'WINDOW_LOADED',
                    windowId: '${windowId}'
                }, '*');
            }
        });
        
        // Handle window close
        window.addEventListener('beforeunload', () => {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'WINDOW_CLOSING',
                    windowId: '${windowId}'
                }, '*');
            }
        });
    </script>
</body>
</html>`;
    
    console.log('🎨 Generated HTML length:', html.length);
    return html;
  };

  const setupNewWindow = (newWindow: Window, item: DragItem, windowId: string) => {
    console.log('🔧 Setting up new window:', windowId);
    
    // Focus the new window
    newWindow.focus();
    
    // Additional setup if needed
    // Could inject more functionality here
  };

  const handleWindowClosed = (windowId: string, item: DragItem) => {
    console.log('🪟 Window closed:', windowId);
    
    // Remove from tracking
    setNewWindows(prev => prev.filter(w => w.windowId !== windowId));
    
    // Optionally restore item to main window
    // setItems(prev => [...prev, { ...item, x: 100, y: 100 }]);
    
    setNotification(`🪟 Window "${item.content}" đã được đóng`);
    setTimeout(() => setNotification(null), 2000);
  };

  // Listen for messages from child windows
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'RETURN_ITEM') {
        const item = event.data.item;
        console.log('↩️ Item returned from window:', item.content);
        
        // Add item back to main window
        setItems(prev => [...prev, {
          ...item,
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        }]);
        
        // Remove window from tracking
        setNewWindows(prev => prev.filter(w => w.windowId !== item.windowId));
        
        setNotification(`↩️ ${item.content} đã trở về main window!`);
        setTimeout(() => setNotification(null), 3000);
      }
      
      else if (event.data.type === 'ITEM_UPDATED') {
        const updatedItem = event.data.item;
        const changes = event.data.changes;
        console.log('🔄 Item updated in child window:', updatedItem.content, changes);
        
        // Update the item in our state (even though it's not in main window anymore)
        // This could be used for logging or history tracking
        setNotification(`🔄 ${updatedItem.content} đã được cập nhật trong child window!`);
        setTimeout(() => setNotification(null), 3000);
      }
      
      else if (event.data.type === 'WINDOW_LOADED') {
        console.log('✅ Child window loaded:', event.data.windowId);
      }
      
      else if (event.data.type === 'WINDOW_CLOSING') {
        console.log('🔄 Child window closing:', event.data.windowId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getItemColor = (colorClass: string): string => {
    const colorMap: { [key: string]: string } = {
      'bg-purple-500': '#8b5cf6',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
      'bg-teal-500': '#14b8a6',
      'bg-red-500': '#ef4444',
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981',
    };
    return colorMap[colorClass] || '#6b7280';
  };

  const createSimpleTestWindow = () => {
    const windowFeatures = [
      'width=600',
      'height=400',
      'left=100',
      'top=100',
      'scrollbars=yes',
      'resizable=yes',
    ].join(',');

    const testWindow = window.open('', 'test-window', windowFeatures);
    
    if (!testWindow) {
      alert('Window blocked by popup blocker');
      return;
    }

    const simpleHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Window</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: white;
            color: black;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .item {
            width: 200px;
            height: 100px;
            background: #8b5cf6;
            margin: 20px auto;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        button {
            padding: 10px 20px;
            margin: 10px;
            border: none;
            border-radius: 5px;
            background: #3b82f6;
            color: white;
            cursor: pointer;
        }
        button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🪟 Test Window</h1>
        <p>This is a test window created successfully!</p>
        <div class="item">Test Item</div>
        <p><strong>Window ID:</strong> test-window</p>
        <p><strong>Created:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        <button onclick="window.close()">Close Window</button>
        <button onclick="alert('Test button clicked!')">Test Alert</button>
    </div>
</body>
</html>`;

    testWindow.document.write(simpleHTML);
    testWindow.document.close();
    testWindow.focus();
  };

  const handleReset = () => {
    // Close all child windows
    newWindows.forEach(windowInfo => {
      if (windowInfo.windowRef && !windowInfo.windowRef.closed) {
        windowInfo.windowRef.close();
      }
    });
    
    setNewWindows([]);
    setDraggedItem(null);
    setIsDragging(false);
    setShowDropZone(false);
    
    // Reset items
    setItems([
      { id: '1', content: 'Widget A', color: 'bg-purple-500', type: 'widget', x: 100, y: 100, data: { value: 42 } },
      { id: '2', content: 'Card B', color: 'bg-pink-500', type: 'card', x: 250, y: 150, data: { title: 'Important Card' } },
      { id: '3', content: 'Block C', color: 'bg-indigo-500', type: 'block', x: 150, y: 250, data: { count: 15 } },
      { id: '4', content: 'Item D', color: 'bg-teal-500', type: 'widget', x: 350, y: 200, data: { status: 'active' } },
    ]);
    
    setNotification('🔄 Demo đã được reset và tất cả windows đã đóng!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Drag to New Window Demo</h1>
            <p className="text-gray-600">Kéo thả item ra khỏi viewport để mở window mới</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Reset Demo
            </button>
            <button
              onClick={() => items.length > 0 && handleCreateNewWindow(items[0])}
              disabled={items.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🪟 Test New Window
            </button>
            <button
              onClick={() => {
                console.log('🧪 Test button - current items:', items);
                console.log('🧪 Test button - dragging state:', isDragging);
                console.log('🧪 Test button - dragged item:', draggedItem);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🧪 Debug
            </button>
            <button
              onClick={createSimpleTestWindow}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🧪 Simple Test
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div 
        ref={containerRef} 
        className="relative w-full p-4"
        style={{ 
          height: 'calc(100vh - 120px)', // Fixed height
          cursor: isDragging ? 'grabbing' : 'default',
          userSelect: 'none'
        }}
      >
        {/* Draggable Items */}
        {items.map((item) => (
          <div
            key={item.id}
            className={`absolute w-32 h-16 ${item.color} rounded-lg shadow-lg cursor-move flex items-center justify-center text-white font-semibold select-none hover:shadow-xl ${
              isDragging && draggedItem?.id === item.id 
                ? 'z-50 scale-110 shadow-2xl rotate-3' 
                : 'z-10 transition-all duration-200'
            }`}
            style={{
              left: item.x,
              top: item.y,
              transition: isDragging && draggedItem?.id === item.id 
                ? 'none' 
                : 'transform 0.2s ease, box-shadow 0.2s ease',
              willChange: isDragging && draggedItem?.id === item.id ? 'transform' : 'auto',
            }}
            onMouseDown={(e) => handleMouseDown(e, item)}
            onMouseEnter={() => console.log('🖱️ Mouse enter:', item.content)}
            onMouseLeave={() => console.log('🖱️ Mouse leave:', item.content)}
            title={`${item.content} (${item.type})`}
          >
            <div className="text-center">
              <div className="text-sm font-bold">{item.content}</div>
              <div className="text-xs opacity-75">{item.type}</div>
            </div>
          </div>
        ))}

        {/* Drop Zone Indicator */}
        {showDropZone && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 border-4 border-green-500 border-dashed animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 shadow-2xl">
                  <p className="text-xl font-semibold text-gray-800">
                    🪟 Thả vào đây để mở Window mới!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50">
            <p className="text-sm font-medium">{notification}</p>
          </div>
        )}

        {/* Window Status */}
        {newWindows.length > 0 && (
          <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
            <p className="text-sm font-medium">
              🪟 {newWindows.length} window{newWindows.length > 1 ? 's' : ''} opened
            </p>
            <div className="text-xs mt-1 opacity-90">
              {newWindows.map(w => w.windowId.split('-')[1]).join(', ')}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg max-w-md">
          <h3 className="font-semibold text-gray-800 mb-2">Hướng dẫn:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Kéo item</strong> bằng chuột</li>
            <li>• <strong>Drag gần viền</strong> màn hình để hiển thị drop zone</li>
            <li>• <strong>Giữ 1 giây</strong> để tự động mở window mới</li>
            <li>• <strong>Window mới</strong> hiển thị item với full details</li>
            <li>• <strong>Return button</strong> trong window để trả về item</li>
            <li>• <strong>Close window</strong> để đóng hoàn toàn</li>
          </ul>
        </div>

        {/* Debug Panel */}
        <div className="absolute bottom-4 right-4 bg-gray-800 text-white rounded-lg p-3 shadow-lg text-xs max-w-xs">
          <h4 className="font-semibold mb-1">Debug Info:</h4>
          <div className="space-y-1">
            <div>Items: {items.length}</div>
            <div>Windows: {newWindows.length}</div>
            <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
            <div>Drop Zone: {showDropZone ? 'Yes' : 'No'}</div>
            <div>Dragged: {draggedItem?.content || 'None'}</div>
            <div>DraggedID: {draggedItem?.id || 'None'}</div>
            <div>Offset: {dragOffset.x}, {dragOffset.y}</div>
            <div>Items positions:</div>
            {items.map(item => (
              <div key={item.id} className="pl-2">
                {item.content}: {item.x}, {item.y}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragToNewWindow; 
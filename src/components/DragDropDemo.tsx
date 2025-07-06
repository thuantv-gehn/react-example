import React, { useState, useRef, useEffect } from 'react';

interface DragBlock {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
}

interface DocumentPictureInPictureAPI {
  requestWindow: (options: { width: number; height: number; disallowReturnToOpener?: boolean }) => Promise<Window>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPictureAPI;
  }
}

const DragDropDemo: React.FC = () => {
  const [blocks, setBlocks] = useState<DragBlock[]>([
    { id: '1', content: 'Block 1', color: 'bg-red-500', x: 100, y: 100 },
    { id: '2', content: 'Block 2', color: 'bg-blue-500', x: 250, y: 150 },
    { id: '3', content: 'Block 3', color: 'bg-green-500', x: 150, y: 250 },
  ]);
  
  const [draggedBlock, setDraggedBlock] = useState<DragBlock | null>(null);
  const [showDropZone, setShowDropZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pipBlocks, setPipBlocks] = useState<DragBlock[]>([]);
  const [showPipOption, setShowPipOption] = useState(false);
  const [pipNotification, setPipNotification] = useState<string | null>(null);
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(true);
  const [triggerMethod, setTriggerMethod] = useState<'timer' | 'hover' | 'idle' | 'manual'>('timer');
  const [countdown, setCountdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const autoTriggerTimeoutRef = useRef<number | null>(null);
  const idleTimeoutRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Browser compatibility check
  const browserSupport = {
    dragAPI: 'draggable' in document.createElement('div'),
    windowOpen: typeof window !== 'undefined' && 'open' in window,
    localStorage: typeof Storage !== 'undefined',
    postMessage: typeof window !== 'undefined' && 'postMessage' in window,
    documentPiP: typeof window !== 'undefined' && 'documentPictureInPicture' in window,
  };

  // Picture-in-Picture functions
  const createPipWindow = async (block: DragBlock) => {
    console.log('🎬 Creating PiP for:', block.content);
    console.log('🌐 Browser support:', browserSupport);
    
    try {
      // Method 1: Document Picture-in-Picture API (Chrome 116+)
      if (browserSupport.documentPiP && 'documentPictureInPicture' in window) {
        console.log('✅ Using native Document PiP API');
        const pipWindow = await window.documentPictureInPicture!.requestWindow({
          width: 300,
          height: 200,
          disallowReturnToOpener: false,
        });

        pipWindowRef.current = pipWindow;

        // Copy styles to PiP window
        const allStyleSheets = Array.from(document.styleSheets);
        allStyleSheets.forEach((styleSheet) => {
          try {
            const cssRules = Array.from(styleSheet.cssRules);
            const style = pipWindow.document.createElement('style');
            style.textContent = cssRules.map(rule => rule.cssText).join('\n');
            pipWindow.document.head.appendChild(style);
          } catch {
            // Handle cross-origin stylesheets
            if (styleSheet.href) {
              const link = pipWindow.document.createElement('link');
              link.rel = 'stylesheet';
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            }
          }
        });

        // Create PiP content
        const pipContent = createPipContent(block);
        pipWindow.document.body.appendChild(pipContent);

        // Handle window close
        pipWindow.addEventListener('pagehide', () => {
          setPipBlocks(prev => prev.filter(b => b.id !== block.id));
          setBlocks(prev => [...prev, block]);
          pipWindowRef.current = null;
        });

        console.log('✅ Native PiP window created successfully');
        return pipWindow;
      }
      
      // Method 2: Fallback - Floating overlay
      else {
        console.log('🔄 Using fallback floating overlay');
        const success = createFloatingOverlay(block);
        return success ? 'overlay' : null;
      }
    } catch (error) {
      console.error('❌ PiP creation failed:', error);
      console.log('🔄 Falling back to floating overlay');
      // Fallback to floating overlay
      const success = createFloatingOverlay(block);
      return success ? 'overlay' : null;
    }
  };

  const createPipContent = (block: DragBlock) => {
    const container = document.createElement('div');
    container.className = 'flex items-center justify-center w-full h-full bg-gray-100';
    
    const blockElement = document.createElement('div');
    blockElement.className = `w-32 h-16 ${block.color} rounded-lg shadow-lg flex items-center justify-center text-white font-semibold cursor-move`;
    blockElement.textContent = block.content;
    blockElement.style.cssText = `
      background: ${getBlockColor(block.color)};
      user-select: none;
      transition: transform 0.2s ease;
    `;
    
    // Add hover effect
    blockElement.addEventListener('mouseenter', () => {
      blockElement.style.transform = 'scale(1.05)';
    });
    
    blockElement.addEventListener('mouseleave', () => {
      blockElement.style.transform = 'scale(1)';
    });

    // Add drag functionality within PiP
    let isPipDragging = false;
    let pipDragOffset = { x: 0, y: 0 };

    blockElement.addEventListener('mousedown', (e) => {
      isPipDragging = true;
      pipDragOffset = {
        x: e.clientX - blockElement.offsetLeft,
        y: e.clientY - blockElement.offsetTop,
      };
      blockElement.style.cursor = 'grabbing';
    });

    container.addEventListener('mousemove', (e) => {
      if (isPipDragging) {
        const newX = e.clientX - pipDragOffset.x;
        const newY = e.clientY - pipDragOffset.y;
        blockElement.style.position = 'absolute';
        blockElement.style.left = `${Math.max(0, Math.min(container.clientWidth - blockElement.clientWidth, newX))}px`;
        blockElement.style.top = `${Math.max(0, Math.min(container.clientHeight - blockElement.clientHeight, newY))}px`;
      }
    });

    container.addEventListener('mouseup', () => {
      isPipDragging = false;
      blockElement.style.cursor = 'move';
    });

    container.appendChild(blockElement);
    return container;
  };

  const createFloatingOverlay = (block: DragBlock) => {
    console.log('🔄 Creating floating overlay for:', block.content);
    
    // Check if overlay already exists
    const existingOverlay = document.getElementById(`pip-overlay-${block.id}`);
    if (existingOverlay) {
      console.log('⚠️ Overlay already exists, removing old one');
      existingOverlay.remove();
    }
    
    // Create floating overlay div
    const overlay = document.createElement('div');
    overlay.id = `pip-overlay-${block.id}`;
    overlay.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      width: 320px !important;
      height: 192px !important;
      background: white !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
      border: 2px solid #3b82f6 !important;
      z-index: 999999 !important;
      overflow: hidden !important;
      resize: both !important;
      min-width: 200px !important;
      min-height: 120px !important;
      font-family: system-ui, sans-serif !important;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #f9fafb !important;
      padding: 8px 16px !important;
      border-bottom: 1px solid #e5e7eb !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #374151 !important;
    `;
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = `Picture-in-Picture - ${block.content}`;
    titleSpan.style.cssText = `
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #374151 !important;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none !important;
      border: none !important;
      font-size: 18px !important;
      color: #9ca3af !important;
      cursor: pointer !important;
      width: 24px !important;
      height: 24px !important;
      border-radius: 4px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;
    
    closeBtn.onclick = () => {
      overlay.remove();
      window.dispatchEvent(new CustomEvent('pipClosed', { detail: { blockId: block.id } }));
    };
    
    closeBtn.onmouseenter = () => {
      closeBtn.style.background = '#e5e7eb !important';
      closeBtn.style.color = '#6b7280 !important';
    };
    
    closeBtn.onmouseleave = () => {
      closeBtn.style.background = 'none !important';
      closeBtn.style.color = '#9ca3af !important';
    };
    
    header.appendChild(titleSpan);
    header.appendChild(closeBtn);

    // Create content
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: calc(100% - 48px) !important;
      background: #f9fafb !important;
    `;
    
    // Create the block element directly
    const blockElement = document.createElement('div');
    blockElement.textContent = block.content;
    blockElement.style.cssText = `
      width: 128px !important;
      height: 64px !important;
      background: ${getBlockColor(block.color)} !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-weight: 600 !important;
      cursor: move !important;
      user-select: none !important;
      transition: transform 0.2s ease !important;
    `;
    
    // Add hover effect
    blockElement.onmouseenter = () => {
      blockElement.style.transform = 'scale(1.05) !important';
    };
    
    blockElement.onmouseleave = () => {
      blockElement.style.transform = 'scale(1) !important';
    };
    
    content.appendChild(blockElement);
    overlay.appendChild(header);
    overlay.appendChild(content);
    
    // Make sure it's added to document body
    document.body.appendChild(overlay);
    
    console.log('✅ Floating overlay created and added to DOM');
    console.log('📍 Overlay element:', overlay);
    console.log('📍 Overlay in DOM:', document.getElementById(`pip-overlay-${block.id}`));

    // Add drag functionality to overlay
    let isDraggingOverlay = false;
    let overlayDragOffset = { x: 0, y: 0 };

    header.addEventListener('mousedown', (e) => {
      isDraggingOverlay = true;
      overlayDragOffset = {
        x: e.clientX - overlay.offsetLeft,
        y: e.clientY - overlay.offsetTop,
      };
      overlay.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (isDraggingOverlay) {
        const newX = e.clientX - overlayDragOffset.x;
        const newY = e.clientY - overlayDragOffset.y;
        overlay.style.left = `${Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, newX))}px`;
        overlay.style.top = `${Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, newY))}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isDraggingOverlay = false;
      overlay.style.cursor = 'default';
    });

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (document.getElementById(`pip-overlay-${block.id}`)) {
        overlay.remove();
        window.dispatchEvent(new CustomEvent('pipClosed', { detail: { blockId: block.id } }));
      }
    }, 30000);
    
    return true; // Indicate success
  };

  const getBlockColor = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'bg-red-500': '#ef4444',
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981',
      'bg-yellow-500': '#f59e0b',
      'bg-purple-500': '#8b5cf6',
      'bg-pink-500': '#ec4899',
    };
    return colorMap[colorClass] || '#6b7280';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && draggedBlock) {
        // Throttle với requestAnimationFrame để smooth
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        animationRef.current = requestAnimationFrame(() => {
          // Tính toán vị trí mới dựa trên offset
          const newX = e.clientX - dragOffset.x;
          const newY = e.clientY - dragOffset.y;
          
          // Update block position với smooth animation
          setBlocks(prevBlocks => 
            prevBlocks.map(block => 
              block.id === draggedBlock.id 
                ? { ...block, x: newX, y: newY }
                : block
            )
          );

          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
          };
          
          const threshold = 50; // pixels from edge
          const nearEdge = 
            e.clientX < threshold || 
            e.clientX > viewport.width - threshold ||
            e.clientY < threshold || 
            e.clientY > viewport.height - threshold;

          setShowDropZone(nearEdge);
          
          // Show PiP option when dragging near edge
          setShowPipOption(nearEdge);
          
          // Auto-create PiP when dragging near edge for 1.5 seconds
          if (nearEdge && !timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
              if (draggedBlock && isDragging) {
                handleCreatePiP(draggedBlock);
              }
            }, 1500);
          } else if (!nearEdge && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        });
      }
    };

    const handleMouseUp = () => {
      setDraggedBlock(null);
      setShowDropZone(false);
      setIsDragging(false);
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
  }, [isDragging, draggedBlock, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent, block: DragBlock) => {
    e.preventDefault();
    
    // Tính toán offset từ vị trí click đến góc trái trên của block
    // Sử dụng block.x, block.y thay vì getBoundingClientRect()
    setDragOffset({
      x: e.clientX - block.x,
      y: e.clientY - block.y,
    });
    
    setDraggedBlock(block);
    setIsDragging(true);
  };

  const handleDoubleClick = (e: React.MouseEvent, block: DragBlock) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('👆 Double-click detected on:', block.content);
    // Double-click to create PiP directly
    handleCreatePiP(block);
  };

  const handleCreatePiP = async (block: DragBlock) => {
    try {
      // Reset drag state first
      setDraggedBlock(null);
      setIsDragging(false);
      setShowDropZone(false);
      setShowPipOption(false);
      
      // Show creating notification
      setPipNotification(`🎬 Đang tạo Picture-in-Picture cho ${block.content}...`);
      
      // Add to PiP blocks
      setPipBlocks(prev => [...prev, block]);
      
      // Create PiP window
      const pipResult = await createPipWindow(block);
      
      // Wait a bit for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (pipResult || document.getElementById(`pip-overlay-${block.id}`)) {
        // Only remove from main view if PiP was created successfully
        setBlocks(prev => prev.filter(b => b.id !== block.id));
        const pipType = pipResult === 'overlay' ? 'Floating Overlay' : 'Native PiP Window';
        setPipNotification(`✅ ${block.content} đã được tạo ${pipType}!`);
        setTimeout(() => setPipNotification(null), 3000);
        console.log(`✅ PiP created successfully for ${block.content} (${pipType})`);
      } else {
        // If PiP creation failed, don't remove from main view
        setPipBlocks(prev => prev.filter(b => b.id !== block.id));
        setPipNotification(`❌ Không thể tạo Picture-in-Picture cho ${block.content}`);
        setTimeout(() => setPipNotification(null), 3000);
        console.log(`❌ PiP creation failed for ${block.content}`);
      }
      
    } catch (error) {
      console.error('Failed to create PiP:', error);
      // Reset states on failure
      setDraggedBlock(null);
      setIsDragging(false);
      setShowDropZone(false);
      setShowPipOption(false);
      setPipBlocks(prev => prev.filter(b => b.id !== block.id));
    }
  };

  const handleReset = () => {
    // Reset all states
    setDraggedBlock(null);
    setIsDragging(false);
    setShowDropZone(false);
    setShowPipOption(false);
    setPipBlocks([]);
    
    // Remove all PiP overlays
    const pipOverlays = document.querySelectorAll('[id^="pip-overlay-"]');
    pipOverlays.forEach(overlay => overlay.remove());
    
    // Close PiP window if exists
    if (pipWindowRef.current) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
    }
    
    // Reset blocks to initial state
    setBlocks([
      { id: '1', content: 'Block 1', color: 'bg-red-500', x: 100, y: 100 },
      { id: '2', content: 'Block 2', color: 'bg-blue-500', x: 250, y: 150 },
      { id: '3', content: 'Block 3', color: 'bg-green-500', x: 150, y: 250 },
    ]);
    
    // Show reset notification
    setPipNotification('🔄 Demo đã được reset!');
    setTimeout(() => setPipNotification(null), 2000);
  };



  // Check for received block from URL or localStorage
  useEffect(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const blockId = urlParams.get('blockId');
    const content = urlParams.get('content');
    const color = urlParams.get('color');
    const source = urlParams.get('source');

    if (blockId && content && color && source === 'drag-drop') {
      const receivedBlock: DragBlock = {
        id: blockId,
        content: content,
        color: color,
        x: window.innerWidth / 2 - 50,
        y: window.innerHeight / 2 - 25,
      };
      
      setBlocks([receivedBlock]);
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Check localStorage
    if (browserSupport.localStorage) {
      const savedBlock = localStorage.getItem('draggedBlock');
      const timestamp = localStorage.getItem('dragTimestamp');
      
      if (savedBlock && timestamp) {
        const timeDiff = Date.now() - parseInt(timestamp);
        if (timeDiff < 5000) { // 5 seconds timeout
          const block: DragBlock = JSON.parse(savedBlock);
          setBlocks([{
            ...block,
            x: window.innerWidth / 2 - 50,
            y: window.innerHeight / 2 - 25,
          }]);
        }
        
        // Clean localStorage
        localStorage.removeItem('draggedBlock');
        localStorage.removeItem('dragTimestamp');
      }
    }

    // Listen for postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'DRAGGED_BLOCK') {
        const block = event.data.block;
        setBlocks([{
          ...block,
          x: window.innerWidth / 2 - 50,
          y: window.innerHeight / 2 - 25,
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Listen for PiP window close
    const handlePipClosed = (event: CustomEvent) => {
      const blockId = event.detail.blockId;
      const pipBlock = pipBlocks.find(block => block.id === blockId);
      if (pipBlock) {
        // Restore block to main view
        setBlocks(prev => [...prev, { ...pipBlock, x: 100, y: 100 }]);
        setPipBlocks(prev => prev.filter(block => block.id !== blockId));
      }
    };
    
    window.addEventListener('pipClosed', handlePipClosed as EventListener);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('pipClosed', handlePipClosed as EventListener);
    };
  }, [pipBlocks]);

  // Auto-trigger PiP functionality
  useEffect(() => {
    if (!autoTriggerEnabled || blocks.length === 0 || pipBlocks.length > 0) return;

    const startAutoTrigger = () => {
      if (autoTriggerTimeoutRef.current) {
        clearTimeout(autoTriggerTimeoutRef.current);
      }

      if (triggerMethod === 'timer') {
        // Auto-trigger after 5 seconds
        let countdownValue = 5;
        setCountdown(countdownValue);

        const countdownInterval = setInterval(() => {
          countdownValue--;
          setCountdown(countdownValue);
          
          if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            setCountdown(null);
            if (blocks.length > 0) {
              console.log('⏰ Auto-triggering PiP via timer');
              handleCreatePiP(blocks[0]);
            }
          }
        }, 1000);

        autoTriggerTimeoutRef.current = countdownInterval as unknown as number;
      } 
      
      else if (triggerMethod === 'idle') {
        // Auto-trigger after 3 seconds of no activity
        const checkIdle = () => {
          const timeSinceLastActivity = Date.now() - lastActivityRef.current;
          if (timeSinceLastActivity >= 3000 && blocks.length > 0) {
            console.log('😴 Auto-triggering PiP due to idle');
            handleCreatePiP(blocks[0]);
          } else {
            idleTimeoutRef.current = setTimeout(checkIdle, 500);
          }
        };
        
        idleTimeoutRef.current = setTimeout(checkIdle, 500);
      }
    };

    startAutoTrigger();

    return () => {
      if (autoTriggerTimeoutRef.current) {
        clearTimeout(autoTriggerTimeoutRef.current);
        clearInterval(autoTriggerTimeoutRef.current);
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      setCountdown(null);
    };
  }, [autoTriggerEnabled, triggerMethod, blocks.length, pipBlocks.length]);

  // Track user activity for idle detection
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    if (triggerMethod === 'idle') {
      document.addEventListener('mousemove', updateActivity);
      document.addEventListener('keydown', updateActivity);
      document.addEventListener('click', updateActivity);
    }

    return () => {
      document.removeEventListener('mousemove', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('click', updateActivity);
    };
  }, [triggerMethod]);

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Drag & Drop Demo</h1>
            <p className="text-gray-600">Kéo thả block ra khỏi màn hình để tạo Picture-in-Picture</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {/* Auto-trigger toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoTriggerEnabled}
                onChange={(e) => setAutoTriggerEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Auto PiP</span>
            </label>

            {/* Trigger method selector */}
            <select
              value={triggerMethod}
              onChange={(e) => setTriggerMethod(e.target.value as 'timer' | 'hover' | 'idle' | 'manual')}
              disabled={!autoTriggerEnabled}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              <option value="timer">⏰ Timer (5s)</option>
              <option value="hover">🖱️ Hover</option>
              <option value="idle">😴 Idle (3s)</option>
              <option value="manual">👆 Manual</option>
            </select>

            {/* Countdown display */}
            {countdown !== null && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-mono">
                ⏰ {countdown}s
              </span>
            )}

            <button
              onClick={() => {
                console.log('🎬 Test PiP button clicked');
                console.log('📊 Current blocks:', blocks);
                if (blocks.length > 0) {
                  handleCreatePiP(blocks[0]);
                }
              }}
              disabled={blocks.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              🎬 Test PiP
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Reset Demo
            </button>
          </div>
        </div>
        
        {/* Browser Support Status */}
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className={`px-2 py-1 rounded ${browserSupport.dragAPI ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Drag API: {browserSupport.dragAPI ? '✅' : '❌'}
          </span>
          <span className={`px-2 py-1 rounded ${browserSupport.documentPiP ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            Document PiP: {browserSupport.documentPiP ? '✅' : '🔄 Fallback'}
          </span>
          <span className={`px-2 py-1 rounded ${browserSupport.localStorage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            LocalStorage: {browserSupport.localStorage ? '✅' : '❌'}
          </span>
          <span className={`px-2 py-1 rounded ${browserSupport.postMessage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            PostMessage: {browserSupport.postMessage ? '✅' : '❌'}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div 
        ref={containerRef} 
        className="relative w-full h-full"
        style={{ 
          cursor: isDragging ? 'grabbing' : 'default',
          userSelect: 'none'
        }}
      >
        {/* Draggable Blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`absolute w-24 h-12 ${block.color} rounded-lg shadow-lg cursor-move flex items-center justify-center text-white font-semibold select-none hover:shadow-xl ${
              isDragging && draggedBlock?.id === block.id 
                ? 'z-50 scale-110 shadow-2xl' 
                : 'z-10 transition-all duration-200'
            }`}
            style={{
              left: block.x,
              top: block.y,
              transform: isDragging && draggedBlock?.id === block.id 
                ? 'rotate(5deg) scale(1.1)' 
                : 'rotate(0deg) scale(1)',
              transition: isDragging && draggedBlock?.id === block.id 
                ? 'none' 
                : 'transform 0.2s ease, box-shadow 0.2s ease',
              willChange: isDragging && draggedBlock?.id === block.id ? 'transform' : 'auto',
            }}
            onMouseDown={(e) => handleMouseDown(e, block)}
            onDoubleClick={(e) => handleDoubleClick(e, block)}
            onMouseEnter={() => {
              if (triggerMethod === 'hover' && autoTriggerEnabled && pipBlocks.length === 0) {
                console.log('🖱️ Auto-triggering PiP via hover on:', block.content);
                handleCreatePiP(block);
              }
            }}
            title={
              triggerMethod === 'hover' 
                ? 'Hover to create PiP' 
                : 'Double-click to create PiP'
            }
          >
            {block.content}
          </div>
        ))}

        {/* Drop Zone Indicator */}
        {showDropZone && (
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-4 border-blue-500 border-dashed animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <p className="text-lg font-semibold text-gray-800">
                    🎬 Thả vào đây để tạo Picture-in-Picture!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PiP Option Indicator */}
        {showPipOption && !showDropZone && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg pointer-events-none">
            <p className="text-sm font-medium">📺 Preparing Picture-in-Picture...</p>
          </div>
        )}

        {/* PiP Blocks Counter */}
        {pipBlocks.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">
              🎬 {pipBlocks.length} block{pipBlocks.length > 1 ? 's' : ''} in Picture-in-Picture
            </p>
          </div>
        )}

        {/* PiP Notification */}
        {pipNotification && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50">
            <p className="text-sm font-medium">{pipNotification}</p>
          </div>
        )}

        {/* Auto-trigger Status */}
        {autoTriggerEnabled && triggerMethod !== 'manual' && blocks.length > 0 && pipBlocks.length === 0 && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">
              {triggerMethod === 'timer' && countdown !== null && `⏰ Auto PiP in ${countdown}s`}
              {triggerMethod === 'hover' && '🖱️ Hover any block for Auto PiP'}
              {triggerMethod === 'idle' && '😴 Auto PiP when idle (3s)'}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-4 shadow-lg max-w-md">
          <h3 className="font-semibold text-gray-800 mb-2">Auto PiP Methods:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>⏰ Timer:</strong> Tự động tạo PiP sau 5 giây</li>
            <li>• <strong>🖱️ Hover:</strong> Hover vào block để tạo PiP ngay lập tức</li>
            <li>• <strong>😴 Idle:</strong> Tự động tạo PiP sau 3 giây không có hoạt động</li>
            <li>• <strong>👆 Manual:</strong> Chỉ tạo PiP khi click/double-click</li>
            <li>• <strong>Drag to edge:</strong> Kéo gần viền → giữ 1.5s → auto PiP</li>
            <li>• Bật/tắt <strong>"Auto PiP"</strong> để control tự động</li>
          </ul>
        </div>

        {/* Debug Panel */}
        <div className="absolute bottom-4 right-4 bg-gray-800 text-white rounded-lg p-3 shadow-lg text-xs max-w-xs">
          <h4 className="font-semibold mb-1">Debug Info:</h4>
          <div className="space-y-1">
            <div>Blocks: {blocks.length}</div>
            <div>PiP Blocks: {pipBlocks.length}</div>
            <div>Auto PiP: {autoTriggerEnabled ? 'ON' : 'OFF'}</div>
            <div>Trigger: {triggerMethod}</div>
            {countdown !== null && <div>Countdown: {countdown}s</div>}
            <div>Dragging: {isDragging ? 'Yes' : 'No'}</div>
            <div>Document PiP: {browserSupport.documentPiP ? 'Yes' : 'No'}</div>
            <div>PiP Overlays: {document.querySelectorAll('[id^="pip-overlay-"]').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropDemo; 
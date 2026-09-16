import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, ChefHat, LayoutDashboard, LogOut, 
  Plus, Minus, Trash2, CheckCircle2, Circle, ArrowRight
} from 'lucide-react';

// --- MOCK DATA & CONSTANTS ---
const MENU_ITEMS = [
  { id: 1, name: 'เมี่ยงปลาทู', price: 50, type: 'food', defaultIngredients: ['ผักสด', 'น้ำจิ้มเมี่ยง', 'เส้นหมี่', 'ปลาทู'], sauceOptions: ['น้ำจิ้มเมี่ยงสูตรร้าน', 'น้ำยำขนมจีน'] },
  { id: 2, name: 'เมี่ยงหมูสามชั้น', price: 50, type: 'food', defaultIngredients: ['ผักสด', 'น้ำจิ้มเมี่ยง', 'เส้นหมี่', 'หมูสามชั้น'], sauceOptions: ['น้ำจิ้มเมี่ยงสูตรร้าน', 'น้ำยำขนมจีน'] },
  { id: 3, name: 'เมี่ยงหมูกรอบ', price: 60, type: 'food', defaultIngredients: ['ผักสด', 'น้ำจิ้มเมี่ยง', 'เส้นหมี่', 'หมูกรอบ'], sauceOptions: ['น้ำจิ้มเมี่ยงสูตรร้าน', 'น้ำยำขนมจีน'] },
  { id: 4, name: 'เมี่ยงกุ้ง', price: 70, type: 'food', defaultIngredients: ['ผักสด', 'น้ำจิ้มเมี่ยง', 'เส้นหมี่', 'กุ้ง'], sauceOptions: ['น้ำจิ้มเมี่ยงสูตรร้าน', 'น้ำยำขนมจีน'] },
  { id: 5, name: 'ยำขนมจีน', price: 50, type: 'food', defaultIngredients: ['ผักสด (ผักสลัดซอย, พริก, หอมแดง, ถั่วฝักยาว, ผักชีใบเลื่อย)', 'หมูสับ', 'หมูยอ', 'ปลาทู'], sauceOptions: ['น้ำยำขนมจีน', 'น้ำจิ้มเมี่ยงสูตรร้าน'] },
  { id: 6, name: 'น้ำจิ้มแบบขวด', price: 45, type: 'special', defaultIngredients: [], sauceOptions: ['น้ำจิ้มเมี่ยงสูตรร้าน', 'น้ำยำขนมจีน'] }
];

const ADDONS = [
  { id: 'a1', name: 'เพิ่มปลาทู', price: 20 },
  { id: 'a2', name: 'เพิ่มหมูกรอบ', price: 20 },
  { id: 'a3', name: 'เพิ่มน้ำจิ้มกระปุก', price: 10 },
];

const FREE_SWAPS = [
  { id: 's1', label: 'ปกติ (ไม่สลับ)' },
  { id: 's2', label: 'ไม่เอาเส้น ขอเปลี่ยนเป็นผักเพิ่ม' },
  { id: 's3', label: 'ไม่เอาผัก ขอเปลี่ยนเป็นเส้นเพิ่ม' }
];

// Mock Orders for Admin Dashboard
const MOCK_ORDERS = [
  { id: 'ORD-001', customerName: 'คุณเอ', items: [{ name: 'เมี่ยงปลาทู', price: 50, qty: 1 }], total: 50, isPaid: true, date: new Date().toISOString() },
  { id: 'ORD-002', customerName: 'คุณบี', items: [{ name: 'เมี่ยงหมูกรอบ', price: 80, qty: 1 }], total: 80, isPaid: false, date: new Date().toISOString() }
];

export default function App() {
  // --- GLOBAL STATES ---
  const [currentView, setCurrentView] = useState('login'); // login, customer, admin
  const [customerName, setCustomerName] = useState('');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  
  // --- MODAL STATES ---
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [activeAddons, setActiveAddons] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(FREE_SWAPS[0].label);
  const [selectedSauce, setSelectedSauce] = useState('');
  const [specialNote, setSpecialNote] = useState('');

  // --- HELPER FUNCTIONS ---
  const handleOpenModal = (item) => {
    setSelectedMenuItem(item);
    setActiveIngredients([...item.defaultIngredients]);
    setActiveAddons([]);
    setSelectedSwap(FREE_SWAPS[0].label);
    setSelectedSauce(item.sauceOptions[0] || '');
    setSpecialNote('');
    setIsModalOpen(true);
  };

  const calculateItemTotal = () => {
    if (!selectedMenuItem) return 0;
    const addonsTotal = activeAddons.reduce((sum, addonId) => {
      const addon = ADDONS.find(a => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
    return selectedMenuItem.price + addonsTotal;
  };

  const handleAddToCart = () => {
    const newItem = {
      cartId: Math.random().toString(36).substr(2, 9),
      menuItem: selectedMenuItem,
      ingredients: activeIngredients,
      addons: activeAddons.map(id => ADDONS.find(a => a.id === id)),
      swap: selectedSwap,
      sauce: selectedSauce,
      note: specialNote,
      price: calculateItemTotal(),
    };
    setCart([...cart, newItem]);
    setIsModalOpen(false);
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0),
      isPaid: false,
      date: new Date().toISOString()
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    alert('ส่งออเดอร์เรียบร้อยแล้ว!');
  };

  // --- RENDER VIEWS ---

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center border-t-8 border-green-600">
          <ChefHat className="w-20 h-20 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">สวนสลัดหลังบ้าน</h1>
          <p className="text-gray-500 mb-8">กรุณากรอกชื่อของคุณเพื่อเริ่มสั่งอาหาร</p>
          <input
            type="text"
            placeholder="ชื่อลูกค้า..."
            className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:outline-none mb-4 text-lg"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <button
            disabled={!customerName.trim()}
            onClick={() => setCurrentView('customer')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            เข้าสู่เมนู <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const pin = prompt('กรุณากรอกรหัสผ่าน Admin (PIN):');
              if (pin === '987654') setCurrentView('admin');
              else if (pin) alert('รหัสผ่านไม่ถูกต้อง!');
            }}
            className="mt-6 text-sm text-gray-400 hover:text-green-600 underline"
          >
            สำหรับผู้ดูแลระบบ (Admin)
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    const today = new Date().toISOString().split('T')[0];
    const dailyRev = orders.filter(o => o.isPaid && o.date.startsWith(today)).reduce((sum, o) => sum + o.total, 0);
    const monthlyRev = orders.filter(o => o.isPaid && o.date.startsWith(today.slice(0, 7))).reduce((sum, o) => sum + o.total, 0);

    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="text-green-600" /> Admin Dashboard
              </h1>
              <p className="text-gray-500">จัดการออเดอร์ร้านสวนสลัดหลังบ้าน</p>
            </div>
            <button onClick={() => setCurrentView('login')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <LogOut className="w-4 h-4" /> ออกจากระบบ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold mb-1">ยอดขายวันนี้ (Paid)</p>
              <p className="text-3xl font-bold text-green-600">฿{dailyRev}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold mb-1">ยอดขายเดือนนี้ (Paid)</p>
              <p className="text-3xl font-bold text-blue-600">฿{monthlyRev}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-semibold mb-1">จำนวนออเดอร์ทั้งหมด</p>
              <p className="text-3xl font-bold text-purple-600">{orders.length} บิล</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4">รหัสบิล</th>
                  <th className="p-4">ชื่อลูกค้า</th>
                  <th className="p-4">รายการ</th>
                  <th className="p-4">ยอดรวม</th>
                  <th className="p-4">สถานะการชำระเงิน</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">{order.id}</td>
                    <td className="p-4 font-semibold">{order.customerName}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.items.map((item, idx) => (
                        <div key={idx}>{item.name || item.menuItem?.name}</div>
                      ))}
                    </td>
                    <td className="p-4 font-bold text-gray-800">฿{order.total}</td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setOrders(orders.map(o => o.id === order.id ? { ...o, isPaid: !o.isPaid } : o));
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {order.isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        {order.isPaid ? 'ชำระเงินแล้ว' : 'รอชำระเงิน'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- CUSTOMER VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-green-700 flex items-center gap-2">
              <ChefHat className="w-6 h-6" /> สวนสลัดหลังบ้าน
            </h1>
            <p className="text-sm text-gray-500">สวัสดี, คุณ {customerName}</p>
          </div>
          <button 
            onClick={() => {
              const pin = prompt('กรุณากรอกรหัสผ่าน Admin (PIN):');
              if (pin === '987654') setCurrentView('admin');
              else if (pin) alert('รหัสผ่านไม่ถูกต้อง!');
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Menu */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-2">รายการอาหาร</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MENU_ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                <p className="text-green-600 font-semibold">฿{item.price}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.defaultIngredients.join(', ')}</p>
              </div>
              <button 
                onClick={() => handleOpenModal(item)}
                className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white p-2 rounded-lg font-bold transition flex items-center gap-1"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" /> ตะกร้าของฉัน ({cart.length})
              </h3>
              <p className="font-bold text-xl text-green-600">฿{cart.reduce((s, i) => s + i.price, 0)}</p>
            </div>
            
            <div className="max-h-32 overflow-y-auto mb-3 text-sm">
              {cart.map(item => (
                <div key={item.cartId} className="flex justify-between items-start border-b border-gray-50 py-2">
                  <div>
                    <p className="font-semibold text-gray-800">{item.menuItem.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.ingredients.length === 0 ? 'ไม่ใส่เครื่องเลย' : `เครื่อง: ${item.ingredients.length} อย่าง`}
                      {item.addons.length > 0 && ` | เพิ่ม: ${item.addons.map(a => a.name).join(', ')}`}
                    </p>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSubmitOrder}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
            >
              ส่งออเดอร์ (Submit Order)
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {isModalOpen && selectedMenuItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white md:rounded-t-2xl z-10">
              <div>
                <h3 className="font-bold text-xl">{selectedMenuItem.name}</h3>
                <p className="text-green-600 font-semibold">เริ่มต้น ฿{selectedMenuItem.price}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-6 flex-1">
              {/* Default Ingredients */}
              {selectedMenuItem.defaultIngredients.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-800">เครื่องพื้นฐาน (ติ๊กออกได้)</h4>
                    <button 
                      onClick={() => setActiveIngredients([])}
                      className="text-xs text-red-500 border border-red-500 rounded px-2 py-1 hover:bg-red-50"
                    >
                      ไม่เอาเครื่องเลย (Clear All)
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMenuItem.defaultIngredients.map(ing => (
                      <label key={ing} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded border border-gray-100 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded text-green-600 focus:ring-green-500"
                          checked={activeIngredients.includes(ing)}
                          onChange={(e) => {
                            if (e.target.checked) setActiveIngredients([...activeIngredients, ing]);
                            else setActiveIngredients(activeIngredients.filter(i => i !== ing));
                          }}
                        />
                        {ing}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Swaps */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">สลับเครื่อง (ไม่บวกเพิ่ม)</h4>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-green-500"
                  value={selectedSwap}
                  onChange={(e) => setSelectedSwap(e.target.value)}
                >
                  {FREE_SWAPS.map(swap => (
                    <option key={swap.id} value={swap.label}>{swap.label}</option>
                  ))}
                </select>
              </div>

              {/* Add-ons */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">เพิ่มท็อปปิ้ง (คิดเงินเพิ่ม)</h4>
                <div className="space-y-2">
                  {ADDONS.map(addon => (
                    <label key={addon.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          className="rounded text-green-600 focus:ring-green-500"
                          checked={activeAddons.includes(addon.id)}
                          onChange={(e) => {
                            if (e.target.checked) setActiveAddons([...activeAddons, addon.id]);
                            else setActiveAddons(activeAddons.filter(id => id !== addon.id));
                          }}
                        />
                        <span className="text-sm">{addon.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">+฿{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sauce Options */}
              {selectedMenuItem.sauceOptions.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">เลือกน้ำจิ้ม</h4>
                  <div className="flex flex-col gap-2">
                    {selectedMenuItem.sauceOptions.map(sauce => (
                      <label key={sauce} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="radio" 
                          name="sauce"
                          className="text-green-600 focus:ring-green-500"
                          checked={selectedSauce === sauce}
                          onChange={() => setSelectedSauce(sauce)}
                        />
                        {sauce}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <h4 className="font-bold text-gray-800 mb-2">หมายเหตุเพิ่มเติม</h4>
                <textarea 
                  rows="2"
                  placeholder="เช่น เผ็ดน้อย, ไม่ใส่ผักชี..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-green-500"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 md:rounded-b-2xl">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex justify-between items-center px-4"
              >
                <span>เพิ่มลงตะกร้า</span>
                <span>฿{calculateItemTotal()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
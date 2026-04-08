// Restaurant.jsx - Restaurant Page (Pure JavaScript)
import React, { useState } from "react";
import { FoodCard } from "../../components/website/FoodCard.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ShoppingCart, X, Truck, Building2 } from "lucide-react";

const MENU = {
  Foods: [
    { id: 1, name: "Wagyu Beef Steak", price: 89.99, description: "Premium A5 Wagyu steak with roasted garlic mashed potatoes and red wine jus.", image: "https://images.unsplash.com/photo-1770005639914-e57bd01d86d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwc3RlYWslMjBwbGF0ZWQlMjBmaW5lJTIwZGluaW5nfGVufDF8fHx8MTc3MjYwMjEyNHww&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 2, name: "Grilled Sea Bass", price: 42.99, description: "Pan-seared sea bass with lemon butter sauce and seasonal vegetables.", image: "https://images.unsplash.com/photo-1709389883900-b0b34592ba11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2VhJTIwYmFzcyUyMHJlc3RhdXJhbnQlMjBwbGF0ZXxlbnwxfHx8fDE3NzI2MDIxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 3, name: "Truffle Risotto", price: 38.99, description: "Creamy Arborio rice with black truffle shavings and aged parmesan.", image: "https://images.unsplash.com/photo-1673720111785-4f189a234616?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVmZmxlJTIwcmlzb3R0byUyMGl0YWxpYW4lMjBjdWlzaW5lfGVufDF8fHx8MTc3MjYwMjEyNHww&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 4, name: "Lobster Thermidor", price: 72.99, description: "Classic French lobster dish with creamy mustard sauce au gratin.", image: "https://images.unsplash.com/photo-1695606452818-f22013a5c2de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2JzdGVyJTIwc2VhZm9vZCUyMGx1eHVyeSUyMHBsYXRlZHxlbnwxfHx8fDE3NzI2MDIxMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 5, name: "Eggs Benedict Royale", price: 28.99, description: "Poached eggs with smoked salmon on toasted brioche with hollandaise.", image: "https://images.unsplash.com/photo-1729223921099-7a8a72955baa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ2dzJTIwYmVuZWRpY3QlMjBicnVuY2glMjBlbGVnYW50fGVufDF8fHx8MTc3MjYwMjEyNnww&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 6, name: "Penne Arrabiata", price: 32.99, description: "Al dente penne in a spicy tomato sauce with fresh basil and parmesan.", image: "https://images.unsplash.com/photo-1761315601031-f31099c14dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwcGFzdGElMjBkaXNoJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NzI1ODEyOTd8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 7, name: "Herb-Crusted Chicken", price: 36.99, description: "Oven-roasted chicken breast with rosemary, thyme, and garlic butter.", image: "https://images.unsplash.com/photo-1762631934518-f75e233413ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMGZpbmUlMjBkaW5pbmd8ZW58MXx8fHwxNzcyNjAyMTI2fDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 8, name: "Chocolate Lava Cake", price: 18.99, description: "Warm molten chocolate cake with vanilla bean ice cream and berry coulis.", image: "https://images.unsplash.com/photo-1763316727676-3f3b96188def?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBkZXNzZXJ0JTIwbHV4dXJ5JTIwY2FrZXxlbnwxfHx8fDE3NzI2MDIxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  ],
  Drinks: [
    { id: 9, name: "Signature Cocktail", price: 18.99, description: "House special blend with premium spirits, fresh citrus, and herbs.", image: "https://images.unsplash.com/photo-1768508947605-8c7a50aed683?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGx1eHVyeSUyMGRyaW5rc3xlbnwxfHx8fDE3NzI2MDIxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 10, name: "Premium Red Wine", price: 32.99, description: "Curated red wines from renowned vineyards around the world.", image: "https://images.unsplash.com/photo-1765850258962-61c55ba2be3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB3aW5lJTIwZ2xhc3MlMjB2aW5leWFyZCUyMHByZW1pdW18ZW58MXx8fHwxNzcyNjAyMTI4fDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 11, name: "Tropical Fresh Juice", price: 12.99, description: "Freshly squeezed blend of mango, passion fruit, and pineapple.", image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGp1aWNlJTIwc21vb3RoaWUlMjB0cm9waWNhbHxlbnwxfHx8fDE3NzI2MDIxMjh8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 12, name: "Artisan Espresso", price: 8.99, description: "Single-origin specialty coffee with rich crema and bold flavor.", image: "https://images.unsplash.com/photo-1623086923609-594e98bb0bff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZSUyMGxhdHRlJTIwYXJ0fGVufDF8fHx8MTc3MjUwMzI4MXww&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 13, name: "Classic Mojito", price: 16.99, description: "Refreshing Cuban cocktail with white rum, fresh mint, and lime.", image: "https://images.unsplash.com/photo-1676105797000-323c37de780c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2ppdG8lMjBjb2NrdGFpbCUyMGZyZXNoJTIwbWludHxlbnwxfHx8fDE3NzI2MDIxMjl8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { id: 14, name: "Craft Beer Selection", price: 14.99, description: "Rotating selection of premium craft beers from local and international breweries.", image: "https://images.unsplash.com/photo-1636735117050-4ca3b871cc5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdCUyMGJlZXIlMjBwcmVtaXVtJTIwZ2xhc3MlMjBiYXJ8ZW58MXx8fHwxNzcyNjAyMTI5fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  ],
};

const categories = Object.keys(MENU);

export function Restaurant({ onOrder }) {
  const [activeCategory, setActiveCategory] = useState("Foods");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [delivery, setDelivery] = useState("room");

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + item.quantity } : c);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#0F172A] py-20 text-center">
        <p className="text-[#D4AF37] tracking-[0.3em] uppercase text-sm mb-3">Culinary Excellence</p>
        <h1 className="text-4xl md:text-5xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Restaurant
        </h1>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Savor extraordinary flavors crafted by our world-class chefs.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#1E3A8A] text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {MENU[activeCategory].map((item) => (
            <FoodCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-[#D4AF37] text-[#0F172A] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative hover:scale-110 transition-transform cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-[#1E3A8A] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        )}

        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
            <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <h2 className="text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>Your Order</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-[#F8FAFC] rounded-lg p-3">
                    <div>
                      <p className="text-sm text-[#0F172A]">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#1E3A8A]">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">Delivery Option</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDelivery("room")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-all cursor-pointer ${
                        delivery === "room" ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#0F172A]" : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <Truck className="w-4 h-4" /> Room Delivery
                    </button>
                    <button
                      onClick={() => setDelivery("pickup")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm transition-all cursor-pointer ${
                        delivery === "pickup" ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#0F172A]" : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> Pickup
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl text-[#0F172A]" style={{ fontFamily: "DM Serif Display, serif" }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => onOrder({ items: cart, delivery, total })}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

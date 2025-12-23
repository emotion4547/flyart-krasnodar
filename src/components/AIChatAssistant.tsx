import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  price_old?: number;
  image?: string;
  is_hit?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

const ProductCard = ({ product }: { product: Product }) => (
  <Link 
    to={`/product/${product.slug}`}
    className="block bg-background border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
  >
    {product.image && (
      <div className="aspect-square bg-muted">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
    )}
    <div className="p-2">
      <p className="text-xs font-medium line-clamp-2 mb-1">{product.title}</p>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-primary">{product.price}₽</span>
        {product.price_old && (
          <span className="text-xs text-muted-foreground line-through">{product.price_old}₽</span>
        )}
      </div>
    </div>
  </Link>
);

const ProductsGrid = ({ products }: { products: Product[] }) => (
  <div className="grid grid-cols-2 gap-2 mt-2">
    {products.map(product => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);

const QUICK_SUGGESTIONS = [
  { label: '🎂 Шары на ДР', query: 'Покажи шары на день рождения' },
  { label: '💒 На свадьбу', query: 'Какие есть шары для свадьбы?' },
  { label: '👶 Выписка', query: 'Шары для выписки из роддома' },
  { label: '🚚 Доставка', query: 'Расскажи про доставку и цены' },
];

export const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Привет! 🎈 Я помощник магазина FlyArt. Помогу выбрать воздушные шары, покажу товары из каталога, расскажу о доставке и ценах. Что вас интересует?'
      }]);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setShowSuggestions(false);
    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';
    let products: Product[] = [];

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке сообщения');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '', products: [] }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Check if this is a products event
            if (parsed.type === 'products' && parsed.products) {
              products = parsed.products;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { 
                  ...updated[updated.length - 1], 
                  products 
                };
                return updated;
              });
              continue;
            }
            
            // Regular text delta
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { 
                  role: 'assistant', 
                  content: assistantContent,
                  products
                };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, will be handled in next chunk
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Извините, произошла ошибка. Пожалуйста, попробуйте ещё раз или позвоните нам.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className={cn(
        "fixed bottom-[7.5rem] right-6 z-50",
        isOpen && "scale-0 opacity-0 pointer-events-none"
      )}>
        <div className="relative">
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-foreground text-sm font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            ИИ помощник
          </span>
          <button
            onClick={handleOpen}
            className="h-16 w-16 rounded-full shadow-xl bg-tiffany hover:bg-tiffany-dark text-white flex items-center justify-center transition-all duration-300"
            aria-label="Открыть чат с ассистентом"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-background border border-border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden",
          "flex flex-col",
          isOpen ? "opacity-100 scale-100 h-[550px] max-h-[85vh]" : "opacity-0 scale-95 h-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-xl">🎈</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Помощник FlyArt</h3>
              <p className="text-xs opacity-80">Помогу выбрать шары</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            aria-label="Закрыть чат"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col",
                  message.role === 'user' ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.content || (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
                {message.products && message.products.length > 0 && (
                  <div className="w-full max-w-[85%] mt-2">
                    <ProductsGrid products={message.products} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mt-3 px-1">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => sendMessage(suggestion.query)}
                  disabled={isLoading}
                  className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

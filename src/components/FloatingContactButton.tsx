import { useState } from "react";
import { Phone, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import balloonIcon from "@/assets/balloon-icon.png";

interface MessengerChannel {
  type: string;
  value: string;
  label: string;
  enabled: boolean;
}

interface MessengerLinks {
  channels: MessengerChannel[];
}

const defaultChannels: MessengerChannel[] = [
  { type: 'phone', value: '+79237714004', label: 'Позвонить', enabled: true },
  { type: 'whatsapp', value: '79237714004', label: 'WhatsApp', enabled: true },
  { type: 'telegram', value: 'FlyArtKRSK', label: 'Telegram', enabled: true },
  { type: 'vk', value: 'flyart_krasnoyarsk', label: 'ВКонтакте', enabled: true },
  { type: 'max', value: 'f9LHodD0cOIgsBJYhwYzvgXVZQEOZWcZYTilnvjWf02P4dHFbb4aELVqSGQ', label: 'MAX', enabled: true },
];

const getChannelUrl = (type: string, value: string): string => {
  switch (type) {
    case 'phone':
      return `tel:${value.replace(/\s/g, '')}`;
    case 'whatsapp':
      return `https://wa.me/${value}`;
    case 'telegram':
      return `https://t.me/${value}`;
    case 'vk':
      return `https://vk.com/${value}`;
    case 'max':
      return `https://max.ru/u/${value}`;
    default:
      return value;
  }
};

const getChannelIcon = (type: string) => {
  switch (type) {
    case 'phone':
      return (
        <Phone className="h-6 w-6" />
      );
    case 'whatsapp':
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    case 'telegram':
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      );
    case 'vk':
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.591 4 8.172c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.847 2.456 2.278 4.606 2.86 4.606.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
        </svg>
      );
    case 'max':
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
        </svg>
      );
    default:
      return <MessageCircle className="h-6 w-6" />;
  }
};

const getChannelColor = (type: string): string => {
  switch (type) {
    case 'phone':
      return 'bg-foreground text-background';
    case 'whatsapp':
      return 'bg-[#25D366] text-white';
    case 'telegram':
      return 'bg-[#26A5E4] text-white';
    case 'vk':
      return 'bg-[#0077FF] text-white';
    case 'max':
      return 'bg-gradient-to-br from-[#FF6B35] to-[#FF3366] text-white';
    default:
      return 'bg-foreground text-background';
  }
};

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: messengerLinks, isLoading } = useQuery({
    queryKey: ["settings", "messenger_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "messenger_links")
        .maybeSingle();
      
      if (error) throw error;
      if (data?.value && typeof data.value === 'object' && 'channels' in data.value) {
        return data.value as unknown as MessengerLinks;
      }
      return { channels: defaultChannels };
    },
  });

  const channels = messengerLinks?.channels?.filter(c => c.enabled) || defaultChannels.filter(c => c.enabled);

  const iconButtonClass = "h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded options */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {channels.map((channel, index) => (
          <a
            key={`${channel.type}-${index}`}
            href={getChannelUrl(channel.type, channel.value)}
            target={channel.type === 'phone' ? undefined : "_blank"}
            rel={channel.type === 'phone' ? undefined : "noopener noreferrer"}
            className="group flex items-center gap-3"
          >
            <span className="bg-card text-foreground text-sm font-medium px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {channel.label}
            </span>
            <div className={`${iconButtonClass} ${getChannelColor(channel.type)}`}>
              {getChannelIcon(channel.type)}
            </div>
          </a>
        ))}
      </div>

      {/* Main button */}
      <div className="relative">
        {!isOpen && (
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-foreground text-sm font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap animate-fade-in">
            Свяжитесь с нами!
          </span>
        )}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 p-0 ${
            isOpen
              ? "bg-muted text-foreground hover:bg-muted/80 border-2 border-tiffany"
              : "bg-tiffany hover:bg-tiffany-dark animate-pulse-ring"
          }`}
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <img src={balloonIcon} alt="Связаться" className="h-8 w-8 object-contain" />
          )}
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ExternalLink, Calendar } from "lucide-react";
import { api } from "@/lib/api";

interface NewsItem {
  title: string;
  url?: string;
  keywords: string[];
  summary?: string;
}

interface NewsBoxProps {
  topic: string;
  keywords?: string[];
}

const NewsBox = ({ topic, keywords }: NewsBoxProps) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const news = await api.getNews(topic, keywords);
        setNewsItems(news);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [topic, keywords]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Latest Technical News
        </h3>
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading news...</p>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Latest Technical News
        </h3>
        <p className="text-sm text-muted-foreground">No news available for this topic.</p>
      </div>
    );
  }

  // Check if URL is a placeholder/example URL
  const isPlaceholderUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('example.com') || url.includes('placeholder') || url.includes('demo');
  };

  // Check if URL is valid and clickable
  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Latest Technical News
      </h3>
      <div className="space-y-3">
        {newsItems.map((item, index) => {
          const hasValidUrl = isValidUrl(item.url) && !isPlaceholderUrl(item.url);
          const isClickable = hasValidUrl;
          
          return (
            <div
              key={index}
              className={`bg-accent/50 rounded-xl p-4 transition-colors group ${
                isClickable 
                  ? 'hover:bg-accent/70 cursor-pointer' 
                  : 'cursor-default'
              }`}
              onClick={() => {
                if (isClickable && item.url) {
                  window.open(item.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`font-semibold text-sm text-foreground line-clamp-2 ${
                  isClickable ? 'group-hover:text-primary transition-colors' : ''
                }`}>
                  {item.title}
                </h4>
                {hasValidUrl && (
                  <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                )}
              </div>
              {item.summary && (
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {item.summary}
                </p>
              )}
              {item.keywords && item.keywords.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {item.keywords.slice(0, 2).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              {isPlaceholderUrl(item.url) && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  This is example content. No external link available.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsBox;

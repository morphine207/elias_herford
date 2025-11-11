// API client for backend communication

// Use proxy in development, or env variable in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000');

interface CourseData {
  id: number;
  title: string;
  slides: Array<{
    id: number;
    topic: string;
    content: string;
    image?: string;
    audio?: string;
    keywords?: string[];
  }>;
  quiz?: Array<{
    question: string;
    options: string[];
    answer: number;
  }>;
}

interface NewsItem {
  title: string;
  url?: string;
  keywords: string[];
  summary?: string;
}

interface FeedbackData {
  slide_id: number;
  rating: string;
  comment?: string;
  course_id?: number;
}

// Transform backend slide data to frontend format
function transformSlide(slide: CourseData['slides'][0]) {
  // Use first keyword for topic, or fallback to topic name normalized
  const topicKeyword = slide.keywords && slide.keywords.length > 0 
    ? slide.keywords[0] 
    : slide.topic.toLowerCase().replace(/\s+/g, '-');
  
  // Handle image/audio URLs - if they start with /static, use proxy in dev or full URL in prod
  const getAssetUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    // In dev mode with proxy, paths starting with /static will be proxied
    // In production, we need the full URL
    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  };
  
  return {
    id: slide.id,
    type: 'content' as const,
    title: slide.topic, // Backend uses "topic" as the title
    topic: topicKeyword, // Use first keyword for news fetching (backward compatibility)
    content: slide.content,
    image: getAssetUrl(slide.image),
    audio: getAssetUrl(slide.audio),
    keywords: slide.keywords || [], // Preserve keywords for better news matching
  };
}

// Transform backend course data to frontend format
function transformCourseData(data: CourseData) {
  return {
    id: String(data.id),
    title: data.title,
    slides: data.slides.map(transformSlide),
  };
}

// API functions
export const api = {
  // Get course data by ID
  async getCourse(courseId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/course/${courseId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.statusText}`);
      }
      const data: CourseData = await response.json();
      return transformCourseData(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Get news by topic and/or keywords
  async getNews(topic: string, keywords?: string[]): Promise<NewsItem[]> {
    try {
      // Prefer keywords if available, otherwise use topic
      let url = `${API_BASE_URL}/api/news`;
      if (keywords && keywords.length > 0) {
        const keywordsParam = keywords.join(',');
        url += `?keywords=${encodeURIComponent(keywordsParam)}`;
      } else {
        url += `?topic=${encodeURIComponent(topic)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      const data: NewsItem[] = await response.json();
      // Filter out any error items or invalid entries
      return data.filter(item => item && item.title && !('error' in item));
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return empty array on error to prevent UI breakage
      return [];
    }
  },

  // Submit feedback
  async submitFeedback(feedback: FeedbackData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });
      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
};


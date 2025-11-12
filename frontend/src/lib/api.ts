// API client for backend communication

// Use proxy in development, or env variable in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000');

interface CourseMedia {
  audio?: string;
  video?: string;
}

interface CourseSummarySection {
  title?: string;
  highlights?: string[];
  media?: string;
  script?: string;
}

interface CourseSummary {
  overview: string[];
  text: CourseSummarySection;
  visual: CourseSummarySection;
  audio: CourseSummarySection;
}

interface CourseSlide {
  id: number;
  title: string;
  topic: string;
  content: string;
  bulletPoints?: string[];
  image?: string;
  audio?: string;
  video?: string;
  keywords?: string[];
}

interface CourseQuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface CourseData {
  id: number;
  title: string;
  media?: CourseMedia;
  summary?: CourseSummary;
  slides: CourseSlide[];
  quiz?: CourseQuizQuestion[];
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
function transformSlide(slide: CourseSlide) {
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
    title: slide.title || slide.topic,
    topic: topicKeyword, // Use first keyword for news fetching (backward compatibility)
    content: slide.content,
    image: getAssetUrl(slide.image),
    audio: getAssetUrl(slide.audio),
    video: getAssetUrl(slide.video),
    bulletPoints: slide.bulletPoints || [],
    keywords: slide.keywords || [], // Preserve keywords for better news matching
  };
}

// Transform backend course data to frontend format
function transformCourseData(data: CourseData) {
  const resolveMedia = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  };

  const resolvedMedia: CourseMedia | undefined = data.media
    ? {
        audio: resolveMedia(data.media.audio),
        video: resolveMedia(data.media.video),
      }
    : undefined;

  const resolvedSummary: CourseSummary | undefined = data.summary
    ? {
        overview: data.summary.overview,
        text: {
          ...data.summary.text,
          media: resolveMedia(data.summary.text.media),
        },
        visual: {
          ...data.summary.visual,
          media: resolveMedia(data.summary.visual.media),
        },
        audio: {
          ...data.summary.audio,
          media: resolveMedia(data.summary.audio.media),
        },
      }
    : undefined;

  return {
    id: String(data.id),
    title: data.title,
    media: resolvedMedia,
    summary: resolvedSummary,
    slides: data.slides.map(transformSlide),
    quiz: data.quiz,
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


class ApiService {
  private static instance: ApiService;
  private constructor() {}

  public static getInstance() {
    if (!ApiService.instance) {
      return new ApiService();
    }
    return ApiService.instance;
  }

  async getRandomPost(subreddit='', listing='', period='') {
    const params = `subreddit=${subreddit}&listing=${listing}&period=${period}`;
    return await fetch('/api/posts/random?' + params).then(res => res.json());
  }

  async getPost(permalink: string) {
    return await fetch('/api/posts?permalink=' + permalink).then(res => res.json());
  }
}

export default ApiService;
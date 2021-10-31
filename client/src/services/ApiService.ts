class ApiService {
  private static instance: ApiService;
  private constructor() {}

  public static getInstance() {
    if (!ApiService.instance) {
      return new ApiService();
    }
    return ApiService.instance;
  }

  private static port = 3210;
  private static baseUrl = `http://localhost:${this.port}`;

  async getRandomPost(subreddit='', listing='', period='') {
    const params = `subreddit=${subreddit}&listing=${listing}&period=${period}`;
    return await fetch(ApiService.baseUrl + '/posts/random?' + params).then(res => res.json());
  }

  async getPost(permalink: string) {
    return await fetch(ApiService.baseUrl + '/posts?permalink=' + permalink).then(res => res.json());
  }
}

export default ApiService;
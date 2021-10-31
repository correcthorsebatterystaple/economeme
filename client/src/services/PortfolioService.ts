import ApiService from "./ApiService";

class PortfolioService {
  private static instance: PortfolioService;
  private constructor(private apiService: ApiService) {}

  public static getInstance(apiService: ApiService) {
    if (!PortfolioService.instance) {
      console.log('Created new PortfolioService');
      return new PortfolioService(apiService);
    }
    return PortfolioService.instance;
  }

  public portfolio: any[] = [];
  public balance = 1000;

  buy(post: { buyPrice: number; }) {
    if (this.balance >= post.buyPrice) {
      this.portfolio = [post, ...this.portfolio];
      this.balance -= post.buyPrice;
      return true;
    }
    return false;
  }

  sell(post: any) {
    const i = this.findPostIndex(post);
    if (i !== -1) {
      this.balance += this.portfolio[i].price;
      this.portfolio = [...this.portfolio.slice(0, i), ...this.portfolio.slice(i+1)];
    }
  }

  async refresh() {
    this.portfolio = await Promise.all(this.portfolio.map(async p => {
      const newPrice = await this.apiService.getPost(p.permalink);
      return {
        ...p,
        price: newPrice.price,
      };
    }));
  }

  has(post: any) {
    return this.findPostIndex(post) !== -1;
  }

  private findPostIndex(post: any) {
    return this.portfolio.findIndex(p => p.permalink === post.permalink)
  }
}

export default PortfolioService;